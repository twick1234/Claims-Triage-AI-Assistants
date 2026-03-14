'use client';

import { useRef, useEffect, useState } from 'react';
import { Conversation, AgentId, AGENT_CONFIG } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { AgentBadge } from './AgentBadge';

interface ChatWindowProps {
  conversationId: string | null;
  conversation?: Conversation;
  onSend?: (text: string) => void;
  isOperator?: boolean;
  isLoading?: boolean;
  streamingText?: string;
  currentAgent?: AgentId;
}

export function ChatWindow({
  // conversationId kept in interface for future use
  conversation,
  onSend,
  isOperator = false,
  isLoading = false,
  streamingText = '',
  currentAgent,
}: Omit<ChatWindowProps, 'conversationId'> & { conversationId?: string | null }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, streamingText]);

  const handleSend = () => {
    if (!input.trim() || !onSend) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const agentConfig = currentAgent ? AGENT_CONFIG[currentAgent] : null;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Agent header */}
      {agentConfig && (
        <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3 bg-gray-800">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: agentConfig.color + '33' }}
          >
            {agentConfig.emoji}
          </div>
          <div>
            <div className="font-semibold text-white">{agentConfig.label}</div>
            <div className="text-xs text-gray-400">
              {currentAgent === 'human' ? 'Human Agent' : 'AI Specialist'}
            </div>
          </div>
          {currentAgent && <AgentBadge agentId={currentAgent} size="sm" />}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No messages yet
          </div>
        ) : (
          <>
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streamingText && (
              <div className="flex justify-start mb-3">
                <div className="max-w-[75%]">
                  {agentConfig && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{agentConfig.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: agentConfig.color }}>
                        {agentConfig.label}
                      </span>
                    </div>
                  )}
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white whitespace-pre-wrap"
                    style={agentConfig ? { backgroundColor: agentConfig.color + '22', borderLeft: `3px solid ${agentConfig.color}` } : {}}
                  >
                    {streamingText}
                    <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            {isLoading && !streamingText && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {onSend && (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isOperator ? 'Reply as human agent...' : 'Type your message...'}
              rows={2}
              className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
