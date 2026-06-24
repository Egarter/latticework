---
name: latticework-help
description: >
  Quick reference for latticework levels, skills, and commands. Trigger:
  /latticework-help, "latticework help", "how do I use latticework". One-shot
  display; does not change the active level or write any files.
---

# Latticework Help

One-shot reference. Do not change level or persist anything.

## Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| **lite** | `/latticework lite` | Forward + backward only, silent. Tight answer. |
| **full** | `/latticework` | Whole ladder, reasoning shown where it mattered. Default. |
| **ultra** | `/latticework ultra` | Whole ladder + one domain model + written premortem. |

## The ladder

Frame → Competence → Forward (second-order) → Backward (inversion) → Decide.
Cite a model only when it changed the answer.

## Commands

| Command | What it does |
|---------|--------------|
| `/latticework` | The thinking mode itself. |
| `/latticework-forward` | Trace second- and third-order consequences of a move. |
| `/latticework-invert` | Premortem: reason backward from failure. |
| `/latticework-reframe` | Generate alternative framings when you're stuck or solving the wrong problem. |
| `/latticework-decide` | Make a committed call among options. |
| `/latticework-redteam` | Argue the genuine case against your position. |
| `/latticework-log` | Record a decision + its premortem to a dated ledger. |
| `/latticework-review` | Revisit due decisions; grade the call, not the luck. |
| `/latticework-help` | This card. |

## Decision ledger

`/latticework-log` and `/latticework-review` use a ledger at (in order):
1. `$LATTICEWORK_LOG` if set
2. `.latticework/decisions.md` in the project root (if it exists)
3. `~/.latticework/decisions.md` (global default)

Log a real call with what you feared; review it when due and grade the decision
by what was knowable, not how it turned out. `/latticework-review` shows a
running calibration tally (held/lucky/unlucky/wrong) across all reviewed entries.

Due reviews are surfaced automatically at session start.

## In-session tool offers

When active, the ladder may offer one relevant tool at an earned moment — log a
decision just reached, red-team a forceful one-sided plan, or reframe when you're
visibly stuck. At most one, only when earned, never on routine answers.

## Off and default

Say "stop latticework" or "normal mode" to disable. Resume with `/latticework`.

Set a default level: `export LATTICEWORK_DEFAULT_MODE=ultra`, or in
`~/.config/latticework/config.json`: `{ "defaultMode": "lite" }`.
Per-project override: `.latticework.json` in project root: `{ "defaultMode": "ultra" }`.
Resolution: env var > project config > user config > full. Set `off` to start sessions inactive.
