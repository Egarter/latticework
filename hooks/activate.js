#!/usr/bin/env node
// latticework — SessionStart hook.
// Resolves the active level, writes the flag file (statusline reads it), and
// emits the ladder as hidden session context. Fails silent: never block a session.

const { getDefaultMode, setMode, buildContext } = require('./lib');

try {
  const mode = getDefaultMode();
  if (mode === 'off') { process.stdout.write('OK'); process.exit(0); }
  setMode(mode);
  process.stdout.write(buildContext(mode));
} catch (e) {
  try { process.stdout.write('OK'); } catch (_) {}
}
