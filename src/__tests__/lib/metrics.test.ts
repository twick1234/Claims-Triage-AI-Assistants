/**
 * Tests for metrics calculations.
 *
 * These tests exercise the logic used to compute MetricsSnapshot values
 * from a collection of Conversation objects — matching the logic in
 * src/app/api/metrics/route.ts and src/lib/metrics/*.
 */

import type { Conversation, AgentId } from '@/lib/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeConv(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: Math.random().toString(36).slice(2),
    customerId: 'cust-x',
    customerName: 'Test',
    status: 'triaging',
    currentAgent: 'triage',
    messages: [],
    routing: [],
    priority: 'MEDIUM',
    metrics: {
      startedAt: new Date().toISOString(),
      agentTurns: {},
    },
    language: 'en',
    ...overrides,
  };
}

// ── SLA breach: first response > 2 minutes = breach ──────────────────────────

function isSlaBreach(conv: Conversation): boolean {
  if (!conv.metrics.firstResponseAt) return false;
  const start = new Date(conv.metrics.startedAt).getTime();
  const first = new Date(conv.metrics.firstResponseAt).getTime();
  return first - start > 2 * 60 * 1000;
}

describe('SLA breach detection', () => {
  it('marks a response within 2 minutes as NO breach', () => {
    const now = Date.now();
    const conv = makeConv({
      metrics: {
        startedAt: new Date(now - 90 * 1000).toISOString(),   // 90 s ago
        firstResponseAt: new Date(now - 30 * 1000).toISOString(), // 60 s later
        agentTurns: {},
      },
    });
    expect(isSlaBreach(conv)).toBe(false);
  });

  it('marks a response over 2 minutes as SLA breach', () => {
    const now = Date.now();
    const conv = makeConv({
      metrics: {
        startedAt: new Date(now - 5 * 60 * 1000).toISOString(),
        firstResponseAt: new Date(now - 2 * 60 * 1000).toISOString(), // 3 min later
        agentTurns: {},
      },
    });
    expect(isSlaBreach(conv)).toBe(true);
  });

  it('no firstResponseAt = no breach (response pending)', () => {
    const conv = makeConv();
    expect(isSlaBreach(conv)).toBe(false);
  });

  it('exactly 2 minutes is not a breach', () => {
    const now = Date.now();
    const conv = makeConv({
      metrics: {
        startedAt: new Date(now - 4 * 60 * 1000).toISOString(),
        firstResponseAt: new Date(now - 2 * 60 * 1000).toISOString(), // exactly 2 min
        agentTurns: {},
      },
    });
    expect(isSlaBreach(conv)).toBe(false);
  });
});

// ── First Contact Resolution ──────────────────────────────────────────────────

function firstContactResolutionRate(conversations: Conversation[]): number {
  if (conversations.length === 0) return 0;
  const resolved = conversations.filter(
    (c) => c.status === 'resolved' && c.currentAgent !== 'human'
  );
  return resolved.length / conversations.length;
}

describe('First contact resolution calculation', () => {
  it('returns 0 for empty list', () => {
    expect(firstContactResolutionRate([])).toBe(0);
  });

  it('returns 1.0 when all are resolved by AI', () => {
    const convs = [
      makeConv({ status: 'resolved', currentAgent: 'grace' }),
      makeConv({ status: 'resolved', currentAgent: 'kara' }),
    ];
    expect(firstContactResolutionRate(convs)).toBe(1.0);
  });

  it('excludes human-resolved from FCR', () => {
    const convs = [
      makeConv({ status: 'resolved', currentAgent: 'human' }),
      makeConv({ status: 'resolved', currentAgent: 'kara' }),
    ];
    expect(firstContactResolutionRate(convs)).toBe(0.5);
  });

  it('active conversations reduce FCR rate', () => {
    const convs = [
      makeConv({ status: 'resolved', currentAgent: 'swift' }),
      makeConv({ status: 'with-grace', currentAgent: 'grace' }),
      makeConv({ status: 'with-kara', currentAgent: 'kara' }),
    ];
    expect(firstContactResolutionRate(convs)).toBeCloseTo(1 / 3);
  });
});

// ── Agent Utilization ─────────────────────────────────────────────────────────

type AgentUtilization = Partial<Record<AgentId, number>>;

function computeAgentUtilization(conversations: Conversation[]): AgentUtilization {
  const counts: Partial<Record<AgentId, number>> = {};
  conversations.forEach((c) => {
    if (c.currentAgent !== 'triage' && c.currentAgent !== 'human') {
      counts[c.currentAgent] = (counts[c.currentAgent] ?? 0) + 1;
    }
  });
  return counts;
}

describe('Agent utilization calculation', () => {
  it('counts active conversations per agent', () => {
    const convs = [
      makeConv({ currentAgent: 'grace' }),
      makeConv({ currentAgent: 'grace' }),
      makeConv({ currentAgent: 'swift' }),
    ];
    const util = computeAgentUtilization(convs);
    expect(util.grace).toBe(2);
    expect(util.swift).toBe(1);
  });

  it('excludes triage and human from utilization', () => {
    const convs = [
      makeConv({ currentAgent: 'triage' }),
      makeConv({ currentAgent: 'human' }),
    ];
    const util = computeAgentUtilization(convs);
    expect(util.triage).toBeUndefined();
    expect(util.human).toBeUndefined();
  });

  it('returns empty object for empty list', () => {
    expect(computeAgentUtilization([])).toEqual({});
  });
});

// ── tNPS Averaging ────────────────────────────────────────────────────────────

function avgTNPS(conversations: Conversation[]): number {
  const scored = conversations.filter((c) => c.metrics.tNPS !== undefined);
  if (scored.length === 0) return 0;
  const sum = scored.reduce((acc, c) => acc + (c.metrics.tNPS ?? 0), 0);
  return sum / scored.length;
}

describe('tNPS averaging', () => {
  it('returns 0 when no scores', () => {
    expect(avgTNPS([makeConv(), makeConv()])).toBe(0);
  });

  it('calculates average correctly', () => {
    const convs = [
      makeConv({ metrics: { startedAt: new Date().toISOString(), agentTurns: {}, tNPS: 9 } }),
      makeConv({ metrics: { startedAt: new Date().toISOString(), agentTurns: {}, tNPS: 7 } }),
      makeConv({ metrics: { startedAt: new Date().toISOString(), agentTurns: {}, tNPS: 8 } }),
    ];
    expect(avgTNPS(convs)).toBeCloseTo(8.0);
  });

  it('ignores conversations without tNPS score', () => {
    const convs = [
      makeConv({ metrics: { startedAt: new Date().toISOString(), agentTurns: {}, tNPS: 10 } }),
      makeConv(), // no tNPS
    ];
    expect(avgTNPS(convs)).toBe(10);
  });
});
