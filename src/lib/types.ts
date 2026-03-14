export type AgentId = 'triage' | 'grace' | 'swift' | 'kara' | 'phoenix' | 'human';

export type ConversationStatus =
  | 'triaging'
  | 'with-grace'
  | 'with-swift'
  | 'with-kara'
  | 'with-phoenix'
  | 'human-queue'
  | 'human-active'
  | 'resolved';

export interface RoutingDecision {
  assignedAgent: AgentId;
  reasoning: string;
  confidence: number;
  triggers: string[];
  timestamp: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'customer' | 'agent' | 'system';
  agentId?: AgentId;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  status: ConversationStatus;
  currentAgent: AgentId;
  operatorId?: string;
  messages: Message[];
  routing: RoutingDecision[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING';
  metrics: {
    startedAt: string;
    firstResponseAt?: string;
    resolvedAt?: string;
    agentTurns: Partial<Record<AgentId, number>>;
    waitTimeMs?: number;
    tNPS?: number;
  };
  language: 'en' | 'zh';
  scenarioId?: string;
}

export interface MetricsSnapshot {
  totalConversations: number;
  activeNow: number;
  avgHandleTimeMs: number;
  firstContactResolutionRate: number;
  slaAdherenceRate: number;
  agentUtilization: Partial<Record<AgentId, number>>;
  humanVsAiRatio: number;
  avgTNPS: number;
  queueDepth: number;
  avgWaitTimeMs: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  expectedAgent: AgentId;
  customerName: string;
  language: 'en' | 'zh';
  messages: Array<{ delayMs: number; content: string }>;
}

export const AGENT_CONFIG: Record<AgentId, { label: string; emoji: string; color: string; bgColor: string }> = {
  triage: { label: 'Triage', emoji: '🔍', color: '#6B7280', bgColor: 'bg-gray-500' },
  grace:  { label: 'Grace',  emoji: '💙', color: '#3B82F6', bgColor: 'bg-blue-500' },
  swift:  { label: 'Swift',  emoji: '⚡', color: '#F59E0B', bgColor: 'bg-amber-500' },
  kara:   { label: 'Kara',   emoji: '📚', color: '#10B981', bgColor: 'bg-emerald-500' },
  phoenix:{ label: 'Phoenix',emoji: '🔥', color: '#EF4444', bgColor: 'bg-red-500' },
  human:  { label: 'Human',  emoji: '👤', color: '#8B5CF6', bgColor: 'bg-violet-500' },
};
