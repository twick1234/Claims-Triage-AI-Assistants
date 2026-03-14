'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Conversation, ConversationStatus } from '@/lib/types';
import { ConversationCard } from '@/components/ConversationCard';
import { AgentBadge } from '@/components/AgentBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { MessageBubble } from '@/components/MessageBubble';

type Filter = 'all' | 'ai' | 'queue' | 'resolved';

const AI_STATUSES: ConversationStatus[] = ['with-grace', 'with-swift', 'with-kara', 'with-phoenix', 'triaging'];

function filterConversations(convos: Conversation[], filter: Filter): Conversation[] {
  switch (filter) {
    case 'ai': return convos.filter((c) => AI_STATUSES.includes(c.status));
    case 'queue': return convos.filter((c) => c.status === 'human-queue' || c.status === 'human-active');
    case 'resolved': return convos.filter((c) => c.status === 'resolved');
    default: return convos;
  }
}

function sortConversations(convos: Conversation[]): Conversation[] {
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, PENDING: 4 };
  return [...convos].sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 4;
    const pb = priorityOrder[b.priority] ?? 4;
    if (pa !== pb) return pa - pb;
    return new Date(b.metrics.startedAt).getTime() - new Date(a.metrics.startedAt).getTime();
  });
}

export default function TriagePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [stats, setStats] = useState({ active: 0, queue: 0, sla: 94 });

  useEffect(() => {
    fetchConversations();
    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('conversation_updated', (e) => {
      const data = JSON.parse(e.data) as Conversation;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
      setSelected((sel) => (sel?.id === data.id ? data : sel));
    });
    evtSource.addEventListener('conversation_created', (e) => {
      const data = JSON.parse(e.data) as Conversation;
      setConversations((prev) => [...prev, data]);
    });
    evtSource.addEventListener('initial_state', (e) => {
      const { conversations } = JSON.parse(e.data);
      setConversations(conversations);
    });
    return () => evtSource.close();
  }, []);

  useEffect(() => {
    const activeStatuses: ConversationStatus[] = ['triaging', 'with-grace', 'with-swift', 'with-kara', 'with-phoenix', 'human-active'];
    setStats({
      active: conversations.filter((c) => activeStatuses.includes(c.status)).length,
      queue: conversations.filter((c) => c.status === 'human-queue').length,
      sla: 94,
    });
  }, [conversations]);

  async function fetchConversations() {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    setConversations(data);
  }

  const filtered = sortConversations(filterConversations(conversations, filter));

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">←</Link>
            <h1 className="text-lg font-bold text-white">Triage Dashboard</h1>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.active}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{stats.queue}</div>
              <div className="text-xs text-gray-500">In Queue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{stats.sla}%</div>
              <div className="text-xs text-gray-500">SLA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-73px)]">
        {/* Left panel */}
        <div className="w-96 flex-shrink-0 border-r border-gray-800 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex gap-1">
              {(['all', 'ai', 'queue', 'resolved'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 text-xs rounded-lg capitalize font-medium transition-colors ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'ai' ? 'AI Active' : f === 'queue' ? 'Human Queue' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">No conversations</div>
            ) : (
              filtered.map((c) => (
                <ConversationCard
                  key={c.id}
                  conversation={c}
                  onClick={() => setSelected(c)}
                  selected={selected?.id === c.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel — detail view */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Detail header */}
              <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-white">{selected.customerName}</span>
                    <PriorityBadge priority={selected.priority} />
                    <AgentBadge agentId={selected.currentAgent} size="sm" />
                  </div>
                  <div className="text-xs text-gray-500">
                    Started {new Date(selected.metrics.startedAt).toLocaleTimeString()} ·{' '}
                    {selected.messages.length} messages · {selected.language === 'zh' ? 'Cantonese' : 'English'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono">{selected.id}</div>
              </div>

              <div className="flex-1 overflow-y-auto flex gap-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {selected.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>

                {/* Routing history */}
                <div className="w-72 border-l border-gray-800 p-4 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Routing History
                  </div>
                  <div className="space-y-3">
                    {selected.routing.map((r, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <AgentBadge agentId={r.assignedAgent} size="sm" />
                          <span className="text-xs text-gray-500">
                            {Math.round(r.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{r.reasoning}</p>
                        <div className="flex flex-wrap gap-1">
                          {r.triggers.map((t) => (
                            <span key={t} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {selected.routing.length === 0 && (
                      <div className="text-xs text-gray-600">No routing decisions yet</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
