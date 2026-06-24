---
name: latticework-review
description: >
  Revisit logged decisions that are due, and judge each by what was knowable at
  the time, not by how it turned out. Use when the user says "review my
  decisions", "what decisions are due", "check the decision log", or wants the
  calibration loop closed on past calls. Reads the ledger and updates entry
  status; one-shot, changes no active level.
---

# Latticework: Review

One-shot. Close the loop. The single biggest error in judgment is grading a
decision by its outcome — this skill exists to refuse that.

## Read

Ledger file resolution order:
1. `$LATTICEWORK_LOG` if set
2. `.latticework/decisions.md` in the current project root (if it exists)
3. `~/.latticework/decisions.md` (global default)

If it's missing or empty, say so and stop — nothing to review.

Surface entries with `Status: open` whose `Review on` date is today or past. If
none are due, list how many are still pending and their next review date, then
stop. (The user can override and review everything if they ask.)

## For each due decision

1. **What was feared.** Restate the premortem killers from the entry.
2. **What happened.** Ask the user, or infer from the conversation/repo if the
   evidence is there. Did any named killer fire? Did an unforeseen one?
3. **Decision vs outcome.** Judge the *decision* against what was knowable when
   it was made — not against how it landed. A sound call can lose to bad luck; a
   reckless one can win. Mark which this was:
   - `held` — sound decision, and it worked
   - `lucky` — worked, but the reasoning was flawed; don't bank the win
   - `unlucky` — sound decision that lost to something unforeseeable
   - `wrong` — a flaw that was knowable at the time, missed
4. **The lesson.** One line: what to calibrate next time. Was confidence right?
   Were the right killers named? This is the only output that compounds.

## Update

Rewrite each reviewed entry's `Status: open` to `Status: <held|lucky|unlucky|wrong>`
and append a `- Reviewed <date>: <one-line lesson>` line under it. Preserve
everything else verbatim.

## Calibration tally

After updating, compute and show a running calibration summary across ALL
reviewed entries in the ledger (not just this batch):

```
Calibration (N reviewed decisions):
  held:    X (Y%) — sound reasoning, worked
  unlucky: X (Y%) — sound reasoning, bad luck
  lucky:   X (Y%) — flawed reasoning, got lucky
  wrong:   X (Y%) — knowable flaw, missed

Sound decisions: Z% (held + unlucky)
```

If entries have `confidence:` values (in the HTML comment metadata or the
human-readable field), also show:
```
Confidence calibration: avg stated X%, actual Y% → over/under/well-calibrated
```
where "actual" = percentage of decisions that were held or unlucky (sound
reasoning regardless of outcome).

If entries have `tags:`, show a per-tag breakdown when there are 3+ reviewed
entries for a tag (e.g., "architecture: 4 held, 1 wrong — 80% sound").

End with the sharpest lesson from this batch. Change nothing outside the ledger.
