# Metrics & SLA Reference

## SLA Targets

| Metric | Target | Breach Threshold |
|--------|--------|-----------------|
| Bot initial response | < 3 seconds | > 5 seconds |
| Agent turn time (AI) | < 30 seconds | > 60 seconds |
| Human queue wait | < 2 minutes | > 2 minutes |
| Simple claim resolution | 5–7 business days | > 10 days |
| Complex claim resolution | 2–3 weeks | > 4 weeks |

## KPI Definitions

### Total Conversations
Count of all conversations in the in-memory store since server start (or last restart).

### Active Now
Conversations with status: `triaging`, `with-grace`, `with-swift`, `with-kara`, `with-phoenix`, or `human-active`.

### Avg Handle Time
Mean time from `metrics.startedAt` to `metrics.resolvedAt` for resolved conversations. Excludes active conversations.

### SLA Adherence Rate
% of conversations where `firstResponseAt - startedAt < 30 seconds`. Target: ≥ 90%.

### First Contact Resolution (FCR)
% of resolved conversations that never required human escalation. Target: ≥ 70%.

### Avg tNPS (Transactional Net Promoter Score)
Average post-conversation rating (0–10) where recorded. Target: ≥ 8.0.
Note: tNPS values are simulated for the prototype; real implementation would collect via post-chat survey.

### Agent Utilization
Per-agent: (conversations currently assigned to agent) / (total conversations). Shows relative load.

### AI vs Human Resolution
Donut chart: what % of all handled conversations were resolved by AI without human intervention. Target: > 80% AI containment.

### Queue Depth
Number of conversations with status `human-queue`. Target: < 3.

### Avg Wait Time (Human Queue)
Mean `waitTimeMs` for conversations in `human-queue` status. Target: < 120,000ms (2 minutes).

## Research Benchmarks

Based on industry standards for insurance contact centers (HK market, 2024):

- **AI containment rate:** Leading insurers achieve 65–85% for simple claims
- **Average handle time (AI):** 4–8 minutes for simple typhoon claims
- **Average handle time (human):** 12–18 minutes
- **Customer satisfaction with AI:** 7.2–8.4 tNPS for empathetic AI assistants
- **First contact resolution (AI):** 68–74% for FAQ-type queries

## Auto-Refresh

The Metrics page refreshes:
- On page load
- Every 30 seconds via `setInterval`
- On `metrics_tick` SSE events (broadcast every 30s from server)
- On `conversation_updated` SSE events
