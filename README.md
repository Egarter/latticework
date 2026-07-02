# Latticework

A mental-models thinking mode for Claude Code.

Instead of letting the AI blurt the first-order answer to judgment calls,
latticework forces it through a short reasoning ladder before it commits: frame
the real question, check what it actually knows, trace second-order
consequences, assume it failed and ask what killed it, then decide — citing a
model only when it changed the answer.

It ships as a Claude Code plugin with an always-on mode (injected every session)
and eight standalone skills for when you need a specific lens.

A built-in guardrail keeps it honest: no listing frameworks that weren't used,
no running the ladder on trivia, no trading a real answer for a tour of lenses.
One sharp conclusion beats five named models.

## Skills

### `/latticework` — the always-on thinking mode

The core discipline, active every session. When you ask a judgment call — a
decision, a strategy question, a "should I" — Claude climbs the ladder before
answering instead of blurting the first-order response. For lookups and simple
facts it stays out of the way.

Run it at three levels: `lite` (forward + backward only, tight answer), `full`
(whole ladder, reasoning shown where it changed the answer, default), or `ultra`
(whole ladder + explicit premortem + one domain model from the reference files).

### `/latticework-forward` — trace consequences

Ask "and then what?" on a decision or change. Most bad calls are
first-order-good and second-order-bad — the plan looks fine until you follow the
consequences through two rounds and find where it breaks. Use this when you want
to map downstream effects before committing: how do people, incentives, and
feedback loops react to the first move, and then how do they react to that?

*Trigger: "what happens if we do X", "downstream effects", "how will this play
out", "and then what?"*

### `/latticework-invert` — premortem

Assume the plan already failed and ask what killed it. Projects six to twelve
months out, names the three to five most likely causes of failure (specific to
the situation, not generic risks), ranks them by likelihood × damage, and
designs the cheapest fix for each. The value is in naming the specific ways this
loses before you're committed.

*Trigger: "what could go wrong", "stress test this", "why might this fail",
"premortem"*

### `/latticework-reframe` — alternative framings

Generates three to four genuinely different ways to see the same situation, each
with what shifts and how the answer changes. Use this when you're stuck, going
in circles, or suspect you're solving the wrong problem. A reframe that doesn't
change any downstream action wasn't a reframe.

*Trigger: "am I thinking about this wrong", "what am I not seeing", "reframe
this", going in circles*

### `/latticework-decide` — make a committed call

Structured decision-making: states the real decision, lists every live option
(including "do nothing"), names what you're optimizing for and what you're
willing to trade away, checks reversibility, weighs expected value against
likelihood, premortems the leading option, and commits — with the specific
evidence that would change the call. A decision you can't state in one sentence
with one tripwire isn't decided yet.

*Trigger: "which should I pick", "help me decide", "is X or Y better", laying
out a choice and wanting a recommendation*

### `/latticework-challenge` — argue the other side

