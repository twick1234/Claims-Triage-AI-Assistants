/**
 * Tests for src/lib/store.ts
 *
 * The store module seeds itself on import with 4 demo conversations.
 * We test get/add/update operations and verify the seeded state.
 */

import { store } from '@/lib/store';
import type { Conversation } from '@/lib/types';

function makeConversation(id: string): Conversation {
  return {
    id,
    customerId: `cust-${id}`,
    customerName: 'Test User',
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
  };
}

describe('store', () => {
  it('initializes with seeded conversations', () => {
    // The seed() function creates 4 demo conversations
    expect(store.conversations.size).toBeGreaterThanOrEqual(4);
  });

  it('contains the expected demo conversation IDs', () => {
    expect(store.conversations.has('demo-chan-001')).toBe(true);
    expect(store.conversations.has('demo-david-002')).toBe(true);
    expect(store.conversations.has('demo-wong-003')).toBe(true);
    expect(store.conversations.has('demo-angry-004')).toBe(true);
  });

  it('can add and retrieve a conversation', () => {
    const conv = makeConversation('test-store-001');
    store.conversations.set(conv.id, conv);
    const retrieved = store.conversations.get('test-store-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.customerName).toBe('Test User');
    expect(retrieved?.status).toBe('triaging');
  });

  it('can update a conversation', () => {
    const conv = makeConversation('test-store-002');
    store.conversations.set(conv.id, conv);
    const updated = { ...conv, status: 'resolved' as const };
    store.conversations.set(conv.id, updated);
    expect(store.conversations.get('test-store-002')?.status).toBe('resolved');
  });

  it('seeded Mrs. Chan conversation has correct agent', () => {
    const chan = store.conversations.get('demo-chan-001');
    expect(chan?.currentAgent).toBe('grace');
    expect(chan?.language).toBe('zh');
    expect(chan?.priority).toBe('HIGH');
  });

  it('seeded David Lee conversation has correct agent', () => {
    const david = store.conversations.get('demo-david-002');
    expect(david?.currentAgent).toBe('swift');
    expect(david?.language).toBe('en');
  });

  it('seeded James Wong conversation has correct agent', () => {
    const wong = store.conversations.get('demo-wong-003');
    expect(wong?.currentAgent).toBe('kara');
    expect(wong?.priority).toBe('MEDIUM');
  });

  it('seeded Richard Tam conversation is in human queue', () => {
    const tam = store.conversations.get('demo-angry-004');
    expect(tam?.currentAgent).toBe('human');
    expect(tam?.status).toBe('human-queue');
  });

  it('priority values are valid', () => {
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PENDING'];
    store.conversations.forEach((conv) => {
      expect(validPriorities).toContain(conv.priority);
    });
  });

  it('metrics.agentTurns is always an object', () => {
    store.conversations.forEach((conv) => {
      expect(conv.metrics.agentTurns).toBeDefined();
      expect(typeof conv.metrics.agentTurns).toBe('object');
    });
  });

  it('all seeded conversations have at least one message', () => {
    ['demo-chan-001', 'demo-david-002', 'demo-wong-003', 'demo-angry-004'].forEach((id) => {
      const conv = store.conversations.get(id);
      expect(conv?.messages.length).toBeGreaterThan(0);
    });
  });
});
