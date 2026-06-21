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

// Resolution order: env var > config file > default.
function getDefaultMode() {
  const env = process.env.LATTICEWORK_DEFAULT_MODE;
  if (env && VALID_MODES.includes(env.toLowerCase())) return env.toLowerCase();
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
  ultra: 'Level: ULTRA. Run the whole ladder, pull one domain model from the matching references/ file, and write an explicit premortem before you decide.',
};

function buildContext(mode) {
  if (mode === 'off') return '';
  let ladder = '';
  try { ladder = fs.readFileSync(path.join(__dirname, 'ladder.md'), 'utf8'); }
  catch (e) { ladder = 'LATTICEWORK active: frame, check competence, run forward (second-order), run backward (inversion), then decide.'; }
  const header = LEVEL_HEADER[mode] || LEVEL_HEADER.full;
  return header + '\n\n' + ladder;
}

module.exports = { VALID_MODES, DEFAULT_MODE, getDefaultMode, setMode, getMode, buildContext, flagPath };
