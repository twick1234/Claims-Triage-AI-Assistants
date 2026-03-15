import Link from "next/link";

const NAV_TILES = [
  {
    href: "/chat",
    emoji: "💬",
    title: "Customer Chat",
    desc: "Start a new claim conversation. AI triage routes you to the right specialist.",
    color: "from-blue-600 to-blue-800",
    border: "border-blue-500",
  },
  {
    href: "/triage",
    emoji: "📋",
    title: "Triage Dashboard",
    desc: "Live view of all active conversations, routing decisions, and priorities.",
    color: "from-amber-600 to-amber-800",
    border: "border-amber-500",
  },
  {
    href: "/queue",
    emoji: "👤",
    title: "Human Queue",
    desc: "Operator view — pick up escalated conversations and resolve complex cases.",
    color: "from-violet-600 to-violet-800",
    border: "border-violet-500",
  },
  {
    href: "/metrics",
    emoji: "📊",
    title: "Management Metrics",
    desc: "KPIs, SLA adherence, agent utilization, and tNPS dashboard.",
    color: "from-emerald-600 to-emerald-800",
    border: "border-emerald-500",
  },
  {
    href: "/simulator",
    emoji: "🎯",
    title: "Scenario Simulator",
    desc: "Fire pre-built typhoon scenarios to demonstrate live AI routing in action.",
    color: "from-red-600 to-red-800",
    border: "border-red-500",
  },
  {
    href: "/architecture",
    emoji: "🏗️",
    title: "Solution Architecture",
    desc: "Full conceptual, logical and physical design — agents, data model, infrastructure, tech stack, and production roadmap.",
    color: "from-indigo-600 to-indigo-800",
    border: "border-indigo-500",
  },
  {
    href: "/security",
    emoji: "🔒",
    title: "Security",
    desc: "SAST findings, dependency scan results, architecture review, and production readiness checklist.",
    color: "from-slate-600 to-slate-800",
    border: "border-slate-500",
  },
  {
    href: "/hardware",
    emoji: "🔌",
    title: "Hardware Architecture",
    desc: "4 agents live on Telegram now (laptop). Board 1 arriving Mar 2026 — move to hardware one agent at a time.",
    color: "from-cyan-700 to-cyan-900",
    border: "border-cyan-600",
  },
  {
    href: "/kanban",
    emoji: "📌",
    title: "Project Kanban",
    desc: "Done, in progress, up next, and backlog. Live status of the build.",
    color: "from-rose-700 to-rose-900",
    border: "border-rose-600",
  },
  {
    href: "/office",
    emoji: "🖥️",
    title: "Operations Room",
    desc: "Live agent ops centre — watch Grace, Swift, Kara, Phoenix and Triage work in real time.",
    color: "from-violet-800 to-gray-900",
    border: "border-violet-700",
  },
];

