import { NextResponse } from 'next/server';
import { computeMetrics } from '@/lib/metrics/tracker';

export async function GET() {
  const metrics = computeMetrics();
  return NextResponse.json(metrics);
}
