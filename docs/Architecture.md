# Architecture

## System Overview

```
Customer Browser
       │
       ▼
  Next.js 14 App Router
       │
  ┌────┴────────────────────────────────┐
  │           API Layer                  │
  │  /api/chat     → Main chat route    │
  │  /api/stream   → SSE events         │
  │  /api/conversations → CRUD          │
  │  /api/queue    → Human queue        │
  │  /api/metrics  → KPI snapshot       │
  │  /api/simulator → Scenario runner   │
  └────┬────────────────────────────────┘
       │
  ┌────┴──────────────────────────────────┐
  │         Agent System                   │
  │                                        │
  │  Triage Agent (LLM, JSON output)       │
  │       ↓ routing decision               │
  │  ┌────────────────────────────────┐    │
  │  │  Grace  Swift  Kara  Phoenix   │    │
  │  │  (each: system prompt + LLM)   │    │
  │  └────────────────────────────────┘    │
  │       ↓ streaming response             │
  │  Human Queue (operator pickup)         │
  └────────────────────────────────────────┘
       │
  ┌────┴──────────────┐
  │  In-Memory Store  │
  │  conversations    │
  │  sseClients       │
  └───────────────────┘
```

## Data Flow

1. Customer sends message via `/api/chat`
2. Message saved to conversation in store
3. `routeConversation()` checks hard-coded overrides first:
   - Emergency keywords → Grace + human notify
   - Legal keywords → Phoenix immediately
   - Human request → Human queue
   - 3+ unresolved turns → Human queue
4. If no override, Triage Agent (LLM) analyzes full conversation text
5. Triage returns JSON with agent, reasoning, confidence, triggers
6. If agent changed, system transfer message injected
7. Target agent streams response via Anthropic SDK
8. Complete response saved to store
9. `broadcast()` emits `conversation_updated` SSE event to all clients
10. All connected browser tabs update in real time

## Runtime Architecture

| Route | Runtime | Reason |
|-------|---------|--------|
| `/api/stream` | Edge | SSE requires long-lived connection, Edge handles it cleanly |
| `/api/chat` | Node | Anthropic SDK streaming works best in Node runtime |
| `/api/conversations/*` | Node | Standard CRUD |
| `/api/metrics` | Node | computeMetrics() uses Node Map operations |

## Store Design

Single module-level singleton (`src/lib/store.ts`):

```typescript
export const store = {
  conversations: new Map<string, Conversation>(),
  sseClients: new Set<ReadableStreamDefaultController>(),
}
```

Pre-seeded at module load with 4 demo conversations. Resets on server restart (intentional for demo prototype).

## SSE Broadcasting

`broadcast(event, data)` encodes and pushes to every connected SSE client:

```
event: conversation_updated
data: { ...conversation object }
```

Events: `conversation_created`, `conversation_updated`, `routing_decision`, `queue_updated`, `metrics_tick`

## Agent Streaming

Each agent uses `anthropic.messages.stream()` which yields `content_block_delta` events. These are piped to a `ReadableStream` returned as `text/plain` chunked response. The chat page reads chunks and updates `streamingText` state to show typing indicator.
