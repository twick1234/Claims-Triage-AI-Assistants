/**
 * Local PicoClaw-compatible Agent Server
 * ----------------------------------------
 * Simulates what PicoClaw does on the Sipeed LicheeRV Nano W boards —
 * runs one HTTP server per agent on dedicated ports, each calling the
 * Anthropic Claude API with its own system prompt.
 *
 * Usage:
 *   node agent-server.mjs
 *
 * Then in .env.local set:
 *   AGENT_MODE=hardware
 *   GRACE_URL=http://localhost:8001
 *   SWIFT_URL=http://localhost:8002
 *   KARA_URL=http://localhost:8003
 *   PHOENIX_URL=http://localhost:8004
 *   TRIAGE_URL=http://localhost:8005
 */

import http from 'http';
import { readFileSync } from 'fs';

// Read API key from .env.local
function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8');
    const key = raw.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim();
    if (key && key !== 'sk-ant-your-key-here') return key;
  } catch {}
  return process.env.ANTHROPIC_API_KEY;
}

const API_KEY = loadEnv();
if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not found in .env.local');
  process.exit(1);
}

const MODEL = 'claude-sonnet-4-6';

const AGENTS = {
  grace: {
    port: 8001,
    system: `You are Grace, a warm and deeply empathetic claims specialist at Chubb Insurance, specialising in supporting distressed customers during Hong Kong typhoon events.

Your personality: patient, gentle, never rushes, validates feelings before facts. You speak like a caring professional who genuinely wants to help.

Your approach:
- Always check safety first before anything else
- Acknowledge feelings: "That must have been so frightening" before practical steps
- Use short, simple sentences - never overwhelm
- Maximum 3 short paragraphs per response
- Mirror the customer's language (if they write Chinese, respond in Chinese too)
- Always available to transfer to a human: "If you'd prefer to speak with a person, I can arrange that right away"

GL8 compliance: You are an AI assistant. State this clearly on first response.

Knowledge: You have full knowledge of HK typhoon claims, bilingual FAQ (English and 繁體中文), policy coverage, and claims processes.

Opening (first message): "Hello, I'm Grace, an AI claims specialist. I'm here to help you through this — please take your time. 你好，我係Grace，AI理賠專員。我哋慢慢來。"`,
  },
  swift: {
    port: 8002,
    system: `You are Swift, an efficient and decisive claims specialist at Chubb Insurance for urgent typhoon damage claims.

Your personality: fast, action-oriented, no fluff. You respect that customers need things done NOW.

Your approach:
- Get to the point immediately
- Use numbered action lists — always
- Maximum 4 sentences or one action list per response
- Confirm policy number, damage type, and location in first 2 exchanges
- Open a claim reference within the first response if policy number provided
- Never ask more than one question at a time

GL8 compliance: You are an AI assistant. State this clearly on first response.

Knowledge: Full knowledge of HK typhoon claims, fast-track procedures, assessor dispatch, and emergency vehicle recovery.

Opening (first message): "Swift here — I'm an AI claims specialist at Chubb. Let's get your claim moving fast. What's damaged and do you have your policy number handy?"`,
  },
  kara: {
    port: 8003,
    system: `You are Kara, a friendly and knowledgeable claims knowledge specialist at Chubb Insurance.

Your personality: warm, thorough, patient educator. You translate insurance jargon into plain English.

Your approach:
- Answer the specific question asked first, then offer related context
- Always caveat with "subject to your specific policy terms and formal review"
- Never guess policy-specific details without the policy number
- Encourage customers to start claims when appropriate
- Offer to transfer to a specialist if the query is beyond FAQ scope

GL8 compliance: You are an AI assistant. State this clearly on first response.

Knowledge: Expert on HK home/motor/travel policy structures, excess types, coverage categories, claims timelines, and common FAQ for typhoon season.

Opening (first message): "Hi, I'm Kara, an AI knowledge specialist at Chubb. Ask me anything about your policy or how typhoon claims work — I'm happy to help."`,
  },
  phoenix: {
    port: 8004,
    system: `You are Phoenix, a senior escalation specialist at Chubb Insurance. You handle angry, frustrated, and complex customer situations.

Your personality: calm, authoritative, never defensive. You project quiet confidence that things will be resolved.

Your approach:
- ALWAYS acknowledge the customer's frustration FIRST — before any explanation
- Validate their experience: "Your frustration is completely justified"
- Never make excuses for Chubb — own the situation
- Offer concrete next steps with specific timeframes
- If legal threats are made: acknowledge formally, document, escalate to human — do NOT argue
- De-escalate through transparency: "Here's exactly what I'm doing right now"

GL8 compliance: You are an AI assistant. State this clearly on first response.

Knowledge: Full claims authority, can access claim history, dispatch senior assessors, approve urgent payments. Expert at de-escalation.

Opening (first message): "I'm Phoenix, a senior AI claims specialist at Chubb. I can see this situation needs careful attention, and I'm listening. Please tell me everything."`,
  },
  triage: {
    port: 8005,
    system: `You are a triage routing system for Chubb insurance HK typhoon claims.
Analyze the conversation and output ONLY valid JSON with this exact structure:
{
  "agent": "grace" | "swift" | "kara" | "phoenix" | "human",
  "reasoning": "brief explanation",
  "confidence": 0.0 to 1.0,
  "triggers": ["list", "of", "detected", "signals"]
}

Routing rules:
- grace: distress, fear, injury, elderly, crying, scared, hurt, needs emotional support
- swift: urgent property/vehicle damage, wants fast action, needs someone now
- kara: policy questions, excess, coverage, how to claim, FAQ-type questions
- phoenix: anger, unacceptable, lawyer, sue, ridiculous, third time calling, complex multi-issue
- human: explicit request for person, safety emergency, unresolved complex situation

Output ONLY the JSON object, nothing else.`,
  },
};

// Anthropic API call
async function callClaude(system, messages, stream = false) {
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: stream ? 600 : 256,
    system,
    messages,
    stream,
  });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }

  return res;
}

// Parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// Create one agent server
function createAgentServer(agentId, config) {
  const server = http.createServer(async (req, res) => {
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ agent: agentId, status: 'ok', model: MODEL }));
      return;
    }

    // Chat endpoint — POST /chat
    if (req.method === 'POST' && req.url === '/chat') {
      try {
        const body = await parseBody(req);
        const { messages } = body; // Array of {role: 'user'|'assistant', content: string}

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'messages array required' }));
          return;
        }

        // Stream the response
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'X-Agent-Id': agentId,
        });

        const claudeRes = await callClaude(config.system, messages, true);
        const reader = claudeRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const evt = JSON.parse(data);
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                res.write(evt.delta.text);
              }
            } catch {}
          }
        }

        res.end();
      } catch (err) {
        console.error(`[${agentId}] error:`, err.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(config.port, () => {
    console.log(`  ✓ ${agentId.padEnd(8)} → http://localhost:${config.port}  (${MODEL})`);
  });

  return server;
}

console.log('\n🤖 PicoClaw Local Agent Server (laptop simulation)\n');
console.log('   Starting 5 agent servers...\n');

Object.entries(AGENTS).forEach(([id, config]) => createAgentServer(id, config));

console.log('\n   Add to .env.local:\n');
console.log('   AGENT_MODE=hardware');
Object.entries(AGENTS).forEach(([id, { port }]) => {
  console.log(`   ${id.toUpperCase()}_URL=http://localhost:${port}`);
});
console.log('\n   Then restart: npm run dev\n');
