import { NextResponse } from 'next/server';
import { store, broadcast } from '@/lib/store';
import { Message } from '@/lib/types';
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

    // Update routing
    conversation.routing.push(routerResult.decision);

    // Update priority
    conversation.priority = PRIORITY_MAP[newAgent] as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' || 'MEDIUM';

    // Handle transfer
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

    // Generate AI response (streaming but collected)
    let agentText = '';
    const agentMsgId = uuid();

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          agentText = await streamAgentResponse(newAgent, conversation.messages, (chunk) => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });

          // Save the complete agent message
          const agentMsg: Message = {
            id: agentMsgId,
            conversationId,
            role: 'agent',
            agentId: newAgent,
            content: agentText,
            timestamp: new Date().toISOString(),
          };
          conversation.messages.push(agentMsg);

          // Update metrics
          if (!conversation.metrics.firstResponseAt) {
            conversation.metrics.firstResponseAt = new Date().toISOString();
          }
          conversation.metrics.agentTurns[newAgent] = (conversation.metrics.agentTurns[newAgent] ?? 0) + 1;

          store.conversations.set(conversationId, conversation);
          broadcast('conversation_updated', conversation);

          controller.close();
        } catch (err) {
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
      },
    });
  }

  store.conversations.set(conversationId, conversation);
  broadcast('conversation_updated', conversation);
  return NextResponse.json({ message: customerMsg });
}
