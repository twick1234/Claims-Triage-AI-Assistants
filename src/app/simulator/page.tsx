'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scenario, Conversation, AGENT_CONFIG } from '@/lib/types';
import { AgentBadge } from '@/components/AgentBadge';
import { MessageBubble } from '@/components/MessageBubble';

interface RunningScenario {
  scenarioId: string;
  conversationId: string;
  conversation?: Conversation;
  status: 'running' | 'done' | 'error';
}

export default function SimulatorPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [running, setRunning] = useState<Map<string, RunningScenario>>(new Map());
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());

  useEffect(() => {
    fetch('/api/simulator').then((r) => r.json()).then(setScenarios);

    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('conversation_updated', (e) => {
      const data = JSON.parse(e.data) as Conversation;
      setConversations((prev) => new Map(prev).set(data.id, data));
    });
    evtSource.addEventListener('conversation_created', (e) => {
      const data = JSON.parse(e.data) as Conversation;
      setConversations((prev) => new Map(prev).set(data.id, data));
    });
    return () => evtSource.close();
  }, []);

  async function fireScenario(scenario: Scenario) {
    if (running.has(scenario.id)) return;

    // Create conversation via simulator API
    const res = await fetch('/api/simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: scenario.id }),
    });
    const { conversationId } = await res.json();

    const entry: RunningScenario = { scenarioId: scenario.id, conversationId, status: 'running' };
    setRunning((prev) => new Map(prev).set(scenario.id, entry));

    // Fire messages with delays
    for (const msg of scenario.messages) {
      await new Promise((resolve) => setTimeout(resolve, msg.delayMs || 1000));
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: msg.content }),
      });
    }

    setRunning((prev) => {
      const next = new Map(prev);
      const entry = next.get(scenario.id);
      if (entry) next.set(scenario.id, { ...entry, status: 'done' });
      return next;
    });
  }

  async function clearAll() {
    await fetch('/api/simulator', { method: 'DELETE' });
    setRunning(new Map());
  }

  const agentColors: Record<string, string> = {
    grace: '#3B82F6',
    swift: '#F59E0B',
    kara: '#10B981',
    phoenix: '#EF4444',
    human: '#8B5CF6',
    triage: '#6B7280',
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">←</Link>
            <h1 className="text-lg font-bold text-white">Scenario Simulator</h1>
          </div>
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear All Simulations
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <p className="text-sm text-gray-500 mb-6">
          Fire pre-built scenarios to demonstrate the AI routing system. Messages are injected at realistic intervals.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const runState = running.get(scenario.id);
            const convId = runState?.conversationId;
            const convo = convId ? conversations.get(convId) : undefined;
            const agentColor = agentColors[scenario.expectedAgent] ?? '#6B7280';
            const agentConfig = AGENT_CONFIG[scenario.expectedAgent];

            return (
              <div
                key={scenario.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden"
              >
                {/* Scenario header */}
                <div className="p-5 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white">{scenario.name}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{scenario.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs text-gray-500">{scenario.language === 'zh' ? '中文' : 'EN'}</span>
                      <AgentBadge agentId={scenario.expectedAgent} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      Expected: <span style={{ color: agentColor }}>{agentConfig.emoji} {agentConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {runState?.status === 'running' && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                          Running...
                        </span>
                      )}
                      {runState?.status === 'done' && (
                        <span className="text-xs text-green-400">Complete</span>
                      )}
                      <button
                        onClick={() => fireScenario(scenario)}
                        disabled={!!runState}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {runState ? 'Running' : 'Fire Scenario'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Script preview */}
                <div className="p-4 border-b border-gray-700">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Script</div>
                  <div className="space-y-1">
                    {scenario.messages.map((msg, i) => (
                      <div key={i} className="text-xs text-gray-400">
                        <span className="text-gray-600">{msg.delayMs / 1000}s</span>{' '}
                        <span className="text-gray-300">{msg.content.slice(0, 60)}{msg.content.length > 60 ? '…' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live conversation preview */}
                {convo && convo.messages.length > 0 && (
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Live Preview · {convo.currentAgent !== 'triage' && <AgentBadge agentId={convo.currentAgent} size="sm" showLabel={false} />}
                    </div>
                    {convo.messages.slice(-6).map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
