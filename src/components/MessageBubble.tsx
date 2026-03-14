'use client';

import { Message, AGENT_CONFIG } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString('en-HK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isCustomer = message.role === 'customer';
  const agentConfig = message.agentId ? AGENT_CONFIG[message.agentId] : null;

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isCustomer ? 'order-2' : 'order-1'}`}>
        {!isCustomer && agentConfig && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{agentConfig.emoji}</span>
            <span className="text-xs font-semibold" style={{ color: agentConfig.color }}>
              {agentConfig.label}
            </span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isCustomer
              ? 'bg-gray-600 text-white rounded-tr-sm'
              : 'text-white rounded-tl-sm'
          }`}
          style={!isCustomer && agentConfig ? { backgroundColor: agentConfig.color + '22', borderLeft: `3px solid ${agentConfig.color}` } : {}}
        >
          {message.content}
        </div>
        <div className={`text-xs text-gray-500 mt-1 ${isCustomer ? 'text-right' : 'text-left'}`}>
          {time}
        </div>
      </div>
    </div>
  );
}