Builds the strongest honest case *against* your position — the version a smart,
informed opponent would make. Not a strawman to knock down, not reflexive
contrarianism. Names disconfirming evidence, the people and incentives the
position assumes away, and delivers one of three verdicts: survives (here's the
strongest objection to keep in view), cracks (here's the load-bearing flaw), or
depends on ___ (resolve that first).

*Trigger: "poke holes in this", "what am I missing", "challenge this",
"talk me out of it"*

### `/latticework-log` — record a decision

Records a decision to a dated ledger with what you decided, what alternatives
you rejected, why, the specific failure modes you feared, and your confidence
level. The premortem killers are the point — a log entry with no named failure
modes is just a diary. Sets a review date (default three months out) so the
decision comes back when there's something real to check against.

Ledger location: `$LATTICEWORK_LOG`, or `.latticework/decisions.md` in the
project root (if it exists), or `~/.latticework/decisions.md` globally.

*Trigger: after making a real, consequential call worth holding yourself
accountable to*

### `/latticework-review` — revisit past decisions

Opens the ledger, surfaces decisions whose review date has passed, and grades
each one — by what was knowable at the time, not by how it turned out. A sound
call can lose to bad luck; a reckless one can win. Marks each as held (sound,
worked), lucky (worked, reasoning was flawed), unlucky (sound, lost to something
unforeseeable), or wrong (a knowable flaw, missed). Shows a running calibration
tally with confidence tracking across all reviewed decisions.

Due reviews are also surfaced automatically at session start.

*Trigger: "review my decisions", "what decisions are due", or run it at the
review date you set when you logged*

## Install

> ### 📦 Download the plugin
> **[⬇️ latticework.zip](https://github.com/Egarter/latticework/releases/latest/download/latticework.zip)** — the packaged plugin, ready to upload.
> Grab this if you're installing into the Claude app (Desktop / Cowork) by upload.
> For Claude Code, use the marketplace command below instead.

### Claude Code (terminal or VS Code)

From inside a Claude Code session, run:

```
/plugin marketplace add Egarter/latticework
/plugin install latticework@latticework
```

This persists across sessions. To load for a single session instead:

```bash
claude --plugin-dir /path/to/latticework
```

Node must be on PATH for the always-on hooks; without it the skills still work
standalone, the auto-activation just stays quiet.

### Claude Desktop & Cowork

Latticework installs as a plugin in the Claude app, too. Open **Customize** in
the left sidebar → **Plugins** tab → **Browse plugins** to install from the
marketplace, or **upload [`latticework.zip`](https://github.com/Egarter/latticework/releases/latest/download/latticework.zip)** directly
(see the download callout at the top of this section).

**Use it in Cowork if you can.** Here's why the surface matters:

| Component | Web chat | Desktop Chat | Cowork |
|-----------|----------|--------------|--------|
| The 9 skills | ✓ | ✓ | ✓ |
| **Always-on ladder** (SessionStart hook) | ✗ | ✗ | ✓ |
| Auto mode-switching (UserPromptSubmit hook) | ✗ | ✗ | ✓ |

The whole point of latticework is that the discipline is *always on* — and that
runs on a hook. **Hooks only execute in Cowork**; in the Desktop Chat tab and on
web they're grayed out. So:

- **Cowork** — the full experience. The ladder is injected every session, mode
  switches work, all skills available. This is the recommended way to run it.
- **Desktop Chat / web** — the 9 skills work (invoke them with `/latticework`,
  `/latticework-decide`, etc.), but there's no auto-injection. To keep the
  discipline always on, paste the contents of [`hooks/ladder.md`](hooks/ladder.md)
  into your **Project custom instructions**.

## The ladder

1. **Frame** — the real question, and the assumption hiding in it
2. **Competence** — is this inside what I actually know?
3. **Forward** — and then what? (second-order consequences)
4. **Backward** — assume it failed; what killed it? (inversion / premortem)
5. **Decide** — one clear answer plus the tripwire that would change it; cite a model only if it changed the answer

## Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| lite  | `/latticework lite`  | Forward + backward only, silent. Tight answer. |
| full  | `/latticework`       | Whole ladder, reasoning shown where it mattered. Default. |
| ultra | `/latticework ultra` | Whole ladder + one domain model + written premortem. |

Set a default: `export LATTICEWORK_DEFAULT_MODE=ultra`, or
`~/.config/latticework/config.json` → `{ "defaultMode": "lite" }`.
Per-project override: `.latticework.json` in project root → `{ "defaultMode": "ultra" }`.
Resolution: env var > project config > user config > full. `off` starts sessions inactive.

## Decision ledger

The `/latticework-log` and `/latticework-review` commands keep a ledger at
`$LATTICEWORK_LOG`, or `.latticework/decisions.md` in the project root (if it
exists), or `~/.latticework/decisions.md` (global default). Each entry captures
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

### Custom model packs

Projects can add domain-specific models that ultra mode discovers alongside
the built-ins:

1. Drop `.md` files in `.latticework/models/` in the project root
2. Or list them in `.latticework.json`:
   ```json
   { "models": ["models/growth-models.md", { "path": "docs/security.md", "label": "security" }] }
   ```

Each file follows the same format as the built-in references: a title, then
a bulleted list of models with bold names and one-line glosses.

## How it works

On every session start, a hook injects the ladder as hidden context — Claude
reads it before your first message, so the discipline is active without you
doing anything. A second hook watches for level switches typed in chat
(`latticework ultra`, `latticework lite`, `stop latticework`).

Between turns, the plugin surfaces one relevant skill at earned moments: if you
just committed to a consequential decision it offers `/latticework-log`; if
you're committed to a one-sided plan it offers `/latticework-challenge`; if
you're visibly stuck it offers `/latticework-reframe`. Never more than one, only
when earned, never on routine answers.

The 41 domain models in `references/` load on demand in ultra mode — the
per-turn token cost stays small in lite and full.

## License

MIT
