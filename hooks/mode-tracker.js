#!/usr/bin/env node
// latticework — UserPromptSubmit hook.
// Watches for level switches typed in chat and persists them. Emits nothing
// unless a switch was recognized. Fails silent.

const { VALID_MODES, setMode } = require('./lib');

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let prompt = '';
  try { prompt = (JSON.parse(raw).prompt || '').toString(); }
  catch (e) { prompt = raw; }
  const text = prompt.toLowerCase().trim();

  // "stop latticework" / "normal mode" => off
  if (/\b(stop|disable|turn off)\s+latticework\b/.test(text) || /\bnormal mode\b/.test(text)) {
    setMode('off');
    return process.stdout.write('latticework off');
  }
  // "/latticework <level>" or "latticework <level>"
  const m = text.match(/\/?latticework\s+(lite|full|ultra|off)\b/);
  if (m) { setMode(m[1]); return process.stdout.write('latticework: ' + m[1]); }
  // bare "/latticework" => full
  if (/^\/?latticework\s*$/.test(text)) { setMode('full'); return process.stdout.write('latticework: full'); }

  process.exit(0);
});
