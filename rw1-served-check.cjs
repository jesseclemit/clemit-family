// Gate: pull the RW1 client helper block (the JS the browser receives), run it
// through one template-literal pass like the page does, then COMPILE it.
const fs = require('fs'), vm = require('vm');
const f = process.argv[2];
if (!f) { console.error('usage: rw1-served-check.cjs <src/index.js>'); process.exit(1); }
const s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('/* RW1-helpers */');
const b = s.indexOf('/* RW1-end */');
if (a < 0 || b < 0 || a >= b) { console.error('RW1-SERVED-CHECK: block not found.'); process.exit(1); }
const block = s.slice(a, b);
let served;
try { served = eval('`' + block.replace(/`/g, '\\`') + '`'); }
catch (e) { console.error('RW1-SERVED-CHECK: template eval failed -> ' + e.message); process.exit(1); }
try { new vm.Script(served); }
catch (e) { console.error('RW1-SERVED-CHECK FAILED: browser would get invalid JS -> ' + e.message); process.exit(1); }
console.log('RW1-SERVED-CHECK OK: composer client JS parses cleanly.');
