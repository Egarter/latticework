# Latticework

A mental-models thinking mode for Claude Code.

Instead of letting the AI blurt the first-order answer to judgment calls,
latticework forces it through a short reasoning ladder before it commits: frame
the real question, check what it actually knows, trace second-order
consequences, assume it failed and ask what killed it, then decide — citing a
model only when it changed the answer.

It ships as a Claude Code plugin with an always-on mode (injected every session)
and eight standalone skills you can invoke when you need a specific lens:

| Command | What it does |
|---------|-------------|
| `/latticework` | The thinking mode itself (lite / full / ultra) |
| `/latticework-forward` | Trace second- and third-order consequences |
| `/latticework-invert` | Premortem — reason backward from failure |
| `/latticework-decide` | Weigh options, check reversibility, commit to a call |
| `/latticework-redteam` | Argue the genuine case against your position |
| `/latticework-log` | Record a decision + the failure modes you feared |
| `/latticework-review` | Revisit past decisions — grade the call, not the luck |
| `/latticework-help` | Quick reference card |

The log/review pair closes a loop that judgment almost never closes: you record
what you decided and what you feared at the time, then revisit it later and ask
whether the *decision* was sound — not whether the outcome was good. Over time,
that builds real calibration.

41 mental models ship across three reference files, organized by where they're
used in the ladder. They load on demand in ultra mode — the per-turn cost stays
small otherwise.

A built-in guardrail keeps it honest: no listing frameworks that weren't used,
no running the ladder on trivia, no trading a real answer for a tour of lenses.
One sharp conclusion beats five named models.

## Install

```
claude plugin install Egarter/latticework
```

Or load locally for a single session:

```
claude --plugin-dir /path/to/latticework
```

Node must be on PATH for the always-on hooks; without it the skills still work
standalone, the auto-activation just stays quiet.

## The ladder

1. **Frame** — the real question, and the assumption hiding in it
2. **Competence** — is this inside what I actually know?
3. **Forward** — and then what? (second-order consequences)
4. **Backward** — assume it failed; what killed it? (inversion / premortem)
5. **Decide** — one clear answer; cite a model only if it changed the answer

## Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| lite  | `/latticework lite`  | Forward + backward only, silent. Tight answer. |
| full  | `/latticework`       | Whole ladder, reasoning shown where it mattered. Default. |
| ultra | `/latticework ultra` | Whole ladder + one domain model + written premortem. |

Set a default: `export LATTICEWORK_DEFAULT_MODE=ultra`, or
`~/.config/latticework/config.json` → `{ "defaultMode": "lite" }`.
Resolution: env var > config file > full. `off` starts sessions inactive.

## Decision ledger

The `/latticework-log` and `/latticework-review` commands keep a ledger at
`$LATTICEWORK_LOG` (default `~/.latticework/decisions.md`). Each entry captures
the decision, the alternatives, and the specific failure modes feared at the
time. When a review comes due, you grade the call — not the outcome:

- **held** — sound decision, and it worked
- **lucky** — worked, but the reasoning was flawed
- **unlucky** — sound decision that lost to something unforeseeable
- **wrong** — a flaw that was knowable at the time, missed

## The models

Nine general thinking models ship in the main skill. 41 total live in
`references/`, grouped by how they're used in the ladder (see the situation,
trace consequences, find leverage and decide), and load on demand.

The model names are drawn from the common mental-models tradition in decision
science and strategy: Munger's "latticework" idea, classical logic and
probability, systems thinking, and basic physics and economics. These are shared
concepts, not anyone's property. Every description is written from scratch.

## How it works

A `SessionStart` hook injects the compact ladder as hidden context every
session, so the discipline is always on. A `UserPromptSubmit` hook watches for
level switches. The full model catalog and domain references load only when a
problem calls for them, so the per-turn payload stays tiny.

## License

MIT
