import Anthropic from '@anthropic-ai/sdk';
import { AgentId, Message } from '../types';
import { GRACE_SYSTEM } from './grace';
import { SWIFT_SYSTEM } from './swift';
import { KARA_SYSTEM } from './kara';
import { PHOENIX_SYSTEM } from './phoenix';

const SYSTEM_PROMPTS: Record<Exclude<AgentId, 'triage' | 'human'>, string> = {
  grace: GRACE_SYSTEM,
  swift: SWIFT_SYSTEM,
  kara: KARA_SYSTEM,
  phoenix: PHOENIX_SYSTEM,
};

export function getAgentSystemPrompt(agentId: AgentId): string {
  if (agentId === 'triage' || agentId === 'human') return '';
  return SYSTEM_PROMPTS[agentId] ?? GRACE_SYSTEM;
}

export async function streamAgentResponse(
  agentId: AgentId,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<string> {
  if (agentId === 'triage' || agentId === 'human') {
    return '';
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const systemPrompt = getAgentSystemPrompt(agentId);

  // Convert conversation messages to Anthropic format
  const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of messages) {
    if (msg.role === 'customer') {
      anthropicMessages.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'agent' && msg.agentId === agentId) {
      anthropicMessages.push({ role: 'assistant', content: msg.content });
    }
  }

  // Ensure we end with a user message
  if (anthropicMessages.length === 0 || anthropicMessages[anthropicMessages.length - 1].role !== 'user') {
    return '';
  }

  try {
    let fullText = '';
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk(event.delta.text);
        fullText += event.delta.text;
      }
    }

    return fullText;
  } catch (err) {
    console.error(`Agent ${agentId} error:`, err);
    const fallback = getFallbackResponse(agentId);
    onChunk(fallback);
    return fallback;
  }
}

function getFallbackResponse(agentId: AgentId): string {
  const fallbacks: Record<string, string> = {
    grace: "I'm here with you. I'm experiencing a brief technical issue, but please know I'm listening. Could you tell me a little more about your situation?",
    swift: "Technical issue on my end — apologies. Please give me your policy number and damage type and I'll get things moving.",
    kara: "I'm having a brief technical issue. Please ask your question again and I'll do my best to help.",
    phoenix: "I apologise for the interruption. I'm still here and committed to resolving this for you. Please continue.",
  };
  return fallbacks[agentId] ?? "I'm experiencing a brief technical issue. Please bear with me.";
}
