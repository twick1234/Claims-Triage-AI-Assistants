import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { AgentId, Message, ConversationStatus } from '@/lib/types';

function uuid() {
  return crypto.randomUUID();
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
  const agent = toAgent as AgentId;

  // Add system message about transfer
  const sysMsg: Message = {
    id: uuid(),
    conversationId: params.id,
    role: 'system',
    content: `Transferred to ${AGENT_LABELS[agent]}${reason ? ` — ${reason}` : ''}`,
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
