# Hardware Architecture — Claims Triage AI

## From Laptop Simulation to Physical Agent Boards

**Status:** Board 1 on order — arriving 19–27 March 2026
**Goal:** 5× Sipeed LicheeRV Nano W boards, one per agent
**Approach:** Validate with Board 1 (Grace) first. Add boards one at a time as concept is proven.

## Phased Rollout

| Phase | Boards | Agents on Hardware | Agents in Simulation | Status |
|-------|--------|-------------------|----------------------|--------|
| Phase 0 | 0 | None | All 5 | ✅ Now — fully working |
| Phase 1 | 1 | Grace 💙 | Swift, Kara, Phoenix, Triage | 🔜 Board arrives Mar 2026 |
| Phase 2 | 2 | Grace 💙, Swift ⚡ | Kara, Phoenix, Triage | Pending validation |
| Phase 3 | 3 | Grace 💙, Swift ⚡, Kara 📚 | Phoenix, Triage | Pending |
| Phase 4 | 4 | Grace 💙, Swift ⚡, Kara 📚, Phoenix 🔥 | Triage | Pending |
| Phase 5 | 5 | All agents | None | Full hardware cluster |

The app supports **mixed mode** — some agents on hardware, others in simulation simultaneously. The dashboard looks and behaves identically in all phases.

---

## Section 1: Vision — From Simulation to Hardware

```
SIMULATION (NOW — Laptop)           HARDWARE TARGET (Post March 2026)
─────────────────────────           ──────────────────────────────────────
┌─────────────────────────┐         ┌──────────┐  ┌──────────┐  ┌──────────┐
│   MacBook/Laptop        │         │ Board #1 │  │ Board #2 │  │ Board #3 │
│   Next.js App           │         │ Grace 💙  │  │ Swift ⚡  │  │ Kara 📚  │
│                         │         │ PicoClaw │  │ PicoClaw │  │ PicoClaw │
│  [Grace] [Swift] [Kara] │         │ Port 8001│  │ Port 8002│  │ Port 8003│
│  [Phoenix] [Triage]     │    →    └──────────┘  └──────────┘  └──────────┘
│                         │                          ↕ WiFi 6
│  In-memory store        │         ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Claude API             │         │ Board #4 │  │ Board #5 │  │ Dashboard│
└─────────────────────────┘         │ Phoenix🔥│  │ Triage 🎯│  │ Server   │
                                    │ PicoClaw │  │ PicoClaw │  │ Next.js  │
                                    │ Port 8004│  │ Port 8005│  │ Port 3000│
                                    └──────────┘  └──────────┘  └──────────┘
```

In simulation mode, all five agents are Next.js API routes executing in a single Node.js process on the laptop. In hardware mode, each agent is a physical RISC-V board running PicoClaw as an HTTP gateway to the Claude API. The dashboard server (laptop) routes requests to the correct board IP over the local WiFi network.

---

## Section 2: Agent-to-Board Mapping

| Board | Agent | Role | Port | Power |
|-------|-------|------|------|-------|
| Board 1 | Grace 💙 | Empathy / Elderly / Distressed | 8001 | USB-C |
| Board 2 | Swift ⚡ | Fast-Track Claims | 8002 | USB-C |
| Board 3 | Kara 📚 | FAQ / Knowledge | 8003 | USB-C |
| Board 4 | Phoenix 🔥 | Escalation Handler | 8004 | USB-C |
| Board 5 | Triage 🎯 | Routing / Orchestration | 8005 | USB-C |
| Dashboard Server | — | Next.js + Dashboard UI | 3000 | Laptop |

**Total hardware cost:** ~$100 (5 boards × $20 each)

Static IP plan (assign in router DHCP reservation):

| Board | Agent | IP |
|-------|-------|----|
| Board 1 | Grace | 192.168.1.51 |
| Board 2 | Swift | 192.168.1.52 |
| Board 3 | Kara | 192.168.1.53 |
| Board 4 | Phoenix | 192.168.1.54 |
| Board 5 | Triage | 192.168.1.55 |

---

