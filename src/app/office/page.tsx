"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface AgentStats {
  count: number;
  lastMessage: string | null;
  lastActivity: string | null;
}

interface OfficeData {
  agents: Record<string, AgentStats>;
  stats: { total: number; humanQueue: number; resolved: number };
  timestamp: string;
}

const AGENTS = [
  {
    id: "triage",
    name: "Triage",
    role: "Router",
    emoji: "🎯",
    color: "#8B5CF6",
    glow: "shadow-violet-500/50",
    border: "border-violet-500/40",
    bg: "bg-violet-900/20",
    screen: "from-violet-950 to-violet-900",
    dot: "bg-violet-400",
    telegram: "@ChuTriage_bot",
  },
  {
    id: "grace",
    name: "Grace",
    role: "Empathy Specialist",
    emoji: "💙",
    color: "#3B82F6",
    glow: "shadow-blue-500/50",
    border: "border-blue-500/40",
    bg: "bg-blue-900/20",
    screen: "from-blue-950 to-blue-900",
    dot: "bg-blue-400",
    telegram: "@ChuGrace_bot",
  },
  {
    id: "swift",
    name: "Swift",
    role: "Fast-Track Claims",
    emoji: "⚡",
    color: "#F59E0B",
    glow: "shadow-amber-500/50",
    border: "border-amber-500/40",
    bg: "bg-amber-900/20",
    screen: "from-amber-950 to-amber-900",
    dot: "bg-amber-400",
    telegram: "@ChuSwift_bot",
  },
  {
    id: "kara",
    name: "Kara",
    role: "Knowledge & FAQ",
    emoji: "📚",
    color: "#10B981",
    glow: "shadow-emerald-500/50",
    border: "border-emerald-500/40",
    bg: "bg-emerald-900/20",
    screen: "from-emerald-950 to-emerald-900",
    dot: "bg-emerald-400",
    telegram: "@ChuKaraKara_bot",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    role: "Escalation Handler",
    emoji: "🔥",
    color: "#EF4444",
    glow: "shadow-red-500/50",
    border: "border-red-500/40",
    bg: "bg-red-900/20",
    screen: "from-red-950 to-red-900",
    dot: "bg-red-400",
    telegram: "@ChuPhoenix_bot",
  },
  {
    id: "human",
    name: "Human Agent",
    role: "Operator Queue",
    emoji: "👤",
    color: "#6B7280",
    glow: "shadow-gray-500/30",
    border: "border-gray-600/40",
    bg: "bg-gray-800/40",
    screen: "from-gray-900 to-gray-800",
    dot: "bg-gray-400",
    telegram: "",
  },
];

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-HK", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Hong_Kong",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-green-400 text-sm">{time} HKT</span>;
}

function StatusDot({ active, busy }: { active: boolean; busy: boolean }) {
  if (busy)
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
    );
  if (active)
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    );
  return <span className="inline-block w-2 h-2 rounded-full bg-gray-600" />;
}

