// apply-health-update.mjs — UPDATE the already-live Health tab (PR #186 era).
// The live worker already has: HEALTH_B64 page, /api/health, /reconcile, records vault, audit,
// nav tab, page route, HDOCS binding. This patch:
//   1) replaces HEALTH_B64 with the new TCV + Me/profile + Body Map + sharing page,
//   2) injects new routes (profile, grants, bodymap) + who-param/canView records access,
//      placed BEFORE the old records guard so they shadow the older handlers.
// No nav/page-route/view-map/wrangler changes (already present in main).
// Usage: node refactor/apply-health-update.mjs <path-to-src/index.js>
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('usage: node apply-health-update.mjs <src/index.js>'); process.exit(1); }

const HTML = fs.readFileSync(join(HERE, '..', 'health-app.html'), 'utf8');
if (!HTML || HTML.indexOf('<!DOCTYPE html>') < 0) { console.error('REFUSING: health-app.html missing or not HTML.'); process.exit(1); }
const B64 = Buffer.from(HTML, 'utf8').toString('base64');
if (!/^[A-Za-z0-9+/=]+$/.test(B64)) { console.error('REFUSING: encoded page is not pure base64.'); process.exit(1); }

let s = fs.readFileSync(target, 'utf8');
const NL = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';

if (s.indexOf('var HEALTH_B64="') < 0) { console.error('REFUSING: live Health tab not found (run the fresh install first).'); process.exit(1); }
const routesPresent = s.indexOf('/api/health/grants') >= 0;

// 1) Replace the embedded page (HEALTH_B64 value) — slice replace, exactly one assignment.
if (s.split('var HEALTH_B64="').length - 1 !== 1) { console.error('REFUSING: expected exactly one HEALTH_B64 assignment.'); process.exit(3); }
{
  const a = s.indexOf('var HEALTH_B64="');
  const valStart = a + 'var HEALTH_B64="'.length;
  const end = s.indexOf('";', valStart);
  if (end < 0) { console.error('REFUSING: could not find end of HEALTH_B64 string.'); process.exit(3); }
  const curVal = s.slice(valStart, end);
  if (curVal === B64 && routesPresent) { console.error('Already up to date - nothing to do.'); process.exit(2); }
  s = s.slice(0, valStart) + B64 + s.slice(end);
  console.log('page: HEALTH_B64 replaced (' + B64.length + ' b64 chars)');
}

function swap(from, to, label) {
  const c = s.split(from).length - 1;
  if (c !== 1) throw new Error('expected exactly 1 occurrence of ' + label + ', found ' + c);
  s = s.split(from).join(to);
}

