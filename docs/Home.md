# Claims Triage AI — Overview

A Next.js 14 multi-agent AI prototype for Chubb Insurance HK typhoon claims triage. Five AI specialists powered by Anthropic Claude (claude-sonnet-4-20250514) handle different customer archetypes, with an intelligent Triage Agent routing conversations in real time.

## Live Views

| View | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Navigation hub and agent roster |
| Customer Chat | `/chat` | Start a claim conversation |
| Triage Dashboard | `/triage` | Live all-conversations view for supervisors |
| Human Queue | `/queue` | Operator pickup for escalated conversations |
| Scenario Simulator | `/simulator` | Fire pre-built scenarios for demos |
| Metrics Dashboard | `/metrics` | KPIs, SLA adherence, agent utilization |

## What This Demonstrates

- **Intelligent AI routing** — Triage Agent analyzes each customer message and routes to the optimal specialist
- **Multi-agent handoffs** — Seamless transfers between agents with explanatory messages
- **Real-time updates** — SSE (Server-Sent Events) stream all changes to all connected clients simultaneously
- **Bilingual support** — Grace responds in the customer's language (English or Cantonese)
- **GL8 AI compliance** — Every agent identifies as AI on first message
- **Human escalation** — Hard overrides ensure legal threats and safety emergencies reach humans immediately
- **Pre-seeded demo data** — 4 live in-progress conversations visible immediately on load

## Tech Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (dark navy, professional insurance aesthetic)
- Anthropic SDK (`@anthropic-ai/sdk`) with streaming
- Server-Sent Events for real-time updates
- In-memory store (no database — intentional for prototype)

## Quick Start

```bash
git clone https://github.com/twick1234/Claims-Triage-AI-Assistants.git
cd Claims-Triage-AI-Assistants
cp .env.local.example .env.local
# Add ANTHROPIC_API_KEY to .env.local
npm install
npm run dev
```

See [Architecture](./Architecture.md) | [Agents](./Agents.md) | [Demo Guide](./Demo-Guide.md)
