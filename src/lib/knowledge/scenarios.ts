import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'elderly-chan',
    name: 'Mrs. Chan — Flooded Flat',
    description: 'Elderly Cantonese-speaking customer, flat flooded, scared and confused',
    expectedAgent: 'grace',
    customerName: 'Mrs. Chan',
    language: 'zh',
    messages: [
      { delayMs: 0, content: '你好，我係Chan太太。我屋企入晒水，我唔知點算...' },
      { delayMs: 4000, content: '我78歲，一個人住，好驚...' },
      { delayMs: 8000, content: '客廳地板已經有水，我搬唔到啲嘢' },
    ],
  },
  {
    id: 'urgent-david',
    name: 'David Lee — Car Crushed',
    description: 'Urgent: tree fell on car, needs fast claim action',
    expectedAgent: 'swift',
    customerName: 'David Lee',
    language: 'en',
    messages: [
      { delayMs: 0, content: 'Tree fell on my car during the typhoon. Total write-off I think. Need to start a claim NOW.' },
      { delayMs: 4000, content: 'Policy number is HK-MOT-2024-88821. Car is a 2023 Toyota Camry.' },
      { delayMs: 7000, content: 'What do I do next? Can someone come today?' },
    ],
  },
  {
    id: 'policy-question',
    name: 'Policy Question — Excess',
    description: 'Customer wants to understand their excess before claiming',
    expectedAgent: 'kara',
    customerName: 'James Wong',
    language: 'en',
    messages: [
      { delayMs: 0, content: 'Hi, I have some window damage from the typhoon. Before I claim, what is my excess?' },
      { delayMs: 4000, content: 'Also — does my policy cover water that came in through the broken window?' },
      { delayMs: 7000, content: 'And how long will the claim take?' },
    ],
  },
  {
    id: 'angry-customer',
    name: 'Furious Customer — Third Call',
    description: 'Angry customer, third contact, threatening legal action',
    expectedAgent: 'phoenix',
    customerName: 'Richard Tam',
    language: 'en',
    messages: [
      { delayMs: 0, content: 'This is absolutely ridiculous. I have called THREE TIMES about my roof damage and nothing has happened.' },
      { delayMs: 3000, content: 'I submitted my claim 2 weeks ago. No assessor, no update, nothing. This is unacceptable.' },
      { delayMs: 6000, content: "If I don't hear something concrete today I am calling my lawyer." },
    ],
  },
  {
    id: 'window-distressed',
    name: 'Window Smashed — Distressed',
    description: 'Typhoon smashed window, customer scared, needs both speed and empathy',
    expectedAgent: 'grace',
    customerName: 'Sarah Lam',
    language: 'en',
    messages: [
      { delayMs: 0, content: "My window just exploded during the storm. I'm terrified. Glass everywhere." },
      { delayMs: 4000, content: "My 3 year old is here. Wind and rain coming in. I don't know what to do." },
      { delayMs: 7000, content: 'I need help NOW. This is an emergency.' },
    ],
  },
  {
    id: 'complex-business',
    name: 'Multiple Properties — Complex',
    description: 'Business owner with damage across multiple properties, needs expert handling',
    expectedAgent: 'phoenix',
    customerName: 'Mr. Cheung',
    language: 'en',
    messages: [
      { delayMs: 0, content: 'I have three commercial properties all damaged in the typhoon. All under different policies.' },
      { delayMs: 4000, content: 'Two properties have roof damage, one has flooding. I need all three claims expedited.' },
      { delayMs: 7000, content: 'My business is losing money every day. Who is the senior person I can speak with?' },
    ],
  },
];
