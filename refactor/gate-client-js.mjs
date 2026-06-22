import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import url from 'url';

// CLIENT-JS SYNTAX GATE
// The whole PULSE page is ONE big JS template literal. Client app code lives in
// <script>...</script> blocks inside it; a syntax error there passes `node --check`
// on the worker but blanks the live app. This gate reconstructs EVERY inline script
// as the browser receives it (cooks template escapes, neutralises ${...}) and runs
// `node --check` on each. A block's close may be escaped (<\/script>) or literal
// (</script>) in source -- accept whichever comes first; check ALL blocks.
//   exit 0 = every inline script parses clean ; exit 1 = syntax error

function cookTemplate(slice) {
  let neutral = '', i = 0; const n = slice.length;
  while (i < n) {
    const c = slice[i];
    if (c === '\\') { neutral += slice[i] + (i + 1 < n ? slice[i + 1] : ''); i += 2; continue; }
    if (c === '$' && slice[i + 1] === '{') {
      let depth = 0, k = i + 1;
      for (; k < n; k++) { if (slice[k] === '{') depth++; else if (slice[k] === '}') { depth--; if (depth === 0) break; } }
      neutral += '__I__'; i = (k < n ? k + 1 : n); continue;
    }
    neutral += c; i++;
  }
  return eval('`' + neutral + '`');
}

export function buildServedClientBlocks(src) {
  const blocks = []; let from = 0;
  while (true) {
    const open = src.indexOf('<script>', from);
    if (open < 0) break;
    const esc = src.indexOf('<\\/script>', open);
    const lit = src.indexOf('</script>', open);
    let close = -1;
    if (esc < 0) close = lit; else if (lit < 0) close = esc; else close = Math.min(esc, lit);
    if (close < 0) break;
    blocks.push(cookTemplate(src.slice(open + '<script>'.length, close)));
    from = close + 2;
  }
  return blocks;
}

export function buildServedClientJs(src) {
  const b = buildServedClientBlocks(src);
  if (!b.length) throw new Error('no <script> block found');
  return b[0];
}

export function gateFile(target) {
  const src = fs.readFileSync(target, 'utf8');
  let blocks;
  try { blocks = buildServedClientBlocks(src); } catch (e) { return { ok: false, error: e.message }; }
  if (!blocks.length) return { ok: false, error: 'no inline <script> blocks found' };
  let total = 0;
  for (let i = 0; i < blocks.length; i++) {
    const tmp = path.join(os.tmpdir(), 'pulse-clientgate-' + Date.now() + '-' + i + '.js');
    fs.writeFileSync(tmp, '(function(){\n' + blocks[i] + '\n})();\n');
    try {
      execSync('node --check "' + tmp + '"', { stdio: ['ignore', 'ignore', 'pipe'] });
      fs.unlinkSync(tmp); total += blocks[i].length;
    } catch (e) {
      const msg = (e.stderr ? e.stderr.toString() : e.message);
      try { fs.unlinkSync(tmp); } catch (_) {}
      return { ok: false, error: 'block#' + (i + 1) + ' of ' + blocks.length + '\n' + msg };
    }
  }
  return { ok: true, bytes: total, blocks: blocks.length };
}

const invokedDirect = import.meta.url === url.pathToFileURL(process.argv[1] || '').href;
if (invokedDirect) {
  const t = process.argv[2];
  if (!t) { console.error('usage: node gate-client-js.mjs <src/index.js>'); process.exit(2); }
  const r = gateFile(t);
  if (r.ok) { console.log('CLIENT-JS GATE: PASS (' + r.blocks + ' inline scripts, ' + r.bytes + ' bytes parsed clean)'); process.exit(0); }
  console.error('CLIENT-JS GATE: FAIL\n' + r.error); process.exit(1);
}
