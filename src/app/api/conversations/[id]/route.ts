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
  // Allowlist only the fields operators are permitted to update — never merge
  // arbitrary caller-supplied keys directly onto the conversation object.
  const { status, metrics } = body ?? {};
  const allowedStatuses = ['triaging','with-grace','with-swift','with-kara','with-phoenix','human-queue','human-active','resolved'];
  if (status !== undefined && allowedStatuses.includes(status)) {
    conversation.status = status;
  }
  if (metrics?.resolvedAt !== undefined) {
    conversation.metrics.resolvedAt = metrics.resolvedAt;
  }
  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
