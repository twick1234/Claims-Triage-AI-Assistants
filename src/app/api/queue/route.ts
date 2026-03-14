import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const queue = Array.from(store.conversations.values())
    .filter((c) => c.status === 'human-queue')
    .sort((a, b) => (b.metrics.waitTimeMs ?? 0) - (a.metrics.waitTimeMs ?? 0));
  return NextResponse.json(queue);
}
