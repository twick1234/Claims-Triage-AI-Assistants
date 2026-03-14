import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">←</Link>
          <h1 className="text-lg font-bold text-white">Solution Architecture</h1>
          <span className="ml-auto text-xs text-gray-500">Claims Triage AI — Full Design</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── SECTION 1: Overview ── */}
        <section>
          <SectionLabel label="01" title="What This System Does" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card color="blue">
              <CardIcon>📨</CardIcon>
              <CardTitle>Customer sends a message</CardTitle>
              <CardBody>A customer affected by a HK typhoon contacts Chubb via the chat interface. They may be distressed, angry, confused, or just have a policy question.</CardBody>
            </Card>
            <Card color="amber">
              <CardIcon>🎯</CardIcon>
              <CardTitle>Triage Agent analyses it</CardTitle>
              <CardBody>An invisible AI triage agent reads the message, detects sentiment, urgency, and keywords, then decides which specialist agent should handle it — in under 3 seconds.</CardBody>
            </Card>
            <Card color="green">
              <CardIcon>✅</CardIcon>
              <CardTitle>Right agent responds</CardTitle>
              <CardBody>The matched specialist agent responds with its unique personality — warm and patient, fast and decisive, knowledgeable, or authoritative — or escalates to a human operator.</CardBody>
            </Card>
          </div>
          <div className="mt-6 p-5 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="text-white font-semibold">The core problem it solves:</span> During a Typhoon T8 or T10 signal, Chubb HK receives up to <span className="text-red-400 font-semibold">10× normal call volume</span>. Human teams cannot scale fast enough. Customers face long waits, high abandonment rates, and inconsistent service. This system provides instant, always-on, empathetic triage that handles the surge — and hands off to humans only when genuinely needed.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: System Flow ── */}
        <section>
          <SectionLabel label="02" title="End-to-End Message Flow" />
          <div className="mt-6 bg-gray-900 border border-gray-700 rounded-2xl p-8">

            {/* Flow row */}
            <div className="flex flex-col gap-0">

              <FlowStep
                step="1"
                color="gray"
                title="Customer sends message"
                detail="Via the chat interface at /chat. Message arrives as a POST to /api/chat with conversation history and session ID."
                code="POST /api/chat { message, conversationId }"
              />
              <FlowArrow />

              <FlowStep
                step="2"
                color="gray"
                title="Hard-coded safety overrides (pre-LLM)"
                detail="Before any AI is called, rule-based checks run instantly. These cannot be overridden by prompt injection or unusual phrasing."
                bullets={[
                  '"fire" / "gas leak" / "999" / "explosion" → CRITICAL priority + Grace + notify human queue',
                  '"lawyer" / "sue" / "legal action" → Phoenix immediately',
                  '"real person" / "human" / "真人" → Human queue immediately',
                  'Agent turn count ≥ 3 unresolved → Human queue',
                ]}
              />
              <FlowArrow />

              <FlowStep
                step="3"
                color="violet"
                title="Triage Agent — LLM routing decision"
                detail="If no hard override fired, the Triage Agent is called with the full conversation context. It outputs a structured JSON routing decision."
                code={`{
  "agent": "grace" | "swift" | "kara" | "phoenix" | "human",
  "reasoning": "Customer expressed fear and mentioned elderly parent",
  "confidence": 0.92,
  "triggers": ["distressed", "elderly_mentioned", "scared"]
}`}
              />
              <FlowArrow />

              <FlowStep
                step="4"
                color="blue"
                title="Agent transfer (if routing changed)"
                detail="If the triage decision differs from the current agent, a system message is injected: 'Transferring you to Grace...' This is visible in the triage dashboard and to the customer."
              />
              <FlowArrow />

              <FlowStep
                step="5"
                color="green"
                title="Specialist agent streams response"
                detail="The assigned agent is called with the full conversation and system prompt. Response streams back to the customer in real-time using Anthropic's streaming API."
                code="anthropic.messages.stream({ model, system, messages }) → ReadableStream"
              />
              <FlowArrow />

              <FlowStep
                step="6"
                color="amber"
                title="Store updated + SSE broadcast"
                detail="The conversation is updated in the in-memory store. An SSE event is broadcast to all connected dashboards (triage, queue, metrics) so they update instantly without polling."
                code={`broadcast("conversation_updated", { id, status, currentAgent, priority })`}
              />

            </div>
          </div>
        </section>

        {/* ── SECTION 3: The 5 Agents ── */}
        <section>
          <SectionLabel label="03" title="The Five Agents" />
          <p className="text-gray-400 text-sm mt-2 mb-6">Each agent has a distinct system prompt, personality, and routing trigger profile. The Triage Agent never speaks to the customer — the other four do.</p>

          <div className="space-y-4">
            <AgentRow
              emoji="🎯"
              name="Triage Agent"
              color="text-gray-400"
              border="border-gray-600"
              bg="bg-gray-800/30"
              role="Router — not customer-facing"
              triggers={["All incoming messages", "Runs on every customer turn"]}
              personality="Analytical, invisible. Outputs only JSON. Never generates customer-facing text. Runs before every agent response to check if routing should change."
              systemPromptSummary={`Analyse the conversation. Output ONLY JSON: { agent, reasoning, confidence, triggers }.
Rules: grace=distress/elderly/injured · swift=urgent property or vehicle · kara=policy questions/FAQ · phoenix=anger/legal · human=explicit request or emergency`}
              model="claude-sonnet-4-6"
            />

            <AgentRow
              emoji="💙"
              name="Grace"
              color="text-blue-400"
              border="border-blue-500/50"
              bg="bg-blue-900/10"
              role="Empathy Specialist"
              triggers={["Distressed", "Elderly customers", "Injured", "Scared", "\"my grandmother\"", "\"don't know what to do\""]}
              personality="Warm, patient, never rushes. Short sentences. Maximum 3 paragraphs. Always checks safety first. Validates feelings before facts. Bilingual — mirrors customer language (EN/中文)."
              systemPromptSummary={`You are Grace, a warm and deeply empathetic claims specialist. Always check safety first. Acknowledge feelings before facts. Use simple language. Never rush. Mirror the customer's language. GL8: identify as AI on first contact.`}
              model="claude-sonnet-4-6"
              phase="Phase 1 hardware board"
            />

            <AgentRow
              emoji="⚡"
              name="Swift"
              color="text-amber-400"
              border="border-amber-500/50"
              bg="bg-amber-900/10"
              role="Fast-Track Claims"
              triggers={["Urgent property damage", "Vehicle damage", "\"car crushed\"", "\"roof gone\"", "\"need someone NOW\"", "Action-seeking customers"]}
              personality="Efficient, decisive, action-oriented. Numbered lists for next steps. Maximum 4 sentences. Gathers claim-critical info fast: policy number, damage type, photos. Professional warmth without wasting time."
              systemPromptSummary={`You are Swift, a fast-track claims specialist. Get to the point. Use numbered lists. Gather policy number, damage type, photos quickly. Always end with a clear next step. GL8: identify as AI on first contact.`}
              model="claude-sonnet-4-6"
            />

            <AgentRow
              emoji="📚"
              name="Kara"
              color="text-emerald-400"
              border="border-emerald-500/50"
              bg="bg-emerald-900/10"
              role="Knowledge & FAQ Specialist"
              triggers={["Policy questions", "\"what is my excess\"", "\"how do I claim\"", "\"what does my policy cover\"", "\"how long will it take\""]}
              personality="Friendly, approachable, thorough. Translates jargon into plain English. Always caveats coverage answers with 'subject to policy review'. Offers to start a claim once question is answered. Bilingual."
              systemPromptSummary={`You are Kara, a knowledge specialist. Answer policy questions clearly. Use plain English. Never confirm coverage — always caveat with 'subject to policy review'. Offer to help start a claim. GL8: identify as AI on first contact.`}
              model="claude-sonnet-4-6"
            />

            <AgentRow
              emoji="🔥"
              name="Phoenix"
              color="text-red-400"
              border="border-red-500/50"
              bg="bg-red-900/10"
              role="Senior Escalation Handler"
              triggers={["Angry customers", "\"this is unacceptable\"", "\"lawyer\"", "\"sue\"", "\"third time calling\"", "Complex multi-policy", "Legal threats"]}
              personality="Calm under pressure. Authoritative without being dismissive. Acknowledges frustration fully before any explanation. Never defensive. When legal threats are made: acknowledge, document, offer human escalation — do not debate."
              systemPromptSummary={`You are Phoenix, a senior claims specialist. Acknowledge fully before explaining. Never argue. For legal threats: acknowledge, document, offer human escalation. Move from acknowledgment → validation → solution. GL8: identify as AI on first contact.`}
              model="claude-sonnet-4-6"
            />
          </div>
        </section>

        {/* ── SECTION 4: Tech Stack ── */}
        <section>
          <SectionLabel label="04" title="Technology Stack" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            <div className="space-y-4">
              <StackGroup title="Frontend & Framework">
                <StackItem name="Next.js 14" detail="App Router, TypeScript, server components + API routes" />
                <StackItem name="Tailwind CSS" detail="Utility-first styling, dark navy theme" />
                <StackItem name="React 18" detail="Client components for real-time chat and dashboards" />
              </StackGroup>

              <StackGroup title="AI & Agents">
                <StackItem name="Anthropic Claude API" detail="claude-sonnet-4-6 for all agents" />
                <StackItem name="@anthropic-ai/sdk" detail="Streaming via anthropic.messages.stream()" />
                <StackItem name="PicoClaw (hardware)" detail="Go binary — HTTP gateway to Claude API on each board" />
              </StackGroup>

              <StackGroup title="Real-Time">
                <StackItem name="Server-Sent Events (SSE)" detail="Edge runtime stream — dashboards subscribe on load" />
                <StackItem name="No WebSockets" detail="SSE is simpler, Vercel Edge compatible, one-directional" />
              </StackGroup>
            </div>

            <div className="space-y-4">
              <StackGroup title="Infrastructure">
                <StackItem name="Vercel" detail="Auto-deploy from GitHub main branch. Edge + Node runtimes" />
                <StackItem name="Edge Runtime" detail="/api/stream (SSE endpoint) — low latency, globally distributed" />
                <StackItem name="Node Runtime" detail="/api/chat — needed for Anthropic SDK streaming" />
              </StackGroup>

              <StackGroup title="Data Storage">
                <StackItem name="In-memory store" detail="Singleton Map — intentional for prototype. Resets on restart." />
                <StackItem name="Pre-seeded" detail="4 demo conversations seeded at module init for instant demo" />
                <StackItem name="No database" detail="Production would use Redis or Postgres — not needed for prototype" />
              </StackGroup>

              <StackGroup title="Security">
                <StackItem name="ESLint security plugin" detail="SAST scanning on every commit" />
                <StackItem name="HTTP security headers" detail="X-Frame-Options, XSS-Protection, Content-Type-Options" />
                <StackItem name="GL8 compliance" detail="AI disclosure on every agent first message" />
                <StackItem name="Env vars only" detail="ANTHROPIC_API_KEY never in code or repo" />
              </StackGroup>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: Data Architecture ── */}
        <section>
          <SectionLabel label="05" title="Data Architecture" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Conversation Model</h3>
              <pre className="text-xs text-gray-300 leading-relaxed overflow-x-auto">{`Conversation {
  id, customerId, customerName
  status:    triaging | with-grace | with-swift
             with-kara | with-phoenix
             human-queue | human-active | resolved
  currentAgent: AgentId
  messages:  Message[]   ← full thread history
  routing:   RoutingDecision[]  ← every routing change
  priority:  CRITICAL | HIGH | MEDIUM | LOW | PENDING
  metrics: {
    startedAt, firstResponseAt, resolvedAt
    agentTurns: { grace: 2, swift: 0, ... }
    waitTimeMs, tNPS
  }
  language: 'en' | 'zh'
}`}</pre>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Routing Decision Model</h3>
              <pre className="text-xs text-gray-300 leading-relaxed overflow-x-auto">{`RoutingDecision {
  assignedAgent: AgentId
  reasoning: string     ← human-readable
  confidence: 0.0–1.0
  triggers: string[]    ← detected signals
  timestamp: string
}

// Stored per conversation — full audit trail
// of every routing change with reasoning.
// Visible in triage dashboard side panel.`}</pre>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">SSE Events</h3>
                <div className="space-y-1 text-xs text-gray-400 font-mono">
                  {["conversation_created", "conversation_updated", "routing_decision", "queue_updated", "metrics_tick"].map(e => (
                    <div key={e} className="text-emerald-400">event: {e}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: Infrastructure ── */}
        <section>
          <SectionLabel label="06" title="Infrastructure Architecture" />

          <div className="mt-6 space-y-6">
            {/* Current */}
            <div className="bg-gray-900 border border-emerald-700/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-semibold text-emerald-400 text-sm">NOW — Vercel Cloud (Simulation Mode)</h3>
              </div>
              <div className="font-mono text-xs text-gray-400 leading-relaxed bg-gray-950 rounded-xl p-5 overflow-x-auto">
                <div className="text-gray-600 mb-2">{"// Any browser, anywhere — no laptop needed"}</div>
                <div><span className="text-blue-400">Customer</span> → <span className="text-amber-400">Vercel Edge</span> (vercel.app)</div>
                <div className="ml-8">→ <span className="text-violet-400">/api/chat</span> (Node runtime, Vercel serverless)</div>
                <div className="ml-12">→ <span className="text-gray-300">Hard-coded overrides</span> (rule-based, instant)</div>
                <div className="ml-12">→ <span className="text-violet-400">Triage Agent</span> → Anthropic Claude API</div>
                <div className="ml-12">→ <span className="text-blue-400">Grace</span> / <span className="text-amber-400">Swift</span> / <span className="text-emerald-400">Kara</span> / <span className="text-red-400">Phoenix</span> → Anthropic Claude API</div>
                <div className="ml-12">→ <span className="text-gray-300">Stream response</span> back to customer</div>
                <div className="ml-12">→ <span className="text-gray-300">Broadcast SSE</span> to dashboards</div>
                <div className="ml-4 mt-2"><span className="text-violet-400">/api/stream</span> (Edge runtime) ← <span className="text-blue-400">Triage Dashboard</span> + <span className="text-emerald-400">Queue</span> + <span className="text-amber-400">Metrics</span></div>
              </div>
            </div>

            {/* Hardware phase */}
            <div className="bg-gray-900 border border-blue-700/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <h3 className="font-semibold text-blue-400 text-sm">PHASE 1 (March 2026) — Board 1: Grace on Hardware</h3>
              </div>
              <div className="font-mono text-xs text-gray-400 leading-relaxed bg-gray-950 rounded-xl p-5 overflow-x-auto">
                <div className="text-gray-600 mb-2">{"// Dashboard runs locally (npm run dev) — laptop can reach board over WiFi"}</div>
                <div><span className="text-blue-400">Customer</span> → <span className="text-gray-300">localhost:3000</span> (laptop)</div>
                <div className="ml-8">→ <span className="text-violet-400">/api/chat</span></div>
                <div className="ml-12">→ <span className="text-gray-300">Triage decides: Grace</span></div>
                <div className="ml-12">→ <span className="text-blue-400 font-bold">http://192.168.1.51:8001/message</span> (Board 1 — Grace)</div>
                <div className="ml-16">→ <span className="text-gray-300">PicoClaw (Go binary) on RISC-V board</span></div>
                <div className="ml-16">→ <span className="text-gray-300">Anthropic Claude API</span></div>
                <div className="ml-16">→ <span className="text-gray-300">Stream back through laptop to customer</span></div>
                <div className="ml-12 mt-1 text-amber-400">{"// Swift, Kara, Phoenix, Triage → still in simulation on laptop"}</div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Switched by setting <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded">AGENT_MODE=hardware</code> and <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded">GRACE_URL=http://192.168.1.51:8001</code> in .env.local
              </div>
            </div>

            {/* Full hardware */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 opacity-70">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <h3 className="font-semibold text-gray-400 text-sm">GOAL STATE — Full 5-Board Hardware Cluster</h3>
              </div>
              <div className="font-mono text-xs text-gray-500 leading-relaxed bg-gray-950 rounded-xl p-5 overflow-x-auto">
                <div className="text-gray-600 mb-2">{"// One physical board per agent. ~$100 total hardware cost."}</div>
                <div><span className="text-blue-400">Customer</span> → <span className="text-gray-400">Dashboard (laptop or cloud)</span></div>
                <div className="ml-8">→ Triage Agent (Board 5 — 192.168.1.55:8005)</div>
                <div className="ml-8">→ Grace   (Board 1 — 192.168.1.51:8001) 💙</div>
                <div className="ml-8">→ Swift   (Board 2 — 192.168.1.52:8002) ⚡</div>
                <div className="ml-8">→ Kara    (Board 3 — 192.168.1.53:8003) 📚</div>
                <div className="ml-8">→ Phoenix (Board 4 — 192.168.1.54:8004) 🔥</div>
                <div className="ml-4 mt-1 text-gray-600">{"// Each board: RISC-V 1GHz · 256MB · WiFi 6 · USB-C 1-2W · PicoClaw HTTP gateway"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: Dashboards ── */}
        <section>
          <SectionLabel label="07" title="Dashboards & Operator Views" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashCard href="/triage" emoji="📋" title="Triage Dashboard" color="amber">
              Live grid of all active conversations. Shows customer name, current agent, priority badge, last message preview, and elapsed time. Click any card to open a side panel with the full message thread and complete routing decision history. Filters: All | AI Active | Human Queue | Resolved. Updates in real-time via SSE — no refresh needed.
            </DashCard>
            <DashCard href="/queue" emoji="👤" title="Human Queue" color="violet">
              Conversations waiting for a human operator, sorted by wait time (longest first). Each card shows why it was escalated, priority, and customer summary. Operator clicks "Pick Up" to claim it and opens a live chat view. Operator messages appear as "Human Agent" in the customer thread. "Resolve" closes the conversation.
            </DashCard>
            <DashCard href="/metrics" emoji="📊" title="Management Metrics" color="green">
              Full KPI dashboard: total conversations, active now, SLA adherence %, average handle time, first contact resolution, tNPS average, queue depth, agent utilization bars per agent, AI vs Human resolution ratio. Auto-refreshes every 30 seconds. SLA target: bot response &lt;3s, agent turn &lt;30s, human queue &lt;2min.
            </DashCard>
            <DashCard href="/simulator" emoji="🎯" title="Scenario Simulator" color="red">
              6 pre-built typhoon scenarios fire messages at 2-second intervals, simulating real customer conversations. Each scenario has an expected agent routing. Watch the triage dashboard update live as scenarios play out. Scenarios: Mrs. Chan (elderly flood), David Lee (car crushed), Policy question, Furious customer, Window emergency, Complex multi-property.
            </DashCard>
          </div>
        </section>

        {/* ── SECTION 8: Security ── */}
        <section>
          <SectionLabel label="08" title="Security Architecture" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "✅", title: "GL8 AI Disclosure", body: "Every agent identifies as AI on its first message to the customer. A 'Prefer to speak with a person?' button is always visible in the chat interface." },
              { icon: "✅", title: "No Secrets in Code", body: "ANTHROPIC_API_KEY is an environment variable only. The .gitignore excludes all config files. The repo contains zero credentials." },
              { icon: "✅", title: "HTTP Security Headers", body: "X-Frame-Options: DENY · X-Content-Type-Options: nosniff · Referrer-Policy: strict-origin · X-XSS-Protection: 1; mode=block · Permissions-Policy: camera=(), microphone=()" },
              { icon: "✅", title: "SAST Scanning", body: "ESLint security plugin runs on every commit. Detects object injection, timing attacks, non-literal filenames. TypeScript strict mode catches type errors at build time." },
              { icon: "✅", title: "No SQL Injection Surface", body: "The prototype uses an in-memory Map — no database, no raw query construction. Zero SQL injection risk by design." },
              { icon: "✅", title: "Hard-coded Safety Overrides", body: "Emergency keywords (fire, gas, 999) trigger CRITICAL routing before any LLM is called. These cannot be bypassed by prompt injection." },
              { icon: "⚠️", title: "Auth (Production TODO)", body: "Operator endpoints (/queue, /conversations) are open in the prototype. Before production, add session-based auth for the human operator views." },
              { icon: "⚠️", title: "Rate Limiting (Production TODO)", body: "No rate limiting on /api/chat in the prototype. Add API rate limiting before production to prevent abuse and control API costs." },
              { icon: "⚠️", title: "Persistent Storage (Production TODO)", body: "In-memory store resets on server restart. Production requires Redis or Postgres for conversation persistence, audit trail, and GDPR compliance." },
            ].map((item) => (
              <div key={item.title} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                <div className="text-xl mb-2">{item.icon}</div>
                <div className="font-semibold text-white text-sm mb-2">{item.title}</div>
                <div className="text-gray-400 text-xs leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 9: Scalability ── */}
        <section>
          <SectionLabel label="09" title="Scalability & Cost Model" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Cost Comparison — Typhoon Surge Day</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-500 text-xs pb-3 font-normal">Item</th>
                    <th className="text-right text-gray-500 text-xs pb-3 font-normal">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    { label: "5-board hardware cluster", val: "$100", note: "one-time", color: "text-emerald-400" },
                    { label: "Claude API — surge day (1,000 interactions)", val: "~$5", note: "per day", color: "text-emerald-400" },
                    { label: "Human agents × 8 — surge day", val: "$400–800", note: "per day", color: "text-red-400" },
                    { label: "AI containment target", val: ">50%", note: "of volume", color: "text-blue-400" },
                    { label: "Break-even point", val: "2–3 days", note: "of operation", color: "text-amber-400" },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 text-gray-400 text-xs">{row.label}</td>
                      <td className="py-3 text-right">
                        <span className={`font-bold text-sm ${row.color}`}>{row.val}</span>
                        <span className="text-gray-600 text-xs ml-1">{row.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Scaling Strategy</h3>
              <div className="space-y-4 text-sm">
                {[
                  { icon: "📦", title: "Add capacity = buy a board", body: "Each new board adds one more specialist agent. 10× Grace boards for empathy surge = $200 hardware." },
                  { icon: "⚡", title: "Instant scale-out", body: "No cloud provisioning, no auto-scaling config. Plug in a board, deploy PicoClaw, update one env var." },
                  { icon: "📡", title: "Air-gap capable", body: "Runs on a mobile hotspot. No internet infrastructure required. Operational within minutes of typhoon landfall." },
                  { icon: "🌏", title: "Any surge, any region", body: "Same stack works for any Chubb HK weather event — T3, T8, T10, or Black Rain. Spin up agents as needed." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{item.title}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 10: API Calls Explained ── */}
        <section>
          <SectionLabel label="10" title="Understanding the API Calls — What Calls What" />
          <p className="text-gray-400 text-sm mt-2 mb-6">
            There are two completely separate APIs in play. Confusing them is easy — this section clarifies exactly what each one does and why both are needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 border border-blue-700/40 rounded-2xl p-6">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-bold text-blue-400 text-sm mb-1">Telegram API</h3>
              <div className="text-xs text-gray-500 mb-3">api.telegram.org — free, always free</div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Handles the <strong className="text-white">messaging channel only</strong>. Sends and receives text messages between the customer&apos;s Telegram app and your bot. No AI happens here — it is a pipe, not a brain.
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex gap-2"><span className="text-blue-400">→</span> Customer sends message to Telegram bot</div>
                <div className="flex gap-2"><span className="text-blue-400">→</span> Telegram API delivers it to your server</div>
                <div className="flex gap-2"><span className="text-blue-400">→</span> AI generates a response</div>
                <div className="flex gap-2"><span className="text-blue-400">→</span> Telegram API sends it back to the customer</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-emerald-400 font-semibold">Cost: £0. No token charges. Telegram is always free.</div>
            </div>

            <div className="bg-gray-900 border border-violet-700/40 rounded-2xl p-6">
              <div className="text-2xl mb-3">🧠</div>
              <h3 className="font-bold text-violet-400 text-sm mb-1">Anthropic / DeepSeek API</h3>
              <div className="text-xs text-gray-500 mb-3">api.anthropic.com — charged per token</div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Handles the <strong className="text-white">intelligence only</strong>. Takes the conversation history and system prompt, runs it through a large language model on Anthropic&apos;s servers, and returns a response. No messaging happens here — it is a brain, not a pipe.
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex gap-2"><span className="text-violet-400">→</span> Your server sends: system prompt + conversation</div>
                <div className="flex gap-2"><span className="text-violet-400">→</span> Anthropic runs Claude on their GPU servers</div>
                <div className="flex gap-2"><span className="text-violet-400">→</span> Streams the generated response back</div>
                <div className="flex gap-2"><span className="text-violet-400">→</span> You are charged per token processed</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-amber-400 font-semibold">Cost: ~$0.01 per message exchange. $5 ≈ 500 conversations.</div>
            </div>
          </div>

          {/* The laptop clarification */}
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-400 text-sm mb-3">Why OpenClaw on the Laptop Felt &quot;Free&quot;</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              When you ran OpenClaw on your laptop with Telegram, there were still two API calls happening — you just didn&apos;t think of them separately:
            </p>
            <div className="font-mono text-xs text-gray-400 bg-gray-950 rounded-xl p-4 leading-relaxed">
              <div><span className="text-blue-400">Telegram API</span> → <span className="text-gray-300">free, delivers message to OpenClaw on laptop</span></div>
              <div className="ml-4">→ <span className="text-gray-300">OpenClaw on laptop receives it</span></div>
              <div className="ml-4">→ <span className="text-violet-400">Anthropic/Claude API</span> → <span className="text-gray-300">paid, generates the response</span></div>
              <div className="ml-4">→ <span className="text-blue-400">Telegram API</span> → <span className="text-gray-300">free, delivers response back to customer</span></div>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              The laptop was not doing the AI thinking — it was just the relay in the middle. Claude&apos;s servers did the thinking. The API key was configured inside OpenClaw&apos;s config file, so it worked without you explicitly managing it. The AI call was always there — it was just hidden.
            </p>
          </div>

          {/* PicoClaw on hardware */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h3 className="font-bold text-white text-sm mb-4">PicoClaw on the Sipeed Board — Same Pattern, Smaller Box</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              PicoClaw on the board works <strong className="text-white">identically to OpenClaw on the laptop</strong> — it is the same pattern, just on a $20 chip instead of a full computer. The board has WiFi 6 and makes the same outbound HTTPS call to the Claude API that the laptop was making. Neither the laptop nor the board runs AI locally — both are relays. The AI always runs on Anthropic&apos;s servers.
            </p>
            <div className="font-mono text-xs text-gray-400 bg-gray-950 rounded-xl p-4 leading-relaxed mb-4">
              <div><span className="text-blue-400">Telegram API</span> → <span className="text-gray-300">free, delivers message to PicoClaw on board</span></div>
              <div className="ml-4">→ <span className="text-gray-300">PicoClaw (Go binary) on RISC-V board receives it</span></div>
              <div className="ml-4">→ <span className="text-violet-400">Anthropic/DeepSeek API</span> → <span className="text-gray-300">paid/free, generates the response</span></div>
              <div className="ml-4">→ <span className="text-blue-400">Telegram API</span> → <span className="text-gray-300">free, delivers response back to customer</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-white font-semibold mb-1">What the board needs</div>
                <div className="text-gray-400">WiFi connection · Anthropic or DeepSeek API key in PicoClaw config · Telegram bot token</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-white font-semibold mb-1">What the board does not need</div>
                <div className="text-gray-400">Local GPU · Large RAM · Local model files · Always-on laptop</div>
              </div>
              <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-3">
                <div className="text-emerald-400 font-semibold mb-1">Free tier option</div>
                <div className="text-gray-400">Use DeepSeek free tier instead of Anthropic. Same pattern, zero API cost for prototype volumes.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 11: Future integrations ── */}
        <section>
          <SectionLabel label="11" title="Production Integration Roadmap" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "📞", title: "NICE CXone", body: "Connect to Chubb's existing contact centre platform. Route AI-handled conversations into the same queue as phone calls for unified reporting.", phase: "Phase 2" },
              { icon: "🗄", title: "Claims Connect", body: "Live policy lookup — verify customer identity, retrieve policy details, check coverage, and auto-register FNOL claims directly in the claims system.", phase: "Phase 2" },
              { icon: "🤖", title: "Amelia Chatbot", body: "Amelia (existing Chubb chatbot) hands off to PicoClaw agents for typhoon-specific conversations, then receives resolved conversations back.", phase: "Phase 2" },
              { icon: "📱", title: "SMS / WhatsApp", body: "Customer sends a WhatsApp message during the typhoon. PicoClaw gateway receives it and routes through the same agent system. No new UI needed.", phase: "Phase 3" },
              { icon: "🌀", title: "HK Observatory API", body: "Live typhoon signal feed (T3/T8/T10). Pre-position agents based on signal level. Auto-scale Grace boards before the surge hits.", phase: "Phase 3" },
              { icon: "📊", title: "Dynamics CRM", body: "Push conversation summaries, triage decisions, and tNPS scores into Chubb's CRM for a unified customer view and post-event analytics.", phase: "Phase 3" },
            ].map((item) => (
              <div key={item.title} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl">{item.icon}</div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{item.phase}</span>
                </div>
                <div className="font-semibold text-white text-sm mb-2">{item.title}</div>
                <div className="text-gray-400 text-xs leading-relaxed">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer links */}
        <div className="flex gap-3 flex-wrap text-sm pt-4 border-t border-gray-800">
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">← Home</Link>
          <Link href="/hardware" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">🔌 Hardware</Link>
          <Link href="/security" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">🔒 Security</Link>
          <Link href="/simulator" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">🎯 Simulator</Link>
          <a href="/presentation.html" className="bg-red-900/40 hover:bg-red-900/60 text-red-300 px-4 py-2 rounded-xl transition-colors border border-red-700/40">📊 Presentation</a>
        </div>

      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

function SectionLabel({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-red-900/40 border border-red-700/50 flex items-center justify-center text-red-400 text-xs font-bold flex-shrink-0">{label}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );
}

function Card({ color, children }: { color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue: "border-blue-500/40 bg-blue-900/10",
    amber: "border-amber-500/40 bg-amber-900/10",
    green: "border-emerald-500/40 bg-emerald-900/10",
  };
  return <div className={`border rounded-2xl p-6 ${colors[color]}`}>{children}</div>;
}
function CardIcon({ children }: { children: React.ReactNode }) {
  return <div className="text-3xl mb-3">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-white text-base mb-2">{children}</h3>;
}
function CardBody({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-sm leading-relaxed">{children}</p>;
}

function FlowArrow() {
  return <div className="flex justify-start pl-6 py-1 text-gray-600 text-lg">↓</div>;
}

function FlowStep({ step, color, title, detail, bullets, code }: {
  step: string; color: string; title: string; detail: string;
  bullets?: string[]; code?: string;
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-700 text-gray-200",
    violet: "bg-violet-700 text-violet-100",
    blue: "bg-blue-700 text-blue-100",
    green: "bg-emerald-700 text-emerald-100",
    amber: "bg-amber-700 text-amber-100",
  };
  return (
    <div className="flex gap-4">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${colors[color]}`}>{step}</div>
      <div className="flex-1 pb-2">
        <div className="font-semibold text-white text-sm mb-1">{title}</div>
        <div className="text-gray-400 text-xs leading-relaxed mb-2">{detail}</div>
        {bullets && (
          <ul className="space-y-1 mb-2">
            {bullets.map((b) => (
              <li key={b} className="text-xs text-gray-400 flex gap-2"><span className="text-red-400 flex-shrink-0">→</span>{b}</li>
            ))}
          </ul>
        )}
        {code && (
          <pre className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto leading-relaxed">{code}</pre>
        )}
      </div>
    </div>
  );
}

function AgentRow({ emoji, name, color, border, bg, role, triggers, personality, systemPromptSummary, model, phase }: {
  emoji: string; name: string; color: string; border: string; bg: string;
  role: string; triggers: string[]; personality: string; systemPromptSummary: string;
  model: string; phase?: string;
}) {
  return (
    <div className={`border ${border} ${bg} rounded-2xl p-6`}>
      <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
        <div className="flex-shrink-0 text-center w-20">
          <div className="text-4xl mb-1">{emoji}</div>
          <div className={`font-bold text-sm ${color}`}>{name}</div>
          <div className="text-gray-500 text-xs">{role}</div>
          {phase && <div className="mt-1 text-xs text-blue-400 font-medium">{phase}</div>}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Routing triggers</div>
            <div className="flex flex-wrap gap-1">
              {triggers.map((t) => (
                <span key={t} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personality</div>
            <p className="text-xs text-gray-400 leading-relaxed">{personality}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System prompt (summary)</div>
            <pre className="text-xs text-gray-400 bg-gray-950 rounded-lg p-2 overflow-x-auto leading-relaxed whitespace-pre-wrap border border-gray-800">{systemPromptSummary}</pre>
            <div className="mt-2 text-xs text-gray-600 font-mono">{model}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StackItem({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
      <div>
        <span className="text-white text-sm font-medium">{name}</span>
        <span className="text-gray-500 text-xs ml-2">{detail}</span>
      </div>
    </div>
  );
}

function DashCard({ href, emoji, title, color, children }: {
  href: string; emoji: string; title: string; color: string; children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/40 bg-amber-900/10",
    violet: "border-violet-500/40 bg-violet-900/10",
    green: "border-emerald-500/40 bg-emerald-900/10",
    red: "border-red-500/40 bg-red-900/10",
  };
  return (
    <div className={`border rounded-2xl p-6 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-bold text-white text-sm">{title}</h3>
        <Link href={href} className="ml-auto text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded-lg transition-colors">View →</Link>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed">{children}</p>
    </div>
  );
}
