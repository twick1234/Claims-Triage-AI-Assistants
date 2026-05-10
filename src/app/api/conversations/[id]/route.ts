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
  // Only allow patching safe, non-sensitive fields
  const ALLOWED_PATCH_FIELDS = ['status', 'priority'] as const;
  type AllowedField = (typeof ALLOWED_PATCH_FIELDS)[number];
  const patch: Partial<Record<AllowedField, unknown>> = {};
  for (const key of ALLOWED_PATCH_FIELDS) {
    if (key in body) patch[key] = body[key];
  }
  Object.assign(conversation, patch);
  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