const AGENTS = [
  { id: "grace",   emoji: "💙", name: "Grace",   role: "Empathy Specialist",      color: "#3B82F6", trigger: "Distressed · Elderly · Injured" },
  { id: "swift",   emoji: "⚡", name: "Swift",   role: "Fast-Track Claims",        color: "#F59E0B", trigger: "Urgent · Property · Vehicle" },
  { id: "kara",    emoji: "📚", name: "Kara",    role: "Knowledge & FAQ",          color: "#10B981", trigger: "Policy Questions · Coverage" },
  { id: "phoenix", emoji: "🔥", name: "Phoenix", role: "Escalation Handler",       color: "#EF4444", trigger: "Angry · Legal Threats · Complex" },
  { id: "human",   emoji: "👤", name: "Human",   role: "Human Agent Queue",        color: "#8B5CF6", trigger: "Explicit Request · Unresolved" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Preparing for HK Typhoon Season 2026
            </div>
            <a
              href="/presentation.html"
              className="inline-flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-amber-900/50 transition-colors"
            >
              📊 View Presentation
            </a>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Claims Triage <span className="text-red-400">AI</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
            Instant, empathetic, bilingual claims triage — available the moment a typhoon hits, at a cost that makes sense.
          </p>
          <p className="text-gray-500 text-sm max-w-xl mx-auto mb-1">
            When Signal 8 or 10 is raised, every distressed customer gets an intelligent first response in under 3 seconds.
            Human agents handle only what genuinely needs them.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Intelligent triage · Real-time routing · Bilingual EN/廣東話 · Human escalation · 24/7 · ~$0.003/conversation
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Nav tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {NAV_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`group relative overflow-hidden rounded-2xl border ${tile.border} bg-gradient-to-br ${tile.color} p-6 hover:scale-[1.02] transition-all duration-200 shadow-lg`}
            >
              <div className="text-4xl mb-3">{tile.emoji}</div>
              <h2 className="text-lg font-bold text-white mb-1">{tile.title}</h2>
              <p className="text-sm text-white/70">{tile.desc}</p>
              <div className="absolute bottom-4 right-4 text-white/30 group-hover:text-white/60 transition-colors text-xl">
                →
              </div>
            </Link>
          ))}
        </div>

        {/* Agent roster */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🤖</span> The Agent Roster
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-colors"
              >
                <div className="text-2xl mb-2">{agent.emoji}</div>
                <div className="font-bold text-white text-sm">{agent.name}</div>
                <div className="text-xs font-medium mb-2" style={{ color: agent.color }}>
                  {agent.role}
                </div>
                <div className="text-xs text-gray-500">{agent.trigger}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Architecture info */}
        <div className="mb-8 bg-gray-800/40 border border-cyan-700/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl mt-0.5">🔌</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                Hardware Roadmap — Phased Rollout
                <span className="text-xs font-normal bg-green-900/40 border border-green-700/40 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                  4 bots live on Telegram
                </span>
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                4 agents are <span className="text-green-400 font-semibold">live on Telegram</span> right now via PicoClaw on this laptop —
                @ChuTriage_bot routes to @ChuGrace_bot, @ChuSwift_bot, @ChuKaraKara_bot.
                Next step: move each agent from laptop to a dedicated <span className="text-cyan-400 font-semibold">Sipeed LicheeRV Nano W</span> board as they arrive (~$20 each).
              </p>
              {/* Mini board diagram */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { emoji: "🎯", name: "Triage",  board: 0, color: "border-violet-500/70 bg-violet-900/30 text-violet-400", phase: "Live 📱" },
                  { emoji: "💙", name: "Grace",   board: 1, color: "border-blue-500/70 bg-blue-900/30 text-blue-400", phase: "Live 📱" },
                  { emoji: "⚡", name: "Swift",   board: 2, color: "border-amber-500/70 bg-amber-900/30 text-amber-400", phase: "Live 📱" },
                  { emoji: "📚", name: "Kara",    board: 3, color: "border-emerald-500/70 bg-emerald-900/30 text-emerald-400", phase: "Live 📱" },
                  { emoji: "🔥", name: "Phoenix", board: 4, color: "border-red-500/30 bg-red-900/10 text-red-600", phase: "Pending" },
                ].map((b) => (
                  <div key={b.board} className={`border rounded-xl px-3 py-2 text-xs font-medium ${b.color}`}>
                    <div className="text-base mb-0.5">{b.emoji}</div>
                    <div>{b.name}</div>
                    <div className="text-gray-500 font-normal">{b.phase}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                ~$20/board · RISC-V 1 GHz · 256 MB RAM · WiFi 6 · USB-C powered · PicoClaw (Go) HTTP gateway to Claude API.
                Full cluster goal: ~$100. <Link href="/hardware" className="text-cyan-400 hover:text-cyan-300 underline">View hardware architecture →</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Flow */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
            Prototype Flow — What This Demonstrates
          </h2>

          {/* Flow steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
            {[
              { step: '1', label: 'Customer', sub: 'opens /chat, describes damage', color: 'bg-gray-700 border-gray-600', icon: '💬' },
              { step: '2', label: 'Triage Agent', sub: 'LLM reads sentiment + keywords', color: 'bg-gray-600 border-gray-500', icon: '🎯' },
              { step: '3', label: 'Specialist', sub: 'Grace · Swift · Kara · Phoenix', color: 'bg-blue-900/60 border-blue-700', icon: '🤖' },
              { step: '4', label: 'Escalation', sub: '3+ turns → human queue', color: 'bg-violet-900/60 border-violet-700', icon: '👤' },
              { step: '5', label: 'Resolved', sub: 'operator closes, NPS logged', color: 'bg-emerald-900/60 border-emerald-700', icon: '✅' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-2">
                <div className={`flex-1 border rounded-xl p-3 text-center ${s.color}`}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-bold text-white">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
                {i < 4 && <div className="text-gray-600 self-center text-lg mt-2">→</div>}
              </div>
            ))}
          </div>

          {/* Two override paths */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3">
              <div className="text-xs font-semibold text-red-400 mb-1">Hard Override — Emergency</div>
              <div className="text-xs text-gray-400">Keywords: fire · gas · 999 → Grace + human notified immediately</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-800/40 rounded-xl p-3">
              <div className="text-xs font-semibold text-orange-400 mb-1">Hard Override — Legal</div>
              <div className="text-xs text-gray-400">Keywords: lawyer · sue · court → Phoenix instantly, bypasses triage</div>
            </div>
            <div className="bg-violet-900/20 border border-violet-800/40 rounded-xl p-3">
              <div className="text-xs font-semibold text-violet-400 mb-1">Hard Override — Human Request</div>
              <div className="text-xs text-gray-400">Keywords: real person · human · 真人 → human queue immediately</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm border-t border-gray-700 pt-4">
            <span className="text-xs text-gray-500 font-medium">Routing order:</span>
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">Customer Message</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs">Overrides check</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs">LLM Triage (claude-sonnet-4-6)</span>
            <span className="text-gray-600">→</span>
            <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs">Grace 💙</span>
            <span className="text-gray-500 text-xs">/</span>
            <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs">Swift ⚡</span>
            <span className="text-gray-500 text-xs">/</span>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs">Kara 📚</span>
            <span className="text-gray-500 text-xs">/</span>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">Phoenix 🔥</span>
            <span className="text-gray-500 text-xs">/</span>
            <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs">Human 👤</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Each AI agent runs on <span className="text-amber-400">claude-sonnet-4-6</span> via the Anthropic API.
            In simulation mode all 5 agents run in-process. Once boards arrive, each moves to its own Sipeed board running PicoClaw.
          </p>
        </div>
      </div>
    </div>
  );
}
