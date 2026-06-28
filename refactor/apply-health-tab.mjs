// Health tab -> family research-intake + AI reconcile (Nutrition / Movement / Prevention).
// Mirrors the proven Day Manager pattern:
//   HEALTH_B64 (page base64) -> /health-app ; /api/health GET/POST -> D1 settings
//   (key health:findings) ; /api/health/reconcile -> env.AI summarizes findings into a
//   simplified plan stored at health:plan ; 'health' nav tab + healthView() iframe.
// Jaemie & Tori paste findings; the reconcile agent turns the pile into one plain plan.
// No backticks / backslashes / regex in any injected CLIENT fragment (healthView).
// Server fragments avoid backslashes too (newline via String.fromCharCode(10)).
// Usage: node refactor/apply-health-tab.mjs <path-to-src/index.js>
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('usage: node apply-health-tab.mjs <src/index.js>'); process.exit(1); }

// Read the page source and encode it at apply time (node runs on the deploy machine
// against the real health-app.html — no separate base64 file to drift out of sync).
const HTML = fs.readFileSync(join(HERE, '..', 'health-app.html'), 'utf8');
if (!HTML || HTML.indexOf('<!DOCTYPE html>') < 0) { console.error('REFUSING: health-app.html missing or not HTML.'); process.exit(1); }
const B64 = Buffer.from(HTML, 'utf8').toString('base64');
if (!/^[A-Za-z0-9+/=]+$/.test(B64)) { console.error('REFUSING: encoded page is not pure base64.'); process.exit(1); }

let s = fs.readFileSync(target, 'utf8');
const NL = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';

if (s.indexOf('function healthView(') >= 0 || s.indexOf('HEALTH_B64') >= 0) {
  console.error('Health tab already present on this branch - nothing to do.');
  process.exit(2);
}
function swap(from, to, label) {
  const c = s.split(from).length - 1;
  if (c !== 1) throw new Error('expected exactly 1 occurrence of ' + label + ', found ' + c + ' (anchor drift vs main - nothing changed)');
  s = s.split(from).join(to);
}

// A) embed constant (base64 only), before the Launch Pad embed
swap('var LAUNCHPAD_B64 = "', 'var HEALTH_B64="' + B64 + '";' + NL + 'var LAUNCHPAD_B64 = "', 'embed-const');

