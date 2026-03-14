'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Conversation } from '@/lib/types';
import { ChatWindow } from '@/components/ChatWindow';
import { AgentBadge } from '@/components/AgentBadge';

export default function ChatPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [started, setStarted] = useState(false);

  async function startConversation() {
    const name = customerName.trim() || 'Customer';
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: name, language }),
    });
    const data = await res.json();
    setConversation(data);
    setStarted(true);
  }

  async function sendMessage(text: string) {
    if (!conversation) return;
    setIsLoading(true);
    setStreamingText('');

    // Optimistically add customer message
    setConversation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: 'temp-' + Date.now(),
            conversationId: prev.id,
            role: 'customer',
            content: text,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, content: text }),
      });

      if (!res.ok) {
        setIsLoading(false);
        return;
      }

      // Check if it's a streaming response or JSON
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('text/plain')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setStreamingText(accumulated);
          }
        }
        setStreamingText('');
      }

      // Refresh conversation state
      const refreshed = await fetch(`/api/conversations/${conversation.id}`);
      const updated = await refreshed.json();
      setConversation(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  }

  async function requestHuman() {
    if (!conversation) return;
    await sendMessage(language === 'zh' ? '我想同真人傾' : 'I would like to speak with a real person please.');
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm mb-6 inline-flex items-center gap-1">
            ← Back
          </Link>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <div className="text-3xl mb-3">💬</div>
            <h1 className="text-2xl font-bold text-white mb-2">Claims Chat</h1>
            <p className="text-gray-400 text-sm mb-6">
              Our AI will assess your situation and connect you with the right specialist.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Your name (optional)</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Mrs. Chan"
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Language</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('zh')}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      language === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>

              <button
                onClick={startConversation}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
              >
                Start Claim Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
            ←
          </Link>
          <span className="font-semibold text-white text-sm">Chubb HK Claims</span>
          {conversation?.currentAgent && (
            <AgentBadge agentId={conversation.currentAgent} size="sm" />
          )}
        </div>
        <button
          onClick={requestHuman}
          className="text-xs bg-violet-700 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          👤 Speak with a person
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
        <ChatWindow
          conversationId={conversation?.id ?? null}
          conversation={conversation ?? undefined}
          onSend={sendMessage}
          isLoading={isLoading}
          streamingText={streamingText}
          currentAgent={conversation?.currentAgent}
        />
      </div>
    </div>
  );
}