function AgentDesk({
  agent,
  stats,
}: {
  agent: (typeof AGENTS)[0];
  stats: AgentStats | undefined;
}) {
  const count = stats?.count ?? 0;
  const active = count > 0;
  const busy = count > 1;
  const lastMsg = stats?.lastMessage;

  const statusLabel = busy ? "BUSY" : active ? "RESPONDING" : "IDLE";
  const statusColor = busy
    ? "text-red-400"
    : active
      ? "text-green-400"
      : "text-gray-600";

  return (
    <div
      className={`relative rounded-2xl border ${agent.border} ${agent.bg} p-4 flex flex-col gap-3 transition-all duration-500 ${
        active ? `shadow-lg ${agent.glow}` : ""
      }`}
    >
      {/* Conversation count badge */}
      {count > 0 && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: agent.color }}
        >
          {count}
        </div>
      )}

      {/* Monitor screen */}
      <div
        className={`rounded-xl bg-gradient-to-b ${agent.screen} border border-white/5 p-3 min-h-[90px] flex flex-col justify-between relative overflow-hidden`}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          }}
        />

        {/* Screen content */}
        <div className="relative z-10">
          {active ? (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.color }}
                />
                <span
                  className="text-xs font-mono font-semibold"
                  style={{ color: agent.color }}
                >
                  {count} ACTIVE
                </span>
              </div>
              {lastMsg && (
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 font-mono">
                  {lastMsg}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[60px]">
              <span className="text-xs text-gray-600 font-mono tracking-widest">
                — STANDBY —
              </span>
            </div>
          )}
        </div>

        {/* Typing indicator */}
        {active && (
          <div className="relative z-10 flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: agent.color,
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Character + status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-3xl leading-none"
            style={{
              display: "inline-block",
              animation: active
                ? "agentType 0.4s ease-in-out infinite alternate"
                : "agentIdle 3s ease-in-out infinite",
            }}
          >
            {agent.emoji}
          </span>
          <div>
            <div className="text-sm font-bold text-white">{agent.name}</div>
            <div className="text-xs text-gray-500">{agent.role}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <StatusDot active={active} busy={busy} />
            <span className={`text-xs font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          {agent.telegram && (
            <span className="text-xs text-gray-600 font-mono">
              {agent.telegram}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OfficePage() {
  const [data, setData] = useState<OfficeData | null>(null);
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/office");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPulse(true);
        setTimeout(() => setPulse(false), 400);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 3000);

    // Also listen for SSE to trigger faster refreshes
    const evtSource = new EventSource("/api/stream");
    evtSource.addEventListener("conversation_update", () => fetchData());
    evtSource.addEventListener("new_message", () => fetchData());

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      evtSource.close();
    };
  }, []);

  const stats = data?.stats;
  const agentData = data?.agents ?? {};
  const totalActive = Object.values(agentData).reduce(
    (sum, a) => sum + a.count,
    0
  );

  // Split agents: triage row, specialists row, human row
  const triageAgent = AGENTS.find((a) => a.id === "triage")!;
  const specialists = AGENTS.filter(
    (a) => a.id !== "triage" && a.id !== "human"
  );
  const humanAgent = AGENTS.find((a) => a.id === "human")!;

  return (
    <>
      <style>{`
        @keyframes agentIdle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes agentType {
          0% { transform: translateX(-1px) rotate(-3deg); }
          100% { transform: translateX(1px) rotate(3deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          96% { opacity: 0.9; }
          97% { opacity: 1; }
        }
      `}</style>

      <div
        className="min-h-screen bg-gray-950"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(30,20,60,0.6) 0%, transparent 60%)",
        }}
      >
        {/* Header */}
        <div
          className="bg-gray-900/80 border-b border-gray-800 px-6 py-3 sticky top-0 z-10 backdrop-blur"
          style={{ animation: "flicker 8s infinite" }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-300 text-sm"
              >
                ←
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <h1 className="text-base font-bold text-white tracking-wider uppercase">
                    Chubb Claims — Operations Room
                  </h1>
                </div>
                <p className="text-xs text-gray-500">
                  Typhoon Season 2026 · AI Agent Command Centre
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Clock />
              <div
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  pulse
                    ? "bg-green-900/50 border-green-600 text-green-300"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}
              >
                ● LIVE
              </div>
            </div>
          </div>
        </div>

        {/* Stats ticker */}
        <div className="border-b border-gray-800/60 bg-gray-900/40">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-8 text-sm">
            {[
              {
                label: "ACTIVE CASES",
                value: totalActive,
                color: "text-green-400",
              },
              {
                label: "HUMAN QUEUE",
                value: stats?.humanQueue ?? 0,
                color:
                  (stats?.humanQueue ?? 0) > 0
                    ? "text-amber-400"
                    : "text-gray-500",
              },
              {
                label: "TOTAL TODAY",
                value: stats?.total ?? 0,
                color: "text-gray-300",
              },
              {
                label: "RESOLVED",
                value: stats?.resolved ?? 0,
                color: "text-gray-500",
              },
              {
                label: "AGENTS ONLINE",
                value: "4 / 5",
                color: "text-blue-400",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-gray-600 text-xs tracking-widest">
                  {stat.label}
                </span>
                <span className={`font-bold font-mono ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Office floor */}
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Floor label */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <span className="text-xs text-gray-600 uppercase tracking-widest font-mono">
              Operations Floor
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* Triage — top, full width */}
          <div className="max-w-sm mx-auto">
            <div className="text-xs text-center text-gray-600 font-mono uppercase tracking-wider mb-2">
              Triage Coordinator
            </div>
            <AgentDesk agent={triageAgent} stats={agentData["triage"]} />
          </div>

          {/* Arrow down */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-6 bg-gradient-to-b from-violet-500/50 to-transparent" />
              <div className="text-gray-700 text-xs">routes to</div>
              <div className="flex gap-12 text-gray-700">
                <span>↙</span>
                <span>↓</span>
                <span>↓</span>
                <span>↓</span>
                <span>↘</span>
              </div>
            </div>
          </div>

          {/* Specialists — row */}
          <div>
            <div className="text-xs text-center text-gray-600 font-mono uppercase tracking-wider mb-2">
              Specialist Agents
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {specialists.map((agent) => (
                <AgentDesk
                  key={agent.id}
                  agent={agent}
                  stats={agentData[agent.id]}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            <span className="text-xs text-gray-700 uppercase tracking-widest font-mono">
              Escalation
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
          </div>

          {/* Human queue */}
          <div className="max-w-sm">
            <div className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-2">
              Human Agent Queue
            </div>
            <AgentDesk agent={humanAgent} stats={agentData["human"]} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 pt-4 border-t border-gray-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              Idle — no active cases
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Responding — 1 active case
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Busy — 2+ active cases
            </div>
            <div className="ml-auto flex gap-3">
              <Link
                href="/triage"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Triage Dashboard →
              </Link>
              <Link
                href="/chat"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Start Conversation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
