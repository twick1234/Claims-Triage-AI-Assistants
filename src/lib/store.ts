import { Conversation, Message, AgentId } from './types';

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeMsg(
  conversationId: string,
  role: 'customer' | 'agent' | 'system',
  content: string,
  agentId?: AgentId,
  minsAgo = 0
): Message {
  const ts = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
  return { id: uuid(), conversationId, role, content, agentId, timestamp: ts };
}

interface Store {
  conversations: Map<string, Conversation>;
  sseClients: Set<ReadableStreamDefaultController>;
}

export const store: Store = {
  conversations: new Map(),
  sseClients: new Set(),
};

export function broadcast(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  store.sseClients.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch {
      // client disconnected
    }
  });
}

function seed() {
  // 1. Mrs. Chan — elderly, flooded flat (with-grace)
  const c1id = 'demo-chan-001';
  const c1: Conversation = {
    id: c1id,
    customerId: 'cust-chan',
    customerName: 'Mrs. Chan',
    status: 'with-grace',
    currentAgent: 'grace',
    messages: [
      makeMsg(c1id, 'customer', '你好，我係Chan太太。我屋企入晒水，我唔知點算...', undefined, 12),
      makeMsg(c1id, 'agent', '你好，Chan太太。我係Grace，Chubb保險嘅AI理賠專員。聽到您屋企入水，我真係好擔心您。您而家安全嗎？慢慢講，唔急。', 'grace', 11),
      makeMsg(c1id, 'customer', '我78歲，一個人住，好驚...', undefined, 10),
      makeMsg(c1id, 'agent', '完全明白您的心情。一個人面對這種情況真的很難受。首先確認您現在人是否安全？電、煤氣有沒有關掉？我會一步一步幫您處理理賠的事，不用擔心。', 'grace', 9),
      makeMsg(c1id, 'customer', '客廳地板已經有水，我搬唔到啲嘢', undefined, 8),
      makeMsg(c1id, 'agent', '明白了，Chan太太。請您先移到乾燥安全的房間，不要嘗試搬重物。我們會安排緊急評估員今天上門。您的保單號碼方便告訴我嗎？', 'grace', 7),
    ],
    routing: [
      {
        assignedAgent: 'grace',
        reasoning: 'Elderly customer, distressed, alone, flooded home — needs empathy and safety check',
        confidence: 0.96,
        triggers: ['elderly', 'alone', 'distressed', 'flooding'],
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
    ],
    priority: 'HIGH',
    metrics: {
      startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      firstResponseAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      agentTurns: { grace: 3 },
    },
    language: 'zh',
  };
  store.conversations.set(c1id, c1);

  // 2. David Lee — car crushed, urgent (with-swift)
  const c2id = 'demo-david-002';
  const c2: Conversation = {
    id: c2id,
    customerId: 'cust-david',
    customerName: 'David Lee',
    status: 'with-swift',
    currentAgent: 'swift',
    messages: [
      makeMsg(c2id, 'customer', 'Tree fell on my car during the typhoon. Total write-off I think. Need to start a claim NOW.', undefined, 8),
      makeMsg(c2id, 'agent', "Swift here — I'm an AI claims specialist. Let's get your claim moving fast. What's damaged and do you have your policy number handy?", 'swift', 7),
      makeMsg(c2id, 'customer', 'Policy number is HK-MOT-2024-88821. Car is a 2023 Toyota Camry.', undefined, 6),
      makeMsg(c2id, 'agent', 'Got it — HK-MOT-2024-88821, 2023 Toyota Camry. Here\'s what\'s happening now:\n1. Claim reference opened: CLM-2024-88821-T\n2. Photos needed: 4 angles of the vehicle + tree\n3. Do NOT move the car yet — assessor needs to see it in situ\n4. Assessor ETA: today between 3–6 PM\n\nAre you at the vehicle now?', 'swift', 5),
      makeMsg(c2id, 'customer', 'What do I do next? Can someone come today?', undefined, 4),
      makeMsg(c2id, 'agent', 'Yes — confirmed for today. Next steps:\n1. Take photos NOW if you haven\'t (all 4 angles + tree)\n2. Send photos to: claims-hk@chubb.com with your claim reference\n3. Stay clear of the vehicle — structural risk\n4. Assessor will call 30 mins before arrival\n\nAnything else blocking you right now?', 'swift', 3),
    ],
    routing: [
      {
        assignedAgent: 'swift',
        reasoning: 'Urgent vehicle damage, wants fast action, has policy number ready',
        confidence: 0.94,
        triggers: ['urgent', 'vehicle damage', 'NOW', 'fast action needed'],
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
    ],
    priority: 'HIGH',
    metrics: {
      startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      firstResponseAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      agentTurns: { swift: 3 },
    },
    language: 'en',
  };
  store.conversations.set(c2id, c2);

  // 3. Mr. Wong — policy question (with-kara)
  const c3id = 'demo-wong-003';
  const c3: Conversation = {
    id: c3id,
    customerId: 'cust-wong',
    customerName: 'James Wong',
    status: 'with-kara',
    currentAgent: 'kara',
    messages: [
      makeMsg(c3id, 'customer', 'Hi, I have some window damage from the typhoon. Before I claim, what is my excess?', undefined, 15),
      makeMsg(c3id, 'agent', "Hi, I'm Kara, an AI knowledge specialist at Chubb. Ask me anything about your policy or how typhoon claims work — I'm happy to help.\n\nFor home insurance policies, the standard excess is typically HKD 500–2,000, depending on your specific plan tier. To confirm your exact excess, I'd need your policy number. Do you have it handy?", 'kara', 14),
      makeMsg(c3id, 'customer', 'Also — does my policy cover water that came in through the broken window?', undefined, 13),
      makeMsg(c3id, 'agent', 'Good question. Water damage caused by typhoon-force winds breaking a window is generally covered under standard home policies — this is classified as "storm-induced water ingress" rather than flooding.\n\nKey points (subject to policy review):\n- Broken window repair: covered\n- Water damage to contents/flooring from the ingress: usually covered\n- Pre-existing wear or gradual water damage: not covered\n\nWhat is your policy number so I can confirm the exact terms?', 'kara', 12),
      makeMsg(c3id, 'customer', 'And how long will the claim take?', undefined, 11),
      makeMsg(c3id, 'agent', 'Typical timelines for typhoon claims:\n- Simple claims (window damage, minor contents): 5–7 business days\n- Claims requiring physical assessment: 2–3 weeks\n- Complex structural damage: 4–6 weeks\n\nYour window claim sounds straightforward — likely 5–7 days if documentation is complete. Want me to help you start the claim now?', 'kara', 10),
    ],
    routing: [
      {
        assignedAgent: 'kara',
        reasoning: 'Policy question about excess and coverage — FAQ type query, no urgency or distress',
        confidence: 0.91,
        triggers: ['policy question', 'excess', 'coverage query', 'FAQ'],
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ],
    priority: 'MEDIUM',
    metrics: {
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      firstResponseAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      agentTurns: { kara: 3 },
    },
    language: 'en',
  };
  store.conversations.set(c3id, c3);

  // 4. Angry customer — legal threats (human-queue)
  const c4id = 'demo-angry-004';
  const c4: Conversation = {
    id: c4id,
    customerId: 'cust-tam',
    customerName: 'Richard Tam',
    status: 'human-queue',
    currentAgent: 'human',
    messages: [
      makeMsg(c4id, 'customer', 'This is absolutely ridiculous. I have called THREE TIMES about my roof damage and nothing has happened.', undefined, 20),
      makeMsg(c4id, 'agent', "I'm Phoenix, a senior AI claims specialist at Chubb. I can see this situation needs careful attention, and I'm listening. Please tell me everything.", 'phoenix', 19),
      makeMsg(c4id, 'customer', 'I submitted my claim 2 weeks ago. No assessor, no update, nothing. This is unacceptable.', undefined, 18),
      makeMsg(c4id, 'agent', 'Mr. Tam, I hear you — and your frustration is completely justified. Three contacts with no resolution is not acceptable, and I am sorry this has happened. Let me pull up your claim right now and find out exactly what\'s gone wrong.\n\nCan you give me your claim reference number or policy number?', 'phoenix', 17),
      makeMsg(c4id, 'customer', "If I don't hear something concrete today I am calling my lawyer.", undefined, 16),
      makeMsg(c4id, 'agent', "Mr. Tam, I understand completely. You have every right to be angry, and I want to be transparent: I'm escalating this to a human senior case manager right now. They will contact you within the hour with a concrete update and a resolution path. Your legal concerns are noted and will be documented formally. I'm placing you at the front of our priority queue.", 'phoenix', 15),
      makeMsg(c4id, 'system', 'Conversation escalated to human queue — legal threat detected', undefined, 15),
    ],
    routing: [
      {
        assignedAgent: 'phoenix',
        reasoning: 'Angry customer, repeated contact, escalating frustration — Phoenix appropriate',
        confidence: 0.95,
        triggers: ['anger', 'repeated contact', 'escalation', 'third time'],
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        assignedAgent: 'human',
        reasoning: 'Legal threat made — mandatory human escalation',
        confidence: 1.0,
        triggers: ['lawyer', 'legal action'],
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ],
    priority: 'HIGH',
    metrics: {
      startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      firstResponseAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
      agentTurns: { phoenix: 2 },
      waitTimeMs: 15 * 60 * 1000,
    },
    language: 'en',
  };
  store.conversations.set(c4id, c4);
}

// Seed once at module load
seed();
