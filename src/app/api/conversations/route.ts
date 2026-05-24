import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { Conversation } from '@/lib/types';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET() {
  const conversations = Array.from(store.conversations.values()).sort(
    (a, b) => new Date(b.metrics.startedAt).getTime() - new Date(a.metrics.startedAt).getTime()
  );
  return NextResponse.json(conversations);
}

const VALID_LANGUAGES = ['en', 'zh'] as const;
type ValidLanguage = (typeof VALID_LANGUAGES)[number];

export async function POST(request: Request) {
  const body = await request.json();
  const { customerName, language = 'en' } = body;

  // Validate inputs
  if (customerName !== undefined && typeof customerName !== 'string') {
    return NextResponse.json({ error: 'customerName must be a string' }, { status: 400 });
  }
  if (typeof customerName === 'string' && customerName.length > 200) {
    return NextResponse.json({ error: 'customerName too long' }, { status: 400 });
  }
  if (!VALID_LANGUAGES.includes(language as ValidLanguage)) {
    return NextResponse.json({ error: 'Invalid language — must be "en" or "zh"' }, { status: 400 });
  }

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