// 2) New routes block — self-contained (own uEmail/king/amKing/canView). Shadows old records routes.
const NEWBLOCK =
'if (p === "/api/health/records" || p === "/api/health/records/upload" || p === "/api/health/records/file" || p === "/api/health/audit" || p === "/api/health/profile" || p === "/api/health/grants" || p === "/api/health/bodymap" || p === "/api/health/vitals") {' + NL +
'          var uEmail = String((me && me.email) || "guest").toLowerCase();' + NL +
'          if (!me || me.role === "guest" || uEmail === "guest") return json({ error: "no" }, 403);' + NL +
'          var kingEmail = String((await getSetting(env, "king")) || OWNER).toLowerCase();' + NL +
'          var amKing = (uEmail === kingEmail);' + NL +
'          var ipAddr = req.headers.get("cf-connecting-ip") || "";' + NL +
'          var loadGrantsFor = async function(owner){ var raw = await getSetting(env, "health:grants:" + String(owner).toLowerCase()); var a = []; try { a = raw ? JSON.parse(raw) : []; } catch (e) { a = []; } return Array.isArray(a) ? a : []; };' + NL +
'          var canView = async function(owner){ var o = String(owner).toLowerCase(); if (uEmail === o || amKing) return true; var gr = await loadGrantsFor(o); return gr.indexOf(uEmail) >= 0; };' + NL +
'          var loadRecs = async function(){ var raw = await getSetting(env, "health:records"); var a = []; try { a = raw ? JSON.parse(raw) : []; } catch (e) { a = []; } return Array.isArray(a) ? a : []; };' + NL +
'          var saveRecs = async function(a){ await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:records", JSON.stringify(a)).run(); };' + NL +
'          var audit = async function(action, rec, result){ var raw = await getSetting(env, "health:audit"); var a = []; try { a = raw ? JSON.parse(raw) : []; } catch (e) { a = []; } if (!Array.isArray(a)) a = []; a.push({ ts: new Date().toISOString(), actor: uEmail, action: action, recordId: (rec && rec.id) || "", owner: (rec && rec.owner) || "", name: (rec && rec.name) || "", ip: ipAddr, result: result }); if (a.length > 3000) a = a.slice(a.length - 3000); try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:audit", JSON.stringify(a)).run(); } catch (e) {} };' + NL +
'          if (p === "/api/health/profile") {' + NL +
'            if (req.method === "POST") {' + NL +
'              var pbd = await req.json();' + NL +
'              var prof = { conditions: String((pbd && pbd.conditions) || "").slice(0, 4000), meds: String((pbd && pbd.meds) || "").slice(0, 4000), goals: String((pbd && pbd.goals) || "").slice(0, 4000), updated: new Date().toISOString() };' + NL +
'              await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:profile:" + uEmail, JSON.stringify(prof)).run();' + NL +
'              return json({ ok: true, profile: prof });' + NL +
'            }' + NL +
'            var pwho = String(url.searchParams.get("who") || uEmail).toLowerCase();' + NL +
'            if (!(await canView(pwho))) return json({ error: "forbidden" }, 403);' + NL +
'            var rawPr = await getSetting(env, "health:profile:" + pwho); var prof2 = null; try { prof2 = rawPr ? JSON.parse(rawPr) : null; } catch (e) { prof2 = null; }' + NL +
'            return json({ profile: prof2, email: pwho });' + NL +
'          }' + NL +
'          if (p === "/api/health/grants") {' + NL +
'            var gkey = "health:grants:" + uEmail;' + NL +
'            var glist = await loadGrantsFor(uEmail);' + NL +
'            if (req.method === "POST") {' + NL +
'              var gb = await req.json();' + NL +
'              if (gb && gb.add) { var ae = String(gb.add).toLowerCase().trim(); if (ae && ae.indexOf("@") > 0 && ae !== uEmail && glist.indexOf(ae) < 0) glist.push(ae); }' + NL +
'              if (gb && gb.remove) { var rmv = String(gb.remove).toLowerCase(); glist = glist.filter(function(x){ return x !== rmv; }); }' + NL +
'              if (glist.length > 50) glist = glist.slice(0, 50);' + NL +
'              await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind(gkey, JSON.stringify(glist)).run();' + NL +
'              return json({ ok: true, grants: glist });' + NL +
'            }' + NL +
'            return json({ grants: glist });' + NL +
'          }' + NL +
'          if (p === "/api/health/bodymap") {' + NL +
'            if (req.method === "POST") {' + NL +
'              var bb = await req.json();' + NL +
'              var regs = (bb && Array.isArray(bb.regions)) ? bb.regions.slice(0, 200) : [];' + NL +
'              await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:bodymap:" + uEmail, JSON.stringify({ regions: regs })).run();' + NL +
'              return json({ ok: true });' + NL +
'            }' + NL +
'            var bwho = String(url.searchParams.get("who") || uEmail).toLowerCase();' + NL +
'            if (!(await canView(bwho))) return json({ error: "forbidden" }, 403);' + NL +
'            var braw = await getSetting(env, "health:bodymap:" + bwho); var bdata = null; try { bdata = braw ? JSON.parse(braw) : null; } catch (e) { bdata = null; }' + NL +
'            return json({ regions: (bdata && bdata.regions) || [], email: bwho });' + NL +
'          }' + NL +
'          if (p === "/api/health/vitals") {' + NL +
'            var vraw = await getSetting(env, "health:vitals:" + uEmail); var vdata = {}; try { vdata = vraw ? JSON.parse(vraw) : {}; } catch (e) { vdata = {}; }' + NL +
'            if (!vdata || typeof vdata !== "object") vdata = {}; if (!vdata.metrics || typeof vdata.metrics !== "object") vdata.metrics = {};' + NL +
'            if (req.method === "POST") {' + NL +
'              var vb = await req.json();' + NL +
'              if (vb && vb.addMetric && vb.addMetric.key) { var mk = String(vb.addMetric.key).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24); if (mk && !vdata.metrics[mk]) vdata.metrics[mk] = { label: String(vb.addMetric.label || mk).slice(0, 40), unit: String(vb.addMetric.unit || "").slice(0, 12), readings: [] }; }' + NL +
'              if (vb && vb.removeMetric) { delete vdata.metrics[String(vb.removeMetric).toLowerCase()]; }' + NL +
'              if (vb && vb.add && vb.add.metric) { var amk = String(vb.add.metric).toLowerCase(); if (!vdata.metrics[amk]) vdata.metrics[amk] = { label: String(vb.add.label || amk).slice(0, 40), unit: String(vb.add.unit || "").slice(0, 12), readings: [] }; var rv = Number(vb.add.v); if (isFinite(rv)) { var rt = String(vb.add.t || new Date().toISOString().slice(0, 10)).slice(0, 10); vdata.metrics[amk].readings = vdata.metrics[amk].readings.filter(function(x){ return x.t !== rt; }); vdata.metrics[amk].readings.push({ t: rt, v: rv }); vdata.metrics[amk].readings.sort(function(a, b){ return a.t < b.t ? -1 : (a.t > b.t ? 1 : 0); }); if (vdata.metrics[amk].readings.length > 3000) vdata.metrics[amk].readings = vdata.metrics[amk].readings.slice(-3000); } }' + NL +
'              if (vb && vb.del && vb.del.metric) { var dmk = String(vb.del.metric).toLowerCase(); if (vdata.metrics[dmk]) vdata.metrics[dmk].readings = vdata.metrics[dmk].readings.filter(function(x){ return x.t !== String(vb.del.t || ""); }); }' + NL +
'              await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("health:vitals:" + uEmail, JSON.stringify(vdata)).run();' + NL +
'              return json({ ok: true, vitals: vdata });' + NL +
'            }' + NL +
'            var vwho = String(url.searchParams.get("who") || uEmail).toLowerCase();' + NL +
'            if (!(await canView(vwho))) return json({ error: "forbidden" }, 403);' + NL +
'            if (vwho !== uEmail) { var vraw2 = await getSetting(env, "health:vitals:" + vwho); var vd2 = { metrics: {} }; try { vd2 = vraw2 ? JSON.parse(vraw2) : { metrics: {} }; } catch (e) { vd2 = { metrics: {} }; } if (!vd2.metrics) vd2.metrics = {}; return json({ vitals: vd2, email: vwho }); }' + NL +
'            return json({ vitals: vdata, email: uEmail });' + NL +
'          }' + NL +
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
'            var mayF = await canView(String(recF.owner).toLowerCase());' + NL +
'            if (!mayF) { await audit("download", recF, "denied"); return json({ error: "forbidden" }, 403); }' + NL +
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
'            var rwho = String(url.searchParams.get("who") || uEmail).toLowerCase();' + NL +
'            if (!(await canView(rwho))) return json({ error: "forbidden" }, 403);' + NL +
'            var recsL = await loadRecs(); var vis;' + NL +
'            if (rwho !== uEmail) { vis = recsL.filter(function(x){ return String(x.owner).toLowerCase() === rwho; }); }' + NL +
'            else if (amKing) { vis = recsL; }' + NL +
'            else { vis = recsL.filter(function(x){ return String(x.owner).toLowerCase() === uEmail; }); }' + NL +
'            var outL = vis.map(function(x){ return { id: x.id, owner: x.owner, name: x.name, type: x.type, size: x.size, when: x.when }; }).reverse();' + NL +
'            return json({ records: outL, king: amKing, me: uEmail });' + NL +
'          }' + NL +
'          return json({ error: "bad route" }, 400);' + NL +
'        }' + NL +
'        ';

