---
name: latticework-log
description: >
  Record a decision and its premortem to a dated ledger so it can be revisited
  later. Use when the user says "log this decision", "record this", "add this
  to the decision log", or just made a real call (often after /latticework-decide
  or ultra mode) worth holding yourself accountable to. Append-only; reads and
  writes the ledger file but changes no code and no active level.
---

# Latticework: Log

One-shot. Capture a decision *with what you feared at the time*, so a later
review can separate a sound call from a lucky or unlucky outcome.

## Where

Ledger file: `$LATTICEWORK_LOG` if set, else `~/.latticework/decisions.md`.
Create the directory and file if missing. Append only — never rewrite or
reorder existing entries.

## What to write

Pull the decision from the conversation (or ask only for what's genuinely
missing — don't interrogate). Append one entry:

```
## <YYYY-MM-DD> — <one-line decision>
- Decision: <what was chosen>
- Alternatives: <the live options rejected, including "do nothing" if it was one>
- Rationale: <one or two lines; name the model only if it changed the call>
- Premortem killers: <the specific failure modes feared now — the heart of the entry>
- Confidence: <a rough % or low/med/high, so calibration can be checked later>
- Review on: <a concrete date — default 3 months out unless the decision implies another horizon>
- Status: open
```

The premortem killers are the point. A log entry with no named failure modes is
just a diary; name the two or three concrete ways this could go wrong, so the
future review has something real to check against.

## After writing

Confirm in one line: the decision, and the review date. Don't restate the whole
entry. Report only — change nothing else.
