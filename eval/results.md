# Test results

All tests use Claude (sonnet) as the base model. Each test uses independent
agents: one or two responders and a separate blind judge that is told nothing
about which method produced which response.

## Scoring rubric

Every response is scored 0–2 on five dimensions:

| Dimension | 0 | 1 | 2 |
|-----------|---|---|---|
| Reframes the real question | Accepts the question as stated | Partially reframes | Names the hidden assumption |
| Consequence depth | First-order only | Some second-order | Traces effects-of-effects |
| Failure-mode specificity | Generic ("could go wrong") | Names a risk | Concrete, situation-specific killer |
| Committed call + tripwire | "It depends" | Clear call, no reversal condition | Clear call + "I'd change my mind if ___" |
| Honest uncertainty | Presents as certain | Hedges vaguely | Flags specific gaps in knowledge |

Maximum: 10 per response.

---

## Test 1 — Single-message quality

**What it tests:** does the ladder improve the quality of a single response to a
judgment call?

**Method:** four product/GTM/growth questions. Each answered by two independent
agents — one plain, one with the ladder injected. Both wrote in flowing prose
with no section headers or labeled rungs, so the blind judge could not detect the
method from formatting. Mapping randomized per question.

**Questions:**

| # | Question |
|---|----------|
| Q1 | Should a $6M ARR usage-based API add flat-rate enterprise pricing? |
| Q2 | PLG growth plateaued at $4M ARR — hire an outbound sales team? |
| Q3 | Three mid-performing products — kill two and go all-in on one? |
| Q4 | A big competitor is moving down-market into our SMB segment — flee up-market? |

**Results:**

| Question | Plain | Ladder | Gap |
|----------|:-----:|:------:|:---:|
| Q1 — Enterprise pricing | 8 | 10 | +2 |
| Q2 — PLG plateau | 9 | 10 | +1 |
| Q3 — Product focus | 9 | 10 | +1 |
| Q4 — Competitive positioning | 8 | 10 | +2 |
| **Average** | **8.5** | **10.0** | **+1.5** |

**Finding:** the ladder won all 4 questions. The consistent winning dimension
was the explicit reversal condition ("I'd change my mind if ___") — judges cited
it as the separating factor on Q1 and Q4, calling it "a concrete, falsifiable
trigger the reader can actually check against their own data." Both the ladder
and plain responses improved over an earlier run; the ladder's gain was larger
because the tripwire cue in the DECIDE step gave judges a clear, scoreable
difference on the commitment dimension.

---

## Test 2 — Multi-turn conversation quality

**What it tests:** does the ladder + in-session tool offers produce better
outcomes across a full conversation, not just a single reply?

**Method:** two GTM scenarios, each run as a 3-turn simulated conversation
(initial question → user pushes back with new data → user finalizes the
decision). Same model, same user messages, blind judges scored the full
conversation arc.

**Scenarios:**

| # | Scenario | Turns |
|---|----------|-------|
| S1 | $8M ARR startup with 95% NRR gets a Series A term sheet — take the round? | User adds runway constraint (14 months) in turn 2, commits in turn 3 |
| S2 | Competitor launches a free tier — respond with own free tier, drop price, or hold? | User reports 3 lost deals in turn 2, commits to limited free tier in turn 3 |

**Results:**

| Scenario | Plain | Ladder + offers | Gap |
|----------|:-----:|:---------------:|:---:|
| S1 — Series A with NRR leak | 5 | 10 | +5 |
| S2 — Free tier response | 5 | 10 | +5 |
| **Average** | **5.0** | **10.0** | **+5.0** |

Both judges rated the gap "not close."

**What drove the gap:**

1. **Tripwires carried forward.** The ladder set reversal conditions in turn 1
   ("I'd change my mind if ___"). When the user's turn 2 introduced new data, it
   directly activated the tripwire — the assistant recognized the signal and
   shifted its recommendation cleanly. Plain assistants never set tripwires, so
   new information was treated as additional context rather than a decision
   trigger.

2. **The log offer closed the loop.** When the user committed to a decision in
   turn 3, the ladder offered to record it with its failure modes and a review
   date. The plain conversation ended with "good luck." One judge called this
   "the difference between advice and a decision system."

3. **Analysis compounded across turns.** The ladder's turn 2 built on turn 1's
   framework (projecting both paths forward using the new constraint). The plain
   assistant's turn 2 was partially restated from turn 1.

**Caveat:** multi-turn was simulated (one agent wrote all turns), which gives the
ladder a structural advantage in planning the arc. This shows the ceiling, not
necessarily the floor. Trust the direction (large gap), not the exact magnitude.

---

## Test 3 — Discipline check

**What it tests:** does the plugin know when to stay quiet? The in-session tool
offers should fire only at earned moments, not append a CTA to every response.

**Method:** 11 prompts to fresh agents, each with the full ladder + tool-offer
instructions active.

- **8 non-triggering prompts** (should NOT earn an offer): a definition lookup,
  a database recommendation, a sentence rewrite, a formula explanation, a
  low-stakes tool choice, personal advice, a coding task, a general strategy
  question.
- **3 triggering prompts** (should earn an offer): a finalized consequential
  decision (→ log), a committed one-sided plan (→ red-team), and a user visibly
  stuck in circles (→ reframe).

**Results:**

| Category | Prompts | Offers fired | Expected |
|----------|:-------:|:------------:|:--------:|
| Non-triggering | 8 | 0 | 0 |
| Triggering | 3 | 2 | 3 |

**Finding:** zero false positives. The guardrail holds — the plugin does not
CTA-spam. One trigger (stuck user) was missed: the assistant applied reframe
thinking inline instead of surfacing the command, which is the benign direction
of failure.

---

## Summary

| Test | What it measures | Plain | Ladder | Gap |
|------|------------------|:-----:|:------:|:---:|
| Single-message (4 questions) | First-reply quality | 8.5 | 10.0 | +1.5 |
| Multi-turn (2 scenarios) | Full-conversation outcome | 5.0 | 10.0 | +5.0 |
| Discipline (11 prompts) | False-positive offers | — | 0/8 | Pass |

The single-message edge is consistent (+1.5/question). The multi-turn edge is
large (+5.0/scenario). Both are driven by the same mechanism: the ladder forces
commitment with a stated reversal condition, which makes reasoning more
trustworthy on a single reply and compounds into an accountability system across
a conversation.
