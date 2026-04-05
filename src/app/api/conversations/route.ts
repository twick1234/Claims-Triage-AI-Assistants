import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { Conversation } from '@/lib/types';

function uuid() {
  return crypto.randomUUID();
}

export async function GET() {
  const conversations = Array.from(store.conversations.values()).sort(
    (a, b) => new Date(b.metrics.startedAt).getTime() - new Date(a.metrics.startedAt).getTime()
  );
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { customerName, language = 'en' } = body;

  const id = uuid();
  const conversation: Conversation = {
    id,
    customerId: uuid(),
    customerName: customerName || 'Customer',
    status: 'triaging',
    currentAgent: 'triage',
    messages: [],
    routing: [],
    priority: 'PENDING',
    metrics: {
      startedAt: new Date().toISOString(),
      agentTurns: {},
    },
    language,
  };

  store.conversations.set(id, conversation);
  broadcast('conversation_created', conversation);

  return NextResponse.json(conversation, { status: 201 });
}
