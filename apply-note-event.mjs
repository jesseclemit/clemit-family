// Notes -> Event: add a "📅 Event" button to the private Personal Notes panel that
// creates a calendar event in the user's Day Manager calendar.
//   - Client: Event chip in the Notes composer .nroute row + an overlay form with
//     start/end date+time (date required, time optional), category, location,
//     verified clickable links, and images (upload to R2 OR paste-a-link, verified).
//   - Server: /api/linkcheck (verify a URL, detect image; SSRF-guarded) and
//     /api/daymgr/event (SAFE merge: appends/updates ONE event, never touching the
//     user's tasks/ideas/shopping). Reuses existing /api/media/upload + /pic/ for images.
// Zero new regex inside the served HTML template. Single-line anchors (CRLF-safe).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const f = process.argv[2];
if (!f) { console.error('usage: apply-note-event.mjs <src/index.js>'); process.exit(1); }
const here = path.dirname(fileURLToPath(import.meta.url));
const clientPath = path.join(here, 'note-event-client.txt');
const serverPath = path.join(here, 'note-event-server.txt');
for (const pth of [clientPath, serverPath]) {
  if (!fs.existsSync(pth)) { console.error('MISSING ' + path.basename(pth) + ' next to this script'); process.exit(1); }
}

let s = fs.readFileSync(f, 'utf8');
const before = s.length;
const clientBlock = fs.readFileSync(clientPath, 'utf8').replace(/\r?\n$/, '');
const serverBlock = fs.readFileSync(serverPath, 'utf8').replace(/\r?\n$/, '');

// Guard: don't double-apply.
if (s.indexOf('/api/daymgr/event') >= 0 || s.indexOf('function noteEventOpen(') >= 0) {
  console.error('ALREADY APPLIED (found /api/daymgr/event or noteEventOpen) -- aborting'); process.exit(5);
}

function must(name, from) {
  const n = s.split(from).length - 1;
  if (n === 0) { console.error('ANCHOR NOT FOUND: ' + name); process.exit(2); }
  if (n !== 1) { console.error('ANCHOR NOT UNIQUE (' + n + 'x): ' + name); process.exit(3); }
}

// 1) Client: define the Event functions just before notesPanel().
const A1 = 'function notesPanel(){var d=window.__notes';
must('client-notesPanel', A1);
s = s.replace(A1, () => clientBlock + '\n' + A1);

// 2) Client: add the "📅 Event" chip into the Notes composer .nroute row (after Remind Me).
const A2 = 'onclick="noteOpt(this)">⏰ Remind Me</span></div>\'';
const A2to = 'onclick="noteOpt(this)">⏰ Remind Me</span><span class="rchip ev" onclick="noteEventOpen()">📅 Event</span></div>\'';
must('client-nroute-chip', A2);
s = s.replace(A2, () => A2to);

// 3) Server: inject /api/linkcheck + /api/daymgr/event just before the /api/daymgr route.
const A3 = 'if (p === "/api/daymgr") {';
must('server-daymgr-route', A3);
s = s.replace(A3, () => serverBlock + '\n        ' + A3);

fs.writeFileSync(f, s);
console.log('OK note-event applied. bytes ' + before + ' -> ' + s.length + ' (+' + (s.length - before) + ')');
