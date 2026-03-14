# Demo Guide — Chubb Offsite Presentation

## Setup Before the Demo (15 mins before)

1. **Start the app:** `npm run dev` (or open deployed Vercel URL)
2. **Open 4 browser tabs:**
   - Tab 1: Landing page (`/`)
   - Tab 2: Triage Dashboard (`/triage`)
   - Tab 3: Human Queue (`/queue`)
   - Tab 4: Metrics (`/metrics`)
3. **Pre-seeded conversations** will appear immediately on the Triage Dashboard — no setup needed.
4. Test the API key is working: open `/chat`, send "My window broke in the storm", verify Grace responds.

---

## Suggested Demo Flow (20 minutes)

### 1. Landing Page (2 mins)

Open `/` and walk through:
- "5 AI agents, each with a distinct personality and trigger pattern"
- Point out the routing flow diagram at the bottom
- "The Triage Agent is the invisible brain — customers never see it"

### 2. Triage Dashboard (3 mins)

Open `/triage`:
- Show the 4 pre-seeded live conversations
- Click Mrs. Chan's card → show routing history panel on right
  - "96% confidence, triggers: elderly, alone, distressed, flooding"
  - "This routing decision happened in milliseconds"
- Click David Lee's card → show Swift routing + numbered action list
- Point out the priority badges (HIGH vs MEDIUM)
- "This is what a supervisor sees in real time"

### 3. Live Customer Chat Demo (5 mins)

Open `/chat` in a new tab:
- Select "English", name: "Live Demo"
- Type: **"My roof has been damaged in the typhoon, I need help urgently"**
  - Watch → routes to Swift, gets numbered action list response
- Type: **"I want to speak with a real person"**
  - Watch → instant hard override, routes to Human Queue
- Switch to `/queue` tab → "Live Demo" appears in queue!

### 4. Scenario Simulator (5 mins)

Open `/simulator`:
- **Fire "Mrs. Chan — Flooded Flat"** first
  - "Watch it inject messages in real time — 78-year-old, alone, scared, Cantonese"
  - Switch to Triage Dashboard tab — watch it appear and route to Grace
- **Fire "Furious Customer — Third Call"**
  - "Anger → Phoenix → legal threat → mandatory human escalation, all automatic"
  - Show the routing history on the Dashboard: two routing decisions in sequence
- "You can run all 6 simultaneously if you want to stress-test it"

### 5. Human Queue Operator View (3 mins)

Open `/queue`:
- Show Richard Tam waiting (from the Furious Customer scenario)
- Click "Pick Up" → "Now I'm the operator. I can see the full conversation history."
- Type a message: "Hi Mr. Tam, I'm Sarah, a senior case manager. I've escalated your file..."
- Show it appears in the conversation
- Click "Mark Resolved"
- "The conversation disappears from the queue and metrics update"

### 6. Metrics Dashboard (2 mins)

Open `/metrics`:
- Walk through top KPIs
- Show the AI vs Human donut chart: "85%+ AI containment — this is the efficiency story"
- Show Agent Utilization bars: "You can see which agents are busiest in real time"
- "Every metric here is calculated live from the actual conversation data"

---

## Key Talking Points

**On AI safety:**
> "Every agent discloses it's AI on the first message. Customers always have the option to speak with a human. Legal threats trigger mandatory escalation — no AI is ever left to handle a lawsuit situation."

**On routing intelligence:**
> "The Triage Agent doesn't just match keywords. It reads the full emotional context of the conversation. 'My mum's house is flooded' routes to Grace, not just 'flooding' which might go to Swift."

**On bilingual support:**
> "Grace automatically responds in Cantonese if the customer writes in Chinese. No separate configuration — the model detects it and responds accordingly."

**On scalability:**
> "This prototype uses an in-memory store. Production would swap in Redis or Postgres — the rest of the architecture stays identical. The agent system is completely decoupled from storage."

**On the human queue:**
> "The AI never tries to handle things it shouldn't. Three unresolved turns? Auto-escalate. Legal threat? Hard override, no debate. This is the 'AI knows its limits' story."

---

## Handling Questions

**Q: How fast is the routing?**
A: Routing decision is typically 1–3 seconds (Anthropic API call). The customer sees the agent typing immediately after.

**Q: What if the API is down?**
A: There's a rule-based fallback — the system degrades gracefully to keyword matching rather than crashing.

**Q: Can you change the agent personalities?**
A: Yes — each agent has a system prompt in `src/lib/agents/[name].ts`. Change the prompt, redeploy.

**Q: Does this store customer data?**
A: In this prototype, everything is in-memory and resets on server restart. Production would need a compliant data store with appropriate retention policies.

**Q: What's the cost per conversation?**
A: Approximately HKD 0.05–0.20 per conversation depending on length, using claude-sonnet-4-20250514 pricing.
