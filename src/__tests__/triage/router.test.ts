/**
 * Tests for src/lib/triage/router.ts
 *
 * These tests cover the hard-coded override paths synchronously —
 * they do not hit the LLM (runTriageAgent is mocked away).
 */

import type { Conversation, AgentId } from '@/lib/types';

// Mock the LLM triage agent so tests run without network calls
jest.mock('@/lib/agents/triage-agent', () => ({
  runTriageAgent: jest.fn().mockResolvedValue({
    agent: 'kara',
    reasoning: 'mock LLM decision',
    confidence: 0.8,
    triggers: ['mock'],
  }),
}));

import { routeConversation } from '@/lib/triage/router';

function makeConversation(
  content: string,
  currentAgent: AgentId = 'triage',
  agentTurns: Partial<Record<AgentId, number>> = {}
): Conversation {
  return {
    id: 'test-conv',
    customerId: 'cust-test',
    customerName: 'Test Customer',
    status: 'triaging',
    currentAgent,
    messages: [
      {
        id: 'msg-1',
        conversationId: 'test-conv',
        role: 'customer',
        content,
        timestamp: new Date().toISOString(),
      },
    ],
    routing: [],
    priority: 'MEDIUM',
    metrics: {
      startedAt: new Date().toISOString(),
      agentTurns,
    },
    language: 'en',
  };
}

describe('routeConversation — hard-coded overrides', () => {
  it('routes "lawyer" trigger → phoenix', async () => {
    const conv = makeConversation('I am going to call my lawyer about this.');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('phoenix');
    expect(result.decision.triggers).toContain('legal threat');
  });

  it('routes "sue" trigger → phoenix', async () => {
    const conv = makeConversation('I will sue you if this is not resolved today.');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('phoenix');
  });

  it('routes "真人" trigger → human', async () => {
    const conv = makeConversation('我想找真人幫我。');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('human');
    expect(result.decision.triggers).toContain('human requested');
  });

  it('routes "real person" request → human', async () => {
    const conv = makeConversation('I want to speak to a real person please.');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('human');
  });

  it('routes after turn limit (3+ turns same agent) → human queue', async () => {
    const conv = makeConversation(
      'I still need more help',
      'grace',
      { grace: 3 }
    );
    const result = await routeConversation(conv);
    expect(result.agent).toBe('human');
    expect(result.decision.triggers).toContain('turn limit');
  });

  it('does NOT escalate if turns < 3', async () => {
    const conv = makeConversation('Thanks for your help', 'grace', { grace: 2 });
    const result = await routeConversation(conv);
    // Falls through to LLM mock which returns 'kara'
    expect(result.agent).toBe('kara');
  });

  it('routes "my grandmother" through LLM (no hard override)', async () => {
    const conv = makeConversation('My grandmother is very scared about the flood damage.');
    const result = await routeConversation(conv);
    // No hard override matches — falls through to LLM mock
    expect(result.agent).toBe('kara'); // mock returns kara
  });

  it('routes "car crushed" through LLM (no hard override)', async () => {
    const conv = makeConversation('A tree fell and my car is completely crushed.');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('kara'); // mock returns kara
  });

  it('routes "what is my excess" through LLM (no hard override)', async () => {
    const conv = makeConversation('What is my excess for water damage claims?');
    const result = await routeConversation(conv);
    expect(result.agent).toBe('kara'); // mock returns kara
  });

  it('legal keyword takes precedence over turn limit', async () => {
    const conv = makeConversation(
      'I am calling my lawyer right now',
      'grace',
      { grace: 5 }
    );
    const result = await routeConversation(conv);
    // Legal override fires first before turn limit check
    expect(result.agent).toBe('phoenix');
  });
});
