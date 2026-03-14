'use client';

import { AgentId, AGENT_CONFIG } from '@/lib/types';

interface AgentBadgeProps {
  agentId: AgentId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function AgentBadge({ agentId, size = 'md', showLabel = true }: AgentBadgeProps) {
  const config = AGENT_CONFIG[agentId];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${sizeClasses[size]} ${config.bgColor}`}
    >
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
