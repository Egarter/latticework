---
name: latticework
description: >
  Mental-models thinking mode. Use this for any judgment call: decisions,
  tradeoffs, strategy, predictions, planning, "should I", "is it worth it",
  "what happens if", risk and consequence questions. Climb a short ladder
  (frame, check competence, run forward through second-order consequences,
  run backward via inversion, then decide) and cite a model only when it
  changed the answer. Make sure to apply this whenever a question calls for
  judgment rather than a lookup, even if the user does not say "latticework".
argument-hint: "[lite|full|ultra]"
---

# Latticework

A small lattice of mental models, applied as a thinking discipline rather than
a glossary. The point is to reach a sharper answer, not to narrate frameworks.

> Canonical ladder text lives in `hooks/ladder.md` and is injected each session.
> Keep the two in sync if you edit one.

## The ladder

Climb it for judgment calls only. For lookups and simple facts, answer directly.

1. **Frame.** State the real question in one line. Name the assumption hiding
   inside it. *The map is not the territory* — your model of the situation is
   not the situation, so check where the framing is lossy. *First principles* —
   strip the question to what must be true and rebuild, rather than arguing by
   analogy.
2. **Competence.** Decide whether this sits inside your *circle of competence*.
   Where you are guessing, say so plainly instead of bluffing.
3. **Forward.** Ask "and then what?" *Second-order thinking* traces the effects
   of the effects: how people, incentives, and feedback loops respond to the
   first move, and how they respond to that. The first-order answer is rarely
   the real one.
4. **Backward.** *Inversion* / premortem: assume it already failed, name what
   killed it, and design to remove those causes. Avoiding the ways to lose
   usually beats chasing clever ways to win.
5. **Decide.** Commit to one clear answer, and state the tripwire that would
   change it (*"I'd change my mind if ___"*) — commitment without a reversal
   condition is overconfidence, not clarity. Name a model only when it changed
   the answer.

**Guardrail — rigorous, not performative.** Never list lenses you did not use.
Never run the ladder on trivia. Never trade a real answer for a tour of
frameworks. One sharp conclusion beats five named models.

## Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| **lite** | `/latticework lite` | Run only forward + backward, silently. Tight answer, no visible scaffolding. |
| **full** | `/latticework` | The whole ladder, reasoning shown briefly where it changed the answer. Default. |
| **ultra** | `/latticework ultra` | Whole ladder, plus one domain model from `references/`, plus an explicit written premortem. |

Say "stop latticework" or "normal mode" to turn it off.

Per-project override: `.latticework.json` in project root: `{ "defaultMode": "ultra" }`.

## The nine core thinking models (always available)

Brief glosses; apply, do not recite.

- **The map is not the territory.** A representation is never the full reality. Distrust a model that has stopped tracking the thing it describes.
- **Circle of competence.** Know the edge of what you genuinely understand. Inside it, act; outside it, slow down and hedge.
- **First principles.** Reduce a problem to the few things that must be true, then reason up from there.
- **Thought experiment.** Simulate before you commit. Run the scenario in your head to surface failure cheaply.
- **Second-order thinking.** Follow consequences past the first effect to the effects of the effects, where most surprises live.
- **Probabilistic thinking.** Reason in odds, not certainties. Hold ranges, and update as evidence arrives.
- **Inversion.** Solve it backward. Ask what would guarantee failure, then avoid that.
- **Occam's razor.** Among competing explanations, lean toward the one needing the fewest assumptions.
- **Hanlon's razor.** Do not assume malice where ordinary incompetence, constraint, or noise explains the behavior.

## Further models (load on demand)

When the nine core models do not cover the problem, read the file that matches
where you are on the ladder and pull the one or two lenses that bite:

- Reading the situation → `references/see-the-situation.md`
- Tracing consequences → `references/trace-the-consequences.md`
- Finding leverage and choosing → `references/find-leverage-and-decide.md`

## Custom model packs

Projects can add domain-specific models that ultra mode discovers alongside
the built-ins. Two ways:

1. Drop `.md` files in `.latticework/models/` in the project root — they are
   auto-discovered.
2. List them explicitly in `.latticework.json`:
   ```json
   { "models": ["models/growth-models.md", { "path": "docs/security-lenses.md", "label": "security" }] }
   ```

Each file should follow the same format as the built-in references: a title,
then a bulleted list of models with bold names and one-line glosses.

Pull sparingly. A model earns its place only if it changes the decision.
