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

  // Only allow patching mutable, non-sensitive fields to prevent
  // unauthorized modification of id, currentAgent, routing, metrics, etc.
  const ALLOWED_PATCH_FIELDS = ['status', 'priority', 'operatorId', 'language'] as const;
  type AllowedField = typeof ALLOWED_PATCH_FIELDS[number];
  for (const field of ALLOWED_PATCH_FIELDS) {
    if (field in body) {
      (conversation as Record<string, unknown>)[field] = (body as Record<AllowedField, unknown>)[field];
    }
  }
  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
