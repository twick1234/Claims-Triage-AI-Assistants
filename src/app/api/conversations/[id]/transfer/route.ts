import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { AgentId, Message, ConversationStatus } from '@/lib/types';

import { randomUUID } from 'crypto';
function uuid() {
  return randomUUID();
}

const STATUS_MAP: Record<AgentId, ConversationStatus> = {
  triage: 'triaging',
  grace: 'with-grace',
  swift: 'with-swift',
  kara: 'with-kara',
  phoenix: 'with-phoenix',
  human: 'human-queue',
};

const AGENT_LABELS: Record<AgentId, string> = {
  triage: 'Triage',
  grace: 'Grace 💙',
  swift: 'Swift ⚡',
  kara: 'Kara 📚',
  phoenix: 'Phoenix 🔥',
  human: 'a Human Agent 👤',
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conversation = store.conversations.get(params.id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { toAgent, reason } = await request.json();
  const validAgents: AgentId[] = ['triage', 'grace', 'swift', 'kara', 'phoenix', 'human'];
  if (!validAgents.includes(toAgent)) {
    return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
  }
  const agent = toAgent as AgentId;
  // Strip control characters from reason to prevent SSE protocol injection
  const safeReason = typeof reason === 'string'
    ? reason.replace(/[\r\n\x00-\x1f]/g, ' ').slice(0, 200)
    : undefined;

  // Add system message about transfer
  const sysMsg: Message = {
    id: uuid(),
    conversationId: params.id,
    role: 'system',
    content: `Transferred to ${AGENT_LABELS[agent]}${safeReason ? ` — ${safeReason}` : ''}`,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(sysMsg);
  conversation.currentAgent = agent;
  conversation.status = STATUS_MAP[agent] ?? 'triaging';

  if (agent === 'human') {
    conversation.metrics.waitTimeMs = Date.now() - new Date(conversation.metrics.startedAt).getTime();
  }

  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);
  broadcast('queue_updated', { queueDepth: Array.from(store.conversations.values()).filter((c) => c.status === 'human-queue').length });

  return NextResponse.json(conversation);
}
