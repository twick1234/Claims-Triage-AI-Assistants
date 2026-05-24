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

// Allowlist of fields that may be updated via PATCH.
// Using Object.assign(conversation, body) would allow a caller to overwrite
// any field (id, customerId, messages, routing, metrics…) — a mass-assignment
// vulnerability.  Only status and priority are legitimately patchable from
// the UI (operator resolves a conversation or changes priority).
const PATCHABLE_FIELDS = ['status', 'priority'] as const;
type PatchableField = (typeof PATCHABLE_FIELDS)[number];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const conversation = store.conversations.get(params.id);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();

  // Only apply explicitly whitelisted fields — reject everything else.
  const unknownFields = Object.keys(body).filter(
    (k) => !PATCHABLE_FIELDS.includes(k as PatchableField)
  );
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Field(s) not patchable: ${unknownFields.join(', ')}` },
      { status: 400 }
    );
  }

  if ('status' in body) conversation.status = body.status;
  if ('priority' in body) conversation.priority = body.priority;

  store.conversations.set(params.id, conversation);
  broadcast('conversation_updated', conversation);

  return NextResponse.json(conversation);
}
