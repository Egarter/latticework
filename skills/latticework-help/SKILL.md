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
| `/latticework-help` | This card. |

## Off and default

Say "stop latticework" or "normal mode" to disable. Resume with `/latticework`.

Set a default level: `export LATTICEWORK_DEFAULT_MODE=ultra`, or in
`~/.config/latticework/config.json`: `{ "defaultMode": "lite" }`.
Resolution: env var > config file > full. Set `off` to start sessions inactive.
