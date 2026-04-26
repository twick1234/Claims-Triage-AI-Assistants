import Link from "next/link";

const AGENT_MODE = process.env.AGENT_MODE ?? "simulation";

const BOARDS = [
  {
    id: "triage",
    board: 0,
    emoji: "🎯",
    name: "Triage",
    role: "Routing / Orchestration",
    port: 8005,
    ip: "192.168.1.55",
    color: "#8B5CF6",
    border: "border-violet-500/60",
    bg: "bg-violet-500/10",
    dot: "bg-violet-400",
    triggers: "All incoming messages — entry point",
    phase: "Live on laptop",
    phaseColor: "text-green-400",
    telegramBot: "@ChuTriage_bot",
    laptopPort: 18791,
    hardwarePhase: "Phase 5",
  },
  {
    id: "grace",
    board: 1,
    emoji: "💙",
    name: "Grace",
    role: "Empathy Specialist",
    port: 8001,
    ip: "192.168.1.51",
    color: "#3B82F6",
    border: "border-blue-500/60",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
    triggers: "Distressed · Elderly · Injured",
    phase: "Board arriving Mar 2026",
    phaseColor: "text-blue-400",
    telegramBot: "@ChuGrace_bot",
    laptopPort: 18790,
    hardwarePhase: "Phase 1",
  },
  {
    id: "swift",
    board: 2,
    emoji: "⚡",
    name: "Swift",
    role: "Fast-Track Claims",
    port: 8002,
    ip: "192.168.1.52",
    color: "#F59E0B",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    dot: "bg-amber-400",
    triggers: "Urgent · Property · Vehicle",
    phase: "Live on laptop",
    phaseColor: "text-green-400",
    telegramBot: "@ChuSwift_bot",
    laptopPort: 18792,
    hardwarePhase: "Phase 2",
  },
  {
    id: "kara",
    board: 3,
    emoji: "📚",
    name: "Kara",
    role: "Knowledge & FAQ",
    port: 8003,
    ip: "192.168.1.53",
    color: "#10B981",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    dot: "bg-emerald-400",
    triggers: "Policy Questions · Coverage",
    phase: "Live on laptop",
    phaseColor: "text-green-400",
    telegramBot: "@ChuKaraKara_bot",
    laptopPort: 18793,
    hardwarePhase: "Phase 3",
  },
  {
    id: "phoenix",
    board: 4,
    emoji: "🔥",
    name: "Phoenix",
    role: "Escalation Handler",
    port: 8004,
    ip: "192.168.1.54",
    color: "#EF4444",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    dot: "bg-red-400",
    triggers: "Angry · Legal Threats · Complex",
    phase: "Bot pending (BotFather)",
    phaseColor: "text-amber-400",
    telegramBot: "@ChuPhoenix_bot",
    laptopPort: 18794,
    hardwarePhase: "Phase 4",
  },
];

const isHardware = AGENT_MODE === "hardware";

