import { Conversation, Message, AgentId } from './types';

function uuid(): string {
  return crypto.randomUUID();
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

  // ─── 1. Mrs. Chan — elderly flooded flat (with-grace, zh) ───
  const c1id = 'demo-chan-001';
  store.conversations.set(c1id, {
    id: c1id, customerId: 'cust-chan', customerName: 'Mrs. Chan (陳太)',
    status: 'with-grace', currentAgent: 'grace', language: 'zh', priority: 'HIGH',
    messages: [
      makeMsg(c1id, 'customer', '你好，我係Chan太太。我屋企入晒水，我唔知點算...', undefined, 12),
      makeMsg(c1id, 'agent', '你好，Chan太太。我係Grace，Chubb保險嘅AI理賠專員。聽到您屋企入水，我真係好擔心您。您而家安全嗎？慢慢講，唔急。', 'grace', 11),
      makeMsg(c1id, 'customer', '我78歲，一個人住，好驚...', undefined, 10),
      makeMsg(c1id, 'agent', '完全明白您的心情。一個人面對這種情況真的很難受。首先確認您現在人是否安全？電、煤氣有沒有關掉？我會一步一步幫您處理理賠的事，不用擔心。', 'grace', 9),
      makeMsg(c1id, 'customer', '客廳地板已經有水，我搬唔不到啲嘢', undefined, 8),
      makeMsg(c1id, 'agent', '明白了，Chan太太。請您先移到乾燥安全的房間，不要嘗試搬重物。我們會安排緊急評估員今天上門。您的保單號碼方便告訴我嗎？', 'grace', 7),
    ],
    routing: [{ assignedAgent: 'grace', reasoning: 'Elderly, alone, flooded, distressed — safety first', confidence: 0.96, triggers: ['elderly', 'alone', 'distressed', 'flooding'], timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), agentTurns: { grace: 3 } },
  });

  // ─── 2. David Lee — car crushed, urgent (with-swift) ───
  const c2id = 'demo-david-002';
  store.conversations.set(c2id, {
    id: c2id, customerId: 'cust-david', customerName: 'David Lee',
    status: 'with-swift', currentAgent: 'swift', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c2id, 'customer', 'Tree fell on my car during the typhoon. Total write-off I think. Need to start a claim NOW.', undefined, 8),
      makeMsg(c2id, 'agent', "Swift here — AI claims specialist. Let's get your claim moving. Policy number?", 'swift', 7),
      makeMsg(c2id, 'customer', 'Policy HK-MOT-2024-88821. 2023 Toyota Camry.', undefined, 6),
      makeMsg(c2id, 'agent', 'Confirmed — HK-MOT-2024-88821.\n1. Claim ref opened: CLM-2024-88821-T\n2. Photos needed: 4 angles + tree\n3. Do NOT move the car — assessor today 3–6 PM\n4. Send photos to claims-hk@chubb.com with ref\n\nAt the vehicle now?', 'swift', 5),
      makeMsg(c2id, 'customer', 'Yes. Can someone actually come today?', undefined, 4),
      makeMsg(c2id, 'agent', 'Confirmed for today. Assessor will call 30 mins before arrival. Do not drive or move the vehicle — structural risk. Anything else blocking you?', 'swift', 3),
    ],
    routing: [{ assignedAgent: 'swift', reasoning: 'Urgent vehicle damage, wants fast action', confidence: 0.94, triggers: ['urgent', 'vehicle damage', 'NOW'], timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(), agentTurns: { swift: 3 } },
  });

  // ─── 3. James Wong — policy question (with-kara) ───
  const c3id = 'demo-wong-003';
  store.conversations.set(c3id, {
    id: c3id, customerId: 'cust-wong', customerName: 'James Wong',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c3id, 'customer', 'Hi, I have window damage. Before I claim, what is my excess?', undefined, 15),
      makeMsg(c3id, 'agent', "I'm Kara, AI knowledge specialist at Chubb. Standard home excess is HKD 500–2,000 depending on your plan. Can I get your policy number to confirm?", 'kara', 14),
      makeMsg(c3id, 'customer', 'Also — does my policy cover water that came in through the broken window?', undefined, 13),
      makeMsg(c3id, 'agent', 'Yes — storm-induced water ingress through a broken window is generally covered (separate from flooding). That covers: window repair, water damage to contents/flooring. Pre-existing damage is not covered. Policy number?', 'kara', 12),
      makeMsg(c3id, 'customer', 'And how long will the claim take?', undefined, 11),
      makeMsg(c3id, 'agent', 'Simple window claim: 5–7 business days. Claims needing physical assessment: 2–3 weeks. Your case sounds straightforward — likely the shorter timeline. Want me to open a claim now?', 'kara', 10),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Policy question about excess and coverage — no urgency or distress', confidence: 0.91, triggers: ['policy question', 'excess', 'coverage'], timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), agentTurns: { kara: 3 } },
  });

  // ─── 4. Richard Tam — legal threats (human-queue) ───
  const c4id = 'demo-angry-004';
  store.conversations.set(c4id, {
    id: c4id, customerId: 'cust-tam', customerName: 'Richard Tam',
    status: 'human-queue', currentAgent: 'human', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c4id, 'customer', 'This is absolutely ridiculous. I have called THREE TIMES about my roof damage and nothing has happened.', undefined, 20),
      makeMsg(c4id, 'agent', "I'm Phoenix, senior AI claims specialist at Chubb. I hear you — please tell me everything.", 'phoenix', 19),
      makeMsg(c4id, 'customer', 'Submitted claim 2 weeks ago. No assessor, no update. This is unacceptable.', undefined, 18),
      makeMsg(c4id, 'agent', 'Mr. Tam, your frustration is completely justified. Three contacts with no resolution is not acceptable. I am sorry. Let me pull your claim now — policy or claim reference number?', 'phoenix', 17),
      makeMsg(c4id, 'customer', "If I don't hear something concrete today I am calling my lawyer.", undefined, 16),
      makeMsg(c4id, 'agent', "I understand, Mr. Tam. I'm escalating to a senior human case manager right now — they will contact you within the hour with a resolution path. Your legal concern is formally documented. You're at the front of our priority queue.", 'phoenix', 15),
      makeMsg(c4id, 'system', 'Legal threat detected — escalated to human queue', undefined, 15),
    ],
    routing: [
      { assignedAgent: 'phoenix', reasoning: 'Angry, repeated contact, escalating frustration', confidence: 0.95, triggers: ['anger', 'third time', 'repeated contact'], timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      { assignedAgent: 'human', reasoning: 'Legal threat — mandatory escalation', confidence: 1.0, triggers: ['lawyer', 'legal action'], timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    ],
    metrics: { startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(), agentTurns: { phoenix: 2 }, waitTimeMs: 15 * 60 * 1000 },
  });

  // ─── 5. Sarah Lam — smashed window, scared (with-grace) ───
  const c5id = 'demo-sarah-005';
  store.conversations.set(c5id, {
    id: c5id, customerId: 'cust-sarah', customerName: 'Sarah Lam',
    status: 'with-grace', currentAgent: 'grace', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c5id, 'customer', "The typhoon smashed my living room window. Glass everywhere and rain coming in. I'm shaking.", undefined, 6),
      makeMsg(c5id, 'agent', "I'm Grace, AI claims specialist at Chubb. Are you safe and away from the glass?", 'grace', 5),
      makeMsg(c5id, 'customer', "Yes I'm in the bedroom. Wind is really loud, I'm so scared.", undefined, 4),
      makeMsg(c5id, 'agent', "You're in the right place — bedroom is safe. The noise is frightening but you are okay. Don't go near the window. We'll handle the claim once you're settled. No rush at all.", 'grace', 3),
    ],
    routing: [{ assignedAgent: 'grace', reasoning: 'Scared, shaking, overwhelmed — safety check before anything', confidence: 0.97, triggers: ['scared', 'shaking', 'distressed'], timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), agentTurns: { grace: 2 } },
  });

  // ─── 6. Michael Cheung — multi-property commercial (human-active) ───
  const c6id = 'demo-cheung-006';
  store.conversations.set(c6id, {
    id: c6id, customerId: 'cust-cheung', customerName: 'Michael Cheung',
    status: 'human-active', currentAgent: 'human', operatorId: 'operator-1', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c6id, 'customer', "I own three commercial units in Kwun Tong. All three have roof damage. Probably HKD 2 million plus.", undefined, 35),
      makeMsg(c6id, 'agent', "I'm Phoenix, senior AI claims specialist. Three commercial policies — this needs our commercial team. Escalating you now with top priority.", 'phoenix', 34),
      makeMsg(c6id, 'system', 'Escalated — complex multi-policy commercial claim', undefined, 31),
      makeMsg(c6id, 'agent', "Mr. Cheung, this is David from Chubb Commercial Claims. I have all three policy files open. Let's go through each property.", 'human', 28),
      makeMsg(c6id, 'customer', 'Policies: HK-COM-2024-11001, 11002, 11003. Assessors needed at all three urgently.', undefined, 25),
      makeMsg(c6id, 'agent', 'Confirmed all three. I am coordinating three assessors simultaneously — earliest slots tomorrow AM for 11001 and 11002, 11003 by end of day tomorrow. I will send written confirmation within the hour.', 'human', 22),
    ],
    routing: [
      { assignedAgent: 'phoenix', reasoning: 'High-value multi-property commercial — complex', confidence: 0.93, triggers: ['commercial', 'multiple properties', 'HKD 2 million'], timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
      { assignedAgent: 'human', reasoning: 'Multi-policy commercial exceeds AI scope', confidence: 1.0, triggers: ['multi-policy', 'commercial'], timestamp: new Date(Date.now() - 31 * 60 * 1000).toISOString() },
    ],
    metrics: { startedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(), agentTurns: { phoenix: 1 }, waitTimeMs: 3 * 60 * 1000 },
  });

  // ─── 7. Fiona Ng — TV & laptop claim (with-kara) ───
  const c7id = 'demo-fiona-007';
  store.conversations.set(c7id, {
    id: c7id, customerId: 'cust-fiona', customerName: 'Fiona Ng',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c7id, 'customer', "My TV and laptop were destroyed when water came through the ceiling. How much will I get back? TV was HKD 18,000 and laptop HKD 12,000.", undefined, 18),
      makeMsg(c7id, 'agent', "I'm Kara, AI knowledge specialist. Electronics from typhoon water ingress are covered. Reimbursement is based on current market value minus depreciation and excess. Policy number?", 'kara', 17),
      makeMsg(c7id, 'customer', 'HK-HOME-2023-44512. TV is 18 months old, laptop 3 years old.', undefined, 16),
      makeMsg(c7id, 'agent', 'HK-HOME-2023-44512 has a HKD 150,000 contents limit — both items are well within scope.\n\nEstimated (subject to assessment):\n- TV (18 months): ~HKD 12,000–14,000\n- Laptop (3 years): ~HKD 5,000–6,000\n- Minus HKD 500 contents excess\n\nShall I open a claim?', 'kara', 15),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Policy/reimbursement question — informational, no distress', confidence: 0.92, triggers: ['contents claim', 'how much', 'electronics'], timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(), agentTurns: { kara: 2 } },
  });

  // ─── 8. Kevin Ho — roof tiles on car (with-swift) ───
  const c8id = 'demo-kevin-008';
  store.conversations.set(c8id, {
    id: c8id, customerId: 'cust-kevin', customerName: 'Kevin Ho',
    status: 'with-swift', currentAgent: 'swift', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c8id, 'customer', "Roof tiles fell on my car in the car park. Boot completely crushed. Need a claim ref and recovery truck today.", undefined, 3),
      makeMsg(c8id, 'agent', "Swift here. Roof tile impact, crushed boot. Policy number?", 'swift', 2),
      makeMsg(c8id, 'customer', 'HK-MOT-2024-76543. 2022 Honda CR-V.', undefined, 1),
      makeMsg(c8id, 'agent', '1. Claim ref: CLM-2024-76543-T\n2. Recovery truck dispatched — ETA 90 mins\n3. Photos: boot, tiles, all 4 sides → claims-hk@chubb.com\n4. Do NOT drive until assessed\n\nRental car: yes, covered. I will arrange — expect a call within 30 mins.', 'swift', 0),
    ],
    routing: [{ assignedAgent: 'swift', reasoning: 'Urgent vehicle damage, specific action requests', confidence: 0.95, triggers: ['vehicle damage', 'urgent', 'recovery truck'], timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), agentTurns: { swift: 2 } },
  });

  // ─── 9. 張伯 — elderly injured, Cantonese (with-grace, zh) ───
  const c9id = 'demo-cheungpak-009';
  store.conversations.set(c9id, {
    id: c9id, customerId: 'cust-cheungpak', customerName: '張伯',
    status: 'with-grace', currentAgent: 'grace', language: 'zh', priority: 'HIGH',
    messages: [
      makeMsg(c9id, 'customer', '喂，我係張伯，72歲。我屋企天花板漏水，我去執嘢嗰陣跌親，隻手好痛...', undefined, 9),
      makeMsg(c9id, 'agent', '張伯您好，我係Grace，Chubb嘅AI理賠專員。聽到您跌親我好擔心。您手傷嚴唔嚴重？需唔需要叫救護車？', 'grace', 8),
      makeMsg(c9id, 'customer', '唔係太嚴重，但係好痛。我老婆唔係喺度，我一個人。', undefined, 7),
      makeMsg(c9id, 'agent', '張伯，您做得好，打電話嚟。手痛就唔好再郁，坐低休息。我哋先處理您嘅安全，保險嘅嘢我幫您搞掂。有唔有鄰居可以過嚟幫您？', 'grace', 6),
      makeMsg(c9id, 'customer', '樓上嘅何太好人，但係我唔想麻煩佢', undefined, 5),
      makeMsg(c9id, 'agent', '張伯，而家係需要幫手嘅時候，麻煩何太係完全合理嘅。請您打電話俾何太，或者我可以幫您聯絡緊急上門服務。您嘅健康係最重要嘅。', 'grace', 4),
    ],
    routing: [{ assignedAgent: 'grace', reasoning: 'Elderly, injured, alone, Cantonese — immediate safety concern', confidence: 0.98, triggers: ['elderly', 'injured', 'alone', 'cantonese', 'fall'], timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), agentTurns: { grace: 3 } },
  });

  // ─── 10. Mei Ling Yu — mother with baby, no power (with-grace) ───
  const c10id = 'demo-meiyu-010';
  store.conversations.set(c10id, {
    id: c10id, customerId: 'cust-meiyu', customerName: 'Mei Ling Yu',
    status: 'with-grace', currentAgent: 'grace', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c10id, 'customer', "My flat has no power since the typhoon. I have a 4-month-old baby. The water damage is everywhere but I can't keep baby warm.", undefined, 5),
      makeMsg(c10id, 'agent', "I'm Grace at Chubb. Your baby's warmth comes first — everything else second. Is baby with you now? Do you have blankets or warm clothing nearby?", 'grace', 4),
      makeMsg(c10id, 'customer', "Yes she's bundled up but I'm so worried. The bedroom ceiling has caved in partially.", undefined, 3),
      makeMsg(c10id, 'agent', "You're doing exactly the right things. If part of the ceiling has collapsed, I want you both away from that room. Is there a safe room in the flat — or a neighbour you could go to? Once I know you're both safe, I'll open an emergency claim and escalate for same-day assessment.", 'grace', 2),
    ],
    routing: [{ assignedAgent: 'grace', reasoning: 'Mother with infant, no power, structural damage — high vulnerability', confidence: 0.97, triggers: ['baby', 'no power', 'ceiling collapsed', 'vulnerable'], timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), agentTurns: { grace: 2 } },
  });

  // ─── 11. Tommy Leung — flooded restaurant, urgent (with-swift) ───
  const c11id = 'demo-tommy-011';
  store.conversations.set(c11id, {
    id: c11id, customerId: 'cust-tommy', customerName: 'Tommy Leung',
    status: 'with-swift', currentAgent: 'swift', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c11id, 'customer', "My restaurant in Wan Chai is flooded. Kitchen equipment destroyed — I'm losing HKD 50,000 a day staying closed. I need emergency support NOW.", undefined, 11),
      makeMsg(c11id, 'agent', "Swift here. Commercial flood, kitchen equipment loss — understood. Policy number?", 'swift', 10),
      makeMsg(c11id, 'customer', 'HK-COM-2023-55312. Restaurant has been open 8 years. Equipment is 3 years old.', undefined, 9),
      makeMsg(c11id, 'agent', 'Policy confirmed — HK-COM-2023-55312.\n1. Emergency claim opened: CLM-COM-55312-T\n2. Commercial assessor: priority slot — tomorrow AM\n3. Document everything NOW: photos of all damaged equipment, flood level markers on walls\n4. Business interruption cover: yes, this policy includes it — claim from Day 1 of closure\n\nDo NOT dispose of any damaged equipment before assessment.', 'swift', 8),
      makeMsg(c11id, 'customer', 'Business interruption — how much per day can I claim?', undefined, 7),
      makeMsg(c11id, 'agent', 'Your BI limit is HKD 3M/year — daily cap based on your declared turnover, typically 80% of average daily revenue. With 8 years of trading history, documentation will support a strong claim. I need your past 3 months of bank statements for the BI calculation. Can you email those to claims-hk@chubb.com with your ref?', 'swift', 6),
    ],
    routing: [{ assignedAgent: 'swift', reasoning: 'Commercial flooding, urgent business loss, needs immediate action plan', confidence: 0.93, triggers: ['commercial', 'flooding', 'urgent', 'losing money'], timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), agentTurns: { swift: 3 } },
  });

  // ─── 12. Rachel Pang — rental property coverage (with-kara) ───
  const c12id = 'demo-rachel-012';
  store.conversations.set(c12id, {
    id: c12id, customerId: 'cust-rachel', customerName: 'Rachel Pang',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c12id, 'customer', "I own a flat in Taikoo Shing that I rent out. The tenant says there's water damage from the typhoon. Am I covered? The tenant isn't on my policy.", undefined, 22),
      makeMsg(c12id, 'agent', "Hi, I'm Kara at Chubb. Good question — for landlord policies, typhoon damage to the building structure (walls, floors, ceiling) is your responsibility and is covered. Contents belonging to the tenant are not covered under your policy — they need their own contents insurance.", 'kara', 21),
      makeMsg(c12id, 'customer', 'What about loss of rental income while repairs are done?', undefined, 20),
      makeMsg(c12id, 'agent', 'Loss of rental income is covered if your policy includes "loss of rent" add-on — typically pays up to 12 months of rent while property is uninhabitable due to an insured event like typhoon damage. Can I check your policy number to confirm if you have this add-on?', 'kara', 19),
      makeMsg(c12id, 'customer', 'Yes — HK-HOME-2022-78901. And who is responsible for arranging repairs — me or the tenant?', undefined, 18),
      makeMsg(c12id, 'agent', 'As landlord, structural repairs are your responsibility. Your policy covers this. Your tenant is responsible only for their own contents. For your policy HK-HOME-2022-78901, I can see you do have the loss of rent rider — you can claim from Day 1 the property is declared uninhabitable. Shall I open a landlord damage claim now?', 'kara', 17),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Landlord policy question — informational, no urgency or distress', confidence: 0.90, triggers: ['policy question', 'rental', 'landlord', 'coverage'], timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 21 * 60 * 1000).toISOString(), agentTurns: { kara: 3 } },
  });

  // ─── 13. Brian Yip — rejected claim, threatening regulator (phoenix) ───
  const c13id = 'demo-brian-013';
  store.conversations.set(c13id, {
    id: c13id, customerId: 'cust-brian', customerName: 'Brian Yip',
    status: 'with-phoenix', currentAgent: 'phoenix', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c13id, 'customer', 'My claim was rejected and I completely disagree. The damage is clearly covered under my policy.', undefined, 14),
      makeMsg(c13id, 'agent', "I'm Phoenix at Chubb. I hear you — a rejected claim you believe is valid is deeply frustrating. Tell me everything: what was damaged, what did the rejection say?", 'phoenix', 13),
      makeMsg(c13id, 'customer', 'Assessor said it was pre-existing damage. That is absolutely false. I have photos from last month showing the roof was in perfect condition.', undefined, 12),
      makeMsg(c13id, 'agent', "That is a material dispute — if you have dated photographic evidence showing the roof's condition prior to the typhoon, that directly challenges the pre-existing finding. I am flagging this for formal reassessment. Please send your photos to claims-review@chubb.com — reference your claim number. You have the right to a formal review and I will ensure that happens.", 'phoenix', 11),
      makeMsg(c13id, 'customer', "If this isn't reviewed I am filing a complaint with the Insurance Authority.", undefined, 10),
      makeMsg(c13id, 'agent', "That is absolutely your right, Mr. Yip, and I want to be transparent about that process. However — a formal internal review with your photographic evidence is the fastest path to resolution. I am escalating this to our Appeals team right now with priority status. You will receive written confirmation of the review within 24 hours. May I confirm the best email to reach you?", 'phoenix', 9),
    ],
    routing: [{ assignedAgent: 'phoenix', reasoning: 'Rejected claim dispute, evidence available, threatening regulator — Phoenix for de-escalation', confidence: 0.95, triggers: ['rejected claim', 'dispute', 'Insurance Authority', 'complaint'], timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(), agentTurns: { phoenix: 3 } },
  });

  // ─── 14. Alice Poon — wants human (human-queue) ───
  const c14id = 'demo-alice-014';
  store.conversations.set(c14id, {
    id: c14id, customerId: 'cust-alice', customerName: 'Alice Poon',
    status: 'human-queue', currentAgent: 'human', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c14id, 'customer', "Hi, I have a complicated claim and I would really prefer to speak with a real person.", undefined, 7),
      makeMsg(c14id, 'agent', "Absolutely understood. I'm connecting you with a human agent now. Estimated wait: 5–8 minutes. Can I take your name and policy number while you wait?", 'grace', 6),
      makeMsg(c14id, 'customer', 'Alice Poon. Policy HK-HOME-2024-23311. It involves a dispute with my building management.', undefined, 5),
      makeMsg(c14id, 'system', 'Customer requested human agent — queued', undefined, 6),
    ],
    routing: [
      { assignedAgent: 'grace', reasoning: 'Human request keyword', confidence: 1.0, triggers: ['real person', 'human', 'prefer to speak'], timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
      { assignedAgent: 'human', reasoning: 'Explicit human request — immediate queue', confidence: 1.0, triggers: ['human request'], timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
    ],
    metrics: { startedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(), agentTurns: { grace: 1 }, waitTimeMs: 5 * 60 * 1000 },
  });

  // ─── 15. Peter Tsui — motorcycle damaged (with-swift) ───
  const c15id = 'demo-peter-015';
  store.conversations.set(c15id, {
    id: c15id, customerId: 'cust-peter', customerName: 'Peter Tsui',
    status: 'with-swift', currentAgent: 'swift', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c15id, 'customer', 'My motorbike fell over in the typhoon winds. Exhaust and fairing cracked. Policy HK-MOT-2024-34521.', undefined, 25),
      makeMsg(c15id, 'agent', 'Swift here. Motorbike — typhoon wind damage, exhaust and fairing. Confirmed HK-MOT-2024-34521.\n\nClaim ref: CLM-MOT-34521-T\nPhotos: fairing crack, exhaust, full bike both sides → claims-hk@chubb.com\nAssessor: 2-3 business days for motorcycle\n\nIs the bike rideable or do you need recovery?', 'swift', 24),
      makeMsg(c15id, 'customer', "It's rideable but I shouldn't ride it with cracked fairing. Can I take it to my usual mechanic?", undefined, 23),
      makeMsg(c15id, 'agent', "Not until assessed — using an unapproved repairer before assessment can affect your claim. I am adding your preferred mechanic to your claim notes. After the assessor visit, if they're Chubb approved, you can go direct. I'll email you the list of approved motorcycle repairers in your area.", 'swift', 22),
    ],
    routing: [{ assignedAgent: 'swift', reasoning: 'Vehicle damage, action-oriented — no distress', confidence: 0.92, triggers: ['vehicle damage', 'motorcycle', 'repair'], timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(), agentTurns: { swift: 2 } },
  });

  // ─── 16. Grace Au — home office equipment (with-kara) ───
  const c16id = 'demo-graceAu-016';
  store.conversations.set(c16id, {
    id: c16id, customerId: 'cust-graceAu', customerName: 'Grace Au',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c16id, 'customer', "My home office got flooded — lost a work laptop, dual monitors, and a standing desk. These are for work, not personal use. Does my home insurance cover work equipment?", undefined, 30),
      makeMsg(c16id, 'agent', "Great question, Grace. Standard home contents policies typically cover home office equipment up to a sublimit — usually HKD 15,000–30,000 — even if used for work. Items exclusively owned by an employer (company property) are not covered and must go through their corporate insurance. Can I check your policy?", 'kara', 29),
      makeMsg(c16id, 'customer', 'HK-HOME-2023-90211. The laptop is mine but I use it for work. Monitors are also mine. Total value about HKD 22,000.', undefined, 28),
      makeMsg(c16id, 'agent', "Your policy HK-HOME-2023-90211 has a HKD 25,000 home office sublimit — your HKD 22,000 of equipment is within scope. Subject to depreciation and your HKD 500 excess, you should be well covered. Shall I open a contents claim for the home office equipment?", 'kara', 27),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Coverage question about work equipment — policy knowledge needed', confidence: 0.89, triggers: ['home office', 'work equipment', 'coverage question'], timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(), agentTurns: { kara: 2 } },
  });

  // ─── 17. 林生 — post-traumatic, shaken after evacuation (with-grace, zh) ───
  const c17id = 'demo-lam-017';
  store.conversations.set(c17id, {
    id: c17id, customerId: 'cust-lam', customerName: '林先生',
    status: 'with-grace', currentAgent: 'grace', language: 'zh', priority: 'HIGH',
    messages: [
      makeMsg(c17id, 'customer', '我哋啱啱被消防疏散，成棟樓都係水，我手震震...我唔知我屋企點樣喇', undefined, 4),
      makeMsg(c17id, 'agent', '林先生，我係Grace，Chubb嘅AI理賠專員。您剛剛經歷咗好大嘅驚嚇，手震係完全正常嘅反應。您而家人係安全位置嗎？', 'grace', 3),
      makeMsg(c17id, 'customer', '係，我喺對面嘅商場。但係我唔知道屋企損失幾大，我好擔心。', undefined, 2),
      makeMsg(c17id, 'agent', '好，您係安全的地方，呢個係最重要。理賠嘅事唔急，我哋慢慢處理。當消防同意您可以返屋企嘅時候，我陪您一步一步記錄損失。而家最緊要係您稍作休息。您有家人或朋友可以聯絡嗎？', 'grace', 1),
    ],
    routing: [{ assignedAgent: 'grace', reasoning: 'Post-evacuation, shaking, traumatised — emotional first aid needed', confidence: 0.98, triggers: ['evacuation', 'shaking', 'traumatised', 'cantonese'], timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), agentTurns: { grace: 2 } },
  });

  // ─── 18. Simon Kwok — assessor complaint (with-phoenix) ───
  const c18id = 'demo-simon-018';
  store.conversations.set(c18id, {
    id: c18id, customerId: 'cust-simon', customerName: 'Simon Kwok',
    status: 'with-phoenix', currentAgent: 'phoenix', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c18id, 'customer', "Your assessor was rude, dismissive, and spent less than 10 minutes in my flat. He said my claim is only worth HKD 8,000 when the damage is clearly over HKD 40,000.", undefined, 16),
      makeMsg(c18id, 'agent', "Mr. Kwok, I hear you — and what you've described about the assessor's conduct is not acceptable. A 10-minute assessment for what sounds like significant damage is not thorough enough. I am flagging this for a second assessment by a senior assessor. Can you describe the damage?", 'phoenix', 15),
      makeMsg(c18id, 'customer', 'Living room ceiling collapsed. Flooring buckled across the entire flat. Kitchen cabinetry warped. All from water ingress.', undefined, 14),
      makeMsg(c18id, 'agent', "That scope of damage — ceiling collapse, full-flat flooring, kitchen cabinetry — absolutely warrants a detailed assessment, not a 10-minute visit. I am: 1) escalating a formal complaint about the assessor's conduct, 2) requesting a senior assessor for full reassessment within 48 hours, 3) noting your estimate of HKD 40,000+ for the reassessment brief. You will receive written confirmation within 2 hours.", 'phoenix', 13),
    ],
    routing: [{ assignedAgent: 'phoenix', reasoning: 'Formal complaint about assessor conduct and undervalued assessment', confidence: 0.94, triggers: ['assessor complaint', 'dispute', 'unacceptable', 'rude'], timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), agentTurns: { phoenix: 2 } },
  });

  // ─── 19. Irene Ho — neighbour's tree fell on my property (with-kara) ───
  const c19id = 'demo-irene-019';
  store.conversations.set(c19id, {
    id: c19id, customerId: 'cust-irene', customerName: 'Irene Ho',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c19id, 'customer', "My neighbour's tree fell on my garden wall during the typhoon. Who is responsible — me or them? Do I claim on my policy or theirs?", undefined, 40),
      makeMsg(c19id, 'agent', "Good question, Irene. In HK, typhoon damage is generally treated as an Act of God — your neighbour is not automatically liable unless you can prove negligence (e.g., the tree was dead or poorly maintained and they were notified). In most cases, you claim on your own policy for your property damage.", 'kara', 39),
      makeMsg(c19id, 'customer', 'The tree was visibly leaning before the typhoon. I mentioned it to them last year.', undefined, 38),
      makeMsg(c19id, 'agent', "That's a significant detail — if you can document that you notified them (text message, letter, email) and they failed to act, you may have grounds for a third-party liability claim against them. Your own policy would still pay first and may then subrogate against the neighbour's liability policy. I recommend: 1) Claim on your own policy now, 2) Preserve all evidence of prior notification, 3) I'll flag this for our legal support team. Policy number?", 'kara', 37),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Third-party liability question — policy and legal knowledge needed', confidence: 0.88, triggers: ['neighbour', 'liability', 'whose policy', 'coverage question'], timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 39 * 60 * 1000).toISOString(), agentTurns: { kara: 2 } },
  });

  // ─── 20. Jack Ma — car park flood, multiple cars (with-swift) ───
  const c20id = 'demo-jack-020';
  store.conversations.set(c20id, {
    id: c20id, customerId: 'cust-jack', customerName: 'Jack Ma',
    status: 'with-swift', currentAgent: 'swift', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c20id, 'customer', 'My car park flooded. Two of my cars are submerged. A BMW 5 Series and a Lexus SUV. Both total losses I think.', undefined, 13),
      makeMsg(c20id, 'agent', "Swift here. Two vehicles submerged — BMW 5 Series and Lexus SUV. I'll open a claim for each. Do you have both policy numbers?", 'swift', 12),
      makeMsg(c20id, 'customer', 'HK-MOT-2023-11211 (BMW) and HK-MOT-2023-11212 (Lexus).', undefined, 11),
      makeMsg(c20id, 'agent', 'Both confirmed. Two claim refs opened:\n- CLM-MOT-11211-T (BMW 5 Series)\n- CLM-MOT-11212-T (Lexus SUV)\n\nCRITICAL: Do NOT attempt to start either vehicle — water in engine causes irreparable hydrolocking damage.\n\nTwo recovery trucks dispatched — ETA 2 hours.\nPhotos needed: water line on each car, interiors, engine bay.\n\nAre the cars in a private or managed car park?', 'swift', 10),
    ],
    routing: [{ assignedAgent: 'swift', reasoning: 'Multiple vehicle total loss, urgent action required', confidence: 0.96, triggers: ['vehicle damage', 'submerged', 'urgent', 'total loss'], timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), agentTurns: { swift: 2 } },
  });

  // ─── 21. Winnie Chu — mould after flooding (with-kara) ───
  const c21id = 'demo-winnie-021';
  store.conversations.set(c21id, {
    id: c21id, customerId: 'cust-winnie', customerName: 'Winnie Chu',
    status: 'with-kara', currentAgent: 'kara', language: 'en', priority: 'MEDIUM',
    messages: [
      makeMsg(c21id, 'customer', "We had flooding 2 weeks ago. I submitted a claim for the immediate damage. But now there's mould spreading across the walls. Is mould remediation covered?", undefined, 45),
      makeMsg(c21id, 'agent', "Hi Winnie, I'm Kara. Yes — mould that is a direct result of an insured flood event is typically covered as consequential damage. The key is establishing the causal link to your original typhoon claim. Do you have your original claim reference number?", 'kara', 44),
      makeMsg(c21id, 'customer', 'CLM-2024-67821-T. The mould is in the bedroom and living room walls — the same areas that were flooded.', undefined, 43),
      makeMsg(c21id, 'agent', "I can see claim CLM-2024-67821-T in our system. Given the mould is in the directly flooded areas, this is very likely covered as consequential damage under the same claim. I'll add a mould remediation assessment request to your existing claim — an environmental specialist will visit. In the meantime: improve ventilation, document the spread with dated photos, and do not paint over it before assessment.", 'kara', 42),
    ],
    routing: [{ assignedAgent: 'kara', reasoning: 'Consequential damage coverage question — follow-up on existing claim', confidence: 0.90, triggers: ['mould', 'coverage', 'consequential damage', 'policy question'], timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() }],
    metrics: { startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(), agentTurns: { kara: 2 } },
  });

  // ─── 22. Danny Fung — angry, delayed payout (human-queue) ───
  const c22id = 'demo-danny-022';
  store.conversations.set(c22id, {
    id: c22id, customerId: 'cust-danny', customerName: 'Danny Fung',
    status: 'human-queue', currentAgent: 'human', language: 'en', priority: 'HIGH',
    messages: [
      makeMsg(c22id, 'customer', 'I was told my payout would be transferred within 10 business days. It has been 3 weeks. WHERE IS MY MONEY.', undefined, 8),
      makeMsg(c22id, 'agent', "Mr. Fung, I'm Phoenix at Chubb. A 3-week delay beyond the promised 10 days is a serious failure and you have every right to be angry. I'm pulling your claim now. Claim reference or policy number?", 'phoenix', 7),
      makeMsg(c22id, 'customer', 'CLM-2024-54330-T. I need the money for emergency repairs. My family is living in a damaged flat.', undefined, 6),
      makeMsg(c22id, 'agent', "CLM-2024-54330-T — I can see the payout was approved 18 days ago. This should not have taken this long. I am escalating to our Finance team with an urgent flag right now and requesting same-day bank transfer review. A senior case manager will call you within 30 minutes with a confirmed transfer date.", 'phoenix', 5),
      makeMsg(c22id, 'system', 'Escalated to human — delayed payment, family in damaged property', undefined, 5),
    ],
    routing: [
      { assignedAgent: 'phoenix', reasoning: 'Angry about delayed payment, family in damaged home — urgent', confidence: 0.94, triggers: ['delayed payment', 'angry', 'urgent', 'family'], timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      { assignedAgent: 'human', reasoning: 'Payment escalation — needs human Finance team contact', confidence: 1.0, triggers: ['payment delay', 'urgent escalation'], timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    ],
    metrics: { startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), firstResponseAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(), agentTurns: { phoenix: 2 }, waitTimeMs: 5 * 60 * 1000 },
  });
}

seed();
