import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { Message, AgentId } from '@/lib/types';
import { routeConversation, getStatusForAgent } from '@/lib/triage/router';
import { streamAgentResponse } from '@/lib/agents';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const PRIORITY_MAP: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = {
  grace: 'HIGH',
  swift: 'HIGH',
  kara: 'MEDIUM',
  phoenix: 'HIGH',
  human: 'HIGH',
};

// Board URLs for hardware mode
const BOARD_URLS: Partial<Record<AgentId, string>> = {
  grace:   process.env.GRACE_URL,
  swift:   process.env.SWIFT_URL,
  kara:    process.env.KARA_URL,
  phoenix: process.env.PHOENIX_URL,
  triage:  process.env.TRIAGE_URL,
};

const IS_HARDWARE = process.env.AGENT_MODE === 'hardware';

/**
 * Hardware mode: POST messages to the PicoClaw board HTTP server.
 * The board streams back the agent response as plain text.
 */
async function streamFromBoard(
  agentId: AgentId,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<string> {
  const boardUrl = BOARD_URLS[agentId];
  if (!boardUrl) {
    throw new Error(`No board URL configured for agent ${agentId}`);
  }

  // Build alternating user/assistant messages for the board
  const raw: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of messages) {
    if (msg.role === 'customer') raw.push({ role: 'user', content: msg.content });
    else if (msg.role === 'agent') raw.push({ role: 'assistant', content: msg.content });
  }

  // Merge consecutive same-role messages
  const boardMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const m of raw) {
    const last = boardMessages[boardMessages.length - 1];
    if (last && last.role === m.role) last.content += '\n' + m.content;
    else boardMessages.push({ ...m });
  }

  if (boardMessages.length === 0 || boardMessages[boardMessages.length - 1].role !== 'user') {
    return '';
  }

  const res = await fetch(`${boardUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: boardMessages }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Board ${agentId} returned ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
    fullText += chunk;
  }

  return fullText;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { conversationId, content, role = 'customer' } = body;

  const conversation = store.conversations.get(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Add customer message
  const customerMsg: Message = {
    id: uuid(),
    conversationId,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(customerMsg);

  // If human-active, operator is handling — just broadcast and return
  if (conversation.status === 'human-active' && role === 'agent') {
    const agentMsg: Message = {
      id: uuid(),
      conversationId,
      role: 'agent',
      agentId: 'human',
      content,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(agentMsg);
    store.conversations.set(conversationId, conversation);
    broadcast('conversation_updated', conversation);
    return NextResponse.json({ message: agentMsg });
  }

  // Triage / route
  if (role === 'customer') {
    const routerResult = await routeConversation(conversation);
    const newAgent = routerResult.agent;

    conversation.routing.push(routerResult.decision);
    conversation.priority = PRIORITY_MAP[newAgent] as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' || 'MEDIUM';

    if (newAgent !== conversation.currentAgent) {
      if (routerResult.transferMessage) {
        const sysMsg: Message = {
          id: uuid(),
          conversationId,
          role: 'system',
          content: routerResult.transferMessage,
          timestamp: new Date().toISOString(),
        };
        conversation.messages.push(sysMsg);
      }
      conversation.currentAgent = newAgent;
      conversation.status = getStatusForAgent(newAgent);
    }

    // If routed to human queue, don't generate AI response
    if (newAgent === 'human') {
      conversation.metrics.waitTimeMs = Date.now() - new Date(conversation.metrics.startedAt).getTime();
      store.conversations.set(conversationId, conversation);
      broadcast('conversation_updated', conversation);
      broadcast('queue_updated', {
        queueDepth: Array.from(store.conversations.values()).filter((c) => c.status === 'human-queue').length,
      });
      return NextResponse.json({ routed: 'human', conversation });
    }

    // Generate AI response — hardware (PicoClaw board) or simulation
    const agentMsgId = uuid();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let agentText: string;

          if (IS_HARDWARE && BOARD_URLS[newAgent]) {
            agentText = await streamFromBoard(newAgent, conversation.messages, (chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
            });
          } else {
            agentText = await streamAgentResponse(newAgent, conversation.messages, (chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
            });
          }

          const agentMsg: Message = {
            id: agentMsgId,
            conversationId,
            role: 'agent',
            agentId: newAgent,
            content: agentText,
            timestamp: new Date().toISOString(),
          };
          conversation.messages.push(agentMsg);

          if (!conversation.metrics.firstResponseAt) {
            conversation.metrics.firstResponseAt = new Date().toISOString();
          }
          conversation.metrics.agentTurns[newAgent] = (conversation.metrics.agentTurns[newAgent] ?? 0) + 1;

          store.conversations.set(conversationId, conversation);
          broadcast('conversation_updated', conversation);
          controller.close();
        } catch (err) {
          console.error('Chat route error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Agent-Id': newAgent,
        'X-Message-Id': agentMsgId,
        'X-Mode': IS_HARDWARE ? 'hardware' : 'simulation',
      },
    });
  }

  store.conversations.set(conversationId, conversation);
  broadcast('conversation_updated', conversation);
  return NextResponse.json({ message: customerMsg });
}
