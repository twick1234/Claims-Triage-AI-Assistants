import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a triage routing system for Chubb insurance HK typhoon claims.
Analyze the conversation and output ONLY valid JSON with this exact structure:
{
  "agent": "grace" | "swift" | "kara" | "phoenix" | "human",
  "reasoning": "brief explanation",
  "confidence": 0.0 to 1.0,
  "triggers": ["list", "of", "detected", "signals"]
}

Routing rules:
- grace: distress, fear, injury, elderly mentioned ("my mum", "grandmother"), crying, "scared", "hurt", "don't know what to do", needs emotional support
- swift: urgent property damage, vehicle damage, "roof gone", "car crushed", "need someone now", wants fast action not conversation
- kara: policy questions, "what does my policy cover", "how do I claim", "what is my excess", "how long", FAQ-type questions
- phoenix: anger, "this is unacceptable", "lawyer", "sue", "ridiculous", "third time calling", complex multi-situation
- human: explicit request ("speak to a person", "real person", "human", "真人"), safety emergency (fire/gas/injury), after unresolved complex situation

Output ONLY the JSON object, nothing else.`;

export interface TriageResult {
  agent: 'grace' | 'swift' | 'kara' | 'phoenix' | 'human';
  reasoning: string;
  confidence: number;
  triggers: string[];
}

export async function runTriageAgent(conversationText: string): Promise<TriageResult> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: conversationText }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as TriageResult;
  } catch (err) {
    console.error('Triage agent error:', err);
    // Fallback rule-based triage
    const lower = conversationText.toLowerCase();
    if (lower.includes('lawyer') || lower.includes('sue') || lower.includes('legal')) {
      return { agent: 'phoenix', reasoning: 'Legal keyword detected (fallback)', confidence: 0.9, triggers: ['legal'] };
    }
    if (lower.includes('human') || lower.includes('real person') || lower.includes('真人')) {
      return { agent: 'human', reasoning: 'Human request detected (fallback)', confidence: 1.0, triggers: ['human request'] };
    }
    if (lower.includes('scared') || lower.includes('hurt') || lower.includes('elderly') || lower.includes('grandmother')) {
      return { agent: 'grace', reasoning: 'Distress detected (fallback)', confidence: 0.8, triggers: ['distress'] };
    }
    if (lower.includes('urgent') || lower.includes('car') || lower.includes('roof') || lower.includes('crushed')) {
      return { agent: 'swift', reasoning: 'Urgency detected (fallback)', confidence: 0.8, triggers: ['urgent'] };
    }
    if (lower.includes('policy') || lower.includes('excess') || lower.includes('cover')) {
      return { agent: 'kara', reasoning: 'Policy question detected (fallback)', confidence: 0.8, triggers: ['policy question'] };
    }
    return { agent: 'grace', reasoning: 'Default routing (fallback)', confidence: 0.5, triggers: [] };
  }
}
