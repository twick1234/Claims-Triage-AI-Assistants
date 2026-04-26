import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { Message, AgentId } from '@/lib/types';
import { routeConversation, getStatusForAgent } from '@/lib/triage/router';
import { streamAgentResponse } from '@/lib/agents';

import { randomUUID } from 'crypto';
function uuid() {
  return randomUUID();
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
    signal: AbortSignal.timeout(30000),
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

const MAX_CONTENT_LENGTH = 2000;

export async function POST(request: Request) {
  const body = await request.json();
  // `role` is NOT accepted from caller — always treat incoming messages as 'customer'.
  // Operator messages must come via the authenticated operator pickup flow.
  const { conversationId, content } = body;

  if (typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content must be a non-empty string' }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `content must be ${MAX_CONTENT_LENGTH} characters or fewer` }, { status: 400 });
  }

  const conversation = store.conversations.get(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Add customer message (role is always 'customer' from this endpoint)
  const customerMsg: Message = {
    id: uuid(),
    conversationId,
    role: 'customer',
    content,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(customerMsg);

  // Triage / route
  {
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
      },
    });
  }
}
