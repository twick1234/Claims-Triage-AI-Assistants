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
    desc: "Board-per-agent architecture. Board 1 (Grace) arriving March 2026 — prove it works, then order more.",
    color: "from-cyan-700 to-cyan-900",
    border: "border-cyan-600",
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
          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            Live Prototype — Typhoon Season HK 2024
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Claims Triage <span className="text-red-400">AI</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-2">
            5-agent multi-AI system for Chubb HK typhoon claims. Powered by Anthropic Claude.
          </p>
          <p className="text-gray-500 text-sm">
            Intelligent triage · Real-time routing · Bilingual support · Human escalation
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
                Hardware Target — March 2026
                <span className="text-xs font-normal bg-amber-900/40 border border-amber-700/40 text-amber-400 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Currently running in <span className="text-amber-400 font-semibold">simulation mode</span> — all 5 agents share this laptop process.
                Hardware target: 5 dedicated Sipeed LicheeRV Nano W boards (one per agent), connected over WiFi 6.
              </p>
              {/* Mini board diagram */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { emoji: "💙", name: "Grace", board: 1, color: "border-blue-500/50 bg-blue-900/20 text-blue-400" },
                  { emoji: "⚡", name: "Swift",   board: 2, color: "border-amber-500/50 bg-amber-900/20 text-amber-400" },
                  { emoji: "📚", name: "Kara",    board: 3, color: "border-emerald-500/50 bg-emerald-900/20 text-emerald-400" },
                  { emoji: "🔥", name: "Phoenix", board: 4, color: "border-red-500/50 bg-red-900/20 text-red-400" },
                  { emoji: "🎯", name: "Triage",  board: 5, color: "border-violet-500/50 bg-violet-900/20 text-violet-400" },
                ].map((b) => (
                  <div key={b.board} className={`border rounded-xl px-3 py-2 text-xs font-medium ${b.color}`}>
                    <div className="text-base mb-0.5">{b.emoji}</div>
                    <div>{b.name}</div>
                    <div className="text-gray-500 font-normal">Board #{b.board}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                ~$20/board · RISC-V 1 GHz · 256 MB RAM · WiFi 6 · USB-C powered · PicoClaw (Go) HTTP gateway to Claude API.
                Total cluster cost: ~$100. <Link href="/hardware" className="text-cyan-400 hover:text-cyan-300 underline">View hardware dashboard →</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Triage flow */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Routing Flow
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full">Customer Message</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-600 text-white px-3 py-1 rounded-full">Triage Agent (LLM)</span>
            <span className="text-gray-600">→</span>
            <span className="bg-blue-700 text-white px-3 py-1 rounded-full">Grace 💙</span>
            <span className="text-gray-500 text-xs">or</span>
            <span className="bg-amber-600 text-white px-3 py-1 rounded-full">Swift ⚡</span>
            <span className="text-gray-500 text-xs">or</span>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full">Kara 📚</span>
            <span className="text-gray-500 text-xs">or</span>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full">Phoenix 🔥</span>
            <span className="text-gray-500 text-xs">or</span>
            <span className="bg-violet-600 text-white px-3 py-1 rounded-full">Human Queue 👤</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Hard-coded overrides run first (emergency, legal, human request) then LLM analysis for sentiment-based routing.
            After 3+ unresolved turns, auto-escalate to human queue.
          </p>
        </div>
      </div>
    </div>
  );
}
