'use client';

import { Conversation } from '@/lib/types';
import { AgentBadge } from './AgentBadge';
import { PriorityBadge } from './PriorityBadge';

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: () => void;
  selected?: boolean;
}

function elapsed(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export function ConversationCard({ conversation, onClick, selected }: ConversationCardProps) {
  const lastMsg = conversation.messages.filter((m) => m.role !== 'system').slice(-1)[0];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-500 ${
        selected ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 bg-gray-800/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold text-white">{conversation.customerName}</span>
          <span className="text-xs text-gray-400 ml-2">{conversation.language === 'zh' ? '中文' : 'EN'}</span>
        </div>
        <PriorityBadge priority={conversation.priority} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <AgentBadge agentId={conversation.currentAgent} size="sm" />
        <span className="text-xs text-gray-500">{elapsed(conversation.metrics.startedAt)}</span>
      </div>

      {lastMsg && (
        <p className="text-sm text-gray-400 truncate">
          <span className="text-gray-500">{lastMsg.role === 'customer' ? '👤' : '🤖'}</span>{' '}
          {lastMsg.content.slice(0, 80)}{lastMsg.content.length > 80 ? '…' : ''}
        </p>
      )}
    </div>
  );
}
