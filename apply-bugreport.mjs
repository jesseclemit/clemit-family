// apply-bugreport.mjs - injects: crown fix + always-on header Notes/Report-Bug buttons
// + Report-Bug modal (client) + /api/bug/* routes (server). Safe-fail: aborts if any
// anchor is missing or the change is already present. Run from clemit-family/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = process.argv[2] || "src/index.js";
const DIR = path.dirname(fileURLToPath(import.meta.url)); // Windows-safe (decodes %20, strips leading slash)
function read(p){ return fs.readFileSync(p, "utf8"); }

let s = read(SRC);
const before = s.length;
const css = read(path.join(DIR, "bug-style.css")).trim();
const js  = read(path.join(DIR, "bug-client.js")).trim();

function must(cond, msg){ if(!cond){ console.error("ABORT: " + msg); process.exit(2); } }
function once(hay, needle, label){
  const n = hay.split(needle).length - 1;
  must(n === 1, label + " - expected exactly 1 anchor, found " + n);
}

must(s.indexOf("PulseBug") === -1 && s.indexOf("/api/bug/report") === -1,
     "already applied (PulseBug / bug route present)");

/* 1) CROWN FIX - drop the inLine branch so ONLY the King ever shows the crown */
const cStart = "else if(S.me.inLine){__cb.textContent=";
const cEnd   = "else{__cb.textContent='';__cb.removeAttribute('title');}";
const i0 = s.indexOf(cStart);
must(i0 !== -1, "crown inLine branch not found");
const i1 = s.indexOf(cEnd, i0);
must(i1 !== -1 && (i1 - i0) < 600, "crown end marker not found near branch");
s = s.slice(0, i0) + s.slice(i1);   // removes the whole inLine block

/* 2) HEADER BUTTONS - always-on Notes + Report Bug, every user, before Sign Out */
const signout = '<a href="/cdn-cgi/access/logout">Sign Out</a>';
once(s, signout, "Sign Out link");
const hdrBtns =
  '<button type="button" class="pulseHdrBtn" onclick="notesOpenPanel()" title="Open your Personal Notes">\u{1F4DD} <span class="pulseHdrTxt">Notes</span></button>'
+ '<button type="button" class="pulseHdrBtn bug" onclick="PulseBug.open()" title="Report a bug">\u{1F41E} <span class="pulseHdrTxt">Report Bug</span></button>';
s = s.replace(signout, hdrBtns + signout);

/* 3) MODAL - style + client script before </body> */
const bodyClose = "</body></html>";
once(s, bodyClose, "</body></html>");
const inject = "<style>" + css + "</style><script>" + js + "</script>";
s = s.replace(bodyClose, inject + bodyClose);

/* 4) SERVER: ensureBugReports() before ensureReminders() */
const ensAnchor = "async function ensureReminders(env) {";
once(s, ensAnchor, "ensureReminders");
const ensure = `async function ensureBugReports(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS bug_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_email TEXT, reporter_name TEXT, url TEXT, ua TEXT, platform TEXT, browser TEXT, viewport TEXT, feedback TEXT, shot TEXT, created_at INTEGER, status TEXT DEFAULT 'open')").run();
}
__name(ensureBugReports, "ensureBugReports");
`;
s = s.replace(ensAnchor, ensure + ensAnchor);

/* 5) SERVER: /api/bug/* routes before the reminders GET route */
const routeAnchor = `if (p === "/api/reminders" && req.method === "GET") {`;
once(s, routeAnchor, "reminders GET route");
const routes = `if (p === "/api/bug/report" && req.method === "POST") {
        await ensureBugReports(env);
        const b = await req.json();
        const shot = String(b.shot || "");
        const r = await env.DB.prepare("INSERT INTO bug_reports (reporter_email,reporter_name,url,ua,platform,browser,viewport,feedback,shot,created_at,status) VALUES (?,?,?,?,?,?,?,?,?,?, 'open')").bind((me.email||"").toLowerCase(), me.name||"", String(b.url||"").slice(0,400), String(b.ua||"").slice(0,500), String(b.platform||"").slice(0,80), String(b.browser||"").slice(0,40), String(b.viewport||"").slice(0,40), String(b.feedback||"").slice(0,4000), shot.slice(0,900000), Date.now()).run();
        return json({ ok: true, id: (r && r.meta) ? r.meta.last_row_id : 0 });
      }
      if (p === "/api/bug/list" && req.method === "GET") {
        await ensureBugReports(env);
        if (!me.isRoyal) return json({ error: "forbidden" }, 403);
        const rows = await env.DB.prepare("SELECT id,reporter_email,reporter_name,platform,browser,feedback,created_at,status FROM bug_reports ORDER BY id DESC LIMIT 200").all();
        return json({ reports: (rows && rows.results) || [] });
      }
      if (p === "/api/bug/get" && req.method === "GET") {
        await ensureBugReports(env);
        if (!me.isRoyal) return json({ error: "forbidden" }, 403);
        const id = +url.searchParams.get("id") || 0;
        const one = await env.DB.prepare("SELECT * FROM bug_reports WHERE id=?").bind(id).first();
        return json({ report: one || null });
      }
      `;
s = s.replace(routeAnchor, routes + routeAnchor);

fs.writeFileSync(SRC, s);
console.log("OK applied. bytes " + before + " -> " + s.length + " (delta +" + (s.length - before) + ")");
