import Link from "next/link";

type Tag = "Telegram" | "Hardware" | "AI" | "Web";

interface Card {
  title: string;
  description?: string;
  tags?: Tag[];
}

interface Column {
  label: string;
  accent: string;
  headerColor: string;
  cardBg: string;
  cardBorder: string;
  dotColor: string;
  cards: Card[];
}

const TAG_STYLES: Record<Tag, string> = {
  Telegram: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  Hardware: "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50",
  AI:       "bg-violet-900/60 text-violet-300 border border-violet-700/50",
  Web:      "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
};

const COLUMNS: Column[] = [
  {
    label: "Done",
    accent: "border-t-green-600",
    headerColor: "text-green-400",
    cardBg: "bg-green-900/10",
    cardBorder: "border-green-700/20 hover:border-green-600/40",
    dotColor: "bg-green-500",
    cards: [
      {
        title: "Next.js 5-agent app",
        description: "Simulation mode, all agents in-process, triage routing, SSE real-time updates",
        tags: ["Web"],
      },
      {
        title: "Triage routing (sticky)",
        description: "LLM routes on first message only, stays with assigned agent",
        tags: ["AI"],
      },
      {
        title: "Human queue + auto-reply",
        description: "Operator view with Claude-simulated customer responses",
        tags: ["Web"],
      },
      {
        title: "Architecture page",
        description: "Full conceptual/logical/physical design documentation",
        tags: ["Web"],
      },
      {
        title: "PicoClaw on laptop",
        description: "v0.2.2 installed, OAuth auth via claude.ai subscription",
        tags: ["Telegram"],
      },
      {
        title: "@ChuGrace_bot live",
        description: "Grace empathy agent on Telegram, running on laptop",
        tags: ["Telegram", "AI"],
      },
      {
        title: "@ChuTriage_bot live",
        description: "Routes incoming messages to right specialist bot",
        tags: ["Telegram", "AI"],
      },
      {
        title: "@ChuSwift_bot live",
        description: "Fast-track claims specialist on Telegram",
        tags: ["Telegram", "AI"],
      },
      {
        title: "@ChuKaraKara_bot live",
        description: "Policy FAQ specialist on Telegram",
        tags: ["Telegram", "AI"],
      },
      {
        title: "Context handoff",
        description: "Triage passes [Context:] brief to specialist, no repeat",
        tags: ["Telegram", "AI"],
      },
    ],
  },
  {
    label: "In Progress",
    accent: "border-t-amber-500",
    headerColor: "text-amber-400",
    cardBg: "bg-amber-900/10",
    cardBorder: "border-amber-700/20 hover:border-amber-600/40",
    dotColor: "bg-amber-400",
    cards: [
      {
        title: "@ChuPhoenix_bot",
        description: "BotFather rate-limited, token pending. Escalation/anger specialist.",
        tags: ["Telegram"],
      },
      {
        title: "Board #1 hardware",
        description: "Sipeed LicheeRV Nano W ordered, arriving 19–27 Mar 2026. Grace first.",
        tags: ["Hardware"],
      },
    ],
  },
  {
    label: "Up Next",
    accent: "border-t-blue-500",
    headerColor: "text-blue-400",
    cardBg: "bg-blue-900/10",
    cardBorder: "border-blue-700/20 hover:border-blue-600/40",
    dotColor: "bg-blue-400",
    cards: [
      {
        title: "Board #1 — Grace on hardware",
        description: "Flash SD, SSH, install picoclaw_riscv64.deb, configure @ChuGrace_bot, systemd service",
        tags: ["Hardware"],
      },
      {
        title: "Board #2 — Swift on hardware",
        description: "Repeat pattern for Swift after Grace validated",
        tags: ["Hardware"],
      },
      {
        title: "@ChuPhoenix_bot setup",
        description: "Complete once BotFather allows new bot creation",
        tags: ["Telegram", "AI"],
      },
      {
        title: "Vercel demo polish",
        description: "Keep Vercel as presentation layer, ensure all architecture docs are current",
        tags: ["Web"],
      },
    ],
  },
  {
    label: "Backlog",
    accent: "border-t-gray-600",
    headerColor: "text-gray-400",
    cardBg: "bg-gray-800/30",
    cardBorder: "border-gray-700/30 hover:border-gray-600/50",
    dotColor: "bg-gray-500",
    cards: [
      {
        title: "Boards 3–5 hardware",
        description: "Kara, Phoenix, Triage on dedicated boards. ~$60 additional hardware.",
        tags: ["Hardware"],
      },
      {
        title: "Persistent storage",
        description: "Replace in-memory store with SQLite or Postgres for demo durability",
        tags: ["Web"],
      },
      {
        title: "Telegram → dashboard bridge",
        description: "Show Telegram conversations in the web dashboard in real time",
        tags: ["Telegram", "Web"],
      },
      {
        title: "Multi-region resilience",
        description: "Run boards on mobile hotspot, fully air-gapped from cloud",
        tags: ["Hardware"],
      },
      {
        title: "MarksPersonalAssistant",
        description: "Separate repo: PicoClawBot on Board #1 as personal assistant",
        tags: ["Hardware"],
      },
    ],
  },
];

function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TAG_STYLES[tag]}`}>
      {tag}
    </span>
  );
}

function KanbanCard({ card, cardBg, cardBorder }: { card: Card; cardBg: string; cardBorder: string }) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 cursor-default group ${cardBg} ${cardBorder}`}
    >
      <p className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-white/90">
        {card.title}
      </p>
      {card.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-3">{card.description}</p>
      )}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span className="text-base leading-none">←</span>
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-gray-700 shrink-0" />
          <h1 className="text-base font-bold text-white tracking-tight">Project Kanban</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">Claims Triage AI Assistants</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col gap-3">
              {/* Column header */}
              <div
                className={`bg-gray-900 border border-gray-800 border-t-2 ${col.accent} rounded-xl px-4 py-3 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className={`text-sm font-bold ${col.headerColor}`}>{col.label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {col.cards.map((card) => (
                  <KanbanCard
                    key={card.title}
                    card={card}
                    cardBg={col.cardBg}
                    cardBorder={col.cardBorder}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Telegram
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              Hardware
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              AI
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Web
            </span>
          </div>
          <p className="text-xs text-gray-600">Last updated: March 2026</p>
        </div>
      </div>
    </div>
  );
}
