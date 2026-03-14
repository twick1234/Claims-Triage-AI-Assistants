import { Conversation, AgentId, ConversationStatus, RoutingDecision } from '../types';
import { runTriageAgent } from '../agents/triage-agent';

const AGENT_STATUS_MAP: Record<AgentId, ConversationStatus> = {
  triage: 'triaging',
  grace: 'with-grace',
  swift: 'with-swift',
  kara: 'with-kara',
  phoenix: 'with-phoenix',
  human: 'human-queue',
};

const AGENT_LABEL: Record<AgentId, string> = {
  triage: 'Triage',
  grace: 'Grace 💙',
  swift: 'Swift ⚡',
  kara: 'Kara 📚',
  phoenix: 'Phoenix 🔥',
  human: 'a Human Agent 👤',
};

export interface RouterResult {
  agent: AgentId;
  decision: RoutingDecision;
  transferMessage?: string;
}

export async function routeConversation(conversation: Conversation): Promise<RouterResult> {
  const lastMessage = conversation.messages.filter((m) => m.role === 'customer').slice(-1)[0];
  const content = lastMessage?.content?.toLowerCase() ?? '';

  // Hard-coded overrides run first
  if (/\b(fire|gas leak|999|emergency|explosion)\b/i.test(content)) {
    const decision: RoutingDecision = {
      assignedAgent: 'grace',
      reasoning: 'Emergency keyword detected — safety first, human notified',
      confidence: 1.0,
      triggers: ['emergency', 'safety'],
      timestamp: new Date().toISOString(),
    };
    return {
      agent: 'grace',
      decision,
      transferMessage: `⚠️ Emergency situation detected. Transferring to Grace and notifying human team.`,
    };
  }

  if (/\b(lawyer|sue|legal action|solicitor|court)\b/i.test(content)) {
    const decision: RoutingDecision = {
      assignedAgent: 'phoenix',
      reasoning: 'Legal keyword detected — immediate Phoenix routing',
      confidence: 1.0,
      triggers: ['legal threat'],
      timestamp: new Date().toISOString(),
    };
    return {
      agent: 'phoenix',
      decision,
      transferMessage: `I'm connecting you with Phoenix, our senior specialist, right away.`,
    };
  }

  if (/\b(real person|human|speak to someone|operator|真人|人工)\b/i.test(content)) {
    const decision: RoutingDecision = {
      assignedAgent: 'human',
      reasoning: 'Explicit human request',
      confidence: 1.0,
      triggers: ['human requested'],
      timestamp: new Date().toISOString(),
    };
    return {
      agent: 'human',
      decision,
      transferMessage: `Of course — I'm transferring you to a human agent now. Please hold on.`,
    };
  }

  // After 3+ unresolved turns with same agent, escalate
  const currentAgentTurns = conversation.metrics.agentTurns[conversation.currentAgent] ?? 0;
  if (currentAgentTurns >= 3 && conversation.status !== 'resolved' && conversation.currentAgent !== 'human') {
    const decision: RoutingDecision = {
      assignedAgent: 'human',
      reasoning: 'Unresolved after 3+ agent turns — escalating to human queue',
      confidence: 0.85,
      triggers: ['unresolved', 'turn limit'],
      timestamp: new Date().toISOString(),
    };
    return {
      agent: 'human',
      decision,
      transferMessage: `I want to make sure you get the best help — transferring you to a human agent now.`,
    };
  }

  // LLM triage
  const conversationText = conversation.messages
    .filter((m) => m.role === 'customer' || m.role === 'agent')
    .map((m) => `${m.role === 'customer' ? 'Customer' : 'Agent'}: ${m.content}`)
    .join('\n');

  const triageResult = await runTriageAgent(conversationText);

  const decision: RoutingDecision = {
    assignedAgent: triageResult.agent as AgentId,
    reasoning: triageResult.reasoning,
    confidence: triageResult.confidence,
    triggers: triageResult.triggers,
    timestamp: new Date().toISOString(),
  };

  let transferMessage: string | undefined;
  if (triageResult.agent !== conversation.currentAgent) {
    transferMessage = `Transferring you to ${AGENT_LABEL[triageResult.agent as AgentId]}...`;
  }

  return {
    agent: triageResult.agent as AgentId,
    decision,
    transferMessage,
  };
}

export function getStatusForAgent(agentId: AgentId): ConversationStatus {
  return AGENT_STATUS_MAP[agentId] ?? 'triaging';
}
