// Gate for the Report-Bug client block: pull the exact JS the browser receives
// (the injected <script>), run it through one template-literal pass the way the page
// literal will, then COMPILE it. Catches anything node --check on the whole file can miss.
const fs = require('fs'), vm = require('vm');
const f = process.argv[2];
if (!f) { console.error('usage: bug-served-check.cjs <src/index.js>'); process.exit(1); }
const s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('/* PULSE Report-Bug client.');
const b = s.indexOf('</script></body></html>');
if (a < 0 || b < 0 || a >= b) { console.error('BUG-SERVED-CHECK: block not found.'); process.exit(1); }
const block = s.slice(a, b);
let served;
try { served = eval('`' + block.replace(/`/g, '\\`') + '`'); }
catch (e) { console.error('BUG-SERVED-CHECK: template-literal eval failed: ' + e.message); process.exit(1); }
try { new vm.Script(served); }
catch (e) { console.error('BUG-SERVED-CHECK FAILED: browser would get invalid JS -> ' + e.message); process.exit(1); }
console.log('BUG-SERVED-CHECK OK: the Report-Bug client JS the browser receives parses cleanly.');