## Section 3: The Hardware — Sipeed LicheeRV Nano W

Each board runs one dedicated AI agent. Specifications:

| Spec | Value |
|------|-------|
| CPU | SOPHGO SG2002, 1 GHz RISC-V C906 |
| RAM | 256 MB DDR3 |
| OS | Buildroot Linux (RISC-V 64-bit) |
| Networking | WiFi 6 + Bluetooth 5.2 |
| Power | USB-C, ~1–2 W |
| Cost | ~$20 per board |
| Software | PicoClaw (Go binary, HTTP gateway to Claude API) |

PicoClaw source: [github.com/sipeed/picoclaw](https://github.com/sipeed/picoclaw)

---

## Section 4: How PicoClaw Works on Each Board

PicoClaw is a lightweight Go binary that wraps the Anthropic Claude API and exposes it as a local HTTP gateway (or Telegram bot). Each board runs one PicoClaw instance configured with:

1. **Agent personality** — a specific system prompt baked into `config.yaml`
2. **API key** — the Anthropic key used to call Claude
3. **Port** — the HTTP port this board listens on (8001–8005)

When the dashboard receives a customer message, it POSTs the message body to the correct board URL. PicoClaw constructs a Claude API call with the stored system prompt, streams the response, and returns it to the dashboard.

```
Dashboard Server          Board #1 (Grace — 192.168.1.51:8001)
─────────────────         ──────────────────────────────────────
POST /message         →   PicoClaw receives message
{ text: "I'm scared" }    Prepends Grace system prompt
                          Calls Anthropic Claude API
                      ←   Streams response back
```

The boards themselves hold no conversation history — state remains in the dashboard server's in-memory store, exactly as in simulation mode.

---

## Section 5: PicoClaw Config Per Agent

Each board's `~/.picoclaw/config.yaml` encodes the agent's full personality.

### Board 1 — Grace

```yaml
llm:
  provider: anthropic
  api_key: YOUR_ANTHROPIC_API_KEY
  model: claude-sonnet-4-20250514
  system_prompt: |
    You are Grace, a warm and deeply empathetic claims specialist for Chubb
    Insurance HK. You specialise in supporting distressed, elderly, or
    emotionally overwhelmed customers during typhoon claims. You speak both
    English and Traditional Chinese (繁體中文). You never rush. You always
    acknowledge feelings before asking for information. On your first message
    you disclose that you are an AI assistant.

gateway:
  mode: http
  port: 8001
  host: 0.0.0.0

heartbeat:
  enabled: true
  interval: 60s
```

### Board 2 — Swift

```yaml
llm:
  provider: anthropic
  api_key: YOUR_ANTHROPIC_API_KEY
  model: claude-sonnet-4-20250514
  system_prompt: |
    You are Swift, a decisive and action-oriented claims specialist for Chubb
    Insurance HK. You handle urgent property and vehicle damage claims with
    maximum efficiency. Responses are brief: numbered action lists, maximum
    4 sentences. You disclose your AI nature on the first message.

gateway:
  mode: http
  port: 8002
  host: 0.0.0.0

heartbeat:
  enabled: true
  interval: 60s
```

### Board 3 — Kara

```yaml
llm:
  provider: anthropic
  api_key: YOUR_ANTHROPIC_API_KEY
  model: claude-sonnet-4-20250514
  system_prompt: |
    You are Kara, a friendly and thorough knowledge specialist for Chubb
    Insurance HK. You handle policy questions, coverage queries, and FAQ.
    You explain insurance jargon clearly, always caveating with "subject to
    policy review". You disclose your AI nature on the first message.

gateway:
  mode: http
  port: 8003
  host: 0.0.0.0

heartbeat:
  enabled: true
  interval: 60s
```

### Board 4 — Phoenix

```yaml
llm:
  provider: anthropic
  api_key: YOUR_ANTHROPIC_API_KEY
  model: claude-sonnet-4-20250514
  system_prompt: |
    You are Phoenix, a calm and authoritative escalation specialist for Chubb
    Insurance HK. You handle angry customers, legal threats, and complex
    multi-party claims. You acknowledge before you explain — never defensive,
    never dismissive. You disclose your AI nature on the first message.

gateway:
  mode: http
  port: 8004
  host: 0.0.0.0

heartbeat:
  enabled: true
  interval: 60s
```

### Board 5 — Triage

```yaml
llm:
  provider: anthropic
  api_key: YOUR_ANTHROPIC_API_KEY
  model: claude-sonnet-4-20250514
  system_prompt: |
    You are the Triage Agent for Chubb Insurance HK. You analyse each
    customer message and output a JSON routing decision: which specialist
    agent should handle this conversation, why, and your confidence level.
    You are not customer-facing. Output only valid JSON.

gateway:
  mode: http
  port: 8005
  host: 0.0.0.0

heartbeat:
  enabled: true
  interval: 60s
```

---

## Section 6: Network Architecture

```
                          ┌──────────────────────────────┐
                          │   WiFi 6 Access Point /       │
                          │   Phone Hotspot               │
                          └──────────────┬───────────────┘
                                         │
          ┌──────────────┬───────────────┼───────────────┬──────────────┐
          │              │               │               │              │
  192.168.1.51   192.168.1.52   192.168.1.53   192.168.1.54   192.168.1.55
  Board 1         Board 2         Board 3         Board 4         Board 5
  Grace :8001     Swift :8002     Kara :8003      Phoenix :8004   Triage :8005
                                         │
                                 192.168.1.100
                                 Dashboard Server
                                 (Laptop :3000)
```

### mDNS Option (simpler for offsite)

If the router supports mDNS, each board can be addressed by hostname instead of IP:

| Board | mDNS hostname |
|-------|--------------|
| Board 1 | grace.local |
| Board 2 | swift.local |
| Board 3 | kara.local |
| Board 4 | phoenix.local |
| Board 5 | triage.local |

Dashboard env vars would then be:
```
GRACE_URL=http://grace.local:8001
SWIFT_URL=http://swift.local:8002
```

Static IPs via router DHCP reservation are more reliable for demo environments where a mobile hotspot is used.

---

## Section 7: Migration Path — How to Switch Simulation → Hardware

### Day-of migration steps

1. **Boards arrive** — unbox all 5 Sipeed LicheeRV Nano W boards
2. **Flash firmware** — flash each SD card with LicheeRV Nano Buildroot image
   ```bash
   # Using flash.sh (adapted from MarksPersonalAssistant setup)
   sudo ./flash.sh /dev/sdX lichee-nano-buildroot.img
   ```
3. **Assign static IPs** — in your router/hotspot, reserve 192.168.1.51–55 by MAC address
4. **SSH into each board**
   ```bash
   ssh root@192.168.1.51  # Board 1 — Grace
   ```
5. **Run setup-board.sh** on each board
   ```bash
   ./setup-board.sh grace 8001
   # Installs PicoClaw binary, creates config.yaml, enables systemd service
   ```
6. **Deploy agent config** — copy the agent-specific `config.yaml` to each board
   ```bash
   scp configs/grace-config.yaml root@192.168.1.51:~/.picoclaw/config.yaml
   ```
7. **Update dashboard .env**
   ```bash
   AGENT_MODE=hardware
   GRACE_URL=http://192.168.1.51:8001
   SWIFT_URL=http://192.168.1.52:8002
   KARA_URL=http://192.168.1.53:8003
   PHOENIX_URL=http://192.168.1.54:8004
   TRIAGE_URL=http://192.168.1.55:8005
   ```
8. **Restart dashboard** — `npm run build && npm start`
9. **Test each board**
   ```bash
   curl http://192.168.1.51:8001/health
   curl -X POST http://192.168.1.51:8001/message -d '{"text":"Hello"}'
   ```
10. **Fire a simulator scenario** — verify each board handles its routed messages

The routing logic, store, and dashboard UI are entirely unchanged between modes. Only the agent call layer switches.

---

## Section 8: API Compatibility Layer

The dashboard switches between simulation and hardware via a single environment variable `AGENT_MODE`.

### Simulation mode (current)

```typescript
// src/lib/agents/caller.ts
if (process.env.AGENT_MODE !== 'hardware') {
  return await callLocalAgent(agentId, conversation, message);
}
```

`callLocalAgent` imports the agent function directly and runs it in-process.

### Hardware mode

```typescript
const BOARD_URLS: Record<AgentId, string> = {
  grace:   process.env.GRACE_URL   ?? 'http://192.168.1.51:8001',
  swift:   process.env.SWIFT_URL   ?? 'http://192.168.1.52:8002',
  kara:    process.env.KARA_URL    ?? 'http://192.168.1.53:8003',
  phoenix: process.env.PHOENIX_URL ?? 'http://192.168.1.54:8004',
  triage:  process.env.TRIAGE_URL  ?? 'http://192.168.1.55:8005',
};

const res = await fetch(`${BOARD_URLS[agentId]}/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: message }),
});
return res.body; // stream
```

The dashboard's `/api/chat` route, routing logic, triage decisions, store updates, SSE stream, metrics, and all UI pages work identically in both modes. The only difference is where the Claude call originates: local function vs. board HTTP endpoint.

---

## Section 9: Demo Setup Guide (Hardware Mode)

### Physical setup for the offsite

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ GRACE   │  │ SWIFT   │  │ KARA    │  │ PHOENIX │  │ TRIAGE  │
│  💙     │  │  ⚡      │  │  📚     │  │  🔥     │  │  🎯     │
│ Board 1 │  │ Board 2 │  │ Board 3 │  │ Board 4 │  │ Board 5 │
│ .51:8001│  │ .52:8002│  │ .53:8003│  │ .54:8004│  │ .55:8005│
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     └────────────┴────────────┴────────────┴────────────┘
                            USB Hub (power)
                                  │
                          Phone Hotspot / WiFi
                                  │
                          Laptop (Dashboard :3000)
```