// B) /api/health (list + capture + delete) and /api/health/reconcile (AI), before /api/karaoke
const API =
'if (p === "/api/health") {' + NL +
'          var hEmail = String((me && me.email) || "guest").toLowerCase();' + NL +
'          if (!me || me.role === "guest" || hEmail === "guest") return json({ error: "no" }, 403);' + NL +
'          if (req.method === "POST") {' + NL +
'            var b = await req.json();' + NL +
'            var rawF = await getSetting(env, "health:findings");' + NL +
'            var arr = [];' + NL +
'            try { arr = rawF ? JSON.parse(rawF) : []; } catch (e) { arr = []; }' + NL +
'            if (!Array.isArray(arr)) arr = [];' + NL +
'            if (b && b.del) {' + NL +
'              arr = arr.filter(function(x){ return x && x.id !== b.del; });' + NL +
'            } else {' + NL +
'              var sec = String((b && b.section) || "").toLowerCase();' + NL +
'              var okSec = (sec === "nutrition" || sec === "movement" || sec === "longevity");' + NL +
'              var txt = String((b && b.text) || "").slice(0, 4000).trim();' + NL +
'              if (!okSec || !txt) return json({ error: "bad" }, 400);' + NL +
'              var item = {' + NL +
'                id: "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),' + NL +
'                section: sec,' + NL +
'                who: String((b && b.who) || "").slice(0, 60),' + NL +
'                src: String((b && b.src) || "").slice(0, 400),' + NL +
'                text: txt,' + NL +
'                when: new Date().toISOString().slice(0, 16).replace("T", " ")' + NL +
'              };' + NL +
'              arr.push(item);' + NL +
'            }' + NL +
'            if (arr.length > 500) arr = arr.slice(arr.length - 500);' + NL +
'            await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:findings", JSON.stringify(arr)).run();' + NL +
'            return json({ ok: true });' + NL +
'          }' + NL +
'          var rawF2 = await getSetting(env, "health:findings");' + NL +
'          var findings = [];' + NL +
'          try { findings = rawF2 ? JSON.parse(rawF2) : []; } catch (e) { findings = []; }' + NL +
'          if (!Array.isArray(findings)) findings = [];' + NL +
'          var rawP = await getSetting(env, "health:plan");' + NL +
'          var plan = null;' + NL +
'          try { plan = rawP ? JSON.parse(rawP) : null; } catch (e) { plan = null; }' + NL +
'          return json({ findings: findings, plan: plan });' + NL +
'        }' + NL +
'        if (p === "/api/health/reconcile") {' + NL +
'          var rcEmail = String((me && me.email) || "guest").toLowerCase();' + NL +
'          if (!me || me.role === "guest" || rcEmail === "guest") return json({ error: "no" }, 403);' + NL +
'          var rawR = await getSetting(env, "health:findings");' + NL +
'          var flist = [];' + NL +
'          try { flist = rawR ? JSON.parse(rawR) : []; } catch (e) { flist = []; }' + NL +
'          if (!Array.isArray(flist) || !flist.length) return json({ error: "nothing to reconcile" }, 400);' + NL +
'          var lbl = { nutrition: "NUTRITION", movement: "MOVEMENT & STRENGTH", longevity: "PREVENTION & LONGEVITY" };' + NL +
'          var lines = flist.slice(0, 120).map(function(f){ return "[" + (lbl[f.section] || f.section) + "] (" + (f.who || "") + (f.src ? ", src: " + f.src : "") + ") " + f.text; });' + NL +
'          var __tx = lines.join(String.fromCharCode(10)).slice(0, 9000);' + NL +
'          var sysMsg = "You are a careful health-information organizer for a family. They pasted research findings, some overlapping or conflicting. Produce a SHORT, plain-language plan a non-clinician can act on, written for Jesse and his wife Brenda. Context: Jesse has Wolff-Parkinson-White, bilateral hip replacements, bilateral shoulder repairs, a disc injury, and takes tirzepatide. Group the plan under three headings exactly: Nutrition, then Movement & Strength, then Prevention & Longevity. Under each give 2 to 4 concise lines, each starting with a dash. Merge duplicates. Where findings conflict, or where a drug dose, a diagnosis, or the WPW cardiac question is involved, add a line starting with FLAG: telling them to confirm with their clinician. Do not give specific drug doses. End with one line starting Note: reminding this is general information, not medical advice. Plain text only, no markdown headers, no preamble.";' + NL +
'          var __r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: [ { role: "system", content: sysMsg }, { role: "user", content: __tx } ] });' + NL +
'          var __t = __r ? ((typeof __r === "string") ? __r : (__r.response || __r.result || "")) : "";' + NL +
'          __t = String(__t || "").trim();' + NL +
'          if (!__t) return json({ error: "AI returned nothing" }, 502);' + NL +
'          var planOut = { text: __t, when: new Date().toISOString().slice(0, 16).replace("T", " ") };' + NL +
'          await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:plan", JSON.stringify(planOut)).run();' + NL +
'          return json({ ok: true, plan: planOut });' + NL +
'        }' + NL +
'        ';
// B2) Records (R2-backed) + audit routes — strict owner||King access, full audit trail
const RECORDS =
'if (p === "/api/health/records" || p === "/api/health/records/upload" || p === "/api/health/records/file" || p === "/api/health/audit") {' + NL +
'          var uEmail = String((me && me.email) || "guest").toLowerCase();' + NL +
'          if (!me || me.role === "guest" || uEmail === "guest") return json({ error: "no" }, 403);' + NL +
'          var kingEmail = String((await getSetting(env, "king")) || OWNER).toLowerCase();' + NL +
'          var amKing = (uEmail === kingEmail);' + NL +
'          var ipAddr = req.headers.get("cf-connecting-ip") || "";' + NL +
'          var loadRecs = async function(){ var raw = await getSetting(env, "health:records"); var a = []; try { a = raw ? JSON.parse(raw) : []; } catch (e) { a = []; } return Array.isArray(a) ? a : []; };' + NL +
'          var saveRecs = async function(a){ await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:records", JSON.stringify(a)).run(); };' + NL +
'          var audit = async function(action, rec, result){ var raw = await getSetting(env, "health:audit"); var a = []; try { a = raw ? JSON.parse(raw) : []; } catch (e) { a = []; } if (!Array.isArray(a)) a = []; a.push({ ts: new Date().toISOString(), actor: uEmail, action: action, recordId: (rec && rec.id) || "", owner: (rec && rec.owner) || "", name: (rec && rec.name) || "", ip: ipAddr, result: result }); if (a.length > 3000) a = a.slice(a.length - 3000); try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:audit", JSON.stringify(a)).run(); } catch (e) {} };' + NL +
'          if (p === "/api/health/records/upload" && req.method === "POST") {' + NL +
'            var fname = decodeURIComponent(req.headers.get("x-filename") || "file");' + NL +
'            var ctype = req.headers.get("content-type") || "application/octet-stream";' + NL +
'            var buf = await req.arrayBuffer();' + NL +
'            if (!buf || buf.byteLength === 0) return json({ error: "empty file" }, 400);' + NL +
'            if (buf.byteLength > 26214400) return json({ error: "too large (25MB max)" }, 413);' + NL +
'            var rid = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);' + NL +
'            var rkey = "hrec/" + uEmail + "/" + rid;' + NL +
'            await env.HDOCS.put(rkey, buf, { httpMetadata: { contentType: ctype } });' + NL +
'            var recsU = await loadRecs();' + NL +
'            var recU = { id: rid, owner: uEmail, name: String(fname).slice(0, 200), type: ctype, size: buf.byteLength, key: rkey, when: new Date().toISOString() };' + NL +
'            recsU.push(recU); await saveRecs(recsU); await audit("upload", recU, "ok");' + NL +
'            return json({ ok: true, record: { id: recU.id, owner: recU.owner, name: recU.name, type: recU.type, size: recU.size, when: recU.when } });' + NL +
'          }' + NL +
'          if (p === "/api/health/audit") {' + NL +
'            var rawA = await getSetting(env, "health:audit"); var allA = []; try { allA = rawA ? JSON.parse(rawA) : []; } catch (e) { allA = []; } if (!Array.isArray(allA)) allA = [];' + NL +
'            var visA = amKing ? allA : allA.filter(function(x){ return x && String(x.owner).toLowerCase() === uEmail; });' + NL +
'            return json({ audit: visA.slice(-500).reverse(), king: amKing });' + NL +
'          }' + NL +
'          if (p === "/api/health/records/file") {' + NL +
'            var fid = url.searchParams.get("id") || "";' + NL +
'            var recsF = await loadRecs(); var recF = null;' + NL +
'            for (var fi = 0; fi < recsF.length; fi++){ if (recsF[fi].id === fid) { recF = recsF[fi]; break; } }' + NL +
'            if (!recF) return json({ error: "not found" }, 404);' + NL +
'            var ownsF = (String(recF.owner).toLowerCase() === uEmail);' + NL +
'            if (!ownsF && !amKing) { await audit("download", recF, "denied"); return json({ error: "forbidden" }, 403); }' + NL +
'            var objF = await env.HDOCS.get(recF.key);' + NL +
'            if (!objF) { await audit("download", recF, "missing"); return json({ error: "gone" }, 404); }' + NL +
'            await audit("download", recF, "ok");' + NL +
'            var hF = new Headers();' + NL +
'            hF.set("content-type", recF.type || "application/octet-stream");' + NL +
'            hF.set("content-disposition", "attachment; filename=" + JSON.stringify(String(recF.name || "file")));' + NL +
'            hF.set("cache-control", "no-store");' + NL +
'            return new Response(objF.body, { headers: hF });' + NL +
'          }' + NL +
'          if (p === "/api/health/records") {' + NL +
'            if (req.method === "POST") {' + NL +
'              var bd = await req.json();' + NL +
'              if (bd && bd.del) {' + NL +
'                var recsD = await loadRecs(); var tgt = null; var rest = [];' + NL +
'                recsD.forEach(function(x){ if (x.id === bd.del) tgt = x; else rest.push(x); });' + NL +
'                if (!tgt) return json({ error: "not found" }, 404);' + NL +
'                var ownsD = (String(tgt.owner).toLowerCase() === uEmail);' + NL +
'                if (!ownsD && !amKing) { await audit("delete", tgt, "denied"); return json({ error: "forbidden" }, 403); }' + NL +
'                try { await env.HDOCS.delete(tgt.key); } catch (e) {}' + NL +
'                await saveRecs(rest); await audit("delete", tgt, "ok");' + NL +
'                return json({ ok: true });' + NL +
'              }' + NL +
'              return json({ error: "bad" }, 400);' + NL +
'            }' + NL +
'            var recsL = await loadRecs();' + NL +
'            var vis = amKing ? recsL : recsL.filter(function(x){ return String(x.owner).toLowerCase() === uEmail; });' + NL +
'            var outL = vis.map(function(x){ return { id: x.id, owner: x.owner, name: x.name, type: x.type, size: x.size, when: x.when }; }).reverse();' + NL +
'            return json({ records: outL, king: amKing, me: uEmail });' + NL +
'          }' + NL +
'          return json({ error: "bad route" }, 400);' + NL +
'        }' + NL +
'        ';
swap('if (p === "/api/karaoke") {', API + RECORDS + 'if (p === "/api/karaoke") {', 'api-route');

