import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const conversations = Array.from(store.conversations.values());

  const agentIds = ["triage", "grace", "swift", "kara", "phoenix"] as const;

  const agents: Record<
    string,
    { count: number; lastMessage: string | null; lastActivity: string | null }
  > = {};

  for (const id of agentIds) {
    const convs = conversations.filter((c) => c.currentAgent === id);
    const msgs = convs
      .flatMap((c) => c.messages)
      .filter((m) => m.role === "agent")
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    agents[id] = {
      count: convs.length,
      lastMessage: msgs[0]?.content?.slice(0, 100) ?? null,
      lastActivity: msgs[0]?.timestamp ?? null,
    };
  }

  const humanConvs = conversations.filter(
    (c) => c.status === "human-queue" || c.status === "human-active"
  );
  agents["human"] = {
    count: humanConvs.length,
    lastMessage:
      humanConvs[0]?.messages
        ?.filter((m) => m.role === "customer")
        ?.slice(-1)[0]
        ?.content?.slice(0, 100) ?? null,
    lastActivity: null,
  };

  return NextResponse.json({
    agents,
    stats: {
      total: conversations.length,
      humanQueue: conversations.filter((c) => c.status === "human-queue")
        .length,
      resolved: conversations.filter((c) => c.status === "resolved").length,
    },
    timestamp: new Date().toISOString(),
  });
}
