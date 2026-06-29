// Gate: extract the Notes-Event client block from the built src, evaluate it the way the
// page template literal will (one level of escape processing), then COMPILE the result.
// This is the check plain `node --check` cannot do (the block is string data in the literal).
const fs = require('fs'), vm = require('vm');
const f = process.argv[2];
if (!f) { console.error('usage: verify-served.cjs <src/index.js>'); process.exit(1); }
const s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('function evToast('); const b = s.indexOf('function notesPanel(){var d=window.__notes');
if (a < 0 || b < 0 || a >= b) { console.error('SERVED-CHECK: block not found.'); process.exit(1); }
const block = s.slice(a, b);
let served;
try { served = eval('`' + block.replace(/`/g, '\\`') + '`'); }
catch (e) { console.error('SERVED-CHECK: template-literal eval failed: ' + e.message); process.exit(1); }
try { new vm.Script(served); }
catch (e) { console.error('SERVED-CHECK FAILED: the browser would get invalid JS -> ' + e.message); process.exit(1); }
console.log('SERVED-CHECK OK: the client JS the browser receives parses cleanly.');
