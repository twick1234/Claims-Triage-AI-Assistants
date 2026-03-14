'use client';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING';

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: 'bg-red-600 text-white animate-pulse',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-green-500 text-white',
  PENDING: 'bg-gray-400 text-white',
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-block rounded font-bold uppercase tracking-wide ${sizeClass} ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
