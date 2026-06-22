const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const skillsDir = path.resolve(__dirname, '..', 'skills');
const skillNames = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const helpBody = fs.readFileSync(
  path.join(skillsDir, 'latticework-help', 'SKILL.md'), 'utf8');

describe('every skill is well-formed', () => {
  for (const name of skillNames) {
    it(`${name}/SKILL.md has matching frontmatter`, () => {
      const file = path.join(skillsDir, name, 'SKILL.md');
      assert.ok(fs.existsSync(file), `${name} has no SKILL.md`);
      const fm = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
      assert.ok(fm, `${name} has no frontmatter block`);
      const nameLine = fm[1].match(/^name:\s*(.+)$/m);
      assert.ok(nameLine, `${name} frontmatter missing name:`);
      assert.equal(nameLine[1].trim(), name, `${name} frontmatter name does not match its directory`);
      assert.ok(/^description:/m.test(fm[1]), `${name} frontmatter missing description:`);
    });
  }
});

describe('the help card lists every command', () => {
  for (const name of skillNames) {
    it(`mentions /${name}`, () => {
      assert.ok(helpBody.includes('`/' + name + '`'),
        `latticework-help does not list /${name}`);
    });
  }
});
