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

  // Allowlist prevents mass-assignment — only operator-safe fields may be patched.
  const PATCHABLE: Array<keyof typeof conversation> = ['status', 'priority', 'language'];
  for (const key of PATCHABLE) {
    if (key in body) (conversation as Record<string, unknown>)[key] = body[key];
  }

  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