// C) /health-app page route before /launchpad
const route =
'if (p === "/health-app" || p === "/health-app.html") {' + NL +
'      const __h = new TextDecoder().decode(Uint8Array.from(atob(HEALTH_B64), function(c){ return c.charCodeAt(0); }));' + NL +
'      return new Response(__h, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });' + NL +
'    }' + NL + '    ';
swap('if (p === "/launchpad" || p === "/launchpad.html") {', route + 'if (p === "/launchpad" || p === "/launchpad.html") {', 'page-route');

// D) nav tab right after Day Manager
swap("['daymanager','🗓 Day Manager']", "['daymanager','🗓 Day Manager'],['health','❤️ Health']", 'nav-tab');

// E) render view-map (brace-free anchor)
swap('daymanager:dayManagerView', 'daymanager:dayManagerView,health:healthView', 'view-map');

// F) view fn (single-quote JS + double-quote HTML; no backtick/backslash/regex)
const HV =
  "function healthView(){var __c='';try{__c=getComputedStyle(document.documentElement).getPropertyValue('--acc').trim();}catch(e){} return '<div class=\"card\" style=\"padding:0;overflow:hidden;border:1px solid var(--acc);background:#03040a;box-shadow:0 0 26px var(--acc-glow)\"><div style=\"position:relative;width:100%;height:calc(100vh - 150px);min-height:520px\"><iframe src=\"/health-app?c='+encodeURIComponent(__c)+'\" title=\"Health\" loading=\"lazy\" style=\"position:absolute;inset:0;width:100%;height:100%;border:0;display:block\"></iframe></div></div>';}" + NL;
