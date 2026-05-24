import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';

export async function POST(request: Request) {
  const body = await request.json();
  const { conversationId, operatorId = 'operator-1' } = body;

  if (!conversationId || typeof conversationId !== 'string') {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }
  if (typeof operatorId !== 'string' || operatorId.length > 100) {
    return NextResponse.json({ error: 'Invalid operatorId' }, { status: 400 });
  }

  const conversation = store.conversations.get(conversationId);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (conversation.status !== 'human-queue') {
    return NextResponse.json({ error: 'Conversation not in queue' }, { status: 400 });
  }

  conversation.status = 'human-active';
  conversation.operatorId = operatorId;
  store.conversations.set(conversationId, conversation);

  broadcast('conversation_updated', conversation);
  broadcast('queue_updated', {
    queueDepth: Array.from(store.conversations.values()).filter((c) => c.status === 'human-queue').length,
  });

  return NextResponse.json(conversation);
}
