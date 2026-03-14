# Claims Triage AI

> Multi-agent AI system for Chubb HK typhoon insurance claims triage. Built with Next.js 14 + Anthropic Claude.

**Live demo:** https://claims-triage-ai-assistants.vercel.app
**Presentation:** https://claims-triage-ai-assistants.vercel.app/presentation.html

> **No laptop required for the prototype.** The app runs entirely on Vercel — agents call the Anthropic Claude API directly from the cloud. Open the URL on any device, anywhere.
>
> **Hardware is the next step.** 1 Sipeed LicheeRV Nano W board is arriving March 2026. Grace will be the first agent deployed on hardware. Once validated, additional boards will be ordered one at a time — one per agent — until the full 5-board cluster is running.

A prototype demonstrating intelligent, real-time claims routing for Hong Kong typhoon season. Five AI specialists handle different customer archetypes, with an invisible Triage Agent routing each conversation based on sentiment, urgency, and keywords.

## Agents

| Agent | Trigger | Style |
|-------|---------|-------|
| Grace 💙 | Distressed, elderly, scared, injured | Warm, patient, bilingual EN/中文 |
| Swift ⚡ | Urgent property/vehicle damage | Decisive, numbered action lists |
| Kara 📚 | Policy questions, FAQ | Friendly, jargon-free |
| Phoenix 🔥 | Angry, legal threats, complex | Calm, authoritative, de-escalating |
| Human 👤 | Explicit request, legal threat, 3+ unresolved turns | Operator takeover |

## Features

- Real-time conversation routing via Anthropic `claude-sonnet-4-20250514`
- SSE (Server-Sent Events) for live dashboard updates across all clients
- 4 pre-seeded demo conversations (visible immediately on load)
- 6 pre-built scenarios for simulator demos
- Bilingual support (English + Cantonese)
- GL8 AI disclosure compliance
- Hard-coded safety overrides (emergency, legal, human request)
- Human queue with operator pickup UI

## Quick Start

```bash
git clone https://github.com/twick1234/Claims-Triage-AI-Assistants.git
cd Claims-Triage-AI-Assistants
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Page | Path | Purpose |
|------|------|---------|
| Landing | `/` | Navigation + agent roster |
| Customer Chat | `/chat` | Customer-facing claim conversation |
| Triage Dashboard | `/triage` | Live supervisor view of all conversations |
| Human Queue | `/queue` | Operator pickup for escalated cases |
| Scenario Simulator | `/simulator` | Fire pre-built demo scenarios |
| Metrics | `/metrics` | KPIs, SLA adherence, agent utilization |
| Hardware | `/hardware` | Board-per-agent architecture view |
| Security | `/security` | SAST results and security posture |
| Presentation | `/presentation.html` | 14-slide offsite presentation |

## Deployment

### Vercel (recommended)

1. Push to GitHub (already done)
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key from console.anthropic.com |

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic SDK (`claude-sonnet-4-20250514`)
- **Real-time:** Server-Sent Events
- **Storage:** In-memory (no database — intentional for prototype)

## Documentation

- [Architecture](./docs/Architecture.md)
- [Agent Profiles](./docs/Agents.md)
- [Demo Scenarios](./docs/Scenarios.md)
- [Metrics & SLA](./docs/Metrics.md)
- [Demo Guide](./docs/Demo-Guide.md)
- [CLAUDE.md](./CLAUDE.md) — developer guide

## Note on Wiki

The GitHub Wiki for this repository requires initialization via the GitHub web interface. Once initialized, wiki content from the `docs/` folder can be migrated there. Visit: `https://github.com/twick1234/Claims-Triage-AI-Assistants/wiki/_new` to create the first page.
