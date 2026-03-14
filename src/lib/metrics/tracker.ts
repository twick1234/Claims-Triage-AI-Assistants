import { store } from '../store';
import { MetricsSnapshot, AgentId } from '../types';

export function computeMetrics(): MetricsSnapshot {
  const convos = Array.from(store.conversations.values());

  const total = convos.length;
  const activeStatuses = new Set(['triaging', 'with-grace', 'with-swift', 'with-kara', 'with-phoenix', 'human-active']);
  const activeNow = convos.filter((c) => activeStatuses.has(c.status)).length;
  const queueDepth = convos.filter((c) => c.status === 'human-queue').length;

  // Avg handle time for resolved
  const resolved = convos.filter((c) => c.status === 'resolved' && c.metrics.resolvedAt);
  const avgHandleTimeMs =
    resolved.length > 0
      ? resolved.reduce((sum, c) => {
          const start = new Date(c.metrics.startedAt).getTime();
          const end = new Date(c.metrics.resolvedAt!).getTime();
          return sum + (end - start);
        }, 0) / resolved.length
      : 0;

  // First contact resolution — resolved without human escalation
  const fcr = resolved.length > 0
    ? resolved.filter((c) => !c.routing.some((r) => r.assignedAgent === 'human')).length / resolved.length
    : 0.72; // Demo default

  // SLA — conversations where first response was < 30s
  const slaConvos = convos.filter((c) => c.metrics.firstResponseAt);
  const slaAdherence =
    slaConvos.length > 0
      ? slaConvos.filter((c) => {
          const start = new Date(c.metrics.startedAt).getTime();
          const first = new Date(c.metrics.firstResponseAt!).getTime();
          return first - start < 30000;
        }).length / slaConvos.length
      : 0.94; // Demo default

  // Agent utilization
  const agentUtilization: Partial<Record<AgentId, number>> = {};
  const agentIds: AgentId[] = ['grace', 'swift', 'kara', 'phoenix', 'human'];
  for (const agent of agentIds) {
    const count = convos.filter((c) => c.currentAgent === agent).length;
    agentUtilization[agent] = total > 0 ? count / total : 0;
  }

  // Human vs AI ratio
  const humanResolved = resolved.filter((c) => c.routing.some((r) => r.assignedAgent === 'human')).length;
  const humanVsAiRatio = resolved.length > 0 ? humanResolved / resolved.length : 0.15;

  // tNPS
  const npsConvos = convos.filter((c) => c.metrics.tNPS !== undefined);
  const avgTNPS = npsConvos.length > 0
    ? npsConvos.reduce((sum, c) => sum + (c.metrics.tNPS ?? 0), 0) / npsConvos.length
    : 8.2; // Demo default

  // Avg wait time in human queue
  const queueConvos = convos.filter((c) => c.status === 'human-queue' && c.metrics.waitTimeMs);
  const avgWaitTimeMs =
    queueConvos.length > 0
      ? queueConvos.reduce((sum, c) => sum + (c.metrics.waitTimeMs ?? 0), 0) / queueConvos.length
      : 0;

  return {
    totalConversations: total,
    activeNow,
    avgHandleTimeMs,
    firstContactResolutionRate: fcr,
    slaAdherenceRate: slaAdherence,
    agentUtilization,
    humanVsAiRatio,
    avgTNPS,
    queueDepth,
    avgWaitTimeMs,
  };
}
