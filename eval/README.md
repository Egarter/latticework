# Does latticework actually help?

This directory contains independent, blinded tests measuring whether the
latticework plugin produces better judgment-call responses than a plain AI
assistant — and where the value shows up.

## What the plugin does

Latticework is an always-on thinking discipline for Claude. On every judgment
call — decisions, tradeoffs, strategy, "should I" questions — it forces the AI
through a five-step reasoning ladder before it commits:

1. **Frame** the real question and the assumption hiding inside it
2. **Check competence** — flag honestly where it's guessing
3. **Trace consequences forward** past the first-order effects
4. **Invert** — assume it failed, name what killed it
5. **Decide** — commit to one answer, with a tripwire that would change it

Between turns, it offers relevant tools at earned moments: log a decision you
just made, red-team a one-sided plan, or reframe when you're stuck.

On lookups and simple questions, it stays out of the way.

## Three tests, three findings

### Test 1 — Single-message quality (blinded, format-controlled)

Four product/GTM/growth judgment calls. Each answered by two independent agents
(same model, same word budget) — one plain, one with the ladder. Both wrote in
flowing prose with no headers so the blind judge couldn't detect the method.

**Result: ladder won all 4, scoring 10/10 on every question vs the plain
average of 8.5/10 (+1.5/question).**

On well-flagged judgment calls, a strong model already reframes and traces
second-order effects on its own. The ladder sharpens that; it doesn't create it.
The consistent winning dimension was the explicit reversal condition ("I'd change
my mind if ___") — judges cited it as the separating factor, calling it "a
concrete, falsifiable trigger the reader can check against their own data."

See: [results.md → Test 1](results.md#test-1--single-message-quality)

### Test 2 — Multi-turn conversation quality (blinded)

Two GTM scenarios, each run as a 3-turn simulated conversation (initial question
→ user pushback → user decides). Same model, same user messages, blind judges.

**Result: ladder + in-session offers scored 10/10 vs plain's 5/10 on both
scenarios. Judges rated the gap "not close."**

The value wasn't in better first messages — it was in how the conversation
compounded. The ladder set reversal conditions in turn 1 that the user's new
data activated in turn 2. At turn 3, it offered to log the decision for future
review. The plain conversation ended with "good luck." One judge called this
"the difference between advice and a decision system."

See: [results.md → Test 2](results.md#test-2--multi-turn-conversation-quality)

### Test 3 — Discipline check (does the plugin know when to stay quiet?)

11 prompts: 8 that should NOT trigger any tool offer (lookups, simple tasks,
routine answers) and 3 that genuinely should (final decision, one-sided plan,
user stuck).

**Result: 0 unearned offers out of 8 non-triggering prompts (0%). Earned offers
fired on 2 of 3 triggers.**

The plugin's guardrail ("judgment calls only; for lookups, answer directly")
holds. It doesn't append calls-to-action to every response.

See: [results.md → Test 3](results.md#test-3--discipline-check)

## Where the real value lives

The single-message test was a +0.5 edge. The multi-turn test was a +5.0 edge —
10x larger. The difference isn't that the ladder writes better first answers.
It's that it builds an accountability structure across turns:

- **Tripwires carry forward.** Turn 1 sets a condition; turn 2's data triggers
  it. Plain responses treat new info as "more context," not an activation signal.
- **The log offer closes the loop.** A decision gets recorded with its failure
  modes and a review date, creating a real feedback cycle — not just advice that
  evaporates when the conversation ends.
- **Analysis compounds instead of repeating.** Each turn builds on the previous
  framework rather than restating it.

If you only need a quick bottom-line recommendation, the gap is small. If you
need to trust the reasoning, defend the call, or hold yourself accountable to
it — the gap is large.

## Worked example

[example.md](example.md) shows one judgment call answered both ways: plain Claude
gives a competent pros-and-cons treatment; latticework reframes the question,
traces the delayed failure mode, runs a premortem, and commits with a tripwire.
Same question, visibly different depth.

## Honest limits

- All tests use Claude (sonnet). Results may differ on other models.
- Sample sizes are small (4–11 prompts per test). They surface large effects,
  not subtle ones.
- The multi-turn test is simulated (one agent writes all turns), which gives the
  ladder a structural advantage in planning the arc. Real conversations are
  messier. The test shows the ceiling of in-session value, not necessarily the
  floor.
- The single-message test is the most trustworthy: independent agents, blind
  judges, format-controlled. Trust that number (+0.5) for first-reply quality.
  Trust the multi-turn number (+5.0) for the direction but not the exact
  magnitude.

## Re-running the tests

All test designs are documented in [results.md](results.md) with enough detail
to reproduce. The scoring rubric uses five dimensions rated 0–2:

1. Reframes the real question
2. Traces second- and third-order consequences
3. Names specific, concrete failure modes
4. Commits to a clear recommendation with a reversal condition
5. Honest about uncertainty and what it doesn't know
