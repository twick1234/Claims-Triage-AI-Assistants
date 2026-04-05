import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { store, broadcast } from '@/lib/store';
import { Message } from '@/lib/types';

function uuid() {
  return crypto.randomUUID();
}

const CUSTOMER_PERSONA_PROMPT = `You are simulating a real customer in an insurance claim conversation with Chubb HK.

Based on the conversation history, generate the NEXT realistic customer message.

Rules:
- Stay in character as the customer (same name, same situation, same emotional state)
- Progress the conversation naturally — respond to what the agent just said
- If the agent asked a question, answer it with realistic details
- Keep the same language (English or Cantonese/Chinese) as the customer has been using
- Be realistic: customers aren't perfectly calm — they may be anxious, frustrated, or grateful depending on context
- Max 2-3 sentences — customers don't write essays
- Do NOT pretend to be the agent or add any narration
- Output ONLY the customer's next message, nothing else`;

export async function POST(request: Request) {
  const { conversationId } = await request.json();

  const conversation = store.conversations.get(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build conversation history for the prompt
  const history = conversation.messages
    .filter((m) => m.role === 'customer' || m.role === 'agent')
    .map((m) => {
      const speaker = m.role === 'customer' ? `Customer (${conversation.customerName})` : 'Agent';
      return `${speaker}: ${m.content}`;
    })
    .join('\n\n');

  const userPrompt = `Customer name: ${conversation.customerName}
Language: ${conversation.language === 'zh' ? 'Cantonese/Chinese' : 'English'}

Conversation so far:
${history}

Generate the customer's next message:`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: CUSTOMER_PERSONA_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const customerReply = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    if (!customerReply) {
      return NextResponse.json({ error: 'No reply generated' }, { status: 500 });
    }

    // Add the customer reply to the conversation
    const customerMsg: Message = {
      id: uuid(),
      conversationId,
      role: 'customer',
      content: customerReply,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(customerMsg);
    store.conversations.set(conversationId, conversation);
    broadcast('conversation_updated', conversation);

    return NextResponse.json({ message: customerMsg });
  } catch (err) {
    console.error('Auto-reply error:', err);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
