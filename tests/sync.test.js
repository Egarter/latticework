const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ladder.md (injected each session) and SKILL.md (the documented skill) state
// the same ladder. They are maintained by hand; this guards the worst drift —
// a rung or the guardrail edited in one file but not the other.

const ladder = fs.readFileSync(
  path.resolve(__dirname, '..', 'hooks', 'ladder.md'), 'utf8').toLowerCase();
const skill = fs.readFileSync(
  path.resolve(__dirname, '..', 'skills', 'latticework', 'SKILL.md'), 'utf8').toLowerCase();

describe('ladder.md and SKILL.md stay in sync', () => {
  for (const rung of ['frame', 'competence', 'forward', 'backward', 'decide']) {
    it(`both name the "${rung}" rung`, () => {
      assert.ok(ladder.includes(rung), `ladder.md missing rung: ${rung}`);
      assert.ok(skill.includes(rung), `SKILL.md missing rung: ${rung}`);
    });
  }

  it('both carry the rigorous-not-performative guardrail', () => {
    for (const term of ['rigorous', 'performative']) {
      assert.ok(ladder.includes(term), `ladder.md missing guardrail term: ${term}`);
      assert.ok(skill.includes(term), `SKILL.md missing guardrail term: ${term}`);
    }
  });
});
