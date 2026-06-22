# latticework

Mental-models thinking mode for Claude Code, structured as an always-on plugin.

Before answering a judgment call, the agent climbs a short ladder instead of
blurting the first-order answer:

1. **Frame** — the real question, and the assumption hiding in it
2. **Competence** — is this inside what I actually know?
3. **Forward** — and then what? (second-order consequences)
4. **Backward** — assume it failed; what killed it? (inversion / premortem)
5. **Decide** — one clear answer; cite a model only if it changed the answer

The guardrail keeps it honest: rigorous, not performative. No tours of
frameworks, no lenses named that were not used, no ladder on trivia.

## How it works

A `SessionStart` hook injects the compact ladder as hidden context every
session, so the discipline is always on (not opt-in like a plain skill). A
`UserPromptSubmit` hook watches for level switches. The full model catalog and
domain references load only when a problem calls for them, so the per-turn
payload stays tiny.

Architecture and hook mechanics are modeled on
[ponytail](https://github.com/DietrichGebert/ponytail) (MIT). The content —
the ladder, the models, the levels — is original.

## Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| lite  | `/latticework lite`  | Forward + backward only, silent. Tight answer. |
| full  | `/latticework`       | Whole ladder, reasoning shown where it mattered. Default. |
| ultra | `/latticework ultra` | Whole ladder + one domain model + written premortem. |

Set a default: `export LATTICEWORK_DEFAULT_MODE=ultra`, or
`~/.config/latticework/config.json` → `{ "defaultMode": "lite" }`.
Resolution: env var > config file > full. `off` starts sessions inactive.

## Commands

- `/latticework-forward` — trace second- and third-order consequences
- `/latticework-invert` — premortem; reason backward from failure
- `/latticework-help` — reference card

## Install (Claude Code)

```
/plugin marketplace add Egarter/latticework
/plugin install latticework@latticework
```

Or load locally for testing by pointing the marketplace at this folder. Node
must be on PATH for the always-on hooks; without it the skills still work, the
auto-activation just stays quiet.

## The models

Nine general thinking models ship in the main skill. Further models live in
`references/`, grouped by how they're used in the ladder (see the situation,
trace consequences, find leverage and decide), and load on demand.

The model names are drawn from the common mental-models tradition in decision
science and strategy: Munger's "latticework" idea, classical logic and
probability, systems thinking, and basic physics and economics. These are
shared concepts, not anyone's property. Every description here is written from
scratch; no book's text, examples, or curation is reproduced.
