// latticework — shared hook helpers (Claude Code).
// Single responsibility: resolve the active level, persist it, and build the
// per-session context payload from ladder.md.

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_MODES = ['lite', 'full', 'ultra', 'off'];
const DEFAULT_MODE = 'full';

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function flagPath() {
  return path.join(claudeDir(), '.latticework-active');
}

function configPath() {
  const base = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(base, 'latticework', 'config.json');
}

function projectConfigPath() {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  return path.join(cwd, '.latticework.json');
}

// Resolution order: env var > project config > user config > default.
function getDefaultMode() {
  const env = process.env.LATTICEWORK_DEFAULT_MODE;
  if (env && VALID_MODES.includes(env.toLowerCase())) return env.toLowerCase();
  try {
    const cfg = JSON.parse(fs.readFileSync(projectConfigPath(), 'utf8'));
    if (cfg.defaultMode && VALID_MODES.includes(String(cfg.defaultMode).toLowerCase())) {
      return String(cfg.defaultMode).toLowerCase();
    }
  } catch (e) { /* no project config — fall through */ }
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    if (cfg.defaultMode && VALID_MODES.includes(String(cfg.defaultMode).toLowerCase())) {
      return String(cfg.defaultMode).toLowerCase();
    }
  } catch (e) { /* no config — fall through */ }
  return DEFAULT_MODE;
}

function setMode(mode) {
  try {
    fs.mkdirSync(claudeDir(), { recursive: true });
    if (mode === 'off') { try { fs.unlinkSync(flagPath()); } catch (e) {} }
    else fs.writeFileSync(flagPath(), mode, 'utf8');
  } catch (e) { /* flag is best-effort */ }
}

function getMode() {
  try { return fs.readFileSync(flagPath(), 'utf8').trim() || DEFAULT_MODE; }
  catch (e) { return getDefaultMode(); }
}

// One-line behavior delta prepended to the ladder, by level.
const LEVEL_HEADER = {
  lite: 'Level: LITE. Run rungs 3 (forward) and 4 (backward) silently. Keep the answer tight; do not show the scaffolding.',
  full: 'Level: FULL. Run the whole ladder. Show your reasoning briefly, only where it changed the answer.',
  ultra: 'Level: ULTRA. Run the whole ladder, write an explicit premortem before you decide, and when a core model does not bite, pull one domain model from this plugin\'s references (paths below).',
};

// Resolved absolute paths to the domain-model files, appended for ultra only so
// the injected context is self-contained (lite/full pay no token cost for this).
function builtinReferences() {
  const dir = path.join(__dirname, '..', 'references');
  return [
    { path: path.join(dir, 'see-the-situation.md'), label: 'framing (rungs 1-2)' },
    { path: path.join(dir, 'trace-the-consequences.md'), label: 'forward / second-order (rung 3)' },
    { path: path.join(dir, 'find-leverage-and-decide.md'), label: 'leverage and choosing (rungs 4-5)' },
  ];
}

function customReferences() {
  const refs = [];
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Check .latticework.json for a models key pointing to files
  try {
    const cfgPath = path.join(projectDir, '.latticework.json');
    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    if (Array.isArray(cfg.models)) {
      for (const entry of cfg.models) {
        if (typeof entry === 'string') {
          const p = path.resolve(projectDir, entry);
          if (fs.existsSync(p)) refs.push({ path: p, label: path.basename(p, '.md') });
        } else if (entry && entry.path) {
          const p = path.resolve(projectDir, entry.path);
          if (fs.existsSync(p)) refs.push({ path: p, label: entry.label || path.basename(p, '.md') });
        }
      }
    }
  } catch (e) { /* no config or no models key */ }

  // Auto-discover .latticework/models/*.md in project root
  try {
    const modelsDir = path.join(projectDir, '.latticework', 'models');
    if (fs.existsSync(modelsDir)) {
      for (const file of fs.readdirSync(modelsDir)) {
        if (file.endsWith('.md')) {
          const p = path.join(modelsDir, file);
          const already = refs.some((r) => r.path === p);
          if (!already) refs.push({ path: p, label: path.basename(file, '.md') });
        }
      }
    }
  } catch (e) { /* no models dir */ }

  return refs;
}

function referencesNote() {
  const builtin = builtinReferences();
  const custom = customReferences();
  let out = '\n\nDomain models — read one only if it would change the decision:';
  for (const ref of builtin) {
    out += '\n- ' + ref.path + ' — ' + ref.label;
  }
  if (custom.length > 0) {
    out += '\n\nProject-specific models:';
    for (const ref of custom) {
      out += '\n- ' + ref.path + ' — ' + ref.label;
    }
  }
  return out;
}

const LITE_LADDER =
  'LATTICEWORK is active. Think before you answer.\n\n' +
  'Climb this ladder for judgment calls only: decisions, tradeoffs, strategy, predictions, "should I" questions, plans. For lookups and simple facts, answer directly and skip the ladder entirely.\n\n' +
  '1. FORWARD. Ask "and then what?" Trace two rounds of consequences: how people, incentives, and feedback loops react to the first move, and then how they react to that. The first-order answer is rarely the real one.\n' +
  '2. BACKWARD. Assume it already failed. Name what killed it, then design to remove those causes. Avoiding the obvious ways to lose beats chasing clever ways to win.\n\n' +
  'Guardrail, rigorous not performative: never list lenses you did not use, never run the ladder on trivia, never trade a real answer for a tour of frameworks. One sharp conclusion beats five named models. If a question is simple, treat the simple answer as the finished work.';

function buildContext(mode) {
  if (mode === 'off') return '';
  const header = LEVEL_HEADER[mode] || LEVEL_HEADER.full;
  let ladder;
  if (mode === 'lite') {
    ladder = LITE_LADDER;
  } else {
    try { ladder = fs.readFileSync(path.join(__dirname, 'ladder.md'), 'utf8'); }
    catch (e) { ladder = 'LATTICEWORK active: frame, check competence, run forward (second-order), run backward (inversion), then decide.'; }
  }
  let out = header + '\n\n' + ladder;
  if (mode === 'ultra') out += referencesNote();
  return out;
}

function decisionLogPath() {
  if (process.env.LATTICEWORK_LOG) return process.env.LATTICEWORK_LOG;
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const projectLog = path.join(projectDir, '.latticework', 'decisions.md');
  try { if (fs.existsSync(projectLog)) return projectLog; } catch (e) {}
  return path.join(os.homedir(), '.latticework', 'decisions.md');
}

function countDueReviews() {
  try {
    const logFile = decisionLogPath();
    if (!fs.existsSync(logFile)) return { due: 0, total: 0 };
    const content = fs.readFileSync(logFile, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    let due = 0;
    let total = 0;
    const entries = content.split(/^## /m).slice(1);
    for (const entry of entries) {
      if (/Status:\s*open/i.test(entry)) {
        total++;
        const m = entry.match(/Review on:\s*(\d{4}-\d{2}-\d{2})/);
        if (m && m[1] <= today) due++;
      }
    }
    return { due, total };
  } catch (e) { return { due: 0, total: 0 }; }
}

module.exports = { VALID_MODES, DEFAULT_MODE, getDefaultMode, setMode, getMode, buildContext, flagPath, countDueReviews, decisionLogPath, projectConfigPath };
