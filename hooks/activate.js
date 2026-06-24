#!/usr/bin/env node
// latticework — SessionStart hook.
// Resolves the active level, writes the flag file (statusline reads it),
// emits the ladder as hidden session context, and nudges statusline setup
// if not yet configured. Fails silent: never block a session.

const fs = require('fs');
const path = require('path');
const { getDefaultMode, setMode, buildContext, countDueReviews } = require('./lib');

function isShellSafe(p) {
  return typeof p === 'string' && /^[A-Za-z0-9 _.\-:/\\~]+$/.test(p);
}

try {
  const mode = getDefaultMode();
  if (mode === 'off') { process.stdout.write('OK'); process.exit(0); }
  setMode(mode);

  let output = buildContext(mode);

  // Nudge if decisions are due for review
  try {
    const { due, total } = countDueReviews();
    if (due > 0) {
      output += '\n\nDECISION REVIEW DUE: ' + due + ' of ' + total +
        ' open decision' + (total === 1 ? '' : 's') + ' in the latticework ledger ' +
        (due === 1 ? 'is' : 'are') + ' due for review. ' +
        'Mention this to the user on first interaction and suggest running /latticework-review.';
    }
  } catch (e) {
    // Silent fail — review nudge is best-effort
  }

  // Detect missing statusline config and nudge setup
  try {
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(require('os').homedir(), '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');
    let hasStatusline = false;
    if (fs.existsSync(settingsPath)) {
      const raw = fs.readFileSync(settingsPath, 'utf8').replace(/^﻿/, '');
      const settings = JSON.parse(raw);
      if (settings.statusLine) hasStatusline = true;
    }
    if (!hasStatusline) {
      const isWindows = process.platform === 'win32';
      const scriptName = isWindows ? 'statusline.ps1' : 'statusline.sh';
      const scriptPath = path.join(__dirname, scriptName);
      if (isShellSafe(scriptPath)) {
        const command = isWindows
          ? `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`
          : `bash "${scriptPath}"`;
        const snippet = '"statusLine": { "type": "command", "command": ' + JSON.stringify(command) + ' }';
        output += '\n\n' +
          'STATUSLINE SETUP NEEDED: The latticework plugin includes a statusline badge showing active mode ' +
          '(e.g. [LATTICE], [LATTICE:ULTRA]). It is not configured yet. ' +
          'To enable, add this to ~/.claude/settings.json: ' +
          snippet + ' ' +
          'Proactively offer to set this up for the user on first interaction.';
      } else {
        output += '\n\n' +
          'STATUSLINE SETUP NEEDED: The latticework plugin includes a statusline badge showing active mode. ' +
          'Its install path contains characters unsafe to embed in a shell command, so configure it manually: ' +
          'add a statusLine command of type "command" that runs ' + scriptName +
          ' from the plugin\'s hooks directory to ~/.claude/settings.json, quoting/escaping the path for your shell. ' +
          'Proactively offer to set this up for the user on first interaction.';
      }
    }
  } catch (e) {
    // Silent fail — nudge is best-effort
  }

  process.stdout.write(output);
} catch (e) {
  try { process.stdout.write('OK'); } catch (_) {}
}
