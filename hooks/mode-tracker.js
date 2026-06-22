#!/usr/bin/env node
// latticework — UserPromptSubmit hook.
// Watches for level switches typed in chat and persists them. Triggers ONLY
// when the prompt IS the command, not when it merely mentions a level word,
// so incidental text ("switch the UI to normal mode") never flips the mode.
// Emits nothing unless a switch was recognized. Fails silent.

const { setMode } = require('./lib');

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let prompt = '';
  try { prompt = (JSON.parse(raw).prompt || '').toString(); }
  catch (e) { prompt = raw; }
  const text = prompt.toLowerCase().trim();
  const stripped = text.replace(/[.!?\s]+$/, ''); // trailing punctuation for exact matches

  // Deactivation: the prompt must BE the command, not merely contain the words.
  if (/^(stop|disable|turn off)\s+latticework$/.test(stripped) || stripped === 'normal mode') {
    setMode('off');
    return process.stdout.write('latticework off');
  }
  // Level switch: command must START the prompt — a real invocation, not a mention.
  const m = text.match(/^\/?latticework\s+(lite|full|ultra|off)\b/);
  if (m) {
    if (m[1] === 'off') { setMode('off'); return process.stdout.write('latticework off'); }
    setMode(m[1]);
    return process.stdout.write('latticework: ' + m[1]);
  }
  // Bare "/latticework" or "latticework" alone => full.
  if (/^\/?latticework$/.test(stripped)) { setMode('full'); return process.stdout.write('latticework: full'); }

  process.exit(0);
});
