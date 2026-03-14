# Claims Triage AI — CLAUDE.md

## What This Project Is

A Next.js 14 multi-agent AI prototype for Chubb Insurance HK typhoon claims triage. Five AI agents (powered by Anthropic Claude) handle different customer archetypes, with a Triage Agent routing each conversation to the right specialist. Designed for the Chubb offsite demo.

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 3. Run dev server
npm run dev
# Opens at http://localhost:3000
```

## Agent Personalities & Routing Rules

### Triage Agent (not customer-facing)
- Analyzes every customer message
- Outputs JSON routing decision: agent, reasoning, confidence, triggers
- Hard-coded overrides run FIRST (emergency, legal keywords, human request)

### Grace (💙 Blue #3B82F6)
- **Triggers:** distressed, elderly, scared, injured, "don't know what to do"
- **Style:** Warm, patient, bilingual (EN/中文), never rushes
- **First message:** AI disclosure + "please take your time" in both languages

### Swift (⚡ Amber #F59E0B)
- **Triggers:** urgent property/vehicle damage, "need someone now", fast action wanted
- **Style:** Decisive, numbered action lists, maximum 4 sentences
- **First message:** AI disclosure + "Let's get your claim moving fast"

### Kara (📚 Green #10B981)
- **Triggers:** policy questions, "what is my excess", "how do I claim", FAQ queries
- **Style:** Friendly, thorough, jargon-free, always caveats with "subject to policy review"
- **First message:** AI disclosure + open question prompt

### Phoenix (🔥 Red #EF4444)
- **Triggers:** anger, "unacceptable", "lawyer", "sue", "third time calling", complex
- **Style:** Calm, authoritative, acknowledges BEFORE explaining, never defensive
- **First message:** AI disclosure + "I'm listening, tell me everything"

### Human Queue (👤 Purple #8B5CF6)
- **Triggers:** explicit human request, legal threat (hard override), 3+ unresolved turns
- Conversation transferred to operator via /queue page

## Hard-Coded Routing Overrides (run before LLM)

In `src/lib/triage/router.ts`:
1. **Emergency keywords** (fire, gas, 999, explosion) → Grace + human notify
2. **Legal keywords** (lawyer, sue, legal action) → Phoenix immediately
3. **Human request** (real person, human, 真人) → Human queue immediately
4. **Turn limit** (agentTurns[currentAgent] >= 3) → Human queue

## Adding New Scenarios

Edit `src/lib/knowledge/scenarios.ts`:

```typescript
{
  id: 'my-scenario',
  name: 'Display Name',
  description: 'Brief description',
  expectedAgent: 'grace', // or swift/kara/phoenix/human
  customerName: 'Customer Name',
  language: 'en', // or 'zh'
  messages: [
    { delayMs: 0, content: 'First message' },
    { delayMs: 4000, content: 'Second message after 4s' },
  ],
}
```

## Adding New Agent Prompts

1. Create `src/lib/agents/newagent.ts` with exported `NEWAGENT_SYSTEM` string
2. Add to `SYSTEM_PROMPTS` in `src/lib/agents/index.ts`
3. Add to `AgentId` type in `src/lib/types.ts`
4. Add routing rule in `src/lib/triage/router.ts`
5. Add color/emoji config in `AGENT_CONFIG` in `src/lib/types.ts`

## Deploying to Vercel

```bash
npx vercel --yes
```

Then in Vercel Dashboard → Project → Settings → Environment Variables:
- Add `ANTHROPIC_API_KEY` = your key
- Redeploy

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | All TypeScript types + AGENT_CONFIG |
| `src/lib/store.ts` | In-memory store + pre-seeded demo conversations |
| `src/lib/agents/triage-agent.ts` | LLM triage routing logic |
| `src/lib/triage/router.ts` | Full routing logic with hard overrides |
| `src/app/api/chat/route.ts` | Main chat API — routes + streams agent response |
| `src/app/api/stream/route.ts` | SSE endpoint for real-time updates |

## Architecture Notes

- **No database** — everything in-memory. Resets on server restart (intended for demo)
- **SSE** uses Edge runtime (`export const runtime = 'edge'`)
- **Chat API** uses Node runtime (needed for streaming from Anthropic SDK)
- **Pre-seeded store** gives demo 4 live conversations immediately
- **GL8 compliance** — every agent identifies as AI on first message

## Hardware Integration

### Overview

The app supports two execution modes, switched by the `AGENT_MODE` environment variable:

| Mode | Value | Description |
|------|-------|-------------|
| Simulation | `simulation` (default) | All 5 agents run as in-process API routes on the laptop |
| Hardware | `hardware` | Each agent runs on a dedicated Sipeed LicheeRV Nano W board via HTTP |

### Target Hardware (arriving 19–27 March 2026)

5× Sipeed LicheeRV Nano W boards — one per agent:

| Board | Agent | IP | Port |
|-------|-------|----|------|
| Board 1 | Grace 💙 | 192.168.1.51 | 8001 |
| Board 2 | Swift ⚡ | 192.168.1.52 | 8002 |
| Board 3 | Kara 📚 | 192.168.1.53 | 8003 |
| Board 4 | Phoenix 🔥 | 192.168.1.54 | 8004 |
| Board 5 | Triage 🎯 | 192.168.1.55 | 8005 |

Each board: SOPHGO SG2002, 1 GHz RISC-V C906, 256 MB DDR3, WiFi 6, ~1–2 W USB-C powered. ~$20 each.

### How It Works

Each board runs **PicoClaw** (`github.com/sipeed/picoclaw`) — a Go binary that wraps the Anthropic Claude API as an HTTP gateway. The board's `~/.picoclaw/config.yaml` contains the agent's system prompt, API key, and port.

When `AGENT_MODE=hardware`, the dashboard's `/api/chat` route POSTs messages to the board URL instead of calling the local agent function. Everything else (routing, store, SSE, metrics, UI) is unchanged.

### Switching Modes

In `.env.local`:
```bash
# Simulation (default — no boards needed)
AGENT_MODE=simulation

# Hardware (boards must be online)
AGENT_MODE=hardware
GRACE_URL=http://192.168.1.51:8001
SWIFT_URL=http://192.168.1.52:8002
KARA_URL=http://192.168.1.53:8003
PHOENIX_URL=http://192.168.1.54:8004
TRIAGE_URL=http://192.168.1.55:8005
```

### Migration Day

See `docs/Hardware-Integration-Checklist.md` for the step-by-step migration checklist.
See `docs/Hardware-Architecture.md` for full architecture documentation.
See `src/app/hardware/page.tsx` for the hardware status dashboard (`/hardware`).
