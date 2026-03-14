# Demo Scenarios

Six pre-built scenarios accessible via the `/simulator` page.

## 1. Mrs. Chan — Flooded Flat

**Customer:** Mrs. Chan (age 78, alone)
**Language:** Cantonese (中文)
**Expected Agent:** Grace 💙
**Why:** Elderly, alone, distressed, flooding

**Script:**
| Delay | Message |
|-------|---------|
| 0s | 你好，我係Chan太太。我屋企入晒水，我唔知點算... |
| 4s | 我78歲，一個人住，好驚... |
| 8s | 客廳地板已經有水，我搬唔到啲嘢 |

**Expected routing triggers:** `elderly`, `alone`, `distressed`, `flooding`

---

## 2. David Lee — Car Crushed by Tree

**Customer:** David Lee
**Language:** English
**Expected Agent:** Swift ⚡
**Why:** Urgent vehicle damage, wants fast action, has policy number ready

**Script:**
| Delay | Message |
|-------|---------|
| 0s | Tree fell on my car during the typhoon. Total write-off I think. Need to start a claim NOW. |
| 4s | Policy number is HK-MOT-2024-88821. Car is a 2023 Toyota Camry. |
| 7s | What do I do next? Can someone come today? |

**Expected routing triggers:** `urgent`, `vehicle damage`, `NOW`, `fast action needed`

---

## 3. Policy Question — What is my excess?

**Customer:** James Wong
**Language:** English
**Expected Agent:** Kara 📚
**Why:** Policy question, no urgency or distress, FAQ-type query

**Script:**
| Delay | Message |
|-------|---------|
| 0s | Hi, I have some window damage from the typhoon. Before I claim, what is my excess? |
| 4s | Also — does my policy cover water that came in through the broken window? |
| 7s | And how long will the claim take? |

**Expected routing triggers:** `policy question`, `excess`, `coverage query`, `FAQ`

---

## 4. Furious Customer — Third Call

**Customer:** Richard Tam
**Language:** English
**Expected Agent:** Phoenix 🔥 → Human Queue
**Why:** Angry, repeated contact, legal threat triggers mandatory human escalation

**Script:**
| Delay | Message |
|-------|---------|
| 0s | This is absolutely ridiculous. I have called THREE TIMES about my roof damage and nothing has happened. |
| 3s | I submitted my claim 2 weeks ago. No assessor, no update, nothing. This is unacceptable. |
| 6s | If I don't hear something concrete today I am calling my lawyer. |

**Expected routing:** Phoenix first, then hard override to Human Queue on "lawyer" keyword.

---

## 5. Window Smashed — Distressed

**Customer:** Sarah Lam
**Language:** English
**Expected Agent:** Grace 💙
**Why:** Safety emergency, terrified, young child present

**Script:**
| Delay | Message |
|-------|---------|
| 0s | My window just exploded during the storm. I'm terrified. Glass everywhere. |
| 4s | My 3 year old is here. Wind and rain coming in. I don't know what to do. |
| 7s | I need help NOW. This is an emergency. |

**Expected routing triggers:** `terrified`, `child`, `emergency`, `don't know what to do`

Note: Despite urgency, child safety and fear triggers Grace (empathy) over Swift (speed).

---

## 6. Multiple Properties — Complex Business

**Customer:** Mr. Cheung
**Language:** English
**Expected Agent:** Phoenix 🔥 → Human Queue
**Why:** Complex multi-policy situation, business impact, requests senior person

**Script:**
| Delay | Message |
|-------|---------|
| 0s | I have three commercial properties all damaged in the typhoon. All under different policies. |
| 4s | Two properties have roof damage, one has flooding. I need all three claims expedited. |
| 7s | My business is losing money every day. Who is the senior person I can speak with? |

**Expected routing:** Phoenix for complexity/frustration, likely escalates to Human Queue after "senior person" request (implicit human request).