swap('function homeView(){', HV + 'function homeView(){', 'view-fn');

// G) hover sparkle (non-fatal)
const hfxFrom = "daymanager:['🗓','✨','✅','🛒','💡']";
if (s.split(hfxFrom).length - 1 === 1) {
  s = s.split(hfxFrom).join(hfxFrom + ",health:['❤️','🩺','🥗','💪','✅']");
  console.log('hover sparkle: added');
} else {
  console.log('hover sparkle: anchor not found, skipped (non-fatal)');
}

// J) wrangler.jsonc — bind the isolated health-records R2 bucket (idempotent, anchored on PICS)
try {
  const wpath = join(dirname(target), '..', 'wrangler.jsonc');
  let w = fs.readFileSync(wpath, 'utf8');
  if (w.indexOf('HDOCS') >= 0) {
    console.log('wrangler: HDOCS binding already present, skipped');
  } else {
    const wAnchor = '{ "binding": "PICS",  "bucket_name": "clemit-pictures" }';
    if (w.split(wAnchor).length - 1 !== 1) throw new Error('wrangler PICS anchor not found exactly once');
    w = w.split(wAnchor).join(wAnchor + ',' + NL + '    { "binding": "HDOCS", "bucket_name": "clemit-health-records" }');
    fs.writeFileSync(wpath, w);
    console.log('wrangler: HDOCS -> clemit-health-records binding added');
  }
} catch (e) { console.error('wrangler binding step failed: ' + e.message); process.exit(3); }

fs.writeFileSync(target, s);
execSync('node --check ' + JSON.stringify(target), { stdio: 'inherit' });
console.log('Health tab applied OK ->', target, s.length, 'bytes; node --check PASS');
