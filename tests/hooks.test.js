const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const hooksDir = path.resolve(__dirname, '..', 'hooks');

describe('activate.js', () => {
  it('emits context containing LATTICEWORK', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const out = execFileSync('node', [path.join(hooksDir, 'activate.js')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir, LATTICEWORK_DEFAULT_MODE: 'full' },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.ok(out.includes('LATTICEWORK'));
      assert.ok(out.includes('FRAME'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('writes the flag file on activation', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      execFileSync('node', [path.join(hooksDir, 'activate.js')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir, LATTICEWORK_DEFAULT_MODE: 'ultra' },
        encoding: 'utf8',
        timeout: 5000,
      });
      const flag = fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8');
      assert.equal(flag, 'ultra');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('emits OK and no flag file when mode is off', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const out = execFileSync('node', [path.join(hooksDir, 'activate.js')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir, LATTICEWORK_DEFAULT_MODE: 'off' },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(out, 'OK');
      assert.ok(!fs.existsSync(path.join(tmpDir, '.latticework-active')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('includes statusline nudge when settings.json has no statusLine', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'settings.json'), '{}');
      const out = execFileSync('node', [path.join(hooksDir, 'activate.js')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir, LATTICEWORK_DEFAULT_MODE: 'full' },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.ok(out.includes('STATUSLINE SETUP NEEDED'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('skips statusline nudge when statusLine is already configured', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'settings.json'),
        JSON.stringify({ statusLine: { type: 'command', command: 'echo hi' } }));
      const out = execFileSync('node', [path.join(hooksDir, 'activate.js')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir, LATTICEWORK_DEFAULT_MODE: 'full' },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.ok(!out.includes('STATUSLINE SETUP NEEDED'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('mode-tracker.js', () => {
  function runTracker(prompt, env) {
    return execFileSync('node', [path.join(hooksDir, 'mode-tracker.js')], {
      input: JSON.stringify({ prompt }),
      env: { ...process.env, ...env },
      encoding: 'utf8',
      timeout: 5000,
    });
  }

  it('switches to ultra on /latticework ultra', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const out = runTracker('/latticework ultra', { CLAUDE_CONFIG_DIR: tmpDir });
      assert.ok(out.includes('ultra'));
      const flag = fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8');
      assert.equal(flag, 'ultra');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('switches to lite on /latticework lite', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      runTracker('/latticework lite', { CLAUDE_CONFIG_DIR: tmpDir });
      const flag = fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8');
      assert.equal(flag, 'lite');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('turns off on "stop latticework"', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'full');
      const out = runTracker('stop latticework', { CLAUDE_CONFIG_DIR: tmpDir });
      assert.ok(out.includes('off'));
      assert.ok(!fs.existsSync(path.join(tmpDir, '.latticework-active')));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('turns off on "normal mode"', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'full');
      const out = runTracker('normal mode', { CLAUDE_CONFIG_DIR: tmpDir });
      assert.ok(out.includes('off'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('defaults to full on bare /latticework', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      runTracker('/latticework', { CLAUDE_CONFIG_DIR: tmpDir });
      const flag = fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8');
      assert.equal(flag, 'full');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Regression: incidental mentions of level words must NOT flip the mode.
  it('does NOT turn off on incidental "normal mode" in a sentence', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'full');
      const out = runTracker('please switch the UI back to normal mode after testing',
        { CLAUDE_CONFIG_DIR: tmpDir });
      assert.equal(out, '');
      assert.equal(fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8'), 'full');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('does NOT switch level when latticework is mentioned mid-sentence', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'full');
      const out = runTracker('I dont want the latticework ultra behavior here',
        { CLAUDE_CONFIG_DIR: tmpDir });
      assert.equal(out, '');
      assert.equal(fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8'), 'full');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('still switches when the command starts the prompt', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      runTracker('/latticework ultra now please', { CLAUDE_CONFIG_DIR: tmpDir });
      assert.equal(fs.readFileSync(path.join(tmpDir, '.latticework-active'), 'utf8'), 'ultra');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('statusline.sh', () => {
  it('exists and is a valid shell script', () => {
    const script = path.join(hooksDir, 'statusline.sh');
    assert.ok(fs.existsSync(script));
    const content = fs.readFileSync(script, 'utf8');
    assert.ok(content.startsWith('#!/usr/bin/env bash'));
  });

  it('outputs nothing when no flag file exists', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      const out = execFileSync('bash', [path.join(hooksDir, 'statusline.sh')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(out.trim(), '');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('outputs [LATTICE] for full mode', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'full');
      const out = execFileSync('bash', [path.join(hooksDir, 'statusline.sh')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(out.trim(), '[LATTICE]');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('outputs [LATTICE:ULTRA] for ultra mode', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latticework-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '.latticework-active'), 'ultra');
      const out = execFileSync('bash', [path.join(hooksDir, 'statusline.sh')], {
        env: { ...process.env, CLAUDE_CONFIG_DIR: tmpDir },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(out.trim(), '[LATTICE:ULTRA]');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
