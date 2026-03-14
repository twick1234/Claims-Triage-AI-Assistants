'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Conversation } from '@/lib/types';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ChatWindow } from '@/components/ChatWindow';

function waitTimeLabel(ms?: number): string {
  if (!ms) return 'Unknown';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function QueuePage() {
  const [queue, setQueue] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('queue_updated', () => fetchQueue());
    evtSource.addEventListener('conversation_updated', (e) => {
      const data = JSON.parse(e.data) as Conversation;
      if (active?.id === data.id) setActive(data);
    });
    evtSource.addEventListener('initial_state', () => fetchQueue());
    return () => evtSource.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchQueue() {
    const res = await fetch('/api/queue');
    const data = await res.json();
    setQueue(data);
  }

  async function pickUp(conversationId: string) {
    setLoading(true);
    const res = await fetch('/api/queue/pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    });
    const data = await res.json();
    setActive(data);
    setLoading(false);
    fetchQueue();
  }

  async function sendOperatorMessage(text: string) {
    if (!active) return;
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: active.id, content: text, role: 'agent' }),
    });
    const refreshed = await fetch(`/api/conversations/${active.id}`);
    const updated = await refreshed.json();
    setActive(updated);
  }

  async function resolve() {
    if (!active) return;
    await fetch(`/api/conversations/${active.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', metrics: { ...active.metrics, resolvedAt: new Date().toISOString() } }),
    });
    setActive(null);
    fetchQueue();
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">←</Link>
          <h1 className="text-lg font-bold text-white">Human Queue</h1>
          <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {queue.length} waiting
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-73px)]">
        {/* Queue list */}
        <div className="w-96 flex-shrink-0 border-r border-gray-800 overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
            Waiting (longest first)
          </div>
          {queue.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8">
              <div className="text-3xl mb-2">✅</div>
              Queue is clear
            </div>
          ) : (
            queue.map((c) => (
              <div
                key={c.id}
                className={`bg-gray-800 border border-gray-700 rounded-xl p-4 ${
                  active?.id === c.id ? 'border-violet-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-white">{c.customerName}</span>
                    {c.language === 'zh' && <span className="text-xs text-gray-500 ml-1">中文</span>}
                  </div>
                  <PriorityBadge priority={c.priority} />
                </div>

                <div className="text-xs text-gray-400 mb-1">
                  Wait: <span className="text-amber-400 font-semibold">{waitTimeLabel(c.metrics.waitTimeMs)}</span>
                </div>

                {/* Last routing reason */}
                {c.routing.slice(-1)[0] && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {c.routing.slice(-1)[0].reasoning}
                  </p>
                )}

                <button
                  onClick={() => pickUp(c.id)}
                  disabled={loading || active?.id === c.id}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {active?.id === c.id ? 'Active' : 'Pick Up'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Active conversation */}
        <div className="flex-1 flex flex-col">
          {active ? (
            <>
              <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{active.customerName}</span>
                  <span className="text-xs text-gray-400 ml-3">Handling as Human Agent</span>
                </div>
                <button
                  onClick={resolve}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Mark Resolved ✓
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  conversationId={active.id}
                  conversation={active}
                  onSend={sendOperatorMessage}
                  isOperator={true}
                  currentAgent="human"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm flex-col gap-2">
              <div className="text-4xl">👤</div>
              <div>Pick up a conversation from the queue</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
