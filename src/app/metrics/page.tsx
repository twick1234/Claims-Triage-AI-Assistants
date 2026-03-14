'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MetricsSnapshot, AgentId, AGENT_CONFIG } from '@/lib/types';
import { MetricCard } from '@/components/MetricCard';

function fmtMs(ms: number): string {
  if (ms === 0) return '—';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function fmtPct(val: number): string {
  return `${Math.round(val * 100)}%`;
}

const AGENT_COLORS: Partial<Record<AgentId, string>> = {
  grace: '#3B82F6',
  swift: '#F59E0B',
  kara: '#10B981',
  phoenix: '#EF4444',
  human: '#8B5CF6',
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchMetrics() {
    const res = await fetch('/api/metrics');
    const data = await res.json();
    setMetrics(data);
    setLastUpdated(new Date());
  }

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    const evtSource = new EventSource('/api/stream');
    evtSource.addEventListener('metrics_tick', (e) => {
      setMetrics(JSON.parse(e.data));
      setLastUpdated(new Date());
    });
    evtSource.addEventListener('conversation_updated', () => fetchMetrics());

    return () => {
      clearInterval(interval);
      evtSource.close();
    };
  }, []);

  const aiAgents: AgentId[] = ['grace', 'swift', 'kara', 'phoenix'];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">←</Link>
            <h1 className="text-lg font-bold text-white">Management Metrics</h1>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchMetrics}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {!metrics ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading metrics...</div>
      ) : (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Top KPIs */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Total Conversations"
                value={metrics.totalConversations}
                icon="💬"
              />
              <MetricCard
                label="Active Now"
                value={metrics.activeNow}
                color={metrics.activeNow > 0 ? 'text-amber-400' : 'text-white'}
                icon="⚡"
              />
              <MetricCard
                label="Avg Handle Time"
                value={fmtMs(metrics.avgHandleTimeMs)}
                sub="Target: < 8 mins"
                icon="⏱️"
              />
              <MetricCard
                label="SLA Adherence"
                value={fmtPct(metrics.slaAdherenceRate)}
                color={metrics.slaAdherenceRate >= 0.9 ? 'text-green-400' : 'text-red-400'}
                sub="Target: ≥ 90%"
                icon="📋"
              />
              <MetricCard
                label="Avg tNPS"
                value={metrics.avgTNPS.toFixed(1)}
                color={metrics.avgTNPS >= 7 ? 'text-green-400' : 'text-amber-400'}
                sub="Target: ≥ 8.0"
                icon="⭐"
              />
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Utilization */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Agent Utilization</h2>
              <div className="space-y-3">
                {aiAgents.map((agent) => {
                  const pct = (metrics.agentUtilization[agent] ?? 0) * 100;
                  const config = AGENT_CONFIG[agent];
                  return (
                    <div key={agent}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">
                          {config.emoji} {config.label}
                        </span>
                        <span className="text-sm font-semibold text-white">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: AGENT_COLORS[agent] ?? '#6B7280',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">👤 Human</span>
                    <span className="text-sm font-semibold text-white">
                      {((metrics.agentUtilization.human ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${(metrics.agentUtilization.human ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI vs Human Donut */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI vs Human Resolution</h2>
              <div className="flex items-center justify-center gap-8">
                {/* CSS donut */}
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3.8" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3.8"
                      strokeDasharray={`${(1 - metrics.humanVsAiRatio) * 100} ${metrics.humanVsAiRatio * 100}`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3.8"
                      strokeDasharray={`${metrics.humanVsAiRatio * 100} ${(1 - metrics.humanVsAiRatio) * 100}`}
                      strokeDashoffset={`-${(1 - metrics.humanVsAiRatio) * 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-white">
                      {Math.round((1 - metrics.humanVsAiRatio) * 100)}%
                    </span>
                    <span className="text-xs text-gray-400">AI</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-300">AI Resolved</span>
                    <span className="ml-auto font-bold text-white">
                      {fmtPct(1 - metrics.humanVsAiRatio)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500" />
                    <span className="text-sm text-gray-300">Human Handled</span>
                    <span className="ml-auto font-bold text-white">
                      {fmtPct(metrics.humanVsAiRatio)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 pt-2">
                    Target: &gt; 80% AI containment
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Queue Depth"
              value={metrics.queueDepth}
              color={metrics.queueDepth > 3 ? 'text-red-400' : metrics.queueDepth > 0 ? 'text-amber-400' : 'text-green-400'}
              sub="Target: < 3"
              icon="👤"
            />
            <MetricCard
              label="First Contact Resolution"
              value={fmtPct(metrics.firstContactResolutionRate)}
              color={metrics.firstContactResolutionRate >= 0.7 ? 'text-green-400' : 'text-amber-400'}
              sub="Target: ≥ 70%"
              icon="✅"
            />
            <MetricCard
              label="Avg Wait (Human Queue)"
              value={fmtMs(metrics.avgWaitTimeMs)}
              color={metrics.avgWaitTimeMs > 120000 ? 'text-red-400' : 'text-green-400'}
              sub="SLA target: < 2 mins"
              icon="⏰"
            />
          </div>

          {/* SLA reference */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">SLA Reference</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Bot Initial Response</div>
                <div className="text-white font-medium">&lt; 3 seconds</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Agent Turn Time</div>
                <div className="text-white font-medium">&lt; 30 seconds</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Human Queue Wait</div>
                <div className="text-white font-medium">&lt; 2 minutes</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">SLA Breach Threshold</div>
                <div className="text-red-400 font-medium">&gt; 2 min no response</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
