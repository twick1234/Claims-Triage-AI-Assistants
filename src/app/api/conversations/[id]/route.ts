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

// Allowlist of fields an operator may update via PATCH
const PATCHABLE_FIELDS = new Set(['status', 'notes', 'priority', 'currentAgent'] as const);
type PatchableField = 'status' | 'notes' | 'priority' | 'currentAgent';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conversation = store.conversations.get(params.id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Only apply explicitly allowed fields to prevent arbitrary property injection
  for (const key of Object.keys(body)) {
    if (PATCHABLE_FIELDS.has(key as PatchableField)) {
      (conversation as Record<string, unknown>)[key] = body[key];
    }
  }

  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
