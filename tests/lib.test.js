const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const libPath = path.resolve(__dirname, '..', 'hooks', 'lib.js');

function freshLib() {
  delete require.cache[libPath];
  return require(libPath);
}

describe('VALID_MODES', () => {
  it('includes lite, full, ultra, off', () => {
    const lib = freshLib();
    assert.deepStrictEqual(lib.VALID_MODES, ['lite', 'full', 'ultra', 'off']);
  });
});

describe('getDefaultMode', () => {
  const origEnv = process.env.LATTICEWORK_DEFAULT_MODE;

  afterEach(() => {
    if (origEnv === undefined) delete process.env.LATTICEWORK_DEFAULT_MODE;
    else process.env.LATTICEWORK_DEFAULT_MODE = origEnv;
  });

  it('returns full when no env or config', () => {
    delete process.env.LATTICEWORK_DEFAULT_MODE;
    const lib = freshLib();
    assert.equal(lib.getDefaultMode(), 'full');
  });

  it('respects LATTICEWORK_DEFAULT_MODE env var', () => {
    process.env.LATTICEWORK_DEFAULT_MODE = 'ultra';
    const lib = freshLib();
    assert.equal(lib.getDefaultMode(), 'ultra');
  });

  it('ignores invalid env values', () => {
    process.env.LATTICEWORK_DEFAULT_MODE = 'turbo';
    const lib = freshLib();
    assert.equal(lib.getDefaultMode(), 'full');
  });

  it('accepts off as a valid mode', () => {
    process.env.LATTICEWORK_DEFAULT_MODE = 'off';
    const lib = freshLib();
    assert.equal(lib.getDefaultMode(), 'off');
  });
});

describe('setMode and flag file', () => {
  let tmpDir;
  const origCfg = process.env.CLAUDE_CONFIG_DIR;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    process.env.CLAUDE_CONFIG_DIR = tmpDir;
  });

  afterEach(() => {
    if (origCfg === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = origCfg;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes mode to flag file', () => {
    const lib = freshLib();
    lib.setMode('ultra');
    const content = fs.readFileSync(lib.flagPath(), 'utf8');
    assert.equal(content, 'ultra');
  });

  it('removes flag file when mode is off', () => {
    const lib = freshLib();
    lib.setMode('full');
    assert.ok(fs.existsSync(lib.flagPath()));
    lib.setMode('off');
    assert.ok(!fs.existsSync(lib.flagPath()));
  });

  it('getMode reads back what setMode wrote', () => {
    const lib = freshLib();
    lib.setMode('lite');
    assert.equal(lib.getMode(), 'lite');
  });
});

describe('buildContext', () => {
  it('returns empty string for off', () => {
    const lib = freshLib();
    assert.equal(lib.buildContext('off'), '');
  });

  it('includes LATTICEWORK for full mode', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('full');
    assert.ok(ctx.includes('LATTICEWORK'));
    assert.ok(ctx.includes('Level: FULL'));
  });

  it('includes LITE header for lite mode', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('lite');
    assert.ok(ctx.includes('Level: LITE'));
  });

  it('includes ULTRA header for ultra mode', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('ultra');
    assert.ok(ctx.includes('Level: ULTRA'));
    assert.ok(ctx.includes('premortem'));
  });

  it('injects resolvable reference paths for ultra mode', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('ultra');
    for (const f of ['see-the-situation.md', 'trace-the-consequences.md', 'find-leverage-and-decide.md']) {
      assert.ok(ctx.includes(f), `ultra context missing reference: ${f}`);
      // The injected path must point at a file that actually exists on disk.
      const m = ctx.split('\n').find((line) => line.includes(f));
      const p = m.replace(/^- /, '').split(' — ')[0].trim();
      assert.ok(fs.existsSync(p), `injected reference path does not exist: ${p}`);
    }
  });

  it('does NOT inject reference paths for lite or full', () => {
    const lib = freshLib();
    assert.ok(!lib.buildContext('full').includes('see-the-situation.md'));
    assert.ok(!lib.buildContext('lite').includes('see-the-situation.md'));
  });

  it('includes the ladder content', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('full');
    assert.ok(ctx.includes('FRAME'));
    assert.ok(ctx.includes('COMPETENCE'));
    assert.ok(ctx.includes('FORWARD'));
    assert.ok(ctx.includes('BACKWARD'));
    assert.ok(ctx.includes('DECIDE'));
  });

  it('includes the guardrail', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('full');
    assert.ok(ctx.includes('rigorous'));
    assert.ok(ctx.includes('performative'));
  });
});
