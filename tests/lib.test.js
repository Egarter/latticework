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

  it('lite mode uses a shorter ladder without FRAME or COMPETENCE', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('lite');
    assert.ok(ctx.includes('FORWARD'));
    assert.ok(ctx.includes('BACKWARD'));
    assert.ok(!ctx.includes('FRAME'));
    assert.ok(!ctx.includes('COMPETENCE'));
  });

  it('lite ladder is shorter than the full ladder', () => {
    const lib = freshLib();
    const lite = lib.buildContext('lite');
    const full = lib.buildContext('full');
    assert.ok(lite.length < full.length, 'lite context should be shorter than full');
  });

  it('includes the guardrail', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('full');
    assert.ok(ctx.includes('rigorous'));
    assert.ok(ctx.includes('performative'));
  });

  it('lite mode also includes the guardrail', () => {
    const lib = freshLib();
    const ctx = lib.buildContext('lite');
    assert.ok(ctx.includes('rigorous'));
    assert.ok(ctx.includes('performative'));
  });
});

describe('projectConfigPath', () => {
  const origDir = process.env.CLAUDE_PROJECT_DIR;

  afterEach(() => {
    if (origDir === undefined) delete process.env.CLAUDE_PROJECT_DIR;
    else process.env.CLAUDE_PROJECT_DIR = origDir;
  });

  it('respects project config over user config', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      delete process.env.LATTICEWORK_DEFAULT_MODE;
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      fs.writeFileSync(path.join(tmpDir, '.latticework.json'),
        JSON.stringify({ defaultMode: 'ultra' }));
      const lib = freshLib();
      assert.equal(lib.getDefaultMode(), 'ultra');
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('env var overrides project config', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      process.env.LATTICEWORK_DEFAULT_MODE = 'lite';
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      fs.writeFileSync(path.join(tmpDir, '.latticework.json'),
        JSON.stringify({ defaultMode: 'ultra' }));
      const lib = freshLib();
      assert.equal(lib.getDefaultMode(), 'lite');
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('countDueReviews', () => {
  const origLog = process.env.LATTICEWORK_LOG;

  afterEach(() => {
    if (origLog === undefined) delete process.env.LATTICEWORK_LOG;
    else process.env.LATTICEWORK_LOG = origLog;
  });

  it('returns 0 when no ledger exists', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      process.env.LATTICEWORK_LOG = path.join(tmpDir, 'nonexistent.md');
      const lib = freshLib();
      const result = lib.countDueReviews();
      assert.equal(result.due, 0);
      assert.equal(result.total, 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('counts due entries correctly', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    const logFile = path.join(tmpDir, 'decisions.md');
    try {
      fs.writeFileSync(logFile, [
        '## 2024-01-01 — Past decision',
        '- Review on: 2024-06-01',
        '- Status: open',
        '',
        '## 2024-01-02 — Future decision',
        '- Review on: 2099-01-01',
        '- Status: open',
        '',
        '## 2024-01-03 — Already reviewed',
        '- Review on: 2024-06-01',
        '- Status: held',
      ].join('\n'));
      process.env.LATTICEWORK_LOG = logFile;
      const lib = freshLib();
      const result = lib.countDueReviews();
      assert.equal(result.due, 1);
      assert.equal(result.total, 2);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('custom model packs', () => {
  const origDir = process.env.CLAUDE_PROJECT_DIR;

  afterEach(() => {
    if (origDir === undefined) delete process.env.CLAUDE_PROJECT_DIR;
    else process.env.CLAUDE_PROJECT_DIR = origDir;
  });

  it('ultra context includes project models from .latticework/models/', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const modelsDir = path.join(tmpDir, '.latticework', 'models');
      fs.mkdirSync(modelsDir, { recursive: true });
      fs.writeFileSync(path.join(modelsDir, 'growth.md'), '# Growth models\n- **CAC** test');
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      const lib = freshLib();
      const ctx = lib.buildContext('ultra');
      assert.ok(ctx.includes('Project-specific models:'));
      assert.ok(ctx.includes('growth'));
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('ultra context includes models listed in .latticework.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'security-lenses.md'), '# Security\n- **Threat model** test');
      fs.writeFileSync(path.join(tmpDir, '.latticework.json'), JSON.stringify({
        models: [{ path: 'security-lenses.md', label: 'security' }]
      }));
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      const lib = freshLib();
      const ctx = lib.buildContext('ultra');
      assert.ok(ctx.includes('security'));
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('does NOT include custom models for lite or full', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const modelsDir = path.join(tmpDir, '.latticework', 'models');
      fs.mkdirSync(modelsDir, { recursive: true });
      fs.writeFileSync(path.join(modelsDir, 'growth.md'), '# Growth\n- test');
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      const lib = freshLib();
      assert.ok(!lib.buildContext('full').includes('Project-specific'));
      assert.ok(!lib.buildContext('lite').includes('Project-specific'));
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('handles string entries in models array', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'my-models.md'), '# Models\n- test');
      fs.writeFileSync(path.join(tmpDir, '.latticework.json'), JSON.stringify({
        models: ['my-models.md']
      }));
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      const lib = freshLib();
      const ctx = lib.buildContext('ultra');
      assert.ok(ctx.includes('my-models'));
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('ignores nonexistent model files gracefully', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.latticework.json'), JSON.stringify({
        models: ['does-not-exist.md']
      }));
      process.env.CLAUDE_PROJECT_DIR = tmpDir;
      const lib = freshLib();
      const ctx = lib.buildContext('ultra');
      assert.ok(!ctx.includes('Project-specific'));
    } finally {
      delete process.env.CLAUDE_PROJECT_DIR;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
