import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { SCENARIOS } from '@/lib/knowledge/scenarios';
import { Conversation } from '@/lib/types';

function uuid() {
  return crypto.randomUUID();
}

export async function GET() {
  return NextResponse.json(SCENARIOS);
}

export async function POST(request: Request) {
  const { scenarioId } = await request.json();
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });

  const conversationId = uuid();
  const conversation: Conversation = {
    id: conversationId,
    customerId: uuid(),
    customerName: scenario.customerName,
    status: 'triaging',
    currentAgent: 'triage',
    messages: [],
    routing: [],
    priority: 'PENDING',
    metrics: {
      startedAt: new Date().toISOString(),
      agentTurns: {},
    },
    language: scenario.language,
    scenarioId: scenario.id,
  };

  store.conversations.set(conversationId, conversation);
  broadcast('conversation_created', conversation);

  return NextResponse.json({ conversationId, scenario });
}

export async function DELETE() {
  // Clear all simulator conversations
  const toDelete = Array.from(store.conversations.entries())
    .filter(([, c]) => c.scenarioId)
    .map(([id]) => id);

  toDelete.forEach((id) => store.conversations.delete(id));
  broadcast('queue_updated', { cleared: true });

  return NextResponse.json({ deleted: toDelete.length });
}
