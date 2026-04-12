import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const conversation = store.conversations.get(params.id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(conversation);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conversation = store.conversations.get(params.id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  // Allowlist only safe mutable fields — never use Object.assign with raw request body
  const { status, priority, currentAgent } = body as { status?: string; priority?: string; currentAgent?: string };
  if (status !== undefined) conversation.status = status as typeof conversation.status;
  if (priority !== undefined) conversation.priority = priority as typeof conversation.priority;
  if (currentAgent !== undefined) conversation.currentAgent = currentAgent as typeof conversation.currentAgent;
  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