export default function HardwarePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
              ←
            </Link>
            <h1 className="text-lg font-bold text-white">Hardware Architecture</h1>
          </div>
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              isHardware
                ? "bg-green-900/30 border-green-700/50 text-green-400"
                : "bg-amber-900/30 border-amber-700/50 text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isHardware ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}
            />
            {isHardware ? "HARDWARE MODE" : "SIMULATION MODE"}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Telegram Live Now banner */}
        <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-2xl mt-0.5">📱</div>
            <div>
              <div className="text-green-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                Telegram Multi-Bot Live — Running on Laptop (Mar 2026)
              </div>
              <p className="text-green-200/60 text-sm">
                4 of 5 agents are live on Telegram right now, running as PicoClaw instances on this laptop.
                This is the prototype proving the pattern before hardware arrives.
                Each agent is an independent PicoClaw process — identical architecture to the target Sipeed board deployment.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {[
              { bot: "@ChuTriage_bot", agent: "Triage 🎯", status: "live", port: 18791 },
              { bot: "@ChuGrace_bot", agent: "Grace 💙", status: "live", port: 18790 },
              { bot: "@ChuSwift_bot", agent: "Swift ⚡", status: "live", port: 18792 },
              { bot: "@ChuKaraKara_bot", agent: "Kara 📚", status: "live", port: 18793 },
              { bot: "@ChuPhoenix_bot", agent: "Phoenix 🔥", status: "pending", port: 18794 },
            ].map((b) => (
              <div key={b.bot} className={`rounded-xl p-2.5 border ${b.status === "live" ? "bg-green-900/30 border-green-700/40" : "bg-gray-800/40 border-gray-700/40"}`}>
                <div className={`font-semibold mb-0.5 ${b.status === "live" ? "text-green-300" : "text-gray-500"}`}>{b.agent}</div>
                <div className="text-gray-400 font-mono text-xs">{b.bot}</div>
                <div className="text-gray-600 mt-0.5">:{b.port}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-green-700/20 text-xs text-gray-500">
            <strong className="text-gray-400">How handoff works:</strong> Message @ChuTriage_bot → it reads your situation → routes you to the right specialist with a{" "}
            <code className="bg-gray-800 text-green-300 px-1 rounded">[Context: ...]</code> brief to paste → specialist opens knowing your situation, no repetition needed.
          </div>
        </div>

        {/* Coming-soon banner in simulation mode */}
        {!isHardware && (
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 flex items-start gap-4">
            <div className="text-2xl mt-0.5">🔌</div>
            <div>
              <div className="text-amber-400 font-semibold text-sm mb-1">
                Board 1 arriving March 2026 — phased hardware rollout
              </div>
              <p className="text-amber-200/60 text-sm">
                1 Sipeed LicheeRV Nano W board is on order (arriving 19–27 March 2026). <strong className="text-amber-300">Grace</strong> will be the first agent moved from laptop to hardware.
                The pattern is already proven on the laptop — moving to a board is just changing where PicoClaw runs.
                Set <code className="bg-gray-800 text-amber-300 px-1 rounded text-xs">AGENT_MODE=hardware</code> and <code className="bg-gray-800 text-amber-300 px-1 rounded text-xs">GRACE_URL</code> to activate hardware mode for Grace while others remain on the laptop.
              </p>
            </div>
          </div>
        )}

        {/* Mode summary */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Current Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Agent Mode</div>
              <div className={`font-bold text-base ${isHardware ? "text-green-400" : "text-amber-400"}`}>
                {isHardware ? "Hardware" : "Simulation"}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Agent Execution</div>
              <div className="text-white font-medium">
                {isHardware ? "Physical RISC-V boards via HTTP" : "In-process Next.js API routes"}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Dashboard Server</div>
              <div className="text-white font-medium">This laptop — localhost:3000</div>
            </div>
          </div>
        </div>

        {/* Board cards */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
            Agent Board Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARDS.map((board) => (
              <div
                key={board.id}
                className={`rounded-2xl border ${board.border} ${board.bg} p-5 space-y-3`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{board.emoji}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{board.name}</div>
                      <div className="text-xs" style={{ color: board.color }}>
                        {board.role}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isHardware
                        ? "bg-green-900/40 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHardware ? `${board.dot} animate-pulse` : "bg-gray-500"
                      }`}
                    />
                    {isHardware ? "Online" : "Virtual"}
                  </div>
                </div>

                {/* Board info */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telegram</span>
                    <span className="text-blue-400 font-mono">{board.telegramBot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Laptop port</span>
                    <span className="text-gray-300 font-mono">:{board.laptopPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target board</span>
                    <span className="text-gray-300 font-mono">
                      {board.ip}:{board.port}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hardware</span>
                    <span className="text-gray-500">{board.hardwarePhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={board.phaseColor}>{board.phase}</span>
                  </div>
                  {isHardware && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last heartbeat</span>
                        <span className="text-gray-300">—</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Uptime</span>
                        <span className="text-gray-300">—</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Triggers */}
                <div className="text-xs text-gray-500 pt-1 border-t border-gray-700/50">
                  {board.triggers}
                </div>
              </div>
            ))}

            {/* Dashboard server card */}
            <div className="rounded-2xl border border-gray-600/40 bg-gray-700/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💻</span>
                  <div>
                    <div className="font-bold text-white text-sm">Dashboard</div>
                    <div className="text-xs text-gray-400">Next.js Server</div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-900/40 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Host</span>
                  <span className="text-gray-300">Laptop</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Port</span>
                  <span className="text-gray-300 font-mono">3000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400">Running</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 pt-1 border-t border-gray-700/50">
                UI · Store · Routing · Metrics · SSE
              </div>
            </div>
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Network Topology
          </h2>
          <div className="mb-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Now (laptop prototype)</div>
          <pre className="text-xs text-gray-400 font-mono leading-relaxed overflow-x-auto mb-6">
{`  Telegram User
       |
  @ChuTriage_bot (:18791) ──routes──► @ChuGrace_bot   (:18790)  💙 Grace
                                   ──routes──► @ChuSwift_bot  (:18792)  ⚡ Swift
                                   ──routes──► @ChuKaraKara_bot (:18793) 📚 Kara
                                   ──routes──► @ChuPhoenix_bot (:18794) 🔥 Phoenix (pending)
                                              │
                                        All running as PicoClaw processes on this laptop
                                        OAuth → Anthropic Claude API (claude.ai subscription)`}
          </pre>
          <div className="mb-3 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Target (hardware cluster)</div>
          <pre className="text-xs text-gray-400 font-mono leading-relaxed overflow-x-auto">
{`  Board #1          Board #2          Board #3          Board #4          Board #5
  Grace 💙           Swift ⚡           Kara 📚            Phoenix 🔥         Triage 🎯
  192.168.1.51:8001  192.168.1.52:8002  192.168.1.53:8003  192.168.1.54:8004  192.168.1.55:8005
       |                  |                  |                  |                  |
       └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
                                             |
                                         WiFi 6 / Hotspot
                                             |
                                   Dashboard Server (Laptop)
                                       localhost:3000`}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Moving an agent from laptop to hardware = same PicoClaw binary, same config, different machine.
            The Telegram bot token and Claude OAuth stay identical — only the host changes.
          </p>
        </div>

        {/* Hardware specs */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Sipeed LicheeRV Nano W — Board Specs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            {[
              { label: "CPU", value: "SOPHGO SG2002" },
              { label: "ISA", value: "RISC-V C906 1 GHz" },
              { label: "RAM", value: "256 MB DDR3" },
              { label: "OS", value: "Buildroot Linux" },
              { label: "Network", value: "WiFi 6 + BT 5.2" },
              { label: "Power", value: "USB-C  1–2 W" },
            ].map((spec) => (
              <div key={spec.label}>
                <div className="text-gray-500 text-xs mb-1">{spec.label}</div>
                <div className="text-white font-medium text-xs">{spec.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
            Software: PicoClaw (github.com/sipeed/picoclaw) — Go binary, HTTP gateway to Anthropic Claude API.
            Each board costs ~$20. Goal: 5-board cluster (~$100 total). Proving concept with Board 1 (Grace) first.
          </div>
        </div>

        {/* Scalability callout */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Scalability Story
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-white font-semibold mb-1">Adding capacity</div>
              <div className="text-gray-400 text-xs">
                Adding an agent = buying one more board ($20). During typhoon surge, spin up 10x
                Grace boards for empathy capacity at ~$200 total.
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">vs. Human agent cost</div>
              <div className="text-gray-400 text-xs">
                Human agent: $50–100/day. 10-board cluster: $200 capital + ~$10/day API costs.
                AI cluster pays for itself in 2–3 days of operation.
              </div>
            </div>
            <div>
              <div className="text-white font-semibold mb-1">Air-gap capable</div>
              <div className="text-gray-400 text-xs">
                Runs on a mobile hotspot with no cloud infrastructure. Portable in a briefcase.
                Operational within minutes of typhoon landfall anywhere in HK.
              </div>
            </div>
          </div>
        </div>

        {/* Board 1 Setup Guide */}
        <div className="bg-gray-800/50 border border-cyan-700/40 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Board 1 Setup — Step by Step (When It Arrives)
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            PicoClaw works identically to OpenClaw — Telegram in, Claude API out, response back via Telegram.
            Config is a <code className="bg-gray-800 text-cyan-300 px-1 rounded">.env</code> file instead of <code className="bg-gray-800 text-cyan-300 px-1 rounded">clawdbot.json</code>.
            Version: <span className="text-cyan-400 font-semibold">v0.2.2</span> (released 11 Mar 2026).
          </p>

          <div className="space-y-4">
            {[
              {
                n: "1",
                title: "Physical setup",
                code: null,
                body: "Insert SD card (underside slot). Connect USB-C power. Wait 60 seconds. SD card already flashed with 2026-01-14 firmware.",
              },
              {
                n: "2",
                title: "Find IP address",
                code: null,
                body: "Check router DHCP leases for new device — hostname will be 'licheervnano'. Tell Claude Code the IP and setup continues from there. Recommended: set a static DHCP reservation at 192.168.1.51.",
              },
              {
                n: "3",
                title: "SSH in",
                code: "ssh root@<BOARD_IP>\n# Change the default password immediately after first login:\n# passwd",
              },
              {
                n: "4",
                title: "Install PicoClaw (RISC-V 64-bit)",
                code: "wget https://github.com/sipeed/picoclaw/releases/download/v0.2.2/picoclaw_riscv64.deb\ndpkg -i picoclaw_riscv64.deb\npicoclaw --version",
              },
              {
                n: "5",
                title: "Configure — API keys + Telegram token",
                code: `mkdir -p /etc/picoclaw\ncat > /etc/picoclaw/.env << 'EOF'\nANTHROPIC_API_KEY=your_key_here\nTELEGRAM_BOT_TOKEN=your_telegram_token_here\nTZ=Asia/Hong_Kong\nEOF`,
              },
              {
                n: "6",
                title: "Auto-restart via systemd (mirrors OpenClaw's clawdbot-gateway.service)",
                code: `cat > /etc/systemd/system/picoclaw-grace.service << 'EOF'\n[Unit]\nDescription=PicoClaw Grace Agent\nAfter=network-online.target\n\n[Service]\nWorkingDirectory=/etc/picoclaw\nEnvironmentFile=/etc/picoclaw/.env\nExecStart=/usr/bin/picoclaw start\nRestart=always\nRestartSec=5s\n\n[Install]\nWantedBy=multi-user.target\nEOF\nsystemctl enable --now picoclaw-grace`,
              },
              {
                n: "7",
                title: "Health cron (mirrors Claims-Phoenix crontab)",
                code: `# Auto-restart if service dies\n*/5 * * * * systemctl is-active --quiet picoclaw-grace || systemctl restart picoclaw-grace`,
              },
              {
                n: "8",
                title: "Wire into dashboard — update .env.local on laptop",
                code: "AGENT_MODE=hardware\nGRACE_URL=http://192.168.1.51:8001\n# Swift/Kara/Phoenix/Triage stay in simulation",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-cyan-900/60 border border-cyan-700/50 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
                  <div className="text-xs text-gray-400 mb-2">{step.body}</div>
                  {step.code && (
                    <pre className="bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto leading-relaxed">{step.code}</pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-3 flex-wrap text-sm">
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">
            ← Home
          </Link>
          <Link href="/metrics" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Metrics Dashboard
          </Link>
          <Link href="/simulator" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Scenario Simulator
          </Link>
          <Link href="/architecture" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Architecture
          </Link>
        </div>
      </div>
    </div>
  );
}