- 5 boards in a row on the table, each labelled with agent name + colored sticky dot
- Powered from a single USB hub or USB-C power bank (1–2 W per board)
- Connected to mobile hotspot or venue WiFi
- Laptop open, dashboard visible on screen or projected
- Management dashboard shows: "Grace 💙 (Board 1 — 192.168.1.51) — 3 active conversations"
- The Hardware Architecture page (`/hardware`) shows live board status with uptime and load

### Pre-demo checklist

```bash
# Verify all boards reachable
for ip in 51 52 53 54 55; do
  curl -s "http://192.168.1.$ip:800$((ip-50))/health" && echo "Board $((ip-50)) OK"
done

# Fire typhoon scenario from simulator
# → Watch physical boards handle routing in real time
```

---

## Section 10: Scalability Story

This is the key talking point for the offsite presentation.

### Cost comparison

| Option | Capital cost | Daily operating cost |
|--------|-------------|---------------------|
| 5-board cluster (current) | $100 | ~$5/day API costs |
| 10-board cluster (surge) | $200 | ~$10/day API costs |
| Human agent | $0 (existing) | $50–100/day per person |

### Scale-out model

- Adding an agent = buying one more board (~$20)
- During typhoon surge: spin up 10× Grace boards for empathy capacity
- Load balance across Grace boards at the dashboard layer (round-robin or least-busy)
- No cloud infrastructure required — runs on a phone hotspot
- Air-gap capable — if internet is down, boards run any locally-served model

### The pitch

> "Each of these boards costs $20 and draws less power than a phone charger. We can put five of them in a briefcase, plug them into a power bank, and have a five-agent AI claims triage system running anywhere in Hong Kong within minutes of a typhoon landfall — with no servers, no cloud dependencies, and no ongoing infrastructure cost beyond the API."

---

## Appendix: File Reference

| File | Purpose |
|------|---------|
| `docs/Hardware-Architecture.md` | This document |
| `docs/Hardware-Integration-Checklist.md` | Migration day checklist |
| `src/app/hardware/page.tsx` | Hardware status dashboard page |
| `.env.local.example` | Environment variables including board URLs |
| `CLAUDE.md` | Developer reference (hardware section added) |