if (!routesPresent) {
  const OLDGUARD = 'if (p === "/api/health/records" || p === "/api/health/records/upload" || p === "/api/health/records/file" || p === "/api/health/audit") {';
  swap(OLDGUARD, NEWBLOCK + OLDGUARD, 'inject-new-routes-before-old');
  console.log('routes: profile/grants/bodymap injected (shadowing old records routes)');
} else {
  console.log('routes: already live, page-only update');
}

// 3) Anatomy agent route — interprets a medical-record annotation into a precise structure
//    (exact vertebral level, joint, nerve, vessel), system, side, lay explanation, and a
//    pin landmark. Injected idempotently before /api/karaoke.
if (s.indexOf('/api/health/anatomy') < 0) {
  const ANATOMY =
'if (p === "/api/health/anatomy") {' + NL +
'          var aEmail = String((me && me.email) || "guest").toLowerCase();' + NL +
'          if (!me || me.role === "guest" || aEmail === "guest") return json({ error: "no" }, 403);' + NL +
'          var ab = await req.json();' + NL +
'          var atext = String((ab && ab.text) || "").slice(0, 1500).trim();' + NL +
'          if (!atext) return json({ error: "no text" }, 400);' + NL +
'          var aSys = "You are a clinical anatomy locator. Given a short patient note about an injury, surgery, or condition, identify the PRECISE anatomical structure. Name the exact vertebral level (for example L4-L5), the exact joint, the specific nerve, or the specific vessel when implied. Reply with ONLY a JSON object and nothing else, using these keys: structure (precise anatomical name), system (one of: skeletal, muscular, nervous, circulatory, organ), side (one of: left, right, midline, bilateral), level (vertebral or segment level, or empty string), layer (one of: skeleton, muscles, nerves, vessels), landmark (one short snake_case region key from: lumbar_spine, thoracic_spine, cervical_spine, heart, left_hip, right_hip, left_shoulder, right_shoulder, left_knee, right_knee, ankle, hand, skull, abdomen, groin), explanation (one plain-language sentence a non-clinician understands), confidence (one of: low, medium, high). If uncertain, set confidence to low and still give your best anatomical guess.";' + NL +
'          var ar = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: [ { role: "system", content: aSys }, { role: "user", content: atext } ] });' + NL +
'          var atxt = ar ? ((typeof ar === "string") ? ar : (ar.response || ar.result || "")) : "";' + NL +
'          atxt = String(atxt || "");' + NL +
'          var ia = atxt.indexOf("{"), ibx = atxt.lastIndexOf("}");' + NL +
'          var parsed = null; if (ia >= 0 && ibx > ia) { try { parsed = JSON.parse(atxt.slice(ia, ibx + 1)); } catch (e) { parsed = null; } }' + NL +
'          if (!parsed) return json({ error: "could not interpret" }, 200);' + NL +
'          return json({ ok: true, anatomy: parsed });' + NL +
'        }' + NL +
'        ';
  swap('if (p === "/api/karaoke") {', ANATOMY + 'if (p === "/api/karaoke") {', 'inject-anatomy');
  console.log('routes: anatomy agent injected');
} else {
  console.log('routes: anatomy agent already present');
}

fs.writeFileSync(target, s);
execSync('node --check ' + JSON.stringify(target), { stdio: 'inherit' });
console.log('Health UPDATE applied OK ->', target, s.length, 'bytes; node --check PASS');
