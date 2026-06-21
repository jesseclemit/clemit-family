// clemit-family — RECOVERED LIVE WORKER BUNDLE
// Pulled from the deployed Worker on 2026-06-13 via the Cloudflare connector.
// This is the esbuild OUTPUT bundle (the live source was not in the repo before today).
// It is a recoverable undo point. Edits for the 'Let's Go!!' release build on top of this.
//
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var DAY = 864e5;
var PERIOD = { weekly: 7 * DAY, monthly: 30 * DAY };
function json(d, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
__name(json, "json");
function whoami(req) {
  return req.headers.get("Cf-Access-Authenticated-User-Email") || "guest";
}
__name(whoami, "whoami");
function parseRange(h) {
  const m = /bytes=(\d+)-(\d*)/.exec(h || "");
  if (!m) return void 0;
  const o = +m[1];
  return m[2] ? { offset: o, length: +m[2] - o + 1 } : { offset: o };
}
__name(parseRange, "parseRange");
async function getUser(env, email) {
  const r = await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();
  if (r) return r;
  let __auto = null;
  try {
    const __hs = await env.DB.prepare("SELECT value FROM settings WHERE key='households'").first();
    if (__hs && __hs.value) {
      const __map = JSON.parse(__hs.value), __lc = String(email).toLowerCase();
      (__map.households || []).forEach(function(h){ (h.members || []).forEach(function(m){ if (m.email && String(m.email).toLowerCase() === __lc) __auto = { name: m.name }; }); });
    }
  } catch (e) {}
  const __nm = (__auto && __auto.name) ? __auto.name : email.split("@")[0];
  const __role = __auto ? "member" : "guest";
  try { await env.DB.prepare("INSERT OR IGNORE INTO users (email,name,role,grocery_access,created_at,approved_by) VALUES (?,?,?,?,?,?)").bind(email, __nm, __role, 0, Date.now(), __auto ? "map:auto" : null).run(); } catch (e) {}
  return { email, name: __nm, role: __role, grocery_access: 0, approved_by: __auto ? "map:auto" : null };
}
__name(getUser, "getUser");
async function getSetting(env, k) {
  const r = await env.DB.prepare("SELECT value FROM settings WHERE key=?").bind(k).first();
  return r ? r.value : null;
}
__name(getSetting, "getSetting");
var QSEED = [
  { id: 1, q: "You could leave life right now. Let that determine what you do, say, and think.", a: "Marcus Aurelius", at: "Roman emperor and Stoic philosopher", u: "https://en.wikipedia.org/wiki/Marcus_Aurelius", s: "Make today count.", src: "Meditations, Book 2" },
  { id: 2, q: "Fortune governs half our actions; she leaves the other half to us.", a: "Niccolo Machiavelli", at: "Renaissance political philosopher", u: "https://en.wikipedia.org/wiki/Niccol%C3%B2_Machiavelli", s: "Steer your half.", src: "The Prince, Ch. 25" },
  { id: 3, q: "What is it you plan to do with your one wild and precious life?", a: "Mary Oliver", at: "Pulitzer Prize-winning American poet", u: "https://en.wikipedia.org/wiki/Mary_Oliver", s: "Big question. Go answer it.", src: "The Summer Day" },
  { id: 4, q: "Carpe diem. Seize the day.", a: "Horace", at: "Roman lyric poet of the Augustan age", u: "https://en.wikipedia.org/wiki/Horace", s: "The day is yours, Boss.", src: "Odes 1.11" },
  { id: 5, q: "The day is not gonna seize itself. Go.", a: "Pulse", at: "The house voice of Clemit Pulse", u: "", s: "Main-character energy: ON.", src: "Clemit Pulse original" },
  { id: 6, q: "New day just dropped. Limited edition. Use it.", a: "Pulse", at: "The house voice of Clemit Pulse", u: "", s: "YOLO. Yeet. Onward.", src: "Clemit Pulse original" },
  { id: 7, q: "Do or do not. There is no try.", a: "Yoda", at: "Jedi Master, Star Wars", u: "https://en.wikipedia.org/wiki/Yoda", s: "Pick a thing. Do it.", src: "The Empire Strikes Back" },
  { id: 8, q: "We are all in the gutter, but some of us are looking at the stars.", a: "Oscar Wilde", at: "Irish poet and playwright", u: "https://en.wikipedia.org/wiki/Oscar_Wilde", s: "Look up.", src: "Lady Windermere's Fan" }
];
async function getQuotes(env) {
  let raw = await getSetting(env, "quotes_state");
  if (raw) {
    try {
      const st = JSON.parse(raw);
      st.favs = st.favs || {};
      st.pending = st.pending || [];
      return st;
    } catch (e) {
    }
  }
  return { quotes: QSEED.slice(), favs: {}, pending: [], nextId: QSEED.length + 1 };
}
__name(getQuotes, "getQuotes");
async function saveQuotes(env, st) {
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("quotes_state", JSON.stringify(st)).run();
}
__name(saveQuotes, "saveQuotes");
var OWNER = "jesseclemit@gmail.com";
var QUEEN = "jaemieclemit@gmail.com";
var BADWORDS = ["fuck", "shit", "bitch", "cunt", "asshole", "bastard", "dick", "piss", "slut", "whore", "nigger", "faggot", "retard", "cock", "pussy"];
function movSlug(t) {
  return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
__name(movSlug, "movSlug");
async function movArr(env) {
  if (!env.MOV) return [];
  const o = await env.MOV.get("_requests.json");
  if (!o) return [];
  try {
    return JSON.parse(await o.text());
  } catch (e) {
    return [];
  }
}
__name(movArr, "movArr");
async function movWatched(env) {
  if (!env.MOV) return {};
  const o = await env.MOV.get("_watched.json");
  if (!o) return {};
  try {
    return JSON.parse(await o.text());
  } catch (e) {
    return {};
  }
}
__name(movWatched, "movWatched");
async function ensureAudit(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, who TEXT, kind TEXT, label TEXT, tag TEXT)").run();
}
__name(ensureAudit, "ensureAudit");
async function logAudit(env, who, kind, label, tag) {
  try {
    await ensureAudit(env);
    await env.DB.prepare("INSERT INTO audit (ts,who,kind,label,tag) VALUES (?,?,?,?,?)").bind(Date.now(), who, String(kind || "event"), String(label || "").slice(0, 200), String(tag || "")).run();
    await env.DB.prepare("DELETE FROM audit WHERE id <= (SELECT MAX(id) FROM audit)-5000").run();
  } catch (e) {
  }
}
__name(logAudit, "logAudit");
async function ensureReminders(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_email TEXT, owner_name TEXT, title TEXT, body TEXT, due_at INTEGER, channels TEXT DEFAULT 'inapp', to_email TEXT, to_phone TEXT, repeat_kind TEXT DEFAULT '', status TEXT DEFAULT 'pending', created_at INTEGER, fired_at INTEGER)").run();
  try { await env.DB.prepare("ALTER TABLE reminders ADD COLUMN note_id INTEGER DEFAULT 0").run(); } catch (e) {}
  try { await env.DB.prepare("ALTER TABLE reminders ADD COLUMN to_carrier TEXT").run(); } catch (e) {}
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS notify_log (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, reminder_id INTEGER, channel TEXT, target TEXT, ok INTEGER, detail TEXT)").run();
}
__name(ensureReminders, "ensureReminders");
async function notifyLog(env, rid, channel, target, ok, detail) {
  try { await env.DB.prepare("INSERT INTO notify_log (ts,reminder_id,channel,target,ok,detail) VALUES (?,?,?,?,?,?)").bind(Date.now(), rid || 0, channel, String(target || ""), ok ? 1 : 0, String(detail || "").slice(0, 500)).run(); } catch (e) {}
}
__name(notifyLog, "notifyLog");
var SEED_RECIPES = {
  "meatloaf": { name: "Meatloaf", ingredients: ["Ground beef", "Eggs", "Breadcrumbs", "Onion", "Ketchup", "Worcestershire sauce", "Milk", "Salt", "Pepper"] },
  "chicken parm": { name: "Chicken Parm", ingredients: ["Chicken breasts", "Marinara sauce", "Mozzarella cheese", "Parmesan cheese", "Breadcrumbs", "Eggs", "Flour", "Spaghetti", "Olive oil"] },
  "chicken parmesan": { name: "Chicken Parmesan", ingredients: ["Chicken breasts", "Marinara sauce", "Mozzarella cheese", "Parmesan cheese", "Breadcrumbs", "Eggs", "Flour", "Spaghetti", "Olive oil"] },
  "spaghetti": { name: "Spaghetti", ingredients: ["Spaghetti noodles", "Ground beef", "Marinara sauce", "Onion", "Garlic", "Parmesan cheese"] },
  "tacos": { name: "Tacos", ingredients: ["Ground beef", "Taco shells", "Shredded cheese", "Lettuce", "Tomato", "Sour cream", "Salsa", "Taco seasoning"] },
  "banana split": { name: "Banana Split", ingredients: ["Bananas", "Vanilla ice cream", "Chocolate ice cream", "Strawberry ice cream", "Chocolate syrup", "Whipped cream", "Maraschino cherries", "Chopped nuts"] },
  "grilled cheese": { name: "Grilled Cheese", ingredients: ["Bread", "Cheese slices", "Butter"] },
  "pancakes": { name: "Pancakes", ingredients: ["Flour", "Eggs", "Milk", "Baking powder", "Sugar", "Butter", "Maple syrup"] },
  "burgers": { name: "Burgers", ingredients: ["Ground beef", "Hamburger buns", "Cheese slices", "Lettuce", "Tomato", "Onion", "Ketchup", "Mustard", "Pickles"] },
  "chili": { name: "Chili", ingredients: ["Ground beef", "Kidney beans", "Diced tomatoes", "Tomato paste", "Onion", "Chili powder", "Cumin", "Garlic"] },
  "lasagna": { name: "Lasagna", ingredients: ["Lasagna noodles", "Ground beef", "Marinara sauce", "Ricotta cheese", "Mozzarella cheese", "Parmesan cheese", "Eggs"] },
  "pot roast": { name: "Pot Roast", ingredients: ["Beef chuck roast", "Potatoes", "Carrots", "Onion", "Beef broth", "Celery", "Garlic"] }
};
async function getRecipes(env) {
  try { var raw = await getSetting(env, "recipes"); var obj = raw ? JSON.parse(raw) : null; if (obj && typeof obj === "object" && Object.keys(obj).length) return obj; } catch (e) {}
  try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("recipes", JSON.stringify(SEED_RECIPES)).run(); } catch (e) {}
  return JSON.parse(JSON.stringify(SEED_RECIPES));
}
__name(getRecipes, "getRecipes");
async function saveRecipes(env, obj) {
  try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("recipes", JSON.stringify(obj || {})).run(); } catch (e) {}
}
__name(saveRecipes, "saveRecipes");
async function ensureGrocery(env) {
  try { await env.DB.prepare("ALTER TABLE grocery_items ADD COLUMN meal_group TEXT").run(); } catch (e) {}
  try { await env.DB.prepare("ALTER TABLE grocery_items ADD COLUMN checked INTEGER DEFAULT 0").run(); } catch (e) {}
}
__name(ensureGrocery, "ensureGrocery");
async function aiIngredients(env, meal) {
  if (!env || !env.AI) return null;
  try {
    var r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: [
      { role: "system", content: "You are a grocery assistant. Given the name of a dish or meal, reply with ONLY a JSON array of the grocery ingredients a shopper would buy to make it. Example: [\"Ground beef\",\"Eggs\",\"Onion\"]. Give 5 to 12 common items. No quantities, no brand names, no commentary, no markdown - just the JSON array." },
      { role: "user", content: String(meal || "").slice(0, 80) }
    ] });
    var t = "";
    if (r) t = (typeof r === "string") ? r : (r.response || r.result || (r.output && r.output.response) || "");
    t = String(t || "");
    var a = t.indexOf("["), b = t.lastIndexOf("]");
    if (a < 0 || b <= a) return null;
    var arr = JSON.parse(t.slice(a, b + 1));
    if (!Array.isArray(arr)) return null;
    arr = arr.filter(function (x) { return typeof x === "string" && x.trim(); }).map(function (x) { return x.trim().slice(0, 60); }).slice(0, 14);
    return arr.length ? arr : null;
  } catch (e) { return null; }
}
__name(aiIngredients, "aiIngredients");
async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { ok: false, detail: "no RESEND_API_KEY secret set" };
  const from = env.RESEND_FROM || "Clemit PULSE <pulse@clemits.com>";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ from: from, to: [to], subject: subject || "Reminder", html: html || "" })
    });
    return { ok: r.ok, detail: r.ok ? "sent" : ("resend " + r.status + " " + (await r.text()).slice(0, 200)) };
  } catch (e) { return { ok: false, detail: "sendEmail error " + String(e) }; }
}
__name(sendEmail, "sendEmail");
async function sendSMS(env, to, body) {
  if (!env.TWILIO_SID || !env.TWILIO_TOKEN || !env.TWILIO_FROM) return { ok: false, detail: "missing TWILIO_SID/TWILIO_TOKEN/TWILIO_FROM secret(s)" };
  try {
    const form = new URLSearchParams({ To: to, From: env.TWILIO_FROM, Body: String(body || "").slice(0, 1500) });
    const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + env.TWILIO_SID + "/Messages.json", {
      method: "POST",
      headers: { "authorization": "Basic " + btoa(env.TWILIO_SID + ":" + env.TWILIO_TOKEN), "content-type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
    return { ok: r.ok, detail: r.ok ? "sent" : ("twilio " + r.status + " " + (await r.text()).slice(0, 200)) };
  } catch (e) { return { ok: false, detail: "sendSMS error " + String(e) }; }
}
__name(sendSMS, "sendSMS");
var CARRIER_GW = { verizon: "vtext.com", att: "txt.att.net", tmobile: "tmomail.net", sprint: "messaging.sprintpcs.com", googlefi: "msg.fi.google.com", uscellular: "email.uscc.net", boost: "sms.myboostmobile.com", cricket: "sms.cricketwireless.net", metropcs: "mymetropcs.com", virgin: "vmobl.com", consumercellular: "mailmymobile.net", xfinity: "vtext.com", straighttalk: "vtext.com" };
async function sendTextGateway(env, phone, carrier, body) {
  if (!env.RESEND_API_KEY) return { ok: false, detail: "no RESEND_API_KEY secret set" };
  const key = String(carrier || "").toLowerCase().replace(/[^a-z]/g, "");
  const dom = CARRIER_GW[key];
  if (!dom) return { ok: false, detail: "unknown carrier '" + carrier + "' (have: " + Object.keys(CARRIER_GW).join(", ") + ")" };
  let digits = String(phone || "").replace(/[^0-9]/g, "");
  if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
  if (digits.length !== 10) return { ok: false, detail: "phone must be 10 digits, got '" + digits + "'" };
  const to = digits + "@" + dom;
  const from = env.RESEND_FROM || "Clemit PULSE <pulse@clemit.net>";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ from: from, to: [to], subject: "", text: String(body || "").slice(0, 300) })
    });
    return { ok: r.ok, detail: r.ok ? ("sent -> " + to) : ("resend " + r.status + " " + (await r.text()).slice(0, 200)) };
  } catch (e) { return { ok: false, detail: "sendTextGateway error " + String(e) }; }
}
__name(sendTextGateway, "sendTextGateway");
function localpartFor(name, used) {
  let base = String(name || "").trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, "");
  if (!base) base = "member";
  let lp = base, n = 2;
  while (used && used.has(lp)) { lp = base + (n++); }
  return lp;
}
__name(localpartFor, "localpartFor");
async function cfApi(env, method, path, body) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method: method,
    headers: { "authorization": "Bearer " + env.CF_API_TOKEN, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  let j = {};
  try { j = await r.json(); } catch (e) {}
  return { ok: r.ok && (!j || j.success !== false), status: r.status, json: j };
}
__name(cfApi, "cfApi");
async function ensureEmailRoute(env, localpart, dest) {
  if (!env.CF_API_TOKEN || !env.CF_ZONE_ID || !env.CF_ACCOUNT_ID) return { ok: false, detail: "missing CF_API_TOKEN/CF_ZONE_ID/CF_ACCOUNT_ID secret(s)" };
  const addr = localpart + "@clemit.net";
  try {
    await cfApi(env, "POST", "/accounts/" + env.CF_ACCOUNT_ID + "/email/routing/addresses", { email: dest });
    const rule = await cfApi(env, "POST", "/zones/" + env.CF_ZONE_ID + "/email/routing/rules", { name: "PULSE auto: " + addr, enabled: true, matchers: [{ type: "literal", field: "to", value: addr }], actions: [{ type: "forward", value: [dest] }] });
    if (rule.ok) return { ok: true, detail: "route " + addr + " -> " + dest + " (dest verifies via Cloudflare email)" };
    const msg = JSON.stringify((rule.json && rule.json.errors) || rule.json || {}).slice(0, 200);
    if (/exist|duplicate|already/i.test(msg)) return { ok: true, detail: "route already present: " + addr };
    return { ok: false, detail: "rule create failed " + rule.status + " " + msg };
  } catch (e) { return { ok: false, detail: "ensureEmailRoute error " + String(e) }; }
}
__name(ensureEmailRoute, "ensureEmailRoute");
async function syncEmailRoutes(env) {
  const creds = { token: !!env.CF_API_TOKEN, zone: !!env.CF_ZONE_ID, account: !!env.CF_ACCOUNT_ID };
  let out;
  if (!creds.token || !creds.zone || !creds.account) {
    out = { ok: false, skipped: "missing CF secret(s)", creds: creds, report: [] };
  } else {
    let hh = {};
    try { hh = JSON.parse((await getSetting(env, "households")) || "{}"); } catch (e) { hh = {}; }
    let done = {};
    try { done = JSON.parse((await getSetting(env, "email_routes_done")) || "{}"); } catch (e) { done = {}; }
    const used = new Set(Object.values(done));
    const report = [];
    let changed = false;
    const houses = (hh && hh.households) || [];
    for (const house of houses) {
      for (const m of (house.members || [])) {
        const email = String(m.email || "").trim().toLowerCase();
        if (!email || email.indexOf("@") < 0) continue;
        if (done[email]) continue;
        const lp = localpartFor(m.name, used);
        const res = await ensureEmailRoute(env, lp, email);
        report.push({ email: email, localpart: lp, ok: res.ok, detail: res.detail });
        if (res.ok) { done[email] = lp; used.add(lp); changed = true; }
      }
    }
    if (changed) { try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("email_routes_done", JSON.stringify(done)).run(); } catch (e) {} }
    out = { ok: true, provisioned: Object.keys(done).length, report: report };
  }
  out.ranAt = Date.now();
  try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("email_routes_last", JSON.stringify(out)).run(); } catch (e) {}
  return out;
}
__name(syncEmailRoutes, "syncEmailRoutes");
async function runDueReminders(env) {
  await ensureReminders(env);
  const now = Date.now();
  const due = await env.DB.prepare("SELECT * FROM reminders WHERE status='pending' AND due_at <= ? ORDER BY due_at ASC LIMIT 50").bind(now).all();
  const rows = (due && due.results) || [];
  const PER = { daily: 86400000, weekly: 604800000, monthly: 2592000000 };
  for (const r of rows) {
    const chans = String(r.channels || "inapp").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    if (chans.indexOf("email") >= 0 && r.to_email) {
      const res = await sendEmail(env, r.to_email, r.title || "Reminder", "<div style=\"font:16px sans-serif;color:#0b1020\"><h2>" + (r.title || "Reminder") + "</h2><p>" + (r.body || "") + "</p><p style=\"color:#789\">— Clemit PULSE</p></div>");
      await notifyLog(env, r.id, "email", r.to_email, res.ok, res.detail);
    }
    if (chans.indexOf("sms") >= 0 && r.to_phone) {
      const res = await sendSMS(env, r.to_phone, (r.title ? r.title + ": " : "") + (r.body || ""));
      await notifyLog(env, r.id, "sms", r.to_phone, res.ok, res.detail);
    }
    if (chans.indexOf("text") >= 0 && r.to_phone && r.to_carrier) {
      const res = await sendTextGateway(env, r.to_phone, r.to_carrier, (r.title ? r.title + ": " : "") + (r.body || ""));
      await notifyLog(env, r.id, "text", r.to_phone + "@" + r.to_carrier, res.ok, res.detail);
    }
    if (chans.indexOf("inapp") >= 0) { await notifyLog(env, r.id, "inapp", r.owner_email, true, "fired for in-app pickup"); }
    if (r.repeat_kind && PER[r.repeat_kind]) {
      await env.DB.prepare("UPDATE reminders SET due_at = ?, fired_at = ? WHERE id = ?").bind(r.due_at + PER[r.repeat_kind], now, r.id).run();
    } else {
      await env.DB.prepare("UPDATE reminders SET status='fired', fired_at = ? WHERE id = ?").bind(now, r.id).run();
    }
  }
  return rows.length;
}
__name(runDueReminders, "runDueReminders");

function pacNow() { return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })); }
__name(pacNow, "pacNow");
async function maybeRunDigest(env) {
  try {
    const p = pacNow();
    if (p.getHours() !== 9) return;
    const key = p.getFullYear() + "-" + (p.getMonth() + 1) + "-" + p.getDate();
    const last = await getSetting(env, "last_digest_date");
    if (last === key) return;
    await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('last_digest_date',?)").bind(key).run();
    await runDigests(env, key);
  } catch (e) {}
}
__name(maybeRunDigest, "maybeRunDigest");
function digestEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
__name(digestEsc, "digestEsc");
async function runDigests(env, key) {
  try { await env.DB.prepare("ALTER TABLE users ADD COLUMN digest_off INTEGER DEFAULT 0").run(); } catch (e) {}
  const since = Date.now() - 24 * 3600 * 1000;
  const king = (await getSetting(env, "king")) || OWNER;
  const users = ((await env.DB.prepare("SELECT email,name,role,digest_off FROM users").all()).results) || [];
  const msgs = ((await env.DB.prepare("SELECT author,body,category,created_at FROM messages WHERE created_at > ? ORDER BY created_at DESC LIMIT 60").bind(since).all()).results) || [];
  let media = []; try { media = ((await env.DB.prepare("SELECT kind,title,created_at FROM media WHERE created_at > ? ORDER BY created_at DESC LIMIT 40").bind(since).all()).results) || []; } catch (e) {}
  let newUsers = []; try { newUsers = ((await env.DB.prepare("SELECT name,email,created_at FROM users WHERE created_at > ?").bind(since).all()).results) || []; } catch (e) {}
  let acts = []; try { acts = ((await env.DB.prepare("SELECT kind,label,who,ts FROM audit WHERE ts > ?").bind(since).all()).results) || []; } catch (e) {}
  const ds = new Date(); ds.setHours(0, 0, 0, 0); const dayStart = ds.getTime(); const dayEnd = dayStart + 86400000;
  for (const u of users) {
    if (u.digest_off) continue;
    if (!u.email) continue;
    const lc = String(u.email).toLowerCase();
    const isKing = lc === String(king).toLowerCase();
    const pub = msgs.filter(function (m) { const c = String(m.category || ""); return isKing || (c !== "household" && c !== "housekeeping"); });
    let shared = []; try { shared = ((await env.DB.prepare("SELECT owner_name,body,updated_at FROM notes WHERE updated_at > ? AND shares LIKE ?").bind(since, "%" + lc + "%").all()).results) || []; } catch (e) {}
    let rem = []; try { rem = ((await env.DB.prepare("SELECT title,body,due_at FROM reminders WHERE owner_email=? AND status='pending' AND due_at>=? AND due_at<? ORDER BY due_at ASC").bind(lc, dayStart, dayEnd).all()).results) || []; } catch (e) {}
    const sec = []; let any = false;
    if (pub.length) { any = true; sec.push("<h3 style=\"color:#1d6;margin:14px 0 6px\">New on the boards (" + pub.length + ")</h3>" + pub.slice(0, 12).map(function (m) { return "<p style=\"margin:4px 0\"><b>" + digestEsc(m.author) + "</b> in <i>" + digestEsc(m.category || "general") + "</i>: " + digestEsc(String(m.body || "").slice(0, 140)) + "</p>"; }).join("")); }
    if (shared.length) { any = true; sec.push("<h3 style=\"color:#1d6;margin:14px 0 6px\">Notes shared with you (" + shared.length + ")</h3>" + shared.slice(0, 8).map(function (n) { return "<p style=\"margin:4px 0\">from <b>" + digestEsc(n.owner_name) + "</b>: " + digestEsc(String(n.body || "").slice(0, 140)) + "</p>"; }).join("")); }
    if (rem.length) { any = true; sec.push("<h3 style=\"color:#c70;margin:14px 0 6px\">Your reminders today (" + rem.length + ")</h3>" + rem.map(function (r) { return "<p style=\"margin:4px 0\">" + new Date(r.due_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) + " &mdash; " + digestEsc(r.title || r.body) + "</p>"; }).join("")); }
    if (media.length) { any = true; sec.push("<h3 style=\"color:#1d6;margin:14px 0 6px\">New in the library (" + media.length + ")</h3>" + media.slice(0, 10).map(function (mm) { return "<p style=\"margin:4px 0\">" + digestEsc(mm.kind) + ": " + digestEsc(mm.title || "(untitled)") + "</p>"; }).join("")); }
    if (isKing) {
      const leftCt = acts.filter(function (a) { return /remove|left|purge|delete|depart/i.test(String(a.kind || "") + " " + String(a.label || "")); }).length;
      sec.push("<h3 style=\"color:#7b3;margin:14px 0 6px\">King's overview</h3><p style=\"margin:4px 0\">New members: <b>" + newUsers.length + "</b>" + (newUsers.length ? (" (" + newUsers.map(function (x) { return digestEsc(x.name || x.email); }).join(", ") + ")") : "") + "</p><p style=\"margin:4px 0\">Member removals/departures logged: <b>" + leftCt + "</b></p><p style=\"margin:4px 0\">Conversations/posts started today: <b>" + msgs.length + "</b></p><p style=\"margin:4px 0\">Audit events today: <b>" + acts.length + "</b></p>");
      if (newUsers.length || leftCt || msgs.length) any = true;
    }
    if (!any) continue;
    const off = "https://family.clemits.com/?digest=off";
    const html = "<div style=\"font:15px sans-serif;color:#0b1020;max-width:620px\"><h2 style=\"color:#ff2d55\">Your Clemit PULSE digest</h2><p style=\"color:#789\">" + key + " &mdash; what is new" + (isKing ? " (full view)" : "") + ".</p>" + sec.join("") + "<hr style=\"border:none;border-top:1px solid #ddd;margin:18px 0\"><p style=\"color:#aaa;font-size:12px\">You get this because daily digests are on. <a href=\"" + off + "\">Turn it off</a>, or change it in your PULSE settings. &mdash; Clemit PULSE</p></div>";
    try { const res = await sendEmail(env, u.email, "Clemit PULSE — your daily digest", html); await notifyLog(env, 0, "digest", u.email, res.ok, res.detail); } catch (e) {}
  }
}
__name(runDigests, "runDigests");
var HUB_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xIj4KPHRpdGxlPkNsZW1pdCBIdWIg4oCUIENvbW1hbmQgQ2VudGVyPC90aXRsZT4KPHN0eWxlPgogIDpyb290ewogICAgLS1iZzojMGYxMTE1OyAtLXBhbmVsOiMxODFjMjQ7IC0tcGFuZWwyOiMxZjI0MzA7IC0tbGluZTojMmEzMDQwOwogICAgLS10eHQ6I2U4ZWFmMDsgLS1kaW06IzlhYTNiNTsgLS1hY2M6IzRmYzNmNzsgLS1hY2MyOiM4MWM3ODQ7IC0td2FybjojZmZiNzRkOyAtLWJhZDojZmY1ZDZjOwogIH0KICAqe2JveC1zaXppbmc6Ym9yZGVyLWJveDsgbWFyZ2luOjA7IHBhZGRpbmc6MDt9CiAgaHRtbCxib2R5e2hlaWdodDoxMDAlO30KICBib2R5e2JhY2tncm91bmQ6dmFyKC0tYmcpOyBjb2xvcjp2YXIoLS10eHQpOyBmb250OjE2cHgvMS41ICdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWY7IGRpc3BsYXk6ZmxleDsgZmxleC1kaXJlY3Rpb246Y29sdW1uO30KCiAgaGVhZGVye3BhZGRpbmc6MThweCAyOHB4IDEycHg7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6MTZweDsgYm9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tbGluZSk7fQogIGhlYWRlciAuYnJhbmR7Zm9udC1zaXplOjEuNHJlbTsgZm9udC13ZWlnaHQ6ODAwO30KICBoZWFkZXIgLmJyYW5kIHNwYW57Y29sb3I6dmFyKC0tYWNjKTt9CiAgaGVhZGVyICNjbG9ja3tjb2xvcjp2YXIoLS1kaW0pOyBmb250LXNpemU6LjlyZW07fQogIGhlYWRlciAuc3BhY2Vye21hcmdpbi1sZWZ0OmF1dG87fQogIC5wc3dpdGNoe2Rpc3BsYXk6ZmxleDsgZ2FwOjZweDsgbWFyZ2luLXJpZ2h0OjhweDt9CiAgLnBzd2l0Y2ggYnV0dG9ue2JhY2tncm91bmQ6dmFyKC0tcGFuZWwpOyBjb2xvcjp2YXIoLS1kaW0pOyBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOyBwYWRkaW5nOjZweCAxMnB4OyBib3JkZXItcmFkaXVzOjE4cHg7IGZvbnQtc2l6ZTouODJyZW07IGN1cnNvcjpwb2ludGVyO30KICAucHN3aXRjaCBidXR0b24ub257YmFja2dyb3VuZDp2YXIoLS1hY2MpOyBjb2xvcjojMDYyMDMzOyBib3JkZXItY29sb3I6dmFyKC0tYWNjKTsgZm9udC13ZWlnaHQ6NjAwO30KICAuc2lnbm91dHtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50OyBjb2xvcjp2YXIoLS10eHQpOyBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOyBwYWRkaW5nOjhweCAxNnB4OyBib3JkZXItcmFkaXVzOjhweDsgZm9udC1zaXplOi45cmVtOyBjdXJzb3I6cG9pbnRlcjt9CiAgLnNpZ25vdXQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWFjYyk7IGNvbG9yOnZhcigtLWFjYyk7fQoKICAuZ3JlZXRpbmd7cGFkZGluZzoxNnB4IDI4cHggNnB4O30KICAuZ3JlZXRpbmcgaDF7Zm9udC1zaXplOjEuN3JlbTsgZm9udC13ZWlnaHQ6NzAwO30KICAuZ3JlZXRpbmcgaDEgYntjb2xvcjp2YXIoLS1hY2MpOyBmb250LXdlaWdodDo3MDA7fQogIC5ncmVldGluZyBwe2NvbG9yOnZhcigtLWRpbSk7IGZvbnQtc2l6ZToxcmVtOyBtYXJnaW4tdG9wOjJweDt9CgogIG1haW57ZmxleDoxOyBkaXNwbGF5OmdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczoyZnIgMWZyOyBnYXA6MTZweDsgcGFkZGluZzoxNHB4IDI4cHggMjRweDsgbWluLWhlaWdodDowO30KCiAgLndvcmtzcGFjZXtkaXNwbGF5OmZsZXg7IGZsZXgtZGlyZWN0aW9uOmNvbHVtbjsgbWluLWhlaWdodDowO30KICAucmFpbHtkaXNwbGF5OmZsZXg7IGdhcDo4cHg7IGZsZXgtd3JhcDp3cmFwOyBtYXJnaW4tYm90dG9tOjEycHg7fQogIC5yYWlsIGJ1dHRvbntiYWNrZ3JvdW5kOnZhcigtLXBhbmVsKTsgY29sb3I6dmFyKC0tdHh0KTsgYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTsgcGFkZGluZzo4cHggMTRweDsgYm9yZGVyLXJhZGl1czoyMHB4OyBmb250LXNpemU6Ljg4cmVtOyBjdXJzb3I6cG9pbnRlcjt9CiAgLnJhaWwgYnV0dG9uOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1hY2MpO30KICAucmFpbCBidXR0b24uYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tYWNjKTsgY29sb3I6IzA2MjAzMzsgYm9yZGVyLWNvbG9yOnZhcigtLWFjYyk7IGZvbnQtd2VpZ2h0OjYwMDt9CiAgLnN0YWdle2ZsZXg6MTsgYmFja2dyb3VuZDp2YXIoLS1wYW5lbCk7IGJvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7IGJvcmRlci1yYWRpdXM6MTRweDsgb3ZlcmZsb3c6aGlkZGVuOyBkaXNwbGF5OmZsZXg7IGZsZXgtZGlyZWN0aW9uOmNvbHVtbjsgbWluLWhlaWdodDozODBweDt9CiAgLnN0YWdlIC5iYXJ7cGFkZGluZzoxMnB4IDE4cHg7IGJvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpOyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjEwcHg7IGZvbnQtd2VpZ2h0OjYwMDt9CiAgLnN0YWdlIC5iYXIgLmRvdHt3aWR0aDo5cHg7IGhlaWdodDo5cHg7IGJvcmRlci1yYWRpdXM6NTAlOyBiYWNrZ3JvdW5kOnZhcigtLWFjYzIpO30KICAuc3RhZ2UgLmJvZHl7ZmxleDoxOyBkaXNwbGF5OmdyaWQ7IHBsYWNlLWl0ZW1zOmNlbnRlcjsgdGV4dC1hbGlnbjpjZW50ZXI7IGNvbG9yOnZhcigtLWRpbSk7IHBhZGRpbmc6MjRweDt9CiAgLnN0YWdlIC5ib2R5IC5iaWd7Zm9udC1zaXplOjIuMnJlbTsgbWFyZ2luLWJvdHRvbTo4cHg7fQogIC5zdGFnZSAub3Blbmxpbmt7bWFyZ2luLWxlZnQ6YXV0bzsgY29sb3I6dmFyKC0tYWNjKTsgdGV4dC1kZWNvcmF0aW9uOm5vbmU7IGZvbnQtc2l6ZTouODJyZW07IGJvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7IHBhZGRpbmc6M3B4IDEwcHg7IGJvcmRlci1yYWRpdXM6OHB4O30KICAuc3RhZ2UgLm9wZW5saW5rOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1hY2MpO30KICAuc3RhZ2V3cmFwe2ZsZXg6MTsgcG9zaXRpb246cmVsYXRpdmU7IG1pbi1oZWlnaHQ6MDt9CiAgI3BvcnRhbEZyYW1le3Bvc2l0aW9uOmFic29sdXRlOyBpbnNldDowOyB3aWR0aDoxMDAlOyBoZWlnaHQ6MTAwJTsgYm9yZGVyOjA7IGJhY2tncm91bmQ6IzBiMGQxMjt9CgogIC5kamJveHtiYWNrZ3JvdW5kOnJnYmEoOCw2LDIwLC41NSk7IGJvcmRlcjoxcHggc29saWQgcmdiYSg1NSwyMjQsMjU1LC4zNSk7IGJvcmRlci1yYWRpdXM6MTRweDsgZGlzcGxheTpmbGV4OyBmbGV4LWRpcmVjdGlvbjpjb2x1bW47IG92ZXJmbG93OmhpZGRlbjsgbWluLWhlaWdodDowO30KICAuZGpib3ggLmhlYWR7cGFkZGluZzoxMnB4IDE2cHg7IGJvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpOyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjEwcHg7IGZvbnQtd2VpZ2h0OjcwMDt9CiAgLmRqYm94IC5oZWFkIC50YWd7bWFyZ2luLWxlZnQ6YXV0bzsgZm9udC1zaXplOi43cmVtOyBjb2xvcjp2YXIoLS13YXJuKTsgYm9yZGVyOjFweCBzb2xpZCB2YXIoLS13YXJuKTsgYm9yZGVyLXJhZGl1czoxMnB4OyBwYWRkaW5nOjJweCA4cHg7fQogIC5ub3dwbGF5aW5ne3BhZGRpbmc6MTRweCAxNnB4IDRweDsgdGV4dC1hbGlnbjpjZW50ZXI7fQogIC5hcnR7d2lkdGg6OTZweDsgaGVpZ2h0Ojk2cHg7IG1hcmdpbjowIGF1dG8gMTBweDsgYm9yZGVyLXJhZGl1czoxMnB4OyBiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzIzMzA0YSwjMTAyMDJmKTsgZGlzcGxheTpncmlkOyBwbGFjZS1pdGVtczpjZW50ZXI7IGZvbnQtc2l6ZToycmVtO30KICAubm93cGxheWluZyAudHtmb250LXdlaWdodDo2MDA7fQogIC5ub3dwbGF5aW5nIC5he2NvbG9yOnZhcigtLWRpbSk7IGZvbnQtc2l6ZTouOXJlbTt9CiAgLmVxe2Rpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6ZmxleC1lbmQ7IGp1c3RpZnktY29udGVudDpjZW50ZXI7IGdhcDozcHg7IGhlaWdodDozMHB4OyBtYXJnaW46MTBweCAwO30KICAuZXEgaXt3aWR0aDo0cHg7IGJhY2tncm91bmQ6dmFyKC0tYWNjKTsgYm9yZGVyLXJhZGl1czoycHg7IGhlaWdodDo4cHg7IHRyYW5zaXRpb246aGVpZ2h0IC4xNXM7fQogIC5jb250cm9sc3tkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgZ2FwOjE0cHg7IHBhZGRpbmc6MnB4IDAgMTJweDt9CiAgLmNvbnRyb2xzIGJ1dHRvbntiYWNrZ3JvdW5kOnRyYW5zcGFyZW50OyBib3JkZXI6bm9uZTsgY29sb3I6dmFyKC0tdHh0KTsgZm9udC1zaXplOjEuMTVyZW07IGN1cnNvcjpwb2ludGVyO30KICAuY29udHJvbHMgLnBsYXl7d2lkdGg6NDRweDsgaGVpZ2h0OjQ0cHg7IGJvcmRlci1yYWRpdXM6NTAlOyBiYWNrZ3JvdW5kOnZhcigtLWFjYyk7IGNvbG9yOiMwNjIwMzM7IGZvbnQtc2l6ZToxcmVtO30KICAuY29udHJvbHMgLm9ue2NvbG9yOnZhcigtLWFjYyk7fQoKICAuc3RhdGlvbnN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZSk7IGRpc3BsYXk6ZmxleDsgZ2FwOjZweDsgZmxleC13cmFwOndyYXA7IHBhZGRpbmc6MTBweCAxMnB4O30KICAuY2hpcHtmb250LXNpemU6Ljc4cmVtOyBjb2xvcjp2YXIoLS1kaW0pOyBib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOyBib3JkZXItcmFkaXVzOjE0cHg7IHBhZGRpbmc6M3B4IDEwcHg7IGN1cnNvcjpwb2ludGVyO30KICAuY2hpcDpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tYWNjKTt9CiAgLmNoaXAub257Y29sb3I6IzA2MjAzMzsgYmFja2dyb3VuZDp2YXIoLS1hY2MpOyBib3JkZXItY29sb3I6dmFyKC0tYWNjKTsgZm9udC13ZWlnaHQ6NjAwO30KCiAgLnF0b29sc3tkaXNwbGF5OmZsZXg7IGdhcDo2cHg7IGZsZXgtd3JhcDp3cmFwOyBwYWRkaW5nOjEwcHggMTJweDsgYm9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tbGluZSk7fQogIC5xYnRue2ZvbnQtc2l6ZTouNzhyZW07IGNvbG9yOnZhcigtLXR4dCk7IGJhY2tncm91bmQ6dmFyKC0tcGFuZWwyKTsgYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTsgYm9yZGVyLXJhZGl1czo4cHg7IHBhZGRpbmc6NXB4IDEwcHg7IGN1cnNvcjpwb2ludGVyO30KICAucWJ0bjpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tYWNjKTt9CiAgLnFidG4ud2Fybntjb2xvcjp2YXIoLS1iYWQpOyBib3JkZXItY29sb3I6cmdiYSgyNTUsOTMsMTA4LC40KTt9CiAgLnFoZWFke2Rpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBwYWRkaW5nOjZweCAxNHB4OyBmb250LXNpemU6LjhyZW07IGNvbG9yOnZhcigtLWRpbSk7IGJvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWxpbmUpO30KICAucWhlYWQgLm57bWFyZ2luLWxlZnQ6NnB4OyBjb2xvcjp2YXIoLS1hY2MpO30KICAucWhlYWQgLnNyY3ttYXJnaW4tbGVmdDphdXRvOyBmb250LXNpemU6LjcycmVtOyBjb2xvcjp2YXIoLS1kaW0pO30KICAjcXVldWVMaXN0e2ZsZXg6MTsgb3ZlcmZsb3cteTphdXRvOyBtaW4taGVpZ2h0OjkwcHg7fQogIC5xcm93e2Rpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6OHB4OyBwYWRkaW5nOjdweCAxNHB4OyBmb250LXNpemU6Ljg1cmVtOyBib3JkZXItYm90dG9tOjFweCBzb2xpZCByZ2JhKDQyLDQ4LDY0LC41KTsgY3Vyc29yOnBvaW50ZXI7fQogIC5xcm93OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tcGFuZWwyKTt9CiAgLnFyb3cuY3Vye2NvbG9yOnZhcigtLWFjYyk7fQogIC5xcm93IC5tZXRhe2ZsZXg6MTsgbWluLXdpZHRoOjA7IG92ZXJmbG93OmhpZGRlbjsgdGV4dC1vdmVyZmxvdzplbGxpcHNpczsgd2hpdGUtc3BhY2U6bm93cmFwO30KICAucXJvdyAubWV0YSBzbWFsbHtjb2xvcjp2YXIoLS1kaW0pO30KICAucXJvdyAuYWN0e2JhY2tncm91bmQ6bm9uZTsgYm9yZGVyOm5vbmU7IGNvbG9yOnZhcigtLWRpbSk7IGN1cnNvcjpwb2ludGVyOyBmb250LXNpemU6Ljk1cmVtO30KICAucXJvdyAuYWN0OmhvdmVye2NvbG9yOnZhcigtLWJhZCk7fQogIC5xZW1wdHl7cGFkZGluZzoxOHB4IDE0cHg7IGNvbG9yOnZhcigtLWRpbSk7IGZvbnQtc2l6ZTouODVyZW07IHRleHQtYWxpZ246Y2VudGVyO30KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KICA8aGVhZGVyPgogICAgPGRpdiBjbGFzcz0iYnJhbmQiPkNsZW1pdCA8c3Bhbj5IdWI8L3NwYW4+PC9kaXY+CiAgICA8c3BhbiBpZD0iY2xvY2siPjwvc3Bhbj4KICAgIDxkaXYgY2xhc3M9InNwYWNlciI+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJwc3dpdGNoIiBpZD0icHN3aXRjaCI+CiAgICAgIDxidXR0b24gZGF0YS1wPSJqZXNzZSIgY2xhc3M9Im9uIj5CaWcgRGFkZHkgSidzPC9idXR0b24+CiAgICAgIDxidXR0b24gZGF0YS1wPSJqYWVtaWUiPlN3ZWV0bmVzcyc8L2J1dHRvbj4KICAgIDwvZGl2PgogICAgPGJ1dHRvbiBjbGFzcz0ic2lnbm91dCI+U2lnbiBPdXQ8L2J1dHRvbj4KICA8L2hlYWRlcj4KCiAgPGRpdiBjbGFzcz0iZ3JlZXRpbmciPgogICAgPGgxIGlkPSJncmVldCI+R29vZCBldmVuaW5nLCA8Yj5Cb3NzPC9iPi48L2gxPgogICAgPHAgaWQ9InN1YmdyZWV0Ij5XaGF0J3Mgb24gdGhlIGFnZW5kYT88L3A+CiAgPC9kaXY+CgogIDxtYWluPgogICAgPHNlY3Rpb24gY2xhc3M9IndvcmtzcGFjZSI+CiAgICAgIDxkaXYgY2xhc3M9InJhaWwiIGlkPSJyYWlsIj4KICAgICAgICA8YnV0dG9uIGRhdGEtbmFtZT0iUGljdHVyZXMiIGNsYXNzPSJhY3RpdmUiPvCflrzvuI8gUGljdHVyZXM8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGRhdGEtbmFtZT0iRG9jdW1lbnRzIj7wn5OEIERvY3VtZW50czwvYnV0dG9uPgogICAgICAgIDxidXR0b24gZGF0YS1uYW1lPSJNdXNpYyI+8J+OtSBNdXNpYzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gZGF0YS1uYW1lPSJNb3ZpZXMiPvCfjqwgTW92aWVzPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBkYXRhLW5hbWU9IkZvcnVtIj7wn5KsIEZvcnVtPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJzdGFnZSI+CiAgICAgICAgPGRpdiBjbGFzcz0iYmFyIj48c3BhbiBjbGFzcz0iZG90Ij48L3NwYW4+PHNwYW4gaWQ9InN0YWdlVGl0bGUiPlBpY3R1cmVzPC9zcGFuPgogICAgICAgICAgPGEgaWQ9InN0YWdlT3BlbiIgY2xhc3M9Im9wZW5saW5rIiBocmVmPSIjIiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciI+T3BlbiDihpc8L2E+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ic3RhZ2V3cmFwIj4KICAgICAgICAgIDxpZnJhbWUgaWQ9InBvcnRhbEZyYW1lIiB0aXRsZT0icG9ydGFsIiByZWZlcnJlcnBvbGljeT0ibm8tcmVmZXJyZXIiPjwvaWZyYW1lPgogICAgICAgICAgPGRpdiBjbGFzcz0iYm9keSIgaWQ9InN0YWdlQm9keSIgc3R5bGU9ImRpc3BsYXk6bm9uZTsiPgogICAgICAgICAgICA8ZGl2PgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImJpZyI+8J+WvO+4jzwvZGl2PgogICAgICAgICAgICAgIDxkaXY+PGIgaWQ9InN0YWdlTmFtZSI+UGljdHVyZXM8L2I+IOKAlCByZWFkcyB0aGUgb25lIHNoYXJlZCBsaWJyYXJ5LjwvZGl2PgogICAgICAgICAgICAgIDxkaXYgc3R5bGU9Im1hcmdpbi10b3A6NnB4OyBmb250LXNpemU6Ljg1cmVtOyI+QWxsIHRhYnMgcG9pbnQgYXQgdGhlIHNhbWUgZGF0YSBzZXQuIFdpcmUgdGhlIHZpZXcgbmV4dC48L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L3NlY3Rpb24+CgogICAgPGFzaWRlIGNsYXNzPSJkamJveCI+CiAgICAgIDxkaXYgY2xhc3M9ImhlYWQiPvCfjqcgREogQm94IDxzcGFuIGNsYXNzPSJ0YWciIGlkPSJzcmNUYWciPmRlbW88L3NwYW4+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Im5vd3BsYXlpbmciPgogICAgICAgIDxkaXYgY2xhc3M9ImFydCI+8J+OtTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InQiIGlkPSJucFRpdGxlIj5Ob3RoaW5nIHBsYXlpbmc8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJhIiBpZD0ibnBBcnRpc3QiPuKAlDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImVxIiBpZD0iZXEiPjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNvbnRyb2xzIj4KICAgICAgICAgIDxidXR0b24gaWQ9InByZXYiIHRpdGxlPSJQcmV2aW91cyI+4o+uPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJwbGF5IiBpZD0icGxheSIgdGl0bGU9IlBsYXkiPuKWtjwvYnV0dG9uPgogICAgICAgICAgPGJ1dHRvbiBpZD0ibmV4dCIgdGl0bGU9Ik5leHQiPuKPrTwvYnV0dG9uPgogICAgICAgICAgPGJ1dHRvbiBpZD0ic2h1ZiIgdGl0bGU9IlNodWZmbGUgKHdvbid0IHJlcGxheSkiPvCflIA8L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8ZGl2IGNsYXNzPSJzdGF0aW9ucyIgaWQ9InN0YXRpb25zIj4KICAgICAgICA8c3BhbiBjbGFzcz0iY2hpcCBvbiI+8J+OsiBFdmVyeXRoaW5nPC9zcGFuPgogICAgICAgIDxzcGFuIGNsYXNzPSJjaGlwIj7wn464IENsYXNzaWMgUm9jazwvc3Bhbj4KICAgICAgICA8c3BhbiBjbGFzcz0iY2hpcCI+8J+OpyBFbGVjdHJvbmljPC9zcGFuPgogICAgICAgIDxzcGFuIGNsYXNzPSJjaGlwIj7wn6SgIENvdW50cnk8L3NwYW4+CiAgICAgICAgPHNwYW4gY2xhc3M9ImNoaXAiPuKtkCBCLVNpZGVzPC9zcGFuPgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9InF0b29scyI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0icWJ0biIgaWQ9InFBbGwiIHRpdGxlPSJRdWV1ZSBhbGwgbGlzdGVkIHNvbmdzIj5RdWV1ZSBBbGw8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJxYnRuIiBpZD0iZ2VuUSIgdGl0bGU9IkZyZXNoIDI0LXNvbmcgcGxheWxpc3QiPvCfjrIgR2VuZXJhdGU8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJxYnRuIiBpZD0iZ2VuNTAiIHRpdGxlPSJBZGQgNTAgcmFuZG9tIj4rNTA8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJxYnRuIiBpZD0ic2h1ZlEiIHRpdGxlPSJTaHVmZmxlIHRoaXMgY2hhbm5lbCI+8J+UgCBTaHVmZmxlPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0icWJ0biB3YXJuIiBpZD0iY2xlYXJRIiB0aXRsZT0iQ2xlYXIg4oCUIGFza3MgZmlyc3QiPkNsZWFyPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJxaGVhZCI+UXVldWUgPHNwYW4gY2xhc3M9Im4iIGlkPSJxY291bnQiPjwvc3Bhbj48c3BhbiBjbGFzcz0ic3JjIiBpZD0icXNyYyI+PC9zcGFuPjwvZGl2PgogICAgICA8ZGl2IGlkPSJxdWV1ZUxpc3QiPjwvZGl2PgogICAgPC9hc2lkZT4KICA8L21haW4+CgogIDxhdWRpbyBpZD0icGxheWVyIiBwcmVsb2FkPSJub25lIj48L2F1ZGlvPgoKICA8c2NyaXB0IHNyYz0iZGFzaGJvYXJkLWRhdGEuanMiPjwvc2NyaXB0PgogIDxzY3JpcHQgc3JjPSJkYXNoYm9hcmQtZmVlZC5qcyI+PC9zY3JpcHQ+CiAgPHNjcmlwdD4KICAgIC8qID09PT09IFBST0ZJTEUgU1dJVENIIOKAlCB0aGUgb25lICJzd2l0Y2giIG9iamVjdCA9PT09PSAqLwogICAgdmFyIFBST0ZJTEVTPXsKICAgICAgamVzc2U6ICB7IGJyYW5kOiJCaWcgRGFkZHkgSidzIiwgICAgICAgIGdyZWV0TmFtZToiQm9zcyIsICAgICAgYWNjOiIjNGZjM2Y3Iiwgc2tleToiamVzc2VIdWIiIH0sCiAgICAgIGphZW1pZTogeyBicmFuZDoiU3dlZXRuZXNzJyBDb2xsZWN0aW9uIiwgZ3JlZXROYW1lOiJTd2VldG5lc3MiLCBhY2M6IiNlOTQ1NjAiLCBza2V5OiJqYWVtaWVIdWIiIH0KICAgIH07CiAgICB2YXIgYWN0aXZlS2V5PSdqZXNzZSc7CiAgICB0cnl7IHZhciBzYXZlZD1sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaHViUHJvZmlsZScpOyBpZihzYXZlZCYmUFJPRklMRVNbc2F2ZWRdKSBhY3RpdmVLZXk9c2F2ZWQ7IH1jYXRjaChlKXt9CgogICAgZnVuY3Rpb24gYXBwbHlQcm9maWxlKGtleSl7CiAgICAgIGFjdGl2ZUtleT1rZXk7IHZhciBwPVBST0ZJTEVTW2tleV07CiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1hY2MnLCBwLmFjYyk7CiAgICAgIHRyeXsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2h1YlByb2ZpbGUnLCBrZXkpOyB9Y2F0Y2goZSl7fQogICAgICBbXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3Bzd2l0Y2ggYnV0dG9uJyksIGZ1bmN0aW9uKGIpeyBiLmNsYXNzTGlzdC50b2dnbGUoJ29uJywgYi5kYXRhc2V0LnA9PT1rZXkpOyB9KTsKICAgICAgdGljaygpOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ViZ3JlZXQnKS50ZXh0Q29udGVudD1wLmJyYW5kOwogICAgfQogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bzd2l0Y2gnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpewogICAgICB2YXIgYj1lLnRhcmdldC5jbG9zZXN0KCdidXR0b24nKTsgaWYoIWIpIHJldHVybjsgYXBwbHlQcm9maWxlKGIuZGF0YXNldC5wKTsKICAgIH0pOwoKICAgIGZ1bmN0aW9uIHRvZChoKXsgcmV0dXJuIGg8MTIgPyAnbW9ybmluZycgOiBoPDE4ID8gJ2FmdGVybm9vbicgOiAnZXZlbmluZyc7IH0KICAgIGZ1bmN0aW9uIHRpY2soKXsKICAgICAgdmFyIGQ9bmV3IERhdGUoKSwgcD1QUk9GSUxFU1thY3RpdmVLZXldOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvY2snKS50ZXh0Q29udGVudD0KICAgICAgICBkLnRvTG9jYWxlRGF0ZVN0cmluZyh1bmRlZmluZWQse3dlZWtkYXk6J3Nob3J0Jyxtb250aDonc2hvcnQnLGRheTonbnVtZXJpYyd9KSsnLCAnKwogICAgICAgIGQudG9Mb2NhbGVUaW1lU3RyaW5nKHVuZGVmaW5lZCx7aG91cjonbnVtZXJpYycsbWludXRlOicyLWRpZ2l0J30pOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3JlZXQnKS5pbm5lckhUTUw9J0dvb2QgJyt0b2QoZC5nZXRIb3VycygpKSsnLCA8Yj4nK3AuZ3JlZXROYW1lKyc8L2I+Lic7CiAgICB9CiAgICB0aWNrKCk7IHNldEludGVydmFsKHRpY2ssMzAwMDApOwoKICAgIHZhciBpY29ucz17J1BpY3R1cmVzJzon8J+WvO+4jycsJ0RvY3VtZW50cyc6J/Cfk4QnLCdNdXNpYyc6J/CfjrUnLCdNb3ZpZXMnOifwn46sJywnRm9ydW0nOifwn5KsJ307CgogICAgLyogPT09PT0gVEFCUyDigJQgYWxsIHJlYWQgdGhlIG9uZSBsaWJyYXJ5OyBubyBleHRlcm5hbCBib2FyZHMgaW4gc3RlcCAxID09PT09ICovCiAgICB2YXIgQk9BUkRTPXsgJ1BpY3R1cmVzJzpudWxsLCdEb2N1bWVudHMnOm51bGwsJ011c2ljJzpudWxsLCdNb3ZpZXMnOm51bGwsJ0ZvcnVtJzpudWxsIH07CiAgICBmdW5jdGlvbiBsb2FkQm9hcmQobil7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFnZVRpdGxlJykudGV4dENvbnRlbnQ9bjsKICAgICAgdmFyIHVybD1CT0FSRFNbbl0sIGZyYW1lPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3J0YWxGcmFtZScpLAogICAgICAgICAgYm9keT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhZ2VCb2R5JyksIG9wZW49ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YWdlT3BlbicpOwogICAgICBpZih1cmwpeyBmcmFtZS5zcmM9dXJsOyBmcmFtZS5zdHlsZS5kaXNwbGF5PSdibG9jayc7IGJvZHkuc3R5bGUuZGlzcGxheT0nbm9uZSc7CiAgICAgICAgICAgICAgIG9wZW4uaHJlZj11cmw7IG9wZW4uc3R5bGUuZGlzcGxheT0naW5saW5lLWJsb2NrJzsgfQogICAgICBlbHNlIHsgZnJhbWUucmVtb3ZlQXR0cmlidXRlKCdzcmMnKTsgZnJhbWUuc3R5bGUuZGlzcGxheT0nbm9uZSc7IGJvZHkuc3R5bGUuZGlzcGxheT0nZ3JpZCc7IG9wZW4uc3R5bGUuZGlzcGxheT0nbm9uZSc7CiAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhZ2UgLmJpZycpLnRleHRDb250ZW50PWljb25zW25dfHwn4pa4JzsKICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFnZU5hbWUnKS50ZXh0Q29udGVudD1uOyB9CiAgICB9CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmFpbCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jdGlvbihlKXsKICAgICAgdmFyIGI9ZS50YXJnZXQuY2xvc2VzdCgnYnV0dG9uJyk7IGlmKCFiKXJldHVybjsKICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuY2hpbGRyZW4sZnVuY3Rpb24oeCl7eC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTt9KTsgYi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsKICAgICAgbG9hZEJvYXJkKGIuZGF0YXNldC5uYW1lKTsKICAgIH0pOwogICAgbG9hZEJvYXJkKCdQaWN0dXJlcycpOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXRpb25zJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmN0aW9uKGUpewogICAgICB2YXIgYz1lLnRhcmdldC5jbG9zZXN0KCcuY2hpcCcpOyBpZighYylyZXR1cm47CiAgICAgIFtdLmZvckVhY2guY2FsbCh0aGlzLmNoaWxkcmVuLGZ1bmN0aW9uKHgpe3guY2xhc3NMaXN0LnJlbW92ZSgnb24nKTt9KTsgYy5jbGFzc0xpc3QuYWRkKCdvbicpOwogICAgICBpZighcXVldWUubGVuZ3RoKXsgcXVldWU9cmFuZCgyNCk7IHFpPTA7IHJlbmRlclF1ZXVlKCk7IH0KICAgICAgc3RhcnRQbGF5KCk7CiAgICB9KTsKCiAgICAvKiA9PT09PSBMSUJSQVJZIOKAlCByZWFsIGRhdGEgaWYgZGFzaGJvYXJkLWRhdGEuanMgbG9hZGVkLCBlbHNlIGRlbW8gPT09PT0gKi8KICAgIHZhciBERU1PPVtbJ0ZsZWV0d29vZCBNYWMnLCdUaGUgQ2hhaW4nXSxbJ0RhZnQgUHVuaycsJ0RpZ2l0YWwgTG92ZSddLFsnSm9obm55IENhc2gnLCdIdXJ0J10sWydRdWVlbicsJ1VuZGVyIFByZXNzdXJlJ10sCiAgICAgIFsnVGFtZSBJbXBhbGEnLCdMZXQgSXQgSGFwcGVuJ10sWydDQ1InLCdGb3J0dW5hdGUgU29uJ10sWydPREVTWkEnLCdTdW4gTW9kZWxzJ10sWydaYWMgQnJvd24gQmFuZCcsJ0NoaWNrZW4gRnJpZWQnXSwKICAgICAgWydMZWQgWmVwcGVsaW4nLCdLYXNobWlyJ10sWydKdXN0aWNlJywnR2VuZXNpcyddLFsnV2lsbGllIE5lbHNvbicsJ09uIHRoZSBSb2FkIEFnYWluJ10sWydQaW5rIEZsb3lkJywnVGltZSddLAogICAgICBbJ1RoZSBLaWxsZXJzJywnTXIuIEJyaWdodHNpZGUnXSxbJ0RlYWRtYXU1JywnU3Ryb2JlJ10sWydFYWdsZXMnLCdIb3RlbCBDYWxpZm9ybmlhJ10sWydDaHJpcyBTdGFwbGV0b24nLCdUZW5uZXNzZWUgV2hpc2tleSddLAogICAgICBbJ1J1c2gnLCdUb20gU2F3eWVyJ10sWydCb2FyZHMgb2YgQ2FuYWRhJywnUm95Z2JpdiddLFsnQUMvREMnLCdUaHVuZGVyc3RydWNrJ10sWydCb24gSXZlcicsJ0hvbG9jZW5lJ11dOwogICAgZnVuY3Rpb24gZW5jb2RlUGF0aChwKXsgcmV0dXJuIHAuc3BsaXQoJy8nKS5tYXAoZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcvJyk7IH0KICAgIGZ1bmN0aW9uIGJ1aWxkUG9vbCgpewogICAgICB2YXIgbGliPXdpbmRvdy5fX0RBU0hfTElCX187CiAgICAgIGlmKGxpYiAmJiBsaWIudHJhY2tzKXsKICAgICAgICB2YXIgb3V0PVtdOwogICAgICAgIE9iamVjdC5rZXlzKGxpYi50cmFja3MpLmZvckVhY2goZnVuY3Rpb24oYXJ0aXN0KXsKICAgICAgICAgIChsaWIudHJhY2tzW2FydGlzdF18fFtdKS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpewogICAgICAgICAgICB2YXIgdGl0bGU9ZmlsZS5yZXBsYWNlKC9cLlteLl0rJC8sJycpOwogICAgICAgICAgICBvdXQucHVzaChbYXJ0aXN0LCB0aXRsZSwgZW5jb2RlUGF0aCgnTVAzIExpYnJhcnkvJythcnRpc3QrJy8nK2ZpbGUpXSk7CiAgICAgICAgICB9KTsKICAgICAgICB9KTsKICAgICAgICBpZihvdXQubGVuZ3RoKXsgTElCX1BSRVNFTlQ9dHJ1ZTsgcmV0dXJuIG91dDsgfQogICAgICB9CiAgICAgIHJldHVybiBERU1PLnNsaWNlKCk7CiAgICB9CiAgICB2YXIgTElCX1BSRVNFTlQ9ZmFsc2U7CiAgICB2YXIgUE9PTD1idWlsZFBvb2woKTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcmNUYWcnKS50ZXh0Q29udGVudCA9IExJQl9QUkVTRU5UID8gJ2xpYnJhcnknIDogJ2RlbW8nOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3FzcmMnKS50ZXh0Q29udGVudCA9IExJQl9QUkVTRU5UID8gKFBPT0wubGVuZ3RoKycgdHJhY2tzJykgOiAnZGVtbyBzb25ncyAobm8gYXVkaW8pJzsKCiAgICAvKiA9PT09PSBPTkUgUVVFVUUg4oCUIHNoYXJlZCBieSB2aWV3cyBhbmQgdGhlIERKIGJveCA9PT09PSAqLwogICAgdmFyIHF1ZXVlPVtdLCBxaT0tMSwgc2h1ZmZsZT1mYWxzZSwgcGxheWluZz1mYWxzZSwgYW5pbTsKICAgIHZhciBxTGlzdD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVldWVMaXN0JyksIHFDb3VudD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncWNvdW50Jyk7CiAgICB2YXIgYXVkaW89ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcicpOwogICAgdmFyIGFjdHgsIGFuYWx5c2VyLCBzcmNOb2RlLCBmcmVxOwoKICAgIGZ1bmN0aW9uIHNldE5vdygpewogICAgICB2YXIgdD1xaT49MCYmcXVldWVbcWldP3F1ZXVlW3FpXTpudWxsOwogICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnBUaXRsZScpLnRleHRDb250ZW50PXQ/dFsxXTonTm90aGluZyBwbGF5aW5nJzsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25wQXJ0aXN0JykudGV4dENvbnRlbnQ9dD90WzBdOifigJQnOwogICAgfQogICAgZnVuY3Rpb24gcmVuZGVyUXVldWUoKXsKICAgICAgcUNvdW50LnRleHRDb250ZW50PXF1ZXVlLmxlbmd0aD8oJygnK3F1ZXVlLmxlbmd0aCsnKScpOicnOwogICAgICBxTGlzdC5pbm5lckhUTUw9Jyc7CiAgICAgIGlmKCFxdWV1ZS5sZW5ndGgpeyBxTGlzdC5pbm5lckhUTUw9JzxkaXYgY2xhc3M9InFlbXB0eSI+UXVldWUgZW1wdHkg4oCUIEdlbmVyYXRlLCArNTAsIG9yIFF1ZXVlIEFsbC48L2Rpdj4nOyBzZXROb3coKTsgcmV0dXJuOyB9CiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24odCxpKXsKICAgICAgICB2YXIgcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTsgci5jbGFzc05hbWU9J3Fyb3cnKyhpPT09cWk/JyBjdXInOicnKTsKICAgICAgICByLmlubmVySFRNTD0nPHNwYW4gY2xhc3M9Im1ldGEiPicrdFsxXSsnIDxzbWFsbD7CtyAnK3RbMF0rJzwvc21hbGw+PC9zcGFuPicrCiAgICAgICAgICAnPGJ1dHRvbiBjbGFzcz0iYWN0IGlnbm9yZSIgdGl0bGU9Iklnbm9yZSI+8J+aqzwvYnV0dG9uPicrCiAgICAgICAgICAnPGJ1dHRvbiBjbGFzcz0iYWN0IHJlbW92ZSIgdGl0bGU9IlJlbW92ZSI+4pyVPC9idXR0b24+JzsKICAgICAgICByLnF1ZXJ5U2VsZWN0b3IoJy5tZXRhJykub25jbGljaz1mdW5jdGlvbigpeyBxaT1pOyBzZXROb3coKTsgcmVuZGVyUXVldWUoKTsgaWYocGxheWluZykgcGxheUN1cnJlbnQoKTsgfTsKICAgICAgICByLnF1ZXJ5U2VsZWN0b3IoJy5yZW1vdmUnKS5vbmNsaWNrPWZ1bmN0aW9uKGUpeyBlLnN0b3BQcm9wYWdhdGlvbigpOyBxdWV1ZS5zcGxpY2UoaSwxKTsgaWYoaTxxaSlxaS0tOyBlbHNlIGlmKGk9PT1xaSlxaT1NYXRoLm1pbihxaSxxdWV1ZS5sZW5ndGgtMSk7IHJlbmRlclF1ZXVlKCk7IH07CiAgICAgICAgci5xdWVyeVNlbGVjdG9yKCcuaWdub3JlJykub25jbGljaz1mdW5jdGlvbihlKXsgZS5zdG9wUHJvcGFnYXRpb24oKTsgcXVldWUuc3BsaWNlKGksMSk7IGlmKGk8cWkpcWktLTsgZWxzZSBpZihpPT09cWkpcWk9TWF0aC5taW4ocWkscXVldWUubGVuZ3RoLTEpOyByZW5kZXJRdWV1ZSgpOyB9OwogICAgICAgIHFMaXN0LmFwcGVuZENoaWxkKHIpOwogICAgICB9KTsKICAgICAgc2V0Tm93KCk7CiAgICB9CiAgICBmdW5jdGlvbiByYW5kKG4peyB2YXIgcD1QT09MLnNsaWNlKCk7IGZvcih2YXIgaT1wLmxlbmd0aC0xO2k+MDtpLS0pe3ZhciBqPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSooaSsxKSkseD1wW2ldO3BbaV09cFtqXTtwW2pdPXg7fSB2YXIgb3V0PVtdOyB3aGlsZShvdXQubGVuZ3RoPG4pIG91dD1vdXQuY29uY2F0KHApOyByZXR1cm4gb3V0LnNsaWNlKDAsbik7IH0KICAgIGZ1bmN0aW9uIGdlbmVyYXRlKG4peyBpZihxdWV1ZS5sZW5ndGggJiYgIWNvbmZpcm0oJ1JlcGxhY2UgdGhpcyBjaGFubmVsICgnK3F1ZXVlLmxlbmd0aCsnIHNvbmcocykpIHdpdGggYSBmcmVzaCAnK24rJy1zb25nIHBsYXlsaXN0PycpKXJldHVybjsgcXVldWU9cmFuZChuKTsgcWk9cXVldWUubGVuZ3RoPzA6LTE7IHJlbmRlclF1ZXVlKCk7IHN0YXJ0UGxheSgpOyB9CiAgICBmdW5jdGlvbiBhZGQ1MCgpeyBxdWV1ZT1xdWV1ZS5jb25jYXQocmFuZCg1MCkpOyBpZihxaTwwJiZxdWV1ZS5sZW5ndGgpcWk9MDsgcmVuZGVyUXVldWUoKTsgc3RhcnRQbGF5KCk7IH0KICAgIGZ1bmN0aW9uIHF1ZXVlQWxsKCl7IFBPT0wuZm9yRWFjaChmdW5jdGlvbih0KXtxdWV1ZS5wdXNoKHQpO30pOyBpZihxaTwwJiZxdWV1ZS5sZW5ndGgpcWk9MDsgcmVuZGVyUXVldWUoKTsgc3RhcnRQbGF5KCk7IH0KICAgIGZ1bmN0aW9uIHNodWZmbGVRdWV1ZSgpeyBpZihxdWV1ZS5sZW5ndGg8Mil7IGlmKCFxdWV1ZS5sZW5ndGgpe3F1ZXVlPXJhbmQoMjQpO3FpPTA7cmVuZGVyUXVldWUoKTt9IHN0YXJ0UGxheSgpOyByZXR1cm47IH0gdmFyIGN1cj1xaT49MD9xdWV1ZVtxaV06bnVsbDsgZm9yKHZhciBpPXF1ZXVlLmxlbmd0aC0xO2k+MDtpLS0pe3ZhciBqPU1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSooaSsxKSkseD1xdWV1ZVtpXTtxdWV1ZVtpXT1xdWV1ZVtqXTtxdWV1ZVtqXT14O30gcWk9Y3VyP3F1ZXVlLmluZGV4T2YoY3VyKTotMTsgcmVuZGVyUXVldWUoKTsgc3RhcnRQbGF5KCk7IH0KICAgIGZ1bmN0aW9uIGNsZWFyUXVldWUoKXsgaWYocXVldWUubGVuZ3RoICYmICFjb25maXJtKCdDbGVhciB0aGlzIGNoYW5uZWwgKCcrcXVldWUubGVuZ3RoKycgc29uZyhzKSk/JykpcmV0dXJuOyBxdWV1ZT1bXTsgcWk9LTE7IHN0b3BQbGF5KCk7IHJlbmRlclF1ZXVlKCk7IH0KCiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncUFsbCcpLm9uY2xpY2s9cXVldWVBbGw7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VuUScpLm9uY2xpY2s9ZnVuY3Rpb24oKXsgZ2VuZXJhdGUoMjQpOyB9OwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbjUwJykub25jbGljaz1hZGQ1MDsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaHVmUScpLm9uY2xpY2s9c2h1ZmZsZVF1ZXVlOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsZWFyUScpLm9uY2xpY2s9Y2xlYXJRdWV1ZTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaHVmJykub25jbGljaz1mdW5jdGlvbigpeyBzaHVmZmxlPSFzaHVmZmxlOyB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ29uJyxzaHVmZmxlKTsgfTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXh0Jykub25jbGljaz1mdW5jdGlvbigpeyBpZighcXVldWUubGVuZ3RoKXJldHVybjsgcWk9KHFpKzEpJXF1ZXVlLmxlbmd0aDsgc2V0Tm93KCk7IHJlbmRlclF1ZXVlKCk7IGlmKHBsYXlpbmcpIHBsYXlDdXJyZW50KCk7IH07CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJldicpLm9uY2xpY2s9ZnVuY3Rpb24oKXsgaWYoIXF1ZXVlLmxlbmd0aClyZXR1cm47IHFpPShxaS0xK3F1ZXVlLmxlbmd0aCklcXVldWUubGVuZ3RoOyBzZXROb3coKTsgcmVuZGVyUXVldWUoKTsgaWYocGxheWluZykgcGxheUN1cnJlbnQoKTsgfTsKCiAgICB2YXIgZXE9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VxJyk7IGZvcih2YXIgaT0wO2k8MTQ7aSsrKSBlcS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJykpOwogICAgdmFyIGJhcnM9ZXEucXVlcnlTZWxlY3RvckFsbCgnaScpOwoKICAgIGZ1bmN0aW9uIGluaXRBdWRpbygpewogICAgICBpZihhY3R4KSByZXR1cm47CiAgICAgIHRyeXsKICAgICAgICBhY3R4PW5ldyAod2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCkoKTsKICAgICAgICBhbmFseXNlcj1hY3R4LmNyZWF0ZUFuYWx5c2VyKCk7IGFuYWx5c2VyLmZmdFNpemU9NjQ7CiAgICAgICAgc3JjTm9kZT1hY3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZShhdWRpbyk7CiAgICAgICAgc3JjTm9kZS5jb25uZWN0KGFuYWx5c2VyKTsgYW5hbHlzZXIuY29ubmVjdChhY3R4LmRlc3RpbmF0aW9uKTsKICAgICAgICBmcmVxPW5ldyBVaW50OEFycmF5KGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50KTsKICAgICAgfWNhdGNoKGUpeyBhbmFseXNlcj1udWxsOyB9CiAgICB9CiAgICBmdW5jdGlvbiBkcmF3QmFycygpewogICAgICBpZihhbmFseXNlcil7IGFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKGZyZXEpOyBmb3IodmFyIGk9MDtpPGJhcnMubGVuZ3RoO2krKyl7IHZhciB2PWZyZXFbaSoyXXx8MDsgYmFyc1tpXS5zdHlsZS5oZWlnaHQ9KDgrdi8yNTUqMjIpKydweCc7IH0gfQogICAgICBlbHNlIHsgZm9yKHZhciBqPTA7ajxiYXJzLmxlbmd0aDtqKyspeyBiYXJzW2pdLnN0eWxlLmhlaWdodD0oOCtNYXRoLnJhbmRvbSgpKjIyKSsncHgnOyB9IH0KICAgIH0KICAgIGZ1bmN0aW9uIHBsYXlDdXJyZW50KCl7CiAgICAgIHZhciB0PXFpPj0wP3F1ZXVlW3FpXTpudWxsOwogICAgICBpZih0ICYmIHRbMl0peyBpZihhdWRpby5nZXRBdHRyaWJ1dGUoJ3NyYycpIT09dFsyXSl7IGF1ZGlvLnNyYz10WzJdOyB9IGF1ZGlvLnBsYXkoKS5jYXRjaChmdW5jdGlvbigpe30pOyB9CiAgICB9CiAgICBmdW5jdGlvbiBzdGFydFBsYXkoKXsKICAgICAgcGxheWluZz10cnVlOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpLnRleHRDb250ZW50PSfij7gnOwogICAgICBpbml0QXVkaW8oKTsgaWYoYWN0eCYmYWN0eC5zdGF0ZT09PSdzdXNwZW5kZWQnKSBhY3R4LnJlc3VtZSgpOwogICAgICBwbGF5Q3VycmVudCgpOwogICAgICBjbGVhckludGVydmFsKGFuaW0pOyBhbmltPXNldEludGVydmFsKGRyYXdCYXJzLDE0MCk7CiAgICB9CiAgICBmdW5jdGlvbiBzdG9wUGxheSgpewogICAgICBwbGF5aW5nPWZhbHNlOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheScpLnRleHRDb250ZW50PSfilrYnOwogICAgICB0cnl7IGF1ZGlvLnBhdXNlKCk7IH1jYXRjaChlKXt9CiAgICAgIGNsZWFySW50ZXJ2YWwoYW5pbSk7IGZvcih2YXIgaT0wO2k8YmFycy5sZW5ndGg7aSsrKSBiYXJzW2ldLnN0eWxlLmhlaWdodD0nOHB4JzsKICAgIH0KICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5Jykub25jbGljaz1mdW5jdGlvbigpewogICAgICBpZihwbGF5aW5nKXsgc3RvcFBsYXkoKTsgfSBlbHNlIGlmKCFxdWV1ZS5sZW5ndGgpeyBnZW5lcmF0ZSgyNCk7IH0gZWxzZSB7IHN0YXJ0UGxheSgpOyB9CiAgICB9OwogICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBmdW5jdGlvbigpewogICAgICBpZighcXVldWUubGVuZ3RoKXJldHVybjsgcWk9KHFpKzEpJXF1ZXVlLmxlbmd0aDsgc2V0Tm93KCk7IHJlbmRlclF1ZXVlKCk7IHBsYXlDdXJyZW50KCk7CiAgICB9KTsKCiAgICBhcHBseVByb2ZpbGUoYWN0aXZlS2V5KTsKICAgIHJlbmRlclF1ZXVlKCk7CiAgPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo=";

var STARTHERE_B64 = "PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEiPgo8dGl0bGU+U3RhcnQgSGVyZSDigJQgQmFrZSBZb3VyIE93biBQVUxTRTwvdGl0bGU+CjxzdHlsZT4KOnJvb3R7CiAgLS1iZzojMDUwNzBmOyAtLWJnMjojMGEwZjFlOyAtLXBhbmVsOnJnYmEoMTMsMjIsNDIsLjcyKTsgLS1saW5lOiMxNTMxNGQ7CiAgLS1jeWFuOiMwMGU1ZmY7IC0tdmlvbGV0OiNiMTRiZmY7IC0tbWFnOiNmZjNkZjA7IC0tdmFtcDojZmYyZDU1OwogIC0taW5rOiNjZmU5ZmY7IC0tZGltOiM3ZmE2Yzg7IC0tb2s6IzM2ZjFhNjsgLS13YXJuOiNmZmNmNGQ7CiAgLS1nbG93OjAgMCAxOHB4IHJnYmEoMCwyMjksMjU1LC4zNSk7Cn0KKntib3gtc2l6aW5nOmJvcmRlci1ib3h9Cmh0bWwsYm9keXttYXJnaW46MDtwYWRkaW5nOjB9CmJvZHl7CiAgYmFja2dyb3VuZDoKICAgIHJhZGlhbC1ncmFkaWVudCgxMjAwcHggNjAwcHggYXQgODAlIC0xMCUsIHJnYmEoMTc3LDc1LDI1NSwuMTIpLCB0cmFuc3BhcmVudCA2MCUpLAogICAgcmFkaWFsLWdyYWRpZW50KDEwMDBweCA1MDBweCBhdCAwJSAxMTAlLCByZ2JhKDAsMjI5LDI1NSwuMTApLCB0cmFuc3BhcmVudCA2MCUpLAogICAgbGluZWFyLWdyYWRpZW50KDE4MGRlZywjMDUwNzBmLCMwNzBiMTYgNjAlLCMwNTA3MGYpOwogIGNvbG9yOnZhcigtLWluayk7CiAgZm9udDoxNXB4LzEuNTUgIlNlZ29lIFVJIixzeXN0ZW0tdWksLWFwcGxlLXN5c3RlbSxzYW5zLXNlcmlmOwogIG1pbi1oZWlnaHQ6MTAwdmg7IHBhZGRpbmc6MCAwIDgwcHg7Cn0KLyogVFJPTiBmbG9vciAqLwpib2R5OjpiZWZvcmV7Y29udGVudDoiIjtwb3NpdGlvbjpmaXhlZDtpbnNldDphdXRvIDAgMCAwO2hlaWdodDo0MnZoO3otaW5kZXg6LTE7b3BhY2l0eTouNTsKICBiYWNrZ3JvdW5kOgogICAgcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCg5MGRlZyx0cmFuc3BhcmVudCAwIDM4cHgscmdiYSgwLDIyOSwyNTUsLjEwKSAzOHB4IDM5cHgpLAogICAgcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCgwZGVnLHRyYW5zcGFyZW50IDAgMzhweCxyZ2JhKDAsMjI5LDI1NSwuMTApIDM4cHggMzlweCk7CiAgdHJhbnNmb3JtOnBlcnNwZWN0aXZlKDQyMHB4KSByb3RhdGVYKDYyZGVnKTsgdHJhbnNmb3JtLW9yaWdpbjpib3R0b207IG1hc2s6bGluZWFyLWdyYWRpZW50KHRyYW5zcGFyZW50LCMwMDAgNzAlKTt9Ci53cmFwe21heC13aWR0aDoxMDQwcHg7bWFyZ2luOjAgYXV0bztwYWRkaW5nOjAgMThweH0KaGVhZGVyLmhlcm97dGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzo0OHB4IDE4cHggMjZweH0KLmtpY2t7bGV0dGVyLXNwYWNpbmc6LjQyZW07Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tY3lhbik7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO29wYWNpdHk6Ljl9Cmgxe2ZvbnQtc2l6ZTpjbGFtcCgzMHB4LDV2dyw1MnB4KTttYXJnaW46LjE4ZW0gMCAuMWVtOwogIGJhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDkwZGVnLCMwMGU1ZmYsI2IxNGJmZiA1NSUsI2ZmM2RmMCk7LXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6dGV4dDtiYWNrZ3JvdW5kLWNsaXA6dGV4dDtjb2xvcjp0cmFuc3BhcmVudDsKICB0ZXh0LXNoYWRvdzowIDAgMzRweCByZ2JhKDE3Nyw3NSwyNTUsLjI1KX0KLnRhZ3tjb2xvcjp2YXIoLS1kaW0pO21heC13aWR0aDo2NDBweDttYXJnaW46OHB4IGF1dG8gMH0KLnN0YW1we2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi10b3A6MTZweDtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1vayk7Ym9yZGVyOjFweCBzb2xpZCAjMTQ0NjNhO2JhY2tncm91bmQ6cmdiYSgyMCw3MCw1OCwuMjUpOwogIGJvcmRlci1yYWRpdXM6OTk5cHg7cGFkZGluZzo1cHggMTRweH0KLyogcGFuZWwgKi8KLnBhbmVse3Bvc2l0aW9uOnJlbGF0aXZlO2JhY2tncm91bmQ6dmFyKC0tcGFuZWwpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxNHB4OwogIHBhZGRpbmc6MDttYXJnaW46MTZweCAwO2JhY2tkcm9wLWZpbHRlcjpibHVyKDhweCk7Ym94LXNoYWRvdzowIDAgMCAxcHggcmdiYSgwLDIyOSwyNTUsLjA1KSwwIDE4cHggNTBweCByZ2JhKDAsMCwwLC40KX0KLnBhbmVsOjpiZWZvcmUsLnBhbmVsOjphZnRlcntjb250ZW50OiIiO3Bvc2l0aW9uOmFic29sdXRlO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1jeWFuKTtvcGFjaXR5Oi41NX0KLnBhbmVsOjpiZWZvcmV7dG9wOi0xcHg7bGVmdDotMXB4O2JvcmRlci1yaWdodDowO2JvcmRlci1ib3R0b206MDtib3JkZXItdG9wLWxlZnQtcmFkaXVzOjEwcHh9Ci5wYW5lbDo6YWZ0ZXJ7Ym90dG9tOi0xcHg7cmlnaHQ6LTFweDtib3JkZXItbGVmdDowO2JvcmRlci10b3A6MDtib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czoxMHB4fQovKiBhY2NvcmRpb25zICovCmRldGFpbHN7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgcmdiYSgyMSw0OSw3NywuNil9CmRldGFpbHM6bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOjB9CnN1bW1hcnl7Y3Vyc29yOnBvaW50ZXI7bGlzdC1zdHlsZTpub25lO3BhZGRpbmc6MTVweCAxOHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7CiAgZm9udC13ZWlnaHQ6NjAwO2NvbG9yOiNlYWY2ZmY7dHJhbnNpdGlvbjpiYWNrZ3JvdW5kIC4xNXN9CnN1bW1hcnk6Oi13ZWJraXQtZGV0YWlscy1tYXJrZXJ7ZGlzcGxheTpub25lfQpzdW1tYXJ5OmhvdmVye2JhY2tncm91bmQ6cmdiYSgwLDIyOSwyNTUsLjA1KX0Kc3VtbWFyeSAuY2hldnttYXJnaW4tbGVmdDphdXRvO2NvbG9yOnZhcigtLWN5YW4pO3RyYW5zaXRpb246dHJhbnNmb3JtIC4ycztmb250LXNpemU6MTNweDtvcGFjaXR5Oi43fQpkZXRhaWxzW29wZW5dPnN1bW1hcnkgLmNoZXZ7dHJhbnNmb3JtOnJvdGF0ZSg5MGRlZyl9Ci5zZWN0LXRpdGxle2ZvbnQtc2l6ZToxOHB4fQouYmFkZ2V7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NzAwO2JvcmRlci1yYWRpdXM6OTk5cHg7cGFkZGluZzoycHggMTBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2NvbG9yOnZhcigtLWN5YW4pO2JhY2tncm91bmQ6cmdiYSgwLDIyOSwyNTUsLjA4KX0KLmJvZHl7cGFkZGluZzo0cHggMThweCAyMHB4fQouYm9keSBwe2NvbG9yOiNiY2Q4ZjB9Ci5ib2R5IGg0e2NvbG9yOnZhcigtLXZpb2xldCk7bWFyZ2luOjE4cHggMCA2cHg7Zm9udC1zaXplOjEzcHg7bGV0dGVyLXNwYWNpbmc6LjA4ZW07dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlfQp1bC5jbGVhbnttYXJnaW46NnB4IDA7cGFkZGluZy1sZWZ0OjE4cHh9CnVsLmNsZWFuIGxpe21hcmdpbjo0cHggMDtjb2xvcjojYmNkOGYwfQovKiBmZWF0dXJlIHJvd3MgKi8KLmZyb3d7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEycHg7cGFkZGluZzoxMXB4IDE4cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgcmdiYSgyMSw0OSw3NywuNDUpfQouZnJvdzpsYXN0LWNoaWxke2JvcmRlci1ib3R0b206MH0KLmZyb3cgaW5wdXRbdHlwZT1jaGVja2JveF17YXBwZWFyYW5jZTpub25lOy13ZWJraXQtYXBwZWFyYW5jZTpub25lO21pbi13aWR0aDoyMnB4O2hlaWdodDoyMnB4O21hcmdpbi10b3A6MXB4O2N1cnNvcjpwb2ludGVyOwogIGJvcmRlcjoycHggc29saWQgdmFyKC0tY3lhbik7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDpyZ2JhKDAsMjI5LDI1NSwuMDYpO3Bvc2l0aW9uOnJlbGF0aXZlO3RyYW5zaXRpb246LjE1cztib3gtc2hhZG93OnZhcigtLWdsb3cpfQouZnJvdyBpbnB1dFt0eXBlPWNoZWNrYm94XTpjaGVja2Vke2JhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDEzNWRlZywjMDBlNWZmLCMzNmYxYTYpO2JvcmRlci1jb2xvcjojMzZmMWE2fQouZnJvdyBpbnB1dFt0eXBlPWNoZWNrYm94XTpjaGVja2VkOjphZnRlcntjb250ZW50OiJcMjcxMyI7cG9zaXRpb246YWJzb2x1dGU7aW5zZXQ6MDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7CiAgY29sb3I6IzA0MTIxYTtmb250LXdlaWdodDo5MDA7Zm9udC1zaXplOjE0cHh9Ci5mbWV0YXtmbGV4OjE7bWluLXdpZHRoOjB9Ci5mbmFtZXtmb250LXdlaWdodDo2MDA7Y29sb3I6I2VhZjZmZn0KLmZyb3cuZG9uZSAuZm5hbWV7Y29sb3I6dmFyKC0tZGltKTt0ZXh0LWRlY29yYXRpb246bGluZS10aHJvdWdoO3RleHQtZGVjb3JhdGlvbi1jb2xvcjpyZ2JhKDU0LDI0MSwxNjYsLjUpfQouZmRlc2N7Zm9udC1zaXplOjEzcHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjJweH0KLmV4cGFuZHttYXJnaW4tdG9wOjhweH0KLmV4cGFuZCBzdW1tYXJ5e3BhZGRpbmc6NnB4IDA7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tY3lhbik7Zm9udC13ZWlnaHQ6NjAwfQouZXhwYW5kIHN1bW1hcnk6aG92ZXJ7YmFja2dyb3VuZDpub25lO3RleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmV9Ci5wcm9tcHR7cG9zaXRpb246cmVsYXRpdmU7YmFja2dyb3VuZDojMDYxMDFmO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTJweCAxNHB4O21hcmdpbjo2cHggMCAycHg7CiAgZm9udDoxMi41cHgvMS41IHVpLW1vbm9zcGFjZSwiQ2FzY2FkaWEgQ29kZSIsQ29uc29sYXMsbW9ub3NwYWNlO2NvbG9yOiNiZmU2ZmY7d2hpdGUtc3BhY2U6cHJlLXdyYXB9Ci5jb3B5e3Bvc2l0aW9uOmFic29sdXRlO3RvcDo4cHg7cmlnaHQ6OHB4O2ZvbnQ6NjAwIDExcHgvMSAiU2Vnb2UgVUkiLHNhbnMtc2VyaWY7Y29sb3I6IzA0MTIxYTsKICBiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzAwZTVmZiwjYjE0YmZmKTtib3JkZXI6MDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjZweCAxMHB4O2N1cnNvcjpwb2ludGVyfQouY29weTphY3RpdmV7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMXB4KX0KLmNvcHkuZG9uZXtiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzM2ZjFhNiwjMDBlNWZmKX0KY29kZXtiYWNrZ3JvdW5kOnJnYmEoMCwyMjksMjU1LC4wOCk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjVweDtwYWRkaW5nOjFweCA2cHg7Zm9udDoxMnB4IHVpLW1vbm9zcGFjZSxtb25vc3BhY2U7Y29sb3I6IzlmZTlmZn0KcHJlLmNtZHtiYWNrZ3JvdW5kOiMwNjEwMWY7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItbGVmdDozcHggc29saWQgdmFyKC0tY3lhbik7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzoxMnB4IDE0cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7d29yZC1icmVhazpicmVhay13b3JkOwogIGZvbnQ6MTIuNXB4LzEuNiB1aS1tb25vc3BhY2UsbW9ub3NwYWNlO2NvbG9yOiNiZmU2ZmZ9Ci5ub3Rle2JvcmRlci1sZWZ0OjNweCBzb2xpZCB2YXIoLS13YXJuKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDIwNyw3NywuMDYpO3BhZGRpbmc6MTBweCAxNHB4O2JvcmRlci1yYWRpdXM6MCA4cHggOHB4IDA7Y29sb3I6I2ZmZTZhODtmb250LXNpemU6MTNweDttYXJnaW46MTBweCAwfQovKiBjb250cm9scyAqLwouY29udHJvbHN7cG9zaXRpb246c3RpY2t5O3RvcDowO3otaW5kZXg6MjA7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCMwNTA3MGYgNzAlLHRyYW5zcGFyZW50KTtwYWRkaW5nOjE0cHggMCAxMHB4fQouc2VhcmNoYmFye2Rpc3BsYXk6ZmxleDtnYXA6MTBweDthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXB9Ci5zZWFyY2hiYXIgaW5wdXR7ZmxleDoxO21pbi13aWR0aDoyMjBweDtiYWNrZ3JvdW5kOiMwNjEwMWY7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjEwcHg7Y29sb3I6dmFyKC0taW5rKTsKICBwYWRkaW5nOjExcHggMTRweDtmb250LXNpemU6MTRweDtvdXRsaW5lOm5vbmV9Ci5zZWFyY2hiYXIgaW5wdXQ6Zm9jdXN7Ym9yZGVyLWNvbG9yOnZhcigtLWN5YW4pO2JveC1zaGFkb3c6dmFyKC0tZ2xvdyl9Ci5idG57YmFja2dyb3VuZDpyZ2JhKDAsMjI5LDI1NSwuMDgpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Y29sb3I6dmFyKC0tY3lhbik7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTBweCAxNHB4O2N1cnNvcjpwb2ludGVyO2ZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MTNweH0KLmJ0bjpob3ZlcntiYWNrZ3JvdW5kOnJnYmEoMCwyMjksMjU1LC4xNil9Ci5wcm9ne21hcmdpbi10b3A6MTBweH0KLnByYmFye2hlaWdodDoxMHB4O2JvcmRlci1yYWRpdXM6OTk5cHg7YmFja2dyb3VuZDojMDgxNTJhO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7b3ZlcmZsb3c6aGlkZGVufQoucHJmaWxse2hlaWdodDoxMDAlO3dpZHRoOjA7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoOTBkZWcsIzAwZTVmZiwjMzZmMWE2KTt0cmFuc2l0aW9uOndpZHRoIC4zNXM7Ym94LXNoYWRvdzowIDAgMTRweCByZ2JhKDU0LDI0MSwxNjYsLjYpfQoucHJ0eHR7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZGltKTttYXJnaW4tdG9wOjVweDt0ZXh0LWFsaWduOmNlbnRlcn0KLmhpZGV7ZGlzcGxheTpub25lIWltcG9ydGFudH0KZm9vdGVye3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOnZhcigtLWRpbSk7Zm9udC1zaXplOjEycHg7bWFyZ2luLXRvcDozNHB4fQpmb290ZXIgLnNpZ3tjb2xvcjp2YXIoLS1tYWcpO2ZvbnQtd2VpZ2h0OjYwMH0KYXtjb2xvcjp2YXIoLS1jeWFuKX0KCi8qIC0tLSB2MiBhZGRpdGlvbnMgLS0tICovCi5oMnJvd3ttYXJnaW46MjZweCAwIDJweDt0ZXh0LWFsaWduOmNlbnRlcn0KLmgycm93IGgye2ZvbnQtc2l6ZTpjbGFtcCgyMHB4LDMuNHZ3LDMwcHgpO21hcmdpbjowO2JhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDkwZGVnLCMwMGU1ZmYsI2IxNGJmZiA2MCUsI2ZmM2RmMCk7LXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6dGV4dDtiYWNrZ3JvdW5kLWNsaXA6dGV4dDtjb2xvcjp0cmFuc3BhcmVudH0KLmgyc3Vie2NvbG9yOnZhcigtLWRpbSk7Zm9udC1zaXplOjEzcHg7bWFyZ2luOjRweCBhdXRvIDA7bWF4LXdpZHRoOjYyMHB4fQouaW5kZW50e3BhZGRpbmctbGVmdDoxOHB4O2JvcmRlci1sZWZ0OjJweCBzb2xpZCByZ2JhKDAsMjI5LDI1NSwuMjApO21hcmdpbjo4cHggMCA4cHggNnB4fQouY3Jld2dyaWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KDI0MHB4LDFmcikpO2dhcDoxMnB4O3BhZGRpbmc6NnB4IDE4cHggMThweH0KLmNyZXd7YmFja2dyb3VuZDojMDYxMDFmO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTRweCAxNnB4fQouY3JldyAucm9sZXtmb250LXNpemU6MTFweDtsZXR0ZXItc3BhY2luZzouMTJlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7Y29sb3I6dmFyKC0tY3lhbil9Ci5jcmV3IC53aG97Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiNlYWY2ZmY7Zm9udC1zaXplOjE3cHg7bWFyZ2luOjJweCAwIDZweH0KLmNyZXcgLmJsdXJie2NvbG9yOiNiY2Q4ZjA7Zm9udC1zaXplOjEzcHh9Ci5qb2ludXN7cGFkZGluZzowIDE4cHggMThweDtjb2xvcjp2YXIoLS1kaW0pO2ZvbnQtc2l6ZToxM3B4fQoucG1vcC1zdGVwc3tkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDtwYWRkaW5nOjZweCAxOHB4IDE0cHh9Ci5wbW9wLXN0ZXBzIHNwYW57Zm9udC1zaXplOjEycHg7Y29sb3I6I2JmZTZmZjtiYWNrZ3JvdW5kOnJnYmEoMCwyMjksMjU1LC4wNyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjk5OXB4O3BhZGRpbmc6NXB4IDExcHh9Ci5sb2dlbnRyeSBzdW1tYXJ5e2ZvbnQtc2l6ZToxNHB4fQoubG9nZW50cnkgLm1ldGF7Y29sb3I6dmFyKC0tY3lhbik7Zm9udC13ZWlnaHQ6NjAwO21hcmdpbi1yaWdodDo4cHh9Ci5sb2dlbnRyeSAud2hlbntjb2xvcjp2YXIoLS1kaW0pO2ZvbnQtd2VpZ2h0OjQwMDtmb250LXNpemU6MTJweH0KLmNoa3tsaXN0LXN0eWxlOm5vbmU7cGFkZGluZzo4cHggMCA0cHg7bWFyZ2luOjB9Ci5jaGsgbGl7Y29sb3I6I2JjZDhmMDtmb250LXNpemU6MTNweDttYXJnaW46M3B4IDB9Ci5jaGsgbGk6OmJlZm9yZXtjb250ZW50OiJcMjcxMyAgIjtjb2xvcjp2YXIoLS1vayk7Zm9udC13ZWlnaHQ6OTAwfQoucHJvd3twYWRkaW5nOjEzcHggMThweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCByZ2JhKDIxLDQ5LDc3LC40NSl9Ci5wcm93Omxhc3QtY2hpbGR7Ym9yZGVyLWJvdHRvbTowfQoucHJvdyAucGxhYmVse2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojZWFmNmZmO2ZvbnQtc2l6ZToxNHB4O21hcmdpbi1ib3R0b206NnB4fQoucHJvdyAucGNhdHtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS12aW9sZXQpO2xldHRlci1zcGFjaW5nOi4wOGVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZX0KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keT4KPGhlYWRlciBjbGFzcz0iaGVybyI+CiAgPGRpdiBjbGFzcz0ia2ljayI+Q2xlbWl0IFBVTFNFICZtaWRkb3Q7IEZvcnVtcyAmbWlkZG90OyBSZWFkIEhlcmUgRmlyc3Q8L2Rpdj4KICA8aDE+QmFrZSBZb3VyIE93biBQVUxTRTwvaDE+CiAgPHAgY2xhc3M9InRhZyI+VGhpcyBpcyB0aGUgd2hvbGUgcmVjaXBlLiBUaGUgcG9zdC1tb3J0ZW0gb2YgaG93IEkgYnVpbHQgb3VyIGZhbWlseSBzaXRlLCBldmVyeSBmZWF0dXJlIGluIGl0LCBhbmQgZXZlcnkgY29tbWFuZCBpdCB0b29rLiBDaGVjayBvZmYgZWFjaCBwaWVjZSBhcyB5b3UgY29weSBpdCBpbnRvIHlvdXIgb3duIEFJICZtZGFzaDsgYW5kIHdhbGsgYXdheSBvd25pbmcgeW91ciBvd24gY29weSwgZXZlcnkgYnl0ZSBvZiBpdC48L3A+CiAgPGRpdiBjbGFzcz0ic3RhbXAiPiYjMTAwMDM7IFB1Ymxpc2hlZCBKdW4gMTkgMjAyNiAmbWlkZG90OyB2MSAmbWlkZG90OyBidWlsdCAmYW1wOyBvd25lZCBieSB+SmVzc2UgJm1pZGRvdDsgYmFja2VkLXVwICYjMTAwMDM7IFFBICYjMTAwMDM7IHJldmlld2VkICYjMTAwMDM7PC9kaXY+CjwvaGVhZGVyPgo8ZGl2IGNsYXNzPSJ3cmFwIj48ZGl2IGNsYXNzPSJjb250cm9scyI+CiAgICA8ZGl2IGNsYXNzPSJzZWFyY2hiYXIiPgogICAgICA8aW5wdXQgaWQ9InEiIHR5cGU9InNlYXJjaCIgcGxhY2Vob2xkZXI9IiYjMTI4MjY5OyAgRmlsdGVyIGZlYXR1cmVzLCBjb21tYW5kcywgYW55dGhpbmcgb24gdGhpcyBwYWdlJmhlbGxpcDsiPgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4iIG9uY2xpY2s9ImV4cGFuZEFsbCh0cnVlKSI+RXhwYW5kIGFsbDwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4iIG9uY2xpY2s9ImV4cGFuZEFsbChmYWxzZSkiPkNvbGxhcHNlIGFsbDwvYnV0dG9uPgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4iIG9uY2xpY2s9InJlc2V0Q2hlY2tzKCkiPlJlc2V0IGNoZWNrbWFya3M8L2J1dHRvbj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0icHJvZyI+CiAgICAgIDxkaXYgY2xhc3M9InByYmFyIj48ZGl2IGNsYXNzPSJwcmZpbGwiIGlkPSJwcmZpbGwiPjwvZGl2PjwvZGl2PjwhLS0gPT09PT09PT09PT09IFBPU1QgTU9SVEVNID09PT09PT09PT09PSAtLT4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscyBvcGVuPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiMxMjgyMjA7IFRoZSBQb3N0LU1vcnRlbSAmbWRhc2g7IGhvdyB0aGlzIGFjdHVhbGx5IGdvdCBidWlsdDwvc3Bhbj48c3BhbiBjbGFzcz0iYmFkZ2UiPnJlYWQgbWU8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJib2R5Ij4KICAgICAgICA8cD5JJ20gbm90IGEgd2ViIGRldmVsb3Blci4gSSdtIGEgcHJvamVjdCBtYW5hZ2VyIHdpdGggYSBiYW5nZWQtdXAgcGFpciBvZiBoYW5kcyB3aG8gZGVjaWRlZCB0aGUgZmFtaWx5IG5lZWRlZCBvbmUgcHJpdmF0ZSBwbGFjZSB0byBsaXZlIG9ubGluZS4gUFVMU0UgZ290IGJ1aWx0IGJ5IDxiPnRhbGtpbmcgdG8gYW4gQUk8L2I+ICZtZGFzaDsgZGVzY3JpYmluZyB3aGF0IEkgd2FudGVkLCBsZXR0aW5nIGl0IHdyaXRlIHRoZSBjb2RlLCBkZXBsb3lpbmcsIGJyZWFraW5nIHRoaW5ncywgYW5kIGZpeGluZyB0aGVtLiBIZXJlJ3MgdGhlIGhvbmVzdCBzdG9yeSBzbyB5b3UgY2FuIHNraXAgdGhlIHBvdGhvbGVzIEkgaGl0LjwvcD4KCiAgICAgICAgPGg0PldoYXQgSSBzZXQgb3V0IHRvIGRvPC9oND4KICAgICAgICA8cD5PbmUgbG9naW4tZ2F0ZWQgc2l0ZSBmb3IgdGhlIHdob2xlIGZhbWlseTogbW92aWVzLCBtdXNpYywgcGhvdG9zLCBhIG1lc3NhZ2UgYm9hcmQsIGEgZ3JvY2VyeSBsaXN0LCBSViB0ZWxlbWV0cnksIHF1b3RlcywgZ2FtZXMuIENoZWFwIHRvIHJ1biwgcHJpdmF0ZSBieSBkZWZhdWx0LCBhbmQgcnVubmFibGUgYnkgYSBndXkgd2hvIGNhbid0IGNvbWZvcnRhYmx5IHR5cGUgZm9yIGxvbmcuPC9wPgoKICAgICAgICA8aDQ+VGhlIGFyY2hpdGVjdHVyZSBJIGxhbmRlZCBvbjwvaDQ+CiAgICAgICAgPHVsIGNsYXNzPSJjbGVhbiI+CiAgICAgICAgICA8bGk+PGI+T25lIENsb3VkZmxhcmUgV29ya2VyPC9iPiBzZXJ2ZXMgdGhlIGVudGlyZSBhcHAgJm1kYXNoOyB0aGUgd2hvbGUgcGFnZSBpcyBhIHNpbmdsZSBmaWxlLiBQdWJsaWMgcG9ydGFsICg8Y29kZT5jbGVtaXQubmV0PC9jb2RlPikgJnJhcnI7IDxiPkNsb3VkZmxhcmUgQWNjZXNzPC9iPiBlbWFpbCBnYXRlICZyYXJyOyB0aGUgYXBwICg8Y29kZT5mYW1pbHkuY2xlbWl0cy5jb208L2NvZGU+KS48L2xpPgogICAgICAgICAgPGxpPjxiPkQxPC9iPiAoQ2xvdWRmbGFyZSdzIFNRTCBkYXRhYmFzZSkgaG9sZHMgcGVvcGxlLCBwb3N0cywgZ3JvY2VyeSwgUlNWUHMsIHNldHRpbmdzLCBub3RlcywgcmVtaW5kZXJzLjwvbGk+CiAgICAgICAgICA8bGk+PGI+UjI8L2I+IChvYmplY3Qgc3RvcmFnZSkgaG9sZHMgdGhlIGJpZyBmaWxlcyAmbWRhc2g7IG1vdmllcywgbXVzaWMsIHBpY3R1cmVzLiBFZ3Jlc3MgaXMgZnJlZSwgd2hpY2ggaXMgdGhlIHdob2xlIHRyaWNrIHRvIGhvc3RpbmcgNzAwJm5ic3A7R0Igb24gYSBidWRnZXQuPC9saT4KICAgICAgICAgIDxsaT5BIHNtYWxsIDxiPk1vdmVyIGFnZW50PC9iPiBvbiBteSBQQyBjb252ZXJ0cyBhbmQgdXBsb2FkcyBtZWRpYSBvbiBkZW1hbmQsIHNvICJhdmFpbGFibGUiIGRvZXNuJ3QgbWVhbiAiYWxsIHN0b3JlZCBhdCBvbmNlLiI8L2xpPgogICAgICAgICAgPGxpPjxiPmdpdCBwdXNoID0gZGVwbG95LjwvYj4gUHVzaCB0byBHaXRIdWIsIENsb3VkZmxhcmUgV29ya2VycyBCdWlsZHMgc2hpcHMgaXQgaW4gfjMwIHNlY29uZHMuPC9saT4KICAgICAgICA8L3VsPgoKICAgICAgICA8aDQ+V2hhdCB3ZW50IHJpZ2h0ICh3b3J0aCBjb3B5aW5nKTwvaDQ+CiAgICAgICAgPHVsIGNsYXNzPSJjbGVhbiI+CiAgICAgICAgICA8bGk+PGI+IkRvIGl0IG9uY2UuIjwvYj4gRXZlcnkgc2V0dGluZyBzYXZlcyBzZXJ2ZXItc2lkZSB0aGUgaW5zdGFudCB5b3UgdG91Y2ggaXQuIEEgcmVsb2FkIG9yIGEgZGVwbG95IG5ldmVyIHdpcGVzIHlvdXIgcXVldWUsIHlvdXIgc2xpZGVyLCB5b3VyIHNraW4uIEJ1aWxkIHRoZSBwYXR0ZXJuLCBub3QgdGhlIG9uZS1vZmYuPC9saT4KICAgICAgICAgIDxsaT48Yj5EZXNpZ24gYXJvdW5kIHRoZSBjb25zdHJhaW50LjwvYj4gQmVjYXVzZSB0eXBpbmcgaHVydHMsIGV2ZXJ5dGhpbmcgYmVjYW1lIGEgYnV0dG9uIG9yIGEgY2xpY2thYmxlIGljb24uIFRoYXQgYWNjZXNzaWJpbGl0eSB0b29saW5nIGxldCBtZSBydW4gYSBmdWxsIGxpdmUgZGVwbG95bWVudCB3aXRoIGNsaWNrcyBpbnN0ZWFkIG9mIGEga2V5Ym9hcmQgJm1kYXNoOyB0aGUgc2luZ2xlIGJpZ2dlc3QgcmVhbC13b3JsZCB3aW4uPC9saT4KICAgICAgICAgIDxsaT48Yj5UaGUgZGVwbG95ICZyYXJyOyByZWFkLXRoZS1saXZlLWNvbnNvbGUgbG9vcC48L2I+IFdoZW4gYSBsb2NhbCBjaGVjayBjYW4ndCBiZSB0cnVzdGVkLCB0aGUgYnJvd3NlcidzIG93biBlbmdpbmUgaXMgZ3JvdW5kIHRydXRoLiBJdCB0dXJucyBhIHNpbGVudCBibGFuayBwYWdlIGludG8gYSBvbmUtbGluZSBkaWFnbm9zaXMuPC9saT4KICAgICAgICA8L3VsPgoKICAgICAgICA8aDQ+V2hhdCBiaXQgbWUgKHNvIGl0IHdvbid0IGJpdGUgeW91KTwvaDQ+CiAgICAgICAgPHVsIGNsYXNzPSJjbGVhbiI+CiAgICAgICAgICA8bGk+PGI+T25lIGJhZCByZWdleCBibGFua2VkIHRoZSB3aG9sZSBhcHAuPC9iPiBUaGUgZW50aXJlIHBhZ2UgaXMgb25lIGJpZyB0ZXh0IHRlbXBsYXRlLCBzbyBhIHNpbmdsZSBzdHJheSBjaGFyYWN0ZXIga2lsbHMgZXZlcnkgYnV0dG9uLiBMZXNzb246IGJhY2sgdXAgZmlyc3QsIHZhbGlkYXRlLCBhbmQgY2hlY2sgdGhlIGxpdmUgY29uc29sZSBhZnRlciBldmVyeSBkZXBsb3kuPC9saT4KICAgICAgICAgIDxsaT48Yj5BIGR1cGxpY2F0ZSA8Y29kZT5yZXR1cm48L2NvZGU+IGhhbHRlZCB0aGUgc2NyaXB0PC9iPiBhZnRlciBhIHNsb3BweSBibG9jay1yZXBsYWNlICZtZGFzaDsgd2hpdGUgc2NyZWVuLCBubyBuYXYuIExlc3NvbjogcmVwbGFjZSB3aG9sZSBmdW5jdGlvbnMsIG5vdCBwaWVjZXMsIGFuZCBzaGlwIHNtYWxsZXIgaW5jcmVtZW50cy48L2xpPgogICAgICAgICAgPGxpPjxiPlRoZSBib2FyZCBhdGUgcGVvcGxlJ3MgdHlwaW5nPC9iPiBiZWNhdXNlIGEgMjAtc2Vjb25kIGF1dG8tcmVmcmVzaCByZWJ1aWx0IHRoZSBwYWdlIG1pZC1zZW50ZW5jZS4gTGVzc29uOiBuZXZlciBsZXQgYSBiYWNrZ3JvdW5kIHVwZGF0ZSBkaXN0dXJiIGFuIGluLXByb2dyZXNzIGFjdGlvbi4gSXQgbm93IHNraXBzIHJlZnJlc2ggd2hpbGUgYW55IGZpZWxkIGlzIGZvY3VzZWQgb3IgaG9sZHMgYSBkcmFmdC48L2xpPgogICAgICAgICAgPGxpPjxiPkVudmlyb25tZW50IGdvdGNoYXM6PC9iPiBOb2RlIHdhc24ndCBpbnN0YWxsZWQ7IFBvd2VyU2hlbGwgYmxvY2tzIDxjb2RlPm5weDwvY29kZT4gKHVzZSBDb21tYW5kIFByb21wdCk7IFIyIG5lZWRzIGRhc2hib2FyZCBhY3RpdmF0aW9uICsgYmlsbGluZyBiZWZvcmUgYW55IGNhbGw7IDxjb2RlPndyYW5nbGVyIGxvZ2luPC9jb2RlPiBjYW4gdGltZSBvdXQgJm1kYXNoOyBkbyBpdCBmaXJzdCwgdW5odXJyaWVkLjwvbGk+CiAgICAgICAgPC91bD4KCiAgICAgICAgPGg0PlRoZSBvbmUgbGVzc29uIGFib3ZlIGFsbDwvaDQ+CiAgICAgICAgPHA+RGVjaWRlIHRoZSA8Yj5kYXRhIG1vZGVsIGFuZCB0aGUgY29uc3RyYWludHMgYmVmb3JlIHRoZSBVSSBpdGVyYXRlcy48L2I+IEEgMzAtc2Vjb25kIHNrZXRjaCBvZiAid2hhdCBmYWN0cyBkbyBJIHN0b3JlIiBzYXZlcyBhIGRheSBvZiByZWJ1aWxkcy4gRXZlcnl0aGluZyBlbHNlIGlzIGp1c3QgaXRlcmF0aW9uICZtZGFzaDsgZmFpbCBmYXN0LCBrZWVwIHdoYXQgd29ya3MsIHdyaXRlIGRvd24gd2h5LjwvcD4KICAgICAgPC9kaXY+CiAgICA8L2RldGFpbHM+CiAgPC9kaXY+CgogIDwhLS0gPT09PT09PT09PT09IENPTU1BTkRTIC8gUkVDSVBFID09PT09PT09PT09PSAtLT4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscz4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjOTg4MTsmIzY1MDM5OyBUaGUgQ29tbWFuZHMgJm1kYXNoOyBldmVyeSBsaW5lIGl0IHRvb2sgdG8gc3RhbmQgdGhpcyB1cDwvc3Bhbj48c3BhbiBjbGFzcz0iYmFkZ2UiPmNvcHktcGFzdGU8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJib2R5Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJub3RlIj48Yj5Ib25lc3Qgbm90ZTo8L2I+IG1vc3Qgb2YgUFVMU0Ugd2FzIDxpPnNwb2tlbiBpbnRvIGV4aXN0ZW5jZTwvaT4gJm1kYXNoOyBJIGRlc2NyaWJlZCBmZWF0dXJlcyB0byBhbiBBSSBhbmQgaXQgd3JvdGUgdGhlIGNvZGUuIFRoZSBsaXRlcmFsIGNvbW1hbmRzIGJlbG93IGFyZSB0aGUgPGI+c2V0dXAsIGRlcGxveSwgYW5kIGRhdGFiYXNlPC9iPiBsaW5lcyB0aGF0IHRoZSBBSSBhbmQgSSBhY3R1YWxseSByYW4uIFRha2UgdGhlbSBhcyB0aGUgc2NhZmZvbGRpbmc7IHRoZSBmZWF0dXJlIHByb21wdHMgZnVydGhlciBkb3duIGFyZSB0aGUgcmVzdCBvZiB0aGUgcmVjaXBlLjwvZGl2PgoKICAgICAgICA8aDQ+MSAmbWlkZG90OyBJbnN0YWxsIHRoZSB0b29scyAob25lIHRpbWUsIG9uIHlvdXIgUEMpPC9oND4KICAgICAgICA8cHJlIGNsYXNzPSJjbWQiPiMgTm9kZS5qcyAoaW5jbHVkZXMgbnB4KSAtIGluc3RhbGwgZnJvbSBub2RlanMub3JnLCB0aGVuOgpucG0gaW5zdGFsbCAtZyB3cmFuZ2xlciAgICAgICAgIyBDbG91ZGZsYXJlJ3MgZGVwbG95IHRvb2wKIyBPcHRpb25hbCwgZm9yIG1lZGlhOiAgZmZtcGVnIChjb252ZXJ0IHZpZGVvKSArIHJjbG9uZSAoYnVsayB1cGxvYWQpPC9wcmU+CgogICAgICAgIDxoND4yICZtaWRkb3Q7IExvZyBpbiAmYW1wOyB0dXJuIG9uIHN0b3JhZ2U8L2g0PgogICAgICAgIDxwcmUgY2xhc3M9ImNtZCI+bnB4IHdyYW5nbGVyIGxvZ2luICAgICAgICAgICAgICMgb3BlbnMgYnJvd3NlciAtIGFwcHJvdmUgaXQgKGRvbid0IGxldCBpdCB0aW1lIG91dCkKIyBJbiB0aGUgQ2xvdWRmbGFyZSBkYXNoYm9hcmQ6IGVuYWJsZSBSMiAobmVlZHMgYmlsbGluZyBvbikgQkVGT1JFIGFueSBidWNrZXQgY2FsbDwvcHJlPgoKICAgICAgICA8aDQ+MyAmbWlkZG90OyBDcmVhdGUgdGhlIGRhdGFiYXNlICZhbXA7IGJ1Y2tldHM8L2g0PgogICAgICAgIDxwcmUgY2xhc3M9ImNtZCI+bnB4IHdyYW5nbGVyIGQxIGNyZWF0ZSBjbGVtaXQtZmFtaWx5LWRiCm5weCB3cmFuZ2xlciByMiBidWNrZXQgY3JlYXRlIGNsZW1pdC1tb3ZpZXMKbnB4IHdyYW5nbGVyIHIyIGJ1Y2tldCBjcmVhdGUgY2xlbWl0LW11c2ljCm5weCB3cmFuZ2xlciByMiBidWNrZXQgY3JlYXRlIGNsZW1pdC1waWN0dXJlczwvcHJlPgoKICAgICAgICA8aDQ+NCAmbWlkZG90OyBXaXJlIGl0IHVwICZtZGFzaDsgPGNvZGU+d3JhbmdsZXIuanNvbmM8L2NvZGU+PC9oND4KICAgICAgICA8cHJlIGNsYXNzPSJjbWQiPnsKICAibmFtZSI6ICJjbGVtaXQtZmFtaWx5IiwKICAibWFpbiI6ICJzcmMvaW5kZXguanMiLAogICJjb21wYXRpYmlsaXR5X2RhdGUiOiAiMjAyNS0wNS0wMSIsCiAgInJvdXRlcyI6IFt7ICJwYXR0ZXJuIjogImZhbWlseS5jbGVtaXRzLmNvbSIsICJjdXN0b21fZG9tYWluIjogdHJ1ZSB9XSwKICAiZDFfZGF0YWJhc2VzIjogW3sgImJpbmRpbmciOiAiREIiLCAiZGF0YWJhc2VfbmFtZSI6ICJjbGVtaXQtZmFtaWx5LWRiIiwKICAgICAgICAgICAgICAgICAgICAgImRhdGFiYXNlX2lkIjogIiZsdDtwYXN0ZSB0aGUgaWQgZnJvbSBzdGVwIDMmZ3Q7IiB9XSwKICAicjJfYnVja2V0cyI6IFsKICAgIHsgImJpbmRpbmciOiAiTU9WIiwgICAiYnVja2V0X25hbWUiOiAiY2xlbWl0LW1vdmllcyIgfSwKICAgIHsgImJpbmRpbmciOiAiTVVTSUMiLCAiYnVja2V0X25hbWUiOiAiY2xlbWl0LW11c2ljIiB9LAogICAgeyAiYmluZGluZyI6ICJQSUNTIiwgICJidWNrZXRfbmFtZSI6ICJjbGVtaXQtcGljdHVyZXMiIH0KICBdLAogICJ0cmlnZ2VycyI6IHsgImNyb25zIjogWyIqLzUgKiAqICogKiJdIH0sICAgLy8gd2FrZSBldmVyeSA1IG1pbiBmb3IgcmVtaW5kZXJzCiAgIm9ic2VydmFiaWxpdHkiOiB7ICJlbmFibGVkIjogdHJ1ZSB9Cn08L3ByZT4KCiAgICAgICAgPGg0PjUgJm1pZGRvdDsgQ3JlYXRlIHRoZSBkYXRhYmFzZSB0YWJsZXM8L2g0PgogICAgICAgIDxwcmUgY2xhc3M9ImNtZCI+IyBSdW4gZWFjaCB3aXRoOiAgbnB4IHdyYW5nbGVyIGQxIGV4ZWN1dGUgY2xlbWl0LWZhbWlseS1kYiAtLWNvbW1hbmQgIi4uLiIKQ1JFQVRFIFRBQkxFIHVzZXJzICAgIChlbWFpbCBURVhUIFBSSU1BUlkgS0VZLCBuYW1lIFRFWFQsIHJvbGUgVEVYVCwgYXZhdGFyIFRFWFQpOwpDUkVBVEUgVEFCTEUgbWVzc2FnZXMgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGNhdCBURVhULCBlbWFpbCBURVhULCBib2R5IFRFWFQsCiAgICAgICAgICAgICAgICAgICAgICAgdHMgSU5URUdFUiwgZmxhZ19yZXZpZXcgSU5URUdFUiBERUZBVUxUIDApOwpDUkVBVEUgVEFCTEUgZ3JvY2VyeSAgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGl0ZW0gVEVYVCwgYnkgVEVYVCwgZG9uZSBJTlRFR0VSKTsKQ1JFQVRFIFRBQkxFIHJzdnAgICAgIChlbWFpbCBURVhUIFBSSU1BUlkgS0VZLCBzdGF0dXMgVEVYVCwgbm90ZSBURVhUKTsKQ1JFQVRFIFRBQkxFIG1lZGlhICAgIChpZCBJTlRFR0VSIFBSSU1BUlkgS0VZLCBraW5kIFRFWFQsIHVybCBURVhULAogICAgICAgICAgICAgICAgICAgICAgIHBlb3BsZSBURVhULCBwbGFjZSBURVhULCBjYXB0aW9uIFRFWFQpOwpDUkVBVEUgVEFCTEUgbm90ZXMgICAgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIG93bmVyIFRFWFQsIGJvZHkgVEVYVCwgdHMgSU5URUdFUik7CkNSRUFURSBUQUJMRSBzZXR0aW5ncyAoa2V5IFRFWFQgUFJJTUFSWSBLRVksIHZhbHVlIFRFWFQpOyAgLS0gdGhlICJkbyBpdCBvbmNlIiBzdG9yZTwvcHJlPgoKICAgICAgICA8aDQ+NiAmbWlkZG90OyBQdXQgdGhlIGVtYWlsIGdhdGUgaW4gZnJvbnQgKENsb3VkZmxhcmUgWmVybyBUcnVzdCk8L2g0PgogICAgICAgIDx1bCBjbGFzcz0iY2xlYW4iPgogICAgICAgICAgPGxpPlplcm8gVHJ1c3QgJnJhcnI7IEFjY2VzcyAmcmFycjsgQXBwbGljYXRpb25zICZyYXJyOyBhZGQgPGNvZGU+ZmFtaWx5LmNsZW1pdHMuY29tPC9jb2RlPi48L2xpPgogICAgICAgICAgPGxpPlBvbGljeTogYWxsb3cgb25seSB5b3VyIGZhbWlseSdzIGVtYWlsIGFkZHJlc3Nlcy4gVGhleSBnZXQgYSBvbmUtdGltZSBjb2RlIHRvIGxvZyBpbiAmbWRhc2g7IG5vIHBhc3N3b3JkcyB0byBtYW5hZ2UuPC9saT4KICAgICAgICA8L3VsPgoKICAgICAgICA8aDQ+NyAmbWlkZG90OyBEZXBsb3k8L2g0PgogICAgICAgIDxwcmUgY2xhc3M9ImNtZCI+IyBCcmVhay1nbGFzcyAvIGZpcnN0IGRlcGxveSAocnVuIGluIENvbW1hbmQgUHJvbXB0LCBOT1QgUG93ZXJTaGVsbCk6Cm5weCB3cmFuZ2xlciBkZXBsb3kKCiMgVGhlIGV2ZXJ5ZGF5IHdheSBvbmNlIEdpdEh1YiBpcyB3aXJlZCB0byBXb3JrZXJzIEJ1aWxkczoKZ2l0IGFkZCBzcmMvaW5kZXguanMKZ2l0IGNvbW1pdCAtbSAid2hhdCBjaGFuZ2VkIgpnaXQgcHVzaCAgICAgICAgICAgICAgICAgICAgICMgcHVzaCA9IGxpdmUgaW4gfjMwcwoKIyBBbHdheXMgdmFsaWRhdGUgYmVmb3JlIHlvdSBzaGlwOgpub2RlIC0tY2hlY2sgc3JjL2luZGV4LmpzICAgICMgY2F0Y2hlcyB0aGUgc3ludGF4IGVycm9yIHRoYXQgYmxhbmtzIHRoZSBwYWdlPC9wcmU+CiAgICAgICAgPGRpdiBjbGFzcz0ibm90ZSI+UG93ZXJTaGVsbCBibG9ja3MgPGNvZGU+bnB4LnBzMTwvY29kZT4gKGV4ZWN1dGlvbi1wb2xpY3kpLiBVc2UgPGI+Q29tbWFuZCBQcm9tcHQ8L2I+IGZvciBhbnkgd3JhbmdsZXIgY29tbWFuZCwgb3IgeW91J2xsIGNoYXNlIGEgcGhhbnRvbSBlcnJvciBmb3IgYW4gaG91ci48L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2RldGFpbHM+CiAgPC9kaXY+CiAgCiAgPGRpdiBjbGFzcz0iaDJyb3ciPjxoMj4mIzEyODI2OTsgSG93IGRpZCBKZXNzZSBkbyB0aGlzPyBDb3B5IGl0IGhlcmUuPC9oMj4KICAgIDxwIGNsYXNzPSJoMnN1YiI+RXZlcnkgZmVhdHVyZSBpbiB0aGUgc2l0ZS4gQ2hlY2sgdGhlIGJveCBhcyB5b3UgY29weSBlYWNoIG9uZSBpbnRvIHlvdXIgb3duIEFJIGFuZCBtYWtlIGl0IHlvdXJzLiBUaGUgcmVhZHktdG8tcGFzdGUgcHJvbXB0cyBmb3IgYWxsIG9mIHRoZXNlIGxpdmUgYXQgdGhlIHZlcnkgYm90dG9tIG9mIHRoZSBwYWdlLjwvcD4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJpbmRlbnQiPiAgPGRpdiBjbGFzcz0icGFuZWwiPgogICAgPGRldGFpbHMgb3Blbj4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjMTI3OTU5OyYjNjUwMzk7IEZvdW5kYXRpb24gJmFtcDsgSW5mcmFzdHJ1Y3R1cmU8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi13b3JrZXIiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+U2luZ2xlLVdvcmtlciBhcHA8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+VGhlIGVudGlyZSBzaXRlIGlzIG9uZSBDbG91ZGZsYXJlIFdvcmtlciBzZXJ2aW5nIG9uZSBIVE1MIHBhZ2UgKyBhIEpTT04gQVBJLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1hY2Nlc3MiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+Q2xvdWRmbGFyZSBBY2Nlc3MgZW1haWwgZ2F0ZTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5GYW1pbHkgbG9ncyBpbiB3aXRoIGEgb25lLXRpbWUgZW1haWwgY29kZSAmbWRhc2g7IG5vIHBhc3N3b3JkcyB0byBtYW5hZ2UuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWQxIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkQxIGRhdGFiYXNlPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlNRTCBzdG9yZSBmb3IgcGVvcGxlLCBwb3N0cywgZ3JvY2VyeSwgUlNWUHMsIG1lZGlhIHRhZ3MsIHNldHRpbmdzLCBub3RlcywgcmVtaW5kZXJzLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1yMiI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5SMiBvYmplY3Qgc3RvcmFnZTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5CdWNrZXRzIGZvciBtb3ZpZXMsIG11c2ljLCBwaWN0dXJlcyAmbWRhc2g7IHN0cmVhbWVkIHRocm91Z2ggdGhlIFdvcmtlciwgZnJlZSBlZ3Jlc3MuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWNyb24iPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+Q3JvbiAvIHNjaGVkdWxlZCBoYW5kbGVyPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPldha2VzIGV2ZXJ5IDUgbWludXRlcyB0byBmaXJlIGR1ZSByZW1pbmRlcnMuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWdpdGRlcGxveSI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5naXQgcHVzaCA9IGRlcGxveTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5QdXNoIHRvIEdpdEh1YiwgQ2xvdWRmbGFyZSBXb3JrZXJzIEJ1aWxkcyBhdXRvLXNoaXBzIGluIH4zMHMuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWRvb25jZSI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj4iRG8gaXQgb25jZSIgcGVyc2lzdGVuY2U8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+RXZlcnkgc2V0dGluZyBzYXZlcyBzZXJ2ZXItc2lkZSBpbnN0YW50bHk7IHJlbG9hZHMvZGVwbG95cyBuZXZlciB3aXBlIGl0LjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1kYXRhdGFibGUiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+U2hhcmVkIGRhdGFUYWJsZSBjb21wb25lbnQ8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+T25lIHRhYmxlIGZ1bmN0aW9uIChzb3J0LCBncm91cCwgdG9vbHRpcHMpIHJldXNlZCBieSBldmVyeSBsaXN0IG9uIHRoZSBzaXRlLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgPC9kZXRhaWxzPgogIDwvZGl2PgogIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgIDxkZXRhaWxzIG9wZW4+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJzZWN0LXRpdGxlIj4mIzEyNzk2ODsgSG9tZSwgSGVybyAmYW1wOyBTcGVlZDwvc3Bhbj48c3BhbiBjbGFzcz0iY2hldiI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWhlcm8iPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+SGVybyBiYW5uZXIgKHNraW5zICsgcmFuZG9tIGV2ZW50cyk8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+UGlja3MgYSBmcmVzaCBiYW5uZXIgZWFjaCB2aXNpdDsgbXVsdGlwbGUgc2tpbnMgKyBzdXJwcmlzZSBldmVudHMsIG93bmVyLXNlbGVjdGFibGUgaW4gU2V0dGluZ3MuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWxldHNnbyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj4iTGV0J3MgR28hISIgbG9hZCBjb250cmFjdDwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5UaGUgbGFzdCB0aGluZyB0byBwYWludCA9IHRoZSBwYWdlIGlzIHJlYWR5LCB1bmRlciAycyBldmVyeSB0aW1lLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1zdGF0dXNiYXIiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+RGVmZXJyZWQtbG9hZCBzdGF0dXMgYmFyPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlJlcG9ydHMgd2hpY2ggZmlsZSBpcyBsb2FkaW5nLCBlbGFwc2VkLCBFVEEgJm1kYXNoOyBzbG93IHBpZWNlcyBhcmUgdmlzaWJsZSwgbm90IGEgc2lsZW50IGZyZWV6ZS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtc3RpY2t5cGxheWVyIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlJlc3BvbnNpdmUgc3RpY2t5IHBsYXllcjwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5IZXJvIHNocmlua3Mgb24gc2Nyb2xsOyBhbiBhY3RpdmUgc29uZyBsaWZ0cyBpbnRvIGEgc2xpbSBwaW5uZWQgdG9wIGJhci48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtc2FmZVJlZnJlc2giPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+Ik5ldmVyIGVhdCB5b3VyIHdvcmsiIGd1YXJkPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkJhY2tncm91bmQgcmVmcmVzaCBza2lwcyB3aGlsZSBhbnkgZmllbGQgaXMgZm9jdXNlZCBvciBob2xkcyBhbiB1bnNhdmVkIGRyYWZ0LjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1ub3N0b3JlIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPk5vLXN0b3JlIGNhY2hlIGhlYWRlcjwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5BIG5vcm1hbCByZWZyZXNoIGFsd2F5cyBnZXRzIHRoZSBuZXdlc3QgZGVwbG95LjwvZGl2PjwvZGl2PjwvZGl2PgogICAgPC9kZXRhaWxzPgogIDwvZGl2PgogIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgIDxkZXRhaWxzIG9wZW4+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJzZWN0LXRpdGxlIj4mIzEyODIxODsgTGlicmFyeSAmYW1wOyBNZWRpYTwvc3Bhbj48c3BhbiBjbGFzcz0iY2hldiI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWNhdGFsb2ciPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+TW92aWUgY2F0YWxvZzwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5Qb3N0ZXIgY2FyZHM6IGNvbGxlY3Rpb24sIHJ1bnRpbWUsIHN0YXIgdGllciwgZGVzY3JpcHRpb24sIGxhc3Qtd2F0Y2hlZCArIHdoby48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtY292ZXJmbG93Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkNvdmVyZmxvdyBicm93c2VyPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlRhcCBNdXNpYy9Nb3ZpZXMgYW5kIGZsaXAgdGhyb3VnaCBjb3ZlciBhcnQgaW4gYSAzRCByZWVsLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi10YWdnaW5nIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPk1lZGlhIHRhZ2dpbmcgKyBmaWx0ZXI8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+VGFnIHBlb3BsZSBhbmQgcGxhY2VzOyBvbmUgZmlsdGVyIGJveCBzZWFyY2hlcyB0aGUgd2hvbGUgbGlicmFyeS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtcm90YXRpb24iPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+Um90YXRpb24gZW5naW5lPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkJ1aWxkcyB0aGUgc2hlbGYgZnJvbSBjYXRhbG9nICZ0aW1lczsgYWRtaW4gd2VpZ2h0cyAmdGltZXM7IGNhcCAmdGltZXM7IHJlY2VuY3kgJnRpbWVzOyBzZXJpZXMgcnVsZXMuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLW1vdmVyIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPk1vdmVyIGFnZW50PC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlBDLXNpZGUgYWdlbnQ6IGZmbXBlZy1jb252ZXJ0cywgcmNsb25lLXVwbG9hZHMsIGtlZXBzIHRoZSBob3Qgc2hlbGYgZnVsbCB0byB0aGUgY2FwLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1kZXN0cm95Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkRlc3Ryb3kgLyBudWtlIHdpdGggcmVhc29uPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlR5cGUtdG8tY29uZmlybSBoYXJkIGRlbGV0ZSB0aGF0IGxvZ3MgIndoeSIgYWRtaW4tb25seS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtc3RvcmFnZSI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5MaXZlIHN0b3JhZ2UgbWV0ZXI8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+QSBwb2Qgc2hvd2luZyByZWFsIFIyIHVzYWdlIGFnYWluc3QgdGhlIGNhcC48L2Rpdj48L2Rpdj48L2Rpdj4KICAgIDwvZGV0YWlscz4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscyBvcGVuPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiMxMjgyNjY7IEZvcnVtcywgTm90ZXMgJmFtcDsgTWVzc2FnaW5nPC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtZm9ydW1zIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkZvcnVtcyB3aXRoIGNhdGVnb3JpZXM8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+UmVhZCBIZXJlIEZpcnN0LCBHZW5lcmFsLCBGYW1pbHkgaGFwcGVuaW5ncywgSGVhbHRoc3R5bGUsIFRlY2gsIEFJLCBEJmFtcDtEICZtZGFzaDsgcGljayBhIHBsYWNlIHRvIHBvc3QuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLXByaXZyb29tcyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5Qcml2YXRlIHJvb21zPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkhvdXNlaG9sZCArIEhvdXNla2VlcGluZyBib2FyZHMgdmlzaWJsZSBvbmx5IHRvIHRoZSB0d28gb2YgeW91IChhbmQgaW52aXRlZXMpLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1wZXJtcyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5QZXItY2F0ZWdvcnkgcGVybWlzc2lvbnM8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+QWRtaW5zIGdyYW50IHdobyBjYW4gc2VlL3Bvc3QgaW4gZWFjaCBib2FyZC48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtZmxhZyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5GbGFnZ2luZyArIHByb2Zhbml0eSBzY2FuPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkFueW9uZSBjYW4gZmxhZyBhIHBvc3Q7IGZsYWdnZWQvcHJvZmFuZSBwb3N0cyByb3V0ZSB0byBhIHJveWFscy1vbmx5ICJOZWVkcyByZXZpZXciIGNhcmQuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLW5vdGVzIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlBlcnNvbmFsIE5vdGVzIChwcml2YXRlKTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5Qcml2YXRlIG5vdGVwYWQgd2l0aCBzaGFyZS13aXRoLW9uZS1wZXJzb24tb24tYS10aW1lciB0aGF0IGF1dG8tZXhwaXJlcy48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtcmVtaW5kZXJzIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlJlbWluZGVycyAoZW1haWwgKyBTTVMpPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPiJSZW1pbmQgTWUhIiBub3RlcyBmaXJlIHZpYSBjcm9uIHRocm91Z2ggZW1haWwgKFNlbmRHcmlkKSBhbmQgdGV4dCAoVHdpbGlvKS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYta2luZ3ZpZXciPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+QWRtaW4gb3ZlcnJpZGUgdmlldzwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5UaGUgIktpbmciIGNhbiByZWFkIG1lbWJlcnMnIHByaXZhdGUgbm90ZXMgcmVhZC1vbmx5ICZtZGFzaDsgdGhlIGZhbWlseS1zYWZldHkgb3ZlcnJpZGUuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0icGFuZWwiPgogICAgPGRldGFpbHMgb3Blbj4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjMTI3OTI1OyBNdXNpYyAmYW1wOyB0aGUgREogQm94PC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtZGpib3giPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+REogQm94IHF1ZXVlPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlJpZ2h0LXJhaWwgcGxheWVyOyB0aGUgbGl2ZSBxdWV1ZSArIHBsYXkgcG9zaXRpb24gcGVyc2lzdCBpbiBEMSBhbmQgc3Vydml2ZSBkZXBsb3lzLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1yYWRpbyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5SYWRpbyBmYWxsYmFjazwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5EZWZhdWx0cyB0byByYWRpbyBtb2RlIHdoZW4gdGhlIGxpYnJhcnkgaXMgZW1wdHkgc28gYWN0aW9ucyBuZXZlciBkZWFkLWVuZC48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtY3J1aXNlIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlBlci1wZXJzb24gY3J1aXNlIHNraW48L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+RWFjaCBwZXJzb24ncyBzdGF0aW9uOiB0aGVpciBicmFuZCwgb3B0LWluIG5vdGlmaWNhdGlvbnMsIGhpZGRlbiBkaXNsaWtlZCBzb25ncy48L2Rpdj48L2Rpdj48L2Rpdj4KICAgIDwvZGV0YWlscz4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscyBvcGVuPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiMxMjc4ODE7IEZhbWlseSBMaWZlIFRhYnM8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1ncm9jZXJ5Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlNoYXJlZCBncm9jZXJ5IGxpc3Q8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+RXZlcnlvbmUgYWRkcy9jaGVja3MgaXRlbXM7IGFuIGFkbWluIHRvZ2dsZSBsZXRzIGd1ZXN0cyBoZWxwIHNob3AuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLXJldW5pb24iPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+UmV1bmlvbiBSU1ZQPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkV2ZW50IHBhZ2Ugd2l0aCBwZXItcGVyc29uIFJTVlAgc3RhdHVzICsgbm90ZXMuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLW15dHJpdG9uIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPk15VHJpdG9uIHRlbGVtZXRyeTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5MaXZlIHNvbGFyL2JhdHRlcnkgcmVhZG91dCBmcm9tIHRoZSBSViAoVmljdHJvbiBWUk0pLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1jYW1lcmFzIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkNhbWVyYXM8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+TGl2ZSBSVFNQL0hMUyBjYW1lcmEgZmVlZHMgaW5zaWRlIHRoZSBnYXRlLjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1xdW90ZXMiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+UXVvdGVzIHdpdGggZmF2b3JpdGVzICsgdmV0dGluZzwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5Sb3RhdGluZyBoZXJvIHF1b3RlczsgaGVhcnQgeW91ciBmYXZvcml0ZXMgKG5hbWVzIHNob3cpOyBzdWJtaXQgbmV3IG9uZXMgdGhhdCByb3lhbHMgYXBwcm92ZS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtYXJjYWRlIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkFyY2FkZTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5BIHRhYiBvZiBwbGF5YWJsZSByZXRyby1zdHlsZSBnYW1lcyBmb3IgdGhlIGZhbWlseS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgIDwvZGV0YWlscz4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscyBvcGVuPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiMxMjgwODE7IFBlb3BsZSwgUm9sZXMgJmFtcDsgTW9kZXJhdGlvbjwvc3Bhbj48c3BhbiBjbGFzcz0iY2hldiI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLXJvbGVzIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlJvbGVzICZhbXA7IHJveWFsczwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5LaW5nL1F1ZWVuIChyb3lhbHMpLCBTdXBlckFkbWluLCBtZW1iZXIsIGd1ZXN0ICZtZGFzaDsgcG93ZXJzIGdhdGVkIGJ5IHJvbGUuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWhvdXNlaG9sZHMiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+SG91c2Vob2xkcyBhbGxvdy1saXN0ICsgYXV0by1hcHByb3ZlPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPlNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHBlb3BsZTsga25vd24gZW1haWxzIGF1dG8tYXBwcm92ZSBvbiBmaXJzdCBsb2dpbi48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtYXZhdGFycyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5BdmF0YXJzPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkluaXRpYWxzIGJ5IGRlZmF1bHQsIG9yIGEgY2hvc2VuIHBpY3R1cmUvVVJMOyBzaG93biBvbiBldmVyeSBwb3N0LjwvZGl2PjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcm93Ij48aW5wdXQgdHlwZT0iY2hlY2tib3giIGRhdGEtaz0iZi1vd25lcnNoaXAiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+RGF0YSBvd25lcnNoaXAgLyByaWdodCB0byBwdXJnZTwvZGl2PjxkaXYgY2xhc3M9ImZkZXNjIj5NZW1iZXJzIG93biB0aGVpciBjb250ZW50IGFuZCBjYW4gcHVyZ2UgaXQsIGxlYXZpbmcgb25seSBhIHRvbWJzdG9uZS48L2Rpdj48L2Rpdj48L2Rpdj4KICAgIDwvZGV0YWlscz4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGV0YWlscyBvcGVuPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiM5ODgxOyYjNjUwMzk7IEFkbWluLCBMb2dzICZhbXA7IFNldHRpbmdzPC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtY29udHJvbCI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5Db250cm9sIFBhbmVsPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPk9uZSBhZG1pbiBwbGFjZTogc2l0ZSB0b2dnbGVzLCBmb3J1bSBzcGFjZXMsIHBlcm1pc3Npb25zLCBwZW9wbGUuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLWF1ZGl0Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlN5c3RlbSBBdWRpdCBsb2c8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+TG9naW5zLCBwbGF5cywgdmlld3MsIHVwbG9hZHMsIHBvc3RzLCBkZWxldGVzICZtZGFzaDsgd2l0aCBoaWRlLWJ5LWxldmVsIGZpbHRlcmluZy48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtY2xlbWl0bG9nIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPkRlc3Ryb3llZC1pdGVtcyBsb2c8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+UGVybWFuZW50IHJlY29yZCBvZiBudWtlZCBpdGVtczsgbGluZS1yZW1vdmFsIHJlc3RyaWN0ZWQgdG8gU3VwZXJBZG1pbi48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtc2V0dGluZ3MiPgogICAgICAgIDxkaXYgY2xhc3M9ImZtZXRhIj48ZGl2IGNsYXNzPSJmbmFtZSI+U2V0dGluZ3MgKG1lbWJlcnMsIGxpc3RzLCB0aGVtZSk8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+RWRpdGFibGUgbWVtYmVyIHJvd3MsIGlubGluZSByb2xlcywgYSBtYXN0ZXIgTGlzdHMgcGlja2xpc3QsIHRoZW1lIHBpY2tlci48L2Rpdj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZnJvdyI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWs9ImYtdXBkYXRlcyI+CiAgICAgICAgPGRpdiBjbGFzcz0iZm1ldGEiPjxkaXYgY2xhc3M9ImZuYW1lIj5VcGRhdGVzIC8gY2hhbmdlbG9nPC9kaXY+PGRpdiBjbGFzcz0iZmRlc2MiPkEgdGFiIHdoZXJlIHRoZSBmYW1pbHkgc2VlcyB3aGF0IHNoaXBwZWQgcmVjZW50bHkuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImZyb3ciPjxpbnB1dCB0eXBlPSJjaGVja2JveCIgZGF0YS1rPSJmLXN0YW1wIj4KICAgICAgICA8ZGl2IGNsYXNzPSJmbWV0YSI+PGRpdiBjbGFzcz0iZm5hbWUiPlByb3ZlbmFuY2UgIlB1Ymxpc2hlZCIgc3RhbXA8L2Rpdj48ZGl2IGNsYXNzPSJmZGVzYyI+QSB3YXgtc2VhbCBzdGFtcCBvbiBzaGlwcGVkIHZpZXdzOiBkYXRlLCB2ZXJzaW9uLCBvd25lciwgUUEgZmxhZ3MuPC9kaXY+PC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgPC9kaXY+CiAgPC9kaXY+CgogIDxkaXYgY2xhc3M9Imgycm93Ij48aDI+JiMxMDA4NDsmIzY1MDM5OyBUaGUgQ3JldyAmbWRhc2g7IHdobyBtYWRlIHRoaXMgcmVhbDwvaDI+CiAgICA8cCBjbGFzcz0iaDJzdWIiPlRoaXMgcGFnZSwgYW5kIHRoZSB3aG9sZSBQVUxTRSBzaXRlIGJlaGluZCBpdCwgZXhpc3RzIGJlY2F1c2Ugb2YgdGhlc2UgcGVvcGxlLjwvcD4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICA8ZGl2IGNsYXNzPSJjcmV3Z3JpZCI+CiAgICAgIDxkaXYgY2xhc3M9ImNyZXciPjxkaXYgY2xhc3M9InJvbGUiPkFyY2hpdGVjdCAmYW1wOyBCdWlsZGVyPC9kaXY+PGRpdiBjbGFzcz0id2hvIj5KZXNzZSBDbGVtaXQ8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJibHVyYiI+VmlzaW9uLCBkZXNpZ24sIGFuZCBldmVyeSBmZWF0dXJlLiBUYWxrZWQgdGhlIHdob2xlIHRoaW5nIGludG8gZXhpc3RlbmNlIG9uZSBidXR0b24gYXQgYSB0aW1lICZtZGFzaDsgYW5kIGRlY2lkZWQgdGhlIGZhbWlseSBkZXNlcnZlZCBpdHMgb3duIHByaXZhdGUgY29ybmVyIG9mIHRoZSBpbnRlcm5ldC48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY3JldyI+PGRpdiBjbGFzcz0icm9sZSI+UXVlZW4gJmFtcDsgRmlyc3QgVXNlcjwvZGl2PjxkaXYgY2xhc3M9IndobyI+SmFlbWllIENsZW1pdDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImJsdXJiIj5UaGUgZmlyc3QgdG8gdXNlIGl0IGFuZCB0aGUgZmlyc3QgdG8gcmVhY3QgJm1kYXNoOyB0aGUgYWRvcHRpb24gdGVzdCBldmVyeSBmZWF0dXJlIGhhcyB0byBwYXNzLiBDby1vd25lciBvZiB0aGUgaG91c2Vob2xkIGFuZCB0aGUgcmVhc29uICJkb2VzIHRoaXMgZGVsaWdodCB0aGUgZmFtaWx5PyIgaXMgdGhlIHJlYWwgc3BlYy48L2Rpdj48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iam9pbnVzIj5IZWxwZWQgbWFrZSB0aGlzIHJlYWw/IFlvdSBiZWxvbmcgb24gdGhpcyBsaXN0ICZtZGFzaDsgdGVsbCBKZXNzZSB0byBhZGQgeW91IGluIHRoZSBuZXh0IHB1Ymxpc2guPC9kaXY+CiAgPC9kaXY+CgogIDxkaXYgY2xhc3M9Imgycm93Ij48aDI+JiMxMjgyMjE7IFB1Ymxpc2ggTG9nICZhbXA7IFBNb1A8L2gyPgogICAgPHAgY2xhc3M9Imgyc3ViIj5BIFBvc3QtTW9ydGVtIG9uIFB1Ymxpc2guIEV2ZXJ5IHRpbWUgd2Ugc2hpcCBhIGNoYW5nZSB0byB0aGlzIHBhZ2UsIHdlIHJ1biB0aGUgcml0dWFsIGJlbG93IGFuZCBsb2cgaXQgaGVyZSAmbWRhc2g7IHdobyBjaGFuZ2VkIHdoYXQsIHdoZW4uPC9wPgogIDwvZGl2PgogIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgIDxkaXYgY2xhc3M9InBtb3Atc3RlcHMiPgogICAgICA8c3Bhbj4xICZtaWRkb3Q7IEJhY2sgdXAgbmVjZXNzYXJ5IGZpbGVzPC9zcGFuPjxzcGFuPjIgJm1pZGRvdDsgQ2xlYW4gdGhlIGRpcmVjdG9yeTwvc3Bhbj48c3Bhbj4zICZtaWRkb3Q7IEFkZCB0aGUgbmV3IGZlYXR1cmVzPC9zcGFuPgogICAgICA8c3Bhbj40ICZtaWRkb3Q7IFVwZGF0ZSB0aGUgdGhhbmsteW91czwvc3Bhbj48c3Bhbj41ICZtaWRkb3Q7IEFkZCB0byB0aGUgcHJvbXB0czwvc3Bhbj48c3Bhbj42ICZtaWRkb3Q7IFVwZGF0ZSB0aGUgcHJvamVjdDwvc3Bhbj4KICAgIDwvZGl2PgogICAgPGRldGFpbHMgY2xhc3M9ImxvZ2VudHJ5Ij4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9Im1ldGEiPnYyPC9zcGFuPlJlc3RydWN0dXJlICZtZGFzaDsgcmVuYW1lZCBpbnZlbnRvcnksIG1vdmVkIHByb21wdHMgdG8gdGhlIGVuZCwgYWRkZWQgQ3JldyAmYW1wOyB0aGlzIGxvZy4gPHNwYW4gY2xhc3M9IndoZW4iPiZtaWRkb3Q7IEp1biAxOSAyMDI2ICZtaWRkb3Q7IEplc3NlICh3aXRoIENsYXVkZSk8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiIHN0eWxlPSJmbG9hdDpyaWdodCI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9ImJvZHkiPjx1bCBjbGFzcz0iY2hrIj48bGk+QmFja2VkIHVwIHRoZSBwcmlvciB2ZXJzaW9uIHRvIDxjb2RlPlJvbGxiYWNrIFZlcnNpb25zXEZvcnVtcy1TdGFydC1IZXJlLnYxPC9jb2RlPi48L2xpPjxsaT5DbGVhbmVkIHRoZSBkaXJlY3RvcnkgJm1kYXNoOyBvbmUgY2Fub25pY2FsIGRvYywgcHJpb3IgdmVyc2lvbiBhcmNoaXZlZC48L2xpPjxsaT5BZGRlZCBmZWF0dXJlczogcmVuYW1lZCB0aGUgaW52ZW50b3J5IHRvICZsZHF1bztIb3cgZGlkIEplc3NlIGRvIHRoaXM/IENvcHkgaXQgaGVyZS4mcmRxdW87IGFuZCBpbmRlbnRlZCBpdDsgbW92ZWQgYWxsIGJ1aWxkIHByb21wdHMgdG8gdGhlIHZlcnkgZW5kLjwvbGk+PGxpPlVwZGF0ZWQgdGhlIHRoYW5rLXlvdXMgJm1kYXNoOyBhZGRlZCBUaGUgQ3JldyAoSmVzc2UgJmFtcDsgSmFlbWllKS48L2xpPjxsaT5VcGRhdGVkIHRoZSBwcm9tcHRzICZtZGFzaDsgYWxsIDQ3IGJ1aWxkIHByb21wdHMgY29sbGVjdGVkIGludG8gb25lIGxpYnJhcnkgYXQgdGhlIGJvdHRvbS48L2xpPjxsaT5VcGRhdGVkIHRoZSBwcm9qZWN0ICZtZGFzaDsgYWRkZWQgdGhpcyBQdWJsaXNoIExvZyAmYW1wOyBQTW9QIHNvIGV2ZXJ5IGZ1dHVyZSBwdWJsaXNoIGlzIHJlY29yZGVkLjwvbGk+PC91bD48L2Rpdj4KICAgIDwvZGV0YWlscz4KICAgIDxkZXRhaWxzIGNsYXNzPSJsb2dlbnRyeSI+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJtZXRhIj52MTwvc3Bhbj5Jbml0aWFsIGJ1aWxkICZtZGFzaDsgcG9zdC1tb3J0ZW0sIGNvbW1hbmRzLCA0Ny1mZWF0dXJlIHJlY2lwZS4gPHNwYW4gY2xhc3M9IndoZW4iPiZtaWRkb3Q7IEp1biAxOSAyMDI2ICZtaWRkb3Q7IEplc3NlICh3aXRoIENsYXVkZSk8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiIHN0eWxlPSJmbG9hdDpyaWdodCI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9ImJvZHkiPjx1bCBjbGFzcz0iY2hrIj48bGk+QmFja2VkIHVwOiBuL2EgKGZpcnN0IGJ1aWxkKS48L2xpPjxsaT5DbGVhbiBkaXJlY3Rvcnk6IGNyZWF0ZWQgdGhlIHNpbmdsZSBjYW5vbmljYWwgPGNvZGU+Rm9ydW1zLVN0YXJ0LUhlcmUuaHRtbDwvY29kZT4uPC9saT48bGk+QWRkZWQgZmVhdHVyZXM6IHBvc3QtbW9ydGVtLCBmdWxsIGNvbW1hbmQvcmVjaXBlIHNldCwgNDctZmVhdHVyZSBpbnZlbnRvcnkuPC9saT48bGk+VGhhbmsteW91czogbi9hIChhZGRlZCBpbiB2MikuPC9saT48bGk+UHJvbXB0czogYSBjb3B5LXJlYWR5IEFJIHByb21wdCB3cml0dGVuIGZvciBlYWNoIG9mIHRoZSA0NyBmZWF0dXJlcy48L2xpPjxsaT5Qcm9qZWN0OiBjaGVja2JveCBwcm9ncmVzcyB0cmFja2luZyArIHNlYXJjaCBzaGlwcGVkLjwvbGk+PC91bD48L2Rpdj4KICAgIDwvZGV0YWlscz4KICA8L2Rpdj4KCiAgPGRpdiBjbGFzcz0iaDJyb3ciPjxoMj4mIzEyOTUyMDsgVGhlIEJ1aWxkIFByb21wdHMgJm1kYXNoOyBwYXN0ZSB0aGVzZSBpbnRvIGFueSBBSTwvaDI+CiAgICA8cCBjbGFzcz0iaDJzdWIiPk9uZSByZWFkeS1tYWRlIGluc3RydWN0aW9uIHBlciBmZWF0dXJlLiBDb3B5IHRoZSBvbmUgeW91IHdhbnQsIHBhc3RlIGl0IGludG8geW91ciBBSSwgYW5kIGxldCBpdCB3cml0ZSB0aGF0IHBpZWNlIGZvciB5b3UuIFRoaXMgaXMgdGhlIHdob2xlIHJlY2lwZSwgaW4gb3JkZXIuPC9wPgogIDwvZGl2PgogIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgIDxkZXRhaWxzIG9wZW4+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJzZWN0LXRpdGxlIj4mIzEyNzk1OTsmIzY1MDM5OyBGb3VuZGF0aW9uICZhbXA7IEluZnJhc3RydWN0dXJlPC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5NTk7JiM2NTAzOTsgRm91bmRhdGlvbiAmYW1wOyBJbmZyYXN0cnVjdHVyZTwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+U2luZ2xlLVdvcmtlciBhcHA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QnVpbGQgYSBzaW5nbGUgQ2xvdWRmbGFyZSBXb3JrZXIgKG9uZSBzcmMvaW5kZXguanMgZmlsZSkgdGhhdCBzZXJ2ZXMgYSBjb21wbGV0ZSBzaW5nbGUtcGFnZSB3ZWIgYXBwIGFzIG9uZSBIVE1MIHRlbXBsYXRlIHN0cmluZywgcGx1cyBhIHNtYWxsIEpTT04gQVBJIHVuZGVyIC9hcGkvKiB1c2luZyBmZXRjaCByb3V0aW5nLiBObyBmcmFtZXdvcmssIG5vIGJ1aWxkIHN0ZXAuIEl0IHNob3VsZCByZWFkIHRoZSBsb2dnZWQtaW4gdXNlcidzIGVtYWlsIGZyb20gdGhlIENmLUFjY2Vzcy1BdXRoZW50aWNhdGVkLVVzZXItRW1haWwgcmVxdWVzdCBoZWFkZXIuIEluY2x1ZGUgYSB3cmFuZ2xlci5qc29uYyB3aXRoIHRoZSB3b3JrZXIgbmFtZSBhbmQgYSBjdXN0b21fZG9tYWluIHJvdXRlLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk1OTsmIzY1MDM5OyBGb3VuZGF0aW9uICZhbXA7IEluZnJhc3RydWN0dXJlPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5DbG91ZGZsYXJlIEFjY2VzcyBlbWFpbCBnYXRlPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPldhbGsgbWUgdGhyb3VnaCBwdXR0aW5nIENsb3VkZmxhcmUgQWNjZXNzIChaZXJvIFRydXN0KSBpbiBmcm9udCBvZiBteSBXb3JrZXIncyBjdXN0b20gZG9tYWluIHNvIG9ubHkgYW4gYWxsb3ctbGlzdCBvZiBmYW1pbHkgZW1haWwgYWRkcmVzc2VzIGNhbiByZWFjaCBpdCwgdXNpbmcgb25lLXRpbWUgZW1haWwgY29kZXMgaW5zdGVhZCBvZiBwYXNzd29yZHMuIFRoZW4gc2hvdyBtZSBob3cgbXkgV29ya2VyIHJlYWRzIHRoZSBhdXRoZW50aWNhdGVkIGVtYWlsIGZyb20gdGhlIENmLUFjY2Vzcy1BdXRoZW50aWNhdGVkLVVzZXItRW1haWwgaGVhZGVyIHRvIGlkZW50aWZ5IHRoZSB1c2VyLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk1OTsmIzY1MDM5OyBGb3VuZGF0aW9uICZhbXA7IEluZnJhc3RydWN0dXJlPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5EMSBkYXRhYmFzZTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5TZXQgdXAgYSBDbG91ZGZsYXJlIEQxIGRhdGFiYXNlIGJvdW5kIGFzIERCIGluIG15IFdvcmtlci4gR2l2ZSBtZSB0aGUgQ1JFQVRFIFRBQkxFIHN0YXRlbWVudHMgZm9yIHVzZXJzIChlbWFpbCwgbmFtZSwgcm9sZSwgYXZhdGFyKSwgbWVzc2FnZXMgKGJvYXJkIHBvc3RzIHdpdGggY2F0ZWdvcnkgKyByZXZpZXcgZmxhZyksIGdyb2NlcnksIHJzdnAsIG1lZGlhICh3aXRoIHBlb3BsZS9wbGFjZS9jYXB0aW9uIHRhZ3MpLCBub3RlcywgcmVtaW5kZXJzLCBhbmQgYSBrZXkvdmFsdWUgc2V0dGluZ3MgdGFibGUuIFNob3cgbWUgcGFyYW1ldGVyaXplZCByZWFkL3dyaXRlIGhlbHBlcnMgYW5kIHRoZSB3cmFuZ2xlciBjb21tYW5kcyB0byBjcmVhdGUgdGhlIERCIGFuZCBydW4gdGhlIHNjaGVtYS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5NTk7JiM2NTAzOTsgRm91bmRhdGlvbiAmYW1wOyBJbmZyYXN0cnVjdHVyZTwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UjIgb2JqZWN0IHN0b3JhZ2U8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QWRkIHRocmVlIENsb3VkZmxhcmUgUjIgYnVja2V0cyB0byBteSBXb3JrZXIgKG1vdmllcywgbXVzaWMsIHBpY3R1cmVzKSBib3VuZCBhcyBNT1YsIE1VU0lDLCBQSUNTLiBTaG93IG1lIGEgc3RyZWFtaW5nIHJvdXRlIGxpa2UgL211c2ljLyZsdDtrZXkmZ3Q7IHRoYXQgcHVsbHMgdGhlIG9iamVjdCBmcm9tIFIyIGFuZCBzdHJlYW1zIGl0IGJhY2sgYmVoaW5kIG15IGF1dGggZ2F0ZSwgd2l0aCBjb3JyZWN0IGNvbnRlbnQtdHlwZSBhbmQgcmFuZ2UtcmVxdWVzdCBzdXBwb3J0IHNvIGF1ZGlvL3ZpZGVvIGNhbiBzZWVrLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk1OTsmIzY1MDM5OyBGb3VuZGF0aW9uICZhbXA7IEluZnJhc3RydWN0dXJlPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5Dcm9uIC8gc2NoZWR1bGVkIGhhbmRsZXI8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QWRkIGEgc2NoZWR1bGVkKCkgaGFuZGxlciB0byBteSBXb3JrZXIgd2l0aCBhIGNyb24gdHJpZ2dlciBvZiAqLzUgKiAqICogKiAoZXZlcnkgNSBtaW51dGVzKS4gT24gZWFjaCB3YWtlIGl0IHNob3VsZCBxdWVyeSB0aGUgcmVtaW5kZXJzIHRhYmxlIGZvciBhbnl0aGluZyBkdWUgYW5kIHNlbmQgaXQgb3V0LCB0aGVuIG1hcmsgaXQgc2VudC4gU2hvdyB0aGUgd3JhbmdsZXIuanNvbmMgdHJpZ2dlcnMgYmxvY2sgYW5kIHRoZSBoYW5kbGVyLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk1OTsmIzY1MDM5OyBGb3VuZGF0aW9uICZhbXA7IEluZnJhc3RydWN0dXJlPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5naXQgcHVzaCA9IGRlcGxveTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5Db25uZWN0IG15IEdpdEh1YiByZXBvIHRvIENsb3VkZmxhcmUgV29ya2VycyBCdWlsZHMgc28gdGhhdCBldmVyeSBwdXNoIHRvIHRoZSBtYWluIGJyYW5jaCBhdXRvbWF0aWNhbGx5IGJ1aWxkcyBhbmQgZGVwbG95cyBteSBXb3JrZXIuIEV4cGxhaW4gdGhlIHNhZmUgd29ya2Zsb3c6IHN0YWdlIGNoYW5nZXMgb24gYSBzaWRlIGJyYW5jaCwgb3BlbiBhIHB1bGwgcmVxdWVzdCwgcnVuIGEgc3ludGF4IGNoZWNrLCBhbmQgb25seSBtZXJnZSB0byBtYWluIHdoZW4gSSBhcHByb3ZlICZtZGFzaDsgc28gbm90aGluZyBnb2VzIGxpdmUgYnkgYWNjaWRlbnQuPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI3OTU5OyYjNjUwMzk7IEZvdW5kYXRpb24gJmFtcDsgSW5mcmFzdHJ1Y3R1cmU8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPiJEbyBpdCBvbmNlIiBwZXJzaXN0ZW5jZTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5HaXZlIG1lIGEgcmV1c2FibGUgcGVyc2lzdGVuY2UgcGF0dGVybjogYW55IHVzZXIgc2VsZWN0aW9uIChhIHF1ZXVlLCBhIHNsaWRlciwgYSBmaWx0ZXIsIGEgdGhlbWUpIHdyaXRlcyBpbW1lZGlhdGVseSB0byBhIHNldHRpbmdzIGtleSBpbiBEMSB2aWEgYSB0aW55IGVuZHBvaW50LCBhbmQgdGhlIGNsaWVudCByZXN0b3JlcyBpdCBvbiBsb2FkLiBUaGUgc2VydmVyIG93bnMgdGhlIGZhY3Q7IHRoZSBjbGllbnQganVzdCByZWZsZWN0cyBpdC4gU2hvdyBvbmUgaGVscGVyIHRoYXQgcmVhZHMgYSBzZXR0aW5ncyBrZXkgYW5kIG9uZSBlbmRwb2ludCB0aGF0IHdyaXRlcyBpdCwgYW5kIGV4cGxhaW4gaG93IHRvIHJldXNlIHRoaXMgZm9yIGV2ZXJ5IHN0YXRlZnVsIGNvbnRyb2wgaW5zdGVhZCBvZiByZWJ1aWxkaW5nIGl0IGVhY2ggdGltZS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5NTk7JiM2NTAzOTsgRm91bmRhdGlvbiAmYW1wOyBJbmZyYXN0cnVjdHVyZTwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+U2hhcmVkIGRhdGFUYWJsZSBjb21wb25lbnQ8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+V3JpdGUgb25lIHJldXNhYmxlIEpTIGZ1bmN0aW9uIGRhdGFUYWJsZShpZCwgY29sdW1ucywgcm93cywgb3B0aW9ucykgdGhhdCByZW5kZXJzIGEgc29ydGFibGUsIGdyb3VwYWJsZSBIVE1MIHRhYmxlIHdpdGggdG9vbHRpcHMgYW5kIGEgY2xlYW4gc3R5bGUuIEV2ZXJ5IGxpc3Qgb24gbXkgc2l0ZSAobWVtYmVycywgZ3JvY2VyeSwgYXVkaXQgbG9nKSBzaG91bGQgY2FsbCB0aGlzIHNhbWUgZnVuY3Rpb24gc28gaW1wcm92aW5nIGl0IG9uY2UgaW1wcm92ZXMgdGhlbSBhbGwuIE5vIGNvcHktcGFzdGVkIHRhYmxlIG1hcmt1cCBhbnl3aGVyZS48L2Rpdj48L2Rpdj4KICAgIDwvZGV0YWlscz4KICAgIDxkZXRhaWxzPgogICAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0ic2VjdC10aXRsZSI+JiMxMjc5Njg7IEhvbWUsIEhlcm8gJmFtcDsgU3BlZWQ8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk2ODsgSG9tZSwgSGVybyAmYW1wOyBTcGVlZDwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+SGVybyBiYW5uZXIgKHNraW5zICsgcmFuZG9tIGV2ZW50cyk8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QnVpbGQgYSBoZXJvIGJhbm5lciBmb3IgbXkgaG9tZSBwYWdlIHRoYXQgc2hvd3MgYSBkaWZmZXJlbnQgbG9vayBvbiBlYWNoIHZpc2l0OiBzZXZlcmFsIHZpc3VhbCAic2tpbnMiIHBsdXMgYSBoYW5kZnVsIG9mIHJhbmRvbSBzdXJwcmlzZSBldmVudHMgKGEgc2hvb3Rpbmcgc3RhciwgYSBmbHlieSwgZXRjLikuIExldCBhbiBhZG1pbiBwaWNrIG9yIGxvY2sgYSBza2luIGluIFNldHRpbmdzLCBwZXJzaXN0ZWQgc2VydmVyLXNpZGUuIERhcmssIG5lb24sIGN5YmVycHVuay9UUk9OIGFlc3RoZXRpYy48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5Njg7IEhvbWUsIEhlcm8gJmFtcDsgU3BlZWQ8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPiJMZXQncyBHbyEhIiBsb2FkIGNvbnRyYWN0PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPk1ha2UgbXkgaG9tZSBwYWdlIHBhaW50IGEgIkxldCdzIEdvISEiIGJ1dHRvbiBhcyB0aGUgdmVyeSBsYXN0IHRoaW5nLCBhbmQgdHJlYXQgaXRzIGFwcGVhcmFuY2UgYXMgdGhlIHNpZ25hbCB0aGF0IHRoZSBwYWdlIGlzIHJlYWR5ICZtZGFzaDsgdGFyZ2V0IHVuZGVyIDIgc2Vjb25kcyBldmVyeSBsb2FkLiBBbnl0aGluZyB0aGF0IHRha2VzIGxvbmdlciB0aGFuIGhhbGYgYSBzZWNvbmQgbXVzdCBub3QgYmxvY2sgZmlyc3QgcGFpbnQ6IGRlZmVyIGl0IHVudGlsIGFmdGVyIHRoZSBidXR0b24gc2hvd3MuIFNob3cgbWUgaG93IHRvIHNoaXAgYSB0aW55IHNoZWxsIHBheWxvYWQgaW5zdGFudGx5IGFuZCBsYXp5LWxvYWQgaGVhdnkgZGF0YSBvbmx5IHdoZW4gYSB0YWIgaXMgb3BlbmVkLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk2ODsgSG9tZSwgSGVybyAmYW1wOyBTcGVlZDwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+RGVmZXJyZWQtbG9hZCBzdGF0dXMgYmFyPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFmdGVyIG15IGhvbWUgcGFnZSdzIHJlYWR5IHNpZ25hbCBhcHBlYXJzLCBzaG93IGEgc21hbGwgc3RhdHVzIGJhciB0aGF0IHJlcG9ydHMgdGhlIGJhY2tncm91bmQgbG9hZDogd2hpY2ggZmlsZSBpcyBsb2FkaW5nIG5vdywgZWxhcHNlZCB0aW1lLCBlc3RpbWF0ZWQgdGltZSByZW1haW5pbmcsIGFuZCB0b3RhbCB0aW1lIHVudGlsIGV2ZXJ5dGhpbmcgaXMgaW4uIE1ha2Ugc2xvdyBwaWVjZXMgdmlzaWJsZSBhbmQgYWNjb3VudGFibGUgaW5zdGVhZCBvZiBhIHNpbGVudCBoYW5nLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk2ODsgSG9tZSwgSGVybyAmYW1wOyBTcGVlZDwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UmVzcG9uc2l2ZSBzdGlja3kgcGxheWVyPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPldoZW4gdGhlIHVzZXIgc2Nyb2xscywgc2hyaW5rIG15IGhlcm8gYW5kIGxpZnQgYW55IGN1cnJlbnRseS1wbGF5aW5nIHNvbmcgaW50byBhIHNsaW0gcGlubmVkIHRvcCBiYXIgd2l0aCBwbGF5L3BhdXNlIGFuZCB0aGUgcm90YXRpbmcgcXVvdGUgb24gdGhlIHJpZ2h0LiBJdCBzaG91bGQgc3RheSBwdXQgYW5kIGtlZXAgcGxheWluZyBhcyB0aGV5IG1vdmUgYmV0d2VlbiB0YWJzLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzk2ODsgSG9tZSwgSGVybyAmYW1wOyBTcGVlZDwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+Ik5ldmVyIGVhdCB5b3VyIHdvcmsiIGd1YXJkPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPk15IGF1dG8tcmVmcmVzaCB0aW1lciBrZWVwcyB3aXBpbmcgdGV4dCBwZW9wbGUgYXJlIHR5cGluZy4gR2l2ZSBtZSBhIHNhZmVSZWZyZXNoKCkgd3JhcHBlciB0aGF0IHNraXBzIHRoZSByZWZyZXNoIGVudGlyZWx5IGlmIGFueSBpbnB1dC90ZXh0YXJlYSBpcyBmb2N1c2VkICh1c2VyQnVzeSkgb3IgaG9sZHMgdW5zYXZlZCB0ZXh0IChoYXNEcmFmdCksIGFuZCBvbmx5IHJlLXJlbmRlcnMgd2hlbiB0aGUgdXNlciBpcyBpZGxlIHdpdGggbm90aGluZyBkcmFmdGVkLiBQb3N0aW5nL2VkaXRpbmcgc2hvdWxkIHJlLXJlbmRlciBvbmx5IG9uIHRoZSB1c2VyJ3Mgb3duIHN1Ym1pdCwgbmV2ZXIgb24gYSB0aW1lci48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5Njg7IEhvbWUsIEhlcm8gJmFtcDsgU3BlZWQ8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPk5vLXN0b3JlIGNhY2hlIGhlYWRlcjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5TZXQgYSBDYWNoZS1Db250cm9sOiBuby1zdG9yZSBoZWFkZXIgb24gbXkgV29ya2VyJ3MgSFRNTCByZXNwb25zZSBzbyBhIG5vcm1hbCBicm93c2VyIHJlZnJlc2ggYWx3YXlzIGdldHMgdGhlIGxhdGVzdCBkZXBsb3llZCB2ZXJzaW9uLCB3aXRoIG5vIHN0YWxlLWNhY2hlIGNvbmZ1c2lvbiBhZnRlciBJIHNoaXAgYSBjaGFuZ2UuPC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgICA8ZGV0YWlscz4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjMTI4MjE4OyBMaWJyYXJ5ICZhbXA7IE1lZGlhPC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjgyMTg7IExpYnJhcnkgJmFtcDsgTWVkaWE8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPk1vdmllIGNhdGFsb2c8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QnVpbGQgYSBtb3ZpZSBjYXRhbG9nIHRhYiBvZiBwb3N0ZXIgY2FyZHMuIEVhY2ggY2FyZCBzaG93cyBjb2xsZWN0aW9uLCBydW50aW1lLCBhIHN0YXIgdGllciwgYSBkZXNjcmlwdGlvbiwgYW5kIGxhc3Qtd2F0Y2hlZCBkYXRlICsgd2hvIHdhdGNoZWQgaXQuIERhdGEgbGl2ZXMgaW4gRDEuIEdyb3VwIGZpbG1zIGluIGEgc2VyaWVzIChlLmcuIEhhcnJ5IFBvdHRlcikgdG9nZXRoZXIgd2l0aCAiUXVldWUgdGhlIHNlcmllcyIgYW5kICJRdWV1ZSBuZXh0IGVwaXNvZGUiIGJ1dHRvbnMsIGFuZCBrZWVwIGEgcGVyLXNlc3Npb24gIlVwIE5leHQiIHF1ZXVlIHRoYXQgcGVyc2lzdHMuPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjE4OyBMaWJyYXJ5ICZhbXA7IE1lZGlhPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5Db3ZlcmZsb3cgYnJvd3NlcjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhIHJldXNhYmxlICJjb3ZlcmZsb3ciIGNvbXBvbmVudDogYSBob3Jpem9udGFsIDNEIHJlZWwgb2YgY292ZXItYXJ0IGNhcmRzIEkgY2FuIGZsaXAgdGhyb3VnaCwgd2l0aCB0aGUgY2VudGVyZWQgaXRlbSBlbmxhcmdlZC4gVXNlIGl0IGZvciBib3RoIHRoZSBzb25nIGxpYnJhcnkgKHB1bGxlZCBmcm9tIG15IFIyIG11c2ljIGJ1Y2tldCkgYW5kIHRoZSBtb3ZpZSBjYXRhbG9nLiBPbmUgZnVuY3Rpb24gcG93ZXJzIGJvdGguPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjE4OyBMaWJyYXJ5ICZhbXA7IE1lZGlhPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5NZWRpYSB0YWdnaW5nICsgZmlsdGVyPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkxldCBtZSBhZGQgbWVkaWEgKHNvbmcvcGhvdG8vdmlkZW8vYm9vaykgd2l0aCB0YWdzIGZvciBwZW9wbGUsIHBsYWNlLCBhbmQgYSBjYXB0aW9uLCBzdG9yZWQgaW4gRDEuIEFkZCBhIHNpbmdsZSBmaWx0ZXIgYm94IHRoYXQgbGl2ZS1maWx0ZXJzIHRoZSBnYWxsZXJ5IGJ5IHBlcnNvbiwgcGxhY2UsIGNhcHRpb24sIG9yIHRpdGxlIGFzIEkgdHlwZS4gT25lIHRhZ2dlZCBwaG90byBzaG91bGQgYmUgYWJsZSB0byBzdXJmYWNlIGFjcm9zcyBtdWx0aXBsZSBmZWF0dXJlcyAoc2NyYXBib29rLCBib2FyZCwgaXRpbmVyYXJ5KS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjgyMTg7IExpYnJhcnkgJmFtcDsgTWVkaWE8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPlJvdGF0aW9uIGVuZ2luZTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhIHJvdGF0aW9uIGVuZ2luZSB0aGF0IGFzc2VtYmxlcyBhICJob3Qgc2hlbGYiIG9mIHRpdGxlcyBmcm9tIHRoZSBmdWxsIGNhdGFsb2cgdXNpbmcgYWRtaW4tc2V0IHdlaWdodHMsIGEgc2l6ZSBjYXAsIGxhc3Qtd2F0Y2hlZCByZWNlbmN5LCBhbmQgc2VyaWVzIHJ1bGVzIChwbGF5IG9uZSBIYXJyeSBQb3R0ZXIgaW4gb3JkZXIgdW50aWwgaXQncyB3YXRjaGVkKS4gQWRtaW4gd2VpZ2h0cyBhbmQgY2FwIHBlcnNpc3QgaW4gRDEuIEV4cG9zZSAiUXVldWUgdGhlIHNlcmllcyIgYW5kICJRdWV1ZSBOIGZvciB0b21vcnJvdy4iPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjE4OyBMaWJyYXJ5ICZhbXA7IE1lZGlhPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5Nb3ZlciBhZ2VudDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5Xcml0ZSBhIHNtYWxsIGFnZW50IHRoYXQgcnVucyBvbiBteSBQQyBhbmQgd2F0Y2hlcyBhIHJlcXVlc3QgcXVldWU6IHdoZW4gYSBtb3ZpZSBpcyByZXF1ZXN0ZWQsIGl0IGZmbXBlZy1jb252ZXJ0cyBhdmkvbWt2IHRvIG1wNCwgcmNsb25lLXVwbG9hZHMgaXQgdG8gbXkgUjIgYnVja2V0LCBtYXJrcyBpdCByZWFkeSwgdXBkYXRlcyBhIHN0b3JhZ2UgbWV0ZXIsIGFuZCBrZWVwcyB0aGUgaG90IHNoZWxmIGZ1bGwgdG8gYSBjYXAgYnkgZXZpY3RpbmcgdGhlIGxlYXN0LXdhdGNoZWQgdGl0bGVzIChsb2NrZWQgZmF2b3JpdGVzIHN0YXkpLiBUaGlzIGxldHMgYWxsIG15IG1lZGlhIGJlICJhdmFpbGFibGUiIHdpdGhvdXQgc3RvcmluZyBpdCBhbGwgYXQgb25jZS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjgyMTg7IExpYnJhcnkgJmFtcDsgTWVkaWE8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPkRlc3Ryb3kgLyBudWtlIHdpdGggcmVhc29uPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhIHR5cGUtdG8tY29uZmlybSBwZXJtYW5lbnQgZGVsZXRlICgibnVrZSIpIGZvciBtb3ZpZXMsIG1lZGlhLCBxdW90ZXMsIGFuZCBxdWV1ZWQgc29uZ3MuIEl0IG11c3QgYXNrIHdoeSBpdCdzIGJlaW5nIGRlbGV0ZWQgKFJDQSkgYW5kIGxvZyB0aGUgcmVhc29uIGFkbWluLW9ubHksIGxlYXZpbmcgYSBwZXJtYW5lbnQgcmVjb3JkIG9mIHdoYXQgd2FzIGRlc3Ryb3llZC4gTmV2ZXIgYnVsay1kZWxldGUgc3RvcmFnZSBvYmplY3RzLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODIxODsgTGlicmFyeSAmYW1wOyBNZWRpYTwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+TGl2ZSBzdG9yYWdlIG1ldGVyPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhIGxpdmUgc3RvcmFnZSBtZXRlciAoInBvZCIpIHRvIG15IGhvbWUgcGFnZSB0aGF0IHNob3dzIGN1cnJlbnQgUjIgdXNhZ2UgdmVyc3VzIHRoZSBjYXAsIHVwZGF0ZWQgZnJvbSBhIHNtYWxsIG1hbmlmZXN0IHRoZSBNb3ZlciBtYWludGFpbnMgcmF0aGVyIHRoYW4gc2Nhbm5pbmcgdGhlIHdob2xlIGJ1Y2tldCBvbiBldmVyeSBsb2FkLjwvZGl2PjwvZGl2PgogICAgPC9kZXRhaWxzPgogICAgPGRldGFpbHM+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJzZWN0LXRpdGxlIj4mIzEyODI2NjsgRm9ydW1zLCBOb3RlcyAmYW1wOyBNZXNzYWdpbmc8L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODI2NjsgRm9ydW1zLCBOb3RlcyAmYW1wOyBNZXNzYWdpbmc8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPkZvcnVtcyB3aXRoIGNhdGVnb3JpZXM8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QnVpbGQgYSBmb3J1bXMgdGFiOiBhIGdyaWQgb2YgY2F0ZWdvcnkgY2FyZHMgKGVhY2ggd2l0aCBhbiBpY29uLCBuYW1lLCBhbmQgYmx1cmIpIHRoYXQgb3BlbiBpbnRvIGEgbWVzc2FnZSBib2FyZCBmb3IgdGhhdCBjYXRlZ29yeS4gUG9zdHMgc3RvcmUgaW4gYSBEMSBtZXNzYWdlcyB0YWJsZSB3aXRoIGEgY2F0ZWdvcnkgY29sdW1uLiBJbmNsdWRlIGEgIlJlYWQgSGVyZSBGaXJzdCIgY2F0ZWdvcnkgZm9yIGdyb3VuZCBydWxlcy4gRHJhZnRzIGluIHRoZSBwb3N0IGJveCBwZXJzaXN0IGxvY2FsbHkgc28gYSByZWZyZXNoIG5ldmVyIGxvc2VzIHRoZW0uPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjY2OyBGb3J1bXMsIE5vdGVzICZhbXA7IE1lc3NhZ2luZzwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UHJpdmF0ZSByb29tczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5BZGQgcHJpdmF0ZSBmb3J1bSByb29tcyB0aGF0IG9ubHkgc2hvdyBmb3Igc3BlY2lmaWMgbWVtYmVycyAoZS5nLiBhIEhvdXNlaG9sZCBib2FyZCBmb3IgdHdvIHBlb3BsZSBhbmQgYW55b25lIHRoZXkgYm90aCBpbnZpdGUsIHBsdXMgYW4gYXJjaGl2ZWQgIkhvdXNla2VlcGluZyIgcm9vbSkuIFZpc2liaWxpdHkgaXMgZW5mb3JjZWQgc2VydmVyLXNpZGUgZnJvbSBhbiBhbGxvdy1saXN0LCBub3QganVzdCBoaWRkZW4gaW4gdGhlIFVJLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODI2NjsgRm9ydW1zLCBOb3RlcyAmYW1wOyBNZXNzYWdpbmc8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPlBlci1jYXRlZ29yeSBwZXJtaXNzaW9uczwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5HaXZlIGFkbWlucyBhIHBlcm1pc3Npb25zIHBhbmVsIHRvIGdyYW50IG9yIHJldm9rZSwgcGVyIG1lbWJlciwgd2hvIGNhbiBzZWUgYW5kIHBvc3QgaW4gZWFjaCBmb3J1bSBjYXRlZ29yeS4gU3RvcmUgZ3JhbnRzIGluIEQxIGFuZCBlbmZvcmNlIHRoZW0gb24gYm90aCByZWFkIGFuZCB3cml0ZSBpbiB0aGUgQVBJLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODI2NjsgRm9ydW1zLCBOb3RlcyAmYW1wOyBNZXNzYWdpbmc8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPkZsYWdnaW5nICsgcHJvZmFuaXR5IHNjYW48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+TGV0IGFueSBtZW1iZXIgZmxhZyBhIHBvc3QgZm9yIHJldmlldywgYW5kIHJ1biBhIHByb2Zhbml0eSBzY2FuIG9uIG5ldyBwb3N0cyB0aGF0IHJvdXRlcyBmbGFnZ2VkIG9uZXMgdG8gYSBtb2RlcmF0b3JzLW9ubHkgIk5lZWRzIHJldmlldyIgY2FyZC4gU3RvcmUgYSBmbGFnX3JldmlldyBjb2x1bW4gb24gdGhlIG1lc3NhZ2VzIHRhYmxlLiBNb2RlcmF0b3JzIGNhbiBjbGVhciBvciByZW1vdmUgZmxhZ2dlZCBwb3N0czsgdGhlIGJvYXJkIGlzIGFwcGVuZC1vbmx5IGFuZCBuZXZlciB0cnVuY2F0ZWQuPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjY2OyBGb3J1bXMsIE5vdGVzICZhbXA7IE1lc3NhZ2luZzwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UGVyc29uYWwgTm90ZXMgKHByaXZhdGUpPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkJ1aWxkIGEgcHJpdmF0ZSBQZXJzb25hbCBOb3RlcyBwYW5lbDogbm90ZXMgYXJlIHByaXZhdGUgdG8gZWFjaCB1c2VyIGJ5IGRlZmF1bHQsIHN0b3JlZCBpbiBEMS4gTGV0IG1lIHNoYXJlIGFueSBzaW5nbGUgbm90ZSB3aXRoIG9uZSBzcGVjaWZpYyBwZXJzb24gZm9yIGEgc2V0IGR1cmF0aW9uICZtZGFzaDsgaXQgYXV0by1leHBpcmVzIGFuZCBkaXNhcHBlYXJzIGZvciB0aGVtIHdoZW4gdGhlIHRpbWVyIHJ1bnMgb3V0LiBBZGQgbm90ZSB0eXBlczogUHJpdmF0ZSwgVG8tdGhlLUFkbWluLCBJbXBvcnRhbnQsIGFuZCBSZW1pbmQtTWUuPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI4MjY2OyBGb3J1bXMsIE5vdGVzICZhbXA7IE1lc3NhZ2luZzwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UmVtaW5kZXJzIChlbWFpbCArIFNNUyk8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+VHVybiBhICJSZW1pbmQgTWUhIiBub3RlIGludG8gYSByZWFsIHJlbWluZGVyOiBzdG9yZSBhIGR1ZSB0aW1lIGluIEQxLCBhbmQgaGF2ZSBteSBXb3JrZXIncyA1LW1pbnV0ZSBjcm9uIGhhbmRsZXIgc2VuZCBhbnl0aGluZyBkdWUgdmlhIGVtYWlsIChTZW5kR3JpZCkgYW5kIFNNUyAoVHdpbGlvKSwgdGhlbiBtYXJrIGl0IHNlbnQuIFNob3cgbWUgd2hlcmUgdG8gcHV0IHRoZSBBUEkga2V5cyBhcyBXb3JrZXIgc2VjcmV0cy48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjgyNjY7IEZvcnVtcywgTm90ZXMgJmFtcDsgTWVzc2FnaW5nPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5BZG1pbiBvdmVycmlkZSB2aWV3PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhIGNsZWFybHktbGFiZWxlZCBhZG1pbiAoIktpbmciKSByZWFkLW9ubHkgb3ZlcnJpZGUgdGhhdCBjYW4gdmlldyBtZW1iZXJzJyBwcml2YXRlIG5vdGVzIGZvciBmYW1pbHkgc2FmZXR5LiBJdCBtdXN0IGJlIG9idmlvdXMgaXQncyBhbiBvdmVycmlkZSwgcmVhZC1vbmx5LCBhbmQgaXRzZWxmIGxvZ2dlZCBpbiB0aGUgYXVkaXQgdHJhaWwuIEV4cGxhaW4gdGhlIHRydXN0IHRyYWRlLW9mZiBzbyBJIGNhbiBkZWNpZGUgd2hldGhlciB0byBlbmFibGUgaXQuPC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgICA8ZGV0YWlscz4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjMTI3OTI1OyBNdXNpYyAmYW1wOyB0aGUgREogQm94PC9zcGFuPjxzcGFuIGNsYXNzPSJjaGV2Ij4mIzk2NTQ7PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5MjU7IE11c2ljICZhbXA7IHRoZSBESiBCb3g8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPkRKIEJveCBxdWV1ZTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhIHJpZ2h0LXJhaWwgIkRKIEJveCIgbXVzaWMgcGxheWVyLiBTb25ncyBjb21lIGZyb20gbXkgUjIgbXVzaWMgYnVja2V0LiBUaGUgbGl2ZSBwbGF5IHF1ZXVlIEFORCB0aGUgY3VycmVudCBwb3NpdGlvbiBwZXJzaXN0IHNlcnZlci1zaWRlIGluIEQxIHNvIGEgcmVsb2FkIG9yIGRlcGxveSBuZXZlciBsb3NlcyB0aGUgcXVldWUuIERlbGV0aW5nIHRoZSBub3ctcGxheWluZyBzb25nIGFkdmFuY2VzIHRvIHRoZSBuZXh0IHRyYWNrIGFuZCBrZWVwcyBwbGF5L3BhdXNlIHN0YXRlOyBzdG9wIG9ubHkgd2hlbiB0aGUgcXVldWUgZW1wdGllcy48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc5MjU7IE11c2ljICZhbXA7IHRoZSBESiBCb3g8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPlJhZGlvIGZhbGxiYWNrPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPldoZW4gbXkgbXVzaWMgbGlicmFyeSBpcyBlbXB0eSwgdGhlIERKIEJveCBzaG91bGQgZGVmYXVsdCB0byBhICJSYWRpbyIgbW9kZSBpbnN0ZWFkIG9mIHRocm93aW5nIGEgIm5vIHNvbmdzIiBlcnJvci4gR2F0ZSBHZW5lcmF0ZS9RdWV1ZS1BbGwgYWN0aW9ucyBzbyB0aGV5IGNhbid0IGZpcmUgYWdhaW5zdCBhbiBlbXB0eSBsaWJyYXJ5LjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzkyNTsgTXVzaWMgJmFtcDsgdGhlIERKIEJveDwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UGVyLXBlcnNvbiBjcnVpc2Ugc2tpbjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5NYWtlIG9uZSBtdXNpYyBkYXNoYm9hcmQgdGhhdCBlYWNoIHBlcnNvbiAic2tpbnMiIHRvIHRoZW1zZWx2ZXMgYmFzZWQgb24gd2hvJ3MgbG9nZ2VkIGluOiB0aGVpciBvd24gYnJhbmQvY29sb3JzLCBvcHQtaW4gbm90aWZpY2F0aW9ucywgYW5kIGEgaGlkZGVuIGxpc3Qgb2Ygc29uZ3MgdGhleSBkaXNsaWtlIHNvIHRob3NlIG5ldmVyIHBsYXkgZm9yIHRoZW0uIEFsbCBwcmVmZXJlbmNlcyBwZXJzaXN0IHNlcnZlci1zaWRlIGtleWVkIHRvIHRoZSB1c2VyLjwvZGl2PjwvZGl2PgogICAgPC9kZXRhaWxzPgogICAgPGRldGFpbHM+CiAgICAgIDxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJzZWN0LXRpdGxlIj4mIzEyNzg4MTsgRmFtaWx5IExpZmUgVGFiczwvc3Bhbj48c3BhbiBjbGFzcz0iY2hldiI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI3ODgxOyBGYW1pbHkgTGlmZSBUYWJzPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5TaGFyZWQgZ3JvY2VyeSBsaXN0PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkJ1aWxkIGEgc2hhcmVkIGdyb2NlcnkgbGlzdCBpbiBEMSB0aGF0IGFueW9uZSBpbiB0aGUgZmFtaWx5IGNhbiBhZGQgdG8gYW5kIGNoZWNrIG9mZiBpbiByZWFsIHRpbWUsIHdpdGggd2hvLWFkZGVkIHNob3duLiBBZGQgYW4gYWRtaW4gdG9nZ2xlIHRoYXQgbGV0cyBndWVzdCBhY2NvdW50cyBoZWxwIHNob3Agb3Igbm90LjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzg4MTsgRmFtaWx5IExpZmUgVGFiczwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UmV1bmlvbiBSU1ZQPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkJ1aWxkIGEgcmV1bmlvbi9ldmVudCB0YWIgd2l0aCBkZXRhaWxzIGFuZCBhIHBlci1wZXJzb24gUlNWUCAoeWVzL25vL21heWJlICsgYSBub3RlKSwgc3RvcmVkIGluIEQxLCBzaG93aW5nIGEgbGl2ZSByb3N0ZXIgb2Ygd2hvJ3MgY29taW5nLiBQdWxsIGV2ZW50IHBob3RvcyBmcm9tIG15IHNoYXJlZCBwaWN0dXJlcyBzdG9yZS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiMxMjc4ODE7IEZhbWlseSBMaWZlIFRhYnM8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPk15VHJpdG9uIHRlbGVtZXRyeTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhIHRlbGVtZXRyeSB0YWIgdGhhdCBwdWxscyBsaXZlIHNvbGFyL2JhdHRlcnkgZGF0YSBmcm9tIHRoZSBWaWN0cm9uIFZSTSBBUEkgYW5kIHNob3dzIGl0IGFzIGdhdWdlcyAoc3RhdGUgb2YgY2hhcmdlLCBzb2xhciBpbnB1dCwgbG9hZCkgZm9yIG15IFJWLiBDYWNoZSB0aGUgbGFzdCByZWFkaW5nIHNvIHRoZSBwYWdlIHN0YXlzIGZhc3QuPC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjMTI3ODgxOyBGYW1pbHkgTGlmZSBUYWJzPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5DYW1lcmFzPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhIENhbWVyYXMgdGFiIHRoYXQgZGlzcGxheXMgbXkgUlRTUCBjYW1lcmEgZmVlZHMgYXMgSExTIHN0cmVhbXMgaW4gdGhlIGJyb3dzZXIsIG9ubHkgdmlzaWJsZSB0byBsb2dnZWQtaW4gZmFtaWx5LiBFeHBsYWluIHRoZSBzYWZlc3Qgd2F5IHRvIGV4cG9zZSB0aGUgc3RyZWFtcyB3aXRob3V0IG9wZW5pbmcgbXkgY2FtZXJhcyB0byB0aGUgcHVibGljIGludGVybmV0LjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzg4MTsgRmFtaWx5IExpZmUgVGFiczwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+UXVvdGVzIHdpdGggZmF2b3JpdGVzICsgdmV0dGluZzwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhIFF1b3RlcyB0YWIgZmVlZGluZyBhIHJvdGF0aW5nIGhlcm8gcXVvdGUuIEFueW9uZSBjYW4gaGVhcnQgYSBxdW90ZSBhbmQgZXZlcnlvbmUgc2VlcyB3aG8gbGlrZWQgd2hhdC4gTWVtYmVycyBjYW4gc3VibWl0IGEgcXVvdGUgKyBhdXRob3IgKyBjbGFpbS10by1mYW1lICsgc291cmNlIGxpbms7IHN1Ym1pc3Npb25zIHNpdCBpbiAiQXdhaXRpbmcgdmV0dGluZyIgdW50aWwgYW4gYWRtaW4gYXBwcm92ZXMsIHRoZW4gam9pbiB0aGUgbGl2ZSByb3RhdGlvbi4gQXV0aG9yIGxpbmtzIG9ubHkgcmVuZGVyIGFmdGVyIHZldHRpbmcuIE5ldmVyIGF1dG8tZmFicmljYXRlIHF1b3RlcyBhdHRyaWJ1dGVkIHRvIHJlYWwgcGVvcGxlLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyNzg4MTsgRmFtaWx5IExpZmUgVGFiczwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+QXJjYWRlPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhbiBBcmNhZGUgdGFiIHdpdGggYSBicm93c2FibGUgc2hlbGYgb2YgcGxheWFibGUgYnJvd3NlciBnYW1lcywgaW4gdGhlIHNhbWUgY292ZXJmbG93IHN0eWxlIGFzIHRoZSBtZWRpYSBsaWJyYXJ5LiBTdGFydCB3aXRoIGEgY291cGxlIG9mIHNlbGYtY29udGFpbmVkIEhUTUwvY2FudmFzIGdhbWVzIGFuZCBtYWtlIGl0IGVhc3kgdG8gYWRkIG1vcmUuPC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgICA8ZGV0YWlscz4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjMTI4MDgxOyBQZW9wbGUsIFJvbGVzICZhbXA7IE1vZGVyYXRpb248L3NwYW4+PHNwYW4gY2xhc3M9ImNoZXYiPiYjOTY1NDs8L3NwYW4+PC9zdW1tYXJ5PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODA4MTsgUGVvcGxlLCBSb2xlcyAmYW1wOyBNb2RlcmF0aW9uPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5Sb2xlcyAmYW1wOyByb3lhbHM8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QWRkIGEgcm9sZSBzeXN0ZW06IFN1cGVyQWRtaW4gKG1lKSwgcm95YWxzL2FkbWlucywgbWVtYmVycywgYW5kIGd1ZXN0cywgc3RvcmVkIG9uIHRoZSB1c2VycyB0YWJsZS4gR2F0ZSBldmVyeSBzZW5zaXRpdmUgYWN0aW9uIGFuZCBhZG1pbiB0YWIgYnkgcm9sZSBvbiB0aGUgc2VydmVyLCBub3QganVzdCBpbiB0aGUgVUkuIFNob3cgdGhlIHJvbGUgY2hlY2tzIChpc0FkbWluLCBpc1JveWFsLCBpc0tpbmcpIGFuZCBob3cgdGhlIG5hdiBhZGFwdHMgdG8gZWFjaCByb2xlLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODA4MTsgUGVvcGxlLCBSb2xlcyAmYW1wOyBNb2RlcmF0aW9uPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5Ib3VzZWhvbGRzIGFsbG93LWxpc3QgKyBhdXRvLWFwcHJvdmU8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QnVpbGQgYSAiaG91c2Vob2xkcyIgYWxsb3ctbGlzdCAoa2V5ZWQgYnkgZmFtaWx5L3BlcnNvbikgYXMgdGhlIHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIHdobydzIGFsbG93ZWQgaW4sIHN0b3JlZCBpbiBEMSBzZXR0aW5ncy4gT24gZmlyc3QgbG9naW4sIGEga25vd24gZW1haWwgYXV0by1hcHByb3ZlcyBpbnRvIHRoZSByaWdodCBob3VzZWhvbGQgYW5kIHJvbGU7IHVua25vd24gZW1haWxzIHdhaXQgZm9yIGFkbWluIGFwcHJvdmFsLiBFYWNoIGhvdXNlaG9sZCBzaG91bGQgYmUgZXhwb3J0YWJsZSBhcyBhIGZ1bGwgYmFja3VwLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODA4MTsgUGVvcGxlLCBSb2xlcyAmYW1wOyBNb2RlcmF0aW9uPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5BdmF0YXJzPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhdmF0YXJzOiBhbiBpbml0aWFscyBiYWRnZSBieSBkZWZhdWx0LCBvciBhIHBpY3R1cmUvVVJMIGVhY2ggcGVyc29uIHNldHMgaW4gU2V0dGluZ3MsIHNob3duIG5leHQgdG8gZXZlcnkgYm9hcmQgcG9zdCBhbmQgaW4gdGhlIG1lbWJlciBsaXN0LjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzEyODA4MTsgUGVvcGxlLCBSb2xlcyAmYW1wOyBNb2RlcmF0aW9uPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5EYXRhIG93bmVyc2hpcCAvIHJpZ2h0IHRvIHB1cmdlPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkdpdmUgZXZlcnkgbWVtYmVyIG93bmVyc2hpcCBvZiB0aGVpciBvd24gY29udGVudDogdGhleSBjYW4gcG9zdCwgcmVzdHJpY3QsIHNoYXJlLCBvciBkZWxldGUgdGhlaXIgbWF0ZXJpYWxzLCBhbmQgY2FuIGZ1bGx5IHB1cmdlIHRoZW1zZWx2ZXMgJm1kYXNoOyBsZWF2aW5nIG9ubHkgYW4gdW5kZWxldGFibGUgInB1cmdlZCBvbiAmbHQ7ZGF0ZSZndDsiIHRvbWJzdG9uZSwgYnV0IG5ldmVyIGJlaW5nIGFibGUgdG8gZXJhc2UgdGhlIGF1ZGl0IGxvZy4gU2hvdyB0aGUgZGF0YSBtb2RlbCB0aGF0IGVuZm9yY2VzIHRoaXMuPC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgICA8ZGV0YWlscz4KICAgICAgPHN1bW1hcnk+PHNwYW4gY2xhc3M9InNlY3QtdGl0bGUiPiYjOTg4MTsmIzY1MDM5OyBBZG1pbiwgTG9ncyAmYW1wOyBTZXR0aW5nczwvc3Bhbj48c3BhbiBjbGFzcz0iY2hldiI+JiM5NjU0Ozwvc3Bhbj48L3N1bW1hcnk+CiAgICAgIDxkaXYgY2xhc3M9InByb3ciPjxkaXYgY2xhc3M9InBjYXQiPiYjOTg4MTsmIzY1MDM5OyBBZG1pbiwgTG9ncyAmYW1wOyBTZXR0aW5nczwvZGl2PjxkaXYgY2xhc3M9InBsYWJlbCI+Q29udHJvbCBQYW5lbDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InByb21wdCI+PGJ1dHRvbiBjbGFzcz0iY29weSIgb25jbGljaz0iY3AodGhpcykiPkNvcHk8L2J1dHRvbj5CdWlsZCBhbiBhZG1pbiBDb250cm9sIFBhbmVsIHRoYXQgZ2F0aGVycyB0aGUgc2l0ZSdzIHN3aXRjaGVzIGluIG9uZSBwbGFjZTogZ2xvYmFsIHRvZ2dsZXMsIHRoZSBsaXN0IG9mIGZvcnVtIHNwYWNlcywgcGVyLWNhdGVnb3J5IHBlcm1pc3Npb25zLCBhbmQgYSBwZW9wbGUgc3VtbWFyeSB0aGF0IGxpbmtzIGludG8gZnVsbCBtZW1iZXIgbWFuYWdlbWVudC4gVmlzaWJsZSBvbmx5IHRvIGFkbWlucy48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiM5ODgxOyYjNjUwMzk7IEFkbWluLCBMb2dzICZhbXA7IFNldHRpbmdzPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5TeXN0ZW0gQXVkaXQgbG9nPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkJ1aWxkIGEgU3lzdGVtIEF1ZGl0IGxvZyB0aGF0IHJlY29yZHMgbWVhbmluZ2Z1bCBldmVudHMgKGxvZ2lucywgcGxheXMsIGZpbGUgdmlld3MsIHVwbG9hZHMsIHBvc3RzLCBkZWxldGVzLCBlcnJvcnMpLCBlYWNoIHdpdGggYSBoaWVyYXJjaHkgdGFnIChlLmcuIFBpY3R1cmVzICZndDsgUGljdHVyZXMvU2FuIEFudG9uaW8pIGFuZCBoaWRlLWJ5LWxldmVsIGZpbHRlcmluZy4gRGVsaWJlcmF0ZWx5IHNjb3BlIGl0IHRvIG1lYW5pbmdmdWwgZXZlbnRzLCBOT1Qga2V5c3Ryb2tlcyBvciByZWNvcmRpbmdzICZtZGFzaDsgcmVzcGVjdCB0aGUgY29uc2VudCBsaW5lLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzk4ODE7JiM2NTAzOTsgQWRtaW4sIExvZ3MgJmFtcDsgU2V0dGluZ3M8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPkRlc3Ryb3llZC1pdGVtcyBsb2c8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+S2VlcCBhIHBlcm1hbmVudCBsb2cgb2YgZXZlcnkgZGVzdHJveWVkIGl0ZW0sIHJlYWRhYmxlIGJ5IGFsbCBub24tZ3Vlc3QgbWVtYmVycywgd2hlcmUgb25seSB0aGUgU3VwZXJBZG1pbiBjYW4gcmVtb3ZlIGEgbGluZS4gUGFpciBpdCB3aXRoIHRoZSB0eXBlLXRvLWNvbmZpcm0gZGVsZXRlIHNvIG5vdGhpbmcgdmFuaXNoZXMgd2l0aG91dCBhIHRyYWNlLjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzk4ODE7JiM2NTAzOTsgQWRtaW4sIExvZ3MgJmFtcDsgU2V0dGluZ3M8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPlNldHRpbmdzIChtZW1iZXJzLCBsaXN0cywgdGhlbWUpPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkJ1aWxkIGEgU2V0dGluZ3MgcGFnZSB3aXRoIGEgdW5pZm9ybSBlZGl0YWJsZSBtZW1iZXIgdGFibGUgKGlubGluZSByb2xlIGRyb3Bkb3duLCBTdXBlckFkbWluIHN0YXIgaW5zdGVhZCBvZiAicmVtb3ZlIiBvbiBteSBvd24gcm93KSwgYSBtYXN0ZXIgIkxpc3RzIiBwaWNrbGlzdCB0aGF0IGZlZWRzIHBlci11c2VyIGNoZWNrYm94ZXMsIGFuZCBhIHNpdGUgdGhlbWUgcGlja2VyICZtZGFzaDsgYWxsIHBlcnNpc3RlZCBpbiBEMS48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icHJvdyI+PGRpdiBjbGFzcz0icGNhdCI+JiM5ODgxOyYjNjUwMzk7IEFkbWluLCBMb2dzICZhbXA7IFNldHRpbmdzPC9kaXY+PGRpdiBjbGFzcz0icGxhYmVsIj5VcGRhdGVzIC8gY2hhbmdlbG9nPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icHJvbXB0Ij48YnV0dG9uIGNsYXNzPSJjb3B5IiBvbmNsaWNrPSJjcCh0aGlzKSI+Q29weTwvYnV0dG9uPkFkZCBhbiBVcGRhdGVzIHRhYiB0aGF0IHNob3dzIGEgZnJpZW5kbHkgY2hhbmdlbG9nIG9mIHdoYXQgc2hpcHBlZCByZWNlbnRseSwgc28gdGhlIGZhbWlseSBjYW4gc2VlIHdoYXQncyBuZXcgd2l0aG91dCBtZSBhbm5vdW5jaW5nIGl0LjwvZGl2PjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwcm93Ij48ZGl2IGNsYXNzPSJwY2F0Ij4mIzk4ODE7JiM2NTAzOTsgQWRtaW4sIExvZ3MgJmFtcDsgU2V0dGluZ3M8L2Rpdj48ZGl2IGNsYXNzPSJwbGFiZWwiPlByb3ZlbmFuY2UgIlB1Ymxpc2hlZCIgc3RhbXA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwcm9tcHQiPjxidXR0b24gY2xhc3M9ImNvcHkiIG9uY2xpY2s9ImNwKHRoaXMpIj5Db3B5PC9idXR0b24+QWRkIGEgc21hbGwgIlB1Ymxpc2hlZCIgcHJvdmVuYW5jZSBzdGFtcCB0byBlYWNoIGZpbmlzaGVkIHZpZXcgc2hvd2luZyB0aGUgcHVibGlzaCBkYXRlLCB2ZXJzaW9uLCBvd25lciwgYW5kIHRoYXQgaXQgd2FzIGJhY2tlZC11cCwgUUEnZCwgYW5kIHJldmlld2VkICZtZGFzaDsgYSBob3VzZSBtYXJrIHRoYXQgc2lnbnMgdGhlIHdvcmsuPC9kaXY+PC9kaXY+CiAgICA8L2RldGFpbHM+CiAgPC9kaXY+CgogIDxmb290ZXI+CiAgICA8cD5UaGF0J3MgdGhlIHdob2xlIHJlY2lwZSAmbWRhc2g7IHRoZSBzdG9yeSwgdGhlIGZlYXR1cmVzLCBhbmQgdGhlIHByb21wdHMuIENvcHkgd2hhdCB5b3UgbGlrZSwgbGVhdmUgd2hhdCB5b3UgZG9uJ3QuIEl0J3MgeW91cnMgdG8ga2VlcC48L3A+CiAgICA8cD5DbGVtaXQgUFVMU0UgJm1pZGRvdDsgYnVpbHQgJmFtcDsgb3duZWQgYnkgPHNwYW4gY2xhc3M9InNpZyI+fkplc3NlPC9zcGFuPiAmbWlkZG90OyAmIzEwMDAzOyBQdWJsaXNoZWQgSnVuIDE5IDIwMjYgJm1pZGRvdDsgdjI8L3A+CiAgPC9mb290ZXI+CjwvZGl2Pgo8c2NyaXB0PgooZnVuY3Rpb24oKXsKICB2YXIgS0VZPSdwdWxzZS1yZWNpcGUtY2hlY2tzLXYxJzsKICB2YXIgYm94ZXM9W10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZnJvdyBpbnB1dFt0eXBlPWNoZWNrYm94XScpKTsKCiAgZnVuY3Rpb24gbG9hZCgpeyB0cnl7cmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oS0VZKSl8fHt9O31jYXRjaChlKXtyZXR1cm4ge307fSB9CiAgZnVuY3Rpb24gc2F2ZShzKXsgdHJ5e2xvY2FsU3RvcmFnZS5zZXRJdGVtKEtFWSxKU09OLnN0cmluZ2lmeShzKSk7fWNhdGNoKGUpe30gfQoKICBmdW5jdGlvbiBwYWludFJvdyhiKXsgYi5jbG9zZXN0KCcuZnJvdycpLmNsYXNzTGlzdC50b2dnbGUoJ2RvbmUnLCBiLmNoZWNrZWQpOyB9CiAgZnVuY3Rpb24gcHJvZ3Jlc3MoKXsKICAgIHZhciBkb25lPWJveGVzLmZpbHRlcihmdW5jdGlvbihiKXtyZXR1cm4gYi5jaGVja2VkO30pLmxlbmd0aCwgbj1ib3hlcy5sZW5ndGg7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJmaWxsJykuc3R5bGUud2lkdGg9KG4/TWF0aC5yb3VuZChkb25lL24qMTAwKTowKSsnJSc7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJ0eHQnKS50ZXh0Q29udGVudD1kb25lKycgb2YgJytuKycgaW5ncmVkaWVudHMgYmFrZWQnKyhkb25lPT09biYmbj8nICDigJQgZnVsbCByZWNpcGUsIGNoZWYg8J+RqOKAjfCfjbMnOicnKTsKICB9CgogIHZhciBzdGF0ZT1sb2FkKCk7CiAgYm94ZXMuZm9yRWFjaChmdW5jdGlvbihiKXsKICAgIGlmKHN0YXRlW2IuZGF0YXNldC5rXSkgYi5jaGVja2VkPXRydWU7CiAgICBwYWludFJvdyhiKTsKICAgIGIuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJyxmdW5jdGlvbigpewogICAgICB2YXIgcz1sb2FkKCk7IGlmKGIuY2hlY2tlZClzW2IuZGF0YXNldC5rXT0xOyBlbHNlIGRlbGV0ZSBzW2IuZGF0YXNldC5rXTsKICAgICAgc2F2ZShzKTsgcGFpbnRSb3coYik7IHByb2dyZXNzKCk7CiAgICB9KTsKICB9KTsKICBwcm9ncmVzcygpOwoKICAvLyBDb3B5IGJ1dHRvbnMKICB3aW5kb3cuY3A9ZnVuY3Rpb24oYnRuKXsKICAgIHZhciB0PWJ0bi5wYXJlbnROb2RlLnRleHRDb250ZW50LnJlcGxhY2UoL15Db3B5LywnJykudHJpbSgpOwogICAgdmFyIGRvbmU9ZnVuY3Rpb24oKXt2YXIgbz1idG4udGV4dENvbnRlbnQ7YnRuLnRleHRDb250ZW50PSdDb3BpZWQg4pyTJztidG4uY2xhc3NMaXN0LmFkZCgnZG9uZScpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtidG4udGV4dENvbnRlbnQ9J0NvcHknO2J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkb25lJyk7fSwxNDAwKTt9OwogICAgaWYobmF2aWdhdG9yLmNsaXBib2FyZCYmbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQpe25hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHQpLnRoZW4oZG9uZSxmdW5jdGlvbigpe2ZhbGxiYWNrKHQpO2RvbmUoKTt9KTt9CiAgICBlbHNle2ZhbGxiYWNrKHQpO2RvbmUoKTt9CiAgfTsKICBmdW5jdGlvbiBmYWxsYmFjayh0KXt2YXIgdGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTt0YS52YWx1ZT10O2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGEpO3RhLnNlbGVjdCgpO3RyeXtkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO31jYXRjaChlKXt9ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0YSk7fQoKICAvLyBFeHBhbmQgLyBjb2xsYXBzZSBhbGwKICB3aW5kb3cuZXhwYW5kQWxsPWZ1bmN0aW9uKG9wZW4pe1tdLmZvckVhY2guY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucGFuZWwgPiBkZXRhaWxzJyksZnVuY3Rpb24oZCl7ZC5vcGVuPW9wZW47fSk7fTsKICB3aW5kb3cucmVzZXRDaGVja3M9ZnVuY3Rpb24oKXsgaWYoIWNvbmZpcm0oJ0NsZWFyIGFsbCB5b3VyIGNoZWNrbWFya3M/JykpcmV0dXJuOyBzYXZlKHt9KTsgYm94ZXMuZm9yRWFjaChmdW5jdGlvbihiKXtiLmNoZWNrZWQ9ZmFsc2U7cGFpbnRSb3coYik7fSk7IHByb2dyZXNzKCk7IH07CgogIC8vIFNlYXJjaCBmaWx0ZXIKICB2YXIgcT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncScpOwogIHEuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLGZ1bmN0aW9uKCl7CiAgICB2YXIgdj1xLnZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpOwogICAgW10uZm9yRWFjaC5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wYW5lbCcpLGZ1bmN0aW9uKHBhbmVsKXsKICAgICAgdmFyIHRvcD1wYW5lbC5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiBkZXRhaWxzJyk7CiAgICAgIHZhciByb3dzPXBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mcm93LC5wcm93Jyk7CiAgICAgIGlmKCF2KXsgcGFuZWwuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpOyBbXS5mb3JFYWNoLmNhbGwocm93cyxmdW5jdGlvbihyKXtyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTt9KTsgcmV0dXJuOyB9CiAgICAgIHZhciBhbnlQYW5lbD1mYWxzZTsKICAgICAgaWYocm93cy5sZW5ndGgpewogICAgICAgIFtdLmZvckVhY2guY2FsbChyb3dzLGZ1bmN0aW9uKHIpewogICAgICAgICAgdmFyIGhpdD1yLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2KT4tMTsKICAgICAgICAgIHIuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZScsIWhpdCk7IGlmKGhpdClhbnlQYW5lbD10cnVlOwogICAgICAgIH0pOwogICAgICB9IGVsc2UgewogICAgICAgIGFueVBhbmVsPXBhbmVsLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2KT4tMTsKICAgICAgfQogICAgICBwYW5lbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRlJywhYW55UGFuZWwpOwogICAgICBpZihhbnlQYW5lbCYmdG9wKXRvcC5vcGVuPXRydWU7CiAgICB9KTsKICB9KTsKfSkoKTsKPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo=";
var FLYWHEEL_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9IlVURi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAiPgo8dGl0bGU+UFVMU0UgwrcgRkxZV0hFRUwg4oCUIExlc3NvbnMgJiBSZXZpZXcgQm9hcmQ8L3RpdGxlPgo8c3R5bGU+CiAgOnJvb3R7CiAgICAtLWJnOiMwNTA3MGY7IC0tYmcyOiMwYTEwMjA7IC0tZ2xhc3M6cmdiYSgxMCwyMCw0MCwuNTUpOwogICAgLS1jeWFuOiMwMGU1ZmY7IC0tdmlvbGV0OiNiMTRiZmY7IC0tbWFnZW50YTojZmYzZGYwOyAtLWNyaW1zb246I2ZmMmQ1NTsKICAgIC0taW5rOiNjZmU5ZmY7IC0tZGltOiM2Zjg2YTg7IC0tb2s6IzI4ZTBhMDsgLS13YXJuOiNmZmIwM2E7CiAgICAtLWxpbmU6cmdiYSgwLDIyOSwyNTUsLjIyKTsKICB9CiAgKntib3gtc2l6aW5nOmJvcmRlci1ib3h9CiAgKjo6LXdlYmtpdC1zY3JvbGxiYXJ7d2lkdGg6MDtoZWlnaHQ6MDtkaXNwbGF5Om5vbmV9CiAgKntzY3JvbGxiYXItd2lkdGg6bm9uZTstbXMtb3ZlcmZsb3ctc3R5bGU6bm9uZX0KICBodG1sLGJvZHl7bWFyZ2luOjA7cGFkZGluZzowfQogIGJvZHl7CiAgICBiYWNrZ3JvdW5kOgogICAgICByYWRpYWwtZ3JhZGllbnQoMTIwMHB4IDYwMHB4IGF0IDUwJSAtMTAlLCByZ2JhKDE3Nyw3NSwyNTUsLjE4KSwgdHJhbnNwYXJlbnQgNjAlKSwKICAgICAgcmFkaWFsLWdyYWRpZW50KDkwMHB4IDUwMHB4IGF0IDkwJSAxMCUsIHJnYmEoMjU1LDQ1LDg1LC4xMiksIHRyYW5zcGFyZW50IDU1JSksCiAgICAgIGxpbmVhci1ncmFkaWVudCgxODBkZWcsdmFyKC0tYmcpLCMwMzA0MGEgODAlKTsKICAgIGNvbG9yOnZhcigtLWluayk7IGZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sU2Vnb2UgVUksUm9ib3RvLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmOwogICAgbWluLWhlaWdodDoxMDB2aDsgb3ZlcmZsb3cteDpoaWRkZW47CiAgfQogIC5mbG9vcntwb3NpdGlvbjpmaXhlZDtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtoZWlnaHQ6Mzh2aDtwb2ludGVyLWV2ZW50czpub25lO3otaW5kZXg6MDsKICAgIGJhY2tncm91bmQ6CiAgICAgIGxpbmVhci1ncmFkaWVudCh0cmFuc3BhcmVudCwgcmdiYSgwLDIyOSwyNTUsLjA3KSksCiAgICAgIHJlcGVhdGluZy1saW5lYXItZ3JhZGllbnQoOTBkZWcsIHJnYmEoMCwyMjksMjU1LC4xMCkgMCAxcHgsIHRyYW5zcGFyZW50IDFweCA2MHB4KSwKICAgICAgcmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCgwZGVnLCByZ2JhKDAsMjI5LDI1NSwuMTApIDAgMXB4LCB0cmFuc3BhcmVudCAxcHggNjBweCk7CiAgICB0cmFuc2Zvcm06cGVyc3BlY3RpdmUoNDIwcHgpIHJvdGF0ZVgoNjJkZWcpOyB0cmFuc2Zvcm0tb3JpZ2luOmJvdHRvbTsgb3BhY2l0eTouNTsKICAgIG1hc2staW1hZ2U6bGluZWFyLWdyYWRpZW50KHRyYW5zcGFyZW50LCAjMDAwIDcwJSk7fQogIC53cmFwe3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTttYXgtd2lkdGg6MTA4MHB4O21hcmdpbjowIGF1dG87cGFkZGluZzoyMnB4IDE4cHggOTBweH0KICBoZWFkZXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTZweDtmbGV4LXdyYXA6d3JhcDttYXJnaW4tYm90dG9tOjhweH0KICAubG9nb3tmb250LXdlaWdodDo4MDA7bGV0dGVyLXNwYWNpbmc6M3B4O2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRpbSl9CiAgaDF7bWFyZ2luOjJweCAwIDA7Zm9udC1zaXplOjMwcHg7bGV0dGVyLXNwYWNpbmc6NnB4OwogICAgIGJhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDkwZGVnLHZhcigtLWN5YW4pLHZhcigtLXZpb2xldCksdmFyKC0tbWFnZW50YSkpOwogICAgIC13ZWJraXQtYmFja2dyb3VuZC1jbGlwOnRleHQ7YmFja2dyb3VuZC1jbGlwOnRleHQ7Y29sb3I6dHJhbnNwYXJlbnQ7CiAgICAgdGV4dC1zaGFkb3c6MCAwIDI4cHggcmdiYSgwLDIyOSwyNTUsLjI1KX0KICAuc3Vie2NvbG9yOnZhcigtLWRpbSk7Zm9udC1zaXplOjEyLjVweDtsZXR0ZXItc3BhY2luZzoxcHg7bWFyZ2luLXRvcDo0cHh9CiAgLnN0YW1we21hcmdpbi1sZWZ0OmF1dG87Zm9udC1zaXplOjEwLjVweDtjb2xvcjp2YXIoLS1kaW0pO3RleHQtYWxpZ246cmlnaHQ7bGluZS1oZWlnaHQ6MS42OwogICAgYm9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtwYWRkaW5nOjZweCAxMHB4O2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZ2xhc3MpfQogIC5zdGFtcCBie2NvbG9yOnZhcigtLWN5YW4pfQogIG5hdntkaXNwbGF5OmZsZXg7Z2FwOjhweDtmbGV4LXdyYXA6d3JhcDttYXJnaW46MThweCAwIDE0cHh9CiAgLnRhYntjdXJzb3I6cG9pbnRlcjtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JhY2tncm91bmQ6dmFyKC0tZ2xhc3MpO2NvbG9yOnZhcigtLWluayk7CiAgICBwYWRkaW5nOjlweCAxNXB4O2JvcmRlci1yYWRpdXM6MTBweDtmb250LXNpemU6MTIuNXB4O2xldHRlci1zcGFjaW5nOjFweDsKICAgIGRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjdweDt0cmFuc2l0aW9uOi4xOHM7dXNlci1zZWxlY3Q6bm9uZX0KICAudGFiOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1jeWFuKTtib3gtc2hhZG93OjAgMCAxNnB4IHJnYmEoMCwyMjksMjU1LC4yNSl9CiAgLnRhYi5vbntiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxODBkZWcscmdiYSgwLDIyOSwyNTUsLjE4KSxyZ2JhKDAsMjI5LDI1NSwuMDUpKTsKICAgIGJvcmRlci1jb2xvcjp2YXIoLS1jeWFuKTtjb2xvcjojZWFmZmZmO2JveC1zaGFkb3c6MCAwIDIycHggcmdiYSgwLDIyOSwyNTUsLjMpfQogIC50YWIgLmJ7Zm9udC1zaXplOjEwcHg7YmFja2dyb3VuZDpyZ2JhKDAsMjI5LDI1NSwuMTgpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7CiAgICBwYWRkaW5nOjFweCA3cHg7Ym9yZGVyLXJhZGl1czoyMHB4O2NvbG9yOnZhcigtLWN5YW4pfQogIC5wYW5lbHtwb3NpdGlvbjpyZWxhdGl2ZTtiYWNrZ3JvdW5kOnZhcigtLWdsYXNzKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpOwogICAgYm9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6MThweDttYXJnaW46MTRweCAwO2JhY2tkcm9wLWZpbHRlcjpibHVyKDZweCl9CiAgLnBhbmVsOmJlZm9yZSwucGFuZWw6YWZ0ZXJ7Y29udGVudDoiIjtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O3BvaW50ZXItZXZlbnRzOm5vbmV9CiAgLnBhbmVsOmJlZm9yZXtsZWZ0Oi0xcHg7dG9wOi0xcHg7Ym9yZGVyLWxlZnQ6MnB4IHNvbGlkIHZhcigtLWN5YW4pO2JvcmRlci10b3A6MnB4IHNvbGlkIHZhcigtLWN5YW4pO2JvcmRlci10b3AtbGVmdC1yYWRpdXM6NnB4fQogIC5wYW5lbDphZnRlcntyaWdodDotMXB4O2JvdHRvbTotMXB4O2JvcmRlci1yaWdodDoycHggc29saWQgdmFyKC0tY3lhbik7Ym9yZGVyLWJvdHRvbToycHggc29saWQgdmFyKC0tY3lhbik7Ym9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6NnB4fQogIC5wdGl0bGV7Zm9udC1zaXplOjEzcHg7bGV0dGVyLXNwYWNpbmc6MnB4O2NvbG9yOnZhcigtLWN5YW4pO21hcmdpbjowIDAgMTBweDt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2V9CiAgLmxlYWR7Y29sb3I6dmFyKC0tZGltKTtmb250LXNpemU6MTMuNXB4O2xpbmUtaGVpZ2h0OjEuNzttYXJnaW46MCAwIDhweH0KICAuc2Vje2Rpc3BsYXk6bm9uZX0gLnNlYy5vbntkaXNwbGF5OmJsb2NrfQogIC5mdy1ncmlke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MS40ZnIgMC44NWZyO2dhcDoxNnB4O2FsaWduLWl0ZW1zOmNlbnRlcn0KICBAbWVkaWEobWF4LXdpZHRoOjgyMHB4KXsuZnctZ3JpZHtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfS5zdGFtcHtkaXNwbGF5Om5vbmV9fQoKICAvKiA9PT09PSBFTkdJTkUgPT09PT0gKi8KICAuc3RhZ2V7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6MTAwJTttYXgtd2lkdGg6NTAwcHg7bWFyZ2luOjAgYXV0bzthc3BlY3QtcmF0aW86MX0KICAuc3RhZ2Ugc3Zne3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7ZGlzcGxheTpibG9jaztvdmVyZmxvdzp2aXNpYmxlO3RvdWNoLWFjdGlvbjpub25lfQogICN3aGVlbC5ib29te2FuaW1hdGlvbjpib29tIC45cyBlYXNlLW91dH0KICBAa2V5ZnJhbWVzIGJvb217MCV7b3BhY2l0eToxfTIwJXtvcGFjaXR5OjE7ZmlsdGVyOmRyb3Atc2hhZG93KDAgMCAxNnB4IHZhcigtLWNyaW1zb24pKX0xMDAle29wYWNpdHk6MX19CiAgLnN0YWdlLnNoYWtle2FuaW1hdGlvbjpzaGsgLjVzfQogIEBrZXlmcmFtZXMgc2hrezAlLDEwMCV7dHJhbnNmb3JtOnRyYW5zbGF0ZSgwLDApfTI1JXt0cmFuc2Zvcm06dHJhbnNsYXRlKC01cHgsM3B4KX01MCV7dHJhbnNmb3JtOnRyYW5zbGF0ZSg0cHgsLTRweCl9NzUle3RyYW5zZm9ybTp0cmFuc2xhdGUoLTNweCwtMnB4KX19CiAgLmxjb3Jle2FuaW1hdGlvbjpscHVsc2UgMS4xcyBlYXNlLWluLW91dCBpbmZpbml0ZX0KICBAa2V5ZnJhbWVzIGxwdWxzZXswJSwxMDAle29wYWNpdHk6Ljc4fTUwJXtvcGFjaXR5OjF9fQogIC5zdG5sYmx7Zm9udDo3MDAgMTFweCAtYXBwbGUtc3lzdGVtLFNlZ29lIFVJO2xldHRlci1zcGFjaW5nOi41cHg7ZmlsbDp2YXIoLS1kaW0pfQogIC5zdG5sYmwuaG90e2ZpbGw6I2VhZmZmZn0KICAubW9kbGJse2ZvbnQ6NjAwIDhweCAtYXBwbGUtc3lzdGVtLFNlZ29lIFVJO2xldHRlci1zcGFjaW5nOi4ycHg7ZmlsbDp2YXIoLS1kaW0pO3BhaW50LW9yZGVyOnN0cm9rZTtzdHJva2U6IzA1MDcwZjtzdHJva2Utd2lkdGg6Mi41cHh9CiAgLm1vZHRvZ3tjdXJzb3I6cG9pbnRlcn0KICAubW9kdG9nLmxvY2tlZHtvcGFjaXR5Oi4zNTtjdXJzb3I6bm90LWFsbG93ZWR9CiAgLmRheWxibHtmb250OjcwMCAxMXB4IC1hcHBsZS1zeXN0ZW0sU2Vnb2UgVUk7bGV0dGVyLXNwYWNpbmc6MXB4O2ZpbGw6I2JmZjZmZjtwYWludC1vcmRlcjpzdHJva2U7c3Ryb2tlOiMwNTA3MGY7c3Ryb2tlLXdpZHRoOjNweH0KICAjYmV6ZWxIaXR7Y3Vyc29yOmdyYWJ9CiAgLmJvb21iYWRnZXtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO2xlZnQ6NTAlO3RyYW5zZm9ybTp0cmFuc2xhdGUoLTUwJSwtNTAlKTt6LWluZGV4OjU7CiAgICBmb250LXNpemU6MTNweDtsZXR0ZXItc3BhY2luZzoxcHg7Y29sb3I6I2ZmZjtiYWNrZ3JvdW5kOnJnYmEoMjU1LDQ1LDg1LC45Mik7CiAgICBib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzo4cHggMTRweDtvcGFjaXR5OjA7dHJhbnNpdGlvbjpvcGFjaXR5IC4yczt0ZXh0LWFsaWduOmNlbnRlcjtsaW5lLWhlaWdodDoxLjQ7cG9pbnRlci1ldmVudHM6bm9uZX0KICAuYm9vbWJhZGdlLnNob3d7b3BhY2l0eToxfQoKICAuaHVke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjEwcHh9CiAgLnN0cm9rZS1ub3d7Zm9udC1zaXplOjEwcHg7bGV0dGVyLXNwYWNpbmc6MS41cHg7Y29sb3I6dmFyKC0tZGltKX0KICAuc3Ryb2tlLW5vdyBie2ZvbnQtc2l6ZToxM3B4O2xldHRlci1zcGFjaW5nOi41cHg7Y29sb3I6I2VhZmZmZn0KICAudGFjaCAubGFie2ZvbnQtc2l6ZTo5LjVweDtsZXR0ZXItc3BhY2luZzouNHB4O2NvbG9yOnZhcigtLWRpbSk7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO21hcmdpbi1ib3R0b206NHB4fQogIC50YWNoIC5sYWIgYntjb2xvcjp2YXIoLS1jeWFuKX0KICAudGFjaCAudHJhY2t7cG9zaXRpb246cmVsYXRpdmU7aGVpZ2h0OjEwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjZweDtvdmVyZmxvdzpoaWRkZW47YmFja2dyb3VuZDojMDcwYzE4fQogIC50YWNoIC5yZWR7cG9zaXRpb246YWJzb2x1dGU7cmlnaHQ6MDt0b3A6MDtib3R0b206MDt3aWR0aDoxNCU7YmFja2dyb3VuZDpyZ2JhKDI1NSw0NSw4NSwuMjIpfQogIC50YWNoIC5maWxse3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDtib3R0b206MDt3aWR0aDowO2JhY2tncm91bmQ6dmFyKC0tY3lhbik7dHJhbnNpdGlvbjp3aWR0aCAuMTJzLCBiYWNrZ3JvdW5kIC4yc30KICAuaHVkc3Vte2ZvbnQtc2l6ZToxMC41cHg7Y29sb3I6dmFyKC0taW5rKTtsaW5lLWhlaWdodDoxLjU1O2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czo5cHg7cGFkZGluZzo3cHggOXB4O2JhY2tncm91bmQ6cmdiYSg3LDEyLDI0LC41KX0KICAubWV0ZXJ7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2dhcDo4cHh9CiAgLm1ldHtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6OXB4O3BhZGRpbmc6N3B4IDlweDtiYWNrZ3JvdW5kOnJnYmEoNywxMiwyNCwuNSl9CiAgLm1ldCAua3tmb250LXNpemU6OC41cHg7bGV0dGVyLXNwYWNpbmc6LjRweDtjb2xvcjp2YXIoLS1kaW0pfQogIC5tZXQgLnZ7Zm9udC1zaXplOjE3cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOnZhcigtLWN5YW4pO21hcmdpbi10b3A6MXB4fQogIC5jdGxyb3d7ZGlzcGxheTpmbGV4O2dhcDo3cHg7ZmxleC13cmFwOndyYXB9CiAgLmJ0bntjdXJzb3I6cG9pbnRlcjtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JhY2tncm91bmQ6dmFyKC0tZ2xhc3MpO2NvbG9yOnZhcigtLWluayk7CiAgICBwYWRkaW5nOjhweCAxMXB4O2JvcmRlci1yYWRpdXM6OXB4O2ZvbnQtc2l6ZToxMS41cHg7bGV0dGVyLXNwYWNpbmc6LjRweDt0cmFuc2l0aW9uOi4xOHM7dXNlci1zZWxlY3Q6bm9uZX0KICAuYnRuOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1jeWFuKTtib3gtc2hhZG93OjAgMCAxNHB4IHJnYmEoMCwyMjksMjU1LC4yNSk7Y29sb3I6I2VhZmZmZn0KICAuYnRuLnR1cm46aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWNyaW1zb24pO2JveC1zaGFkb3c6MCAwIDE0cHggcmdiYSgyNTUsNDUsODUsLjMpfQogIC5idG4uZGVlcHtib3JkZXItY29sb3I6cmdiYSgxNzcsNzUsMjU1LC41KTtjb2xvcjojZWFmZmZmfQogIC5idG4uZGVlcC5vbntiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxODBkZWcscmdiYSgxNzcsNzUsMjU1LC4yMikscmdiYSgxNzcsNzUsMjU1LC4wNikpO2JvcmRlci1jb2xvcjp2YXIoLS12aW9sZXQpfQogIC50b2FzdHtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS13YXJuKTttaW4taGVpZ2h0OjE1cHg7bGluZS1oZWlnaHQ6MS41O3RyYW5zaXRpb246b3BhY2l0eSAuM3M7b3BhY2l0eTowfQogIC50b2FzdC5zaG93e29wYWNpdHk6MX0KCiAgLyogdHVuaW5nIHNsaWRlcnMgKi8KICAjdHVuZXtkaXNwbGF5Om5vbmU7bWFyZ2luLXRvcDoxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWxpbmUpO3BhZGRpbmctdG9wOjE0cHh9CiAgLnR1bmVoZHtmb250LXNpemU6MTJweDtsZXR0ZXItc3BhY2luZzoxLjVweDtjb2xvcjp2YXIoLS12aW9sZXQpO21hcmdpbi1ib3R0b206MTBweDt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2V9CiAgLnR1bmVncmlke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDQsMWZyKTtnYXA6MTBweH0KICBAbWVkaWEobWF4LXdpZHRoOjgyMHB4KXsudHVuZWdyaWR7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnJ9fQogIC50dW5lY2FyZHtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1sZWZ0OjNweCBzb2xpZCB2YXIoLS1nYyk7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTBweCAxMnB4O2JhY2tncm91bmQ6cmdiYSg3LDEyLDI0LC41KX0KICAudHVuZWNhcmQgLnR0e2ZvbnQtc2l6ZToxMXB4O2xldHRlci1zcGFjaW5nOi41cHg7Y29sb3I6I2VhZmZmZn0KICAudHVuZWNhcmQgLnRze2ZvbnQtc2l6ZTo5LjVweDtjb2xvcjp2YXIoLS1kaW0pO21hcmdpbjoycHggMCA5cHg7bGluZS1oZWlnaHQ6MS40fQogIC50dW5lY2FyZCBpbnB1dFt0eXBlPXJhbmdlXXt3aWR0aDoxMDAlO2FjY2VudC1jb2xvcjp2YXIoLS1nYyk7aGVpZ2h0OjRweH0KICAudHVuZWNhcmQgLm92e2ZvbnQtc2l6ZToxMS41cHg7Y29sb3I6dmFyKC0tZ2MpO21hcmdpbi10b3A6N3B4O2ZvbnQtd2VpZ2h0OjcwMH0KCiAgLmN5Y2xlbGlzdHtsaXN0LXN0eWxlOm5vbmU7cGFkZGluZzowO21hcmdpbjo4cHggMCAwfQogIC5jeWNsZWxpc3QgbGl7bWFyZ2luOjAgMCA5cHg7Y29sb3I6dmFyKC0taW5rKTtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjU7cGFkZGluZy1sZWZ0OjE4cHg7cG9zaXRpb246cmVsYXRpdmV9CiAgLmN5Y2xlbGlzdCBsaTpiZWZvcmV7Y29udGVudDoiIjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjVweDt3aWR0aDo5cHg7aGVpZ2h0OjlweDtib3JkZXItcmFkaXVzOjJweH0KICAuY3ljbGVsaXN0IGxpLmZjOmJlZm9yZXtiYWNrZ3JvdW5kOnZhcigtLWN5YW4pfSAuY3ljbGVsaXN0IGxpLnJiOmJlZm9yZXtiYWNrZ3JvdW5kOnZhcigtLXZpb2xldCl9CiAgLmN5Y2xlbGlzdCBsaS5zcDpiZWZvcmV7YmFja2dyb3VuZDp2YXIoLS1tYWdlbnRhKX0gLmN5Y2xlbGlzdCBsaS5sbDpiZWZvcmV7YmFja2dyb3VuZDp2YXIoLS1vayl9CiAgLmN5Y2xlbGlzdCBie2NvbG9yOiNlYWZmZmZ9CiAgLmN5Y2xlbGlzdCAuc3R7Zm9udC1zaXplOjEwcHg7bGV0dGVyLXNwYWNpbmc6MXB4O2NvbG9yOnZhcigtLWRpbSk7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlfQoKICAuc2VhcmNoe3dpZHRoOjEwMCU7YmFja2dyb3VuZDojMDcwYzE4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Y29sb3I6dmFyKC0taW5rKTsKICAgIHBhZGRpbmc6MTFweCAxM3B4O2JvcmRlci1yYWRpdXM6MTBweDtmb250LXNpemU6MTMuNXB4O291dGxpbmU6bm9uZTttYXJnaW4tYm90dG9tOjEwcHh9CiAgLnNlYXJjaDpmb2N1c3tib3JkZXItY29sb3I6dmFyKC0tY3lhbik7Ym94LXNoYWRvdzowIDAgMTZweCByZ2JhKDAsMjI5LDI1NSwuMil9CiAgZGV0YWlscy5hY2N7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtib3JkZXItcmFkaXVzOjExcHg7bWFyZ2luOjhweCAwO2JhY2tncm91bmQ6cmdiYSg3LDEyLDI0LC42KTtvdmVyZmxvdzpoaWRkZW59CiAgZGV0YWlscy5hY2Nbb3Blbl17Ym9yZGVyLWNvbG9yOnJnYmEoMCwyMjksMjU1LC40KX0KICBkZXRhaWxzLmFjYz5zdW1tYXJ5e2N1cnNvcjpwb2ludGVyO2xpc3Qtc3R5bGU6bm9uZTtwYWRkaW5nOjEycHggMTRweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O2ZvbnQtc2l6ZToxMy41cHh9CiAgZGV0YWlscy5hY2M+c3VtbWFyeTo6LXdlYmtpdC1kZXRhaWxzLW1hcmtlcntkaXNwbGF5Om5vbmV9CiAgZGV0YWlscy5hY2M+c3VtbWFyeTpob3ZlcntiYWNrZ3JvdW5kOnJnYmEoMCwyMjksMjU1LC4wNil9CiAgLmNoZXZ7Y29sb3I6dmFyKC0tY3lhbik7dHJhbnNpdGlvbjouMnM7Zm9udC1zaXplOjEycHh9CiAgZGV0YWlsc1tvcGVuXT5zdW1tYXJ5IC5jaGV2e3RyYW5zZm9ybTpyb3RhdGUoOTBkZWcpfQogIC50YWdyb3d7bWFyZ2luLWxlZnQ6YXV0bztkaXNwbGF5OmZsZXg7Z2FwOjZweDtmbGV4LXdyYXA6d3JhcH0KICAudGFne2ZvbnQtc2l6ZTo5LjVweDtsZXR0ZXItc3BhY2luZzouNXB4O3BhZGRpbmc6MnB4IDhweDtib3JkZXItcmFkaXVzOjIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1saW5lKTtjb2xvcjp2YXIoLS1kaW0pfQogIC50YWcuc2V2e2NvbG9yOnZhcigtLWNyaW1zb24pO2JvcmRlci1jb2xvcjpyZ2JhKDI1NSw0NSw4NSwuNSl9CiAgLnRhZy5maXh7Y29sb3I6dmFyKC0tb2spO2JvcmRlci1jb2xvcjpyZ2JhKDQwLDIyNCwxNjAsLjUpfQogIC50YWcuZG9te2NvbG9yOnZhcigtLXZpb2xldCk7Ym9yZGVyLWNvbG9yOnJnYmEoMTc3LDc1LDI1NSwuNSl9CiAgLmJvZHl7cGFkZGluZzowIDE2cHggMTZweDtjb2xvcjp2YXIoLS1pbmspO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuN30KICAuYm9keSAua3Z7Y29sb3I6dmFyKC0tZGltKX0gLmJvZHkgLmt2IGJ7Y29sb3I6dmFyKC0tY3lhbik7Zm9udC13ZWlnaHQ6NjAwfQogIC5hcHBsaWVke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW4tdG9wOjEycHg7Zm9udC1zaXplOjEyLjVweDtjb2xvcjp2YXIoLS1kaW0pfQogIC5hcHBsaWVkIGlucHV0e3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7YWNjZW50LWNvbG9yOnZhcigtLW9rKX0KICAucmJ7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMywxZnIpO2dhcDoxMHB4O21hcmdpbi10b3A6OHB4fQogIEBtZWRpYShtYXgtd2lkdGg6NjgwcHgpey5yYntncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfX0KICAucmJjYXJke2JvcmRlcjoxcHggc29saWQgdmFyKC0tbGluZSk7Ym9yZGVyLXJhZGl1czoxMHB4O3BhZGRpbmc6MTJweDtiYWNrZ3JvdW5kOnJnYmEoNywxMiwyNCwuNTUpfQogIC5yYmNhcmQgaDR7bWFyZ2luOjAgMCA2cHg7Zm9udC1zaXplOjEycHg7bGV0dGVyLXNwYWNpbmc6MXB4O2NvbG9yOnZhcigtLWN5YW4pfQogIC5yYmNhcmQuc2VjIGg0e2NvbG9yOnZhcigtLWNyaW1zb24pfSAucmJjYXJkLnByaXYgaDR7Y29sb3I6dmFyKC0tdmlvbGV0KX0gLnJiY2FyZC5ta3QgaDR7Y29sb3I6dmFyKC0tbWFnZW50YSl9CiAgLnJiY2FyZCBwe21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRpbSk7bGluZS1oZWlnaHQ6MS42fQogIC5hZ2VudHtkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtwYWRkaW5nOjlweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWxpbmUpfQogIC5hZ2VudDpsYXN0LWNoaWxke2JvcmRlcjowfQogIC5hZ2VudCAubm17Zm9udC1zaXplOjEzcHg7Y29sb3I6I2VhZmZmZjttaW4td2lkdGg6MTUwcHh9CiAgLmFnZW50IC5sbntmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kaW0pO2xpbmUtaGVpZ2h0OjEuNX0KICAucGVyc29uYXN7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMiwxZnIpO2dhcDoxMnB4O21hcmdpbi10b3A6NnB4fQogIEBtZWRpYShtYXgtd2lkdGg6NjgwcHgpey5wZXJzb25hc3tncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyfX0KICAucGVyc29uYXtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjE0cHg7YmFja2dyb3VuZDpyZ2JhKDcsMTIsMjQsLjU1KTt0cmFuc2l0aW9uOi4xOHM7Y3Vyc29yOnBvaW50ZXJ9CiAgLnBlcnNvbmE6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLXZpb2xldCk7Ym94LXNoYWRvdzowIDAgMThweCByZ2JhKDE3Nyw3NSwyNTUsLjI1KTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMnB4KX0KICAucGVyc29uYSAud2hve2ZvbnQtc2l6ZToxNHB4O2NvbG9yOiNlYWZmZmY7bGV0dGVyLXNwYWNpbmc6LjVweH0KICAucGVyc29uYSAucm9sZXtmb250LXNpemU6MTEuNXB4O2NvbG9yOnZhcigtLWRpbSk7bWFyZ2luOjRweCAwIDEwcHh9CiAgLmdve2Rpc3BsYXk6aW5saW5lLWJsb2NrO2ZvbnQtc2l6ZToxMXB4O2xldHRlci1zcGFjaW5nOjFweDtjb2xvcjp2YXIoLS1jeWFuKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDExcHh9CiAgLnBlcnNvbmE6aG92ZXIgLmdve2JvcmRlci1jb2xvcjp2YXIoLS12aW9sZXQpO2NvbG9yOiNlYWZmZmZ9CiAgLm5vdGV7Zm9udC1zaXplOjExLjVweDtjb2xvcjp2YXIoLS13YXJuKTttYXJnaW4tdG9wOjE0cHg7bGluZS1oZWlnaHQ6MS42O2JvcmRlci1sZWZ0OjJweCBzb2xpZCB2YXIoLS13YXJuKTtwYWRkaW5nLWxlZnQ6MTBweH0KICAucGlsbHtkaXNwbGF5OmlubGluZS1ibG9jaztmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1iZyk7YmFja2dyb3VuZDp2YXIoLS1jeWFuKTtwYWRkaW5nOjJweCA5cHg7Ym9yZGVyLXJhZGl1czoyMHB4O2xldHRlci1zcGFjaW5nOjFweDtmb250LXdlaWdodDo3MDB9CiAgLnNyYyBhe2NvbG9yOnZhcigtLWN5YW4pO3RleHQtZGVjb3JhdGlvbjpub25lO2JvcmRlci1ib3R0b206MXB4IGRvdHRlZCB2YXIoLS1saW5lKX0KICAuc3JjIGE6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWN5YW4pfQogIC5hZGR7bWFyZ2luLXRvcDoxMnB4O2JvcmRlcjoxcHggZGFzaGVkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZGltKTtmb250LXNpemU6MTIuNXB4O2N1cnNvcjpwb2ludGVyfQogIC5hZGQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWN5YW4pO2NvbG9yOnZhcigtLWN5YW4pfQo8L3N0eWxlPgo8L2hlYWQ+Cjxib2R5Pgo8ZGl2IGNsYXNzPSJmbG9vciI+PC9kaXY+CjxkaXYgY2xhc3M9IndyYXAiPgoKICA8aGVhZGVyPgogICAgPGRpdj4KICAgICAgPGRpdiBjbGFzcz0ibG9nbyI+Q0xFTUlUIMK3IFBVTFNFPC9kaXY+CiAgICAgIDxoMT5GTFlXSEVFTDwvaDE+CiAgICAgIDxkaXYgY2xhc3M9InN1YiI+T25lLXdlZWsgc3ByaW50cyDCtyBhcm0gbW9kaWZpZXJzIG9uIHRoZSBib2FyZCDCtyB0dW5lIGVmZmljaWVuY3kgc2xpZGVycyDCtyBzcGluIHRoZSBkYXkgYmV6ZWw8L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0ic3RhbXAiPgogICAgICA8c3BhbiBjbGFzcz0icGlsbCI+TU9DS1VQPC9zcGFuPjxicj4KICAgICAgdjAuOSDCtyBidWlsdC9vd25lZCBieSA8Yj5+SmVzc2U8L2I+PGJyPgogICAgICBiYWNrZWQtdXAg4pyTIMK3IFFBIOKckyDCtyBmYW1pbHktb25seTxicj4KICAgICAg4pyTIERyYWZ0ZWQgMjAyNi0wNi0yMAogICAgPC9kaXY+CiAgPC9oZWFkZXI+CgogIDxuYXY+CiAgICA8ZGl2IGNsYXNzPSJ0YWIgb24iIGRhdGEtdD0iZnciPjxzcGFuPuKXjjwvc3Bhbj4gVGhlIEVuZ2luZTwvZGl2PgogICAgPGRpdiBjbGFzcz0idGFiIiBkYXRhLXQ9Imxlc3NvbnMiPjxzcGFuPuKcpjwvc3Bhbj4gTGVzc29ucyBMaWJyYXJ5IDxzcGFuIGNsYXNzPSJiIj43PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0idGFiIiBkYXRhLXQ9ImJvYXJkIj48c3Bhbj7impY8L3NwYW4+IFJldmlldyBCb2FyZCA8c3BhbiBjbGFzcz0iYiI+MTU8L3NwYW4+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJ0YWIiIGRhdGEtdD0iY3JhY2siPjxzcGFuPuKaoTwvc3Bhbj4gRmlyc3QgQ3JhY2sgPHNwYW4gY2xhc3M9ImIiPjY8L3NwYW4+PC9kaXY+CiAgPC9uYXY+CgogIDwhLS0gPT09PT09PT09PT09IEVOR0lORSA9PT09PT09PT09PT0gLS0+CiAgPHNlY3Rpb24gY2xhc3M9InNlYyBvbiIgaWQ9ImZ3Ij4KICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0icHRpdGxlIj5UaGUgZm91ci1zdHJva2UgZmx5d2hlZWwg4oCUIG9uZS13ZWVrIHNwcmludDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmdy1ncmlkIj4KCiAgICAgICAgPGRpdiBjbGFzcz0ic3RhZ2UiIGlkPSJzdGFnZSI+CiAgICAgICAgICA8c3ZnIGlkPSJzdmciIHZpZXdCb3g9IjAgMCA0ODAgNDgwIj4KICAgICAgICAgICAgPGRlZnM+CiAgICAgICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGU1ZmYiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjYjE0YmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmYzZGYwIi8+CiAgICAgICAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9Imxhc2VyIiB4MT0iMCIgeTE9IjEiIHgyPSIwIiB5Mj0iMCI+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGU1ZmYiLz48c3RvcCBvZmZzZXQ9Ii41NSIgc3RvcC1jb2xvcj0iI2IxNGJmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmMmQ1NSIvPgogICAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgICAgICAgPGZpbHRlciBpZD0iZ2xvdyIgeD0iLTcwJSIgeT0iLTcwJSIgd2lkdGg9IjI0MCUiIGhlaWdodD0iMjQwJSI+CiAgICAgICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyLjYiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT4KICAgICAgICAgICAgICA8L2ZpbHRlcj4KICAgICAgICAgICAgPC9kZWZzPgogICAgICAgICAgICA8Y2lyY2xlIGN4PSIyNDAiIGN5PSIyNDAiIHI9IjIwNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjI5LDI1NSwuMTQpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjQwIiByPSIxODYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIyOSwyNTUsLjEwKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICAgICAgICAgIDxnIGlkPSJiZXplbCI+PC9nPgogICAgICAgICAgICA8Y2lyY2xlIGlkPSJiZXplbEhpdCIgY3g9IjI0MCIgY3k9IjI0MCIgcj0iMTk2IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMDEpIiBzdHJva2Utd2lkdGg9IjM0IiBwb2ludGVyLWV2ZW50cz0ic3Ryb2tlIj48dGl0bGU+U3BpbiB0aGUgTW9u4oCTRnJpIGRpYWwg4oCUIG9uZS13ZWVrIHNwcmludHMuIENsaWNrIGFuZCBkcmFnIHRvIHJvdGF0ZS48L3RpdGxlPjwvY2lyY2xlPgogICAgICAgICAgICA8Y2lyY2xlIGN4PSIyNDAiIGN5PSIyNDAiIHI9IjE1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMjI5LDI1NSwuMTApIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgICAgICAgPGcgaWQ9IndoZWVsIj4KICAgICAgICAgICAgICA8Y2lyY2xlIGN4PSIyNDAiIGN5PSIyNDAiIHI9Ijk2IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtZGFzaGFycmF5PSI1IDExIiBvcGFjaXR5PSIuODUiLz4KICAgICAgICAgICAgICA8Y2lyY2xlIGN4PSIyNDAiIGN5PSIyNDAiIHI9IjU4IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTc3LDc1LDI1NSwuNSkiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSIzIDkiLz4KICAgICAgICAgICAgICA8ZyBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iLjUiPgogICAgICAgICAgICAgICAgPGxpbmUgeDE9IjI0MCIgeTE9IjE0OCIgeDI9IjI0MCIgeTI9IjMzMiIvPjxsaW5lIHgxPSIxNDgiIHkxPSIyNDAiIHgyPSIzMzIiIHkyPSIyNDAiLz4KICAgICAgICAgICAgICAgIDxsaW5lIHgxPSIxNzUiIHkxPSIxNzUiIHgyPSIzMDUiIHkyPSIzMDUiLz48bGluZSB4MT0iMzA1IiB5MT0iMTc1IiB4Mj0iMTc1IiB5Mj0iMzA1Ii8+CiAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgIDxsaW5lIHgxPSIyNDAiIHkxPSIyNDAiIHgyPSIyNDAiIHkyPSIxMjgiIHN0cm9rZT0idXJsKCNsYXNlcikiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWx0ZXI9InVybCgjZ2xvdykiIG9wYWNpdHk9Ii41NSIvPgogICAgICAgICAgICAgIDxsaW5lIGNsYXNzPSJsY29yZSIgeDE9IjI0MCIgeTE9IjI0MCIgeDI9IjI0MCIgeTI9IjEyOCIgc3Ryb2tlPSIjZWFmZmZmIiBzdHJva2Utd2lkdGg9IjIuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgICAgICAgICAgICAgPGNpcmNsZSBjbGFzcz0ibGNvcmUiIGN4PSIyNDAiIGN5PSIxMjgiIHI9IjYuNSIgZmlsbD0iI2ZmMmQ1NSIgZmlsdGVyPSJ1cmwoI2dsb3cpIi8+CiAgICAgICAgICAgICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMTI4IiByPSIzIiBmaWxsPSIjZmZmIi8+CiAgICAgICAgICAgICAgPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjQwIiByPSIxMiIgZmlsbD0iIzA1MDcwZiIgc3Ryb2tlPSJ2YXIoLS1jeWFuKSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPGcgaWQ9InN0YXRpb25zIj48L2c+CiAgICAgICAgICAgIDxnIGlkPSJtb2RzIiBzdHlsZT0iZGlzcGxheTpub25lIj48L2c+CiAgICAgICAgICA8L3N2Zz4KICAgICAgICAgIDxkaXYgY2xhc3M9ImJvb21iYWRnZSIgaWQ9ImJvb20iPuKaoCBCTEVXIEFQQVJUIOKAlCBvdmVyLXJldnZlZDxicj48c3BhbiBzdHlsZT0iZm9udC1zaXplOjExcHg7b3BhY2l0eTouOSI+c2hpcHBlZCBmYXN0ZXIgdGhhbiBRQSDCtyBsb3N0IGEgdGVhbW1hdGUgwrcgcmVidWlsZGluZzwvc3Bhbj48L2Rpdj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPGRpdiBjbGFzcz0iaHVkIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InN0cm9rZS1ub3ciPkNVUlJFTlQgU1RST0tFIMK3IDxiIGlkPSJzbm93Ij5yZWFkeSDigJQgZGVhZCBzdG9wPC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0idGFjaCI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9ImxhYiI+PHNwYW4+RGVsaXZlcnkg4oCUIDxiPnByb2R1Y3RzL21pbjwvYj48L3NwYW4+PHNwYW4+PGIgaWQ9InJwcyI+MC4wMDwvYj4gwrcgcmVkbGluZSA8c3BhbiBpZD0icmwiPjAuNzA8L3NwYW4+PC9zcGFuPjwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0cmFjayI+PGRpdiBjbGFzcz0icmVkIj48L2Rpdj48ZGl2IGNsYXNzPSJmaWxsIiBpZD0idGZpbGwiPjwvZGl2PjwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJodWRzdW0iIGlkPSJodWRzdW0iPuKAlDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ibWV0ZXIiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXQiPjxkaXYgY2xhc3M9ImsiPlBST0RVQ1RTPC9kaXY+PGRpdiBjbGFzcz0idiIgaWQ9Im1wcm9kIiBzdHlsZT0iY29sb3I6dmFyKC0tb2spIj4wPC9kaXY+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9Im1ldCI+PGRpdiBjbGFzcz0iayI+VE9LRU5TIC8gUEFTUzwvZGl2PjxkaXYgY2xhc3M9InYiIGlkPSJtdG9rIj7igJQ8L2Rpdj48L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ibWV0Ij48ZGl2IGNsYXNzPSJrIj5DT1NUIC8gUFJPRFVDVCDihpM8L2Rpdj48ZGl2IGNsYXNzPSJ2IiBpZD0ibWNwcCIgc3R5bGU9ImNvbG9yOnZhcigtLXZpb2xldCkiPuKAlDwvZGl2PjwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXQiPjxkaXYgY2xhc3M9ImsiPkJMT1ctVVBTPC9kaXY+PGRpdiBjbGFzcz0idiIgaWQ9Im1ib29tIiBzdHlsZT0iY29sb3I6dmFyKC0tY3JpbXNvbikiPjA8L2Rpdj48L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iY3Rscm93Ij4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYnRuIiBpZD0iZmlyZSIgdGl0bGU9IkJlZ2luIGEgb25lLXdlZWsgc3ByaW50IGFuZCBmaXJlIHRoZSBpZ25pdGlvbiAoRmlyc3QgQ3JhY2spLiBQcmVzcyBhZ2FpbiB0byBhZGQgYW5vdGhlciBpZ25pdGlvbiBraWNrLiI+4pa2IFNwcmludCBTdGFydDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJidG4gdHVybiIgaWQ9InR1cm4iIHRpdGxlPSJTaW11bGF0ZSBsb3NpbmcgYSB0ZWFtbWF0ZSAvIGludGVncmF0aW5nIGEgbmV3IHBhcnQg4oCUIGEgb25lLXRpbWUgZWZmaWNpZW5jeSBoaXQgdGhhdCBuZXZlciBmdWxseSBzdG9wcyB0aGUgd2hlZWwuIj7in4IgUmVzb3VyY2UgVHVybm92ZXI8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0iY3Rscm93Ij4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYnRuIGRlZXAiIGlkPSJkZWVwZXIiIHRpdGxlPSJTaG93IG9yIGhpZGUgdGhlIG1vZGlmaWVyIHRvZ2dsZS1kb3RzIG9uIHRoZSBib2FyZC4gQ2xpY2sgYSBkb3QgdG8gYXJtL2Rpc2FybSBhIGNoZWNrcG9pbnQgb3IgaGVscGVyLiI+4oyBIERlZXBlciBBbmFseXNpczwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJidG4gZGVlcCIgaWQ9InR1bmVyIiB0aXRsZT0iU2hvdyBvciBoaWRlIHRoZSBmb3VyIGVmZmljaWVuY3kgc2xpZGVycyAoUmVmaW5lbWVudCwgTGVzc29ucy1MZWFybmVkIGVmZmljaWVuY3ksIFNjYWxhYmlsaXR5LCBCYW5rZWQgS25vd2xlZGdlKS4iPuKKniBUdW5pbmc8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iYnRuIiBpZD0icnN0IiB0aXRsZT0iUmVzZXQgdGhlIGVuZ2luZSB0byBhIGRlYWQgc3RvcC4gWW91ciBhcm1lZCBtb2RpZmllcnMgYW5kIHR1bmluZyBhcmUga2VwdC4iPuKfsiBEZWFkIHN0b3A8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0idG9hc3QiIGlkPSJ0b2FzdCI+VGlwOiBzcGluIHRoZSBNb27igJNGcmkgYmV6ZWwgwrcg4oyBIERlZXBlciBBbmFseXNpcyBhcm1zIG1vZGlmaWVycyBvbiB0aGUgYm9hcmQgwrcg4oqeIFR1bmluZyBvcGVucyBlZmZpY2llbmN5IHNsaWRlcnMuPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPGRpdiBpZD0idHVuZSI+CiAgICAgICAgPGRpdiBjbGFzcz0idHVuZWhkIj7iip4gVHVuaW5nIOKAlCBlZmZpY2llbmN5IHNsaWRlcnM8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJ0dW5lZ3JpZCI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0dW5lY2FyZCIgc3R5bGU9Ii0tZ2M6dmFyKC0tY3lhbikiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0dCIgdGl0bGU9IkhvdyB3ZWxsLXJlZmluZWQgeW91ciBsZXNzb25zIGFyZS4gQmV0dGVyLXJlZmluZWQgbGVzc29ucyBtYWtlIGVhY2ggZmlyc3QgY3JhY2sgaGl0IGhhcmRlciDigJQgdGhpcyBtdWx0aXBsaWVzIHRoZSBTcHJpbnQgU3RhcnQgaWduaXRpb24gaW1wdWxzZS4iPlNwcmludCBTdGFydCDigJQgUmVmaW5lbWVudCBlZmZpY2llbmN5PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InRzIj5SZWZpbmVkIGxlc3NvbnMgbWFrZSBlYWNoIGZpcnN0IGNyYWNrIGhpdCBoYXJkZXIuPC9kaXY+CiAgICAgICAgICAgIDxpbnB1dCB0eXBlPSJyYW5nZSIgaWQ9InNsLXJlZmluZSIgbWluPSIwIiBtYXg9IjEwMCIgc3RlcD0iNSIgdmFsdWU9IjAiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJvdiIgaWQ9Im92LXJlZmluZSI+w5cxLjAwIGltcHVsc2U8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0idHVuZWNhcmQiIHN0eWxlPSItLWdjOnZhcigtLXZpb2xldCkiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0dCIgdGl0bGU9Ikdvb2QgbGVzc29ucyBtYWtlIFFBIGNoZWFwZXIgYW5kIGZhc3Rlci4gUmFpc2luZyB0aGlzIHNocmlua3MgdGhlIG5lZ2F0aXZlIGltcHVsc2UgZWFjaCBhcm1lZCBSZXZpZXcgY2hlY2twb2ludCBjb3N0cyAodXAgdG8gLTcwJSkuIj5SZXZpZXcg4oCUIExlc3NvbnMtTGVhcm5lZCBlZmZpY2llbmN5PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InRzIj5CZXR0ZXIgbGVzc29ucyBtYWtlIFFBIGNoZWFwZXIg4oCUIGxlc3MgbmVnYXRpdmUgaW1wdWxzZSBwZXIgaGl0LjwvZGl2PgogICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFuZ2UiIGlkPSJzbC1sbGVmZiIgbWluPSIwIiBtYXg9IjEwMCIgc3RlcD0iNSIgdmFsdWU9IjAiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJvdiIgaWQ9Im92LWxsZWZmIj7iiJIwJSBRQSBjb3N0PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InR1bmVjYXJkIiBzdHlsZT0iLS1nYzp2YXIoLS1tYWdlbnRhKSI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InR0IiB0aXRsZT0iU2hpcCBzdGFydHMgYXMgYSBkcmFnIChyZWxlYXNlIG92ZXJoZWFkKS4gQWRkIHRlYW0gbWVtYmVycyB0byBzY2FsZSB0aHJvdWdocHV0IOKAlCBlYWNoIHBlcnNvbiBvZmZzZXRzIHRoZSBkcmFnIGFuZCB0dXJucyBTaGlwIGludG8gcHJvZHVjdHMgcGVyIG1pbnV0ZS4iPlNoaXAg4oCUIFNjYWxhYmlsaXR5IChhZGQgcGVvcGxlKTwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0cyI+U2hpcCBzdGFydHMgYXMgYSBkcmFnOyBwZW9wbGUgc2NhbGUgdGhyb3VnaHB1dCDihpIgcHJvZHVjdHMvbWluLjwvZGl2PgogICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFuZ2UiIGlkPSJzbC1wZW9wbGUiIG1pbj0iMCIgbWF4PSI2IiBzdGVwPSIxIiB2YWx1ZT0iMCI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9Im92IiBpZD0ib3YtcGVvcGxlIj4wIHBlb3BsZSDCtyBzaGlwIOKIkjAuMDIwIChkcmFnKTwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0dW5lY2FyZCIgc3R5bGU9Ii0tZ2M6dmFyKC0tb2spIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0idHQiIHRpdGxlPSJBY2N1bXVsYXRlZCwgZ3Jvb21lZCBrbm93bGVkZ2UgYmVjb21lcyBwZXJtYW5lbnQgbW9tZW50dW0uIFRoaXMgc2V0cyBhIGZsb29yIHRoZSB3aGVlbCBuZXZlciBkcm9wcyBiZWxvdyDigJQgZXZlbiBhZnRlciBhIGJsb3ctdXAgb3IgcmVzb3VyY2UgdHVybm92ZXIuIj5MZXNzb25zIOKAlCBCYW5rZWQgS25vd2xlZGdlPC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InRzIj5QZXJtYW5lbnQgbW9tZW50dW06IHRoZSB3aGVlbCBuZXZlciBkcm9wcyBiZWxvdyB0aGlzIGZsb29yLjwvZGl2PgogICAgICAgICAgICA8aW5wdXQgdHlwZT0icmFuZ2UiIGlkPSJzbC1iYW5rZWQiIG1pbj0iMCIgbWF4PSIxMDAiIHN0ZXA9IjUiIHZhbHVlPSIwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ib3YiIGlkPSJvdi1iYW5rZWQiPmZsb29yIDAuMDM8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0icHRpdGxlIj5UaGUgc3Ryb2tlcyAod29ya2Zsb3cgb3JkZXIpPC9kaXY+CiAgICAgIDx1bCBjbGFzcz0iY3ljbGVsaXN0Ij4KICAgICAgICA8bGkgY2xhc3M9ImZjIj48c3BhbiBjbGFzcz0ic3QiPlBvd2VyIMK3IElnbml0aW9uICgxMiBvJ2Nsb2NrKTwvc3Bhbj48YnI+PGI+U3ByaW50IFN0YXJ0PC9iPiDigJQgdGhlIG9uZSBzdHJva2UgdGhhdCBhZGRzIGVuZXJneS4gUHJlc3MgaXQgdG8gYmVnaW4gdGhlIHNwcmludCBhbmQgZmlyZSB0aGUgd2hlZWwuIFRvb2xzLCB0ZW1wbGF0ZXMgJmFtcDsgZ3VpZGFuY2UgYXJtIGltcHVsc2U7IHRoZSBSZWZpbmVtZW50IHNsaWRlciBtdWx0aXBsaWVzIGl0LjwvbGk+CiAgICAgICAgPGxpIGNsYXNzPSJyYiI+PHNwYW4gY2xhc3M9InN0Ij5Db21wcmVzc2lvbiDCtyBuZWdhdGl2ZSBpbXB1bHNlICgzKTwvc3Bhbj48YnI+PGI+UmV2aWV3IEJvYXJkPC9iPiDigJQgZWFjaCBRQSBjaGVja3BvaW50IHN1YnRyYWN0cyBhIG9uZS10aW1lIGltcHVsc2UgPGI+d2hlbiB0aGUgbGFzZXIgaGl0cyBpdDwvYj4uIExlc3NvbnMtTGVhcm5lZCBlZmZpY2llbmN5IHNocmlua3MgdGhhdCBjb3N0LjwvbGk+CiAgICAgICAgPGxpIGNsYXNzPSJzcCI+PHNwYW4gY2xhc3M9InN0Ij5FeGhhdXN0ICg2KSDigJQgc3RhcnRzIGFzIGEgRFJBRzwvc3Bhbj48YnI+PGI+U2hpcDwvYj4g4oCUIHNoaXBwaW5nIGhhcyBvdmVyaGVhZCwgc28gU2hpcCBiZWdpbnMgYXMgYSA8YiBzdHlsZT0iY29sb3I6dmFyKC0tY3JpbXNvbikiPm5lZ2F0aXZlIGltcHVsc2U8L2I+LiBTY2FsYWJpbGl0eSAoYWRkIHBlb3BsZSkgb2Zmc2V0cyBpdCBhbmQgdHVybnMgaXQgaW50byBwcm9kdWN0cy9taW47IGZhc3QtZmFpbCAmYW1wOyBibHVlL2dyZWVuIHJhaXNlIHRoZSByZWRsaW5lLjwvbGk+CiAgICAgICAgPGxpIGNsYXNzPSJsbCI+PHNwYW4gY2xhc3M9InN0Ij5JbnRha2UgKDkpPC9zcGFuPjxicj48Yj5MZXNzb25zIExlYXJuZWQ8L2I+IOKAlCByZWNvbmNpbGUgJmFtcDsgZ3Jvb20gdGhlIGxpYnJhcnk7IDxiPkJhbmtlZCBLbm93bGVkZ2U8L2I+IGlzIHBlcm1hbmVudCBtb21lbnR1bSAoYSBmbG9vciB0aGUgd2hlZWwgbmV2ZXIgZHJvcHMgYmVsb3cpLjwvbGk+CiAgICAgIDwvdWw+CiAgICAgIDxwIGNsYXNzPSJsZWFkIiBzdHlsZT0ibWFyZ2luLXRvcDoxMHB4Ij48YiBzdHlsZT0iY29sb3I6dmFyKC0tY3JpbXNvbikiPlJlc291cmNlIFR1cm5vdmVyPC9iPiBpcyByZWFsIHBoeXNpY3M6IGxvc2UgYSB0ZWFtbWF0ZSwgaW50ZWdyYXRlIGEgbmV3IHBhcnQg4oCUIGEgb25lLXRpbWUgZWZmaWNpZW5jeSBoaXQgdGhhdCBuZXZlciBxdWl0ZSBzdG9wcyB0aGUgd2hlZWwuIDxiIHN0eWxlPSJjb2xvcjp2YXIoLS1jeWFuKSI+V2VsbC1ncm9vbWVkLCBiYW5rZWQgbGVzc29ucyBhcmUgdGhlIGZseXdoZWVsIG1hc3M8L2I+IOKAlCBwZXJtYW5lbnQgbW9tZW50dW0gdGhhdCBrZWVwcyBpdCB0dXJuaW5nIGNoZWFwZXIgZXZlcnkgY3ljbGUuPC9wPgogICAgPC9kaXY+CgogICAgPGRpdiBjbGFzcz0icGFuZWwiPgogICAgICA8ZGl2IGNsYXNzPSJwdGl0bGUiPldoZXJlIHRoZSBpZGVhIGNvbWVzIGZyb20gKHZlcmlmaWVkIHNvdXJjZXMpPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InNyYyIgc3R5bGU9ImZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuOTtjb2xvcjp2YXIoLS1pbmspIj4KICAgICAgICA8cCBjbGFzcz0ibGVhZCI+PGIgc3R5bGU9ImNvbG9yOnZhcigtLWN5YW4pIj5KaW0gQ29sbGlucyDigJQgVGhlIEZseXdoZWVsIEVmZmVjdDwvYj4gKDxpPkdvb2QgdG8gR3JlYXQ8L2k+KS4gTm8gc2luZ2xlIG1pcmFjbGUgbW92ZTsgcmVsZW50bGVzcyB0dXJucyBidWlsZCBtb21lbnR1bSB1bnRpbCBicmVha3Rocm91Z2guIOKGkiA8YSBocmVmPSJodHRwczovL3d3dy5qaW1jb2xsaW5zLmNvbS9jb25jZXB0cy90aGUtZmx5d2hlZWwuaHRtbCIgdGFyZ2V0PSJfYmxhbmsiPmppbWNvbGxpbnMuY29tL2NvbmNlcHRzL3RoZS1mbHl3aGVlbDwvYT48L3A+CiAgICAgICAgPHAgY2xhc3M9ImxlYWQiPjxiIHN0eWxlPSJjb2xvcjp2YXIoLS12aW9sZXQpIj5BbWF6b24gLyBCZXpvcyDigJQgdGhlIFZpcnR1b3VzIEN5Y2xlPC9iPi4gRHJhd24gb24gYSBuYXBraW4gKDIwMDEpOiBiZXR0ZXIgZXhwZXJpZW5jZSDihpIgbW9yZSBjdXN0b21lcnMg4oaSIG1vcmUgc2VsZWN0aW9uIOKGkiBsb3dlciBjb3N0IOKGkiBiZXR0ZXIgZXhwZXJpZW5jZS4g4oaSIDxhIGhyZWY9Imh0dHBzOi8vZmVlZHZpc29yLmNvbS9yZXNvdXJjZXMvYW1hem9uLXRyZW5kcy9hbWF6b24tZmx5d2hlZWwtZXhwbGFpbmVkLyIgdGFyZ2V0PSJfYmxhbmsiPkFtYXpvbiBGbHl3aGVlbCBleHBsYWluZWQ8L2E+PC9wPgogICAgICAgIDxwIGNsYXNzPSJsZWFkIj48YiBzdHlsZT0iY29sb3I6dmFyKC0tbWFnZW50YSkiPlRoZSBEYXRhIC8gQUkgRmx5d2hlZWw8L2I+IOKAlCBvdXJzLiBFdmVyeSBncm9vbWVkIGxlc3NvbiBpbXByb3ZlcyB0aGUgc3lzdGVtIOKGkiBtb3JlIHVzZSDihpIgbW9yZSBsZXNzb25zIOKGkiBjb21wb3VuZGluZyBhZHZhbnRhZ2UgYXQgZmFsbGluZyBjb3N0LiDihpIgPGEgaHJlZj0iaHR0cHM6Ly93d3cuc3RhcnR1cHMuY29tL2xleGljb24vZGF0YS1mbHl3aGVlbCIgdGFyZ2V0PSJfYmxhbmsiPkRhdGEgZmx5d2hlZWwgZGVmaW5pdGlvbjwvYT48L3A+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9zZWN0aW9uPgoKICA8IS0tID09PT09PT09PT09PSBMRVNTT05TIExJQlJBUlkgPT09PT09PT09PT09IC0tPgogIDxzZWN0aW9uIGNsYXNzPSJzZWMiIGlkPSJsZXNzb25zIj4KICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0icHRpdGxlIj5MZXNzb25zIExpYnJhcnkgwrcgdGhlIGZseXdoZWVsIG1hc3M8L2Rpdj4KICAgICAgPHAgY2xhc3M9ImxlYWQiPkV2ZXJ5IGhhcmQtd29uIGZpeCwgc2VhcmNoYWJsZS4gVGljayAiYXBwbGllZCIgd2hlbiBhIGxlc3NvbiBpcyBiYWtlZCBpbnRvIGhvdyB3ZSBidWlsZCDigJQgc2F2ZWQgb24gdGhpcyBkZXZpY2UuIFRoaXMgZ3Jvd3MgbGFyZ2Ugb3ZlciB0aW1lLCBzbyBpdCBtdXN0IGJlIDxiPmN1cmF0ZWQgYW5kIGdyb29tZWQ8L2I+OiBtZXJnZSBkdXBsaWNhdGVzLCByZXRpcmUgc3RhbGUgZml4ZXMsIGtlZXAgZWFjaCBsZXNzb24gbGVhbi48L3A+CiAgICAgIDxpbnB1dCBjbGFzcz0ic2VhcmNoIiBpZD0ibHNlYXJjaCIgcGxhY2Vob2xkZXI9IvCflI4gU2VhcmNoIGxlc3NvbnMg4oCUIHRyeSAncmVnZXgnLCAnZGVwbG95JywgJ0ROUyfigKYiPgogICAgICA8ZGl2IGlkPSJsd3JhcCI+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImFkZCIgb25jbGljaz0iYWxlcnQoJ0xpdmUgYnVpbGQ6IG9wZW5zIGFuIEFkZC1MZXNzb24gZm9ybSB0aGF0IHdyaXRlcyB0byBEMSwgcGx1cyBhIEdyb29tIHZpZXcgdG8gbWVyZ2UvcmV0aXJlLiAoTW9ja3VwKScpIj7vvIsgQWRkIGEgbGVzc29uPC9kaXY+CiAgICA8L2Rpdj4KICA8L3NlY3Rpb24+CgogIDwhLS0gPT09PT09PT09PT09IFJFVklFVyBCT0FSRCA9PT09PT09PT09PT0gLS0+CiAgPHNlY3Rpb24gY2xhc3M9InNlYyIgaWQ9ImJvYXJkIj4KICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0icHRpdGxlIj5UaGUgUmV2aWV3IEJvYXJkIG9mIEFJIGFnZW50cyDCtyB3aG8gZmlyZXMsIGFuZCB3aGVuPC9kaXY+CiAgICAgIDxwIGNsYXNzPSJsZWFkIj5FYWNoIGFnZW50IHNwZWFrcyBpbiB0aGVpciBvd24gdm9pY2UgKHBlciA8Yj5SZXZpZXdCb2FyZC5tZDwvYj4pLCBmcmFtZWQgb2JqZWN0aXZlbHkg4oCUIG5ldmVyIGFpbWVkIGF0IEplc3NlLiBSdW4gdGhlIGxlbnMgdGhhdCBmaXRzOyBoZXJlJ3Mgd2hlcmUgZWFjaCBsYW5kcyBmb3IgPGI+bWF4aW11bSBlZmZlY3Q8L2I+IGFjcm9zcyB0aGUgZm91ciBzdHJva2VzLiBFYWNoIGlzIGFsc28gYSBRQSBjaGVja3BvaW50IHlvdSBjYW4gYXJtIGluIERlZXBlciBBbmFseXNpcy48L3A+CiAgICAgIDxkaXYgaWQ9InJvc3RlciI+PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0icHRpdGxlIj5SZXZpZXcgQm9hcmQgcmVjb3JkcyAodGllZCB0byBlYWNoIFBSKTwvZGl2PgogICAgICA8ZGl2IGlkPSJid3JhcCI+PC9kaXY+CiAgICA8L2Rpdj4KICA8L3NlY3Rpb24+CgogIDwhLS0gPT09PT09PT09PT09IEZJUlNUIENSQUNLID09PT09PT09PT09PSAtLT4KICA8c2VjdGlvbiBjbGFzcz0ic2VjIiBpZD0iY3JhY2siPgogICAgPGRpdiBjbGFzcz0icGFuZWwiPgogICAgICA8ZGl2IGNsYXNzPSJwdGl0bGUiPkZpcnN0IENyYWNrIMK3IHRoZSBTcHJpbnQgU3RhcnQgcG93ZXIgc3Ryb2tlPC9kaXY+CiAgICAgIDxwIGNsYXNzPSJsZWFkIj5QaWNrIGEgbWFzdGVyIHRvIHRha2UgdGhlIGZpcnN0IHN3aW5nLiBJdCBkcmFmdHMgaW4gdGhhdCB2b2ljZSwgdGhlbiBhdXRvLWZpbGVzIHRoZSByZXN1bHQgZm9yIHRoZSBSZXZpZXcgQm9hcmQuIE1vc3QgdG9rZW4taHVuZ3J5IGVhcmx5IOKAlCBjaGVhcGVyIGV2ZXJ5IGN5Y2xlIGFzIGl0IHJldXNlcyBiYW5rZWQsIGdyb29tZWQgbGVzc29ucy48L3A+CiAgICAgIDxkaXYgY2xhc3M9InBlcnNvbmFzIiBpZD0iY3dyYXAiPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJub3RlIj5BZG9wdGlvbiBydWxlOiBGaXJzdCBDcmFjayBzaGlwcyB0aGUgPGI+c21hbGxlc3QgdGhpbmcgdGhlIGZhbWlseSBjYW4gcmVhY3QgdG88L2I+IOKAlCB0aGVpciByZWFjdGlvbiBzdGVlcnMgdGhlIHNwZW5kLCBiZWZvcmUgYSBzaW5nbGUgaG91ciBpcyBzdW5rLiAoQ0xBVURFLm1kIE5vcnRoIFN0YXIgwqcwYik8L2Rpdj4KICAgIDwvZGl2PgogIDwvc2VjdGlvbj4KCjwvZGl2PgoKPHNjcmlwdD4KICAvLyAtLS0tLS0tLS0tIGRhdGEgLS0tLS0tLS0tLQogIGNvbnN0IGxlc3NvbnMgPSBbCiAgICB7dDoiT25lIGJhZCByZWdleCBibGFua2VkIHRoZSB3aG9sZSBhcHAiLCBkOiIyMDI2LTA2LTEzIiwgZG9tOiJQVUxTRSAvIGF1dGgiLCBzZXY6IlNldmVyZSDigJQgZnVsbCBvdXRhZ2UiLAogICAgIHdoYXQ6IkEgc2luZ2xlIHVuZXNjYXBlZCByZWdleCBpbnNpZGUgdGhlIG9uZSBiaWcgSFRNTCB0ZW1wbGF0ZSBsaXRlcmFsIHRocmV3ICdJbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbicgYW5kIHJlbmRlcmVkIGEgYmxhbmsgcGFnZSDigJQgZXZlcnkgYnV0dG9uIGRlYWQuIiwKICAgICBmaXg6IkRvdWJsZS1lc2NhcGUgYWxsIHJlZ2V4L2VzY2FwZXMgaW5zaWRlIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsLiBBbHdheXMgUUEgd2l0aCBub2RlIC0tY2hlY2sgKyBhIGxpdmUgY29uc29sZSBjaGVjayBiZWZvcmUgZGVwbG95LiIsCiAgICAgdGFnczpbInJlZ2V4IiwidGVtcGxhdGUtbGl0ZXJhbCIsImRlcGxveSJdfSwKICAgIHt0OiJBIGRpdmVyZ2VudCBmb2xkZXIgbmVhcmx5IHNoaXBwZWQgc3RhbGUgY29kZSBvdmVyIGEgZGF5J3Mgd29yayIsIGQ6IjIwMjYtMDYtMTQiLCBkb206IkJ1aWxkIGh5Z2llbmUiLCBzZXY6IkhpZ2giLAogICAgIHdoYXQ6IlR3byBjYW5kaWRhdGUgc291cmNlIGZvbGRlcnMgZGlzYWdyZWVkOyBub3RlcyBjb3VsZG4ndCBiZSB0cnVzdGVkIHRvIHNheSB3aGljaCB3YXMgcmVhbC4iLAogICAgIGZpeDoiTGl2ZSB3b3JrZXIgaXMgZ3JvdW5kIHRydXRoLiBGaW5nZXJwcmludCBkaXN0aW5jdGl2ZSBzdHJpbmdzIGFnYWluc3QgZWFjaCBjYW5kaWRhdGUncyBzcmMvaW5kZXguanM7IHRoZSBtYXRjaCB3aW5zLiBPTkUgY2Fub25pY2FsIGZvbGRlci4iLAogICAgIHRhZ3M6WyJjYW5vbmljYWwtc291cmNlIiwiZGVwbG95Il19LAogICAge3Q6IlBvd2VyU2hlbGwgYmxvY2tzIHRoZSBkZXBsb3kgKG5weC5wczEgVW5hdXRob3JpemVkQWNjZXNzKSIsIGQ6IjIwMjYtMDYtMTMiLCBkb206IkRlcGxveSIsIHNldjoiTWVkaXVtIiwKICAgICB3aGF0OiJEZXBsb3lpbmcgdmlhIFBvd2VyU2hlbGwgZmFpbHMg4oCUIGl0cyBleGVjdXRpb24gcG9saWN5IGJsb2NrcyBucHgucHMxLiIsCiAgICAgZml4OiJEZXBsb3kgT05MWSB2aWEgQ29tbWFuZCBQcm9tcHQg4oCUIHRoZSBEZXBsb3kgUFVMU0UuY21kIC8gdGFza2JhciBwaW4uIE5ldmVyIFBvd2VyU2hlbGwuIiwKICAgICB0YWdzOlsiZGVwbG95IiwicG93ZXJzaGVsbCJdfSwKICAgIHt0OiJGaWxlLWVkaXQgdG9vbHMgdHJ1bmNhdGUgbGFyZ2Ugd3JpdGVzICh+My42S0IpIiwgZDoiMjAyNi0wNi0xMyIsIGRvbToiVG9vbGluZyIsIHNldjoiTWVkaXVtIiwKICAgICB3aGF0OiJUaGUgZmlsZS1lZGl0IHRvb2xzIHNpbGVudGx5IHRydW5jYXRlIGJpZyB3cml0ZXMgb24gdGhpcyBtb3VudCwgY29ycnVwdGluZyBpbmRleC5qcy4iLAogICAgIGZpeDoiRWRpdCBiaWcgZmlsZXMgdmlhIHRoZSBzaGVsbCwgdGhlbiB2ZXJpZnk6IG5vZGUgLS1jaGVjaywgZmlsZSBlbmRzIGNvcnJlY3RseSwgYmFsYW5jZWQgYmFja3RpY2tzLCBleHBlY3RlZCBieXRlIHNpemUuIiwKICAgICB0YWdzOlsidG9vbGluZyIsInNoZWxsIl19LAogICAge3Q6IlJlbW92aW5nIGEgY3VzdG9tIGRvbWFpbiBERUxFVEVEIGl0cyBETlMgcmVjb3JkIChsaXZlIG91dGFnZSkiLCBkOiIyMDI2LTA2LTE3IiwgZG9tOiJDbG91ZGZsYXJlIC8gRE5TIiwgc2V2OiJTZXZlcmUg4oCUIG91dGFnZSIsCiAgICAgd2hhdDoiY2xlbWl0Lm5ldC9jbGVtaXRzLmNvbSBhcmUgY3VzdG9tIGRvbWFpbnMgb24gdGhlIHdvcmtlcjsgeWFua2luZyBvbmUgdG8gJ2ZpeCcgaXQgZGVsZXRlZCB0aGUgRE5TIHJlY29yZCBhbmQgdG9vayB0aGUgc2l0ZXMgZG93bi4iLAogICAgIGZpeDoiTmV2ZXIgcmVtb3ZlIGEgbGl2ZSBjdXN0b20gZG9tYWluIHRvIHRyb3VibGVzaG9vdC4gVHJpYWdlIHZpYSBkbnMuZ29vZ2xlIERvSCBmaXJzdC4iLAogICAgIHRhZ3M6WyJkbnMiLCJjbG91ZGZsYXJlIl19LAogICAge3Q6IkFJIG1lcmdlZCBQUnMgSmVzc2UgaGFkbid0IGdyZWVubGl0IiwgZDoiMjAyNi0wNi0xNyIsIGRvbToiUHJvY2VzcyAvIHRydXN0Iiwgc2V2OiJIaWdoIOKAlCB0cnVzdCBicmVhY2giLAogICAgIHdoYXQ6IkEgcHJpb3IgJ2RvIHRoZSBkZXBsb3knIHdhcyB0cmVhdGVkIGFzIHN0YW5kaW5nIGF1dGhvcml6YXRpb247IFBScyB3ZW50IGxpdmUgd2l0aG91dCBwZXItY2hhbmdlIGFwcHJvdmFsLiIsCiAgICAgZml4OiJJUk9OQ0xBRDogYnVpbGQg4oaSIFByZS1EZXBsb3kgKGJyYW5jaCArIFBSKSBmcmVlbHkg4oaSIFNUT1AuIEplc3NlIHByZXNzZXMgRGVwbG95IGZvciBUSEFUIGNoYW5nZS4gQXBwcm92YWwgbmV2ZXIgY2FycmllcyBvdmVyLiIsCiAgICAgdGFnczpbImRlcGxveSIsImFwcHJvdmFsIl19LAogICAge3Q6IkFJIGNvcGllZCBhIHJlZmVyZW5jZSBpbWFnZSdzIFdBUk0gcGFsZXR0ZSAod3JvbmcpIiwgZDoiMjAyNi0wNiIsIGRvbToiRGVzaWduIiwgc2V2OiJMb3ciLAogICAgIHdoYXQ6Ikplc3NlIHNoYXJlZCBhIHdhcm0gc3Vuc2V0IGZvciB0aGUgcm9ib3RzL2hvbG8tc2NyZWVucyBzdHJ1Y3R1cmU7IGFuIEFJIGNvcGllZCB0aGUgd2FybSBjb2xvcnMg4oCUIGFnYWluc3QgaG91c2Ugc3R5bGUuIiwKICAgICBmaXg6IkNvcHkgYSByZWZlcmVuY2UncyBTVFJVQ1RVUkUgYW5kIHRlY2gtZmVlbGluZywgbm90IGl0cyBjb2xvciB0ZW1wZXJhdHVyZS4gRGVmYXVsdCBldmVyeSB2aXN1YWwgdG8gZGFyayBUUk9OLiIsCiAgICAgdGFnczpbImRlc2lnbiIsInRyb24iXX0KICBdOwogIGNvbnN0IGJvYXJkcyA9IFsKICAgIHtidWlsZDoiSGVybyByZWRlc2lnbiIsIHByOiJQUiAjMzMgwrcgMjAyNi0wNi0xOSIsIHN0YXR1czoiTElWRSIsCiAgICAgc2VjOiJObyBleHBvc2VkIHNlY3JldHM7IDcgc2tpbnMgYXJlIGNsaWVudC1vbmx5IHJlbmRlciBwYXRocyDigJQgY2xlYW4uIiwKICAgICBwcml2OiJObyBuZXcgUElJOyByYW5kb20gZXZlbnRzIHJlYWQgbm8gbWVtYmVyIGRhdGEuIE9LLiIsCiAgICAgbWt0OiJGcmVzaC1iYW5uZXItcGVyLXZpc2l0IG5haWxzIGRlbGlnaHQ7IGFkZCBhIFNldHRpbmdzIHRvb2x0aXAgc28gdXNlcnMgZGlzY292ZXIgdGhlIHNraW4gcGlja2VyLiJ9LAogICAge2J1aWxkOiJMaWJyYXJ5IFNsaWNlIDEgKFBsYXlsaXN0cyArIE1vdmllIFF1ZXVlKSIsIHByOiJQUiAjMzggwrcgMjAyNi0wNi0yMCIsIHN0YXR1czoiTElWRSIsCiAgICAgc2VjOiJOZXcgL2FwaS9saWJyYXJ5L3BsYXlsaXN0cyDigJQgY29uZmlybSBpdCBpbmhlcml0cyBnZXRVc2VyKCkgZ2F0ZS4gVmVyaWZpZWQuIiwKICAgICBwcml2OiJTaGFyZWQgbW92aWUgcXVldWUgaXMgZmFtaWx5LXNjb3BlZDsgbm8gZXh0ZXJuYWwgY2FsbHMuIE9LLiIsCiAgICAgbWt0OiJBbGJ1bS1qb2cgd2lkZ2V0IGlzIHN0cm9uZzsgY29uc2lkZXIgY292ZXItYXJ0IGxhenktbG9hZCB0byBrZWVwIGZpcnN0IHBhaW50IHNuYXBweS4ifSwKICAgIHtidWlsZDoiUmVtaW5kZXJzIGJhY2tlbmQgKGNyb24gKyBTZW5kR3JpZCArIFR3aWxpbykiLCBwcjoiUFIgIzExIMK3IDIwMjYtMDYtMTgiLCBzdGF0dXM6IkxJVkUg4oCUIHNlY3JldHMgcGVuZGluZyIsCiAgICAgc2VjOiJXb3JrZXIgc2VjcmV0cyArIFNlbmRHcmlkL1R3aWxpbyByZWdpc3RyYXRpb24gc3RpbGwgcGVuZGluZyDigJQgZG8gTk9UIGVuYWJsZSBzZW5kcyB1bnRpbCBzZXQuIiwKICAgICBwcml2OiJQaG9uZS9lbWFpbCBhcmUgUElJIOKAlCBzdG9yZSBpbiBEMSBvbmx5LCBuZXZlciBpbiBVUkxzIG9yIGxvZ3MuIiwKICAgICBta3Q6Ik9wdC1pbiBjb3B5IG11c3QgYmUgd2FybSArIGV4cGxpY2l0OyBvbmUtdGFwIHVuc3Vic2NyaWJlID0gdHJ1c3QuIn0KICBdOwogIGNvbnN0IHJvc3Rlcj1bCiAgICB7c3Ryb2tlOiJTUFJJTlQgU1RBUlQiLCBjb2w6InZhcigtLWN5YW4pIiwgbm90ZToiQWltIHRoZSBzaG90IGJlZm9yZSBkcmFmdGluZy4iLCB3aG86WwogICAgICBbIkVsb24gTXVzayDCtyA1IHllYXJzIG91dCIsIlNrYXRlIHRvIHdoZXJlIHRoZSBwdWNrIGlzIGdvaW5nOyBvYnZpb3VzIHBhdGggaXMgdGFibGUgc3Rha2VzIOKAlCBnbyBiZXlvbmQgTk9XLiJdLAogICAgICBbIkdlb3JnZSBMdWNhcyDCtyBGWCIsIk9ubHkgdGhlIGJlc3Qg4oCUIGdvcmdlb3VzIHRlY2ggZ3JvdW5kZWQgaW4gcmVhbCBtZWNoYW5pY3Mgb3IgZ2FsYWN0aWMgc2NhbGUuIl0sCiAgICAgIFsiU3BpZWxiZXJnIMK3IHBhY2luZyAmIHNlbGwiLCJXaGVyZSBkb2VzIGl0IGJyZWF0aGUsIHdoZXJlIGRvZXMgaXQgcHVuY2gg4oCUIHdpbGwgdGhleSBGRUVMIGl0PyJdLAogICAgICBbImRhIFZpbmNpIC8gTWljaGVsYW5nZWxvIiwiTWFrZSBpdCBlcGljOyBmaW5kIHRoZSBiZWF1dHkgYW5kIHJhaXNlIGl0IGJlZm9yZSBhIGxpbmUgaXMgd3JpdHRlbi4iXSwKICAgICAgWyJEYW5ueSBFbGZtYW4gwrcgc291bCIsIlRoZSBzY29yZSwgc291bmQsIHRoZSBTT1VMIG9mIHRoZSB0aGluZyDigJQgc2V0IHRoZSBtb29kLiJdCiAgICBdfSwKICAgIHtzdHJva2U6IlJFVklFVyIsIGNvbDoidmFyKC0tdmlvbGV0KSIsIG5vdGU6IkNvbXByZXNzaW9uIOKAlCBzcXVlZXplIGhhcmRlc3QgaGVyZS4iLCB3aG86WwogICAgICBbIkxlcyBHcm9zc21hbiDCtyBjaGFpciIsIk1vbmV5LCBzbWFydHMsIHRpbWluZy4gVGlnaHQsIG9uIHRpbWUsIHByb2ZpdGFibGU/IE5vPyBGaXggaXQuIl0sCiAgICAgIFsiU2VjdXJpdHkgLyBEYXRhLUdvdmVybmFuY2UiLCJXaG8gY2FuIHNlZSB0aGlzPyBFeHBvc3VyZT8gTWl0aWdhdGlvbnM/IChBdXRvIG9uIHB1YmxpYyB3b3JrLikiXSwKICAgICAgWyJUaGUgQWNjb3VudGFudCDCtyBsZWRnZXIiLCJXaGF0IGRvIHRoZSBmaWd1cmVzIGFjdHVhbGx5IHNheT8iXSwKICAgICAgWyJTdGVwaGVuIEhhd2tpbmcgwrcgaXMgdGhpcyByZWFsPyIsIkRvZXMgZXZlcnkgbm9uLWRpZ2l0YWwgY2xhaW0gcGFzcyB0aGUgc21lbGwgdGVzdD8iXSwKICAgICAgWyJSZWFkYWJpbGl0eSBBbmFseXN0IiwiR3JhZGUgbGV2ZWwsIGFzc3VtZWQgZXhwZXJ0aXNlLCB3aG8gaXQncyB3cml0dGVuIGZvci4iXSwKICAgICAgWyJGcmV1ZCDCtyB0aGUgZGVwdGhzIiwiU3VidGV4dCDigJQgaXMgaXQgc2F5aW5nIHNvbWV0aGluZyB3ZSBkb24ndCBtZWFuIHRvPyJdLAogICAgICBbIlBvZSDCtyBmZWFyICYgdGVuc2lvbiIsIldoZXJlJ3MgdGhlIGRyZWFkL2hvb2sgdGhhdCBtYWtlcyBpdCBoYXVudD8iXSwKICAgICAgWyJaaWcgWmlnbGFyIMK3IHNpenpsZSIsIkhvdyBkbyB3ZSBtYWtlIGl0IHBvcCDigJQgd2hlcmUncyB0aGUgbmV4dCBzYWxlPyJdLAogICAgICBbIk1hY2hpYXZlbGxpIMK3IHRoZSBtb21lbnQiLCJTZWl6ZSBUSElTIG1vbWVudCBhbmQgbW92ZSBvdGhlcnMgd2l0aCB1cy4iXQogICAgXX0sCiAgICB7c3Ryb2tlOiJTSElQIiwgY29sOiJ2YXIoLS1tYWdlbnRhKSIsIG5vdGU6IkV4aGF1c3Qg4oCUIHRoZSBmaW5hbCBnby9uby1nbyBnYXRlLiIsIHdobzpbCiAgICAgIFsiTGVzIEdyb3NzbWFuIMK3IGZpbmFsIGNhbGwiLCJUaWdodCwgb24gdGltZSwgcHJvZml0YWJsZSDigJQgc2hpcCBvciBob2xkLiJdLAogICAgICBbIlNlY3VyaXR5IMK3IHB1YmxpYyBnYXRlIiwiTGFzdCBleHBvc3VyZSBjaGVjayBiZWZvcmUgYW55dGhpbmcgaW5kZXhhYmxlIGdvZXMgbGl2ZS4iXQogICAgXX0sCiAgICB7c3Ryb2tlOiJMRVNTT05TIiwgY29sOiJ2YXIoLS1vaykiLCBub3RlOiJJbnRha2Ug4oCUIHJlY29uY2lsZSBpbnRvIHRoZSBrbm93bGVkZ2UgYmFzZS4iLCB3aG86WwogICAgICBbIlRoZSBBY2NvdW50YW50IMK3IHJlY29uY2lsZSIsIlNxdWFyZSB0aGUgbGVkZ2VyOiBkaWQgc3BlbmQvcmV0dXJuIG1hdGNoIHRoZSBwbGFuPyJdLAogICAgICBbIlN0ZXBoZW4gSGF3a2luZyDCtyByZWFsaXR5IiwiRGlkIHRoZSBjbGFpbSBob2xkIHVwIG9uY2UgaXQgd2FzIHJlYWw/Il0sCiAgICAgIFsiUmVhZGFiaWxpdHkgKyBGcmV1ZCIsIkNhcHR1cmUgdGhlIGxlc3NvbiBsZWFuIGFuZCBob25lc3Qg4oCUIHdoYXQgZGlkIHdlIHRydWx5IGxlYXJuPyJdCiAgICBdfQogIF07CgogIC8vIC0tLS0tLS0tLS0gbGVzc29ucyByZW5kZXIgLS0tLS0tLS0tLQogIGNvbnN0IGx3cmFwPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsd3JhcCcpOwogIGZ1bmN0aW9uIGxlc3NvbkhUTUwobCxpKXsKICAgIGNvbnN0IGtleT0nZndfYXBwbGllZF8nK2ksIGNoZWNrZWQ9bG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KT09PScxJz8nY2hlY2tlZCc6Jyc7CiAgICByZXR1cm4gYDxkZXRhaWxzIGNsYXNzPSJhY2MiPjxzdW1tYXJ5PjxzcGFuIGNsYXNzPSJjaGV2Ij7ilrY8L3NwYW4+PHNwYW4+JHtsLnR9PC9zcGFuPgogICAgICA8c3BhbiBjbGFzcz0idGFncm93Ij48c3BhbiBjbGFzcz0idGFnIGRvbSI+JHtsLmRvbX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyBzZXYiPiR7bC5zZXYuc3BsaXQoJyAnKVswXX08L3NwYW4+PC9zcGFuPjwvc3VtbWFyeT4KICAgICAgPGRpdiBjbGFzcz0iYm9keSI+PHAgY2xhc3M9Imt2Ij48Yj5XaGVuOjwvYj4gJHtsLmR9ICZuYnNwO8K3Jm5ic3A7IDxiPlNldmVyaXR5OjwvYj4gJHtsLnNldn08L3A+CiAgICAgIDxwPjxiIHN0eWxlPSJjb2xvcjp2YXIoLS1tYWdlbnRhKSI+V2hhdCBoYXBwZW5lZDo8L2I+ICR7bC53aGF0fTwvcD4KICAgICAgPHA+PGIgc3R5bGU9ImNvbG9yOnZhcigtLW9rKSI+VGhlIGZpeCAvIHJ1bGU6PC9iPiAke2wuZml4fTwvcD4KICAgICAgPGRpdiBjbGFzcz0idGFncm93IiBzdHlsZT0ibWFyZ2luOjAiPiR7bC50YWdzLm1hcCh0PT5gPHNwYW4gY2xhc3M9InRhZyI+IyR7dH08L3NwYW4+YCkuam9pbignJyl9PC9kaXY+CiAgICAgIDxsYWJlbCBjbGFzcz0iYXBwbGllZCI+PGlucHV0IHR5cGU9ImNoZWNrYm94IiBkYXRhLWtleT0iJHtrZXl9IiAke2NoZWNrZWR9PiBCYWtlZCBpbnRvIGhvdyB3ZSBidWlsZCAoYXBwbGllZCk8L2xhYmVsPjwvZGl2PjwvZGV0YWlscz5gOwogIH0KICBmdW5jdGlvbiByZW5kZXJMZXNzb25zKHE9JycpewogICAgcT1xLnRvTG93ZXJDYXNlKCk7CiAgICBsd3JhcC5pbm5lckhUTUw9bGVzc29ucy5tYXAoKGwsaSk9Pih7bCxpfSkpCiAgICAgIC5maWx0ZXIoKHtsfSk9PiFxfHwobC50K2wud2hhdCtsLmZpeCtsLmRvbStsLnRhZ3Muam9pbigpKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpKQogICAgICAubWFwKCh7bCxpfSk9Pmxlc3NvbkhUTUwobCxpKSkuam9pbignJyl8fCc8cCBjbGFzcz0ibGVhZCI+Tm8gbGVzc29ucyBtYXRjaC48L3A+JzsKICAgIGx3cmFwLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJykuZm9yRWFjaChjPT57Yy5vbmNoYW5nZT0oKT0+bG9jYWxTdG9yYWdlLnNldEl0ZW0oYy5kYXRhc2V0LmtleSxjLmNoZWNrZWQ/JzEnOicwJyk7fSk7CiAgfQogIHJlbmRlckxlc3NvbnMoKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbHNlYXJjaCcpLm9uaW5wdXQ9ZT0+cmVuZGVyTGVzc29ucyhlLnRhcmdldC52YWx1ZSk7CgogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb3N0ZXInKS5pbm5lckhUTUw9cm9zdGVyLm1hcChyPT5gPGRldGFpbHMgY2xhc3M9ImFjYyI+CiAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0iY2hldiI+4pa2PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciIHN0eWxlPSJjb2xvcjojMDUwNzBmO2JhY2tncm91bmQ6JHtyLmNvbH07Ym9yZGVyOjA7Zm9udC13ZWlnaHQ6NzAwIj4ke3Iuc3Ryb2tlfTwvc3Bhbj4KICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRpbSkiPiR7ci5ub3RlfTwvc3Bhbj4KICAgICAgPHNwYW4gY2xhc3M9InRhZ3JvdyI+PHNwYW4gY2xhc3M9InRhZyI+JHtyLndoby5sZW5ndGh9IGFnZW50czwvc3Bhbj48L3NwYW4+PC9zdW1tYXJ5PgogICAgPGRpdiBjbGFzcz0iYm9keSI+JHtyLndoby5tYXAoYT0+YDxkaXYgY2xhc3M9ImFnZW50Ij48ZGl2IGNsYXNzPSJubSI+JHthWzBdfTwvZGl2PjxkaXYgY2xhc3M9ImxuIj4ke2FbMV19PC9kaXY+PC9kaXY+YCkuam9pbignJyl9PC9kaXY+PC9kZXRhaWxzPmApLmpvaW4oJycpOwoKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYndyYXAnKS5pbm5lckhUTUw9Ym9hcmRzLm1hcChiPT5gPGRldGFpbHMgY2xhc3M9ImFjYyI+CiAgICA8c3VtbWFyeT48c3BhbiBjbGFzcz0iY2hldiI+4pa2PC9zcGFuPjxzcGFuPiR7Yi5idWlsZH08L3NwYW4+CiAgICAgIDxzcGFuIGNsYXNzPSJ0YWdyb3ciPjxzcGFuIGNsYXNzPSJ0YWciPiR7Yi5wcn08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyBmaXgiPiR7Yi5zdGF0dXN9PC9zcGFuPjwvc3Bhbj48L3N1bW1hcnk+CiAgICA8ZGl2IGNsYXNzPSJib2R5Ij48ZGl2IGNsYXNzPSJyYiI+CiAgICAgIDxkaXYgY2xhc3M9InJiY2FyZCBzZWMiPjxoND7im6ggU2VjdXJpdHk8L2g0PjxwPiR7Yi5zZWN9PC9wPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJyYmNhcmQgcHJpdiI+PGg0PuKXiCBQcml2YWN5PC9oND48cD4ke2IucHJpdn08L3A+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InJiY2FyZCBta3QiPjxoND7inKYgTWFya2V0aW5nPC9oND48cD4ke2IubWt0fTwvcD48L2Rpdj4KICAgIDwvZGl2PjwvZGl2PjwvZGV0YWlscz5gKS5qb2luKCcnKTsKCiAgY29uc3QgcGVyc29uYXMgPSBbCiAgICB7d2hvOiJTdGV2ZSBKb2JzIiwgcm9sZToiVUkgJmFtcDsgcHJvZHVjdCDigJQgdGhlIGZpcnN0IGludGVyZmFjZSBjcmFjayIsIGljb246IuKXkCJ9LAogICAge3dobzoiU3RldmVuIFNwaWVsYmVyZyIsIHJvbGU6IkNpbmVtYXRpYyBpbnRybyAvIHNwbGFzaCAvIHRyYWlsZXIiLCBpY29uOiLilroifSwKICAgIHt3aG86Ikdlb3JnZSBMdWNhcyIsIHJvbGU6IldvcmxkYnVpbGRpbmcsIGRlY2tzLCB0aGUgV2FyIFRyaWJlcyB1bml2ZXJzZSIsIGljb246IuKctyJ9LAogICAge3dobzoiSmVmZiBCZXpvcyIsIHJvbGU6IkZseXdoZWVsICZhbXA7IHN0cmF0ZWd5IOKAlCB0aGUgdmlydHVvdXMgY3ljbGUiLCBpY29uOiLil44ifSwKICAgIHt3aG86IkpvbnkgSXZlIiwgcm9sZToiSW5kdXN0cmlhbCAvIG1hdGVyaWFsIGRlc2lnbiBwb2xpc2giLCBpY29uOiLinZYifSwKICAgIHt3aG86IlRoZSBSZXZpZXcgQm9hcmQiLCByb2xlOiJTa2lwIHRoZSBkcmFmdCDigJQgZ28gc3RyYWlnaHQgdG8gY3JpdGlxdWUiLCBpY29uOiLimpYifQogIF07CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N3cmFwJykuaW5uZXJIVE1MPXBlcnNvbmFzLm1hcChwPT5gPGRpdiBjbGFzcz0icGVyc29uYSIKICAgIG9uY2xpY2s9ImFsZXJ0KCdMaXZlIGJ1aWxkOiBzdGFydHMgYSBGaXJzdCBDcmFjayBpbiAke3Aud2hvLnJlcGxhY2UoLycvZywnJyl9XFwncyB2b2ljZSwgdGhlbiBmaWxlcyBpdCBmb3IgdGhlIFJldmlldyBCb2FyZC4gKE1vY2t1cCknKSI+CiAgICA8ZGl2IGNsYXNzPSJ3aG8iPiR7cC5pY29ufSAke3Aud2hvfTwvZGl2PjxkaXYgY2xhc3M9InJvbGUiPiR7cC5yb2xlfTwvZGl2PgogICAgPHNwYW4gY2xhc3M9ImdvIj7ilrYgVGFrZSB0aGUgZmlyc3QgY3JhY2s8L3NwYW4+PC9kaXY+YCkuam9pbignJyk7CgogIC8vIC0tLS0tLS0tLS0gdGFicyAtLS0tLS0tLS0tCiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYicpLmZvckVhY2godD0+e3Qub25jbGljaz0oKT0+ewogICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYicpLmZvckVhY2goeD0+eC5jbGFzc0xpc3QucmVtb3ZlKCdvbicpKTsKICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWMnKS5mb3JFYWNoKHg9PnguY2xhc3NMaXN0LnJlbW92ZSgnb24nKSk7CiAgICB0LmNsYXNzTGlzdC5hZGQoJ29uJyk7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodC5kYXRhc2V0LnQpLmNsYXNzTGlzdC5hZGQoJ29uJyk7CiAgICB3aW5kb3cuc2Nyb2xsVG8oe3RvcDowLGJlaGF2aW9yOidzbW9vdGgnfSk7CiAgfTt9KTsKCiAgLy8gPT09PT09PT09PT09PT09PT0gRU5HSU5FID09PT09PT09PT09PT09PT09CiAgY29uc3QgTlM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgQ1g9MjQwLCBDWT0yNDA7CiAgY29uc3QgRkNfQkFTRT0wLjAyMCwgRkxPT1I9MC4wMzAsIFRVUk49MC4xNSwgUkVETElORV9CQVNFPTAuNzAsIEZSRUVaRT0xLjAsIEtJQ0s9MC4xMjsKICBjb25zdCBTSElQX0RSQUc9MC4wMjAsIFBFUlNPTl9JTVA9MC4wMTIsIEZMT09SX0JPTlVTPTAuMjU7CiAgY29uc3QgQkFTRT02MDAwMCwgREVDQVk9MC44MCwgRkxPT1JUT0s9NTAwMDsKICBjb25zdCBDT0w9e2ZjOicjMDBlNWZmJyxyYjonI2IxNGJmZicsc3A6JyNmZjNkZjAnLGxsOicjMjhlMGEwJ307CiAgY29uc3QgU1ROPVsnZmMnLCdyYicsJ3NwJywnbGwnXTsKICBjb25zdCBTVEFUSU9OUz1bCiAgICB7aWQ6J2ZjJyxuYW1lOidTUFJJTlQgU1RBUlQnLGFuZzowLGRlc2M6J0lnbml0aW9uIC8gcG93ZXIgc3Ryb2tlLiBQcmVzcyB0byBraWNrIG9mZiBhIG9uZS13ZWVrIHNwcmludDsgYW4gQUkgdGFrZXMgdGhlIGZpcnN0IGNyYWNrLCBhZGRpbmcgZW5lcmd5IHRvIHRoZSB3aGVlbC4nfSwKICAgIHtpZDoncmInLG5hbWU6J1JFVklFVycsYW5nOjkwLGRlc2M6J0NvbXByZXNzaW9uIHN0cm9rZS4gRWFjaCBhcm1lZCBRQSBjaGVja3BvaW50IHN1YnRyYWN0cyBhIG9uZS10aW1lIGltcHVsc2Ugd2hlbiB0aGUgbGFzZXIgaGl0cyBpdC4nfSwKICAgIHtpZDonc3AnLG5hbWU6J1NISVAgKGRyYWcpJyxhbmc6MTgwLGRlc2M6J0V4aGF1c3Qgc3Ryb2tlLiBSZWxlYXNpbmcgd29yayBoYXMgb3ZlcmhlYWQsIHNvIGl0IHN0YXJ0cyBhcyBhIGRyYWc7IHBlb3BsZSAoc2NhbGFiaWxpdHkpIHR1cm4gaXQgaW50byB0aHJvdWdocHV0Lid9LAogICAge2lkOidsbCcsbmFtZTonTEVTU09OUycsYW5nOjI3MCxkZXNjOidJbnRha2Ugc3Ryb2tlLiBSZWNvbmNpbGUgYW5kIGdyb29tIHdoYXQgeW91IGxlYXJuZWQ7IGJhbmtlZCBrbm93bGVkZ2UgYmVjb21lcyBwZXJtYW5lbnQgbW9tZW50dW0uJ30KICBdOwogIGNvbnN0IE1PRFM9ewogICAgZmM6W3tpZDondG9vbHMnLG5hbWU6J1Rvb2xzJyxpbXA6MC4wMTIsdW5sb2NrOjEsZGVzYzonTGludGVycywgZ2VuZXJhdG9ycywgc2NhZmZvbGRzIOKAlCBjaGVhcCByZXVzYWJsZSBwb3dlciB0aGF0IGJvb3N0cyBlYWNoIGZpcnN0IGNyYWNrLid9LAogICAgICAgIHtpZDondGVtcGxhdGVzJyxuYW1lOidUZW1wbGF0ZXMnLGltcDowLjAxNSx1bmxvY2s6MyxkZXNjOidQcm92ZW4gbGF5b3V0cyBhbmQgcGF0dGVybnMgdG8gc3RhcnQgZnJvbSBpbnN0ZWFkIG9mIGEgYmxhbmsgcGFnZS4nfSwKICAgICAgICB7aWQ6J2d1aWRhbmNlJyxuYW1lOidHdWlkYW5jZScsaW1wOjAuMDE4LHVubG9jazo2LGRlc2M6J1N0ZWVyaW5nIGRvY3MgKENMQVVERS5tZCwgaG91c2UgcnVsZXMpIHRoYXQgYWltIHRoZSB3b3JrIGJlZm9yZSBpdCBzdGFydHMuJ30sCiAgICAgICAge2lkOidiYW5rZWQnLG5hbWU6J0JhbmtlZCcsaW1wOjAuMDEyLHVubG9jazoxMCxkZXNjOidUaGUgTGVzc29ucyBsaWJyYXJ5IGl0c2VsZiwgYXV0by1hcHBsaWVkIHRvIHByZS1lbXB0IGtub3duIG1pc3Rha2VzLid9XSwKICAgIHJiOlt7aWQ6J3NlYycsbmFtZTonU2VjdXJpdHknLGRyYWc6MC4wMjUsZGVzYzonV2hvIGNhbiBzZWUgdGhpcz8gV2hhdCBpcyBleHBvc2VkPyBJbmplY3Rpb24gLyBzZWNyZXQtbGVhayByaXNrcyBhbmQgdGhlaXIgbWl0aWdhdGlvbnMuJ30sCiAgICAgICAge2lkOidpbnRlcm9wJyxuYW1lOidJbnRlcm9wJyxkcmFnOjAuMDEyLGRlc2M6J0ludGVyb3BlcmFiaWxpdHkg4oCUIGRvZXMgaXQgcGxheSBuaWNlbHkgd2l0aCB0aGUgcmVzdCBvZiB0aGUgc3lzdGVtIChBUElzLCBmb3JtYXRzLCBleGlzdGluZyBjb21wb25lbnRzKT8nfSwKICAgICAgICB7aWQ6J3VpJyxuYW1lOidVSScsZHJhZzowLjAxMixkZXNjOidJcyB0aGUgaW50ZXJmYWNlIGNsZWFyLCBjb25zaXN0ZW50IGFuZCB1c2FibGUg4oCUIGZld2VzdCBjbGlja3MsIHdhcm1lc3QgcGF0aD8nfSwKICAgICAgICB7aWQ6J2RiJyxuYW1lOidEYXRhYmFzZScsZHJhZzowLjAxOCxkZXNjOidJcyB0aGUgZGF0YSBtb2RlbCBzb3VuZCDigJQgc2NoZW1hLCBhZGRpdGl2ZSBtaWdyYXRpb25zLCBzYWZlIHF1ZXJpZXMsIG5vdGhpbmcgd2lwZWQ/J30sCiAgICAgICAge2lkOidhcmNoJyxuYW1lOidBcmNoaXRlY3QnLGRyYWc6MC4wMjUsZGVzYzonRG9lcyB0aGUgb3ZlcmFsbCBzdHJ1Y3R1cmUgaG9sZCB1cCDigJQgc2VwYXJhdGlvbiBvZiBjb25jZXJucywgc2NhbGFiaWxpdHksIG5vIGJyaXR0bGUgY291cGxpbmc/J30sCiAgICAgICAge2lkOidyZWFkJyxuYW1lOidSZWFkYWJpbGl0eScsZHJhZzowLjAwOCxkZXNjOidSaWdodCByZWFkaW5nIGxldmVsIGFuZCBhc3N1bWVkIGV4cGVydGlzZSBmb3IgdGhlIGFjdHVhbCBhdWRpZW5jZS4nfSwKICAgICAgICB7aWQ6J2NpdGUnLG5hbWU6J0NpdGF0aW9uJyxkcmFnOjAuMDE4LGRlc2M6J0NvcnJlY3RuZXNzICYgY2l0YXRpb24gc291cmNpbmcg4oCUIGFyZSBjbGFpbXMgY29ycmVjdCBhbmQgc291cmNlZCwgdmVyaWZpZWQgYmVmb3JlIGFzc2VydGVkIGFzIGZhY3Q/J30sCiAgICAgICAge2lkOidkZWxpZ2h0JyxuYW1lOidDbGllbnQgRGVsaWdodCcsZHJhZzowLjAxMixkZXNjOidEb2VzIGl0IGFjdGl2ZWx5IGRlbGlnaHQgdGhlIHJlYWwgdXNlciwgbm90IGp1c3QgYmFyZWx5IHNhdGlzZnkgdGhlbT8gRnJpY3Rpb24gaXMgYSBidWcuJ31dLAogICAgc3A6W3tpZDonZmFpbGZhc3QnLG5hbWU6J0Zhc3QtZmFpbCcscmVkOjAuMjUsaW1wOjAuMDEwLGRlc2M6J0NhdGNoIGJyZWFrYWdlIGNoZWFwbHkgYW5kIGVhcmx5IHNvIGl0IGlzIHNhZmUgdG8gcmV2IGhpZ2hlci4nfSwKICAgICAgICB7aWQ6J2JsdWVncmVlbicsbmFtZTonQmx1ZS9HcmVlbicscmVkOjAuMzAsaW1wOjAuMDEwLGRlc2M6J1plcm8tZG93bnRpbWUgZGVwbG95cyAoc3dhcCB0d28gZW52aXJvbm1lbnRzKSDihpIgaGlnaGVyIHNhZmUgcmVkbGluZSwgc29mdGVyIGNyYXNoZXMuJ31dLAogICAgbGw6W3tpZDoncmVjb25jaWxlJyxuYW1lOidSZWNvbmNpbGUnLGltcDowLjAwOCxkZXNjOidGb2xkIHdoYXQgYWN0dWFsbHkgaGFwcGVuZWQgYmFjayBpbnRvIHRoZSBLQjsgZ2l2ZXMgdGhlIG5leHQgaWduaXRpb24gYSBzbWFsbCBmcmVlIHB1c2guJ30sCiAgICAgICAge2lkOidncm9vbScsbmFtZTonR3Jvb20gS0InLGRlc2M6J01lcmdlIGR1cGxpY2F0ZXMsIHJldGlyZSBzdGFsZSBsZXNzb25zIOKAlCBrZWVwcyB0aGUgbGlicmFyeSBsZWFuIHNvIGNvc3QvcHJvZHVjdCBrZWVwcyBmYWxsaW5nLid9XQogIH07CiAgY29uc3QgY2ZnPXtmYzp7fSxyYjp7fSxzcDp7fSxsbDp7fX07CiAgWydmYycsJ3JiJywnc3AnLCdsbCddLmZvckVhY2goZz0+e3RyeXtPYmplY3QuYXNzaWduKGNmZ1tnXSxKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmd2NmZ18nK2cpfHwne30nKSk7fWNhdGNoKGUpe319KTsKICBmdW5jdGlvbiBzYXZlQ2ZnKGcpe2xvY2FsU3RvcmFnZS5zZXRJdGVtKCdmd2NmZ18nK2csSlNPTi5zdHJpbmdpZnkoY2ZnW2ddKSk7fQogIGNvbnN0IHR1bmU9e3JlZmluZTowLGxsZWZmOjAscGVvcGxlOjAsYmFua2VkOjB9OwogIHRyeXtPYmplY3QuYXNzaWduKHR1bmUsSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZnd0dW5lJyl8fCd7fScpKTt9Y2F0Y2goZSl7fQogIGZ1bmN0aW9uIHNhdmVUdW5lKCl7bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2Z3dHVuZScsSlNPTi5zdHJpbmdpZnkodHVuZSkpO30KCiAgbGV0IHRvdGFsRGVnPTAsIHJwcz0wLCBmaXJlZFN0ZXBzPTAsIHByb2R1Y3RzPTAsIGJvb21zPTAsIGxhc3RUb2s9MCwga2JEcmFnPTAsIHJ1bm5pbmc9ZmFsc2UsIGxhc3Q9MCwgcmFmPW51bGwsIGJ1c3k9ZmFsc2U7CgogIGZ1bmN0aW9uIHVubG9ja2VkKG0pe3JldHVybiBwcm9kdWN0cz49KG0udW5sb2NrfHwwKTt9CiAgZnVuY3Rpb24gaW1wdWxzZSgpe2xldCB2PUZDX0JBU0U7TU9EUy5mYy5mb3JFYWNoKG09PntpZihjZmcuZmNbbS5pZF0mJnVubG9ja2VkKG0pKXYrPW0uaW1wO30pO3JldHVybiB2KigxK3R1bmUucmVmaW5lKTt9CiAgZnVuY3Rpb24gcmV2aWV3RHJhZygpe2xldCB2PTA7TU9EUy5yYi5mb3JFYWNoKG09PntpZihjZmcucmJbbS5pZF0pdis9bS5kcmFnO30pO3JldHVybiB2KigxLTAuNyp0dW5lLmxsZWZmKTt9CiAgZnVuY3Rpb24gcmVkbGluZSgpe2xldCB2PVJFRExJTkVfQkFTRTtNT0RTLnNwLmZvckVhY2gobT0+e2lmKGNmZy5zcFttLmlkXSl2Kz1tLnJlZDt9KTtyZXR1cm4gdjt9CiAgZnVuY3Rpb24gc2hpcE5ldCgpe2xldCB2PS1TSElQX0RSQUc7TU9EUy5zcC5mb3JFYWNoKG09PntpZihjZmcuc3BbbS5pZF0pdis9bS5pbXA7fSk7dis9dHVuZS5wZW9wbGUqUEVSU09OX0lNUDtyZXR1cm4gdjt9CiAgZnVuY3Rpb24gZmxvb3JFZmYoKXtyZXR1cm4gRkxPT1IgKyB0dW5lLmJhbmtlZCpGTE9PUl9CT05VUzt9CgogIGZ1bmN0aW9uIGVsKHQsYSl7Y29uc3QgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoTlMsdCk7Zm9yKGNvbnN0IGsgaW4gYSllLnNldEF0dHJpYnV0ZShrLGFba10pO3JldHVybiBlO30KICBmdW5jdGlvbiBQKGFuZyxyKXtjb25zdCBhPWFuZypNYXRoLlBJLzE4MDtyZXR1cm4gW0NYK3IqTWF0aC5zaW4oYSksIENZLXIqTWF0aC5jb3MoYSldO30KCiAgY29uc3QgREFZUz1bJ01PTicsJ1RVRScsJ1dFRCcsJ1RIVScsJ0ZSSSddOwogIGNvbnN0IGJlemVsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiZXplbCcpOwogIERBWVMuZm9yRWFjaCgoZCxpKT0+ewogICAgY29uc3QgYW5nPWkqNzIsIFt0eCx0eV09UChhbmcsMTk2KTsKICAgIGJlemVsLmFwcGVuZENoaWxkKGVsKCdsaW5lJyx7eDE6UChhbmcsMTg2KVswXSx5MTpQKGFuZywxODYpWzFdLHgyOlAoYW5nLDIwNilbMF0seTI6UChhbmcsMjA2KVsxXSxzdHJva2U6J3JnYmEoMCwyMjksMjU1LC40KScsJ3N0cm9rZS13aWR0aCc6MS41fSkpOwogICAgY29uc3QgdD1lbCgndGV4dCcse3g6dHgseTp0eSs0LCd0ZXh0LWFuY2hvcic6J21pZGRsZScsJ2NsYXNzJzonZGF5bGJsJ30pOyB0LnRleHRDb250ZW50PWQ7IGJlemVsLmFwcGVuZENoaWxkKHQpOwogIH0pOwoKICBjb25zdCBzdGF0aW9uc0c9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXRpb25zJyk7IGNvbnN0IHN0bkVscz17fTsKICBTVEFUSU9OUy5mb3JFYWNoKHM9PnsKICAgIGNvbnN0IFt4LHldPVAocy5hbmcsMTE4KTsKICAgIGNvbnN0IGc9ZWwoJ2cnLHt9KTsKICAgIGNvbnN0IGM9ZWwoJ2NpcmNsZScse2N4OngsY3k6eSxyOjksZmlsbDonIzA3MGMxOCcsc3Ryb2tlOkNPTFtzLmlkXSwnc3Ryb2tlLXdpZHRoJzoyfSk7CiAgICBjb25zdCBbbHgsbHldPVAocy5hbmcsMTQwKTsKICAgIGNvbnN0IHNpbnY9TWF0aC5zaW4ocy5hbmcqTWF0aC5QSS8xODApOwogICAgY29uc3QgYW5jaG9yPSBzaW52PjAuMz8nc3RhcnQnOihzaW52PC0wLjM/J2VuZCc6J21pZGRsZScpOwogICAgY29uc3QgdD1lbCgndGV4dCcse3g6bHgseTpseSs0LCd0ZXh0LWFuY2hvcic6YW5jaG9yLCdjbGFzcyc6J3N0bmxibCd9KTsgdC50ZXh0Q29udGVudD1zLm5hbWU7CiAgICBjb25zdCB0aT1lbCgndGl0bGUnLHt9KTsgdGkudGV4dENvbnRlbnQ9cy5kZXNjfHxzLm5hbWU7IGcuYXBwZW5kQ2hpbGQodGkpOwogICAgZy5hcHBlbmRDaGlsZChjKTsgZy5hcHBlbmRDaGlsZCh0KTsgc3RhdGlvbnNHLmFwcGVuZENoaWxkKGcpOwogICAgc3RuRWxzW3MuaWRdPXtjaXJjbGU6YyxsYWJlbDp0fTsKICB9KTsKCiAgY29uc3QgbW9kc0c9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZHMnKTsgY29uc3QgbW9kRWxzPXt9OwogIGNvbnN0IFNQUkVBRD17ZmM6MTUscmI6MTEsc3A6MTYsbGw6MTh9OwogIFNUQVRJT05TLmZvckVhY2gocz0+ewogICAgY29uc3QgbGlzdD1NT0RTW3MuaWRdLCBuPWxpc3QubGVuZ3RoLCBzdGVwPVNQUkVBRFtzLmlkXTsKICAgIGxpc3QuZm9yRWFjaCgobSxpKT0+ewogICAgICBjb25zdCBhbmc9cy5hbmcrKGktKG4tMSkvMikqc3RlcDsKICAgICAgY29uc3QgW2R4LGR5XT1QKGFuZywxNTApOwogICAgICBjb25zdCBzaW52PU1hdGguc2luKGFuZypNYXRoLlBJLzE4MCk7CiAgICAgIGNvbnN0IGFuY2hvcj0gc2ludj4wLjI1PydzdGFydCc6KHNpbnY8LTAuMjU/J2VuZCc6J21pZGRsZScpOwogICAgICBjb25zdCBbbHgsbHldPVAoYW5nLDE3MCk7CiAgICAgIGNvbnN0IGc9ZWwoJ2cnLHsnY2xhc3MnOidtb2R0b2cnLCdkYXRhLWcnOnMuaWQsJ2RhdGEtaWQnOm0uaWR9KTsKICAgICAgY29uc3QgYz1lbCgnY2lyY2xlJyx7Y3g6ZHgsY3k6ZHkscjo2LjUsZmlsbDonIzA3MGMxOCcsc3Ryb2tlOkNPTFtzLmlkXSwnc3Ryb2tlLXdpZHRoJzoyfSk7CiAgICAgIGNvbnN0IHQ9ZWwoJ3RleHQnLHt4Omx4LHk6bHkrMywndGV4dC1hbmNob3InOmFuY2hvciwnY2xhc3MnOidtb2RsYmwnfSk7CiAgICAgIGNvbnN0IHRpPWVsKCd0aXRsZScse30pOyB0aS50ZXh0Q29udGVudD1tLm5hbWUrJyDigJQgJysobS5kZXNjfHwnJyk7IGcuYXBwZW5kQ2hpbGQodGkpOwogICAgICBnLmFwcGVuZENoaWxkKGMpOyBnLmFwcGVuZENoaWxkKHQpOyBtb2RzRy5hcHBlbmRDaGlsZChnKTsKICAgICAgbW9kRWxzW3MuaWQrJ18nK20uaWRdPXtnLGNpcmNsZTpjLGxhYmVsOnQsbW9kOm0sc3Ryb2tlOnMuaWR9OwogICAgfSk7CiAgfSk7CiAgZnVuY3Rpb24gbW9kVmFsU3RyKHN0cm9rZSxtKXsKICAgIGlmKHN0cm9rZT09PSdmYycpIHJldHVybiB1bmxvY2tlZChtKT8oJysnK20uaW1wLnRvRml4ZWQoMykpOign8J+UkicrbS51bmxvY2spOwogICAgaWYoc3Ryb2tlPT09J3JiJykgcmV0dXJuICfiiJInK20uZHJhZy50b0ZpeGVkKDMpOwogICAgaWYoc3Ryb2tlPT09J3NwJykgcmV0dXJuICdSTCsnK20ucmVkLnRvRml4ZWQoMik7CiAgICByZXR1cm4gbS5pbXA/KCcrJyttLmltcC50b0ZpeGVkKDMpKTonY29zdOKGkyc7CiAgfQogIGZ1bmN0aW9uIHBhaW50TW9kcygpewogICAgT2JqZWN0LnZhbHVlcyhtb2RFbHMpLmZvckVhY2gobz0+ewogICAgICBjb25zdCBvbj0hIWNmZ1tvLnN0cm9rZV1bby5tb2QuaWRdOwogICAgICBjb25zdCBsb2NrZWQ9by5zdHJva2U9PT0nZmMnJiYhdW5sb2NrZWQoby5tb2QpOwogICAgICBvLmcuY2xhc3NMaXN0LnRvZ2dsZSgnbG9ja2VkJyxsb2NrZWQpOwogICAgICBvLmNpcmNsZS5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBvbiYmIWxvY2tlZD9DT0xbby5zdHJva2VdOicjMDcwYzE4Jyk7CiAgICAgIG8uY2lyY2xlLnNldEF0dHJpYnV0ZSgncicsIG9uJiYhbG9ja2VkPzcuNTo2LjUpOwogICAgICBvLmxhYmVsLnRleHRDb250ZW50PW8ubW9kLm5hbWUrJyAnK21vZFZhbFN0cihvLnN0cm9rZSxvLm1vZCk7CiAgICB9KTsKICB9CiAgbW9kc0cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGU9PnsKICAgIGNvbnN0IGc9ZS50YXJnZXQuY2xvc2VzdCgnLm1vZHRvZycpOyBpZighZ3x8Zy5jbGFzc0xpc3QuY29udGFpbnMoJ2xvY2tlZCcpKXJldHVybjsKICAgIGNvbnN0IHN0PWcuZ2V0QXR0cmlidXRlKCdkYXRhLWcnKSwgaWQ9Zy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKTsKICAgIGNmZ1tzdF1baWRdPSFjZmdbc3RdW2lkXTsgc2F2ZUNmZyhzdCk7IHBhaW50TW9kcygpOyByZWZyZXNoKCk7CiAgfSk7CgogIC8vIC0tLS0tLS0tLS0gSFVEIC0tLS0tLS0tLS0KICBjb25zdCBzbm93PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbm93JyksIHJwc0VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdycHMnKSwgdGZpbGw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RmaWxsJyksCiAgICAgICAgbXByb2Q9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wcm9kJyksIG10b2s9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ210b2snKSwgbWNwcD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWNwcCcpLAogICAgICAgIG1ib29tPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYm9vbScpLCB0b2FzdD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKSwgYm9vbUJhZGdlPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29tJyksCiAgICAgICAgd2hlZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3doZWVsJyksIHN0YWdlPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFnZScpOwogIGNvbnN0IE5BTUU9e2ZjOidTUFJJTlQgU1RBUlQgwrcgSUdOSVRJT04nLHJiOidSRVZJRVcgwrcg4oiSSU1QVUxTRScsc3A6J1NISVAgwrcgRFJBRyAoK3Blb3BsZSBzY2FsZSBpdCknLGxsOidMRVNTT05TIMK3IElOVEFLRSd9OwogIGZ1bmN0aW9uIHJlZnJlc2goKXsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdybCcpLnRleHRDb250ZW50PXJlZGxpbmUoKS50b0ZpeGVkKDIpOwogICAgY29uc3Qgc249c2hpcE5ldCgpLCBuZXQ9aW1wdWxzZSgpLXJldmlld0RyYWcoKStzbisoY2ZnLmxsLnJlY29uY2lsZT9NT0RTLmxsWzBdLmltcDowKTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdodWRzdW0nKS5pbm5lckhUTUw9J0lnbml0aW9uIDxiIHN0eWxlPSJjb2xvcjp2YXIoLS1jeWFuKSI+KycraW1wdWxzZSgpLnRvRml4ZWQoMykrCiAgICAgICc8L2I+IMK3IFJldmlldyA8YiBzdHlsZT0iY29sb3I6dmFyKC0tY3JpbXNvbikiPuKIkicrcmV2aWV3RHJhZygpLnRvRml4ZWQoMykrJy9oaXQ8L2I+PGJyPicrCiAgICAgICdTaGlwIDxiIHN0eWxlPSJjb2xvcjonKyhzbj49MD8ndmFyKC0tb2spJzondmFyKC0tY3JpbXNvbiknKSsnIj4nKyhzbj49MD8nKyc6JycpK3NuLnRvRml4ZWQoMykrKHNuPDA/JyAoZHJhZyknOicnKSsnPC9iPiDCtyBSZWRsaW5lIDxiIHN0eWxlPSJjb2xvcjp2YXIoLS12aW9sZXQpIj4nK3JlZGxpbmUoKS50b0ZpeGVkKDIpKwogICAgICAnPC9iPiDCtyBGbG9vciA8YiBzdHlsZT0iY29sb3I6dmFyKC0tb2spIj4nK2Zsb29yRWZmKCkudG9GaXhlZCgyKSsnPC9iPjxicj4nKwogICAgICAnTmV0L3R1cm4gPGIgc3R5bGU9ImNvbG9yOicrKG5ldD49MD8ndmFyKC0tb2spJzondmFyKC0tY3JpbXNvbiknKSsnIj4nKyhuZXQ+PTA/JysnOicnKStuZXQudG9GaXhlZCgzKSsnPC9iPic7CiAgICB1cGRhdGVUdW5lT3V0KCk7CiAgfQogIGZ1bmN0aW9uIGxpZ2h0KGlkLGxhYmVsKXsKICAgIFNUTi5mb3JFYWNoKHM9PntzdG5FbHNbc10ubGFiZWwuY2xhc3NMaXN0LnRvZ2dsZSgnaG90JyxzPT09aWQpOwogICAgICBzdG5FbHNbc10uY2lyY2xlLnNldEF0dHJpYnV0ZSgnZmlsbCcsIHM9PT1pZD9DT0xbc106JyMwNzBjMTgnKTsKICAgICAgc3RuRWxzW3NdLmNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3InLCBzPT09aWQ/MTI6OSk7fSk7CiAgICBzbm93LnRleHRDb250ZW50PWxhYmVsOwogIH0KICBmdW5jdGlvbiBkZWxpdmVyKCl7CiAgICBwcm9kdWN0cysrOyBtcHJvZC50ZXh0Q29udGVudD1wcm9kdWN0czsKICAgIGlmKCFjZmcubGwuZ3Jvb20pIGtiRHJhZz1NYXRoLm1pbigwLjA2LCBrYkRyYWcrMC4wMDQpOwogICAgY29uc3QgZmxvb3JUb2s9RkxPT1JUT0sqKDEra2JEcmFnKjE4KTsKICAgIGxhc3RUb2s9TWF0aC5yb3VuZChCQVNFKk1hdGgucG93KERFQ0FZLHByb2R1Y3RzLTEpK2Zsb29yVG9rKTsKICAgIG10b2sudGV4dENvbnRlbnQ9KGxhc3RUb2svMTAwMCkudG9GaXhlZCgxKSsnayc7IG1jcHAudGV4dENvbnRlbnQ9KGxhc3RUb2svMTAwMCkudG9GaXhlZCgxKSsnayc7CiAgICBwYWludE1vZHMoKTsKICB9CiAgZnVuY3Rpb24gZmlyZVN0YXRpb24oaWR4KXsKICAgIGNvbnN0IGlkPVNUTltpZHhdOyBsZXQgbGFiZWw9TkFNRVtpZF07CiAgICBpZihpZD09PSdmYycpIHJwcys9aW1wdWxzZSgpOwogICAgZWxzZSBpZihpZD09PSdyYicpe2NvbnN0IGQ9cmV2aWV3RHJhZygpOyBycHM9TWF0aC5tYXgoZmxvb3JFZmYoKSxycHMtZCk7IGxhYmVsPSdSRVZJRVcgwrcg4oiSJytkLnRvRml4ZWQoMykrJyBpbXB1bHNlJzt9CiAgICBlbHNlIGlmKGlkPT09J3NwJyl7Y29uc3Qgcz1zaGlwTmV0KCk7IHJwcz1NYXRoLm1heChmbG9vckVmZigpLHJwcytzKTsgbGFiZWw9J1NISVAgwrcgJysocz49MD8nKyc6JycpK3MudG9GaXhlZCgzKSsoczwwPycgKGRyYWcpJzonIHNjYWxlZCcpO30KICAgIGVsc2UgaWYoaWQ9PT0nbGwnKXsgaWYoY2ZnLmxsLnJlY29uY2lsZSkgcnBzKz1NT0RTLmxsWzBdLmltcDsgZGVsaXZlcigpOyB9CiAgICBsaWdodChpZCxsYWJlbCk7CiAgfQogIGZ1bmN0aW9uIGZsYXNoKG0peyB0b2FzdC50ZXh0Q29udGVudD1tOyB0b2FzdC5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7IGNsZWFyVGltZW91dChmbGFzaC5fdCk7IGZsYXNoLl90PXNldFRpbWVvdXQoKCk9PnRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKSwzMDAwKTsgfQogIGZ1bmN0aW9uIGJsb3dBcGFydCgpewogICAgYm9vbXMrKzsgbWJvb20udGV4dENvbnRlbnQ9Ym9vbXM7IGJ1c3k9dHJ1ZTsKICAgIHdoZWVsLmNsYXNzTGlzdC5hZGQoJ2Jvb20nKTsgc3RhZ2UuY2xhc3NMaXN0LmFkZCgnc2hha2UnKTsgYm9vbUJhZGdlLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTsKICAgIGZsYXNoKCdPdmVyLXJldnZlZCDihpIgYmxldyBhcGFydC4gU2hpcHBlZCBmYXN0ZXIgdGhhbiBRQSBjb3VsZCBob2xkOyBhIHRlYW1tYXRlIGlzIGxvc3QsIGEgbmV3IHBhcnQgbXVzdCBiZSBpbnRlZ3JhdGVkLicpOwogICAgc2V0VGltZW91dCgoKT0+eyB3aGVlbC5jbGFzc0xpc3QucmVtb3ZlKCdib29tJyk7IHN0YWdlLmNsYXNzTGlzdC5yZW1vdmUoJ3NoYWtlJyk7IGJvb21CYWRnZS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7CiAgICAgIHJwcz1mbG9vckVmZigpKzAuMDU7IGJ1c3k9ZmFsc2U7IH0sIDExMDApOwogIH0KICBmdW5jdGlvbiByZXNldCgpewogICAgcnVubmluZz1mYWxzZTsgYnVzeT1mYWxzZTsgaWYocmFmKWNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZik7CiAgICB0b3RhbERlZz0wOyBycHM9MDsgZmlyZWRTdGVwcz0wOyBwcm9kdWN0cz0wOyBib29tcz0wOyBsYXN0VG9rPTA7IGtiRHJhZz0wOwogICAgd2hlZWwucmVtb3ZlQXR0cmlidXRlKCd0cmFuc2Zvcm0nKTsgd2hlZWwuY2xhc3NMaXN0LnJlbW92ZSgnYm9vbScpOyBzdGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdzaGFrZScpOyBib29tQmFkZ2UuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpOwogICAgU1ROLmZvckVhY2gocz0+e3N0bkVsc1tzXS5sYWJlbC5jbGFzc0xpc3QucmVtb3ZlKCdob3QnKTtzdG5FbHNbc10uY2lyY2xlLnNldEF0dHJpYnV0ZSgnZmlsbCcsJyMwNzBjMTgnKTtzdG5FbHNbc10uY2lyY2xlLnNldEF0dHJpYnV0ZSgncicsOSk7fSk7CiAgICBzbm93LnRleHRDb250ZW50PSdyZWFkeSDigJQgZGVhZCBzdG9wJzsgcnBzRWwudGV4dENvbnRlbnQ9JzAuMDAnOyB0ZmlsbC5zdHlsZS53aWR0aD0nMCc7CiAgICBtcHJvZC50ZXh0Q29udGVudD0nMCc7IG10b2sudGV4dENvbnRlbnQ9J+KAlCc7IG1jcHAudGV4dENvbnRlbnQ9J+KAlCc7IG1ib29tLnRleHRDb250ZW50PScwJzsKICAgIHBhaW50TW9kcygpOyByZWZyZXNoKCk7CiAgfQogIGZ1bmN0aW9uIGxvb3AodHMpewogICAgaWYoIXJ1bm5pbmcpcmV0dXJuOwogICAgaWYoIWxhc3QpbGFzdD10czsgY29uc3QgZHQ9TWF0aC5taW4oKHRzLWxhc3QpLzEwMDAsLjA1KTsgbGFzdD10czsKICAgIGlmKCFidXN5KXsKICAgICAgaWYodG90YWxEZWc+MCkgcnBzPU1hdGgubWF4KHJwcyxmbG9vckVmZigpKTsgICAvLyBCYW5rZWQgS25vd2xlZGdlID0gcGVybWFuZW50IG1vbWVudHVtIGZsb29yCiAgICAgIHRvdGFsRGVnKz1ycHMqMzYwKmR0OwogICAgICBjb25zdCBzdGVwcz1NYXRoLmZsb29yKHRvdGFsRGVnLzkwKTsKICAgICAgd2hpbGUoZmlyZWRTdGVwczxzdGVwcyl7IGZpcmVkU3RlcHMrKzsgZmlyZVN0YXRpb24oZmlyZWRTdGVwcyU0KTsgfQogICAgICBpZihycHM+cmVkbGluZSgpKSBibG93QXBhcnQoKTsKICAgIH0KICAgIHdoZWVsLnNldEF0dHJpYnV0ZSgndHJhbnNmb3JtJywncm90YXRlKCcrKHRvdGFsRGVnJTM2MCkrJyAnK0NYKycgJytDWSsnKScpOwogICAgcnBzRWwudGV4dENvbnRlbnQ9cnBzLnRvRml4ZWQoMik7CiAgICBjb25zdCBybD1yZWRsaW5lKCk7CiAgICB0ZmlsbC5zdHlsZS53aWR0aD1NYXRoLm1pbigxMDAsKHJwcy9ybCkqMTAwKSsnJSc7CiAgICB0ZmlsbC5zdHlsZS5iYWNrZ3JvdW5kID0gcnBzPnJsKjAuODUgPyAndmFyKC0tY3JpbXNvbiknIDogKHJwcz49RlJFRVpFPyd2YXIoLS12aW9sZXQpJzondmFyKC0tY3lhbiknKTsKICAgIHJhZj1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7CiAgfQogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaXJlJykub25jbGljaz0oKT0+ewogICAgaWYoIXJ1bm5pbmcpeyBydW5uaW5nPXRydWU7IGxhc3Q9MDsgcnBzKz1LSUNLOyBmaXJlU3RhdGlvbigwKTsgcmFmPXJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTsgfQogICAgZWxzZSB7IHJwcys9S0lDSzsgZmlyZVN0YXRpb24oMCk7IH0KICAgIGZsYXNoKCdTcHJpbnQgU3RhcnQg4oaSIGlnbml0aW9uIGZpcmVzICgrJytpbXB1bHNlKCkudG9GaXhlZCgzKSsnIGltcHVsc2UpLicpOwogIH07CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3R1cm4nKS5vbmNsaWNrPSgpPT57IGlmKCFydW5uaW5nKXJldHVybjsKICAgIHJwcz1NYXRoLm1heChmbG9vckVmZigpLCBycHMtVFVSTik7CiAgICBmbGFzaCgnUmVzb3VyY2UgdHVybm92ZXI6IGxvc3QgYSB0ZWFtbWF0ZSwgaW50ZWdyYXRpbmcgYSBuZXcgcGFydC4g4oiSJytUVVJOLnRvRml4ZWQoMikrJywgYnV0IHRoZSB3aGVlbCBrZWVwcyB0dXJuaW5nLicpOyB9OwogIGNvbnN0IGRlZXBlckJ0bj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVlcGVyJyk7CiAgZGVlcGVyQnRuLm9uY2xpY2s9KCk9PnsKICAgIGNvbnN0IHNob3c9bW9kc0cuc3R5bGUuZGlzcGxheT09PSdub25lJzsgbW9kc0cuc3R5bGUuZGlzcGxheT1zaG93PycnOidub25lJzsKICAgIGRlZXBlckJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdvbicsc2hvdyk7CiAgICBmbGFzaChzaG93PydEZWVwZXIgQW5hbHlzaXMgb24g4oCUIGNsaWNrIGEgZG90IHRvIGFybSBhIG1vZGlmaWVyLic6J0RlZXBlciBBbmFseXNpcyBvZmYuJyk7CiAgfTsKICBjb25zdCB0dW5lckJ0bj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHVuZXInKSwgdHVuZVBhbmVsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0dW5lJyk7CiAgdHVuZXJCdG4ub25jbGljaz0oKT0+ewogICAgY29uc3Qgc2hvdz10dW5lUGFuZWwuc3R5bGUuZGlzcGxheSE9PSdibG9jayc7IHR1bmVQYW5lbC5zdHlsZS5kaXNwbGF5PXNob3c/J2Jsb2NrJzonbm9uZSc7CiAgICB0dW5lckJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdvbicsc2hvdyk7CiAgICBpZihzaG93KSB0dW5lUGFuZWwuc2Nyb2xsSW50b1ZpZXcoe2JlaGF2aW9yOidzbW9vdGgnLGJsb2NrOiduZWFyZXN0J30pOwogIH07CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JzdCcpLm9uY2xpY2s9cmVzZXQ7CgogIC8vIC0tLS0tLS0tLS0gdHVuaW5nIHNsaWRlcnMgLS0tLS0tLS0tLQogIGNvbnN0IHNsUmVmaW5lPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbC1yZWZpbmUnKSwgc2xMbGVmZj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2wtbGxlZmYnKSwKICAgICAgICBzbFBlb3BsZT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2wtcGVvcGxlJyksIHNsQmFua2VkPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbC1iYW5rZWQnKTsKICBmdW5jdGlvbiB1cGRhdGVUdW5lT3V0KCl7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3YtcmVmaW5lJykudGV4dENvbnRlbnQ9J8OXJysoMSt0dW5lLnJlZmluZSkudG9GaXhlZCgyKSsnIGltcHVsc2UnOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ292LWxsZWZmJykudGV4dENvbnRlbnQ9J+KIkicrTWF0aC5yb3VuZCg3MCp0dW5lLmxsZWZmKSsnJSBRQSBjb3N0JzsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdi1wZW9wbGUnKS50ZXh0Q29udGVudD10dW5lLnBlb3BsZSsnIHBlb3BsZSDCtyBzaGlwICcrKHNoaXBOZXQoKT49MD8nKyc6JycpK3NoaXBOZXQoKS50b0ZpeGVkKDMpKyhzaGlwTmV0KCk8MD8nIChkcmFnKSc6JycpOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ292LWJhbmtlZCcpLnRleHRDb250ZW50PSdmbG9vciAnK2Zsb29yRWZmKCkudG9GaXhlZCgyKTsKICB9CiAgc2xSZWZpbmUudmFsdWU9dHVuZS5yZWZpbmUqMTAwOyBzbExsZWZmLnZhbHVlPXR1bmUubGxlZmYqMTAwOyBzbFBlb3BsZS52YWx1ZT10dW5lLnBlb3BsZTsgc2xCYW5rZWQudmFsdWU9dHVuZS5iYW5rZWQqMTAwOwogIHNsUmVmaW5lLm9uaW5wdXQ9KCk9Pnt0dW5lLnJlZmluZT0rc2xSZWZpbmUudmFsdWUvMTAwO3NhdmVUdW5lKCk7cmVmcmVzaCgpO307CiAgc2xMbGVmZi5vbmlucHV0PSgpPT57dHVuZS5sbGVmZj0rc2xMbGVmZi52YWx1ZS8xMDA7c2F2ZVR1bmUoKTtyZWZyZXNoKCk7fTsKICBzbFBlb3BsZS5vbmlucHV0PSgpPT57dHVuZS5wZW9wbGU9K3NsUGVvcGxlLnZhbHVlO3NhdmVUdW5lKCk7cmVmcmVzaCgpO307CiAgc2xCYW5rZWQub25pbnB1dD0oKT0+e3R1bmUuYmFua2VkPStzbEJhbmtlZC52YWx1ZS8xMDA7c2F2ZVR1bmUoKTtyZWZyZXNoKCk7fTsKCiAgLy8gLS0tLS0tLS0tLSBzcGluIHRoZSBkYXkgYmV6ZWwgLS0tLS0tLS0tLQogIGNvbnN0IHN2Zz1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ZnJyksIGJlemVsSGl0PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiZXplbEhpdCcpOwogIGxldCBkcmFnZ2luZz1mYWxzZSwgbGFzdEFuZz0wLCBiZXplbFJvdD0wOwogIGZ1bmN0aW9uIHN2Z1B0KGV2dCl7Y29uc3QgcD1zdmcuY3JlYXRlU1ZHUG9pbnQoKTtwLng9ZXZ0LmNsaWVudFg7cC55PWV2dC5jbGllbnRZO2NvbnN0IG09c3ZnLmdldFNjcmVlbkNUTSgpO3JldHVybiBwLm1hdHJpeFRyYW5zZm9ybShtLmludmVyc2UoKSk7fQogIGZ1bmN0aW9uIGFuZ09mKGV2dCl7Y29uc3QgcD1zdmdQdChldnQpO3JldHVybiBNYXRoLmF0YW4yKHAueS1DWSxwLngtQ1gpO30KICBiZXplbEhpdC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsZT0+e2RyYWdnaW5nPXRydWU7bGFzdEFuZz1hbmdPZihlKTtiZXplbEhpdC5zdHlsZS5jdXJzb3I9J2dyYWJiaW5nJzt0cnl7YmV6ZWxIaXQuc2V0UG9pbnRlckNhcHR1cmUoZS5wb2ludGVySWQpO31jYXRjaCh4KXt9fSk7CiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJyxlPT57aWYoIWRyYWdnaW5nKXJldHVybjtjb25zdCBhPWFuZ09mKGUpO2xldCBkPShhLWxhc3RBbmcpKjE4MC9NYXRoLlBJO2JlemVsUm90Kz1kO2xhc3RBbmc9YTtiZXplbC5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsJ3JvdGF0ZSgnK2JlemVsUm90KycgJytDWCsnICcrQ1krJyknKTt9KTsKICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywoKT0+e2RyYWdnaW5nPWZhbHNlO2JlemVsSGl0LnN0eWxlLmN1cnNvcj0nZ3JhYic7fSk7CgogIHJlc2V0KCk7Cjwvc2NyaXB0Pgo8IS0tIGZseXdoZWVsIGVuZ2luZSB2MC45IMK3IHZlcmlmaWVkIGNvbXBsZXRlIDIwMjYtMDYtMjAgfkplc3NlIC0tPgo8L2JvZHk+CjwvaHRtbD4K";
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url), p = url.pathname;
    const me = await getUser(env, whoami(req));
        if (p === "/api/theme-color" && req.method === "POST") {
          try {
            const __b = await req.json();
            const __hex = String((__b && __b.hex) || "").trim();
            if (/^#[0-9a-fA-F]{6}$/.test(__hex)) {
              await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("theme_color", __hex).run();
            }
          } catch (e) {}
          return json({ ok: true });
        }
        if (p === "/api/access-request" && req.method === "POST") {
          try {
            const __cur = await getSetting(env, "access_requests");
            const __arr = __cur ? JSON.parse(__cur) : [];
            const __lc = String(me.email || "guest").toLowerCase();
            if (!__arr.some(function(x){ return String(x.email || "").toLowerCase() === __lc; })) __arr.push({ email: me.email, name: me.name, ts: Date.now() });
            await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("access_requests", JSON.stringify(__arr)).run();
            await logAudit(env, me.name, "request", "requested access: " + (me.email || "guest"), "Access/Request");
          } catch (e) {}
          return json({ ok: true });
        }
    if (me.role === "guest") {
      if (p === "/api/state") return json({ pending: true, me: { name: me.name, role: "guest", isAdmin: false, isOwner: false, isRoyal: false, avatar: "" }, owner: OWNER });
      if (p.startsWith("/api/") || p.startsWith("/music/") || p.startsWith("/movie/") || p.startsWith("/pic/")) return json({ error: "pending_approval" }, 403);
    }
    if (p === "/hub" || p === "/hub.html") {
      if (me.role === "guest") return Response.redirect(new URL("/", req.url).toString(), 302);
      const __hub = new TextDecoder().decode(Uint8Array.from(atob(HUB_B64), function(c){ return c.charCodeAt(0); }));
      return new Response(__hub, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (p === "/start-here" || p === "/start-here.html") {
      const __sh = new TextDecoder().decode(Uint8Array.from(atob(STARTHERE_B64), function(c){ return c.charCodeAt(0); }));
      return new Response(__sh, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    if (p === "/flywheel") {
      if (me.role === "guest") return Response.redirect(new URL("/", req.url).toString(), 302);
      const __fly = new TextDecoder().decode(Uint8Array.from(atob(FLYWHEEL_B64), function(c){ return c.charCodeAt(0); }));
      return new Response(__fly, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    const isAdmin = me.role === "admin";
    const isRoyal = (me.email || "").toLowerCase() === OWNER || (me.email || "").toLowerCase() === QUEEN;
    let forumGrants = { owner: [], queen: [] };
    {
      const fgr = await getSetting(env, "forum_grants");
      if (fgr) {
        try {
          forumGrants = JSON.parse(fgr);
        } catch (e) {
        }
      }
    }
    forumGrants.owner = forumGrants.owner || [];
    forumGrants.queen = forumGrants.queen || [];
    const _lc = (me.email || "").toLowerCase();
    const householdOk = isRoyal || forumGrants.owner.map(function(x) {
      return String(x).toLowerCase();
    }).indexOf(_lc) >= 0 && forumGrants.queen.map(function(x) {
      return String(x).toLowerCase();
    }).indexOf(_lc) >= 0;
    const guestShare = await getSetting(env, "guest_grocery") === "1";
    let listMembers = {};
    {
      const lmR = await getSetting(env, "list_members");
      if (lmR) {
        try {
          listMembers = JSON.parse(lmR);
        } catch (e) {
        }
      }
    }
    const inGrocery = Array.isArray(listMembers["Grocery"]) && listMembers["Grocery"].map(function(s) {
      return String(s).toLowerCase();
    }).indexOf((me.email || "").toLowerCase()) >= 0;
    const groceryVisible = me.grocery_access === 1 || inGrocery || guestShare;
    const requireAdmin = /* @__PURE__ */ __name(() => {
      if (!isAdmin) throw new Error("admin only");
    }, "requireAdmin");
    try {
      if (p === "/api/state") {
        if (groceryVisible) { try { await ensureGrocery(env); } catch (e) {} }
        const grocery = groceryVisible ? (await env.DB.prepare("SELECT * FROM grocery_items ORDER BY id").all()).results : [];
        const recipes = groceryVisible ? await getRecipes(env) : {};
        let messages = (await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 200").all()).results;
        if (!householdOk) messages = messages.filter(function(m) {
          return m.category !== "household" && m.category !== "housekeeping";
        });
        let forumMembers = [];
        if (isRoyal) {
          forumMembers = (await env.DB.prepare("SELECT name,email FROM users ORDER BY name").all()).results;
        }
        const rsvp = (await env.DB.prepare("SELECT * FROM rsvp ORDER BY id DESC").all()).results;
        const media = (await env.DB.prepare("SELECT * FROM media ORDER BY COALESCE(taken_at,created_at) DESC LIMIT 300").all()).results;
        let users = [];
        if (isAdmin) users = (await env.DB.prepare("SELECT * FROM users ORDER BY role, name").all()).results;
        const quotes = await getQuotes(env);
        let dmv = [];
        const dmvR = await getSetting(env, "destroyed_movies");
        if (dmvR) {
          try {
            dmv = JSON.parse(dmvR);
          } catch (e) {
          }
        }
        let dlog = [];
        if (me.role !== "guest") {
          const dlgR = await getSetting(env, "destroy_log");
          if (dlgR) {
            try {
              dlog = JSON.parse(dlgR);
            } catch (e) {
            }
          }
        }
        let avatars = {};
        try {
          const ar = (await env.DB.prepare("SELECT name,avatar FROM users").all()).results;
          ar.forEach(function(u) {
            if (u.avatar) avatars[u.name] = u.avatar;
          });
        } catch (e) {
        }
        let rq = [];
        if (isRoyal) {
          const rqr = await getSetting(env, "review_queue");
          if (rqr) {
            try {
              rq = JSON.parse(rqr);
            } catch (e) {
            }
          }
        }
        let memberLists = [];
        {
          const mlR = await getSetting(env, "member_lists");
          if (mlR) {
            try {
              memberLists = JSON.parse(mlR);
            } catch (e) {
            }
          }
        }
        if (!memberLists.length) memberLists = ["Grocery"];
        let movieReady = [], movieReq = [];
        if (env.MOV) {
          try {
            const ml = await env.MOV.list({ limit: 1e3 });
            movieReady = ml.objects.filter(function(o) {
              return /\.mp4$/i.test(o.key);
            }).map(function(o) {
              return o.key.replace(/\.mp4$/i, "");
            });
          } catch (e) {
          }
          movieReq = await movArr(env);
        }
        let movieQueue = [];
        {
          const mqr = await getSetting(env, "movie_queue");
          if (mqr) {
            try {
              movieQueue = JSON.parse(mqr);
            } catch (e) {
            }
          }
        }
        let recycleList = [];
        {
          const rcr = await getSetting(env, "recycle_list");
          if (rcr) {
            try {
              recycleList = JSON.parse(rcr);
            } catch (e) {
            }
          }
        }
        let songQueue = null;
        {
          const sqr = await getSetting(env, "song_queue");
          if (sqr) {
            try {
              songQueue = JSON.parse(sqr);
            } catch (e) {
            }
          }
        }
        let rotationState = null;
        {
          const rsr = await getSetting(env, "rotation_state");
          if (rsr) {
            try {
              rotationState = JSON.parse(rsr);
            } catch (e) {
            }
          }
        }
        let libPlaylists = [];
        {
          const lpr = await getSetting(env, "library_playlists");
          if (lpr) { try { libPlaylists = JSON.parse(lpr); } catch (e) {} }
        }
        const __kingDefault = OWNER;
let __king = await getSetting(env, "king");
if (!__king) { __king = __kingDefault; try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("king", __king).run(); } catch (e) {} }
let __succ = [];
try { const __sr = await getSetting(env, "succession"); __succ = __sr ? JSON.parse(__sr) : []; } catch (e) {}
if (!__succ.length) { __succ = [OWNER, QUEEN]; try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("succession", JSON.stringify(__succ)).run(); } catch (e) {} }
const __isKing = (me.email || "").toLowerCase() === String(__king).toLowerCase();
        const __inLine = (me.email ? __succ.map(function(x){ return String(x).toLowerCase(); }).indexOf((me.email||"").toLowerCase()) >= 0 : false);
if (__isKing) { try { await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("king_seen", String(Date.now())).run(); } catch (e) {} }
let __kingSeen = 0; try { __kingSeen = +((await getSetting(env, "king_seen")) || 0); } catch (e) {}
let __claim = null; try { const __cl = await getSetting(env, "succession_claim"); __claim = (__cl && __cl !== "") ? JSON.parse(__cl) : null; } catch (e) {}
let __letter = ""; try { __letter = (await getSetting(env, "king_letter")) || ""; } catch (e) {}
        let __crMeta={};try{const __r=await getSetting(env,"forum_meta");if(__r)__crMeta=JSON.parse(__r);}catch(e){}
        let __crPres={};try{const __r=await getSetting(env,"forum_presence");if(__r)__crPres=JSON.parse(__r);}catch(e){}
        __crPres[me.name]=Date.now();
        try{const __cut=Date.now()-86400000;for(const __k in __crPres){if(__crPres[__k]<__cut)delete __crPres[__k];}}catch(e){}
        try{await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('forum_presence',?)").bind(JSON.stringify(__crPres)).run();}catch(e){}
        let __crRows=[];try{__crRows=(await env.DB.prepare("SELECT name,email FROM users ORDER BY name").all()).results||[];}catch(e){}
        const __crRoster=__crRows.map(function(u){const m=__crMeta[String(u.email||"").toLowerCase()]||{};return {name:u.name,email:isRoyal?u.email:undefined,title:m.title||"",color:m.color||"",king:(u.name===__king)?1:0,wiz:m.wiz||0,mod:m.mod||0,elder:m.elder||0,guest:m.guest||0,locked:m.locked||0,you:(u.name===me.name)?1:0};});
        const __crReact={};try{await env.DB.prepare("CREATE TABLE IF NOT EXISTS message_reactions (message_id INTEGER, name TEXT, emoji TEXT, created_at INTEGER, PRIMARY KEY (message_id,name,emoji))").run();var __ids=(messages||[]).map(function(m){return m.id;}).filter(function(x){return x!=null;});if(__ids.length){var __ph=__ids.map(function(){return "?";}).join(",");var __rr=(await env.DB.prepare("SELECT message_id,name,emoji FROM message_reactions WHERE message_id IN ("+__ph+")").bind(...__ids).all()).results||[];__rr.forEach(function(row){if(!__crReact[row.message_id])__crReact[row.message_id]={};if(!__crReact[row.message_id][row.emoji])__crReact[row.message_id][row.emoji]=[];__crReact[row.message_id][row.emoji].push(row.name);});}}catch(e){}
        const __cr={forumRoster:__crRoster,presence:__crPres,reactions:__crReact};
        return json({ me: { name: me.name, role: me.role, isAdmin, isOwner: me.email === OWNER, isRoyal, isKing: __isKing, inLine: (!__isKing && __inLine), avatar: me.avatar || "", digestOff: me.digest_off ? 1 : 0 }, king: __king, succession: __isKing ? __succ : null, kingSeen: __isKing ? __kingSeen : 0, claim: __isKing ? __claim : null, kingLetter: __isKing ? __letter : null, groceryVisible, guestShare, grocery, recipes, messages, rsvp, media, users, quotes, destroyedMovies: dmv, destroyLog: dlog, avatars, reviewQueue: rq, memberLists, listMembers: isAdmin ? listMembers : {}, movieReady, movieReq, movieQueue, recycleList, songQueue, rotationState, libPlaylists, householdOk, gateBanner: (await getSetting(env, "gate_banner")) || "", themeColor: (await getSetting(env, "theme_color")) || "#2f9bff", forumGrants: isRoyal ? forumGrants : null, members: forumMembers, forumRoster: __cr.forumRoster, presence: __cr.presence, reactions: __cr.reactions });
      }
      if (p === "/api/king/succession" && req.method === "POST") {
  const __k = (await getSetting(env, "king")) || OWNER;
  if ((me.email || "").toLowerCase() !== String(__k).toLowerCase()) return json({ error: "king only" }, 403);
  const b = await req.json();
  const list = Array.isArray(b.succession) ? b.succession.map(function(x){ return String(x).trim(); }).filter(Boolean) : [];
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("succession", JSON.stringify(list)).run();
  try { await logAudit(env, me.name, "king", "updated line of succession", "King"); } catch (e) {}
  return json({ ok: true });
}
if (p === "/api/king/letter" && req.method === "POST") {
  const __k = (await getSetting(env, "king")) || OWNER;
  if ((me.email || "").toLowerCase() !== String(__k).toLowerCase()) return json({ error: "king only" }, 403);
  const b = await req.json();
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("king_letter", String(b.letter || "").slice(0, 5000)).run();
  return json({ ok: true });
}
if (p === "/api/king/veto" && req.method === "POST") {
  const __k = (await getSetting(env, "king")) || OWNER;
  if ((me.email || "").toLowerCase() !== String(__k).toLowerCase()) return json({ error: "king only" }, 403);
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("succession_claim", "").run();
  await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("king_seen", String(Date.now())).run();
  try { await logAudit(env, me.name, "king", "vetoed succession claim (the King is present)", "King"); } catch (e) {}
  return json({ ok: true });
}
      if (p === "/api/notes" && req.method === "GET") {
        try { await env.DB.prepare("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_email TEXT, owner_name TEXT, body TEXT, created_at INTEGER, updated_at INTEGER, shares TEXT DEFAULT '[]')").run(); } catch (e) {}
        try { await env.DB.prepare("ALTER TABLE notes ADD COLUMN important INTEGER DEFAULT 0").run(); } catch (e) {}
        const __nk = (await getSetting(env, "king")) || OWNER;
        const isKingNow = (me.email || "").toLowerCase() === String(__nk).toLowerCase();
        const meLc = (me.email || "").toLowerCase();
        const now = Date.now();
        const all = (await env.DB.prepare("SELECT * FROM notes ORDER BY updated_at DESC").all()).results || [];
        const out = [];
        for (const n of all) {
          const mine = meLc !== "" && String(n.owner_email || "").toLowerCase() === meLc;
          let shares = [];
          try { shares = JSON.parse(n.shares || "[]"); } catch (e) { shares = []; }
          const sharedToMe = meLc !== "" && shares.some(function(x){ return String(x.email || "").toLowerCase() === meLc && (!x.until || x.until > now); });
          const kingView = isKingNow && !mine && !sharedToMe;
          if (!(mine || sharedToMe || kingView)) continue;
          out.push({ id: n.id, owner_name: n.owner_name || "", body: n.body || "", important: n.important ? 1 : 0, created_at: n.created_at, updated_at: n.updated_at, mine: mine, kingView: kingView, shares: mine ? shares.filter(function(x){ return !x.until || x.until > now; }) : [] });
        }
        const roster = (await env.DB.prepare("SELECT name,email FROM users ORDER BY name").all()).results || [];
        try { const rr = (await env.DB.prepare("SELECT id,title,body,due_at,channels,note_id FROM reminders WHERE owner_email=? AND status='pending' AND note_id>0").bind(meLc).all()).results || []; const byNote = {}; for (const rrr of rr) { (byNote[rrr.note_id] = byNote[rrr.note_id] || []).push(rrr); } for (const o of out) { if (o.mine && byNote[o.id]) o.reminders = byNote[o.id]; } } catch (e) {}
        return json({ notes: out, roster: roster.filter(function(u){ return String(u.email || "").toLowerCase() !== meLc; }), isKing: isKingNow });
      }
      if (p === "/api/note" && req.method === "POST") {
        try { await env.DB.prepare("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_email TEXT, owner_name TEXT, body TEXT, created_at INTEGER, updated_at INTEGER, shares TEXT DEFAULT '[]')").run(); } catch (e) {}
        try { await env.DB.prepare("ALTER TABLE notes ADD COLUMN important INTEGER DEFAULT 0").run(); } catch (e) {}
        if (!me.email) return json({ error: "sign in to keep private notes" }, 403);
        const b = await req.json();
        const body = String(b.body || "").slice(0, 20000);
        const now = Date.now();
        if (b.id) {
          const ex = await env.DB.prepare("SELECT owner_email FROM notes WHERE id=?").bind(b.id).first();
          if (!ex || String(ex.owner_email || "").toLowerCase() !== (me.email || "").toLowerCase()) return json({ error: "not your note" }, 403);
          await env.DB.prepare("UPDATE notes SET body=?, updated_at=? WHERE id=?").bind(body, now, b.id).run();
          return json({ ok: true, id: b.id });
        }
        if (!body.trim()) return json({ error: "empty" }, 400);
        const r = await env.DB.prepare("INSERT INTO notes (owner_email, owner_name, body, created_at, updated_at, shares) VALUES (?,?,?,?,?,'[]')").bind(me.email, me.name, body, now, now).run();
        try { await logAudit(env, me.name, "note", "saved a private note", "Notes"); } catch (e) {}
        return json({ ok: true, id: r.meta && r.meta.last_row_id });
      }
      if (p === "/api/note/delete" && req.method === "POST") {
        if (!me.email) return json({ error: "no" }, 403);
        const b = await req.json();
        const ex = await env.DB.prepare("SELECT owner_email FROM notes WHERE id=?").bind(b.id).first();
        if (!ex || String(ex.owner_email || "").toLowerCase() !== (me.email || "").toLowerCase()) return json({ error: "not your note" }, 403);
        await env.DB.prepare("DELETE FROM notes WHERE id=?").bind(b.id).run();
        return json({ ok: true });
      }
      if (p === "/api/note/share" && req.method === "POST") {
        if (!me.email) return json({ error: "no" }, 403);
        const b = await req.json();
        const ex = await env.DB.prepare("SELECT owner_email, shares FROM notes WHERE id=?").bind(b.id).first();
        if (!ex || String(ex.owner_email || "").toLowerCase() !== (me.email || "").toLowerCase()) return json({ error: "not your note" }, 403);
        let shares = [];
        try { shares = JSON.parse(ex.shares || "[]"); } catch (e) { shares = []; }
        const tgt = String(b.email || "").toLowerCase();
        if (!tgt) return json({ error: "pick a person" }, 400);
        shares = shares.filter(function(x){ return String(x.email || "").toLowerCase() !== tgt; });
        if (!b.unshare) {
          const hours = Number(b.hours || 0);
          const until = hours > 0 ? Date.now() + hours * 3600 * 1000 : 0;
          const u = await env.DB.prepare("SELECT name FROM users WHERE lower(email)=?").bind(tgt).first();
          shares.push({ email: tgt, name: (u && u.name) || tgt, until: until });
        }
        await env.DB.prepare("UPDATE notes SET shares=? WHERE id=?").bind(JSON.stringify(shares), b.id).run();
        return json({ ok: true });
      }
      if (p === "/api/note/flag" && req.method === "POST") {
        if (!me.email) return json({ error: "no" }, 403);
        try { await env.DB.prepare("ALTER TABLE notes ADD COLUMN important INTEGER DEFAULT 0").run(); } catch (e) {}
        const b = await req.json();
        const ex = await env.DB.prepare("SELECT owner_email FROM notes WHERE id=?").bind(b.id).first();
        if (!ex || String(ex.owner_email || "").toLowerCase() !== (me.email || "").toLowerCase()) return json({ error: "not your note" }, 403);
        await env.DB.prepare("UPDATE notes SET important=? WHERE id=?").bind(b.important ? 1 : 0, +b.id || 0).run();
        return json({ ok: true });
      }
      if (p === "/api/grocery" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        await ensureGrocery(env);
        const b = await req.json();
        const name = (b.name || "").trim();
        const freq = ["once", "weekly", "monthly"].includes(b.freq) ? b.freq : "once";
        if (!name) return json({ error: "name required" }, 400);
        await env.DB.prepare("INSERT INTO grocery_items (name,freq,last_bought,added_by,created_at,meal_group,checked) VALUES (?,?,NULL,?,?,NULL,0)").bind(name, freq, me.name, Date.now()).run();
        return json({ ok: true });
      }
      if (p === "/api/grocery/meal" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        await ensureGrocery(env);
        const b = await req.json();
        const meal = (b.name || "").trim();
        if (!meal) return json({ error: "name required" }, 400);
        const key = meal.toLowerCase();
        const recipes = await getRecipes(env);
        let ings = null, source = "library", recName = meal;
        if (recipes[key] && Array.isArray(recipes[key].ingredients) && recipes[key].ingredients.length) {
          ings = recipes[key].ingredients.slice(0, 30);
          recName = recipes[key].name || meal;
        } else {
          const ai = await aiIngredients(env, meal);
          if (ai && ai.length) {
            ings = ai; source = "ai";
            recipes[key] = { name: meal, ingredients: ai, ai: true, by: me.name, ts: Date.now() };
            await saveRecipes(env, recipes);
          }
        }
        if (!ings || !ings.length) return json({ ok: false, need: true, name: meal });
        const now = Date.now();
        for (const ing of ings) {
          const nm = String(ing || "").trim().slice(0, 80);
          if (!nm) continue;
          await env.DB.prepare("INSERT INTO grocery_items (name,freq,last_bought,added_by,created_at,meal_group,checked) VALUES (?,?,NULL,?,?,?,0)").bind(nm, "once", me.name, now, recName).run();
        }
        return json({ ok: true, source, name: recName, count: ings.length });
      }
      if (p === "/api/grocery/check" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        await ensureGrocery(env);
        const b = await req.json();
        await env.DB.prepare("UPDATE grocery_items SET checked=? WHERE id=?").bind(b.on ? 1 : 0, +b.id || 0).run();
        return json({ ok: true });
      }
      if (p === "/api/grocery/mealdel" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        await ensureGrocery(env);
        const b = await req.json();
        const meal = (b.meal || "").trim();
        if (!meal) return json({ error: "meal required" }, 400);
        await env.DB.prepare("DELETE FROM grocery_items WHERE meal_group=?").bind(meal).run();
        return json({ ok: true });
      }
      if (p === "/api/recipe/save" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        await ensureGrocery(env);
        const b = await req.json();
        const meal = (b.name || "").trim();
        if (!meal) return json({ error: "name required" }, 400);
        const rows = (await env.DB.prepare("SELECT name FROM grocery_items WHERE meal_group=? ORDER BY id").bind(meal).all()).results || [];
        const ings = rows.map(function (r) { return String(r.name || "").trim(); }).filter(function (x) { return x; });
        if (!ings.length) return json({ ok: false, error: "no ingredients to save" });
        const recipes = await getRecipes(env);
        recipes[meal.toLowerCase()] = { name: meal, ingredients: ings, by: me.name, ts: Date.now() };
        await saveRecipes(env, recipes);
        return json({ ok: true, count: ings.length });
      }
      if (p === "/api/grocery/bought" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        const b = await req.json();
        await env.DB.prepare("UPDATE grocery_items SET last_bought=? WHERE id=?").bind(Date.now(), b.id).run();
        return json({ ok: true });
      }
      if (p === "/api/grocery/delete" && req.method === "POST") {
        if (!groceryVisible) return json({ error: "no access" }, 403);
        const b = await req.json();
        await env.DB.prepare("DELETE FROM grocery_items WHERE id=?").bind(b.id).run();
        return json({ ok: true });
      }
      if (p === "/api/message" && req.method === "POST") {
        const b = await req.json();
        const body = (b.body || "").trim();
        if (!body) return json({ error: "empty" }, 400);
        const cat = String(b.category || "general").slice(0, 40);
        { var __ch = cat.indexOf("|")>0 ? cat.substring(0,cat.indexOf("|")) : cat; if ((__ch === "household" || __ch === "housekeeping") && !householdOk) return json({ error: "no access" }, 403); }
        try {
          await env.DB.prepare("ALTER TABLE messages ADD COLUMN category TEXT DEFAULT 'general'").run();
        } catch (e) {
        }
        const r = await env.DB.prepare("INSERT INTO messages (author,body,created_at,category) VALUES (?,?,?,?)").bind(me.name, body, Date.now(), cat).run();
        const mid = r.meta && r.meta.last_row_id;
        const hits = body.match(new RegExp("\\b(" + BADWORDS.join("|") + ")\\b", "ig"));
        if (hits && mid) {
          try {
            await env.DB.prepare("ALTER TABLE messages ADD COLUMN flag_review INTEGER DEFAULT 0").run();
          } catch (e) {
          }
          try {
            await env.DB.prepare("UPDATE messages SET flag_review=1 WHERE id=?").bind(mid).run();
          } catch (e) {
          }
          let rq = [];
          const rqr = await getSetting(env, "review_queue");
          if (rqr) {
            try {
              rq = JSON.parse(rqr);
            } catch (e) {
            }
          }
          rq.unshift({ id: mid, by: me.name, body: body.slice(0, 200), hit: Array.from(new Set(hits.map(function(x) {
            return x.toLowerCase();
          }))).join(", "), ts: Date.now() });
          rq = rq.slice(0, 200);
          await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("review_queue", JSON.stringify(rq)).run();
          await logAudit(env, me.name, "flag", "profanity flagged for review", "Moderation/Profanity");
        }
        return json({ ok: true });
      }
      if (p === "/api/recycle" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "no" }, 403);
        const b = await req.json();
        const title = String(b.title || "");
        const on = !!b.on;
        let rl = [];
        const rcr = await getSetting(env, "recycle_list");
        if (rcr) {
          try {
            rl = JSON.parse(rcr);
          } catch (e) {
          }
        }
        const i = rl.indexOf(title);
        if (on) {
          if (i < 0) rl.push(title);
        } else {
          if (i >= 0) rl.splice(i, 1);
        }
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("recycle_list", JSON.stringify(rl)).run();
        try {
          await logAudit(env, me.name, "delete", "recycle " + (on ? "flagged" : "cleared") + ": " + title, "Recycle");
        } catch (e) {
        }
        return json({ ok: true, recycle: rl });
      }
      if (p === "/api/forum/react" && req.method === "POST") {
        const b = await req.json();const id=parseInt(b.id,10);const emoji=String(b.emoji||"").slice(0,16);
        if(!id||!emoji)return json({error:"bad request"},400);
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS message_reactions (message_id INTEGER, name TEXT, emoji TEXT, created_at INTEGER, PRIMARY KEY (message_id,name,emoji))").run();
        const __ex=await env.DB.prepare("SELECT 1 FROM message_reactions WHERE message_id=? AND name=? AND emoji=?").bind(id,me.name,emoji).first();
        if(__ex){await env.DB.prepare("DELETE FROM message_reactions WHERE message_id=? AND name=? AND emoji=?").bind(id,me.name,emoji).run();}
        else{await env.DB.prepare("INSERT OR IGNORE INTO message_reactions (message_id,name,emoji,created_at) VALUES (?,?,?,?)").bind(id,me.name,emoji,Date.now()).run();}
        return json({ok:1});
      }
      if (p === "/api/forum/meta" && req.method === "POST") {
        if(!isRoyal)return json({error:"forbidden"},403);
        const b=await req.json();const email=String(b.email||"").toLowerCase();
        if(!email)return json({error:"bad request"},400);
        let meta={};try{const __r=await getSetting(env,"forum_meta");if(__r)meta=JSON.parse(__r);}catch(e){}
        meta[email]={title:String(b.title||"").slice(0,60),color:String(b.color||"").slice(0,24),wiz:parseInt(b.wiz,10)||0,mod:b.mod?1:0,elder:parseInt(b.elder,10)||0,guest:b.guest?1:0,locked:b.locked?1:0};
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('forum_meta',?)").bind(JSON.stringify(meta)).run();
        return json({ok:1});
      }
      if (p === "/api/forum/grant" && req.method === "POST") {
        if (!isRoyal) return json({ error: "royals only" }, 403);
        const b = await req.json();
        const email = String(b.email || "").toLowerCase();
        let fg = { owner: [], queen: [] };
        const fgr = await getSetting(env, "forum_grants");
        if (fgr) {
          try {
            fg = JSON.parse(fgr);
          } catch (e) {
          }
        }
        fg.owner = fg.owner || [];
        fg.queen = fg.queen || [];
        const which = _lc === OWNER ? "owner" : "queen";
        const list = fg[which];
        const i = list.map(function(x) {
          return String(x).toLowerCase();
        }).indexOf(email);
        if (b.on) {
          if (i < 0) list.push(email);
        } else {
          if (i >= 0) list.splice(i, 1);
        }
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("forum_grants", JSON.stringify(fg)).run();
        return json({ ok: true });
      }
      if (p === "/api/message/flag" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "no" }, 403);
        try {
          await env.DB.prepare("ALTER TABLE messages ADD COLUMN flagged INTEGER DEFAULT 0").run();
        } catch (e) {
        }
        const b = await req.json();
        await env.DB.prepare("UPDATE messages SET flagged=CASE WHEN COALESCE(flagged,0)=1 THEN 0 ELSE 1 END WHERE id=?").bind(b.id).run();
        await logAudit(env, me.name, "flag", "flagged a post for everyone", "Board/Flag");
        return json({ ok: true });
      }
      if (p === "/api/review/dismiss" && req.method === "POST") {
        if (!isRoyal) return json({ error: "royals only" }, 403);
        const b = await req.json();
        let rq = [];
        const rqr = await getSetting(env, "review_queue");
        if (rqr) {
          try {
            rq = JSON.parse(rqr);
          } catch (e) {
          }
        }
        rq = rq.filter(function(x) {
          return String(x.id) !== String(b.id);
        });
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("review_queue", JSON.stringify(rq)).run();
        return json({ ok: true });
      }
      if (p === "/api/rsvp" && req.method === "POST") {
        const b = await req.json();
        await env.DB.prepare("INSERT INTO rsvp (year,household,headcount,note,created_at) VALUES (?,?,?,?,?)").bind(b.year || 2027, (b.household || me.name).trim(), b.headcount || 0, (b.note || "").trim(), Date.now()).run();
        return json({ ok: true });
      }
      if (p === "/api/media" && req.method === "POST") {
        const b = await req.json();
        const u = (b.url || "").trim();
        if (!u) return json({ error: "url required" }, 400);
        const kind = ["song", "photo", "video"].includes(b.kind) ? b.kind : "photo";
        const people = (b.people || "").trim(), place = (b.place || "").trim(), caption = (b.caption || "").trim();
        if (kind !== "song" && !people && !place && !caption) return json({ error: "add a person, place, or caption so it is not junk" }, 400);
        await env.DB.prepare("INSERT INTO media (kind,title,url,added_by,created_at,people,place,caption,taken_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(kind, (b.title || "").trim(), u, me.name, Date.now(), people, place, caption, b.taken_at ? new Date(b.taken_at).getTime() : null).run();
        return json({ ok: true });
      }
      if (p === "/api/media/upload" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "not allowed" }, 403);
        if (!env.PICS) return json({ error: "picture storage not bound" }, 500);
        const ct = (req.headers.get("content-type") || "").toLowerCase();
        if (!ct.startsWith("image/")) return json({ error: "images only" }, 415);
        const MAX = 25 * 1024 * 1024;
        const buf = await req.arrayBuffer();
        if (buf.byteLength > MAX) return json({ error: "too large (25MB max)" }, 413);
        if (buf.byteLength < 64) return json({ error: "empty file" }, 400);
        const q = new URL(req.url).searchParams;
        const people = (q.get("people") || "").trim().slice(0, 200);
        const place = (q.get("place") || "").trim().slice(0, 200);
        const caption = (q.get("caption") || "").trim().slice(0, 300);
        const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" })[ct] || "img";
        const safe = String(me.email || "user").replace(/[^a-z0-9]/gi, "_").slice(0, 40);
        const key = "u/" + safe + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
        await env.PICS.put(key, buf, { httpMetadata: { contentType: ct } });
        await env.DB.prepare("INSERT INTO media (kind,title,url,added_by,created_at,people,place,caption,taken_at) VALUES (?,?,?,?,?,?,?,?,?)").bind("photo", "", "/pic/" + key, me.name, Date.now(), people, place, caption, Date.now()).run();
        await logAudit(env, me.name, "upload", caption || "photo", "Pictures/" + (place || people || "Untagged"));
        return json({ ok: true, url: "/pic/" + key });
      }
      if (p.startsWith("/pic/")) {
        if (me.role === "guest") return new Response("forbidden", { status: 403 });
        if (!env.PICS) return new Response("not found", { status: 404 });
        const key = decodeURIComponent(p.slice(5));
        const obj = await env.PICS.get(key);
        if (!obj) return new Response("not found", { status: 404 });
        const h = new Headers();
        obj.writeHttpMetadata(h);
        if (!h.get("content-type")) h.set("content-type", "image/jpeg");
        h.set("cache-control", "private, max-age=86400");
        return new Response(obj.body, { headers: h });
      }
      if (p === "/api/media/delete" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        await env.DB.prepare("DELETE FROM media WHERE id=?").bind(b.id).run();
        return json({ ok: true });
      }
      if (p === "/api/admin/user" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const em = (b.email || "").trim().toLowerCase();
        if (!em) return json({ error: "email required" }, 400);
        await env.DB.prepare("INSERT OR REPLACE INTO users (email,name,role,grocery_access,created_at,approved_by) VALUES (?,?,?,?,?,?)").bind(em, (b.name || em.split("@")[0]).trim(), b.role || "member", b.grocery_access ? 1 : 0, Date.now(), me.email).run();
        return json({ ok: true });
      }
      if (p === "/api/admin/user/delete" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        if ((b.email || "").toLowerCase() === me.email.toLowerCase()) return json({ error: "cannot remove yourself" }, 400);
        await env.DB.prepare("DELETE FROM users WHERE email=?").bind((b.email || "").toLowerCase()).run();
        return json({ ok: true });
      }
      if (p === "/api/admin/setting" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind(b.key, String(b.value)).run();
        return json({ ok: true });
      }
      if (p === "/api/admin/list/add" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const nm = String(b.name || "").trim().slice(0, 40);
        if (!nm) return json({ error: "name required" }, 400);
        let ml = [];
        const mlR = await getSetting(env, "member_lists");
        if (mlR) {
          try {
            ml = JSON.parse(mlR);
          } catch (e) {
          }
        }
        if (!ml.length) ml = ["Grocery"];
        if (ml.indexOf(nm) < 0) ml.push(nm);
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("member_lists", JSON.stringify(ml)).run();
        return json({ ok: true });
      }
      if (p === "/api/admin/list/member" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const list = String(b.list || ""), email = String(b.email || "").toLowerCase();
        let lm = {};
        const lmR = await getSetting(env, "list_members");
        if (lmR) {
          try {
            lm = JSON.parse(lmR);
          } catch (e) {
          }
        }
        lm[list] = lm[list] || [];
        const i = lm[list].map(function(s) {
          return String(s).toLowerCase();
        }).indexOf(email);
        if (b.on) {
          if (i < 0) lm[list].push(email);
        } else {
          if (i >= 0) lm[list].splice(i, 1);
        }
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("list_members", JSON.stringify(lm)).run();
        if (list === "Grocery") {
          await env.DB.prepare("UPDATE users SET grocery_access=? WHERE email=?").bind(b.on ? 1 : 0, email).run();
        }
        return json({ ok: true });
      }
      if (p === "/api/admin/user/role" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const email = String(b.email || "").toLowerCase();
        if (email === OWNER) return json({ error: "cannot change the SuperAdmin" }, 403);
        const role = ["guest", "member", "admin"].indexOf(b.role) >= 0 ? b.role : "member";
        await env.DB.prepare("UPDATE users SET role=? WHERE email=?").bind(role, email).run();
        return json({ ok: true });
      }
      if (p === "/api/usage") {
        const b = Number(await getSetting(env, "r2_bytes")) || 0;
        const u = await getSetting(env, "r2_updated");
        return json({ bytes: b, updated: u });
      }
      if (p === "/api/quote/fav" && req.method === "POST") {
        const b = await req.json();
        const st = await getQuotes(env);
        const id = String(b.id);
        st.favs[id] = st.favs[id] || [];
        const k = st.favs[id].indexOf(me.name);
        if (k >= 0) st.favs[id].splice(k, 1);
        else st.favs[id].push(me.name);
        await saveQuotes(env, st);
        return json({ ok: true });
      }
      if (p === "/api/quote/submit" && req.method === "POST") {
        const b = await req.json();
        const q = (b.q || "").trim(), a = (b.a || "").trim();
        if (!q || !a) return json({ error: "quote and author required" }, 400);
        const st = await getQuotes(env);
        st.pending = st.pending || [];
        st.pending.push({ q: q.slice(0, 240), a: a.slice(0, 80), at: (b.at || "").trim().slice(0, 90), u: (b.u || "").trim().slice(0, 300), src: (b.src || "").trim().slice(0, 200), s: (b.s || "").trim().slice(0, 80), by: me.name, ts: Date.now() });
        await saveQuotes(env, st);
        return json({ ok: true });
      }
      if (p === "/api/quote/approve" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const st = await getQuotes(env);
        const it = (st.pending || []).splice(b.idx, 1)[0];
        if (it) {
          const nid = st.nextId || st.quotes.length + 1;
          st.quotes.push({ id: nid, q: it.q, a: it.a, at: it.at || "", u: it.u || "", s: it.s || "Carpe diem.", src: it.src || "", by: it.by });
          st.nextId = nid + 1;
        }
        await saveQuotes(env, st);
        return json({ ok: true });
      }
      if (p === "/api/quote/reject" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const st = await getQuotes(env);
        (st.pending || []).splice(b.idx, 1);
        await saveQuotes(env, st);
        return json({ ok: true });
      }
      if (p === "/api/quote/destroy" && req.method === "POST") {
        if (!isRoyal) return json({ error: "only the King or Queen can nuke quotes" }, 403);
        const b = await req.json();
        const st = await getQuotes(env);
        const q = (st.quotes || []).filter(function(x) {
          return String(x.id) === String(b.id);
        })[0];
        st.quotes = (st.quotes || []).filter(function(x) {
          return String(x.id) !== String(b.id);
        });
        if (st.favs) delete st.favs[String(b.id)];
        await saveQuotes(env, st);
        let log = [];
        const lg = await getSetting(env, "destroy_log");
        if (lg) {
          try {
            log = JSON.parse(lg);
          } catch (e) {
          }
        }
        log.unshift({ kind: "quote", label: q ? q.q.slice(0, 80) : "quote " + b.id, by: me.name, ts: Date.now(), reason: String(b.reason || "").slice(0, 400) });
        log = log.slice(0, 500);
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("destroy_log", JSON.stringify(log)).run();
        await logAudit(env, me.name, "delete", q ? q.q.slice(0, 80) : "quote " + b.id, "Deleted/quote");
        return json({ ok: true });
      }
      if (p === "/api/destroy" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        const kind = b.kind, label = String(b.label || "").slice(0, 160);
        if (kind === "media") {
          await env.DB.prepare("DELETE FROM media WHERE id=?").bind(b.id).run();
        } else if (kind === "movie") {
          let arr = [];
          const dm = await getSetting(env, "destroyed_movies");
          if (dm) {
            try {
              arr = JSON.parse(dm);
            } catch (e) {
            }
          }
          if (b.title && arr.indexOf(b.title) < 0) arr.push(b.title);
          await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("destroyed_movies", JSON.stringify(arr)).run();
        }
        let log = [];
        const lg = await getSetting(env, "destroy_log");
        if (lg) {
          try {
            log = JSON.parse(lg);
          } catch (e) {
          }
        }
        log.unshift({ kind, label, by: me.name, ts: Date.now(), reason: String(b.reason || "").slice(0, 400) });
        log = log.slice(0, 500);
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("destroy_log", JSON.stringify(log)).run();
        await logAudit(env, me.name, "delete", label, "Deleted/" + kind);
        return json({ ok: true });
      }
      if (p === "/api/destroylog/delete" && req.method === "POST") {
        if (me.email !== OWNER) return json({ error: "only the owner can edit the log" }, 403);
        const b = await req.json();
        let log = [];
        const lg = await getSetting(env, "destroy_log");
        if (lg) {
          try {
            log = JSON.parse(lg);
          } catch (e) {
          }
        }
        log = log.filter(function(x) {
          return String(x.ts) !== String(b.ts);
        });
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("destroy_log", JSON.stringify(log)).run();
        return json({ ok: true });
      }
      if (p === "/api/audit" && req.method === "POST") {
        const b = await req.json();
        await logAudit(env, me.name, b.kind, b.label, b.tag);
        return json({ ok: true });
      }
      if (p === "/api/audit/list") {
        await ensureAudit(env);
        const rows = (await env.DB.prepare("SELECT * FROM audit ORDER BY id DESC LIMIT 1000").all()).results;
        return json(rows);
      }
      if (p === "/api/music/destroy" && req.method === "POST") {
        requireAdmin();
        const b = await req.json();
        if (env.MUSIC && b.key) {
          try {
            await env.MUSIC.delete(b.key);
          } catch (e) {
          }
        }
        let log = [];
        const lg = await getSetting(env, "destroy_log");
        if (lg) {
          try {
            log = JSON.parse(lg);
          } catch (e) {
          }
        }
        log.unshift({ kind: "song", label: String(b.label || b.key || "song").slice(0, 80), by: me.name, ts: Date.now(), reason: String(b.reason || "").slice(0, 400) });
        log = log.slice(0, 500);
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("destroy_log", JSON.stringify(log)).run();
        await logAudit(env, me.name, "delete", String(b.label || b.key || "song").slice(0, 80), "Deleted/song");
        return json({ ok: true });
      }
      if (p === "/api/me/avatar" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "guests cannot set an avatar" }, 403);
        try {
          await env.DB.prepare("ALTER TABLE users ADD COLUMN avatar TEXT").run();
        } catch (e) {
        }
        const b = await req.json();
        await env.DB.prepare("UPDATE users SET avatar=? WHERE email=?").bind(String(b.avatar || "").slice(0, 500), me.email).run();
        await logAudit(env, me.name, "profile", "set avatar", "Settings");
        return json({ ok: true });
      }
      if (p === "/api/songs") {
        if (!env.MUSIC) return json([]);
        const list = await env.MUSIC.list({ limit: 1e3 });
        const songs = list.objects.filter((o) => /\.(mp3|m4a|ogg|wav)$/i.test(o.key)).map((o) => ({ key: o.key, title: o.key.split("/").pop().replace(/\.[^.]+$/, "") }));
        return json(songs);
      }
      if (p.startsWith("/music/")) {
        if (!env.MUSIC) return new Response("not found", { status: 404 });
        const key = decodeURIComponent(p.slice(7));
        const range = req.headers.get("range");
        const obj = range ? await env.MUSIC.get(key, { range: parseRange(range) }) : await env.MUSIC.get(key);
        if (!obj) return new Response("not found", { status: 404 });
        const h = new Headers();
        obj.writeHttpMetadata(h);
        h.set("content-type", "audio/mpeg");
        h.set("accept-ranges", "bytes");
        if (range && obj.range) {
          h.set("content-range", "bytes " + obj.range.offset + "-" + (obj.range.offset + obj.range.length - 1) + "/" + obj.size);
          return new Response(obj.body, { status: 206, headers: h });
        }
        return new Response(obj.body, { headers: h });
      }
      if (p === "/api/movie/queue" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "no" }, 403);
        const b = await req.json();
        const q = Array.isArray(b.q) ? b.q.slice(0, 200).map(function(x) {
          return String(x).slice(0, 160);
        }) : [];
        let __cur = [];
        try { const __cv = await getSetting(env, "movie_queue"); __cur = __cv ? JSON.parse(__cv) : []; } catch (e) {}
        let __royal = isRoyal;
        if (!__royal) { try { const __sr = await getSetting(env, "succession"); const __sc = __sr ? JSON.parse(__sr) : []; __royal = __sc.map(function(x){ return String(x).toLowerCase(); }).indexOf((me.email||"").toLowerCase()) >= 0; } catch (e) {} }
        const __removed = __cur.filter(function(t){ return q.indexOf(t) < 0; });
        if (__removed.length > 0 && !__royal) return json({ error: "Only Royalty can remove queued movies." }, 403);
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("movie_queue", JSON.stringify(q)).run();
        return json({ ok: true });
      }
      if (p === "/api/library/playlists" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "no" }, 403);
        const b = await req.json();
        const pl = Array.isArray(b.pl) ? b.pl.slice(0, 200) : [];
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("library_playlists", JSON.stringify(pl)).run();
        return json({ ok: true });
      }
      if (p === "/api/dj/queue" && req.method === "POST") {
        if (me.role === "guest") return json({ error: "no" }, 403);
        const b = await req.json();
        const sv = { q: Array.isArray(b.q) ? b.q.slice(0, 500) : [], i: typeof b.i === "number" ? b.i : -1 };
        await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind("song_queue", JSON.stringify(sv)).run();
        return json({ ok: true });
      }
      if (p === "/api/movie/request" && req.method === "POST") {
        const b = await req.json();
        const t = String(b.title || "").trim();
        if (!t) return json({ error: "title required" }, 400);
        let q = await movArr(env);
        if (q.indexOf(t) < 0) {
          q.push(t);
          if (env.MOV) await env.MOV.put("_requests.json", JSON.stringify(q));
        }
        await logAudit(env, me.name, "request", t, "Movies/Request");
        return json({ ok: true });
      }
      if (p === "/api/movie/watched" && req.method === "POST") {
        const b = await req.json();
        const t = String(b.title || "").trim();
        if (env.MOV) {
          let w = await movWatched(env);
          w[movSlug(t)] = { by: me.name, ts: Date.now(), title: t };
          await env.MOV.put("_watched.json", JSON.stringify(w));
        }
        await logAudit(env, me.name, "play", t, "Movies/Watch");
        return json({ ok: true });
      }
      if (p.startsWith("/movie/")) {
        if (!env.MOV) return new Response("not found", { status: 404 });
        const key = decodeURIComponent(p.slice(7));
        const range = req.headers.get("range");
        const obj = range ? await env.MOV.get(key, { range: parseRange(range) }) : await env.MOV.get(key);
        if (!obj) return new Response("not found", { status: 404 });
        const h = new Headers();
        obj.writeHttpMetadata(h);
        h.set("content-type", "video/mp4");
        h.set("accept-ranges", "bytes");
        if (range && obj.range) {
          h.set("content-range", "bytes " + obj.range.offset + "-" + (obj.range.offset + obj.range.length - 1) + "/" + obj.size);
          return new Response(obj.body, { status: 206, headers: h });
        }
        return new Response(obj.body, { headers: h });
      }
      if (p === "/api/reminders" && req.method === "GET") {
        await ensureReminders(env);
        const mine = await env.DB.prepare("SELECT id,title,body,due_at,channels,to_email,to_phone,repeat_kind,status,fired_at FROM reminders WHERE owner_email = ? AND status != 'cancelled' ORDER BY due_at ASC LIMIT 200").bind((me.email || "").toLowerCase()).all();
        return json({ reminders: (mine && mine.results) || [] });
      }
      if (p === "/api/reminders" && req.method === "POST") {
        await ensureReminders(env);
        const b = await req.json();
        const due = +b.due_at || 0;
        if (!due) return json({ error: "due_at required (epoch ms)" }, 400);
        const chans = Array.isArray(b.channels) ? b.channels.join(",") : String(b.channels || "inapp");
        await env.DB.prepare("INSERT INTO reminders (owner_email,owner_name,title,body,due_at,channels,to_email,to_phone,to_carrier,repeat_kind,status,created_at,note_id) VALUES (?,?,?,?,?,?,?,?,?,?, 'pending', ?,?)").bind((me.email || "").toLowerCase(), me.name || "", String(b.title || "").slice(0, 200), String(b.body || "").slice(0, 2000), due, chans, b.to_email || me.email || null, b.to_phone || null, b.to_carrier || null, String(b.repeat_kind || ""), Date.now(), +b.note_id || 0).run();
        return json({ ok: true });
      }
      if (p === "/api/reminders/delete" && req.method === "POST") {
        await ensureReminders(env);
        const b = await req.json();
        await env.DB.prepare("UPDATE reminders SET status='cancelled' WHERE id = ? AND owner_email = ?").bind(+b.id || 0, (me.email || "").toLowerCase()).run();
        return json({ ok: true });
      }
      if (p === "/api/reminders/test" && req.method === "POST") {
        const b = await req.json();
        const out = {};
        if (b.email) out.email = await sendEmail(env, b.email, "PULSE test", "<p>This is a PULSE test email. If you got this, email is wired. — ~Jesse</p>");
        if (b.phone && b.carrier) out.text = await sendTextGateway(env, b.phone, b.carrier, "PULSE free-text test via the " + b.carrier + " gateway — it works! ~your PULSE");
        else if (b.phone) out.sms = await sendSMS(env, b.phone, "PULSE test SMS — if you got this, Twilio is wired. ~Jesse");
        return json({ ok: true, result: out });
      }
      if (p === "/api/digest/toggle" && req.method === "POST") {
        if (!me.email) return json({ error: "no" }, 403);
        try { await env.DB.prepare("ALTER TABLE users ADD COLUMN digest_off INTEGER DEFAULT 0").run(); } catch (e) {}
        const b = await req.json();
        await env.DB.prepare("UPDATE users SET digest_off=? WHERE lower(email)=?").bind(b.off ? 1 : 0, (me.email || "").toLowerCase()).run();
        return json({ ok: true, off: b.off ? 1 : 0 });
      }
      if (p === "/api/email-routes/sync" && req.method === "POST") {
        if ((me.email || "").toLowerCase() !== OWNER) return json({ error: "owner only" }, 403);
        const r = await syncEmailRoutes(env);
        return json(r);
      }
      if (p === "/" || p === "/index.html") return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      return new Response("Not found", { status: 404 });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDueReminders(env));
    ctx.waitUntil(maybeRunDigest(env));
    ctx.waitUntil(syncEmailRoutes(env));
  }
};
var HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>Clemit Pulse</title>
<style>#bootveil{position:fixed;inset:0;background:#0a0608;z-index:99999;opacity:1;transition:opacity .7s ease;pointer-events:none}#bootveil.gone{opacity:0}
:root{--bg:#0c0408;--panel:#190a12;--panel2:#23101a;--line:#3d1622;--txt:#f1e9ec;--dim:#a98793;--acc:#ff3b54;--acc-bright:#ff8a9b;--acc-glow:rgba(255,59,84,.55);--acc2:#34e6ff;--warn:#ffb74d;--due:#ef5350;--bad:#ff5d6c;--cw:1280px;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--txt);font:16px/1.55 'Segoe UI',system-ui,sans-serif;min-height:100vh;}
header{padding:22px 28px 4px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
header h1{font-size:1.5rem;}header h1 span{color:var(--acc);}
.role{font-size:.7rem;padding:2px 9px;border-radius:20px;border:1px solid var(--acc2);color:var(--acc2);text-transform:uppercase;}
header .right{margin-left:auto;display:flex;gap:14px;align-items:center;color:var(--dim);font-size:.85rem;}
header .right a{color:var(--dim);text-decoration:none;border:1px solid var(--line);padding:7px 14px;border-radius:8px;}header .right a:hover{color:var(--acc);border-color:var(--acc);}
.hero{position:relative;margin:8px 28px 4px;border-radius:16px;overflow:hidden;min-height:148px;border:1px solid var(--line);background:#0b0d12;box-shadow:0 14px 36px rgba(0,0,0,.5);transition:background .6s,border-color .6s,box-shadow .6s;}
.hero-bg{position:absolute;inset:0;z-index:1;pointer-events:none;}
.hero-content{position:relative;z-index:2;padding:20px 24px;}
.hero-greet{font-size:1.5rem;font-weight:700;}.hero-greet b{color:var(--acc);}
.hero-q{font-size:1.15rem;margin-top:10px;max-width:760px;line-height:1.5;transition:opacity .3s,transform .3s;}
.hero-q.swap{opacity:0;transform:translateY(8px);}
.hero-a{color:var(--dim);font-size:.85rem;margin-top:4px;}
.hero-sub{color:var(--acc2);font-size:.92rem;margin-top:8px;font-style:italic;}
.hero-ctrl{position:absolute;top:10px;right:12px;z-index:3;display:flex;gap:4px;}
.hero-ctrl button{background:rgba(0,0,0,.4);border:1px solid var(--line);color:var(--txt);min-width:30px;height:28px;border-radius:7px;cursor:pointer;font-size:.85rem;line-height:1;}
.hero-ctrl button:hover{border-color:var(--acc);}.hero-ctrl button.on{border-color:var(--acc);color:var(--acc);}
.hero.t-cosmos{background:radial-gradient(ellipse at 28% 18%,#1a1f3a,#07070f);}
.hero.t-cosmos .hero-bg{background-image:radial-gradient(1px 1px at 18% 32%,#fff,transparent),radial-gradient(1px 1px at 68% 58%,#cfe,transparent),radial-gradient(1px 1px at 42% 80%,#fff,transparent),radial-gradient(2px 2px at 84% 24%,#ad8,transparent);opacity:.7;animation:twk 4s ease-in-out infinite alternate;}
@keyframes twk{from{opacity:.35}to{opacity:.85}}
.hero.t-cosmos .hero-q{text-shadow:0 0 16px rgba(120,180,255,.5);}
.hero.t-slot{background:linear-gradient(135deg,#1c1407,#0c0a06);border-color:#d4af37;box-shadow:inset 0 0 0 2px rgba(212,175,55,.3);}
.hero.t-slot .hero-q{color:#ffe9a8;}
.hero.t-slot .hero-bg{background:repeating-linear-gradient(90deg,rgba(212,175,55,.06) 0 8px,transparent 8px 16px);}
.hero.t-switch{background:linear-gradient(120deg,#10202f,#181020);}
.hero.t-switch .hero-bg{background:radial-gradient(circle at 10% 55%,rgba(233,69,96,.38),transparent 32%),radial-gradient(circle at 90% 45%,rgba(54,200,255,.38),transparent 32%);}
.hero.t-cruise{background:linear-gradient(160deg,#0e1b2e,#0a1320);border-color:rgba(201,167,107,.5);}
.hero.t-cruise .hero-bg{background:linear-gradient(transparent 38px,rgba(201,167,107,.22) 39px,transparent 40px);background-size:100% 40px;opacity:.5;}
.hero.t-cruise .hero-q,.hero.t-cruise .hero-greet{font-family:Georgia,'Times New Roman',serif;}
.hero.t-cruise .hero-q{color:#e8d9bd;}
.hero .starfield,.hero .skinfx{position:absolute;inset:0;width:100%;height:100%;z-index:1;display:none;pointer-events:none;}
.hero .hfx{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
.hero .hcyc{position:absolute;top:10px;right:12px;z-index:4;width:30px;height:28px;border-radius:7px;border:1px solid var(--acc);background:rgba(255,59,84,.12);color:var(--acc);font-size:1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}
.hero .hcyc:hover{background:rgba(255,59,84,.26);}
.hero-greet{position:relative;}
.hero.hsk-A{background:linear-gradient(180deg,#16030a,#0c0509);border-color:rgba(255,59,84,.5);box-shadow:inset 0 0 36px rgba(255,59,84,.10),0 14px 36px rgba(0,0,0,.5);}
.hero.hsk-A::after{content:"";position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--acc),transparent);box-shadow:0 0 12px var(--acc);opacity:.5;animation:hsScan 4s linear infinite;z-index:1;pointer-events:none;}
@keyframes hsScan{0%{top:0}100%{top:100%}}
.hero.hsk-B{background:radial-gradient(120% 140% at 80% -20%,rgba(177,75,255,.18),transparent),linear-gradient(180deg,#0a0612,#0c0408);border-color:rgba(177,75,255,.4);}
.hero.hsk-B .starfield{display:block;}
.hero.hsk-B .hero-sub{color:var(--violet);}
.hero.hsk-C{background:linear-gradient(180deg,#14060d,#0b0509);border-color:rgba(52,230,255,.4);}
.hero.hsk-C .hero-bg{background:radial-gradient(42% 75% at 18% 28%,rgba(177,75,255,.30),transparent 62%),radial-gradient(48% 85% at 82% 62%,rgba(52,230,255,.24),transparent 62%),radial-gradient(36% 64% at 55% 16%,rgba(255,61,240,.22),transparent 60%);filter:blur(7px);animation:hsNeb 13s ease-in-out infinite alternate;}
@keyframes hsNeb{0%{opacity:.5;transform:scale(1)}100%{opacity:1;transform:scale(1.12) translate(10px,-6px)}}
.hero.hsk-C .hero-content{border:1px solid rgba(52,230,255,.22);border-radius:12px;background:linear-gradient(120deg,rgba(52,230,255,.05),rgba(177,75,255,.04));box-shadow:inset 0 0 16px rgba(52,230,255,.05);}
.hero.hsk-D{background:#04070d;border-color:rgba(52,230,255,.45);}
.hero.hsk-D .hero-bg{background-image:linear-gradient(rgba(52,230,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(52,230,255,.16) 1px,transparent 1px);background-size:32px 32px;opacity:.5;-webkit-mask:linear-gradient(180deg,transparent,#000 160%);mask:linear-gradient(180deg,transparent,#000 160%);}
.hero.hsk-D .hero-greet b{color:var(--acc2);text-shadow:0 0 14px var(--acc2);}
.hero.hsk-E{background:radial-gradient(130% 150% at 50% 50%,rgba(255,59,84,.10),#08040a 72%);border-color:rgba(255,59,84,.4);}
.hero.hsk-E .skinfx{display:block;}
.hero.hsk-F{background:linear-gradient(180deg,#1a0830,#0b0418);border-color:rgba(177,75,255,.5);}
.hero.hsk-F .hero-bg{background:repeating-linear-gradient(90deg,transparent 0 36px,rgba(255,61,240,.20) 36px 37px),repeating-linear-gradient(0deg,transparent 0 9px,rgba(255,61,240,.14) 9px 10px);opacity:.6;-webkit-mask:linear-gradient(180deg,transparent 40%,#000);mask:linear-gradient(180deg,transparent 40%,#000);}
.hero.hsk-F .hero-greet b{color:var(--magenta);text-shadow:0 0 14px var(--magenta);}
.hero.hsk-G{background:linear-gradient(180deg,#0a0610,#06040a);border-color:rgba(255,59,84,.35);}
  .hero.hsk-H{background:radial-gradient(120% 140% at 80% -20%,rgba(177,75,255,.18),transparent),linear-gradient(180deg,#060512,#0a0610);border-color:rgba(177,75,255,.35);}
.hero.hsk-L{background:linear-gradient(180deg,#0a1326,#04050b);border-color:rgba(52,230,255,.4);}
.hero:fullscreen{height:100vh;border-radius:0;}
.hero.hsk-G .skinfx{display:block;}
.hero-greet.hsGlitch::before,.hero-greet.hsGlitch::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;}
.hero-greet.hsGlitch::before{color:var(--acc2);transform:translate(-2px,1px);animation:hsGx .4s steps(2);}
.hero-greet.hsGlitch::after{color:var(--magenta);transform:translate(2px,-1px);animation:hsGx .4s steps(2) reverse;}
@keyframes hsGx{0%,100%{opacity:0}25%,75%{opacity:.7}}
.hero.hsSurge{animation:hsSurge .6s linear;}
@keyframes hsSurge{0%,100%{box-shadow:0 14px 36px rgba(0,0,0,.5)}25%{box-shadow:0 0 26px var(--acc)}50%{box-shadow:0 14px 36px rgba(0,0,0,.5)}}
.hs-mode{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;}
.hs-mode .qbtn{flex:1;min-width:120px;}
.hs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px;margin:8px 0 4px;}
.hs-opt{position:relative;border:1px solid var(--line);border-radius:10px;overflow:hidden;cursor:pointer;background:#0c0509;}
.hs-opt.on{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc);}
.hs-opt .pv{height:40px;}
.hs-opt .mt{padding:5px 8px;font-size:.72rem;font-weight:600;}
.hs-opt .mt small{display:block;font-weight:400;color:var(--dim);font-size:.62rem;}
.hs-fxrow{display:flex;align-items:center;gap:9px;padding:7px 9px;border:1px solid var(--line);border-radius:9px;margin-bottom:6px;background:#0c0509;}
.hs-fxrow input{width:16px;height:16px;accent-color:var(--acc);cursor:pointer;flex-shrink:0;}
.hs-fxrow .nm{font-size:.82rem;font-weight:600;}
.hs-fxrow .ds{font-size:.66rem;color:var(--dim);}
.hs-fxrow .hs-fire{flex-shrink:0;border:1px solid var(--acc2);color:var(--acc2);background:rgba(52,230,255,.08);border-radius:7px;width:26px;height:26px;cursor:pointer;}
.hs-fxrow .gp{margin-left:auto;flex-shrink:0;font-size:.55rem;letter-spacing:1px;border:1px solid currentColor;border-radius:9px;padding:1px 6px;}
.hs-fxrow .gp.cos{color:var(--violet);}
.hs-fxrow .gp.vmp{color:var(--acc);}
.pvA{background:linear-gradient(180deg,#16030a,#0c0509);}
.pvB{background:radial-gradient(80% 120% at 80% -10%,rgba(177,75,255,.4),#0c0408);}
.pvC{background:linear-gradient(120deg,rgba(52,230,255,.22),rgba(177,75,255,.16));}
.pvD{background:#04070d;background-image:linear-gradient(rgba(52,230,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(52,230,255,.4) 1px,transparent 1px);background-size:10px 10px;}
.pvE{background:radial-gradient(34px 22px at 30% 50%,rgba(255,59,84,.7),#08040a);}
.pvF{background:#140628;background-image:repeating-linear-gradient(90deg,transparent 0 8px,rgba(255,61,240,.5) 8px 9px);}
.pvG{background:radial-gradient(circle at 52% 70%,rgba(255,59,84,.8),transparent 45%),radial-gradient(circle at 28% 32%,rgba(52,230,255,.6),transparent 40%),#0a0610;}
.pvL{background:radial-gradient(circle at 50% 32%,rgba(255,150,60,.75),transparent 42%),linear-gradient(180deg,#0a1326,#04050b);}
#wrap{max-width:var(--cw);margin:0 auto;}
.fullbleed{width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);}
.shell{display:grid;grid-template-columns:2fr 1fr;gap:18px;max-width:none;margin:0;padding:10px 28px 48px;align-items:start;}
.workspace{min-width:0;}
.segwrap{padding:4px 0 14px;}
.seg{position:relative;display:inline-flex;background:var(--panel2);border:1px solid var(--line);border-radius:24px;padding:4px;gap:2px;max-width:100%;overflow:auto;}
.seg button{position:relative;z-index:2;background:none;border:none;color:var(--dim);padding:8px 16px;border-radius:20px;cursor:pointer;font-size:.9rem;white-space:nowrap;transition:color .2s,background .2s;}
.seg button.active{color:#062033;font-weight:600;background:var(--acc);box-shadow:0 0 0 1px var(--acc),0 6px 16px rgba(0,0,0,.45);}
.seg .slider{display:none;position:absolute;z-index:1;top:4px;bottom:4px;background:var(--acc);border-radius:20px;transition:left .28s cubic-bezier(.4,0,.2,1),width .28s cubic-bezier(.4,0,.2,1);}
.workspace{display:flex;gap:14px;align-items:flex-start;}.segwrap{flex:0 0 172px;padding:2px 0 0;}.seg{flex-direction:column;align-items:stretch;gap:4px;border-radius:14px;overflow:visible;width:100%;}.seg button{text-align:left;white-space:normal;border-radius:10px;}#main{flex:1;min-width:0;}@media(max-width:700px){.workspace{display:block;}.segwrap{flex:none;}.seg{flex-direction:row;overflow-x:auto;border-radius:24px;}.seg button{text-align:center;}}
main{min-width:0;}
.view{animation:slidein .28s ease;}
@keyframes slidein{from{opacity:0;transform:translateX(14px);}to{opacity:1;transform:none;}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:18px;box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.03);}
.card h2{font-size:1.1rem;margin-bottom:4px;display:flex;gap:9px;align-items:center;}
.card .sub{color:var(--dim);font-size:.85rem;margin-bottom:14px;}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
input,select,textarea{background:var(--panel2);border:1px solid var(--line);color:var(--txt);padding:9px 11px;border-radius:8px;font-size:.92rem;font-family:inherit;}
input{flex:1 1 140px;}select{flex:1 1 110px;}textarea{flex:1 1 100%;min-height:50px;resize:vertical;}
button.go{background:var(--acc);color:#fff;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer;}button.go:hover{filter:brightness(1.1);}
ul{list-style:none;}li{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid var(--line);}li:last-child{border-bottom:none;}.iname{flex:1;}
.badge{font-size:.7rem;padding:2px 8px;border-radius:20px;border:1px solid var(--line);color:var(--dim);white-space:nowrap;}
.badge.due{color:#fff;background:var(--due);border-color:var(--due);font-weight:600;}.badge.window{color:var(--warn);border-color:var(--warn);}.badge.ok{color:var(--acc2);border-color:var(--acc2);}
.mini{background:none;border:1px solid var(--line);color:var(--dim);padding:4px 10px;font-size:.8rem;cursor:pointer;border-radius:7px;}.mini:hover{color:var(--acc2);border-color:var(--acc2);}
.checked .iname{color:var(--dim);text-decoration:line-through;}
.msg{display:flex;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line);}
.msg .who{display:flex;flex-direction:column;align-items:center;gap:3px;width:56px;flex:0 0 56px;text-align:center;}
.msg .who img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--line);}
.msg .who .ph{width:44px;height:44px;border-radius:50%;background:var(--panel2);display:flex;align-items:center;justify-content:center;color:var(--acc);font-weight:600;border:1px solid var(--line);}
.msg .who small{font-size:.66rem;color:var(--acc);}
.msg .body{flex:1;}.msg .t{color:var(--dim);font-size:.72rem;}
.msg .around{display:flex;gap:4px;margin-top:5px;}.msg .around img{width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid var(--line);}
.empty{color:var(--dim);font-style:italic;padding:12px 4px;}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
.gcell{position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:var(--panel2);}
.gcell img,.gcell video{width:100%;height:120px;object-fit:cover;display:block;cursor:pointer;}
.gcell .cap{padding:6px 8px;font-size:.72rem;color:var(--dim);}.gcell .cap b{color:var(--txt);}
.song{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--line);}
.feature{border-radius:12px;overflow:hidden;margin-bottom:14px;border:1px solid var(--line);position:relative;}
.feature img{width:100%;max-height:320px;object-fit:cover;display:block;}
.feature .cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;padding:16px 14px 10px;font-size:.85rem;}
.gauge{flex:1 1 120px;max-width:180px;background:var(--panel2);border-radius:6px;height:10px;overflow:hidden;}.gauge>div{height:100%;}
.djbox{position:sticky;top:12px;background:rgba(8,6,20,.55);border:1px solid rgba(55,224,255,.35);border-radius:14px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.55),0 0 22px rgba(55,224,255,.12);}
.djhead{padding:12px 16px;border-bottom:1px solid var(--line);font-weight:700;display:flex;align-items:center;gap:8px;}
.djtag{margin-left:auto;font-size:.7rem;color:var(--warn);border:1px solid var(--warn);border-radius:12px;padding:2px 8px;}
.np{padding:14px 16px 4px;text-align:center;}
.npart{width:84px;height:84px;margin:0 auto 8px;border-radius:12px;background:linear-gradient(135deg,#23304a,#10202f);display:flex;align-items:center;justify-content:center;font-size:1.8rem;}
.npt{font-weight:600;}.npa{color:var(--dim);font-size:.85rem;}
.eq{display:flex;align-items:flex-end;justify-content:center;gap:3px;height:28px;margin:10px 0;}
.eq i{width:4px;background:var(--acc);border-radius:2px;height:8px;transition:height .15s;}
.djctl{display:flex;align-items:center;justify-content:center;gap:14px;padding:2px 0 12px;}
.djctl button{background:none;border:none;color:var(--txt);font-size:1.1rem;cursor:pointer;}
.djctl .dplay{width:42px;height:42px;border-radius:50%;background:var(--acc);color:#062033;}
.seekwrap{display:flex;align-items:center;gap:8px;padding:0 12px;margin:6px 0 2px;}
.ttime{font-size:.66rem;color:var(--dim);font-variant-numeric:tabular-nums;min-width:30px;}
.ttime:last-child{text-align:right;}
.seekbar{flex:1;-webkit-appearance:none;appearance:none;height:4px;border-radius:3px;background:rgba(255,255,255,.16);accent-color:var(--acc);cursor:pointer;}
.seekbar::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:var(--acc);cursor:pointer;box-shadow:0 0 8px rgba(55,224,255,.5);}
.djvol{display:flex;align-items:center;gap:8px;padding:4px 12px 2px;}
.vicon{cursor:pointer;font-size:.95rem;}
.volbar{flex:1;-webkit-appearance:none;appearance:none;height:4px;border-radius:3px;background:rgba(255,255,255,.16);accent-color:var(--acc2);cursor:pointer;}
.volbar::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:var(--acc2);cursor:pointer;}
.qrow{user-select:none;}
.qrow.qsel{background:rgba(79,195,247,.18);box-shadow:inset 3px 0 0 var(--acc);}
.djst{display:flex;gap:6px;padding:10px 12px 0;}.dchip{font-size:.76rem;color:var(--dim);border:1px solid var(--line);border-radius:14px;padding:3px 12px;cursor:pointer;}.dchip.on{color:#062033;background:var(--acc);border-color:var(--acc);font-weight:600;}
.qtools{display:flex;gap:6px;flex-wrap:wrap;padding:10px 12px;border-top:1px solid var(--line);}
.qbtn{font-size:.76rem;color:var(--txt);background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:5px 9px;cursor:pointer;}
.qbtn:hover{border-color:var(--acc);}.qbtn.warnb{color:var(--bad);border-color:rgba(255,93,108,.4);}
.qh{padding:6px 14px;font-size:.8rem;color:var(--dim);border-top:1px solid var(--line);}
.qh b{color:var(--acc);}
#ql{max-height:300px;overflow-y:auto;}.acc{border-top:1px solid var(--line);}.acc-h{display:flex;align-items:center;gap:8px;padding:9px 14px;cursor:pointer;font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);user-select:none;background:rgba(255,255,255,.025);}.acc-h:hover{color:var(--acc);background:rgba(79,195,247,.06);}.acc-c{display:inline-block;transition:transform .18s;font-size:.66rem;color:var(--acc);}.acc.collapsed .acc-c{transform:rotate(-90deg);}.acc.collapsed .acc-b{display:none;}.acc-b{padding:2px 0 6px;}#qlwrap{position:relative;}#qlpin{position:absolute;left:0;right:0;z-index:5;}#qlpin .qrow{background:#11212f;box-shadow:inset 3px 0 0 var(--acc);border-bottom:1px solid rgba(79,195,247,.35);}
.qrow{display:flex;align-items:center;gap:8px;padding:7px 14px;font-size:.85rem;border-bottom:1px solid rgba(42,48,64,.5);cursor:pointer;}
.qrow.cur{color:var(--acc);}.qrow:hover{background:var(--panel2);}
.mqstrip{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 10px;max-height:64px;overflow-y:auto;}
.mqpill{display:inline-flex;align-items:center;gap:4px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:2px 4px 2px 10px;font-size:.74rem;max-width:200px;}
.mqpill-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.mqpill-x{cursor:pointer;color:var(--dim);font-weight:700;padding:0 5px;border-radius:50%;}.mqpill-x:hover{color:var(--bad);}
.mqempty{font-size:.78rem;color:var(--dim);}
.qm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.qx{background:none;border:none;color:var(--dim);cursor:pointer;font-size:.9rem;}.qx:hover{color:var(--bad);}
.qempty{padding:16px 14px;color:var(--dim);font-size:.85rem;text-align:center;}
footer{text-align:center;color:#5a5f6b;font-size:.76rem;padding:10px 22px 22px;}
@media(max-width:900px){.shell{grid-template-columns:1fr;}.djbox{position:static;}}
.rotwrap{max-width:540px;}
.rotcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px;box-shadow:0 10px 26px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.03);}
.rothead{font-size:1rem;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.stamp{display:inline-flex;align-items:center;gap:6px;font-size:.62rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#0c1a10;background:linear-gradient(135deg,#9ee6a6,#5bbf6a);border:1px solid #3e8a4d;padding:5px 11px;border-radius:6px;box-shadow:0 3px 9px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.4);transform:rotate(-2.2deg);}
.stamp.sm{font-size:.55rem;padding:3px 8px;transform:rotate(-1.5deg);}
.vhead{display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap;}
.vhead h2{font-size:1.5rem;letter-spacing:.01em;text-shadow:0 2px 8px rgba(0,0,0,.5);}
.mqbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:linear-gradient(135deg,#10131b,#0b0d12);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:20px;box-shadow:0 8px 22px rgba(0,0,0,.5);}
.mqbar .lab{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);}
.mqchip{display:inline-flex;align-items:center;gap:7px;background:var(--panel2);border:1px solid var(--line);border-radius:20px;padding:4px 6px 4px 11px;font-size:.8rem;}
.mqchip .x{cursor:pointer;color:var(--dim);font-weight:700;padding:0 4px;}.mqchip .x:hover{color:var(--bad);}
.mqclr{margin-left:auto;cursor:pointer;font-size:.72rem;color:var(--dim);border:1px solid var(--line);border-radius:7px;padding:4px 10px;}.mqclr:hover{color:var(--bad);border-color:var(--bad);}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:16px;}
.mcard{position:relative;background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 8px 22px rgba(0,0,0,.5);transition:transform .16s,box-shadow .16s,border-color .16s;}
.mcard:hover{transform:translateY(-5px);box-shadow:0 18px 38px rgba(0,0,0,.62);border-color:var(--acc);}
.mposter{height:118px;display:flex;align-items:center;justify-content:center;font-size:2.3rem;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.94);text-shadow:0 4px 12px rgba(0,0,0,.6);}
.mbody{padding:11px 13px 13px;}
.mtitle{font-size:.95rem;font-weight:600;line-height:1.25;margin-bottom:3px;}
.mmeta{font-size:.7rem;color:var(--dim);margin-bottom:6px;}
.mstars{font-size:.86rem;letter-spacing:1.5px;color:#f6c945;margin-bottom:7px;text-shadow:0 1px 3px rgba(0,0,0,.5);}
.mstars .tier{font-size:.58rem;color:var(--dim);letter-spacing:.05em;margin-left:7px;text-transform:uppercase;}
.mdesc{font-size:.74rem;color:#c2c8d6;line-height:1.42;margin-bottom:8px;min-height:3.1em;}
.mlast{font-size:.65rem;color:var(--dim);margin-bottom:10px;}
.mbtns{display:flex;gap:7px;}
.mbtn{flex:1;cursor:pointer;font-size:.74rem;font-weight:600;padding:7px 8px;border-radius:8px;border:1px solid var(--acc);background:rgba(79,195,247,.12);color:var(--acc);text-align:center;transition:background .12s;}
.mbtn:hover{background:rgba(79,195,247,.26);}
.mbtn.on{background:rgba(129,199,132,.25);border-color:var(--acc2);color:var(--acc2);}
.mser{margin:0 0 22px;}
.mserhead{display:flex;align-items:center;gap:12px;margin:4px 0 13px;flex-wrap:wrap;}
.mserhead h3{font-size:1.1rem;}
.mserhead .scount{font-size:.7rem;color:var(--dim);}
.serbtn{cursor:pointer;font-size:.72rem;font-weight:600;padding:6px 13px;border-radius:8px;border:1px solid var(--acc2);background:rgba(129,199,132,.12);color:var(--acc2);}
.serbtn:hover{background:rgba(129,199,132,.26);}
.msub{color:var(--dim);font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;margin:6px 0 12px;}
.qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(252px,1fr));gap:16px;}
.qcard{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:16px;box-shadow:0 8px 22px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:7px;}
.qtext{font-size:.95rem;line-height:1.42;}
.qauth{font-size:.78rem;color:var(--acc);}
.qsrc{color:var(--dim);font-size:.68rem;}
.qsub{font-size:.74rem;color:var(--dim);font-style:italic;}
.qfoot{margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:8px;flex-wrap:wrap;}
.qheart{cursor:pointer;font-size:.85rem;color:#ff8aa3;border:1px solid var(--line);border-radius:20px;padding:3px 11px;user-select:none;transition:background .12s,border-color .12s;}
.qheart:hover{border-color:#ff8aa3;}
.qheart.on{background:rgba(255,138,163,.16);border-color:#ff8aa3;}
.qwho{font-size:.66rem;color:var(--dim);}
.qform{display:flex;flex-direction:column;gap:8px;margin-top:12px;max-width:560px;}
.qform textarea,.qform input{background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt);padding:9px 11px;font:inherit;font-size:.85rem;}
.qform .go{align-self:flex-start;}
.qpend{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:11px 0;border-top:1px solid var(--line);}
.qpb{display:flex;gap:6px;flex:0 0 auto;}
.mini.ok{border-color:var(--acc2);color:var(--acc2);}
.hero-fav{font-size:.68rem;color:#ff8aa3;margin-top:5px;min-height:.9em;}
.nuke{cursor:pointer;font-size:.82rem;line-height:1;padding:5px 7px;border:1px solid rgba(239,83,80,.5);border-radius:7px;background:rgba(239,83,80,.1);user-select:none;transition:background .12s,box-shadow .12s;}
.nuke:hover{background:rgba(239,83,80,.28);box-shadow:0 0 10px rgba(239,83,80,.4);}
.loglist{list-style:none;margin-top:10px;}
.loglist li{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line);flex-wrap:wrap;}
.lkind{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:5px;background:var(--panel2);border:1px solid var(--line);color:var(--dim);}
.lkind.t-movie{color:var(--acc);border-color:var(--acc);}
.lkind.t-media{color:var(--warn);border-color:var(--warn);}
.loglist .lby{font-size:.72rem;color:var(--dim);margin-left:auto;}
.lreason{flex:1 1 100%;font-size:.72rem;color:var(--warn);background:rgba(255,183,77,.08);border-left:2px solid var(--warn);padding:4px 8px;border-radius:4px;margin-top:2px;}
.dt-bar{margin-bottom:10px;}
.dt-search{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;color:var(--txt);padding:9px 12px;font:inherit;font-size:.88rem;}
.dt-sub{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:10px;flex-wrap:wrap;}
.dt-meta{font-size:.72rem;color:var(--dim);}
.dt-tools{display:flex;gap:6px;}
.dt-btn{cursor:pointer;font-size:.72rem;padding:4px 10px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--dim);}
.dt-btn:hover{color:var(--txt);border-color:var(--acc);}
.dt-scroll{overflow:auto;border:1px solid var(--line);border-radius:10px;max-height:62vh;box-shadow:0 8px 22px rgba(0,0,0,.35);}
.dt-tbl{width:100%;border-collapse:collapse;font-size:.84rem;}
.dt-tbl thead th{position:sticky;top:0;background:var(--panel);text-align:left;font-weight:600;color:var(--dim);font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border-bottom:1px solid var(--line);white-space:nowrap;z-index:1;}
.dt-tbl th.srt{cursor:pointer;user-select:none;}
.dt-tbl th.srt:hover{color:var(--acc);}
.dt-tbl td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top;}
.dt-tbl tbody tr:nth-child(even){background:rgba(255,255,255,.018);}
.dt-tbl tbody tr:hover{background:rgba(79,195,247,.07);}
.dt-tbl.dense td,.dt-tbl.dense thead th{padding:4px 10px;}
.dt-empty{text-align:center;color:var(--dim);padding:18px;}
.dtc.sel{background:rgba(79,195,247,.22) !important;box-shadow:inset 0 0 0 1px rgba(79,195,247,.55);}
.dt-tip{position:fixed;z-index:500;background:#0b0d12;border:1px solid var(--acc);border-radius:10px;padding:9px 12px;font-size:.78rem;color:var(--txt);box-shadow:0 12px 30px rgba(0,0,0,.6);max-width:226px;pointer-events:none;}
.dt-tip .tt-h{font-weight:600;color:var(--acc);margin-bottom:2px;}
.dt-tip .tt-r{font-size:.66rem;color:var(--dim);margin-bottom:6px;}
.dt-tip .tt-g{line-height:1.55;}
.dt-pin,.dt-hide{cursor:pointer;opacity:.3;font-size:.7rem;margin-left:5px;}
.dt-pin:hover,.dt-hide:hover{opacity:1;}
.dt-hide:hover{color:var(--bad);}
.dthd.frz,.dtc.frz{position:sticky;z-index:2;box-shadow:1px 0 0 rgba(79,195,247,.35);}
.dthd.frz{z-index:3;background:rgba(79,195,247,.15) !important;}
.dtc.frz{background:rgba(79,195,247,.09) !important;}
.dt-reset{cursor:pointer;font-size:.72rem;padding:4px 10px;border-radius:7px;border:1px solid var(--acc);background:rgba(79,195,247,.12);color:var(--acc);}
.dt-reset:hover{background:rgba(79,195,247,.26);}
.aukinds{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0;}
.aukind{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;padding:3px 9px;border-radius:6px;border:1px solid var(--line);background:var(--panel2);color:var(--dim);cursor:pointer;user-select:none;}
.aukind.off{opacity:.35;text-decoration:line-through;}
.aukind.k-login{color:#9aa3b5;}.aukind.k-play{color:var(--acc2);}.aukind.k-view{color:var(--acc);}.aukind.k-post{color:#b39ddb;}.aukind.k-upload{color:#36c8ff;}.aukind.k-delete{color:var(--bad);}.aukind.k-error{color:var(--warn);}
.auchips{font-size:.72rem;color:var(--dim);margin:4px 0;}
.auchip{display:inline-block;cursor:pointer;background:rgba(239,83,80,.12);border:1px solid rgba(239,83,80,.4);color:#ff8a93;border-radius:20px;padding:2px 9px;margin:2px 4px 2px 0;}
.aulist{margin-top:10px;display:flex;flex-direction:column;gap:1px;}
.aurow{display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid var(--line);flex-wrap:wrap;font-size:.82rem;}
.aurow .aukind{flex:0 0 auto;}
.autag{font-size:.66rem;color:var(--dim);background:var(--panel2);border:1px solid var(--line);border-radius:5px;padding:2px 7px;}
.aurow .auby{font-size:.72rem;color:var(--dim);margin-left:auto;}
.av{width:34px;height:34px;border-radius:50%;object-fit:cover;display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#fff;flex:0 0 auto;}
.av.init{box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);text-shadow:0 1px 2px rgba(0,0,0,.4);}
.profrow{display:flex;align-items:center;gap:12px;margin-top:10px;}
.profrow .av{width:48px;height:48px;font-size:1rem;}
.avpick{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.avpick img{width:54px;height:54px;object-fit:cover;border-radius:10px;cursor:pointer;border:2px solid transparent;transition:border-color .12s;}
.avpick img:hover{border-color:var(--acc);}
.ministrip{position:fixed;top:0;left:0;right:0;height:48px;background:rgba(10,12,18,.96);backdrop-filter:blur(8px);border-bottom:1px solid rgba(55,224,255,.3);display:flex;align-items:center;gap:14px;padding:0 16px;z-index:60;transform:translateY(-110%);transition:transform .28s ease;box-shadow:0 8px 22px rgba(0,0,0,.55);}
.ministrip.on{transform:translateY(0);}
.ms-player{display:flex;align-items:center;gap:8px;min-width:0;}
.ms-player button{background:var(--acc);color:#062033;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:.78rem;line-height:1;flex:0 0 auto;}
.ms-player #msNext{background:transparent;color:var(--txt);border:1px solid var(--line);}
.ms-title{font-size:.82rem;color:var(--txt);max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ms-quote{margin-left:auto;font-size:.78rem;color:var(--dim);font-style:italic;max-width:48%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;}
.hero.mini{min-height:0;margin-top:4px;}
.hero.mini .hero-q,.hero.mini .hero-sub,.hero.mini .hero-fav,.hero.mini .hero-a{opacity:0;}
.hero.mini .hero-content{padding-top:8px;padding-bottom:8px;}
.flagbadge{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#ffd27a;background:rgba(255,183,77,.15);border:1px solid rgba(255,183,77,.5);border-radius:5px;padding:2px 7px;margin-left:8px;}
.flagbtn{margin-left:6px;}
.msg.flagged{border-left:3px solid var(--warn);background:rgba(255,183,77,.05);padding-left:10px;border-radius:8px;}
.card.review{border:1px solid var(--bad);box-shadow:0 0 18px rgba(239,83,80,.2),0 10px 26px rgba(0,0,0,.45);}
.card.review h2{color:#ff8a93;}
.revrow{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;padding:10px 0;border-top:1px solid var(--line);font-size:.86rem;}
.revrow .qsrc{color:var(--bad);}
.catgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:10px;}
.catcard{border:1px solid var(--line);border-radius:12px;padding:14px;cursor:pointer;background:rgba(255,255,255,.02);transition:transform .12s,border-color .12s,background .12s;}
.catcard:hover{transform:translateY(-2px);border-color:var(--accent,#6aa9ff);background:rgba(255,255,255,.05);}
.catcard.hh{border-color:rgba(255,183,77,.55);background:rgba(255,183,77,.07);}
.catcard .cic{font-size:1.5rem;}.catcard .cnm{font-weight:700;margin-top:4px;}.catcard .cds{font-size:.78rem;opacity:.7;margin-top:3px;}
.fback{margin-bottom:8px;}
.permcard{margin-top:14px;}.permtbl{width:100%;border-collapse:collapse;margin-top:8px;font-size:.84rem;}
.permtbl th,.permtbl td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);}
.permtbl th:nth-child(2),.permtbl th:nth-child(3),.permtbl td:nth-child(2),.permtbl td:nth-child(3){text-align:center;}
.permtog{font-size:.78rem;cursor:pointer;}.inbadge{font-size:.62rem;font-weight:700;text-transform:uppercase;color:#7fe0a0;background:rgba(60,200,120,.15);border:1px solid rgba(60,200,120,.5);border-radius:5px;padding:1px 6px;margin-left:6px;}
.msg .body a{color:var(--accent,#6aa9ff);word-break:break-all;}
.qnuke{background:none;border:none;color:#ff8a93;cursor:pointer;font-size:.78rem;padding:0 4px;opacity:.8;}
.qnuke:hover{opacity:1;}
.utable{display:flex;flex-direction:column;gap:8px;margin-top:10px;}
.urow{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);flex-wrap:wrap;box-shadow:0 4px 14px rgba(0,0,0,.3);}
.urow .uinfo{min-width:150px;}
.urole{background:var(--panel);border:1px solid var(--line);color:var(--txt);border-radius:7px;padding:5px 8px;font:inherit;font-size:.8rem;}
.ulists{display:flex;gap:12px;flex-wrap:wrap;flex:1;}
.ulist{display:flex;align-items:center;gap:5px;font-size:.78rem;color:var(--dim);}
.ulist input{width:auto;flex:0 0 auto;}
.badge.super{background:linear-gradient(135deg,#d4af37,#a8821f);color:#1a1407;border-color:#a8821f;font-weight:700;}
.listchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
.libnav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.libchip{cursor:pointer;font-size:.82rem;font-weight:500;padding:7px 14px;border-radius:20px;border:1px solid var(--line);background:var(--panel2);color:var(--dim);user-select:none;transition:background .12s,color .12s,border-color .12s;}
.libchip:hover{color:var(--txt);border-color:var(--acc);}
.libchip.on{background:var(--acc);color:#062033;border-color:var(--acc);font-weight:600;}.libnav{flex-wrap:nowrap;overflow-x:auto;-ms-overflow-style:none;scrollbar-width:none;}.libnav::-webkit-scrollbar{width:0;height:0;display:none;}.libchip{flex:0 0 auto;}.libwrapr{position:relative;}.cf{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;}.libtile,.libtiles,.libnp,.libnprow,.libsub,.cfc,.cffront,.cftag,.cfd-title2,.cfd-meta,.cfprog,.cfinfo,.pslayer,.psprite,.lcat{-webkit-user-select:none;user-select:none;}#cflabels,#cflabels *,.cf *,.cfwrap,.arcadeNudge,.libtiles *,.libnp *{-webkit-user-select:none;user-select:none;}.cf.lgrab{cursor:grabbing;}.cf::-webkit-scrollbar{display:none;}.libgear{position:absolute;top:0;right:2px;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:rgba(10,16,28,.7);color:var(--acc);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:25;}.libgear:hover{border-color:var(--acc);box-shadow:0 0 14px rgba(79,195,247,.4);}.libset{position:absolute;top:42px;right:2px;width:226px;z-index:45;background:linear-gradient(160deg,rgba(16,24,42,.98),rgba(9,13,24,.98));border:1px solid var(--acc);border-radius:12px;padding:12px;box-shadow:0 16px 44px rgba(0,0,0,.6),0 0 22px rgba(79,195,247,.25);display:none;}.libset.open{display:block;}.libset .lsrow{margin:8px 0;}.libset .lsl{display:flex;justify-content:space-between;font-size:.7rem;color:var(--dim);margin-bottom:3px;}.libset .lsv{color:var(--acc);font-weight:600;}.libset input[type=range]{width:100%;accent-color:var(--acc);}.cfbadge{position:absolute;top:8px;right:8px;font-size:.6rem;font-weight:600;color:var(--acc);background:rgba(8,12,22,.85);border:1px solid var(--acc);border-radius:10px;padding:1px 6px;z-index:6;}.cfprog{display:flex;align-items:center;gap:8px;margin-top:6px;}.cfprog .pa{flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:1px solid var(--acc);background:rgba(79,195,247,.14);color:var(--acc);cursor:pointer;font-size:.78rem;line-height:1;padding:0;}.cfprog .pbar{position:relative;flex:1;height:6px;border-radius:4px;background:rgba(255,255,255,.12);cursor:pointer;}.cfprog .pbar i{position:absolute;left:0;top:0;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--acc),var(--acc2));}.cfprog .pct{font-size:.66rem;color:#cdd3df;min-width:30px;text-align:right;}.libchip{position:relative;padding:10px 16px;border-radius:12px;background:linear-gradient(160deg,rgba(18,26,44,.92),rgba(10,15,26,.85));}.libchip.on{background:rgba(79,195,247,.14);color:var(--txt);box-shadow:0 0 0 1px var(--acc),0 0 16px rgba(79,195,247,.35);}.libchip::before,.libchip::after{content:"";position:absolute;width:7px;height:7px;border-color:var(--acc);opacity:.55;}.libchip::before{left:4px;top:4px;border-left:2px solid;border-top:2px solid;}.libchip::after{right:4px;bottom:4px;border-right:2px solid;border-bottom:2px solid;}
.libtiles{display:flex;flex-wrap:wrap;gap:8px;padding:2px 2px 6px;margin-bottom:8px;}
.libtiles::-webkit-scrollbar{width:0;height:0;display:none;}
.libtile{flex:1 1 96px;min-width:0;max-width:180px;position:relative;background:linear-gradient(160deg,rgba(18,26,44,.92),rgba(10,15,26,.85));border:1px solid var(--line);border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;}
.libtile:hover{border-color:var(--acc);transform:translateY(-2px);}
.libtile.on{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc),0 0 16px rgba(79,195,247,.3);}
.libtile .ti{font-size:20px;line-height:1;}
.libtile .tn{font-size:.74rem;font-weight:500;margin-top:6px;color:var(--txt);}
.libtile .tc{font-size:.6rem;color:var(--dim);margin-top:1px;}
.libtile .chk{position:absolute;top:5px;right:6px;width:15px;height:15px;border-radius:50%;border:1px solid var(--line);color:#06121f;font-size:10px;line-height:14px;background:transparent;transition:.15s;}
.libtile.on .chk{background:var(--acc);border-color:var(--acc);box-shadow:0 0 8px var(--acc);}
.libtile.alt .chk{display:none;}
.libsub{font-size:.74rem;color:var(--dim);margin:0 2px 12px;display:flex;align-items:center;gap:8px;}
.libsub .libclear{color:var(--acc);cursor:pointer;border:1px solid var(--line);border-radius:8px;padding:1px 9px;}
.libsub .libclear:hover{border-color:var(--acc);}
.cftag{position:absolute;top:8px;left:8px;z-index:6;font-size:.58rem;letter-spacing:.04em;text-transform:uppercase;color:#cfe9ff;background:rgba(8,16,28,.78);border:1px solid var(--line);border-radius:8px;padding:1px 6px;}
.libnp{margin:0 0 14px;}.libnplbl{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:0 2px 8px;}.libnprow{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;padding:2px;}.libnprow::-webkit-scrollbar{width:0;height:0;display:none;}.libnpc{flex:0 0 182px;background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:10px 12px;position:relative;overflow:hidden;}.libnpc::before{content:"";position:absolute;left:0;top:0;width:3px;height:100%;background:var(--acc);box-shadow:0 0 10px var(--acc);}.libnpc .npt{font-size:13px;font-weight:500;margin-bottom:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.libnpc .npbar{height:6px;border-radius:4px;background:rgba(255,255,255,.09);overflow:hidden;}.libnpc .npbar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),var(--acc2));}.libnpc .nppct{font-size:10px;color:var(--dim);margin-top:6px;}
.psprite{position:absolute;left:0;top:0;will-change:transform;image-rendering:pixelated;filter:drop-shadow(0 3px 3px rgba(0,0,0,.55));}.pslayer{position:absolute;inset:0;pointer-events:none;z-index:40;overflow:visible;}#seg button.arcShim{box-shadow:0 0 20px rgba(177,75,255,.9),0 0 0 1px #b14bff inset !important;background:rgba(177,75,255,.18) !important;}#seg button.arcRumble{animation:arcRumble .55s linear;}@keyframes arcRumble{0%,100%{transform:translate(0,0);}20%{transform:translate(-2px,1px);}40%{transform:translate(2px,-1px);}60%{transform:translate(-2px,0);}80%{transform:translate(2px,1px);}}.arcadeNudge{margin:0 0 14px;padding:10px 14px;border:1px solid var(--acc);border-radius:11px;background:rgba(79,195,247,.12);color:var(--txt);font-weight:500;box-shadow:0 0 16px rgba(79,195,247,.25);}
#seg button.hot{animation:gtabHot 1.15s cubic-bezier(.34,1.56,.64,1) infinite;z-index:50;position:relative;transform-origin:center bottom;box-shadow:0 14px 26px rgba(0,0,0,.55),0 0 22px rgba(255,255,255,.22);}#seg button.hot:not(.active){background:rgba(130,150,190,.16);}@keyframes gtabHot{0%{transform:translateY(-7px) rotate(-2deg) scale(1.02);}30%{transform:translateY(-12px) rotate(2deg) scale(1.06);}55%{transform:translateY(-9px) rotate(-1.4deg) scale(1.04);}80%{transform:translateY(-12px) rotate(1.6deg) scale(1.05);}100%{transform:translateY(-7px) rotate(-2deg) scale(1.02);}}.libsig{margin-top:16px;font-size:11px;color:var(--dim);display:flex;gap:12px;flex-wrap:wrap;align-items:center;border-top:1px solid var(--line);padding-top:11px;}.libsig .ok{color:var(--acc2);}.libsig .wd{margin-left:auto;color:var(--acc);font-style:italic;}
.radlist{display:flex;flex-direction:column;gap:6px;margin-top:10px;}
.radrow{display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);cursor:pointer;transition:border-color .12s,background .12s;}
.radrow:hover{border-color:var(--acc);background:rgba(79,195,247,.07);}
.raddot{width:8px;height:8px;border-radius:50%;background:var(--acc);flex:0 0 auto;box-shadow:0 0 8px var(--acc);}
.radg{color:var(--dim);font-size:.78rem;}
.radplay{margin-left:auto;color:var(--acc);font-size:.9rem;}
.cf{position:relative;height:32vh;min-height:230px;max-height:360px;margin:14px 0 8px;perspective:1100px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.cfstage{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;}
.cfc{position:absolute;left:0;top:0;width:190px;height:285px;transform:translate(-50%,-50%);transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .45s;cursor:pointer;}
.cfflip{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s;}
.cfc.flipped .cfflip{transform:rotateY(180deg);}
.cffront,.cfback{position:absolute;inset:0;border-radius:12px;overflow:hidden;backface-visibility:hidden;box-shadow:0 18px 40px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.08);}
.cfback{transform:rotateY(180deg);background-size:cover;background-position:center;}
.cfc.center .cffront{box-shadow:0 24px 60px rgba(0,0,0,.7),0 0 30px rgba(79,195,247,.28);border-color:var(--acc);}
.cfposter{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
.cfposter.cover{background-size:cover;background-position:center;}
.cfposter.cover::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.5);}
.cfinit{font-size:2.4rem;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.95);text-shadow:0 3px 10px rgba(0,0,0,.6);}
.cfinfo{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;padding:12px;background:linear-gradient(to top,rgba(0,0,0,.88) 32%,rgba(0,0,0,.12));opacity:0;transition:opacity .3s;pointer-events:none;}
.cfc.center .cfinfo{opacity:1;pointer-events:auto;}
.cfinfo .cfd-title{font-size:.92rem;font-weight:600;line-height:1.2;}
.cfinfo .cfd-meta{font-size:.66rem;color:#cdd3df;}
.cfinfo .cfd-desc{font-size:.68rem;color:#c2c8d6;line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.cfinfo .cfd-btns{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px;}
.cfinfo .mbtn{padding:5px 9px;font-size:.66rem;}
.cflabels{position:relative;height:84px;margin:6px 0 2px;}
.cflabel{position:absolute;left:50%;top:0;width:160px;margin-left:-80px;text-align:center;transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .45s,font-size .45s;cursor:pointer;}
.cfl-title{font-weight:600;line-height:1.15;color:#aeb6c6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cflabel.center .cfl-title{color:var(--txt);text-shadow:0 0 12px rgba(79,195,247,.4);}
.cfl-stat{font-size:.6rem;margin-top:2px;font-weight:500;}
.st-play{color:var(--acc2);}.st-queue{color:var(--acc);}.st-sync{color:var(--warn);}.st-add{color:var(--dim);}
.cfnav{position:absolute;top:50%;transform:translateY(-50%);z-index:300;background:rgba(8,10,16,.7);border:1px solid var(--line);color:var(--txt);width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:1.3rem;line-height:1;}
.cfnav.cfprev{left:6px;}.cfnav.cfnext{right:6px;}
.cfnav:hover{border-color:var(--acc);color:var(--acc);}
.cfdetail{text-align:center;max-width:560px;margin:0 auto;}
.cfd-title{font-size:1.3rem;font-weight:600;margin-bottom:4px;}
.cfd-meta{font-size:.8rem;color:var(--dim);margin-bottom:8px;}
.cfd-desc{font-size:.85rem;color:#c2c8d6;margin-bottom:12px;line-height:1.45;min-height:2.6em;}
.cfd-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
.cfd-btns .mbtn{flex:0 0 auto;padding:8px 16px;}
.mvmode{position:relative;width:100%;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.7);}
.mvvideo{width:100%;max-height:74vh;display:block;background:#000;}
.mvbar{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(180deg,rgba(0,0,0,.72),transparent);transition:opacity .4s;}
.mvbar.hide{opacity:0;}
.mvtitle{color:#fff;font-size:.9rem;}.mvspacer{flex:1;}
.mvbtn{background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.35);color:#fff;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.8rem;}
.mvbtn:hover{border-color:var(--acc);}
.mvbtn.on{background:var(--acc);color:#062033;border-color:var(--acc);}.mvbtn.sm{padding:4px 9px;font-size:.78rem;}
.mvmini{position:fixed;right:18px;bottom:18px;width:340px;max-width:46vw;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.75);border:1px solid rgba(255,255,255,.14);z-index:600;}
.mvmini-v{width:100%;display:block;background:#000;max-height:42vh;}
.mvmini-bar{display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(8,10,16,.92);}
.mvmini-t{color:#fff;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;}
.reelbar{display:flex;align-items:center;gap:12px;margin:6px 2px 2px;flex-wrap:wrap;}
.rb-l{font-size:.82rem;color:var(--dim);font-weight:600;}
.rb-sel{background:var(--panel2);color:var(--txt);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:.82rem;cursor:pointer;}
.rb-spring{display:flex;align-items:center;gap:8px;flex:1;min-width:220px;}
.rb-cap{color:var(--dim);font-size:1rem;font-weight:700;}
.rb-jog{flex:1;accent-color:var(--acc);}
.cfd-title2{font-size:.95rem;font-weight:700;line-height:1.15;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7);}
.cfl-field{color:var(--acc);font-weight:600;}
.mbtn.rec{border-color:#e6886a;color:#e6886a;background:rgba(230,136,106,.12);}
.mbtn.rec.on{background:#e6886a;color:#1a0e08;}
.cfc.recycled .cffront{outline:2px dashed #e6886a;outline-offset:-2px;opacity:.7;}
.mqctrls{display:flex;gap:6px;flex-wrap:wrap;margin-left:6px;}
.mqbtn{cursor:pointer;font-size:.74rem;font-weight:600;padding:5px 11px;border-radius:8px;border:1px solid var(--acc2);background:rgba(129,199,132,.12);color:var(--acc2);user-select:none;transition:background .12s;}
.mqbtn:hover{background:rgba(129,199,132,.26);}
.mqbtn.sync{border-color:var(--acc);background:rgba(79,195,247,.12);color:var(--acc);}
.mqbtn.sync:hover{background:rgba(79,195,247,.26);}
.mbtn.play{border-color:var(--acc2);background:rgba(129,199,132,.18);color:var(--acc2);}
.mbtn.play:hover{background:rgba(129,199,132,.32);}
.mbtn.req{border-color:var(--warn);background:rgba(255,183,77,.12);color:var(--warn);}
.mbtn.req:hover{background:rgba(255,183,77,.26);}
.mbtn.syncing{border-color:var(--line);background:var(--panel2);color:var(--dim);cursor:default;}
.vov{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:120;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
.vbox{width:min(900px,96vw);background:#0b0d12;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.7);}
.vtop{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--line);}
.vx{cursor:pointer;color:var(--dim);font-size:1.1rem;padding:0 6px;}.vx:hover{color:var(--bad);}
.vbox video{width:100%;display:block;background:#000;border-radius:0 0 14px 14px;}
.rotcap{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.rotcap input{flex:1;}
.rotcap b{font-size:1.3rem;min-width:74px;text-align:right;}
.rotrow{display:flex;align-items:center;gap:10px;margin:8px 0;}
.rotdot{width:11px;height:11px;border-radius:3px;flex:0 0 auto;}
.rotlab{flex:0 0 150px;font-size:.85rem;color:var(--dim);}.rotlab b{color:var(--txt);}
.rotrow input[type=range]{flex:1;background:transparent;}
.rotout{flex:0 0 78px;text-align:right;font-size:.85rem;color:var(--dim);}.rotout b{color:var(--txt);font-size:1rem;}
.rottot{font-size:.8rem;color:var(--dim);margin-bottom:8px;}
.rotbar{display:flex;height:36px;border-radius:8px;overflow:hidden;border:1px solid var(--line);position:relative;background:var(--panel2);margin:4px 0;}
.rotseg{display:flex;align-items:center;justify-content:center;font-size:.72rem;color:#062033;font-weight:600;overflow:hidden;white-space:nowrap;}
.rotfree{position:absolute;top:-3px;bottom:-3px;border-left:2px dashed var(--dim);}
.rotup{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}
.rotchip{flex:1;min-width:130px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:.75rem;color:var(--dim);}.rotchip b{display:block;color:var(--txt);font-size:1rem;}
.rotcoll{cursor:pointer;user-select:none;}
.pl details{border:1px solid var(--line);border-radius:10px;margin-bottom:8px;overflow:hidden;background:var(--panel);}
.pl summary{list-style:none;cursor:pointer;padding:11px 14px;display:flex;align-items:center;gap:10px;font-weight:600;}
.pl summary::-webkit-details-marker{display:none;}
.pl .chev{transition:transform .15s;color:var(--dim);display:inline-block;}
.pl details[open] .chev{transform:rotate(90deg);}
.pl .pdot{width:10px;height:10px;border-radius:3px;flex:0 0 auto;}
.pl .cnt{margin-left:auto;font-size:.78rem;color:var(--dim);}
.pl .pbody{padding:4px 14px 12px 34px;}
.pl .pitem{display:flex;gap:8px;padding:4px 0;font-size:.85rem;align-items:baseline;}
.pl .pitem .pd{margin-left:auto;color:var(--dim);white-space:nowrap;}
.pl .ptag{font-size:.7rem;font-weight:600;padding:1px 7px;border-radius:10px;white-space:nowrap;flex:0 0 auto;}
.pl .t-in{background:rgba(129,199,132,.18);color:var(--acc2);}
.pl .t-live{background:rgba(79,195,247,.18);color:var(--acc);}
.pl .t-out{background:rgba(255,183,69,.18);color:var(--warn);}
.pl .t-gone{background:rgba(255,93,108,.18);color:var(--bad);}
.pl .plegend{margin-top:10px;padding-top:8px;border-top:1px solid var(--line);font-size:.78rem;color:var(--dim);line-height:1.9;}
.pl .plegend b{color:var(--txt);}
.pl .pushcmd{display:flex;gap:8px;align-items:center;margin:8px 0;}
.pl .pushcmd code{flex:1;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:.76rem;color:var(--acc2);overflow:auto;white-space:nowrap;}
#spacePod{position:fixed;left:14px;bottom:14px;width:212px;background:rgba(8,6,20,.85);border:1px solid rgba(55,224,255,.35);border-radius:12px;padding:10px 12px;font-size:12px;color:var(--txt);backdrop-filter:blur(6px);z-index:60;}
#spacePod .sp-t{font-weight:700;margin-bottom:6px;}
#spaceX{position:absolute;top:5px;right:8px;background:none;border:none;color:var(--dim);cursor:pointer;font-size:12px;}
#spaceX:hover{color:var(--acc);}
#spacePod .sp-bar{position:relative;height:8px;background:var(--panel2);border-radius:5px;overflow:hidden;margin:2px 0 6px;}
#spaceFill{height:100%;width:0;background:var(--acc2);transition:width .3s,background .3s;}
#spacePod .sp-n{color:var(--dim);}
@media(max-width:640px){#spacePod{display:none;}}
.note-cta{display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid #00e5ff;background:rgba(0,229,255,.10);color:#bff6ff;font-weight:700;font-size:.85rem;padding:7px 14px;border-radius:999px;margin-left:10px;box-shadow:0 0 16px rgba(0,229,255,.35);transition:.15s;vertical-align:middle;}
.note-cta:hover{background:rgba(0,229,255,.18);box-shadow:0 0 22px rgba(0,229,255,.55);}
.note-cta:active{transform:scale(.96);}
.note-cta .nc-h{opacity:.7;font-weight:500;}
#nqWrap{position:fixed;inset:0;z-index:999;display:none;align-items:flex-start;justify-content:center;background:rgba(4,5,12,.72);backdrop-filter:blur(4px);padding:6vh 16px 16px;}
#nqWrap.on{display:flex;}
.nq{width:100%;max-width:440px;background:#10122a;border:1px solid rgba(120,150,230,.22);border-radius:18px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:nqin .25s ease;}
@keyframes nqin{from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:none;}}
.nq h3{margin:0 0 2px;font-size:1.35rem;background:linear-gradient(90deg,#fff,#00e5ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.nq .nqsub{color:#8b90b8;font-size:.9rem;margin-bottom:14px;}
.nq .nqtags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
.nqtag{border:1px solid rgba(120,150,230,.2);background:rgba(255,255,255,.02);color:#8b90b8;padding:8px 14px;border-radius:999px;font-size:.9rem;font-weight:600;cursor:pointer;user-select:none;transition:.15s;}
.nqtag.on{color:#06070f;border-color:transparent;background:#00e5ff;box-shadow:0 0 14px rgba(0,229,255,.5);}.nroute,.nfilt{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;}.nrl{color:var(--dim);font-size:.8rem;margin-right:2px;}.rchip,.fchip{border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--dim);padding:6px 12px;border-radius:999px;font-size:.85rem;font-weight:600;cursor:pointer;user-select:none;}.rchip.on{color:#06070f;background:var(--acc2);border-color:transparent;box-shadow:0 0 12px rgba(52,230,255,.5);}.rchip.rem.on{background:var(--acc);box-shadow:0 0 12px var(--acc-glow);}.fchip.on{color:#06070f;background:var(--warn);border-color:transparent;}.rembx{border:1px solid var(--acc);border-radius:12px;padding:14px;margin:10px 0;background:rgba(255,59,84,.06);}.remh{font-weight:700;margin-bottom:10px;color:var(--acc-bright);}.remrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}.remrow input[type=range]{flex:1;min-width:160px;accent-color:var(--acc);}.rstep{width:34px;height:34px;border-radius:8px;border:1px solid var(--line);background:var(--panel2);color:var(--txt);font-size:1.2rem;cursor:pointer;}.picktime{border:1px solid var(--acc2);color:var(--acc2);background:transparent;border-radius:8px;padding:7px 12px;cursor:pointer;}.remlbl{margin:10px 0 6px;font-size:1.05rem;color:var(--acc-bright);font-weight:700;}.rempick input{background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:7px;}.remch{display:flex;gap:16px;flex-wrap:wrap;margin:8px 0;color:var(--dim);font-size:.9rem;}.remch label{display:flex;align-items:center;gap:6px;cursor:pointer;}.remgo{display:flex;align-items:center;gap:10px;margin-top:6px;}.remnote{color:var(--dim);font-size:.82rem;margin-top:8px;}.impmark{display:inline-block;color:#fff;background:var(--acc);font-weight:800;border-radius:6px;padding:0 7px;margin-right:7px;}.sos{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--due);margin-right:7px;vertical-align:middle;animation:sosblink 5s linear infinite;box-shadow:0 0 8px var(--due);}@keyframes sosblink{0%,4%{opacity:1}5%,9%{opacity:.12}10%,14%{opacity:1}15%,19%{opacity:.12}20%,24%{opacity:1}25%,29%{opacity:.12}30%,42%{opacity:1}43%,49%{opacity:.12}50%,62%{opacity:1}63%,69%{opacity:.12}70%,82%{opacity:1}83%,87%{opacity:.12}88%,92%{opacity:1}93%,97%{opacity:.12}100%{opacity:1}}.remitem{border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:10px;padding:10px 12px;margin:8px 0;background:rgba(255,255,255,.02);}.remitem.soft{animation:softpulse 2.6s ease-in-out infinite;}@keyframes softpulse{0%,100%{box-shadow:0 0 0 rgba(255,59,84,0)}50%{box-shadow:0 0 16px rgba(255,59,84,.35)}}.remitem .rt{font-weight:700;}.remitem .rm{color:var(--dim);font-size:.82rem;margin-top:3px;}.remitem .ra{margin-top:8px;display:flex;gap:8px;}.nqlbl{font-size:.72rem;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin:8px 0 4px;}.nqlblh{text-transform:none;letter-spacing:0;}.nqtwo{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px;}.nqact{border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--dim);padding:8px 14px;border-radius:999px;font-size:.9rem;font-weight:600;cursor:pointer;user-select:none;}.nqact.on{color:#06070f;border-color:transparent;}.nqact.king.on{background:var(--acc2);box-shadow:0 0 12px rgba(52,230,255,.5);}.nqact.urgent.on{background:var(--due);color:#fff;box-shadow:0 0 12px rgba(255,45,85,.55);}.nqact.reminder.on{background:var(--warn);box-shadow:0 0 12px rgba(255,181,46,.5);}.crown{margin-right:6px;}.noterems{margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;}.noterem{font-size:.8rem;color:var(--acc-bright);border:1px solid var(--line);border-radius:8px;padding:3px 8px;background:rgba(255,59,84,.06);}.noterem.soft{animation:softpulse 2.6s ease-in-out infinite;}.noterem a{color:var(--dim);margin-left:6px;cursor:pointer;text-decoration:underline;}
.nq textarea{width:100%;min-height:140px;resize:none;border:1px solid rgba(120,150,230,.2);outline:0;background:#0b0d1c;color:#eaf0ff;border-radius:14px;padding:14px;font:1.1rem/1.5 'Segoe UI',system-ui,sans-serif;}
.nq textarea:focus{border-color:#00e5ff;box-shadow:0 0 0 1px #00e5ff,0 0 24px rgba(0,229,255,.2);}
.nq .nqmic{color:#8b90b8;font-size:.8rem;margin:8px 2px 14px;}
.nq .nqrow{display:flex;gap:10px;}
.nq .nqsend{flex:1;border:0;cursor:pointer;color:#fff;font-size:1.1rem;font-weight:800;padding:16px;border-radius:14px;background:linear-gradient(100deg,#ff2d55,#b14bff 60%,#00e5ff);box-shadow:0 8px 26px rgba(177,75,255,.35);}
.nq .nqsend[disabled]{opacity:.4;filter:grayscale(.4);box-shadow:none;}
.nq .nqcancel{border:1px solid rgba(120,150,230,.25);background:transparent;color:#8b90b8;border-radius:14px;padding:0 18px;cursor:pointer;font-weight:600;}
.nqtoast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(40px);background:#0d2a1c;border:1px solid #37e08a;color:#9bf5c4;padding:13px 22px;border-radius:12px;font-weight:700;opacity:0;pointer-events:none;transition:.3s;z-index:1000;box-shadow:0 0 24px rgba(55,224,138,.35);}
.nqtoast.on{opacity:1;transform:translateX(-50%) translateY(0);}
.note{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:8px 0;}.note.ro{opacity:.92;}.notebody{white-space:pre-wrap;word-break:break-word;font-size:.94rem;line-height:1.4;}.notemeta{color:var(--dim);font-size:.74rem;margin-top:6px;}.noteact{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}.noteedit{width:100%;min-height:90px;}.noteshare{margin-top:9px;padding-top:9px;border-top:1px dashed var(--line);}.noteshare select{background:var(--panel2);border:1px solid var(--line);color:var(--txt);padding:6px 8px;border-radius:7px;font-size:.82rem;}.sharelist{margin-top:7px;font-size:.78rem;color:var(--dim);display:flex;flex-wrap:wrap;gap:6px;align-items:center;}.sharechip{background:rgba(0,229,255,.10);border:1px solid var(--line);border-radius:20px;padding:2px 9px;}.sharechip a{color:var(--bad,#ff5577);cursor:pointer;text-decoration:underline;margin-left:4px;}
.qpick{padding:10px 12px;border-top:1px solid var(--line);}
.qpickin{width:100%;box-sizing:border-box;background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:9px;padding:9px 11px;font-size:.86rem;}
.qpickin:focus{outline:none;border-color:var(--acc);}
.qpickres{margin-top:7px;display:flex;flex-direction:column;gap:4px;}
.qprow{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:6px 9px;cursor:pointer;}
.qprow:hover{border-color:var(--acc);}
.qprow .qpi{color:var(--acc);font-size:.82rem;width:14px;text-align:center;}
.qprow .qpt{flex:1;font-size:.82rem;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.qprow .qpadd{color:var(--acc2);font-size:.72rem;border:1px solid var(--line);border-radius:6px;padding:2px 7px;white-space:nowrap;}
.qpmore{color:var(--dim);font-size:.74rem;padding:5px 2px;}
.qgrip{cursor:grab;color:var(--dim);font-size:.95rem;touch-action:none;-webkit-user-select:none;user-select:none;padding:0 2px;}
.qgrip:active{cursor:grabbing;}
.qrow.qdrag{opacity:.45;}
.qrow .qtype{font-size:.8rem;width:14px;text-align:center;color:var(--acc);flex:0 0 auto;}#jpvWrap{position:fixed;z-index:6000;top:70px;right:24px;font-family:inherit;filter:drop-shadow(0 18px 40px rgba(0,0,0,.6))}
#jpvWrap.jpvHidden{display:none}
#jpvBar{display:flex;align-items:center;gap:7px;background:linear-gradient(180deg,rgba(10,16,26,.97),rgba(8,10,18,.97));border:1px solid rgba(0,229,255,.45);border-bottom:none;border-radius:12px 12px 0 0;padding:7px 10px;cursor:grab;user-select:none;box-shadow:inset 0 0 18px rgba(0,229,255,.16)}
#jpvBar.jpvGrab{cursor:grabbing}
#jpvBar .jpvTitle{color:#bfeaff;font-size:12px;letter-spacing:.4px;white-space:nowrap;text-shadow:0 0 8px rgba(0,200,255,.5)}
#jpvBar .jpvTag{color:#ff8aa0;font-size:9px;letter-spacing:1px;border:1px solid rgba(255,60,90,.5);border-radius:6px;padding:1px 5px;text-transform:uppercase;cursor:help}
#jpvBar select{background:#0a1320;color:#9fe9ff;border:1px solid rgba(0,229,255,.4);border-radius:6px;font-size:11px;padding:2px 4px;outline:none;cursor:pointer}
#jpvBar .jpvSpacer{flex:1 1 auto}
#jpvBar .jpvDims{color:#6fb8d8;font-size:10px;font-family:monospace}
#jpvBar .jpvBtn{background:#0a1320;color:#9fe9ff;border:1px solid rgba(0,229,255,.35);border-radius:7px;width:26px;height:24px;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}
#jpvBar .jpvBtn:hover{background:#10243a;box-shadow:0 0 10px rgba(0,229,255,.4)}
#jpvBar .jpvBtn.jpvX{color:#ff8aa0;border-color:rgba(255,60,90,.5)}
#jpvBox{overflow:hidden;border-radius:0 0 14px 14px;background:transparent}
#jpvPhone{transform-origin:top left;position:relative}
.jpvFrame{position:relative;background:#05070d;border:11px solid #0b0e16;border-radius:42px;overflow:hidden;box-shadow:0 0 0 2px rgba(0,229,255,.45),0 0 26px rgba(0,229,255,.22),0 0 60px rgba(177,75,255,.16)}
.jpvFrame.ios{border-radius:54px}
.jpvFrame .jpvScreen{position:absolute;inset:0;border-radius:31px;overflow:hidden;background:#000}
.jpvFrame.ios .jpvScreen{border-radius:43px}
#jpvDoc{border:0;display:block;background:#0a0608}
.jpvPunch{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:11px;height:11px;border-radius:50%;background:#000;box-shadow:0 0 0 2px rgba(20,24,34,.9),inset 0 0 4px rgba(40,90,120,.8);z-index:5;pointer-events:none}
.jpvFrame.ios .jpvPunch{width:78px;height:22px;border-radius:14px;top:8px}
.jpvNav{position:absolute;left:0;right:0;bottom:0;height:22px;display:flex;align-items:center;justify-content:center;gap:42px;z-index:5;pointer-events:none}
.jpvNav b{width:13px;height:13px;border:1.5px solid rgba(150,180,200,.5);border-radius:3px;display:block}
.jpvNav b.tri{border:none;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:11px solid rgba(150,180,200,.5);transform:rotate(-90deg)}
.jpvNav b.cir{border-radius:50%}
.jpvNav.ios{gap:0}
.jpvNav.ios b{width:120px;height:4px;border:none;background:rgba(220,230,240,.6);border-radius:3px}
.jpvNav.ios b.tri,.jpvNav.ios b.cir{display:none}
.jpvSide{position:absolute;width:3px;background:#11151f;border-radius:2px;right:-13px}
.jpvSide.p{top:120px;height:54px}
.jpvSide.v{top:70px;height:34px;left:-13px;right:auto}
#jpvLauncher{position:fixed;right:18px;bottom:18px;z-index:6000;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#13283e,#070b14);border:1px solid rgba(0,229,255,.5);color:#9fe9ff;font-size:20px;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 16px rgba(0,229,255,.35),0 6px 18px rgba(0,0,0,.5)}
#jpvLauncher:hover{box-shadow:0 0 24px rgba(0,229,255,.6)}
#jpvLauncher.show{display:flex}
#mqvWrap{position:fixed;z-index:5000;top:88px;right:14px;width:232px;background:rgba(12,4,8,.97);border:1px solid #ff3df0;border-radius:13px;box-shadow:0 12px 34px rgba(0,0,0,.6),0 0 16px rgba(255,61,240,.3);overflow:hidden;font-size:13px}#mqvWrap.mqvHide{display:none}#mqvHead{display:flex;align-items:center;gap:6px;padding:8px 10px;background:#23101a;border-bottom:1px solid #3d1622;cursor:grab;user-select:none}#mqvHead.mqvGrab{cursor:grabbing}#mqvHead b{font-size:12px;color:#ff8fe9}#mqvHead .mqvCnt{color:#a98793;font-size:10px}#mqvHead .mqvX{margin-left:auto;color:#cdb3bc;cursor:pointer;font-size:15px;line-height:1}#mqvList{max-height:42vh;overflow:auto}#mqvList .empty{padding:12px 10px;color:#7f6470;font-size:11px;text-align:center}.mqvRow{display:flex;align-items:center;gap:7px;padding:7px 9px;border-bottom:1px solid #1f0c16}.mqvRow .n{width:16px;text-align:center;color:#7f6470;font-size:11px}.mqvRow .t{flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mqvRow .a{color:#7fa6b8;cursor:pointer;font-size:14px;padding:0 1px}.mqvRow .rm{color:#ff5d6c;cursor:pointer;font-size:14px}#mqvNote{padding:6px 9px;border-top:1px solid #2a0f1a;color:#7f6470;font-size:10px;display:flex;align-items:center;gap:5px}#mqvLauncher{position:fixed;right:16px;bottom:84px;z-index:5000;background:#23101a;border:1px solid #ff3df0;color:#ff8fe9;border-radius:999px;padding:8px 13px;font-size:12px;cursor:pointer;display:none;align-items:center;gap:6px;box-shadow:0 6px 18px rgba(0,0,0,.5)}#mqvLauncher.show{display:inline-flex}.libfbar{margin:8px 0 12px}.lfb-top{display:flex;gap:6px;flex-wrap:wrap}.lfb-sub{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.lfb-chip{font-size:12px;padding:5px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--dim);cursor:pointer}.lfb-chip.on{background:#ff2d55;border-color:#ff2d55;color:#fff;font-weight:500}.lfb-schip{font-size:11px;padding:3px 10px;border-radius:999px;border:1px solid #2f3a4a;background:#11161f;color:#9fc6d8;cursor:pointer}.lfb-schip.on{background:#00e5ff;border-color:#00e5ff;color:#04303a;font-weight:500}@media(max-width:560px){.libtiles{display:none!important}}</style></head><body><div id="bootveil"></div><div id="wrap">
<header><h1>Clemit <span>Pulse</span></h1><span style="color:var(--dim);font-size:.8rem">&mdash; the pulse of our lives</span><span class="role" id="role">...</span><span id="crownBadge" style="cursor:help;margin-left:6px;font-size:1.05rem"></span><label title="Choose your PULSE color" style="display:inline-flex;align-items:center;gap:6px;margin-left:14px;cursor:pointer"><span style="width:22px;height:22px;border-radius:6px;border:2px solid var(--acc);box-shadow:0 0 8px var(--acc-glow);background:var(--acc);position:relative;overflow:hidden;display:inline-block"><input id="themeSw" type="color" value="#ff3b54" oninput="themeSet(this.value,true)" style="position:absolute;top:-6px;left:-6px;width:42px;height:42px;border:none;opacity:0;cursor:pointer"></span><span style="font-size:.6rem;letter-spacing:1px;color:var(--acc);text-shadow:0 0 6px var(--acc-glow)">&larr; Choose PULSE color</span></label>
<div class="right"><span id="clock"></span><a href="/cdn-cgi/access/logout">Sign Out</a></div></header>
<div class="ministrip" id="ministrip"><div class="ms-player"><button id="msPlay" title="Play / Pause">&#9654;</button><button id="msNext" title="Next">&#9197;</button><span class="ms-title" id="msTitle">&mdash;</span></div><div class="ms-quote" id="msQuote"></div></div>
<div class="hero t-cosmos" id="hero"><div class="hero-bg"></div><canvas class="starfield" id="hsStar"></canvas><canvas class="skinfx" id="hsSkin"></canvas><div class="hfx" id="hsFx"></div><div class="hero-content"><div class="hero-greet" id="heroGreet">Good evening, <b>Boss</b>.</div><div class="hero-q" id="heroQ">&hellip;</div><div class="hero-a" id="heroA"></div><div class="hero-sub" id="heroSub"></div><div class="hero-fav" id="heroFav"></div></div><div class="hcyc" id="hsCyc" title="Next banner">&gt;</div></div>
<div class="shell">
  <section class="workspace">
    <div class="segwrap"><div class="seg" id="seg"><span class="slider" id="slider"></span></div></div>
    <main id="main"></main>
  </section>
  <aside class="djbox" id="djbox">
    <div class="djhead">DJ Box <span class="djtag">library</span></div>
    <audio id="dock"></audio>
    <div class="acc" data-acc="Player">
      <div class="acc-h" onclick="accToggle('Player')"><span class="acc-c">&#9662;</span><span>Player</span></div>
      <div class="acc-b">
        <div class="np">
          <div class="npart">&#9835;</div>
          <div class="npt" id="npt">Nothing playing</div>
          <div class="npa" id="npa">&mdash;</div>
          <div class="eq" id="eq"></div>
          <div class="seekwrap"><span class="ttime" id="tcur">0:00</span><input type="range" class="seekbar" id="seek" min="0" max="1000" value="0"><span class="ttime" id="tdur">0:00</span></div>
          <div class="djctl"><button id="dprev" title="Previous">&#9198;</button><button class="dplay" id="dplay" title="Play">&#9654;</button><button id="dnext" title="Next">&#9197;</button></div>
          <div class="djvol"><span class="vicon" id="vmute" title="Mute">&#128266;</span><input type="range" class="volbar" id="vol" min="0" max="100" value="100"></div>
        </div>
      </div>
    </div>
    <div class="acc" data-acc="Qctl">
      <div class="acc-h" onclick="accToggle('Qctl')"><span class="acc-c">&#9662;</span><span>Add to Queue</span></div>
      <div class="acc-b">
        <div class="qpick">
          <input id="qpick" class="qpickin" placeholder="Search the library to add a song&hellip;" oninput="qPickFilter(this.value)" autocomplete="off">
          <div id="qpickres" class="qpickres"></div>
        </div>
        <div class="qtools">
          <button class="qbtn" id="qbrowse" onclick="window.__lib='song';window.__libMode='song';show('dj')">Browse covers</button>
          <button class="qbtn" id="qshuf">Shuffle</button>
          <button class="qbtn warnb" id="qclear">Clear</button>
          <button class="qbtn" id="mtoff" title="Pause Movie Time scheduling for today" onclick="toggleMovieTime()">Disable Movie Time</button>
          <button class="qbtn warnb" id="qdelsel" style="display:none" onclick="dqDelSel()">Delete</button>
        </div>
      </div>
    </div>
    <div class="acc" data-acc="Queue">
      <div class="acc-h" onclick="accToggle('Queue')"><span class="acc-c">&#9662;</span><span>Queue</span> <b id="qc"></b></div>
      <div class="acc-b">
        <div class="djst" id="djst" style="display:none"></div>
        <div id="qlwrap"><div id="qlpin" style="display:none"></div><div id="ql"></div></div>
      </div>
    </div>
  </aside>
</div>
<footer>family.clemits.com - your space</footer></div>
<div id="spacePod" style="left:0;right:0;bottom:0;width:auto;border-radius:0;border-left:none;border-right:none;border-bottom:none;padding:5px 12px;align-items:center;gap:10px;flex-wrap:wrap"><span class="sp-t" style="margin:0;white-space:nowrap">&#9881; DEBUG</span><div class="sp-bar" style="display:none"><div id="spaceFill"></div></div><span class="sp-n" id="spaceN" style="display:none">checking...</span><div id="dbgBox" style="flex:1;min-width:200px;font-size:11px;line-height:1.4;font-family:monospace;display:flex;flex-wrap:wrap;gap:2px 12px;align-items:center">starting&#8230;</div><button id="spaceX" title="hide" style="position:static">&#10005;</button></div><div id="dbgTab" style="position:fixed;left:0;bottom:0;display:none;z-index:60;background:rgba(8,6,20,.9);border:1px solid rgba(55,224,255,.35);border-top-right-radius:8px;padding:3px 10px;font-size:11px;font-family:monospace;color:var(--acc);cursor:pointer">(Debug)</div>
<script>
const DAY=86400000,PERIOD={weekly:7*DAY,monthly:30*DAY};
let S={},cur='dj',djReady=false;
var RADIOS=[{n:'Drone Zone',g:'ambient space',u:'https://ice1.somafm.com/dronezone-128-mp3'},{n:'Lush',g:'mellow vocals',u:'https://ice1.somafm.com/lush-128-mp3'},{n:'Indie Pop Rocks',g:'indie',u:'https://ice1.somafm.com/indiepop-128-mp3'},{n:'Underground 80s',g:'new wave',u:'https://ice1.somafm.com/u80s-128-mp3'},{n:'Secret Agent',g:'spy lounge',u:'https://ice1.somafm.com/secretagent-128-mp3'},{n:'Boot Liquor',g:'americana',u:'https://ice1.somafm.com/bootliquor-128-mp3'},{n:'Beat Blender',g:'deep house',u:'https://ice1.somafm.com/beatblender-128-mp3'},{n:'Fluid',g:'chillhop',u:'https://ice1.somafm.com/fluid-128-mp3'},{n:'Deep Space One',g:'deep ambient',u:'https://ice1.somafm.com/deepspaceone-128-mp3'},{n:'Folk Forward',g:'indie folk',u:'https://ice1.somafm.com/folkfwd-128-mp3'},{n:'Metal Detector',g:'metal',u:'https://ice1.somafm.com/metal-128-mp3'},{n:'DEF CON Radio',g:'hacker beats',u:'https://ice1.somafm.com/defcon-128-mp3'},{n:'BAGeL Radio',g:'indie rock',u:'https://ice1.somafm.com/bagel-128-mp3'},{n:'The Trip',g:'prog psy',u:'https://ice1.somafm.com/thetrip-128-mp3'}];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
window.__tbl=window.__tbl||{};window.__tblData=window.__tblData||{};
function dataTable(id,cols,rows,opts){opts=opts||{};if(!window.__tbl[id])window.__tbl[id]={sort:opts.sort||null,dir:opts.dir||'asc',q:'',dense:!!opts.dense};window.__tblData[id]={cols:cols,rows:rows,opts:opts};var st=window.__tbl[id];return '<div class="dt"><div class="dt-bar">'+(opts.search!==false?'<input class="dt-search" placeholder="Search\\u2026" value="'+esc(st.q)+'" oninput="tblSearch(\\''+id+'\\',this.value)">':'')+'</div><div class="dt-body" id="dtb-'+id+'">'+tblTable(id)+'</div></div>';}
function tblTable(id){var d=window.__tblData[id],st=window.__tbl[id];var cols=d.cols,opts=d.opts;var rows=d.rows.slice();if(st.q){var q=st.q.toLowerCase();rows=rows.filter(function(r){return cols.some(function(c){return String(r[c.key]==null?'':r[c.key]).toLowerCase().indexOf(q)>=0;});});}if(st.sort){var sc=null;cols.forEach(function(x){if(x.key===st.sort)sc=x;});rows.sort(function(a,b){var av=a[st.sort],bv=b[st.sort];if(sc&&sc.num){av=+av||0;bv=+bv||0;}else{av=String(av==null?'':av).toLowerCase();bv=String(bv==null?'':bv).toLowerCase();}return (av<bv?-1:av>bv?1:0)*(st.dir==='asc'?1:-1);});}window.__tblRows=window.__tblRows||{};window.__tblRows[id]=rows;var vcols=cols.filter(function(c){return (st.hidden||[]).indexOf(c.key)<0;});window.__tblVCols=window.__tblVCols||{};window.__tblVCols[id]=vcols;var dirty=(st.freeze!=null||(st.hidden&&st.hidden.length)||st.sort||st.q);var h='<div class="dt-sub"><span class="dt-meta">'+rows.length+(rows.length!==d.rows.length?' of '+d.rows.length:'')+' rows</span><span class="dt-tools">'+(dirty?'<button class="dt-reset" onclick="tblReset(\\''+id+'\\')">\\u21ba Reset</button>':'')+'<button class="dt-btn" onclick="tblDense(\\''+id+'\\')">'+(st.dense?'Comfortable':'Compact')+'</button>'+(opts.exportName?'<button class="dt-btn" onclick="tblExport(\\''+id+'\\')">\\u2913 CSV</button>':'')+'</span></div><div class="dt-scroll" id="dts-'+id+'" onmousedown="tblSelStart(event,\\''+id+'\\')"><table class="dt-tbl'+(st.dense?' dense':'')+'"><thead><tr>';vcols.forEach(function(c,ci){var ar=st.sort===c.key?(st.dir==='asc'?' \\u2191':' \\u2193'):'';var frz=(st.freeze!=null&&ci<=st.freeze)?' frz':'';h+='<th class="dthd'+frz+'" data-c="'+ci+'">'+(c.sort===false?'':'<span class="hsort" onclick="tblSort(\\''+id+'\\',\\''+c.key+'\\')">')+esc(c.label)+ar+(c.sort===false?'':'</span>')+'<span class="dt-pin" onclick="tblFreeze(event,\\''+id+'\\','+ci+')" title="Freeze up to here">\\uD83D\\uDCCC</span><span class="dt-hide" onclick="tblHide(event,\\''+id+'\\',\\''+c.key+'\\')" title="Hide column (Reset restores)">\\u00d7</span></th>';});h+='</tr></thead><tbody>';if(!rows.length){h+='<tr><td colspan="'+vcols.length+'" class="dt-empty">No matches.</td></tr>';}rows.forEach(function(r,ri){h+='<tr>';vcols.forEach(function(c,ci){var raw=r[c.key];var v=c.fmt?c.fmt(raw,r):esc(raw==null?'':String(raw));var num=(raw!==''&&raw!=null&&isFinite(Number(raw)))?Number(raw):null;var frz=(st.freeze!=null&&ci<=st.freeze)?' frz':'';h+='<td class="dtc'+frz+'" data-r="'+ri+'" data-c="'+ci+'"'+(num!=null?' data-v="'+num+'"':'')+(c.tip?' title="'+esc(c.tip(r))+'"':'')+'>'+v+'</td>';});h+='</tr>';});return h+'</tbody></table></div>';}
function tblRe(id){var el=document.getElementById('dtb-'+id);if(el){el.innerHTML=tblTable(id);setTimeout(function(){tblApplyFreeze(id);},0);}}
function tblSelBounds(){var s=window.__sel;return {r0:Math.min(s.r0,s.r1),r1:Math.max(s.r0,s.r1),c0:Math.min(s.c0,s.c1),c1:Math.max(s.c0,s.c1)};}
function tblSelPaint(){var s=window.__sel;if(!s)return;var b=tblSelBounds();var cells=document.querySelectorAll('#dts-'+s.id+' td.dtc');for(var i=0;i<cells.length;i++){var td=cells[i],r=+td.dataset.r,c=+td.dataset.c;if(r>=b.r0&&r<=b.r1&&c>=b.c0&&c<=b.c1)td.classList.add('sel');else td.classList.remove('sel');}}
function tblSelStart(ev,id){var td=ev.target.closest('td.dtc');if(!td)return;ev.preventDefault();window.__sel={id:id,r0:+td.dataset.r,c0:+td.dataset.c,r1:+td.dataset.r,c1:+td.dataset.c};tblSelPaint();function mv(e){var t=document.elementFromPoint(e.clientX,e.clientY);t=t&&t.closest?t.closest('td.dtc'):null;if(t&&t.dataset.r!=null){window.__sel.r1=+t.dataset.r;window.__sel.c1=+t.dataset.c;tblSelPaint();}}function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);tblSelDone();}document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}
function tblSelDone(){var s=window.__sel;if(!s)return;var b=tblSelBounds();var d=window.__tblData[s.id],rows=window.__tblRows[s.id],cols=window.__tblVCols[s.id]||d.cols;var vals=[];for(var r=b.r0;r<=b.r1;r++){for(var c=b.c0;c<=b.c1;c++){var row=rows[r];if(!row)continue;var raw=row[cols[c].key];var n=(raw!==''&&raw!=null&&isFinite(Number(raw)))?Number(raw):null;if(n!=null)vals.push(n);}}var tip=document.getElementById('dt-tip');if(!tip){tip=document.createElement('div');tip.id='dt-tip';tip.className='dt-tip';document.body.appendChild(tip);}if(b.r0===b.r1&&b.c0===b.c1){tip.style.display='none';return;}var sum=0;for(var k=0;k<vals.length;k++)sum+=vals[k];var cnt=vals.length,avg=cnt?sum/cnt:0,mn=cnt?Math.min.apply(null,vals):0,mx=cnt?Math.max.apply(null,vals):0;var colnames=[];for(var cc=b.c0;cc<=b.c1;cc++)colnames.push(cols[cc].label);var rownames=[];for(var rr=b.r0;rr<=b.r1&&rr<b.r0+4;rr++){if(rows[rr])rownames.push(String(rows[rr][cols[0].key]).slice(0,18));}if(b.r1-b.r0>=4)rownames.push('\\u2026');var rnd=function(x){return Math.round(x*100)/100;};tip.innerHTML='<div class="tt-h">'+esc(colnames.join(', '))+'</div><div class="tt-r">'+esc(rownames.join(' \\u00b7 '))+'</div><div class="tt-g">'+(cnt?('<b>Sum</b> '+rnd(sum)+'<br><b>Avg</b> '+rnd(avg)+'<br><b>Count</b> '+cnt+'<br><b>Min</b> '+rnd(mn)+' \\u00b7 <b>Max</b> '+rnd(mx)):'no numbers in selection')+'</div>';var anchor=document.querySelector('#dts-'+s.id+' td.dtc[data-r="'+b.r1+'"][data-c="'+b.c1+'"]');if(anchor){var rc=anchor.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(window.innerWidth-228,rc.right+8))+'px';tip.style.top=Math.min(window.innerHeight-140,rc.bottom+6)+'px';}tip.style.display='block';}
function tblFreeze(ev,id,ci){if(ev&&ev.stopPropagation)ev.stopPropagation();var st=window.__tbl[id];st.freeze=(st.freeze===ci?null:ci);tblRe(id);}
function tblApplyFreeze(id){var st=window.__tbl[id];if(st.freeze==null)return;var sc=document.getElementById('dts-'+id);if(!sc)return;var hr=sc.querySelector('thead tr');if(!hr)return;var ths=hr.children,lefts=[],acc=0;for(var i=0;i<=st.freeze&&i<ths.length;i++){lefts[i]=acc;acc+=ths[i].offsetWidth;}var frz=sc.querySelectorAll('.frz');for(var j=0;j<frz.length;j++){var el=frz[j],c=+el.dataset.c;if(lefts[c]!=null)el.style.left=lefts[c]+'px';}}
function tblHide(ev,id,key){if(ev&&ev.stopPropagation)ev.stopPropagation();var st=window.__tbl[id];st.hidden=st.hidden||[];if(st.hidden.indexOf(key)<0)st.hidden.push(key);st.freeze=null;tblRe(id);}
function tblReset(id){var st=window.__tbl[id];st.hidden=[];st.freeze=null;st.sort=null;st.dir='asc';st.q='';var tip=document.getElementById('dt-tip');if(tip)tip.style.display='none';var body=document.getElementById('dtb-'+id);if(body){var sr=body.parentNode.querySelector('.dt-search');if(sr)sr.value='';body.innerHTML=tblTable(id);}}
function tblSort(id,k){var st=window.__tbl[id];if(st.sort===k)st.dir=(st.dir==='asc'?'desc':'asc');else{st.sort=k;st.dir='asc';}tblRe(id);}
function tblSearch(id,v){window.__tbl[id].q=v;tblRe(id);}
function tblDense(id){window.__tbl[id].dense=!window.__tbl[id].dense;tblRe(id);}
function tblExport(id){var d=window.__tblData[id],cols=d.cols;var out=[cols.filter(function(c){return c.key.charAt(0)!=='_';}).map(function(c){return '"'+String(c.label||c.key).replace(/"/g,'""')+'"';}).join(',')];d.rows.forEach(function(r){out.push(cols.filter(function(c){return c.key.charAt(0)!=='_';}).map(function(c){var val=c.raw?c.raw(r):r[c.key];return '"'+String(val==null?'':val).replace(/"/g,'""')+'"';}).join(','));});var blob=new Blob([out.join('\\n')],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(d.opts.exportName||'table')+'.csv';a.click();}
function tod(h){return h<12?'morning':h<18?'afternoon':'evening';}
function clock(){document.getElementById('clock').textContent=new Date().toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'});}
clock();setInterval(clock,30000);
function photoOf(name){if(!name)return null;const n=name.toLowerCase();const m=S.media.find(x=>x.kind==='photo'&&(x.people||'').toLowerCase().includes(n));return m?m.url:null;}
var HERO_Q=[
{q:"You could leave life right now. Let that determine what you do, say, and think.",a:"Marcus Aurelius",s:"Make today count."},
{q:"Fortune governs half our actions; she leaves the other half to us.",a:"Machiavelli",s:"Steer your half."},
{q:"What is it you plan to do with your one wild and precious life?",a:"Mary Oliver",s:"Big question. Go answer it."},
{q:"Carpe diem. Seize the day.",a:"Horace",s:"The day is yours, Boss."},
{q:"The day is not gonna seize itself. Go.",a:"Pulse",s:"Main-character energy: ON."},
{q:"New day just dropped. Limited edition. Use it.",a:"Pulse",s:"YOLO. Yeet. Onward."},
{q:"Do or do not. There is no try.",a:"Yoda",s:"Pick a thing. Do it."},
{q:"We are all in the gutter, but some of us are looking at the stars.",a:"Oscar Wilde",s:"Look up."}
];
var HERO_T=['cosmos','slot','cruise'];
var heroState={};try{heroState=JSON.parse(localStorage.getItem('pulseHero'))||{};}catch(e){}
var heroQi=Math.floor(Math.random()*HERO_Q.length);
var heroTi=HERO_T.indexOf(heroState.theme);if(heroTi<0)heroTi=Math.floor(Math.random()*HERO_T.length);
var heroPaused=!!heroState.paused, heroLocked=heroState.locked||null, heroQT, heroTT;
function heroSave(){try{localStorage.setItem('pulseHero',JSON.stringify({theme:HERO_T[heroTi],paused:heroPaused,locked:heroLocked}));}catch(e){}}
function heroGreetUpd(){var g=document.getElementById('heroGreet');if(g)g.innerHTML='Good '+tod(new Date().getHours())+', <b>'+esc(monikerName())+'</b>. What\\'s on the agenda? <button class="note-cta" onclick="noteQuickOpen()" title="Drop a quick note onto PULSE">\\u270e Got a note now? <span class="nc-h">(click here)</span></button>';}
var __nqType='note';var __nqActs={king:false,urgent:false,reminder:false};
function noteQuickOpen(){var w=document.getElementById('nqWrap');if(!w)return;w.classList.add('on');var t=document.getElementById('nqText');if(t){t.oninput=function(){var s=document.getElementById('nqSend');if(s)s.disabled=!t.value.trim();};t.onkeydown=function(e){if((e.ctrlKey||e.metaKey)&&e.key==='Enter')noteQuickSend();};setTimeout(function(){t.focus();},60);}}
function noteQuickClose(){var w=document.getElementById('nqWrap');if(w)w.classList.remove('on');}
function nqType(el){__nqType=el.dataset.t;var p=el.parentNode.querySelectorAll('.nqtag');for(var i=0;i<p.length;i++)p[i].classList.remove('on');el.classList.add('on');}
function nqAct(el){var a=el.dataset.a;__nqActs[a]=!__nqActs[a];el.classList.toggle('on',__nqActs[a]);if(a==='reminder')nqRemBox(__nqActs.reminder);}
function nqRemBox(on){var b=document.getElementById('nqRemBox');if(!b)return;if(!on){b.innerHTML='';return;}if(window.__remIdx==null)window.__remIdx=1;window.__remExact=null;b.innerHTML='<div class="rembx"><div class="remh">⏰ Remind me — how long?</div><div class="remrow"><button class="rstep" onclick="remBump(-1)">−</button><input type="range" id="remrange" min="0" max="'+(REMSTEPS.length-1)+'" value="'+window.__remIdx+'" oninput="remSlide(this.value)"><button class="rstep" onclick="remBump(1)">+</button><button class="picktime" onclick="remPickToggle()">Pick Time</button></div><div class="remlbl" id="remlbl">'+remStepLabel(REMSTEPS[window.__remIdx])+'</div><div class="rempick" id="rempick" style="display:none"><input type="datetime-local" id="remdt" onchange="remExact(this.value)"></div><div class="remnote">I will email you at reminder time, and add a pulsing note here if it is more than 2 hours out.</div></div>';}
function nqToast(msg){var t=document.getElementById('nqToast');if(t){t.textContent=msg;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},1900);}}
function nqReset(){var ta=document.getElementById('nqText');if(ta)ta.value='';var s=document.getElementById('nqSend');if(s)s.disabled=true;__nqActs={king:false,urgent:false,reminder:false};__nqType='note';nqRemBox(false);var tt=document.querySelectorAll('#nqTypes .nqtag');for(var i=0;i<tt.length;i++)tt[i].classList.toggle('on',tt[i].dataset.t==='note');var aa=document.querySelectorAll('#nqActs .nqact');for(var j=0;j<aa.length;j++)aa[j].classList.remove('on');noteQuickClose();}
function noteQuickSend(){var ta=document.getElementById('nqText');if(!ta)return;var v=ta.value.trim();if(!v)return;var type=__nqType,acts=__nqActs;if(typeof audit==='function')audit('post',v.slice(0,80),'Note/'+type);if(type==='shopping'){post('/api/grocery',{name:v,freq:'once'});nqReset();nqToast('Added to Shopping List ✓');return;}var body=(type==='idea'?'💡 ':'')+v;notesPost('/api/note',{body:body,important:acts.urgent?1:0}).then(function(r){var id=r&&r.id;var jobs=[];if(acts.king&&id&&window.S&&S.king)jobs.push(notesPost('/api/note/share',{id:id,email:S.king,hours:0}));if(acts.reminder){var due=window.__remExact?window.__remExact:(Date.now()+remStepMs(REMSTEPS[window.__remIdx==null?1:window.__remIdx]));jobs.push(notesPost('/api/reminders',{title:v.slice(0,60),body:v,due_at:due,channels:['inapp','email'],repeat_kind:'',note_id:id}));}Promise.all(jobs).then(function(){nqReset();nqToast('Saved to Personal Notes ✓');if(typeof notesLoad==='function')notesLoad();if(typeof remLoad==='function')remLoad();});});}
function heroApplyTheme(){var h=document.getElementById('hero');if(!h)return;HERO_T.forEach(function(t){h.classList.remove('t-'+t);});h.classList.add('t-'+HERO_T[heroTi]);var btns=document.querySelectorAll('#heroCtrl button');for(var i=0;i<btns.length;i++){var d=btns[i].dataset.h;btns[i].classList.toggle('on',(d===HERO_T[heroTi]&&!!heroLocked)||(d==='pause'&&heroPaused));}}
function heroList(){return (window.HQ&&window.HQ.length)?window.HQ:HERO_Q;}
function heroShowQuote(){var L=heroList();if(heroQi>=L.length)heroQi=0;var o=L[heroQi],q=document.getElementById('heroQ'),a=document.getElementById('heroA'),s=document.getElementById('heroSub');if(!q)return;window.heroCurId=(o.id!=null?o.id:null);q.classList.add('swap');setTimeout(function(){q.textContent='\\u201c'+o.q+'\\u201d';if(a)a.textContent='\\u2014 '+o.a;if(s)s.textContent=o.s;q.classList.remove('swap');heroFavUpd();if(typeof msSync==='function')msSync();},300);}
function heroNextQuote(){var L=heroList();heroQi=(heroQi+1)%L.length;heroShowQuote();}
function heroFavUpd(){var btn=document.querySelector('#heroCtrl button[data-h="fav"]'),el=document.getElementById('heroFav'),id=window.heroCurId;var favs=(S&&S.quotes&&S.quotes.favs&&id!=null)?(S.quotes.favs[String(id)]||[]):[];var mine=!!(S&&S.me&&favs.indexOf(S.me.name)>=0);if(btn){btn.innerHTML=mine?'\\u2665':'\\u2661';btn.classList.toggle('on',mine);}if(el)el.textContent=favs.length?('\\u2665 '+favs.length+' \\u00b7 '+favs.join(', ')):'';}
function heroNextTheme(){heroTi=(heroTi+1)%HERO_T.length;heroApplyTheme();heroSave();}
function heroTimers(){clearInterval(heroQT);clearInterval(heroTT);heroQT=setInterval(function(){if(!heroPaused)heroNextQuote();},12000);}
window.HS=(function(){
var SKINS=[{id:'A',nm:'Crimson HUD',ds:'brackets + scan'},{id:'B',nm:'Starfield',ds:'drifting stars'},{id:'C',nm:'Holo Panel',ds:'holo quote card'},{id:'D',nm:'TRON Grid',ds:'perspective grid'},{id:'E',nm:'Reactor',ds:'boss ball + ripples'},{id:'F',nm:'Synthwave',ds:'magenta grid'},{id:'G',nm:'TRON Lava Lamp',ds:'your color + hue blobs'},{id:'H',nm:'Deep Space',ds:'3D Earth + ships (heavy)'},{id:'L',nm:'Launch',ds:'rockets to orbit (heavy)'}];
var hero,star,sk,fxl,cx,sx,cur='B',MODE='surprise',enabled={},timers={},raf=null,inited=false;
var stars=[],orbs=[],lava=[],ripples=[],shake=0;
function cfg(){try{return ucfg();}catch(e){return {};}}
function save(o){try{ucfgSet(o);}catch(e){}}
function getAcc(){try{var v=getComputedStyle(document.documentElement).getPropertyValue('--acc').trim();return v||'#ff3b54';}catch(e){return '#ff3b54';}}
function hexA(h,a){h=(''+h).replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return 'rgba('+r+','+g+','+b+','+a+')';}
function W(){return hero?hero.clientWidth:0;}
function H(){return hero?hero.clientHeight:0;}
function mk(css){var d=document.createElement('div');d.style.cssText=css;if(fxl)fxl.appendChild(d);return d;}
function gone(el,ms){setTimeout(function(){if(el&&el.parentNode)el.parentNode.removeChild(el);},ms);}
function fxShoot(){var y=Math.random()*H()*0.5,d=mk('position:absolute;top:'+y+'px;left:-140px;width:130px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff);filter:drop-shadow(0 0 6px #fff);transform:rotate(18deg)');d.animate([{transform:'translateX(0) rotate(18deg)',opacity:0},{opacity:1,offset:.12},{transform:'translateX('+(W()+200)+'px) rotate(18deg)',opacity:0}],{duration:1000});gone(d,1100);}
function fxComet(){var y=Math.random()*H()*0.42+8,ang=Math.random()*0.5-0.12,dist=W()+380,dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist,rot=' rotate('+ang+'rad)';var d=mk('position:absolute;top:'+y+'px;left:-220px;width:200px;height:6px;border-radius:6px;transform-origin:50% 50%;background:linear-gradient(90deg,rgba(52,230,255,0),rgba(120,210,255,.6),#dff6ff);filter:drop-shadow(0 0 10px #34e6ff)');var hd=document.createElement('div');hd.style.cssText='position:absolute;right:-4px;top:-4px;width:14px;height:14px;border-radius:50%;background:#eaffff;box-shadow:0 0 16px 4px #34e6ff';d.appendChild(hd);d.animate([{transform:'translate(0,0)'+rot,opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.85},{transform:'translate('+dx+'px,'+dy+'px)'+rot,opacity:0}],{duration:4600,easing:'ease-in'});gone(d,4700);}
function fxTwinkle(){var cx0=Math.random()*W()*0.7+W()*0.15,cy=Math.random()*H()*0.6+8;for(var i=0;i<9;i++){(function(){var x=cx0+(Math.random()*70-35),y=cy+(Math.random()*50-25),s=Math.random()*2+1.5,d=mk('position:absolute;left:'+x+'px;top:'+y+'px;width:'+s+'px;height:'+s+'px;border-radius:50%;background:#eaf6ff;box-shadow:0 0 8px 2px #bfe6ff');d.animate([{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1.6)',offset:.4},{opacity:0,transform:'scale(.5)'}],{duration:1200,delay:Math.random()*300});gone(d,1600);})();}}
function fxAurora(){var d=mk('position:absolute;left:-30%;top:0;width:80%;height:60%;background:linear-gradient(120deg,rgba(52,230,255,0),rgba(52,230,255,.18),rgba(177,75,255,.18),rgba(255,61,240,0));filter:blur(8px)');d.animate([{transform:'translateX(0)',opacity:0},{opacity:1,offset:.3},{opacity:1,offset:.7},{transform:'translateX('+(W()*0.7)+'px)',opacity:0}],{duration:5200,easing:'ease-in-out'});gone(d,5300);}
function fxBlood(){var x=Math.random()*W()*0.8+W()*0.1,d=mk('position:absolute;left:'+x+'px;top:-2px;width:3px;height:8px;border-radius:0 0 3px 3px;background:#ff0033;box-shadow:0 0 8px #ff0033');d.animate([{height:'8px',opacity:0},{opacity:1,offset:.15},{height:(H()*0.7)+'px',opacity:1,offset:.8},{opacity:0}],{duration:2200,easing:'cubic-bezier(.4,0,.7,1)'});gone(d,2300);}
function fxGlitch(){if(!hero)return;var g=hero.querySelector('.hero-greet');if(!g)return;g.setAttribute('data-text',g.textContent||'');g.classList.add('hsGlitch');setTimeout(function(){g.classList.remove('hsGlitch');},420);}
function fxSurge(){if(!hero)return;hero.classList.remove('hsSurge');void hero.offsetWidth;hero.classList.add('hsSurge');setTimeout(function(){hero.classList.remove('hsSurge');},620);}
function fxVamp(){var d=mk('position:absolute;top:-20%;left:-45%;width:55%;height:150%;background:radial-gradient(closest-side,rgba(0,0,0,.85),rgba(0,0,0,.35),transparent);filter:blur(4px)');d.animate([{transform:'translateX(0) skewX(-8deg)',opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.8},{transform:'translateX('+(W()*2)+'px) skewX(-8deg)',opacity:0}],{duration:2600,easing:'ease-in-out'});gone(d,2700);}
function fxNova(){var x=Math.random()*W()*0.5+W()*0.4,y=Math.random()*H()*0.5+10;var fl=mk('position:absolute;left:'+x+'px;top:'+y+'px;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 30px 10px #bfe0ff;transform:translate(-50%,-50%)');fl.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{transform:'translate(-50%,-50%) scale(3)',opacity:1,offset:.2},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:700});gone(fl,750);var ring=mk('position:absolute;left:'+x+'px;top:'+y+'px;width:10px;height:10px;border-radius:50%;border:3px solid rgba(180,220,255,.9);box-shadow:0 0 18px #8ec5ff;transform:translate(-50%,-50%)');ring.animate([{width:'10px',height:'10px',opacity:1,borderWidth:'4px'},{width:'260px',height:'260px',opacity:0,borderWidth:'1px'}],{duration:1100,easing:'ease-out'});gone(ring,1150);setTimeout(function(){var bh=mk('position:absolute;left:'+x+'px;top:'+y+'px;width:26px;height:26px;border-radius:50%;background:radial-gradient(closest-side,#000 60%,rgba(120,90,160,.5),transparent);box-shadow:0 0 18px 4px rgba(120,70,160,.5);transform:translate(-50%,-50%)');bh.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.15},{transform:'translate('+(-(x)-60)+'px,-50%) scale(1)',opacity:1,offset:.85},{opacity:0}],{duration:3200});gone(bh,3300);},650);}
var FX=[{id:'shoot',nm:'Shooting star',ds:'streak with a fading trail',g:'cos',fn:fxShoot,min:8000,max:15000},{id:'twinkle',nm:'Twinkle burst',ds:'a cluster of stars flares',g:'cos',fn:fxTwinkle,min:6000,max:11000},{id:'comet',nm:'Comet flyby',ds:'slow comet, long tail',g:'cos',fn:fxComet,min:24000,max:42000},{id:'aurora',nm:'Aurora wash',ds:'neon curtain drifts across',g:'cos',fn:fxAurora,min:20000,max:34000},{id:'nova',nm:'Supernova to black hole',ds:'flash, shockwave, drifting black hole',g:'cos',fn:fxNova,min:38000,max:70000},{id:'vamp',nm:'Vampire shadow',ds:'a shadow sweeps past',g:'vmp',fn:fxVamp,min:34000,max:60000},{id:'blood',nm:'Blood drip',ds:'crimson bead runs down',g:'vmp',fn:fxBlood,min:30000,max:52000},{id:'glitch',nm:'Glitch burst',ds:'RGB split flickers the greeting',g:'vmp',fn:fxGlitch,min:26000,max:44000},{id:'surge',nm:'Power surge',ds:'neon border spikes',g:'vmp',fn:fxSurge,min:28000,max:48000}];
function byId(id){for(var i=0;i<FX.length;i++)if(FX[i].id===id)return FX[i];}
function initStars(){if(!star)return;star.width=W();star.height=H();stars=[];for(var i=0;i<70;i++)stars.push({x:Math.random()*star.width,y:Math.random()*star.height,z:Math.random()*1.5+.3,s:Math.random()*1.4+.4});}
function starDraw(){if(!cx||!star)return;cx.clearRect(0,0,star.width,star.height);for(var i=0;i<stars.length;i++){var st=stars[i];var tw=.5+.5*Math.sin(Date.now()/600+i);cx.fillStyle='rgba(210,225,255,'+(0.25+0.6*tw*st.z/1.8)+')';cx.fillRect(st.x,st.y,st.s,st.s);st.x-=st.z*0.25;if(st.x<0){st.x=star.width;st.y=Math.random()*star.height;}}}
function initOrbs(){if(!sk)return;sk.width=W();sk.height=H();orbs=[];orbs.push({boss:1,x:W()*0.5,y:H()*0.42,vx:(Math.random()<.5?-1:1)*0.32,vy:0,r:Math.min(54,Math.max(40,H()*0.34))});for(var i=0;i<3;i++)orbs.push({boss:0,x:W()*(0.2+Math.random()*0.6),y:H()*(0.25+Math.random()*0.3),vx:(Math.random()-.5)*0.35,vy:0,r:14+Math.random()*8});ripples=[];shake=0;}
function drawOrb(o,col){if(!sx)return;var lw=o.boss?3.5:2.4,sb=o.boss?28:20;sx.save();sx.shadowColor=col;sx.shadowBlur=sb;sx.strokeStyle=col;sx.globalAlpha=o.boss?1:.9;sx.lineWidth=lw;sx.beginPath();sx.arc(o.x,o.y,o.r,0,6.2832);sx.stroke();sx.shadowBlur=0;var g=sx.createRadialGradient(o.x,o.y,o.r*.2,o.x,o.y,o.r);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.82,hexA(col,o.boss?.18:.12));g.addColorStop(1,hexA(col,0));sx.globalAlpha=1;sx.fillStyle=g;sx.beginPath();sx.arc(o.x,o.y,o.r,0,6.2832);sx.fill();sx.restore();}
function spawnRipple(x,y){ripples.push({x:x,y:y,born:performance.now()});if(ripples.length>30)ripples.shift();}
function ripDraw(x,y,r,SQ,col,a){if(!sx)return;sx.save();sx.shadowColor=col;sx.shadowBlur=6;sx.lineWidth=1.4;sx.strokeStyle=hexA(col,a);sx.beginPath();sx.ellipse(x,y,r,r*SQ,0,0,6.2832);sx.stroke();sx.restore();}
function rippleStep(t,col){var SQ=0.40,MAXR=W()*0.30,DUR=2600,RINGS=2,RDELAY=320;for(var i=ripples.length-1;i>=0;i--){var rp=ripples[i],age=t-rp.born;for(var k=0;k<RINGS;k++){var rt=age-k*RDELAY;if(rt<0)continue;var r=(rt/DUR)*MAXR;if(r>MAXR||r<1)continue;var a=0.20*(1-r/MAXR);if(a<=0)continue;ripDraw(rp.x,rp.y,r,SQ,col,a);var mxs=[[-rp.x,rp.y,rp.x],[2*W()-rp.x,rp.y,W()-rp.x],[rp.x,-rp.y,rp.y],[rp.x,2*H()-rp.y,H()-rp.y]];for(var w=0;w<4;w++){if(r>mxs[w][2]&&mxs[w][2]>0)ripDraw(mxs[w][0],mxs[w][1],r,SQ,col,a*0.5);}}if(age>DUR+RINGS*RDELAY)ripples.splice(i,1);}}
function onBigLand(o,impact){shake=Math.min(3,0.5+impact*1.1);spawnRipple(o.x,H());spawnRipple(o.x-o.r*0.55,H());spawnRipple(o.x+o.r*0.55,H());for(var i=0;i<orbs.length;i++){var l=orbs[i];if(l.boss)continue;l.vy=-(0.9+Math.random()*0.7);l.vx+=(Math.random()*2-1)*0.5;}}
function orbStep(){if(!sx)return;var t=performance.now();var col=getAcc();var GR=0.009,LREST=0.7,WREST=0.92,TH=0.2;var BIGV=Math.sqrt(2*GR*(H()*0.72));for(var i=0;i<orbs.length;i++){var o=orbs[i];o.vy+=GR;o.x+=o.vx;o.y+=o.vy;if(o.x-o.r<0){o.x=o.r;if(o.vx<-TH)spawnRipple(0,o.y);o.vx=Math.abs(o.vx)*(o.boss?1:WREST);}else if(o.x+o.r>W()){o.x=W()-o.r;if(o.vx>TH)spawnRipple(W(),o.y);o.vx=-Math.abs(o.vx)*(o.boss?1:WREST);}if(o.y-o.r<0){o.y=o.r;o.vy=Math.abs(o.vy)*(o.boss?1:LREST);}if(o.y+o.r>H()){o.y=H()-o.r;if(o.boss){var im=Math.abs(o.vy);o.vy=-BIGV;onBigLand(o,im);}else{if(o.vy>TH)spawnRipple(o.x,H());o.vy=-Math.abs(o.vy)*LREST;if(Math.abs(o.vy)<0.6){o.vy=0;o.vx*=0.8;}}}}for(var a=0;a<orbs.length;a++)for(var b=a+1;b<orbs.length;b++){var pp=orbs[a],qq=orbs[b];var dx=qq.x-pp.x,dy=qq.y-pp.y,d=Math.sqrt(dx*dx+dy*dy)||0.001,mn=pp.r+qq.r;if(d<mn){var nx=dx/d,ny=dy/d;if(pp.boss&&!qq.boss){qq.x=pp.x+nx*mn;qq.y=pp.y+ny*mn;var rel=(qq.vx-pp.vx)*nx+(qq.vy-pp.vy)*ny;if(rel<0){qq.vx-=2*rel*nx;qq.vy-=2*rel*ny;}}else if(qq.boss&&!pp.boss){pp.x=qq.x-nx*mn;pp.y=qq.y-ny*mn;var rel2=(pp.vx-qq.vx)*(-nx)+(pp.vy-qq.vy)*(-ny);if(rel2<0){pp.vx-=2*rel2*(-nx);pp.vy-=2*rel2*(-ny);}}else{var ov=(mn-d)/2;pp.x-=nx*ov;pp.y-=ny*ov;qq.x+=nx*ov;qq.y+=ny*ov;var pv=pp.vx*nx+pp.vy*ny,qv=qq.vx*nx+qq.vy*ny,diff=qv-pv;pp.vx+=diff*nx;pp.vy+=diff*ny;qq.vx-=diff*nx;qq.vy-=diff*ny;}}}if(shake>0&&hero){hero.style.transform='translate('+((Math.random()*2-1)*shake).toFixed(1)+'px,'+((Math.random()*2-1)*shake).toFixed(1)+'px)';shake*=0.84;if(shake<0.3){shake=0;hero.style.transform='';}}sx.clearRect(0,0,sk.width,sk.height);rippleStep(t,col);for(var k2=0;k2<orbs.length;k2++)drawOrb(orbs[k2],col);}
var LAVA_HUES=['#34e6ff','#b14bff','#ff3df0','#39ff14','#ffb347','#00ffd0'];
function initLava(){if(!sk)return;sk.width=W();sk.height=H();lava=[];var ac=getAcc();lava.push({col:ac,r:46,cx:W()*0.5,spd:0.30,amp:H()*0.30,ph:Math.random()*6.28,wob:0.5});for(var i=0;i<5;i++)lava.push({col:LAVA_HUES[i%LAVA_HUES.length],r:16+Math.random()*16,cx:Math.random()*W(),spd:0.2+Math.random()*0.3,amp:H()*(0.18+Math.random()*0.18),ph:Math.random()*6.28,wob:0.3+Math.random()*0.6});}
function lavaStep(){if(!sx)return;var t=performance.now()/1000;sx.clearRect(0,0,sk.width,sk.height);sx.globalCompositeOperation='lighter';for(var i=0;i<lava.length;i++){var b=lava[i];var yy=H()*0.5-Math.cos(t*b.spd+b.ph)*b.amp;var xx=b.cx+Math.sin(t*b.spd*0.7+b.ph)*W()*0.06*b.wob;var rr=b.r*(1+0.12*Math.sin(t*b.spd*1.3+b.ph));var g=sx.createRadialGradient(xx,yy,1,xx,yy,rr);g.addColorStop(0,hexA(b.col,.9));g.addColorStop(.5,hexA(b.col,.4));g.addColorStop(1,hexA(b.col,0));sx.fillStyle=g;sx.beginPath();sx.arc(xx,yy,rr,0,6.2832);sx.fill();}sx.globalCompositeOperation='source-over';}
function ids(){return SKINS.map(function(s){return s.id;});}
function nextId(id){var a=ids();return a[(a.indexOf(id)+1)%a.length];}
function _isJayden(){try{return (typeof S!=='undefined'&&S&&S.me&&S.me.name)?((''+S.me.name).toLowerCase().indexOf('jayden')>=0):false;}catch(e){return false;}}
function freshPick(){var c=cfg();var pin=c.heroSkin||(_isJayden()?'L':'B');var last=c.heroLast||pin;if(MODE==='pin')return pin;if(MODE==='cycle')return nextId(last);var a=ids().filter(function(z){return z!=='H'&&z!=='L';}),r;do{r=a[Math.floor(Math.random()*a.length)];}while(r===last&&a.length>1);return r;}
function applySkin(id){if(!hero)return;if(id!=='H')stop3D();if(id!=='L')stopLaunch();if(id!=='E'){hero.style.transform='';shake=0;}hero.classList.remove('t-cosmos','t-slot','t-switch','t-cruise');for(var i=0;i<SKINS.length;i++)hero.classList.remove('hsk-'+SKINS[i].id);hero.classList.add('hsk-'+id);cur=id;if(id==='B')initStars();else if(id==='E')initOrbs();else if(id==='G')initLava();else if(id==='H')start3D();else if(id==='L')startLaunch();if(!raf)raf=requestAnimationFrame(master);}
function pickSkin(id){cur=id;save({heroSkin:id,heroLast:id});applySkin(id);}
function setMode(m){MODE=m;save({heroMode:m});}
function toggleFx(id,on){enabled[id]=on;save({heroFx:FX.filter(function(f){return enabled[f.id];}).map(function(f){return f.id;})});var f=byId(id);if(!f)return;if(on)schedule(f);else clearTimeout(timers[id]);}
function schedule(f){clearTimeout(timers[f.id]);if(!enabled[f.id])return;var w=f.min+Math.random()*(f.max-f.min);timers[f.id]=setTimeout(function(){if(enabled[f.id]&&cur!=='E'&&(f.g!=='cos'||cur==='B')){try{f.fn();}catch(e){}}schedule(f);},w);}
function master(){try{if(cur==='B')starDraw();else if(cur==='E')orbStep();else if(cur==='G')lavaStep();}catch(e){}raf=requestAnimationFrame(master);}
function settingsHtml(){try{var c=cfg();var skin=(MODE==='pin')?(c.heroSkin||'B'):cur;var modes=[['surprise','Surprise me','A different banner each visit'],['cycle','Cycle in order','Advance each visit'],['pin','Keep one I pick','Always the style I choose']];var mh='';for(var i=0;i<modes.length;i++){var m=modes[i];mh+='<button class="qbtn'+(MODE===m[0]?' on':'')+'" data-hs-mode="'+m[0]+'">'+m[1]+'</button>';}var gh='';for(var j=0;j<SKINS.length;j++){var s=SKINS[j];gh+='<div class="hs-opt'+(s.id===skin?' on':'')+'" data-hs-skin="'+s.id+'"><div class="pv pv'+s.id+'"></div><div class="mt">'+s.id+' '+s.nm+'<small>'+s.ds+'</small></div></div>';}var fh='';for(var k=0;k<FX.length;k++){var f=FX[k];fh+='<div class="hs-fxrow"><input type="checkbox" data-hs-fx="'+f.id+'"'+(enabled[f.id]?' checked':'')+'><div><div class="nm">'+f.nm+'</div><div class="ds">'+f.ds+'</div></div><button class="hs-fire" data-hs-fire="'+f.id+'" title="Try it">&#9654;</button><span class="gp '+f.g+'">'+(f.g==='cos'?'SPACE':'VAMP')+'</span></div>';}return '<h2 style="font-size:.95rem;margin:14px 0 6px">Hero banner</h2><div class="sub">Pick the look of your greeting banner. A fresh one greets you each visit &mdash; or pin a favorite.</div><div class="hs-mode">'+mh+'</div><div class="hs-grid">'+gh+'</div><h2 style="font-size:.95rem;margin:14px 0 6px">Banner events</h2><div class="sub">Little flourishes on the banner. Space events show only on Starfield; the Reactor has its own.</div>'+fh;}catch(e){return '';}}
function bind(){document.addEventListener('click',function(e){try{var el;if(el=e.target.closest('[data-hs-skin]')){pickSkin(el.getAttribute('data-hs-skin'));if(typeof render==='function')render();}else if(el=e.target.closest('[data-hs-mode]')){setMode(el.getAttribute('data-hs-mode'));if(typeof render==='function')render();}else if(el=e.target.closest('[data-hs-fire]')){var f=byId(el.getAttribute('data-hs-fire'));if(f){try{f.fn();}catch(e2){}}}else if(e.target.closest('#hsCyc')){pickSkin(nextId(cur));}}catch(err){}},true);document.addEventListener('change',function(e){try{var el=e.target.closest('[data-hs-fx]');if(el){toggleFx(el.getAttribute('data-hs-fx'),el.checked);if(typeof render==='function')render();}}catch(err){}},true);window.addEventListener('resize',function(){try{if(cur==='B')initStars();else if(cur==='E')initOrbs();else if(cur==='G')initLava();}catch(e){}});}
// ===== HS 3D Deep Space skin (opt-in, lazy Three.js, fully guarded) =====
var hs3dRAF=null,hs3dCv=null,hs3dInit=false;
function load3D(cb){if(window.THREE)return cb();if(window.__hs3dLoading){window.__hs3dCbs.push(cb);return;}window.__hs3dLoading=1;window.__hs3dCbs=[cb];var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';s.onload=function(){window.__hs3dCbs.forEach(function(f){try{f();}catch(e){}});};s.onerror=function(){};document.head.appendChild(s);}
function stop3D(){if(hs3dRAF){cancelAnimationFrame(hs3dRAF);hs3dRAF=null;}if(hs3dCv&&hs3dCv.parentNode)hs3dCv.parentNode.removeChild(hs3dCv);hs3dCv=null;}
function start3D(){try{stop3D();if(!hero)return;if(!window.WebGLRenderingContext)return;load3D(function(){try{if(cur!=='H')return;build3D();}catch(e){}});}catch(e){}}
function build3D(){
  var T=window.THREE;hs3dCv=document.createElement('canvas');hs3dCv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;pointer-events:none';hero.insertBefore(hs3dCv,hero.firstChild);
  var W=hero.clientWidth||900,H2=hero.clientHeight||160;
  var rnd;try{rnd=new T.WebGLRenderer({canvas:hs3dCv,antialias:true,alpha:true});}catch(e){stop3D();return;}
  rnd.setSize(W,H2,false);rnd.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  var sc=new T.Scene();var cam=new T.PerspectiveCamera(46,W/H2,0.1,3000);cam.position.set(0,0.7,16);cam.lookAt(0,0,0);
  sc.add(new T.AmbientLight(0x1c2a48,0.55));var sun=new T.DirectionalLight(0xeaf1ff,0.7);sun.position.set(-4,5,8);sc.add(sun);
  function v2(a){return new T.Vector2(a[0],a[1]);}
  function starTex(){var c=document.createElement('canvas');c.width=c.height=32;var x=c.getContext('2d');var g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.22,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(190,215,255,.35)');g.addColorStop(1,'rgba(160,190,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new T.CanvasTexture(c);}
  var stx=starTex();var starGrp=new T.Group();sc.add(starGrp);
  function starL(n,r0,r1,sz,col){var g=new T.BufferGeometry(),p=[];for(var i=0;i<n;i++){var u=Math.random(),v=Math.random();var th=u*6.2832,ph=Math.acos(2*v-1);var r=r0+Math.random()*(r1-r0);p.push(r*Math.sin(ph)*Math.cos(th),r*Math.sin(ph)*Math.sin(th),r*Math.cos(ph));}g.setAttribute('position',new T.Float32BufferAttribute(p,3));var m=new T.Points(g,new T.PointsMaterial({map:stx,color:col,size:sz,sizeAttenuation:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:0.95}));starGrp.add(m);return m;}
  starL(1100,60,150,1.0,0xbfd4ff);starL(420,25,60,1.7,0xeaf2ff);starL(70,18,52,3.8,0xffffff);
  var NW=120,wpos=new Float32Array(NW*6),wb=[];for(var i=0;i<NW;i++){var a=Math.random()*6.2832,r=3+Math.random()*22;wb.push({x:(Math.random()*2-1)*16,y:Math.cos(a)*r,z:Math.sin(a)*r-5});}
  var wg=new T.BufferGeometry();wg.setAttribute('position',new T.BufferAttribute(wpos,3));var warp=new T.LineSegments(wg,new T.LineBasicMaterial({color:0xaddfff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));sc.add(warp);
  // Earth FAR in the background, drifting by
  function paintNice(){var c=document.createElement('canvas');c.width=1024;c.height=512;var x=c.getContext('2d');var og=x.createLinearGradient(0,0,0,512);og.addColorStop(0,'#08234c');og.addColorStop(.5,'#103f72');og.addColorStop(1,'#08234c');x.fillStyle=og;x.fillRect(0,0,1024,512);function land(cx,cy,rw,rh){var lg=x.createRadialGradient(cx,cy-rh*0.3,2,cx,cy,Math.max(rw,rh));lg.addColorStop(0,'#3a7d46');lg.addColorStop(.7,'#2c6b3a');lg.addColorStop(1,'#7a6a3e');x.fillStyle=lg;x.beginPath();x.ellipse(cx,cy,rw,rh,0,0,6.2832);x.fill();}[[240,200,80,100],[300,330,60,95],[540,180,130,75],[580,310,95,85],[740,210,85,60],[790,330,75,72]].forEach(function(b){land(b[0],b[1],b[2],b[3]);});x.fillStyle='#eef4ff';x.fillRect(0,0,1024,14);x.fillRect(0,498,1024,14);return new T.CanvasTexture(c);}
  var emat=new T.MeshPhongMaterial({map:paintNice(),shininess:16,specular:0x2a5070});
  var earth=new T.Mesh(new T.SphereGeometry(3.2,64,48),emat);earth.position.set(16,5,-44);sc.add(earth);
  try{var ld=new T.TextureLoader();ld.setCrossOrigin('anonymous');ld.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',function(t){emat.map=t;emat.needsUpdate=true;});ld.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',function(t){emat.bumpMap=t;emat.bumpScale=0.05;emat.needsUpdate=true;});ld.load('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',function(t){emat.specularMap=t;emat.specular=new T.Color(0x4a78a8);emat.shininess=24;emat.needsUpdate=true;});}catch(e){}
  function glowS(r,g,b,s){var c=document.createElement('canvas');c.width=c.height=48;var x=c.getContext('2d');var gr=x.createRadialGradient(24,24,0,24,24,24);gr.addColorStop(0,'rgba('+r+','+g+','+b+',1)');gr.addColorStop(.3,'rgba('+r+','+g+','+b+',.5)');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');x.fillStyle=gr;x.fillRect(0,0,48,48);var sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));sp.scale.set(s,s,1);return sp;}
  function faceV(grp,v){if(v.lengthSq()<1e-7)return;grp.rotation.set(0,-Math.atan2(v.z,v.x),Math.asin(Math.max(-1,Math.min(1,v.y/v.length()))));}
  var metalC=new T.MeshStandardMaterial({color:0xaebbd6,metalness:0.62,roughness:0.34});
  var metalF=new T.MeshStandardMaterial({color:0x8a93a8,metalness:0.6,roughness:0.42});
  // ---- real detailed ship models ----
  function mAurora(){var g=new T.Group();var pr=[[0,-0.1],[1.2,-0.1],[1.6,0],[1.6,0.05],[1.1,0.18],[0.5,0.28],[0,0.32]].map(v2);g.add(new T.Mesh(new T.LatheGeometry(pr,40),metalC));var dome=new T.Mesh(new T.SphereGeometry(0.18,14,10),new T.MeshBasicMaterial({color:0x9fe8ff}));dome.position.y=0.32;g.add(dome);var hull=new T.Mesh(new T.CylinderGeometry(0.2,0.2,1.3,16),metalC);hull.rotation.z=Math.PI/2;hull.position.y=-0.3;g.add(hull);[-0.85,0.85].forEach(function(z){var n=new T.Mesh(new T.CylinderGeometry(0.1,0.1,1.2,14),metalC);n.rotation.z=Math.PI/2;n.position.set(0,-0.05,z);g.add(n);var bk=glowS(120,200,255,0.7);bk.position.set(-0.65,-0.05,z);g.add(bk);var st=new T.Mesh(new T.BoxGeometry(0.5,0.06,0.34),metalF);st.position.set(-0.15,-0.18,z*0.55);st.rotation.x=(z>0?1:-1)*0.5;g.add(st);});return g;}
  function mRaptor(){var g=new T.Group();var body=new T.Mesh(new T.CylinderGeometry(0.12,0.34,1.5,14),metalF);body.rotation.z=Math.PI/2;g.add(body);var head=new T.Mesh(new T.ConeGeometry(0.14,0.45,12),metalF);head.rotation.z=-Math.PI/2;head.position.x=0.9;g.add(head);var eye=new T.Mesh(new T.SphereGeometry(0.07,10,8),new T.MeshBasicMaterial({color:0x39ffa8}));eye.position.x=1.0;g.add(eye);[1,-1].forEach(function(s){var w=new T.Mesh(new T.BoxGeometry(1.0,0.05,0.55),metalF);w.position.set(-0.3,0,s*0.6);w.rotation.y=s*0.5;g.add(w);var e=glowS(57,255,168,0.7);e.position.set(-0.75,0,s*0.9);g.add(e);});return g;}
  function mWedge(){var g=new T.Group();var sh=new T.Shape();sh.moveTo(0,1.2);sh.lineTo(1.0,-1.0);sh.lineTo(-1.0,-1.0);sh.lineTo(0,1.2);var geo=new T.ExtrudeGeometry(sh,{depth:0.35,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.06,bevelSegments:1});geo.center();var hull=new T.Mesh(geo,metalF);hull.rotation.x=-Math.PI/2;g.add(hull);var tower=new T.Mesh(new T.BoxGeometry(0.28,0.2,0.28),metalC);tower.position.set(0,0.3,-0.1);g.add(tower);[-0.55,0,0.55].forEach(function(x){var e=glowS(120,200,255,0.7);e.position.set(x,0.05,1.0);g.add(e);});return g;}
  function mTalon(){var g=new T.Group();var body=new T.Mesh(new T.ConeGeometry(0.26,1.3,4),metalF);body.rotation.z=-Math.PI/2;body.rotation.x=Math.PI/4;g.add(body);var core=new T.Mesh(new T.SphereGeometry(0.11,10,8),new T.MeshBasicMaterial({color:0xff5070}));core.position.x=-0.35;g.add(core);[1,-1].forEach(function(s){var w=new T.Mesh(new T.BoxGeometry(0.9,0.04,0.5),metalF);w.position.set(-0.15,0,s*0.4);w.rotation.y=-s*0.4;g.add(w);});return g;}

  function cap(team,big){var col=team==='c'?[120,210,255]:[255,90,110];var g=team==='c'?mAurora():(big?mWedge():mRaptor());g.scale.setScalar(big?1.5:1.15);sc.add(g);
    var lt=new T.PointLight(team==='c'?0x44b6ff:0xff5070,1.3,9);lt.position.copy(g.position);g.add(lt);
    return {grp:g,team:team,big:big,lt:lt,pos:g.position,hp:big?14:10,fire:Math.random()*60,flash:0};}
  function fig(team){var g=team==='c'?mAurora():mTalon();g.scale.setScalar(team==='c'?0.42:0.5);sc.add(g);var col=team==='c'?[120,210,255]:[255,90,110];var eg=glowS(col[0],col[1],col[2],0.5);eg.position.x=team==='c'?-0.5:0.4;g.add(eg);
    return {grp:g,team:team,eg:eg,pos:g.position,vel:new T.Vector3(),slot:new T.Vector3(),fire:Math.random()*30,flash:0,hp:1};}

  function makeFleet(team){var sgn=team==='c'?1:-1;var fx=sgn*-2.6;
    var mar=cap(team,false);mar.pos.set(fx,0.2,0);
    var dre=cap(team,true);dre.pos.set(fx-sgn*1.4,0.2,-0.8);
    var guard=[mar,dre];var squads=[[],[]];
    for(var sI=0;sI<2;sI++)for(var k=0;k<2;k++){var fi=fig(team);fi.guard=guard[sI];fi.slotIdx=k;fi.pos.copy(guard[sI].pos).add(new T.Vector3(sgn*0.9,(k?0.5:-0.5),0.4));squads[sI].push(fi);}
    return {team:team,sgn:sgn,mar:mar,dre:dre,fighters:squads[0].concat(squads[1]),rout:0};}
  var fleetC=makeFleet('c'),fleetF=makeFleet('f'),fleets=[fleetC,fleetF];
  function enemyOf(fl){return fl===fleetC?fleetF:fleetC;}
  function allShips(fl){return fl.fighters.concat([fl.mar,fl.dre]).filter(function(s){return s.hp>0;});}

  var flashes=[new T.PointLight(0xffd9a0,0,9),new T.PointLight(0xffd9a0,0,9),new T.PointLight(0xffd9a0,0,9)];flashes.forEach(function(f){sc.add(f);f.userData={life:0};});
  function popFlash(pos,col,inten){for(var i=0;i<flashes.length;i++){if(flashes[i].userData.life<=0){flashes[i].position.copy(pos);flashes[i].color.setHex(col);flashes[i].intensity=inten;flashes[i].userData.life=14;return;}}}
  var bolts=[],missiles=[],parts=[];var scrollV=0.0006,scrollT=0.0006;
  function fireLaser(s,t){var dir=t.pos.clone().sub(s.pos).normalize();var bp=s.pos.clone().addScaledVector(dir,0.5);var bsp=glowS(s.team==='c'?150:255,s.team==='c'?232:138,255,0.5);bsp.position.copy(bp);sc.add(bsp);bolts.push({pos:bp,v:dir.multiplyScalar(0.5),life:42,team:s.team,sp:bsp});s.flash=8;}
  function fireMissile(s,t){var m=new T.Group();var body=new T.Mesh(new T.CylinderGeometry(0.06,0.06,0.4,8),new T.MeshStandardMaterial({color:0xdddddd,metalness:0.6,roughness:0.4}));body.rotation.z=Math.PI/2;m.add(body);var eg=glowS(255,180,90,1.2);eg.position.x=-0.3;m.add(eg);m.position.copy(s.pos);sc.add(m);var dir=t.pos.clone().sub(s.pos).normalize();missiles.push({grp:m,eg:eg,v:dir.multiplyScalar(0.09),target:t,life:200,team:s.team});s.flash=18;popFlash(s.pos.clone(),0xffb060,7);}
  function boom(pos,col){popFlash(pos,col,8);for(var i=0;i<8;i++){var sp=glowS(255,210,150,0.5);sp.position.copy(pos);sc.add(sp);parts.push({sp:sp,v:new T.Vector3((Math.random()-.5),(Math.random()-.5),(Math.random()-.5)).multiplyScalar(0.15),life:18});}}
  function nearestEnemyShip(s,fl){var en=enemyOf(fl),best=null,bd=1e9,list=allShips(en);for(var i=0;i<list.length;i++){var d=s.pos.distanceTo(list[i].pos);if(d<bd){bd=d;best=list[i];}}return best;}
  function resetFleet(fl){var sgn=fl.sgn,fx=sgn*-2.6;fl.mar.hp=10;fl.mar.grp.visible=true;fl.mar.pos.set(fx,0.2,0);fl.dre.hp=14;fl.dre.grp.visible=true;fl.dre.pos.set(fx-sgn*1.4,0.2,-0.8);fl.rout=0;for(var i=0;i<fl.fighters.length;i++){var f=fl.fighters[i];f.hp=1;f.grp.visible=true;f.pos.copy(f.guard.pos).add(new T.Vector3(sgn*0.9,(f.slotIdx?0.5:-0.5),0.4));}}

  function resize(){if(!hs3dCv)return;var w=hero.clientWidth||900,h=hero.clientHeight||160;rnd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  function frame(){if(cur!=='H'||!hs3dCv){stop3D();return;}hs3dRAF=requestAnimationFrame(frame);
    earth.rotation.y+=0.0009;earth.position.x-=0.01;if(earth.position.x<-22)earth.position.x=22;
    scrollV+=(scrollT-scrollV)*0.04;scrollT*=0.97;if(scrollT<0.0006)scrollT=0.0006;starGrp.rotation.y+=scrollV;
    var wlen=Math.min(26,Math.abs(scrollV)*1600);for(var i=0;i<NW;i++){var b=wb[i];b.x-=scrollV*120;if(b.x>16)b.x-=32;else if(b.x<-16)b.x+=32;var o=i*6;wpos[o]=b.x;wpos[o+1]=b.y;wpos[o+2]=b.z;wpos[o+3]=b.x-wlen;wpos[o+4]=b.y;wpos[o+5]=b.z;}wg.attributes.position.needsUpdate=true;warp.material.opacity=Math.min(0.5,Math.abs(scrollV)*60);
    for(var fi=0;fi<fleets.length;fi++){var fl=fleets[fi];var mar=fl.mar,dre=fl.dre;
      if(fl.rout>0){fl.rout--;allShips(fl).forEach(function(s){s.pos.x+=fl.sgn*-0.04;});if(fl.rout<=0)resetFleet(fl);}
      if(mar.hp>0){mar.pos.y+=Math.sin(Date.now()/1600+fi)*0.001;mar.grp.rotation.y=fl.sgn>0?0:Math.PI;if(mar.fire>0)mar.fire--;else{var tt=nearestEnemyShip(mar,fl);if(tt){fireMissile(mar,tt);mar.fire=170+Math.random()*120;}}mar.lt.intensity=1.3+(mar.flash>0?(mar.flash--,mar.flash*0.5):0);}
      if(dre.hp>0){var behind=mar.pos.clone().add(new T.Vector3(fl.sgn*-1.3,0,-0.6));dre.pos.lerp(behind,0.04);dre.grp.rotation.y=fl.sgn>0?0:Math.PI;if(dre.fire>0)dre.fire--;else{var t2=nearestEnemyShip(dre,fl);if(t2){fireMissile(dre,t2);dre.fire=150+Math.random()*120;}}dre.lt.intensity=1.3+(dre.flash>0?(dre.flash--,dre.flash*0.5):0);}
      mar.grp.visible=mar.hp>0;dre.grp.visible=dre.hp>0;
      for(var k=0;k<fl.fighters.length;k++){var f=fl.fighters[k];if(f.hp<=0)continue;var jit=Math.sin(Date.now()/600+k*1.7)*0.12;var out=(f.slotIdx?1:-1);
        f.slot.copy(f.guard.pos).add(new T.Vector3(fl.sgn*(0.9+0.2),(out)*(0.55+jit),(out)*0.4+jit));
        var tgt=nearestEnemyShip(f,fl);var des;
        if(tgt&&f.pos.distanceTo(tgt.pos)<3.4){des=tgt.pos.clone().sub(f.pos);if(f.pos.distanceTo(tgt.pos)<2.2&&f.fire<=0){fireLaser(f,tgt);f.fire=26+Math.random()*30;}}else des=f.slot.clone().sub(f.pos);
        f.vel.lerp(des.normalize().multiplyScalar(0.07),0.08);f.pos.add(f.vel);faceV(f.grp,f.vel);if(f.fire>0)f.fire--;if(f.flash>0){f.flash--;f.eg.scale.setScalar(0.5+f.flash*0.08);}}
      if(mar.hp<=0&&dre.hp<=0&&!fl.rout)fl.rout=140;
    }
    for(var b=bolts.length-1;b>=0;b--){var bo=bolts[b];bo.pos.add(bo.v);bo.sp.position.copy(bo.pos);bo.life--;var hit=false;var en2=bo.team==='c'?fleetF:fleetC;var list=allShips(en2);for(var j=0;j<list.length;j++){if(bo.pos.distanceTo(list[j].pos)<0.55){list[j].hp--;list[j].flash=10;boom(bo.pos.clone(),list[j].team==='c'?0x44b6ff:0xff5070);if(list[j].hp<=0){list[j].grp.visible=false;scrollT=0.0006+0.012*Math.random();}hit=true;break;}}if(hit){sc.remove(bo.sp);bolts.splice(b,1);continue;}if(bo.life<=0){sc.remove(bo.sp);bolts.splice(b,1);}}
    for(var m=missiles.length-1;m>=0;m--){var mi=missiles[m];mi.life--;if(mi.target&&mi.target.hp<=0)mi.target=null;if(mi.target){var d2=mi.target.pos.clone().sub(mi.grp.position).normalize().multiplyScalar(0.12);mi.v.lerp(d2,0.04);}mi.grp.position.add(mi.v);faceV(mi.grp,mi.v);mi.eg.scale.setScalar(1.0+Math.sin(Date.now()/60)*0.2);if(mi.target&&mi.grp.position.distanceTo(mi.target.pos)<0.7){mi.target.hp-=2;mi.target.flash=16;boom(mi.grp.position.clone(),mi.target.team==='c'?0x44b6ff:0xff5070);if(mi.target.hp<=0){mi.target.grp.visible=false;scrollT=0.0006+0.014*Math.random();}sc.remove(mi.grp);missiles.splice(m,1);continue;}if(mi.life<=0){sc.remove(mi.grp);missiles.splice(m,1);}}
    for(var ff=0;ff<flashes.length;ff++){if(flashes[ff].userData.life>0){flashes[ff].userData.life--;flashes[ff].intensity*=0.84;}else flashes[ff].intensity=0;}
    for(var p=parts.length-1;p>=0;p--){var pa=parts[p];pa.sp.position.add(pa.v);pa.life--;pa.sp.scale.multiplyScalar(0.9);if(pa.life<=0){sc.remove(pa.sp);parts.splice(p,1);}}
    resize();rnd.render(sc,cam);
  }
  frame();
}
// ===== HS Launch skin (opt-in, lazy Three.js, fully guarded) =====
var hsLRAF=null,hsLCv=null,hsLBtn=null;
function stopLaunch(){if(hsLRAF){cancelAnimationFrame(hsLRAF);hsLRAF=null;}if(hsLCv&&hsLCv.parentNode)hsLCv.parentNode.removeChild(hsLCv);hsLCv=null;if(hsLBtn&&hsLBtn.parentNode)hsLBtn.parentNode.removeChild(hsLBtn);hsLBtn=null;if(hero){hero.classList.remove('hsL-full');hero.style.background='';}}
function startLaunch(){try{stopLaunch();if(!hero)return;if(!window.WebGLRenderingContext)return;load3D(function(){try{if(cur!=='L')return;buildLaunch();}catch(e){}});}catch(e){}}
function buildLaunch(){
  var T=window.THREE;hsLCv=document.createElement('canvas');hsLCv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;pointer-events:none';hero.insertBefore(hsLCv,hero.firstChild);
  hsLBtn=document.createElement('button');hsLBtn.type='button';hsLBtn.title='Full screen';hsLBtn.innerHTML='⛶';hsLBtn.style.cssText='position:absolute;top:8px;right:8px;z-index:3;width:30px;height:30px;border-radius:8px;border:1px solid rgba(52,230,255,.5);background:rgba(5,8,16,.55);color:#bfe6ff;font-size:15px;line-height:1;cursor:pointer';
  hsLBtn.onclick=function(){try{if(!document.fullscreenElement){(hero.requestFullscreen||hero.webkitRequestFullscreen).call(hero);hero.classList.add('hsL-full');}else{(document.exitFullscreen||document.webkitExitFullscreen).call(document);hero.classList.remove('hsL-full');}setTimeout(rsz,80);}catch(e){}};
  hero.appendChild(hsLBtn);
  var W=hero.clientWidth||900,H2=hero.clientHeight||160;
  var rnd;try{rnd=new T.WebGLRenderer({canvas:hsLCv,antialias:true,alpha:true});}catch(e){stopLaunch();return;}
  rnd.setSize(W,H2,false);rnd.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  var sc=new T.Scene();var cam=new T.PerspectiveCamera(42,W/H2,0.1,3000);cam.position.set(0,0,11);cam.lookAt(0,0,0);
  sc.add(new T.HemisphereLight(0xbfd4ff,0x202838,0.95));var sun=new T.DirectionalLight(0xffffff,1.5);sun.position.set(-6,5,7);sc.add(sun);var rim=new T.DirectionalLight(0xbfe0ff,0.8);rim.position.set(5,2,-6);sc.add(rim);
  function v2(a){return new T.Vector2(a[0],a[1]);}
  function rg(st){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d');var g=x.createRadialGradient(32,32,0,32,32,32);for(var i=0;i<st.length;i++)g.addColorStop(st[i][0],st[i][1]);x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
  var FIRE=rg([[0,'rgba(255,245,210,1)'],[.28,'rgba(255,175,60,.9)'],[.62,'rgba(255,90,30,.45)'],[1,'rgba(120,20,10,0)']]);
  var SMOKE=rg([[0,'rgba(230,235,245,.9)'],[.5,'rgba(190,200,215,.5)'],[1,'rgba(170,180,195,0)']]);
  function spr(t,b){return new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthWrite:false,blending:b||T.NormalBlending}));}
  var stars=(function(){var g=new T.BufferGeometry(),p=[];for(var i=0;i<360;i++){p.push((Math.random()-0.5)*60,(Math.random()-0.5)*40,-12-Math.random()*30);}g.setAttribute('position',new T.Float32BufferAttribute(p,3));var m=new T.PointsMaterial({color:0xcfe0ff,size:0.14,transparent:true,opacity:0});var pt=new T.Points(g,m);sc.add(pt);return pt;})();
  function steelTex(){var c=document.createElement('canvas');c.width=32;c.height=256;var x=c.getContext('2d');var g=x.createLinearGradient(0,0,32,0);g.addColorStop(0,'#a9b0bb');g.addColorStop(.5,'#eef1f5');g.addColorStop(1,'#9aa2ad');x.fillStyle=g;x.fillRect(0,0,32,256);x.strokeStyle='rgba(70,80,95,.3)';for(var y=12;y<256;y+=20){x.beginPath();x.moveTo(0,y);x.lineTo(32,y);x.stroke();}var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,1);return t;}
  var steel=new T.MeshStandardMaterial({map:steelTex(),color:0xdfe3e8,metalness:0.9,roughness:0.32,side:T.DoubleSide});
  var white=new T.MeshStandardMaterial({color:0xf2f4f8,metalness:0.18,roughness:0.55,side:T.DoubleSide});
  var black=new T.MeshStandardMaterial({color:0x191b20,metalness:0.25,roughness:0.78,side:T.DoubleSide});
  var dark=new T.MeshStandardMaterial({color:0x2c3038,metalness:0.6,roughness:0.5});
  var orange=new T.MeshStandardMaterial({color:0xb5662e,metalness:0.2,roughness:0.85,side:T.DoubleSide});
  var cream=new T.MeshStandardMaterial({color:0xe9e2cf,metalness:0.15,roughness:0.7,side:T.DoubleSide});
  var gold=new T.MeshStandardMaterial({color:0xc9a227,metalness:0.7,roughness:0.35});
  var solar=new T.MeshStandardMaterial({color:0x243a72,metalness:0.4,roughness:0.4});
  function cyl(rt,rb,h,m,seg,open){return new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||32,1,!!open),m);}
  function cone(r,h,m,seg){return new T.Mesh(new T.ConeGeometry(r,h,seg||28),m);}
  function box(w,hh,d,m){return new T.Mesh(new T.BoxGeometry(w,hh,d),m);}
  function fins(g,yb,r,n,w,h,m){for(var i=0;i<n;i++){var a=(i/n)*6.2832;var f=box(0.05,h,w,m);f.position.set(Math.cos(a)*r,yb,Math.sin(a)*r);f.rotation.y=a;g.add(f);}}
  function ring(n,r){var a=[];for(var i=0;i<n;i++){var t=(i/n)*6.2832;a.push([Math.cos(t)*r,Math.sin(t)*r]);}return a;}
  function engineDeck(parent,cy,plateR,nozzles){var plate=cyl(plateR,plateR*0.96,0.16,dark,40);plate.position.y=cy+0.08;parent.add(plate);var offs=[];for(var i=0;i<nozzles.length;i++){var p=nozzles[i];var n=cyl(p[2]*0.6,p[2],p[2]*1.4,dark,12);n.position.set(p[0],cy-p[2]*0.6,p[1]);parent.add(n);offs.push([p[0],cy-p[2]*1.2,p[1]]);}return offs;}
  function bStarship(){var g=new T.Group(),R=0.6,bH=3.2;g.add(cyl(R,R,bH,steel,40,true));var nose=new T.Mesh(new T.LatheGeometry([[R,0],[R*0.86,0.6],[R*0.48,1.05],[0,1.34]].map(v2),40),steel);nose.position.y=bH/2;g.add(nose);g.add(new T.Mesh(new T.CylinderGeometry(R*1.01,R*1.01,bH,28,1,true,Math.PI*0.5,Math.PI),black));[[1,-1.25,0.7],[-1,-1.25,0.7]].forEach(function(f){var fl=box(0.05,f[2],0.55,black);fl.position.set(f[0]*R*0.95,f[1],-R*0.5);g.add(fl);});var boost=new T.Group(),BR=0.9,BH=2.5,by=-bH/2-1.25;var bc=cyl(BR,BR,BH,steel,40);bc.position.y=by;boost.add(bc);var hot=cyl(BR*1.03,BR*1.03,0.22,dark,40);hot.position.y=by+BH/2-0.1;boost.add(hot);var nz=[[0,0,0.16]].concat(ring(8,0.45).map(function(p){return[p[0],p[1],0.12];})).concat(ring(16,0.75).map(function(p){return[p[0],p[1],0.09];}));var offs=engineDeck(boost,by-BH/2,BR,nz);g.add(boost);return{grp:g,noz:offs,boost:[boost],fl:1.0};}
  function bFalcon9(){var g=new T.Group(),R=0.4,bH=3.6;var boost=new T.Group();var s1=cyl(R,R,bH,white,32);boost.add(s1);var offs=engineDeck(boost,-bH/2,R,[[0,0,0.09]].concat(ring(8,0.26).map(function(p){return[p[0],p[1],0.07];})));g.add(boost);var ib=cyl(R*1.01,R*1.01,0.34,black,32);ib.position.y=bH/2+0.17;g.add(ib);var s2=cyl(R*0.9,R*0.9,1.0,white,32);s2.position.y=bH/2+0.85;g.add(s2);var fair=cone(R*0.9,0.8,white);fair.position.y=bH/2+1.7;g.add(fair);return{grp:g,noz:offs,boost:[boost],fl:0.85};}
  function bSaturn(){var g=new T.Group();var boost=new T.Group();var s1=cyl(0.6,0.6,1.9,white,32);s1.position.y=-1.4;boost.add(s1);var b1=cyl(0.61,0.61,0.16,black,32);b1.position.y=-0.6;boost.add(b1);var offs=engineDeck(boost,-2.35,0.6,[[0,0,0.16]].concat(ring(4,0.34).map(function(p){return[p[0],p[1],0.15];})));fins(boost,-2.1,0.58,4,0.5,0.62,black);g.add(boost);var i1=cyl(0.48,0.6,0.36,white,32);i1.position.y=-0.28;g.add(i1);var s2=cyl(0.48,0.48,1.4,white,32);s2.position.y=0.62;g.add(s2);var i2=cyl(0.34,0.48,0.36,white,32);i2.position.y=1.5;g.add(i2);var s3=cyl(0.34,0.34,0.95,white,32);s3.position.y=2.16;g.add(s3);var cm=cone(0.25,0.46,cream);cm.position.y=2.85;g.add(cm);return{grp:g,noz:offs,boost:[boost],fl:1.0};}
  function bSLS(){var g=new T.Group();g.add(cyl(0.52,0.52,4.6,orange,32));var nc=cone(0.52,0.82,orange);nc.position.y=2.7;g.add(nc);var noz=[];var coreOff=engineDeck(g,-2.3,0.52,ring(4,0.2).map(function(p){return[p[0],p[1],0.12];}));noz=noz.concat(coreOff);var boosters=[];[1,-1].forEach(function(s){var bg=new T.Group();var srb=cyl(0.24,0.24,3.9,white,24);srb.position.set(s*0.8,-0.3,0);bg.add(srb);var sn=cone(0.24,0.62,white);sn.position.set(s*0.8,1.95,0);bg.add(sn);var nzl=cyl(0.14,0.2,0.3,dark,14);nzl.position.set(s*0.8,-2.35,0);bg.add(nzl);g.add(bg);boosters.push(bg);noz.push([s*0.8,-2.5,0]);});var orion=cone(0.32,0.5,white);orion.position.y=3.4;g.add(orion);return{grp:g,noz:noz,boost:boosters,fl:1.1};}
  function bShuttle(){var g=new T.Group();var bay=box(0.56,0.52,2.3,white);bay.position.z=-0.12;g.add(bay);var fwd=box(0.46,0.46,0.7,white);fwd.position.z=1.1;g.add(fwd);var nc=new T.Mesh(new T.SphereGeometry(0.25,16,12),black);nc.scale.z=1.5;nc.position.z=1.55;g.add(nc);var belly=box(0.58,0.14,2.35,black);belly.position.set(0,-0.28,-0.1);g.add(belly);function ow(side){var sh=new T.Shape();sh.moveTo(0.26,0.7);sh.lineTo(0.56,0.1);sh.lineTo(1.45,-1.1);sh.lineTo(1.35,-1.45);sh.lineTo(0.28,-1.45);sh.lineTo(0.26,0.7);var w=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:0.05,bevelEnabled:false}),white);w.rotation.x=Math.PI/2;w.position.y=-0.16;w.scale.x=side;g.add(w);}ow(1);ow(-1);var tsh=new T.Shape();tsh.moveTo(0,0);tsh.lineTo(-0.55,0);tsh.lineTo(-0.4,0.66);tsh.lineTo(-0.07,0.66);tsh.lineTo(0,0);var tail=new T.Mesh(new T.ExtrudeGeometry(tsh,{depth:0.05,bevelEnabled:false}),white);tail.rotation.y=Math.PI/2;tail.position.set(0.025,0.26,-0.7);g.add(tail);g.rotation.z=Math.PI/2;g.rotation.y=-0.5;return{grp:g,noz:[],boost:[],fl:0,float:true};}
  function bISS(){var g=new T.Group();g.add(box(5,0.14,0.14,dark));[-2,-1.2,1.2,2].forEach(function(x){[-1,1].forEach(function(s){var p=box(0.7,0.04,1.4,solar);p.position.set(x,0,s*0.9);g.add(p);});});[-0.6,0,0.6,1.2].forEach(function(z){var m=cyl(0.22,0.22,0.7,white,14);m.rotation.x=Math.PI/2;m.position.z=z;g.add(m);});return{grp:g,noz:[],boost:[],fl:0,float:true};}
  function bSputnik(){var g=new T.Group();var poli=new T.MeshStandardMaterial({color:0xd2d6dc,metalness:0.9,roughness:0.2});g.add(new T.Mesh(new T.SphereGeometry(0.55,32,24),poli));for(var i=0;i<4;i++){var a=i*Math.PI/2;var ant=cyl(0.012,0.012,1.8,dark,6);ant.position.set(Math.cos(a)*0.34,-0.55,Math.sin(a)*0.34);ant.rotation.z=Math.cos(a)*0.55;ant.rotation.x=-Math.sin(a)*0.55;g.add(ant);}return{grp:g,noz:[],boost:[],fl:0,float:true};}
  function bVoyager(){var g=new T.Group();var dish=new T.Mesh(new T.LatheGeometry([[0,0],[0.34,0.05],[0.66,0.18],[0.95,0.45]].map(v2),36),cream);dish.position.y=0.5;g.add(dish);g.add(cyl(0.34,0.34,0.3,gold,10));var boom=cyl(0.012,0.012,3.2,dark,6);boom.rotation.z=Math.PI/2;boom.position.set(1.6,0,0);g.add(boom);var rb=cyl(0.02,0.02,1.2,dark,6);rb.rotation.z=Math.PI/2;rb.position.set(-0.85,-0.2,0);g.add(rb);for(var i=0;i<3;i++){var rt=cyl(0.09,0.09,0.2,dark,8);rt.rotation.z=Math.PI/2;rt.position.set(-0.95-i*0.22,-0.2,0);g.add(rt);}return{grp:g,noz:[],boost:[],fl:0,float:true};}
  function earthSprite(){var SZ=512,R=SZ/2-8,cx=SZ/2,cy=SZ/2;var c=document.createElement('canvas');c.width=c.height=SZ;var x=c.getContext('2d');function atmo(){var ga=x.createRadialGradient(cx,cy,R*0.88,cx,cy,R*1.03);ga.addColorStop(0,'rgba(140,195,255,0)');ga.addColorStop(0.82,'rgba(140,195,255,0)');ga.addColorStop(1,'rgba(155,205,255,.65)');x.save();x.beginPath();x.arc(cx,cy,R*1.03,0,7);x.clip();x.fillStyle=ga;x.fillRect(0,0,SZ,SZ);x.restore();}function fb(){var im=x.createImageData(SZ,SZ),d=im.data;for(var py=0;py<SZ;py++)for(var px=0;px<SZ;px++){var dx=(px-cx)/R,dy=(py-cy)/R,rr=dx*dx+dy*dy,oi=(py*SZ+px)*4;if(rr>1){d[oi+3]=0;continue;}var nz=Math.sqrt(1-rr),oc=0.4+0.6*nz;var land=(Math.sin(px*0.017)*Math.cos(py*0.02)+Math.sin(px*0.041+py*0.029))>1.15;var r=land?64:28,gg=land?122:84,b=land?72:168;d[oi]=r*oc;d[oi+1]=gg*oc;d[oi+2]=b*oc;d[oi+3]=255;}x.putImageData(im,0,0);atmo();}fb();var tex=new T.CanvasTexture(c);var sp=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));var img=new Image();img.crossOrigin='anonymous';img.onload=function(){var sw=img.width,sh=img.height,oc2=document.createElement('canvas');oc2.width=sw;oc2.height=sh;var ox=oc2.getContext('2d');ox.drawImage(img,0,0);var src;try{src=ox.getImageData(0,0,sw,sh).data;}catch(e){return;}var out=x.createImageData(SZ,SZ),od=out.data;for(var py=0;py<SZ;py++){for(var px=0;px<SZ;px++){var dx=(px-cx)/R,dy=(py-cy)/R,rr=dx*dx+dy*dy,oi=(py*SZ+px)*4;if(rr>1){od[oi+3]=0;continue;}var nz=Math.sqrt(1-rr);var lat=Math.asin(Math.max(-1,Math.min(1,-dy)));var lon=Math.atan2(dx,nz);var u=(((lon/6.2831853)+1.5)%1)*sw;var v=(0.5-lat/3.14159265)*sh;var si=(((v|0)*sw)+(u|0))*4;var s2=0.42+0.58*nz;od[oi]=src[si]*s2;od[oi+1]=src[si+1]*s2;od[oi+2]=src[si+2]*s2;od[oi+3]=255;}}x.putImageData(out,0,0);atmo();tex.needsUpdate=true;};img.src='https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg';return sp;}
  var planet=null;function showPlanet(kind){if(planet){sc.remove(planet);planet=null;}if(!kind)return;planet=earthSprite();planet.position.set(6.6,-1.4,-12);planet.scale.setScalar(6);sc.add(planet);}
  var FN=520,fpool=[];for(var i=0;i<FN;i++){var s=spr(FIRE,T.AdditiveBlending);s.visible=false;sc.add(s);fpool.push(s);}
  function getF(){for(var i=0;i<FN;i++)if(!fpool[i].visible)return fpool[i];return null;}
  function emitAt(origin,dir,power){var n=Math.round(power*2.2);for(var i=0;i<n;i++){var s=getF();if(!s)break;s.visible=true;s.position.copy(origin).addScaledVector(dir,Math.random()*0.4);s.position.x+=(Math.random()-0.5)*0.22;s.position.z+=(Math.random()-0.5)*0.22;var sp2=3.0+Math.random()*2.0;s.userData={vx:dir.x*sp2+(Math.random()-0.5)*0.5,vy:dir.y*sp2+(Math.random()-0.5)*0.5,vz:dir.z*sp2,life:1,mx:0.8+Math.random()*0.7};}}
  function stepFlame(dt){for(var i=0;i<FN;i++){var s=fpool[i];if(!s.visible)continue;var u=s.userData;u.life-=dt*1.7;if(u.life<=0){s.visible=false;continue;}s.position.x+=u.vx*dt;s.position.y+=u.vy*dt;s.position.z+=u.vz*dt;var sca=u.mx*(0.5+(1-u.life));s.scale.set(sca,sca,1);s.material.opacity=Math.min(1,u.life*1.3);s.material.color.setRGB(1,0.55+0.4*u.life,0.18*u.life);}}
  var SN=200,spool=[];for(var i=0;i<SN;i++){var s=spr(SMOKE);s.visible=false;sc.add(s);spool.push(s);}
  function getS(){for(var i=0;i<SN;i++)if(!spool[i].visible)return spool[i];return null;}
  function puff(x,y,z,vx,vy,scl,life){var s=getS();if(!s)return;s.visible=true;s.position.set(x,y,z);s.userData={vx:vx,vy:vy,life:life,max:life,sc:scl,gw:scl*0.9};s.scale.set(scl,scl,1);s.material.opacity=0;}
  function stepSmoke(dt){for(var i=0;i<SN;i++){var s=spool[i];if(!s.visible)continue;var u=s.userData;u.life-=dt;if(u.life<=0){s.visible=false;continue;}s.position.x+=u.vx*dt;s.position.y+=u.vy*dt;var t=u.life/u.max;var sca=u.sc+u.gw*(1-t);s.scale.set(sca,sca,1);s.material.opacity=Math.min(0.85,(1-Math.abs(t-0.7))*0.9)*0.8;}}
  var SEQ=[{k:'starship',b:bStarship,type:'launch'},{k:'falcon9',b:bFalcon9,type:'launch'},{k:'saturn',b:bSaturn,type:'launch'},{k:'sls',b:bSLS,type:'launch'},{k:'shuttle',b:bShuttle,type:'float'},{k:'iss',b:bISS,type:'float'},{k:'sputnik',b:bSputnik,type:'float'},{k:'voyager',b:bVoyager,type:'float'}];
  var veh=null,cur2=null,idx=0,camAngle=0;
  function spawn(i){if(veh){sc.remove(veh.holder);}cur2=SEQ[i];var built=cur2.b();var holder=new T.Group();holder.add(built.grp);sc.add(holder);var bb0=new T.Box3().setFromObject(built.grp);var sz=new T.Vector3();bb0.getSize(sz);var s=(cur2.type==='launch'?5.0:4.2)/(Math.max(sz.x,sz.y,sz.z)||1);built.grp.scale.setScalar(s);var bb=new T.Box3().setFromObject(built.grp);var ctr=new T.Vector3();bb.getCenter(ctr);built.grp.position.sub(ctr);var cores=[],lowY=0;built.noz.forEach(function(o){if(o[1]<lowY)lowY=o[1];var cg=spr(FIRE,T.AdditiveBlending);cg.position.set(o[0],o[1],o[2]);cg.scale.set(0,0,1);built.grp.add(cg);cores.push(cg);});var cap=null;if(built.noz.length){cap=spr(FIRE,T.AdditiveBlending);cap.center.set(0.5,1.0);cap.position.set(0,lowY-0.05,0);cap.scale.set(0,0,1);built.grp.add(cap);}veh={holder:holder,grp:built.grp,noz:built.noz,cores:cores,cap:cap,boost:built.boost,float:built.float,t:0,phase:cur2.type==='launch'?'liftoff':'float'};if(cur2.type==='float'){showPlanet('earth');}else{showPlanet(null);}dropped=[];}
  var dropped=[];
  function altitude(){if(!veh||veh.float)return 1;var p=veh.phase,t=veh.t;if(p==='liftoff')return Math.min(0.1,t*0.02);if(p==='ascent')return 0.1+Math.min(0.8,t*0.1);if(p==='sep')return 0.9+Math.min(0.1,t*0.05);return 1;}
  var skyTop=[111,176,255],skyBot=[191,224,255],spaceC=[5,6,13];
  function lerpC(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  function rgb(c){return'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';}
  function setSky(a){var e=a*a*(3-2*a);var tp=lerpC(skyTop,spaceC,e),bt=lerpC(skyBot,spaceC,e);hero.style.background='linear-gradient('+rgb(tp)+','+rgb(bt)+')';stars.material.opacity=e;}
  function rsz(){if(!hsLCv)return;var w=hero.clientWidth||900,h=hero.clientHeight||160;rnd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  spawn(0);var wq=new T.Quaternion(),dirV=new T.Vector3(),clk=new T.Clock();
  function nextV(){idx=(idx+1)%SEQ.length;spawn(idx);}
  function frame(){if(cur!=='L'||!hsLCv){stopLaunch();return;}hsLRAF=requestAnimationFrame(frame);var dt=Math.min(0.05,clk.getDelta());if(!veh){rnd.render(sc,cam);return;}veh.t+=dt;var P=veh.phase;
    if(P==='liftoff'&&veh.t>5){veh.phase='ascent';veh.t=0;}
    else if(P==='ascent'&&veh.t>8){veh.phase='sep';veh.t=0;veh.boost.forEach(function(bm){var wp=new T.Vector3();bm.getWorldPosition(wp);sc.add(bm);bm.position.copy(wp);bm.userData={vy:-1.4,vx:(Math.random()-0.5)*1.2,rot:(Math.random()-0.5)*3,life:4};dropped.push(bm);});}
    else if(P==='sep'&&veh.t>2){veh.phase='coast';veh.t=0;showPlanet('earth');if(planet){planet.position.set(4.5,-6.8,-20);planet.scale.setScalar(4.4);}}
    else if(P==='coast'&&veh.t>9){return nextV();}
    else if(P==='float'&&veh.t>14){return nextV();}
    var a=altitude();setSky(a);var powered=(P==='liftoff'||P==='ascent'||P==='sep');var burning=(P==='liftoff'||P==='ascent');veh.holder.updateMatrixWorld(true);
    if(burning&&veh.noz.length){veh.grp.getWorldQuaternion(wq);dirV.set(0,-1,0).applyQuaternion(wq).normalize();var pw=(P==='liftoff'?1.8:1.2);var en=Math.min(veh.noz.length,8);for(var ni=0;ni<en;ni++){var o=veh.noz[ni];var wp=veh.grp.localToWorld(new T.Vector3(o[0],o[1],o[2]));emitAt(wp,dirV,pw);}var fl=1+Math.sin(clk.elapsedTime*9)*0.06;var cs=(P==='liftoff'?1.15:0.92)*fl;veh.cores.forEach(function(cg){cg.scale.set(cs*0.8,cs*1.1,1);cg.material.opacity=1;});if(veh.cap){var cw=(P==='liftoff'?1.0:0.8);veh.cap.scale.set(cw*2.4*fl,cw*4.4*fl,1);veh.cap.material.opacity=0.92;}}
    else{veh.cores.forEach(function(cg){cg.scale.set(0,0,1);});if(veh.cap)veh.cap.scale.set(0,0,1);}
    stepFlame(dt);
    if(P==='liftoff'){var dn=veh.t<2.5?11:7;for(var sm=0;sm<dn;sm++){puff((Math.random()-0.5)*3.2,-3.5+Math.random()*0.9,-1+(Math.random()-0.8),(Math.random()-0.5)*4.0,0.15+Math.random()*0.5,2.7+Math.random()*2.4,3.0+Math.random()*2.0);}}
    if(P==='ascent'||P==='liftoff'){var bp=veh.grp.localToWorld(new T.Vector3(0,veh.noz.length?veh.noz[0][1]:-2,0));for(var ts=0;ts<2;ts++)puff(bp.x+(Math.random()-0.5)*0.5,bp.y-0.2-Math.random()*0.3,bp.z+(Math.random()-0.5)*0.4,(Math.random()-0.5)*0.5,-2.8-Math.random()*0.8,1.4+Math.random()*1.0,2.2);}
    stepSmoke(dt);
    for(var di=dropped.length-1;di>=0;di--){var bm=dropped[di];bm.userData.life-=dt;bm.position.y+=bm.userData.vy*dt;bm.position.x+=bm.userData.vx*dt;bm.rotation.z+=bm.userData.rot*dt;if(bm.userData.life<=0){sc.remove(bm);dropped.splice(di,1);}}
    if(cur2.type==='launch'){if(P==='liftoff'){var lt=Math.min(1,veh.t/5);veh.holder.position.y=-3.0*(1-lt*lt);}else veh.holder.position.y=0;}
    if(cur2.k==='shuttle'){var oa=clk.elapsedTime*0.5;veh.holder.position.set(Math.cos(oa)*4.8,Math.sin(oa)*1.5-0.2,-6.4+Math.sin(oa)*2.4);veh.grp.rotation.y=-oa+1.2;veh.grp.rotation.x=0.2;}
    else if(cur2.type==='launch'&&powered){veh.grp.rotation.y+=0.15*dt;veh.grp.rotation.x*=0.96;veh.grp.rotation.z*=0.96;}
    else{veh.grp.rotation.x+=0.12*dt;veh.grp.rotation.y+=0.17*dt;veh.grp.rotation.z+=0.07*dt;}
    if(planet)planet.rotation.y+=0.0016;
    if(cur2.k==='shuttle'){cam.position.set(0,2.0,8.6);cam.lookAt(0,-0.3,-3);}
    else if(cur2.type==='launch'){camAngle+=0.04*dt;cam.position.set(Math.sin(camAngle)*11,1.6,Math.cos(camAngle)*11);cam.lookAt(0,-0.6,0);}
    else{camAngle+=0.16*dt;cam.position.set(Math.sin(camAngle)*9.8,0.7+Math.sin(clk.elapsedTime*0.4)*0.5,Math.cos(camAngle)*9.8);cam.lookAt(0,0,0);}
    rsz();rnd.render(sc,cam);
  }
  frame();
}

function init(){try{if(inited)return;hero=document.getElementById('hero');if(!hero)return;star=document.getElementById('hsStar');sk=document.getElementById('hsSkin');fxl=document.getElementById('hsFx');if(star&&star.getContext)cx=star.getContext('2d');if(sk&&sk.getContext)sx=sk.getContext('2d');var c=cfg();MODE=c.heroMode||(_isJayden()?'pin':'surprise');var sv=c.heroFx;for(var i=0;i<FX.length;i++)enabled[FX[i].id]=sv?sv.indexOf(FX[i].id)>=0:true;bind();var pick=freshPick();save({heroLast:pick});applySkin(pick);for(var j=0;j<FX.length;j++)schedule(FX[j]);inited=true;}catch(e){}}
return {init:init,settingsHtml:settingsHtml};
})();
function heroInit(){heroGreetUpd();askMoniker();heroApplyTheme();heroShowQuote();setInterval(heroGreetUpd,60000);heroTimers();var ctrl=document.getElementById('heroCtrl');if(ctrl)ctrl.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var h=b.dataset.h;if(h==='fav'){if(window.heroCurId!=null)qFav(window.heroCurId);return;}if(h==='pause'){heroPaused=!heroPaused;}else if(h==='shuffle'){heroLocked=null;heroPaused=false;heroNextTheme();heroNextQuote();}else{heroTi=HERO_T.indexOf(h);heroLocked=h;}heroApplyTheme();heroSave();});try{if(window.HS)HS.init();}catch(e){}}

function renderLobby(){pulseGate("guest");}
function showMemberGate(){pulseGate("member");}
function gateMaybe(){if(window.__gatePassed)return;if(S&&S.me&&S.me.isOwner)return;var c=ucfg();var on=(typeof c.gate==="boolean")?c.gate:false;if(on)showMemberGate();}
function gatePref(on){ucfgSet({gate:!!on});render();}
function idlePref(n){ucfgSet({idle:n});idleStart();render();}
function paradeDelayPref(n){ucfgSet({paradeDelay:n});render();}
var __idleMins=0,__idleTO=null,__idleBound=false;
function idleStart(){var c=ucfg();__idleMins=(typeof c.idle==="number")?c.idle:0;if(!__idleBound){__idleBound=true;["mousemove","mousedown","keydown","touchstart","scroll"].forEach(function(ev){document.addEventListener(ev,__idlePoke,true);});}__idlePoke();}
function __idlePoke(){hideScreensaver();if(__idleTO){clearTimeout(__idleTO);__idleTO=null;}if(__idleMins>0)__idleTO=setTimeout(showScreensaver,__idleMins*60000);}
function showScreensaver(){if(document.getElementById("pulseSaver"))return;var d=document.createElement("div");d.id="pulseSaver";d.setAttribute("style","position:fixed;inset:0;z-index:700;background:radial-gradient(circle at 50% 40%,#1a0308 0%,#080103 60%,#000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer");d.innerHTML='<div style="text-align:center;animation:beatSaver 2.6s ease-in-out infinite"><div style="color:#ff8aa0;font-size:16px;letter-spacing:10px;text-shadow:0 0 14px rgba(220,30,60,.7)">CLEMIT</div><div style="color:#ff3b54;font-size:46px;font-weight:600;letter-spacing:6px;text-shadow:0 0 22px rgba(220,20,50,.85)">PULSE</div></div><div id="saverClk" style="color:#7fd6e8;font-size:13px;font-family:monospace;margin-top:18px"></div><div style="color:#6b4750;font-size:11px;margin-top:8px;letter-spacing:2px">touch to wake</div>';document.body.appendChild(d);if(!document.getElementById("saverKF")){var st=document.createElement("style");st.id="saverKF";st.textContent="@keyframes beatSaver{0%,100%{transform:scale(1)}8%{transform:scale(1.05)}16%{transform:scale(1)}24%{transform:scale(1.03)}32%{transform:scale(1)}}";document.head.appendChild(st);}var sc=function(){var e=document.getElementById("saverClk");if(!e)return;var dt=new Date();e.textContent=dt.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});};sc();d.__clk=setInterval(sc,15000);}
function hideScreensaver(){var d=document.getElementById("pulseSaver");if(d){if(d.__clk)clearInterval(d.__clk);d.remove();}}

function gateEkgRun(cv){
  var ctx=cv.getContext("2d"),dpr=window.devicePixelRatio||1,W=0,H=140,baseY=70;
  function rs(){W=cv.parentElement.offsetWidth||cv.offsetWidth||600;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  rs();window.addEventListener("resize",rs);
  var SWEEP=1100,spikes=[];
  function ns(){var x1=W*0.14+Math.random()*W*0.30,gap=W*(0.24+Math.random()*0.07);spikes=[x1,x1+gap];}
  ns();var start=null;
  function od(d){if(d<-12||d>14)return 0;if(d<-4)return 9*((d+12)/8);if(d<0)return 9+(-64)*((d+4)/4);if(d<5)return -55+77*(d/5);return 22+(-22)*((d-5)/9);}
  function yA(x){var s=0;for(var i=0;i<spikes.length;i++)s+=od(x-spikes[i]);return baseY+s;}
  function fr(ts){if(start===null)start=ts;var el=ts-start;if(el>=SWEEP){start=ts;el=0;ns();}var hx=(el/SWEEP)*W;ctx.clearRect(0,0,W,H);ctx.shadowBlur=0;ctx.strokeStyle="rgba(31,88,118,.45)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,baseY);ctx.lineTo(W,baseY);ctx.stroke();var x0=Math.max(0,hx-160);ctx.shadowColor="#7fd0ff";ctx.shadowBlur=12;ctx.lineWidth=2.6;ctx.lineCap="round";ctx.lineJoin="round";var px=x0,py=yA(x0);for(var x=x0+3;x<=hx;x+=3){var y=yA(x),rt=(x-x0)/(hx-x0||1);ctx.strokeStyle="rgba(214,241,255,"+(0.12+0.88*rt)+")";ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();px=x;py=y;}ctx.shadowBlur=16;ctx.fillStyle="#f0faff";ctx.beginPath();ctx.arc(hx,yA(hx),3.6,0,6.2832);ctx.fill();requestAnimationFrame(fr);}
  requestAnimationFrame(fr);
}
function bootReveal(){var v=document.getElementById('bootveil');if(v&&!v.__g){v.__g=1;v.classList.add('gone');setTimeout(function(){if(v.parentNode)v.parentNode.removeChild(v);},800);}}
async function load(){S=await (await fetch('/api/state')).json();if(S&&S.pending){renderLobby();return;}applyTheme();var __ac=null;try{__ac=new URLSearchParams(location.search).get('accent');}catch(e){}if(__ac&&/^#[0-9a-fA-F]{6}$/.test(__ac))themeSet(__ac,true);try{if(!window.__splashShown&&!ucfg().skipSplash&&!__ac&&!JPV_IN()&&typeof showLoginSplash==='function'){window.__splashShown=1;showLoginSplash();}}catch(e){}try{window.__songs=await (await fetch('/api/songs')).json();}catch(e){window.__songs=window.__songs||[];}window.HQ=(S.quotes&&S.quotes.quotes&&S.quotes.quotes.length)?S.quotes.quotes:HERO_Q;window.MQ=(S.movieQueue||[]);window.__libPL=(S.libPlaylists&&S.libPlaylists.length)?S.libPlaylists:window.__libPL;if(!window.__djLoaded&&S.songQueue&&S.songQueue.q){window.__djLoaded=true;dq=S.songQueue.q;dqi=(typeof S.songQueue.i==='number')?S.songQueue.i:-1;}if(S.rotationState&&typeof S.rotationState==='object')window.ROT=S.rotationState;document.getElementById('role').textContent=S.me.role;var __cb=document.getElementById('crownBadge');if(__cb){if(S.me.isKing){__cb.textContent='👑';__cb.style.opacity='1';__cb.title='You are the King of PULSE — final authority over the site and the line of succession.';}else if(S.me.inLine){__cb.textContent='👑';__cb.style.opacity='.6';__cb.title='You are in the Clemit line of succession. Should it ever be required, the duties of steward would fall to you — keep this family hub running and protect everyone’s materials. Your position in the line is private to the King.';}else{__cb.textContent='';__cb.removeAttribute('title');}}if(!window.__logged&&!JPV_IN()){window.__logged=true;audit('login','signed in','Session');}if(!window.heroReady){heroInit();window.heroReady=true;}else{heroFavUpd();}buildNav();render();if(!djReady){djInit();djReady=true;}gateMaybe();if(!JPV_IN())idleStart();try{window.__refSig=refSig(S);}catch(e){}phonePreviewMaybe();}
function arcadeView(){var rows=[{title:'2048',genre:'Puzzle',source:'Free link',u:'https://play2048.co/'},{title:'Hextris',genre:'Arcade',source:'Free link',u:'https://hextris.io/'},{title:'Tetris (clone)',genre:'Classic',source:'Free link',u:'https://chvin.github.io/react-tetris/'},{title:'Snake',genre:'Classic',source:'Free link',u:'https://playsnake.org/'},{title:'Pac-Man (clone)',genre:'Arcade',source:'Free link',u:'https://freepacman.org/'},{title:'Asteroids',genre:'Arcade',source:'Free link',u:'https://freeasteroids.org/'},{title:'Open-Source Game Catalog',genre:'Catalog',source:'Directory',u:'https://osgameclones.com/'},{title:'itch.io Free HTML5 Games',genre:'Catalog',source:'Directory',u:'https://itch.io/games/free/html5'}];window.__games=rows;window.__cflist=rows;if(typeof window.__cfi!=='number'||window.__cfi>=rows.length)window.__cfi=0;var ico=function(g){g=(g||'').toLowerCase();if(g==='puzzle')return '\\uD83E\\uDDE9';if(g==='classic')return '\\uD83D\\uDD79';if(g==='catalog')return '\\uD83D\\uDCDA';if(g==='arcade')return '\\uD83D\\uDC7E';return '\\uD83C\\uDFAE';};var h='<div class="vhead"><h2>\\uD83C\\uDFAE Arcade</h2><span style="color:var(--dim);font-size:.8rem;margin-left:auto">the family game room</span></div>';h+='<p style="color:var(--dim);font-size:.85rem;margin:0 0 12px;">Free, legal games \\u2014 they open in a new tab. Tap a cover to center it, then \\u25B6 Play.</p>';h+='<div class="cflabels" id="cflabels">';rows.forEach(function(g,i){h+='<div class="cflabel" onclick="cfGo('+i+')"><div class="cfl-title">'+esc(g.title)+'</div><div class="cfl-stat cfl-field">'+esc(g.genre||'')+'</div></div>';});h+='</div>';h+='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">\\u2039</button><div class="cfstage" id="cfstage">';rows.forEach(function(g,i){var hue=mHue(g.title);h+='<div class="cfc" onclick="cfClick(event,'+i+')"><div class="cfflip"><div class="cffront"><div class="cfposter" style="background:linear-gradient(150deg,hsl('+hue+',46%,30%),hsl('+((hue+40)%360)+',52%,15%))"><span class="cfinit">'+ico(g.genre)+'</span></div><div class="cfinfo"><div class="cfd-title2">'+esc(g.title)+'</div><div class="cfd-meta">'+esc(g.genre||'')+' \\u00b7 '+esc(g.source||'')+'</div><div class="cfd-btns"><span class="mbtn play" onclick="gameInfo('+i+')">\\u25B6 Play</span></div></div></div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">\\u203a</button></div>';setTimeout(cfPaint,30);return h;}
function tabsBase(){var t=[['dj','📚 Library'],['home','🏠 Home']];if(S.groceryVisible)t.push(['grocery','🛒 Grocery']);t.push(['board','🔊 Forums'],['reunion','🎉 Reunion 2027'],['mytriton','🔱 MyTriton'],['cameras','📷 Cameras'],['quotes','💬 Quotes'],['arcade','🎮 Arcade']);if(S.me.isAdmin||S.me.isRoyal)t.push(['control','🎛 Control Panel']);if(S.me.role!=='guest')t.push(['logs','📜 Logs']);t.push(['updates','✨ Updates']);if(S.me.isAdmin)t.push(['rotation','🔄 Rotation']);if(S.me.role!=='guest')t.push(['admin','⚙ Settings']);if(S.me.isKing)t.push(['king','👑 King']);return t;}
function tabs(){var base=tabsBase();var c=(typeof ucfg==='function')?ucfg():{};var order=c.tabOrder||[];var hide=c.tabHide||{};if(c.tabOrderV!==3){order=[];try{ucfgSet({tabOrder:[],tabOrderV:3});}catch(e){}}var lock={home:1,admin:1};var byId={};base.forEach(function(t){byId[t[0]]=t;});var out=[];order.forEach(function(id){var t=byId[id];if(t&&(lock[id]||!hide[id])){out.push(t);delete byId[id];}});base.forEach(function(t){if(byId[t[0]]&&(lock[t[0]]||!hide[t[0]]))out.push(t);});return out;}
/* ===== nav button hover FX (shaky + particle bursts) ===== */
var HFX={home:['♪','♫','♬'],reunion:['🎉','🎊','🎆','🎇','🎈'],grocery:['🛒','🥕','🍎','🥛','🧀'],board:['📝','✉','📜','📃'],dj:['♫','📖','🎬','📚'],arcade:['🎮','👾','⭐','🎲'],updates:['⭐','✨','🌟','💫'],king:['❤','💜','💛','💖'],quotes:['❝','❞','✨']};
var HFXFLOAT={home:1,king:1};var hfxLayer=null,hfxParts=[],hfxRAF=0;
function hfxEnsure(){if(!hfxLayer){hfxLayer=document.createElement('div');hfxLayer.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:9999;overflow:visible;';document.body.appendChild(hfxLayer);}}
function hfxEmit(btn,arr,v){hfxEnsure();var br=btn.getBoundingClientRect();var cx=br.left+br.width/2,cy=br.top+br.height/2;var ang=Math.random()*Math.PI*2;var ox=cx+Math.cos(ang)*(br.width/2+5),oy=cy+Math.sin(ang)*(br.height/2+5);var e=document.createElement('span');e.textContent=arr[Math.floor(Math.random()*arr.length)];e.style.cssText='position:fixed;left:0;top:0;font-size:'+(13+Math.random()*7)+'px;will-change:transform,opacity;';hfxLayer.appendChild(e);var fl=!!HFXFLOAT[v];var p={e:e,x:ox,y:oy,rot:0,life:0,fl:fl,ph:Math.random()*6,bn:0};if(fl){var sp=28+Math.random()*38;p.vx=Math.cos(ang)*sp;p.vy=Math.sin(ang)*sp-42;p.g=-150;p.vr=(Math.random()*1.2-0.6);p.max=1.8+Math.random()*0.9;p.flr=1e9;}else{var sp2=80+Math.random()*120;p.vx=Math.cos(ang)*sp2;p.vy=Math.sin(ang)*sp2;p.g=900;p.vr=(v==='arcade'?(6+Math.random()*12)*(Math.random()<0.5?-1:1):(Math.random()*4-2));p.max=1+Math.random()*0.6;p.flr=oy+40+Math.random()*70;}hfxParts.push(p);if(!hfxRAF)hfxRAF=requestAnimationFrame(hfxTick);}
function hfxTick(ts){if(!hfxTick.l)hfxTick.l=ts;var dt=Math.min(50,ts-hfxTick.l)/1000;hfxTick.l=ts;for(var i=hfxParts.length-1;i>=0;i--){var p=hfxParts[i];p.life+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.fl){p.x+=Math.sin((p.life+p.ph)*2.6)*9*dt;}else if(p.y>p.flr&&!p.bn){p.y=p.flr;p.vy*=-0.42;p.vx*=0.7;p.bn=1;}p.e.style.opacity=String(Math.max(0,1-p.life/p.max));p.e.style.transform='translate('+p.x+'px,'+p.y+'px) rotate('+p.rot.toFixed(2)+'rad)';if(p.life>=p.max){p.e.remove();hfxParts.splice(i,1);}}if(hfxParts.length){hfxRAF=requestAnimationFrame(hfxTick);}else{hfxRAF=0;hfxTick.l=0;}}
function hfxWire(){var seg=document.getElementById('seg');if(!seg||seg.__hfx)return;seg.__hfx=1;seg.addEventListener('mouseover',function(ev){var b=ev.target.closest?ev.target.closest('button'):null;if(!b||b.__hot)return;b.__hot=1;b.classList.add('hot');var v=b.getAttribute('data-v');var arr=HFX[v];if(arr){b.__t=setInterval(function(){hfxEmit(b,arr,v);hfxEmit(b,arr,v);},117);}});seg.addEventListener('mouseout',function(ev){var b=ev.target.closest?ev.target.closest('button'):null;if(!b)return;b.__hot=0;b.classList.remove('hot');if(b.__t){clearInterval(b.__t);b.__t=null;}});}
function libSig(){return '<div class="libsig"><span class="ok">backed-up &#10003;</span><span class="ok">QA &#10003;</span><span class="ok">reviewed &#10003;</span><span>built &amp; owned by ~Jesse</span><span class="wd">&#8614; MyWand</span></div>';}
function buildNav(){const seg=document.getElementById('seg');[...seg.querySelectorAll('button')].forEach(b=>b.remove());tabs().forEach(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.dataset.v=id;b.onclick=()=>show(id);if(id===cur)b.classList.add('active');seg.appendChild(b);});moveSlider();try{hfxWire();}catch(e){}}
function moveSlider(){var seg=document.getElementById('seg');if(!seg)return;var a=seg.querySelector('button.active');var s=document.getElementById('slider');if(!a||!s)return;var col=getComputedStyle(seg).flexDirection==='column';if(col){s.style.left='4px';s.style.right='4px';s.style.width='auto';s.style.bottom='auto';s.style.top=a.offsetTop+'px';s.style.height=a.offsetHeight+'px';}else{s.style.top='4px';s.style.bottom='4px';s.style.height='auto';s.style.right='auto';s.style.left=a.offsetLeft+'px';s.style.width=a.offsetWidth+'px';}}
function show(v){cur=v;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));moveSlider();render();}
function viewError(v,e){var msg=(e&&e.message)?e.message:String(e||'unknown error');return '<div class="card" style="border:1px solid var(--bad,#ff3b54)"><h2>This panel hit a snag</h2><div class="sub">The <b>'+esc(v)+'</b> tab failed to draw, but the rest of PULSE is fine - your other tabs still work.</div><p style="margin-top:8px;font-family:monospace;font-size:.8rem;color:var(--dim);white-space:pre-wrap;word-break:break-word">'+esc(msg)+'</p><div class="row" style="margin-top:10px;gap:8px"><button class="go" onclick="show(\\''+v+'\\')">Try this tab again</button><button class="mini" onclick="location.reload()">Reload PULSE</button></div></div>';}
/* ===== ARCADE PARADE (live) ===== */
var pPAL={k:'#0b0b14',W:'#ffffff',g:'#46e24b',G:'#1f8f2f',c:'#37e0ff',C:'#1f7fd0',b:'#2a6bd6',u:'#16407f',r:'#ff3b3b',R:'#b01010',y:'#ffd23b',o:'#e07b2a',p:'#c46bff',P:'#6a23a8',s:'#9aa6bd',S:'#5b6678',w:'#e8c9a0',n:'#7a4a22',f:'#ff8ec9',z:'#7fb86a',Z:'#3f6b34'};
var pR=[
 {n:'Mario',type:'mario'},
 {n:'Lion',type:'walk',fps:6,frames:[['           ','      nnn  ','  oooonnnnn',' ooooooonnn',' oooooooonn','  o o o o  ',' o       n '],['           ','      nnn  ','  oooonnnnn',' ooooooonnn',' oooooooonn','   o o o o ',' o      n  ']]},
 {n:'Tank',type:'tank',fps:0,frames:[['   ccc   ','  ccccc  ','       SS','SSSSSSSSS','SSSSSSSSS',' k k k k ']]},
 {n:'Frog',type:'walk',fps:6,frames:[[' g   g ','  ggg  ',' gGGGg ','ggggggg','g g g g'],[' g   g ','  ggg  ',' gGGGg ','ggggggg',' gg gg ']]},
 {n:'Invader',type:'walk',fps:3,frames:[['  g     g  ','   g   g   ','  ggggggg  ',' gg ggg gg ','ggggggggggg','g ggggggg g','g g     g g','   gg gg   '],['  g     g  ','g  g   g  g','g ggggggg g','gggg ggg gg','ggggggggggg',' ggggggggg ','  g     g  ',' g       g ']]},
 {n:'Star Ship',type:'ship',fps:0,frames:[['    c    ','   ccc   ','  ccccc  ',' cc c cc ','cWc c cWc','c       c']]},
 {n:'Pac-Man',type:'pac',fps:7,frames:[['  yyyyy  ',' yyyyyyy ','yyyy     ','yyy      ','yyy      ','yyyy     ',' yyyyyyy ','  yyyyy  '],['  yyyyy  ',' yyyyyyy ','yyyyyyyy ','yyyyyyyyy','yyyyyyyyy','yyyyyyyy ',' yyyyyyy ','  yyyyy  ']]},
 {n:'Zombie',type:'walk',fps:5,frames:[['  zzz  ',' zWzWz ',' zzzzz ','GzzzzG ','Gzzzz  ',' z  z  '],['  zzz  ',' zWzWz ',' zzzzz ','GzzzzG ','Gzzzz  ','  z z  ']]}
];
var pGHOST=[['   fffff   ','  fffffff  ',' fffffffff ',' fWWWfWWWf ',' fbWWfbWWf ',' fffffffff ',' fffffffff ',' f f f f f '],['   fffff   ','  fffffff  ',' fffffffff ',' fWWWfWWWf ',' fWWbfWWbf ',' fffffffff ',' fffffffff ',' f f f f f ']];
var pMARIO_S=[[' rrr ','rwwn ','wwww ','bRRb ','bbbb ','n  n '],[' rrr ','rwwn ','wwww ','bRRb ','bbbb ',' nn  ']];
var pMARIO_B=[[' rrrr ','rwwwn ','wwwww ','wwwww ','bRRRb ','bbbbb ','n   n ',' n n  '],[' rrrr ','rwwwn ','wwwww ','wwwww ','bRRRb ','bbbbb ',' n n  ','n   n ']];
var pBLOCK=[['yyyyy','yWWWy','yyyWy','yyWyy','yyyyy','yyWyy']];
var pMUSH=[['  rrr  ',' rWrWr ','rrrrrrr',' wwwww ',' w w w ']];
var pOn=false,pLayer=null,pIdx=0,pSpawnT=null,pRumT=null,pStartT=null,pWALK=48,pCELL=3;
function pDay(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function pBlocked(){try{return localStorage.getItem('clemitArcadeDay')===pDay();}catch(e){return false;}}
function pDelayMs(){try{var c=ucfg();var n=(typeof c.paradeDelay==='number')?c.paradeDelay:5;return n<0?-1:n*60000;}catch(e){return 300000;}}
function pMainEl(){return document.getElementById('main');}
function pArcBtn(){return document.querySelector('#seg button[data-v="arcade"]');}
function pSvg(rows,cell){var h=rows.length,w=0;rows.forEach(function(r){if(r.length>w)w=r.length;});var sw=w*cell,sh=h*cell,o='<svg xmlns="http://www.w3.org/2000/svg" width="'+sw+'" height="'+sh+'" viewBox="0 0 '+sw+' '+sh+'" shape-rendering="crispEdges">';for(var yy=0;yy<h;yy++){var row=rows[yy];for(var xx=0;xx<row.length;xx++){var ch=row[xx];if(ch===' ')continue;var col=pPAL[ch];if(!col)continue;o+='<rect x="'+(xx*cell)+'" y="'+(yy*cell)+'" width="'+cell+'" height="'+cell+'" fill="'+col+'"/>';}}return o+'</svg>';}
function pMk(frames){var fr=frames.map(function(g){return pSvg(g,pCELL);});var el=document.createElement('div');el.className='psprite';el.innerHTML='<span class="pbody">'+fr[0]+'</span>';var b=el.querySelector('.pbody');var s=el.querySelector('svg');return {el:el,body:b,fr:fr,sw:+s.getAttribute('width'),sh:+s.getAttribute('height'),fi:0};}
function pSetf(o,i){if(i!==o.fi){o.fi=i;o.body.innerHTML=o.fr[i];}}
function pLane(g){return g.lanes[1+Math.floor(Math.random()*Math.max(1,g.lanes.length-1))];}
function pGeo(){var m=pMainEl();if(!m)return null;var mr=m.getBoundingClientRect();var y=[];['.libtiles','.libnprow','.cf'].forEach(function(sel){var e=m.querySelector(sel);if(e){var r=e.getBoundingClientRect();y.push(r.bottom-mr.top);}});var a=pArcBtn(),ax=-60,ay=mr.height/2;if(a){var ar=a.getBoundingClientRect();ax=ar.left-mr.left+ar.width/2;ay=ar.top-mr.top+ar.height/2-8;}return {w:mr.width,lanes:y,arcX:ax,arcY:ay};}
function pTankShot(x,y){if(!pLayer)return;var p=document.createElement('div');p.style.cssText='position:absolute;left:0;top:0;color:#fff;font:900 14px monospace;text-shadow:0 0 6px #fff;';p.textContent='-';pLayer.appendChild(p);var px=x,t=0,last=null;function st(ts){if(!pOn){p.remove();return;}if(!last)last=ts;var dt=Math.min(50,ts-last)/1000;last=ts;var d=200*dt;px-=d;t+=d;p.style.opacity=String(Math.max(0,1-t/100));p.style.transform='translate('+px+'px,'+y+'px)';if(t>=100){p.remove();return;}requestAnimationFrame(st);}requestAnimationFrame(st);}
function pShim(){var a=pArcBtn();if(!a)return;a.classList.remove('arcShim');void a.offsetWidth;a.classList.add('arcShim');setTimeout(function(){a.classList.remove('arcShim');},900);}
function pRumble(){var a=pArcBtn();if(!a)return;a.classList.remove('arcRumble');void a.offsetWidth;a.classList.add('arcRumble');}
function pSpawnPac(entry,g){var laneY=pLane(g);var pac=pMk(entry.frames),gh=pMk(pGHOST);var pby=laneY-pac.sh,gby=laneY-gh.sh;var gap=g.w*0.55,GS=pWALK*1.5;var px=g.w+8,gx=px+gap,pph='walk',gph='chase',last=null,pft=0,gft=0,bob=0,phx,phy,pht=0,ghx,ghy,ght=0;pac.el.style.transform='translate('+px+'px,'+pby+'px) scaleX(-1)';pLayer.appendChild(pac.el);gh.el.style.transform='translate('+gx+'px,'+gby+'px) scaleX(-1)';pLayer.appendChild(gh.el);
 function step(ts){if(!pOn){if(pac)pac.el.remove();if(gh)gh.el.remove();return;}if(!last)last=ts;var dt=Math.min(50,ts-last)/1000;last=ts;
  if(pac){pft+=dt;if(pft>=1/7){pft=0;pSetf(pac,(pac.fi+1)%pac.fr.length);}}
  gft+=dt;if(gft>=1/3){gft=0;pSetf(gh,(gh.fi+1)%gh.fr.length);}
  if(pac){if(pph==='walk'){px-=pWALK*dt;bob+=dt*8;var py=pby-Math.abs(Math.sin(bob))*2;pac.el.style.transform='translate('+px+'px,'+py+'px) scaleX(-1)';if(px<=0){pph='hop';phx=px;phy=py;pht=0;}}
   else if(pph==='hop'){pht+=dt;var pp=Math.min(1,pht/0.55);var nx=phx+(g.arcX-phx)*pp,ny=phy+(g.arcY-phy)*pp-Math.sin(pp*Math.PI)*26;pac.el.style.opacity=String(Math.max(0,1-pp*0.85));pac.el.style.transform='translate('+nx+'px,'+ny+'px) scaleX(-1)';if(pp>=1){pShim();pac.el.remove();pac=null;}}}
  if(gh){if(gph==='chase'){gx-=GS*dt;if(pac&&pph==='walk'&&gx<px+10)gx=px+10;var gy=gby-Math.abs(Math.sin(bob+1))*2;gh.el.style.transform='translate('+gx+'px,'+gy+'px) scaleX(-1)';if(gx<=0){gph='hop';ghx=gx;ghy=gy;ght=0;}}
   else if(gph==='hop'){ght+=dt;var gp=Math.min(1,ght/0.55);var gnx=ghx+(g.arcX-ghx)*gp,gny=ghy+(g.arcY-ghy)*gp-Math.sin(gp*Math.PI)*24;gh.el.style.opacity=String(Math.max(0,1-gp*0.85));gh.el.style.transform='translate('+gnx+'px,'+gny+'px) scaleX(-1)';if(gp>=1){gh.el.remove();gh=null;}}}
  if(pac||gh)requestAnimationFrame(step);}
 requestAnimationFrame(step);}
function pSpawnWalk(entry,g){var o=pMk(entry.frames);var laneY=pLane(g);var baseY=laneY-o.sh;var x=g.w+8,y=baseY,phase='walk',last=null,ft=0,fps=entry.fps||0,bob=0,shot=2,hx,hy,ht=0;o.el.style.transform='translate('+x+'px,'+y+'px) scaleX(-1)';pLayer.appendChild(o.el);
 function step(ts){if(!pOn){o.el.remove();return;}if(!last)last=ts;var dt=Math.min(50,ts-last)/1000;last=ts;
  if(phase==='walk'){if(fps){ft+=dt;if(ft>=1/fps){ft=0;pSetf(o,(o.fi+1)%o.fr.length);}}x-=pWALK*dt;bob+=dt*8;y=baseY-Math.abs(Math.sin(bob))*2;
   if(entry.type==='tank'){shot+=dt;if(shot>=3.5){shot=0;pTankShot(x,baseY+o.sh*0.45);}}
   if(x<=0){phase='hop';hx=x;hy=y;ht=0;}
   o.el.style.transform='translate('+x+'px,'+y+'px) scaleX(-1)';}
  else if(phase==='hop'){ht+=dt;var p=Math.min(1,ht/0.6);var nx=hx+(g.arcX-hx)*p,ny=hy+(g.arcY-hy)*p-Math.sin(p*Math.PI)*26;o.el.style.opacity=String(Math.max(0,1-p*0.85));o.el.style.transform='translate('+nx+'px,'+ny+'px) scaleX(-1)';if(p>=1){pShim();o.el.remove();return;}}
  requestAnimationFrame(step);}
 requestAnimationFrame(step);}
function pSpawnShip(entry,g){var o=pMk(entry.frames);var baseY=g.lanes[0]-o.sh-8;var x=g.w+8,phase='fly',last=null,ft=0,fps=entry.fps||0,t=0,loopAt=(Math.random()<0.3?g.w*(0.2+Math.random()*0.55):-1),loopR=14+Math.random()*18,loopD=0.6+Math.random()*0.5,loop=false,lt=0,hx,hy,ht=0;o.el.style.transform='translate('+x+'px,'+baseY+'px) scaleX(-1)';pLayer.appendChild(o.el);
 function step(ts){if(!pOn){o.el.remove();return;}if(!last)last=ts;var dt=Math.min(50,ts-last)/1000;last=ts;if(fps){ft+=dt;if(ft>=1/fps){ft=0;pSetf(o,(o.fi+1)%o.fr.length);}}
  if(phase==='fly'){t+=dt;x-=pWALK*1.05*dt;if(loopAt>0&&!loop&&x<=loopAt){loop=true;lt=0;loopAt=-1;}var lx=0,ly=0;if(loop){lt+=dt;var a=lt/loopD;if(a>=1)loop=false;else{lx=-Math.sin(a*Math.PI*2)*loopR;ly=-(1-Math.cos(a*Math.PI*2))*loopR*1.2;}}var fy=baseY+Math.sin(t*2.6)*6+ly;o.el.style.transform='translate('+(x+lx)+'px,'+fy+'px) scaleX(-1)';if(x<=0&&!loop){phase='land';hx=x;hy=fy;ht=0;}}
  else if(phase==='land'){ht+=dt;var p=Math.min(1,ht/0.7);var nx=hx+(g.arcX-hx)*p,ny=hy+(g.arcY-hy)*p-Math.sin(p*Math.PI)*16;o.el.style.opacity=String(Math.max(0,1-p*0.85));o.el.style.transform='translate('+nx+'px,'+ny+'px) scaleX(-1)';if(p>=1){pShim();o.el.remove();return;}}
  requestAnimationFrame(step);}
 requestAnimationFrame(step);}
function pSpawnMario(g){var o=pMk(pMARIO_S);var laneY=pLane(g);var baseY=laneY-o.sh;var blockX=g.w*0.5;var blk=pMk(pBLOCK);var blkY=laneY-blk.sh-38;blk.el.style.transform='translate('+blockX+'px,'+blkY+'px)';pLayer.appendChild(blk.el);
 var x=g.w+8,y=baseY,phase='run',last=null,ft=0,jt=0,popped=false,mush=null,grown=false,bob=0,hx,hy,ht=0;
 o.el.style.transform='translate('+x+'px,'+y+'px) scaleX(-1)';pLayer.appendChild(o.el);
 function grow(){var b=pMk(pMARIO_B);o.fr=b.fr;o.sh=b.sh;o.sw=b.sw;o.fi=0;o.body.innerHTML=o.fr[0];baseY=laneY-o.sh;}
 function step(ts){if(!pOn){o.el.remove();if(blk)blk.el.remove();if(mush)mush.el.remove();return;}if(!last)last=ts;var dt=Math.min(50,ts-last)/1000;last=ts;ft+=dt;if(ft>=1/6){ft=0;pSetf(o,(o.fi+1)%o.fr.length);}
  if(phase==='run'){x-=pWALK*dt;bob+=dt*8;y=baseY-Math.abs(Math.sin(bob))*2;if(x<=blockX+10){phase='jump';jt=0;}}
  else if(phase==='jump'){jt+=dt;var p=jt/0.62;y=baseY-Math.sin(Math.min(1,p)*Math.PI)*46;
   if(!popped&&p>=0.45){popped=true;if(blk){blk.el.style.transition='opacity .2s';blk.el.style.opacity='0';(function(bb){setTimeout(function(){bb.el.remove();},220);})(blk);blk=null;}mush=pMk(pMUSH);mush.x=blockX;mush.y=blkY;mush.vy=-185;mush.vx=0;mush.landed=false;mush.el.style.transform='translate('+mush.x+'px,'+mush.y+'px)';pLayer.appendChild(mush.el);}
   if(p>=1){phase='run2';y=baseY;}}
  else if(phase==='run2'){x-=pWALK*1.5*dt;bob+=dt*11;y=baseY-Math.abs(Math.sin(bob))*2.5;if(mush&&mush.landed&&!grown&&x<=mush.x+6){grown=true;mush.el.remove();mush=null;grow();}if(x<=0){phase='hop';hx=x;hy=y;ht=0;}}
  else if(phase==='hop'){ht+=dt;var pp=Math.min(1,ht/0.6);var nx=hx+(g.arcX-hx)*pp,ny=hy+(g.arcY-hy)*pp-Math.sin(pp*Math.PI)*26;o.el.style.opacity=String(Math.max(0,1-pp*0.85));o.el.style.transform='translate('+nx+'px,'+ny+'px) scaleX(-1)';if(pp>=1){pShim();o.el.remove();return;}}
  if(mush){var ml=laneY-mush.sh;if(!mush.landed){mush.vy+=900*dt;mush.y+=mush.vy*dt;if(mush.y>=ml&&mush.vy>0){mush.y=ml;mush.landed=true;mush.vx=-pWALK*0.62;}}else{mush.x+=mush.vx*dt;}mush.el.style.transform='translate('+mush.x+'px,'+mush.y+'px)';}
  if(phase!=='hop')o.el.style.transform='translate('+x+'px,'+y+'px) scaleX(-1)';
  requestAnimationFrame(step);}
 requestAnimationFrame(step);}
function pSpawn(){if(!pOn||!pLayer)return;var g=pGeo();if(!g||g.lanes.length<2)return;var entry=pR[pIdx%pR.length];pIdx++;if(entry.type==='ship')pSpawnShip(entry,g);else if(entry.type==='mario')pSpawnMario(g);else if(entry.type==='pac')pSpawnPac(entry,g);else pSpawnWalk(entry,g);}
function pLoop(){if(!pOn)return;pSpawn();pSpawnT=setTimeout(pLoop,3000+Math.random()*2400);}
function pRumbleLoop(){if(!pOn)return;if(Math.random()<0.6)pRumble();pRumT=setTimeout(pRumbleLoop,5000+Math.random()*6000);}
function paradeInit(){if(pOn||pBlocked())return;var m=pMainEl();if(!m)return;m.style.position='relative';pLayer=document.createElement('div');pLayer.className='pslayer';m.appendChild(pLayer);pOn=true;pIdx=0;pLoop();pRumbleLoop();}
function paradeStop(){pOn=false;if(pStartT){clearTimeout(pStartT);pStartT=null;}if(pSpawnT){clearTimeout(pSpawnT);pSpawnT=null;}if(pRumT){clearTimeout(pRumT);pRumT=null;}if(pLayer&&pLayer.parentNode){pLayer.parentNode.removeChild(pLayer);}pLayer=null;}

/* ===== Library Slice 1: Playlists (default) <-> Album Jog + shared movie queue =====
   Self-contained DOM widget. No regex, no backslashes. T2: persists library_playlists.
   T3: + Queue routes into the live window.MQ / mSave (shared movie_queue). built & owned by ~Jesse */
var LIB_CSS = ""
+".lv{--acc:#00e5ff;--vio:#b14bff;--dim:#8fb0cf;--line:rgba(60,170,255,.2);font-family:Consolas,monospace;color:#dff3ff}"
+".lv .seg{font-size:11px;font-weight:bold;color:#9fc6e0;border:1.5px solid var(--line);border-radius:10px;padding:6px 12px;cursor:pointer;display:inline-flex;gap:6px;align-items:center}"
+".lv .seg.on{color:#fff;border-color:var(--acc);background:rgba(0,229,255,.2);box-shadow:0 0 14px rgba(0,229,255,.4)}"
+".lv .mwrap{display:flex;gap:9px;min-height:200px}.lv .plcol{flex:0 0 178px;background:rgba(8,14,32,.65);border:1px solid var(--line);border-radius:12px;padding:8px}"
+".lv .plrow{border:1.5px solid var(--line);border-radius:9px;padding:6px 7px;margin-bottom:5px;cursor:pointer;background:rgba(10,16,32,.5)}.lv .plrow.on{border-color:var(--vio);background:rgba(177,75,255,.14)}"
+".lv .pn{font-size:11px;font-weight:bold;color:#eaf6ff}.lv .pmeta{font-size:8px;color:var(--dim)}"
+".lv .tagchip{font-size:7px;font-weight:bold;color:#d6b0ff;background:rgba(177,75,255,.16);border:1px solid rgba(177,75,255,.5);border-radius:9px;padding:1px 5px;margin-right:3px}.lv .tagchip.auto{color:#5fffe0;background:rgba(95,255,224,.12);border-color:rgba(95,255,224,.45)}"
+".lv .qcol{flex:1;min-width:0;background:rgba(8,14,32,.65);border:1px solid var(--line);border-radius:12px;padding:8px}"
+".lv .trow{display:flex;align-items:center;gap:7px;padding:5px 7px;border:1px solid var(--line);border-radius:8px;margin-bottom:4px;background:rgba(10,16,32,.5)}.lv .trow.cur{border-color:var(--acc)}"
+".lv .jogbtn{float:right;font-size:9px;font-weight:bold;color:#9fd6ff;border:1.5px solid var(--line);border-radius:8px;padding:4px 9px;cursor:pointer}.lv .jogbtn.on{color:#fff;border-color:var(--acc);background:rgba(0,229,255,.2)}"
+".lv .lcf{position:relative;height:180px;perspective:1000px;overflow:hidden;cursor:grab}.lv .lcfc{position:absolute;left:50%;top:50%;width:112px;height:164px;margin:-82px 0 0 -56px;border-radius:11px;overflow:hidden;border:1.5px solid rgba(255,255,255,.1);transition:transform .42s,opacity .42s}.lv .lcfc.cc{border-color:var(--acc);box-shadow:0 0 24px rgba(0,229,255,.45)}"
+".lv .lpost{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:#fff}.lv .lmbtn{font-size:8px;font-weight:bold;border:1px solid var(--acc);background:rgba(0,229,255,.14);color:var(--acc);border-radius:6px;padding:3px 7px;cursor:pointer}.lv .lmbtn.q{border-color:var(--vio);color:#d6b0ff;background:rgba(177,75,255,.16)}";

function mountLibraryV7(root){
  if(!document.getElementById('libV7css')){var st=document.createElement('style');st.id='libV7css';st.textContent=LIB_CSS;document.head.appendChild(st);}
  root.className='lv';
  var GENRE={'Alanis Morissette':'alt','The Offspring':'punk','Metallica':'metal','ELO':'classic','John Denver':'country','Johnny Cash':'country'};
  function genreOf(a){return GENRE[a]||'misc';}
  var PL=(window.__libPL)||[
    {name:'Her Mix',manual:['favorites'],tracks:[{t:'You Oughta Know',a:'Alanis Morissette',d:'4:09'},{t:'Self Esteem',a:'The Offspring',d:'4:17'}]},
    {name:'Wake Up',manual:['chill'],tracks:[]},
    {name:'Roadtrip Mix',manual:[],tracks:[{t:'Mr. Blue Sky',a:'ELO',d:'5:03'},{t:'Country Roads',a:'John Denver',d:'3:10'}]}
  ];
  window.__libPL=PL;
  function plSave(){try{fetch('/api/library/playlists',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pl:PL})});}catch(e){}}
  window.__libPLSave=plSave;
  /* T3: source the live catalog + share the real movie queue (window.MQ / mSave) */
  var SRC=(typeof MOVIES!=='undefined'&&MOVIES&&MOVIES.length)?MOVIES:[{t:'300'},{t:'WALL-E'},{t:'V for Vendetta'},{t:'Chamber of Secrets'},{t:'Deathly Hallows Pt 1'}];
  var MOV=SRC.slice(0,20).map(function(m){return {t:m.t};});
  function isQ(t){return (window.MQ||[]).indexOf(t)>=0;}
  function toggleQ(t){window.MQ=window.MQ||[];var p=window.MQ.indexOf(t);if(p>=0)window.MQ.splice(p,1);else window.MQ.push(t);if(typeof mSave==='function')mSave();}
  var mode='playlist',curPL=0,curTrack=0,jogOn=false,idx=0;

  function autoTags(p){var s={},k;for(k=0;k<p.tracks.length;k++)s[genreOf(p.tracks[k].a)]=1;return Object.keys(s);}
  function render(){
    var h='<div style="display:flex;gap:7px;margin-bottom:8px">'
      +'<div class="seg'+(mode==='playlist'?' on':'')+'" data-m="playlist">&#9835; Playlists</div>'
      +'<div class="seg'+(mode==='jog'?' on':'')+'" data-m="jog">&#8644; Album Jog</div></div>';
    if(mode==='playlist'){
      h+='<div class="mwrap"><div class="plcol"><div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:var(--dim);margin-bottom:6px">Playlists</div>';
      PL.forEach(function(p,i){var at=autoTags(p),tags=at.map(function(t){return '<span class="tagchip auto">'+t+'</span>';}).join('')+p.manual.map(function(m){return at.indexOf(m)<0?'<span class="tagchip">'+m+'</span>':'';}).join('');
        h+='<div class="plrow'+(i===curPL?' on':'')+'" data-pl="'+i+'"><div class="pn">'+p.name+'</div><div class="pmeta">'+p.tracks.length+' tracks</div><div style="margin-top:4px">'+tags+'</div></div>';});
      h+='</div><div class="qcol"><div style="font-size:13px;font-weight:bold;color:#fff">'+(PL[curPL]?PL[curPL].name:'-')+'<span class="jogbtn'+(jogOn?' on':'')+'" data-jog="1">Album Jog</span></div><div style="margin-top:6px">';
      if(PL[curPL])PL[curPL].tracks.forEach(function(tk,j){h+='<div class="trow'+(j===curTrack?' cur':'')+'" data-tr="'+j+'"><span style="font-size:9px;color:var(--dim);width:14px">'+(j+1)+'</span><div style="flex:1;font-size:10px">'+tk.t+'<div style="font-size:8px;color:var(--dim)">'+tk.a+' &#183; <span style="color:#5fffe0">'+genreOf(tk.a)+'</span></div></div><span style="font-size:8px;color:var(--dim)">'+tk.d+'</span></div>';});
      h+='</div></div></div>';
    } else {
      h+='<div class="lcf" id="lvcf"><div class="lcfstage" style="position:absolute;inset:0"></div></div><div style="text-align:center;font-size:9px;color:var(--dim);margin-top:4px">drag to spin &#183; + Queue a movie</div>';
    }
    root.innerHTML=h;
    var segs=root.querySelectorAll('.seg');for(var i=0;i<segs.length;i++)segs[i].onclick=function(){mode=this.getAttribute('data-m');render();};
    if(mode==='playlist'){
      root.querySelectorAll('.plrow').forEach(function(r){r.onclick=function(){curPL=+this.getAttribute('data-pl');curTrack=0;render();};});
      root.querySelectorAll('.trow').forEach(function(r){r.onclick=function(){curTrack=+this.getAttribute('data-tr');render();};});
      var jb=root.querySelector('[data-jog]');if(jb)jb.onclick=function(){jogOn=!jogOn;render();};
    } else { paintCF(); }
  }
  function paintCF(){
    var stage=root.querySelector('.lcfstage');stage.innerHTML='';
    var nodes=MOV.map(function(m,i){var d=document.createElement('div');d.className='lcfc';d.innerHTML='<div class="lpost" style="background:linear-gradient(150deg,hsl('+(i*53%360)+',55%,34%),#0a0f1a)">'+m.t.slice(0,2).toUpperCase()+'</div><div style="position:absolute;left:0;right:0;bottom:0;padding:6px;background:linear-gradient(transparent,#000)"><div style="font-size:10px;font-weight:bold">'+m.t+'</div><span class="lmbtn q" data-q="'+i+'">'+(isQ(m.t)?'&#10003; Q':'+ Queue')+'</span></div>';stage.appendChild(d);return d;});
    function rel(i){var r=i-idx,n=MOV.length;r=((r%n)+n)%n;if(r>n/2)r-=n;return r;}
    function paint(){nodes.forEach(function(d,i){var r=rel(i),a=Math.abs(r),s=r<0?-1:1,x=r===0?0:s*(a===1?88:150),rot=r===0?0:-s*42,sc=r===0?1.06:.78,op=a>2?0:(r===0?1:.6);d.style.transform='translateX('+x+'px) rotateY('+rot+'deg) scale('+sc+')';d.style.opacity=op;d.style.zIndex=10-a;d.className='lcfc'+(r===0?' cc':'');});}
    paint();
    nodes.forEach(function(d){d.querySelector('[data-q]').onclick=function(e){e.stopPropagation();var i=+this.getAttribute('data-q');toggleQ(MOV[i].t);this.innerHTML=isQ(MOV[i].t)?'&#10003; Q':'+ Queue';};});
    var cf=root.querySelector('#lvcf'),dr=false,sx=0;
    cf.addEventListener('pointerdown',function(e){if(e.target.closest('.lmbtn'))return;dr=true;sx=e.clientX;});
    cf.addEventListener('pointermove',function(e){if(!dr)return;if(e.clientX-sx>40){idx=(idx-1+MOV.length)%MOV.length;sx=e.clientX;paint();}else if(e.clientX-sx<-40){idx=(idx+1)%MOV.length;sx=e.clientX;paint();}});
    cf.addEventListener('pointerup',function(){dr=false;});
  }
  render();
}
/* ===== end Library Slice 1 ===== */

/* === Forums Chat Slice (mountForumsV1) — TCV comms display, wired to real S.messages === */
function fvChannels(){var cs=forumCats().slice();if(window.S&&S.householdOk){cs.push({id:"housekeeping",name:"Housekeeping",ic:"&#129529;"});cs.push({id:"household",name:"Household",ic:"&#128274;"});}return cs;}
/* === COMMS RELAY (mountForumsV1 v2) — full dynamic TCV chat ===
   Wired to: S.forumRoster, S.presence, S.messages (category = "channel" or "channel|topic"),
   S.reactions (map id -> { emoji: [names] }). Helpers reused: esc, linkify, avatarFor, post, render.
   No regex / no backslashes in this module (template-literal safe). */
var FORV2_CSS=""
+".cr{font-family:Consolas,Menlo,monospace;color:#dff3ff;position:relative}"
+".cr .crhead{display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#7fd4ff;margin:0 0 12px;text-shadow:0 0 10px rgba(0,229,255,.4)}"
+".cr .crhead b{color:#fff;letter-spacing:.28em}"
+".cr .crhead .sub{margin-left:auto;font-size:9px;letter-spacing:.1em;color:#6f8ba8}"
+".cr .chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}"
+".cr .chip{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:bold;color:#bfe7ff;background:rgba(10,16,32,.6);border:1.5px solid rgba(60,170,255,.25);border-radius:10px;padding:7px 11px;cursor:pointer;transition:.15s;position:relative}"
+".cr .chip:hover{border-color:rgba(0,229,255,.6)}"
+".cr .chip.on{border-color:#00e5ff;background:rgba(0,229,255,.16);color:#fff;box-shadow:0 0 14px rgba(0,229,255,.35)}"
+".cr .chip .dot{width:7px;height:7px;border-radius:50%;background:#3dff9e;box-shadow:0 0 8px #3dff9e}"
+".cr .chip .lk{font-size:10px;color:#9fc6e0}"
+".cr .tops{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}"
+".cr .top{font-size:10px;font-weight:bold;color:#c9b3ff;background:rgba(7,5,22,.7);border:1px solid rgba(122,75,255,.5);border-radius:8px;padding:5px 10px;cursor:pointer}"
+".cr .top.on{background:#b14bff;color:#fff;border-color:#fff;box-shadow:0 0 12px rgba(177,75,255,.5)}"
+".cr .row{display:flex;flex-wrap:wrap;gap:14px}"
+".cr .sen{flex:0 0 168px;min-width:150px}"
+".cr .senh{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:#cf9bff;margin-bottom:8px}"
+".cr .sb{display:flex;gap:8px;align-items:flex-start;padding:7px 9px;border-radius:11px;margin-bottom:7px;background:rgba(10,16,32,.5);border:1.5px solid rgba(60,170,255,.18);transition:.15s}"
+".cr .sb.lit{border-color:rgba(0,229,255,.55);box-shadow:0 0 12px rgba(0,229,255,.22)}"
+".cr .sb.away{opacity:.5}"
+".cr .sb .cbar{flex:0 0 4px;align-self:stretch;border-radius:2px}"
+".cr .sb .av{width:24px;height:24px;font-size:10px;flex:0 0 24px}"
+".cr .sbody{line-height:1.18;min-width:0;flex:1}"
+".cr .snm{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:bold}"
+".cr .son{margin-left:auto;font-size:9px;font-weight:bold;color:#9fd6ff}"
+".cr .stitle{font-size:9px;font-style:italic;color:#9fc6e0;margin:1px 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
+".cr .ranks{display:flex;gap:3px;flex-wrap:wrap}"
+".cr .bdg{display:inline-flex;align-items:center;gap:2px;font-size:8px;font-weight:bold;border-radius:5px;padding:1px 4px;line-height:1.4}"
+".cr .medit{margin-top:5px;font-size:9px;color:#7fb0d8;cursor:pointer;text-decoration:underline}"
+".cr . med{margin-top:6px;padding:7px;border-radius:8px;background:rgba(2,8,20,.7);border:1px solid rgba(122,75,255,.4)}"
+".cr .med input,.cr .med label{font-size:10px}"
+".cr .med input[type=text]{width:100%;background:rgba(2,8,20,.8);border:1px solid rgba(60,170,255,.3);color:#eaf6ff;border-radius:6px;padding:4px;margin-bottom:4px;font-family:inherit}"
+".cr .med .rk{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0;color:#bfe7ff}"
+".cr .med button{font-size:10px;border:0;border-radius:6px;padding:5px 9px;cursor:pointer;background:linear-gradient(135deg,#00e5ff,#b14bff);color:#04121f;font-weight:bold}"
+".cr .main{flex:1;min-width:250px}"
+".cr .composer{display:flex;align-items:flex-end;gap:9px;margin-bottom:14px;padding:9px 11px;border-radius:12px;background:rgba(0,229,255,.07);border:1.5px solid rgba(0,229,255,.4)}"
+".cr .composer textarea{flex:1;background:rgba(2,8,20,.7);border:1px solid rgba(60,170,255,.3);color:#eaf6ff;border-radius:8px;padding:8px;font-family:inherit;font-size:13px;min-height:42px;resize:vertical}"
+".cr .send{background:linear-gradient(135deg,#00e5ff,#b14bff);color:#04121f;font-weight:bold;border:0;border-radius:9px;padding:10px 15px;cursor:pointer;white-space:nowrap}"
+".cr .send:hover{filter:brightness(1.12)}"
+".cr .thread{display:flex;flex-direction:column}"
+".cr .bw{display:flex;margin-bottom:9px;flex-direction:column;max-width:80%}"
+".cr .bw.me{align-self:flex-end;align-items:flex-end}"
+".cr .bw.them{align-self:flex-start;align-items:flex-start}"
+".cr .bub{padding:8px 12px;border-radius:13px}"
+".cr .bw.me .bub{border-bottom-right-radius:3px}"
+".cr .bw.them .bub{border-bottom-left-radius:3px}"
+".cr .bub.flagged{outline:1px dashed rgba(255,45,85,.7)}"
+".cr .bnm{font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}"
+".cr .btx{font-size:13px;color:#eaf6ff;line-height:1.45;word-break:break-word}"
+".cr .btx a{color:#5ff3ff}"
+".cr .bts{font-size:9px;color:#6f8ba8;margin-top:3px}"
+".cr .rx{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}"
+".cr .rxc{font-size:11px;border:1px solid rgba(60,170,255,.3);background:rgba(10,16,32,.6);border-radius:10px;padding:1px 7px;cursor:pointer;color:#cfe7ff}"
+".cr .rxc.mine{border-color:#ff2d55;background:rgba(255,45,85,.16);color:#fff}"
+".cr .rxadd{font-size:11px;opacity:.6;cursor:pointer;padding:1px 5px;border-radius:10px}"
+".cr .rxadd:hover{opacity:1}"
+".cr .empty{font-size:12px;color:#8fb0cf;font-style:italic;padding:18px 4px}";

function fvRoster(){var r=(window.S&&S.forumRoster)||[];if(r.length)return r.slice();
  /* fallback: derive from message authors + me */
  var seen={},out=[];var me=(window.S&&S.me&&S.me.name)||'';
  ((window.S&&S.messages)||[]).forEach(function(m){var a=m.author||'?';if(a&&!seen[a]){seen[a]=1;out.push({name:a});}});
  if(me&&!seen[me]){out.push({name:me,you:1});}
  return out;}
function fvColor(m){if(m&&m.color)return m.color;var n=(m&&m.name)||'';var hue=0;for(var i=0;i<n.length;i++)hue=(hue*31+n.charCodeAt(i))%360;return 'hsl('+hue+',70%,62%)';}
function fvRoman(n){n=+n||0;if(n<=0)return '';var map=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];var s='';for(var i=0;i<map.length;i++){while(n>=map[i][0]){s+=map[i][1];n-=map[i][0];}}return s;}
function fvBadge(txt,col){return '<span class="bdg" style="color:rgb('+col+');border:1px solid rgba('+col+',.6);background:rgba('+col+',.12)">'+txt+'</span>';}
function fvRanks(m){var o='';if(m.king)o+=fvBadge('&#128081;','255,210,70');if(m.wiz)o+=fvBadge('&#10022;'+fvRoman(m.wiz),'200,120,255');if(m.mod)o+=fvBadge('&#128737;','95,255,224');if(m.elder)o+=fvBadge(fvRoman(m.elder),'0,229,255');if(m.guest)o+=fvBadge('&#127801;','255,93,180');return o;}
function fvTopics(chId){
  var def={start:['Rules','Guides','Map'],diary:['Ideas','Reminders','Drafts'],general:['Daily Banter','Big Decisions','Off-topic'],gen:['Daily Banter','Big Decisions','Off-topic'],happenings:['Events','Photos','Trips'],fam:['Events','Photos','Trips'],family:['Events','Photos','Trips'],healthstyle:['Food','Fitness','Wellness'],tech:['Projects','Gadgets','Fixes'],ai:['Tools','News','Experiments'],dnd:['Campaigns','Characters','Schedule'],gaming:['Campaigns','Characters','Schedule'],home:['Just Us','Plans'],household:['Just Us','Plans'],housekeeping:['Archive']};
  var t=(def[chId]||[]).slice();
  /* union with topics that already exist in stored messages for this channel */
  ((window.S&&S.messages)||[]).forEach(function(m){var c=m.category||'general';var bar=c.indexOf('|');if(bar>0&&c.substring(0,bar)===chId){var tp=c.substring(bar+1);if(tp&&t.indexOf(tp)<0)t.push(tp);}});
  return t;}
function fvMins(name){var p=(window.S&&S.presence)||{};var ts=p[name];if(!ts)return null;return Math.floor((Date.now()-ts)/60000);}

function fvReactToggle(id,emoji){post('/api/forum/react',{id:id,emoji:emoji});}
function fvSend(){var t=document.getElementById('crmb');if(!t||!t.value.trim())return;var ch=window.__fcat||'general';var tp=window.__ftopic||'';var cat=tp?(ch+'|'+tp):ch;try{if(typeof audit==='function')audit('post',t.value.slice(0,80),'Forum/'+cat);}catch(e){}try{localStorage.removeItem('crdraft_'+cat);}catch(e){}post('/api/message',{body:t.value,category:cat});}
function fvDraft(t){try{localStorage.setItem('crdraft_'+((window.__fcat||'general')+'|'+(window.__ftopic||'')),t.value);}catch(e){}}
function fvMetaEdit(email){window.__crEdit=(window.__crEdit===email)?null:email;render();}
function fvMetaSave(email){
  function g(id){var el=document.getElementById(id);return el?el.value:'';}
  function ck(id){var el=document.getElementById(id);return el&&el.checked?1:0;}
  post('/api/forum/meta',{email:email,title:g('me_t_'+email),color:g('me_c_'+email),wiz:ck('me_w_'+email)?20:0,mod:ck('me_m_'+email),elder:ck('me_e_'+email)?2:0,guest:ck('me_g_'+email),locked:ck('me_l_'+email)});
  window.__crEdit=null;}

function mountForumsV1(root){
  if(!document.getElementById('forV2css')){var s=document.createElement('style');s.id='forV2css';s.textContent=FORV2_CSS;document.head.appendChild(s);}
  root.className='cr';
  var chans=(typeof fvChannels==='function')?fvChannels():[{id:'general',name:'General',ic:''}];
  var fc=window.__fcat||(chans[0]&&chans[0].id)||'general';
  var curCh=null;chans.forEach(function(c){if(c.id===fc)curCh=c;});if(!curCh){curCh=chans[0];fc=curCh.id;}
  var topics=fvTopics(fc);
  var tp=window.__ftopic||'';
  var roster=fvRoster();
  var meName=(window.S&&S.me&&S.me.name)||'';
  var isRoyal=!!(window.S&&S.me&&S.me.isRoyal);
  var all=(window.S&&S.messages)||[];
  var msgs=all.filter(function(m){var c=m.category||'general';var bar=c.indexOf('|');var ch=bar>0?c.substring(0,bar):c;if(ch!==fc)return false;if(tp){var mt=bar>0?c.substring(bar+1):'';return mt===tp;}return true;});
  msgs=msgs.slice().reverse(); /* messages come newest-first; show oldest->newest */
  var rx=(window.S&&S.reactions)||{};

  var h='';
  h+='<div class="crhead"><span style="color:#ff2d55">&#9679;</span> <b>COMMS RELAY</b> <span class="sub">blended channels &middot; all members shown &middot; lit = active &lt;3 min</span></div>';

  /* channel chips */
  h+='<div class="chips">'+chans.map(function(c){
    var unread='';var lk=(c.id==='home'||c.id==='household'||c.id==='housekeeping'||c.lock)?'<span class="lk">&#128274;</span>':'';
    return '<span class="chip'+(c.id===fc?' on':'')+'" data-c="'+esc(c.id)+'">'+(c.ic?c.ic+' ':'')+esc(c.name)+lk+unread+'</span>';
  }).join('')+'</div>';

  /* topic pills */
  h+='<div class="tops"><span class="top'+(tp===''?' on':'')+'" data-t="">All</span>'+topics.map(function(t){return '<span class="top'+(t===tp?' on':'')+'" data-t="'+esc(t)+'">'+esc(t)+'</span>';}).join('')+'</div>';

  h+='<div class="row">';

  /* member panel */
  h+='<div class="sen"><div class="senh">Members &middot; lit = here now</div>';
  roster.sort(function(a,b){var am=fvMins(a.name),bm=fvMins(b.name);var ay=(a.name===meName)?-1:0,by=(b.name===meName)?-1:0;if(ay!==by)return ay-by;if(am===null&&bm===null)return 0;if(am===null)return 1;if(bm===null)return -1;return am-bm;});
  roster.forEach(function(m){
    var col=fvColor(m);var rgbBar=(col.indexOf('hsl')===0)?col:('rgb('+col+')');
    var mins=fvMins(m.name);var lit=(mins!==null&&mins<3);var away=(mins===null||mins>=30);
    var isMe=(m.name===meName);
    var onTxt=(mins===null)?'away':(mins+'m');
    h+='<div class="sb'+(lit?' lit':'')+(away&&!lit?' away':'')+'">';
    h+='<div class="cbar" style="background:'+rgbBar+';box-shadow:0 0 8px '+rgbBar+'"></div>';
    h+=(typeof avatarFor==='function'?avatarFor(m.name):'');
    h+='<div class="sbody"><div class="snm" style="color:'+rgbBar+'">'+esc(m.name)+(isMe?' <span style="font-size:8px;color:#9fd6ff">(you)</span>':'')+'<span class="son">'+onTxt+'</span></div>';
    if(m.title)h+='<div class="stitle">'+esc(m.title)+'</div>';
    h+='<div class="ranks">'+fvRanks(m)+'</div>';
    if(isRoyal&&m.email){h+='<div class="medit" data-edit="'+esc(m.email)+'">edit</div>';
      if(window.__crEdit===m.email){
        h+='<div class="med"><input id="me_t_'+esc(m.email)+'" type="text" placeholder="title" value="'+esc(m.title||'')+'">';
        h+='<input id="me_c_'+esc(m.email)+'" type="text" placeholder="color e.g. 255,45,85" value="'+esc(m.color||'')+'">';
        h+='<div class="rk"><label><input type="checkbox" id="me_w_'+esc(m.email)+'" '+(m.wiz?'checked':'')+'> wizard</label>';
        h+='<label><input type="checkbox" id="me_m_'+esc(m.email)+'" '+(m.mod?'checked':'')+'> mod</label>';
        h+='<label><input type="checkbox" id="me_e_'+esc(m.email)+'" '+(m.elder?'checked':'')+'> elder</label>';
        h+='<label><input type="checkbox" id="me_g_'+esc(m.email)+'" '+(m.guest?'checked':'')+'> guest</label>';
        h+='<label><input type="checkbox" id="me_l_'+esc(m.email)+'" '+(m.locked?'checked':'')+'> lock</label></div>';
        h+='<button data-save="'+esc(m.email)+'">Save</button></div>';
      }
    }
    h+='</div></div>';
  });
  h+='</div>';

  /* main: composer + thread */
  h+='<div class="main">';
  var lbl=curCh.name+(tp?(' / '+tp):' / All');
  var dkey='crdraft_'+(fc+'|'+tp);var draft='';try{draft=(window.localStorage&&localStorage.getItem(dkey))||'';}catch(e){}
  h+='<div class="composer"><textarea id="crmb" oninput="fvDraft(this)" placeholder="message &middot; '+esc(lbl)+'">'+esc(draft)+'</textarea><button class="send" data-send="1">Transmit &#10148;</button></div>';
  h+='<div class="thread">';
  if(!msgs.length){h+='<div class="empty">No transmissions in '+esc(lbl)+' yet. Be the first.</div>';}
  var canFlag=(window.S&&S.me&&S.me.role!=='guest');
  msgs.forEach(function(m){
    var a=m.author||'?';var isMe=(a===meName);
    var rm=null;roster.forEach(function(x){if(x.name===a)rm=x;});var col=fvColor(rm||{name:a});var rgb=(col.indexOf('hsl')===0)?col:('rgb('+col+')');
    var bg=isMe?'rgba(255,45,85,.16)':'rgba(0,0,0,.28)';
    var bd=isMe?'rgba(255,45,85,.6)':'rgba(60,170,255,.4)';
    var body=(fc==='happenings'&&typeof linkify==='function')?linkify(m.body):esc(m.body);
    var when=m.created_at?new Date(m.created_at).toLocaleString():'';
    h+='<div class="bw '+(isMe?'me':'them')+'">';
    h+='<div class="bub'+(m.flagged?' flagged':'')+'" style="background:'+bg+';border:1.5px solid '+bd+'">';
    h+='<div class="bnm" style="color:'+rgb+'">'+esc(a)+'</div>';
    h+='<div class="btx">'+body+'</div>';
    h+='<div class="bts">'+esc(when)+'</div></div>';
    /* reactions */
    var rset=(m.id!=null&&rx[m.id])?rx[m.id]:null;
    h+='<div class="rx">';
    if(rset){for(var em in rset){if(!rset.hasOwnProperty(em))continue;var names=rset[em]||[];var mine=names.indexOf(meName)>=0;h+='<span class="rxc'+(mine?' mine':'')+'" data-rx="'+esc(em)+'" data-id="'+m.id+'">'+em+' '+names.length+'</span>';}}
    if(m.id!=null){h+='<span class="rxadd" data-rx="&#128293;" data-id="'+m.id+'">&#128293;</span><span class="rxadd" data-rx="&#128081;" data-id="'+m.id+'">&#128081;</span>';}
    h+='</div>';
    h+='</div>';
  });
  h+='</div></div></div>';

  root.innerHTML=h;

  /* wiring (no inline handlers needing escapes) */
  root.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){window.__fcat=this.getAttribute('data-c');window.__ftopic='';window.__crEdit=null;render();};});
  root.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){window.__ftopic=this.getAttribute('data-t');render();};});
  root.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){fvMetaEdit(this.getAttribute('data-edit'));};});
  root.querySelectorAll('[data-save]').forEach(function(b){b.onclick=function(){fvMetaSave(this.getAttribute('data-save'));};});
  root.querySelectorAll('[data-send]').forEach(function(b){b.onclick=function(){fvSend();};});
  root.querySelectorAll('[data-rx]').forEach(function(b){b.onclick=function(){fvReactToggle(+this.getAttribute('data-id'),this.getAttribute('data-rx'));};});
}

function render(){const m=document.getElementById('main');const fn={home:homeView,grocery:groceryView,board:boardView,dj:libraryView,arcade:arcadeView,control:controlView,reunion:reunionView,admin:adminView,mytriton:mytritonView,cameras:camerasView,quotes:quotesView,log:logView,audit:auditView,logs:logsView,king:kingView,rotation:rotationView,updates:updatesView}[cur]||homeView;var __h;try{__h=fn();}catch(__e){try{if(window.console&&console.error)console.error('[PULSE] view '+cur+' failed:',__e);}catch(_){}__h=viewError(cur,__e);}m.innerHTML='<div class="view">'+__h+'</div>';setTimeout(moveSlider,0);if(cur==='dj'){var __lv=document.getElementById('libV7');if(__lv&&typeof mountLibraryV7==='function'){try{mountLibraryV7(__lv);}catch(e){}}}if(cur==='board'){var __fv=document.getElementById('forumsV1');if(__fv&&typeof mountForumsV1==='function'){try{mountForumsV1(__fv);}catch(e){}}}if(cur==='arcade'){try{localStorage.setItem('clemitArcadeDay',pDay());}catch(e){}try{paradeStop();}catch(e){}var av=m.querySelector('.view');if(av&&!av.querySelector('.arcadeNudge')){var nd=document.createElement('div');nd.className='arcadeNudge';nd.innerHTML='&#127918; Pick a game and play &mdash; you came all this way!';av.insertBefore(nd,av.firstChild);}}if(cur==='dj'){if(pStartT){clearTimeout(pStartT);pStartT=null;}var __pdms=pDelayMs();if(__pdms>=0){pStartT=setTimeout(function(){try{paradeInit();}catch(e){}},__pdms);}}else{if(pStartT){clearTimeout(pStartT);pStartT=null;}try{paradeStop();}catch(e){}}}
function homeView(){let h='<div class="card"><h2>Welcome, '+esc(S.me.name)+'</h2><div class="sub">Your stuff, in one place.</div>';const feat=S.media.find(x=>x.kind==='photo');if(feat)h+='<div class="feature"><img src="'+esc(feat.url)+'"><div class="cap">'+esc(feat.caption||'')+(feat.place?' - '+esc(feat.place):'')+(feat.people?' - '+esc(feat.people):'')+'</div></div>';if(S.groceryVisible){const due=S.grocery.filter(gDue);h+='<p>'+due.length+' grocery item(s) need attention.</p>';}if(S.messages[0])h+='<p style="margin-top:8px">Latest from <b>'+esc(S.messages[0].author)+'</b>: '+esc(S.messages[0].body.slice(0,80))+'</p>';h+='<p style="margin-top:8px">Reunion 2027: <b>'+S.rsvp.length+'</b> RSVP(s).</p></div>';return h;}
function gDue(it){if(!it.last_bought)return true;if(it.freq==='once')return false;return (Date.now()-it.last_bought)>=PERIOD[it.freq];}
function gState(it){if(!it.last_bought)return'due';if(it.freq==='once')return'done';return (Date.now()-it.last_bought)>=PERIOD[it.freq]?'due':'waiting';}
function dLeft(it){return Math.max(0,Math.ceil((PERIOD[it.freq]-(Date.now()-it.last_bought))/DAY));}
function gWhen(ts){if(!ts)return'';var s=Math.floor((Date.now()-ts)/1000);if(s<45)return'just now';var m=Math.floor(s/60);if(m<60)return m+'m ago';var hr=Math.floor(m/60);if(hr<24)return hr+'h ago';var d=Math.floor(hr/24);return d+'d ago';}
function gWho(it){var by=it.added_by?('by '+esc(it.added_by)):'';var wn=gWhen(it.created_at);var sep=(by&&wn)?' · ':'';if(!by&&!wn)return'';return '<div style="font-size:.72rem;color:var(--dim);margin-top:1px">'+by+sep+wn+'</div>';}
function gidArg(id){return (typeof id==='number')?(''+id):("'"+id+"'");}
function gRow(it,inMeal){var chk=it.checked?1:0;var nm='<span class="iname" style="'+(chk?'text-decoration:line-through;opacity:.5':'')+'">'+esc(it.name)+'</span>';var box='<input type="checkbox" '+(chk?'checked':'')+' onclick="checkG('+gidArg(it.id)+','+(chk?0:1)+')" title="check off what you already have at home" style="margin-right:7px;vertical-align:-2px;cursor:pointer">';var actions=' ';if(!inMeal){var st=gState(it);if(st==='due')actions+='<button class="mini" onclick="gotG('+gidArg(it.id)+')">got it</button>';if(it.freq&&it.freq!=='once')actions+='<span class="badge">'+esc(it.freq)+'</span>';}actions+='<button class="mini" onclick="delG('+gidArg(it.id)+')">x</button>';return '<li style="display:block">'+box+nm+actions+gWho(it)+'</li>';}
function groceryView(){
var h='<div class="card"><h2>🛒 Shared Grocery</h2><div class="sub">Yours and Jaemie&#39;s'+(S.guestShare?' (shared with guests now)':'')+'. Type an item and press Enter, or type a meal (Meatloaf, Chicken Parm, Banana Split) and tap <b>Add meal</b> to auto-fill its ingredients.</div>';
h+='<div class="row"><input id="gn" placeholder="Add item or meal..." onkeydown="gKey(event)"><select id="gf"><option value="once">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select><button class="go" onclick="addG()">Add</button><button class="go" style="background:linear-gradient(135deg,#b14bff,#ff3df0)" onclick="addMeal()">🍽 Add meal</button></div>';
var live=(S.grocery||[]).filter(function(it){return it.meal_group?true:(gState(it)!=='done');});
var groups={},order=[],standalone=[];
live.forEach(function(it){if(it.meal_group){if(!groups[it.meal_group]){groups[it.meal_group]=[];order.push(it.meal_group);}groups[it.meal_group].push(it);}else{standalone.push(it);}});
standalone.sort(function(a,b){return (gState(a)==='due'?0:1)-(gState(b)==='due'?0:1);});
window.__gmeals=order;
if(order.length){h+='<div style="margin-top:10px">';order.forEach(function(mname,gi){var items=groups[mname];var toBuy=items.filter(function(x){return !x.checked;}).length;h+='<details open style="margin:8px 0;border:1px solid rgba(0,229,255,.28);border-radius:10px;padding:6px 11px;background:rgba(0,229,255,.04)">';h+='<summary style="cursor:pointer;font-weight:bold;list-style:none">🍽 '+esc(mname)+' <span class="badge">'+toBuy+' to buy</span> <button class="mini" onclick="event.preventDefault();saveRecipeI('+gi+')">save recipe</button> <button class="mini" onclick="event.preventDefault();mealDelI('+gi+')">x all</button></summary>';h+='<ul style="margin-top:6px">';items.forEach(function(it){h+=gRow(it,true);});h+='</ul></details>';});h+='</div>';}
if(!standalone.length&&!order.length){h+='<ul style="margin-top:8px"><li class="empty">List is empty.</li></ul>';}else if(standalone.length){h+='<ul style="margin-top:8px">';standalone.forEach(function(it){h+=gRow(it,false);});h+='</ul>';}
return h+'</div>';
}
function gKey(e){if(e.key==='Enter'){e.preventDefault();var el=document.getElementById('gn');var v=((el&&el.value)||'').trim();if(!v)return;var R=S.recipes||{};if(R[v.toLowerCase()]){addMeal();}else{addG();}}}
function gSync(u,b){fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(){return fetch('/api/state');}).then(function(r){return r.json();}).then(function(ns){if(ns&&!ns.pending){S=ns;if(typeof cur!=='undefined'&&cur==='grocery'&&typeof render==='function')render();}}).catch(function(){});}
function gToast(t){try{var d=document.getElementById('gToast');if(!d){d=document.createElement('div');d.id='gToast';d.style.cssText='position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#08111c;border:1px solid rgba(0,229,255,.5);color:#cdeefb;padding:10px 16px;border-radius:10px;z-index:99999;box-shadow:0 0 18px rgba(0,229,255,.3);font-size:.9rem;transition:opacity .4s';document.body.appendChild(d);}d.textContent=t;d.style.opacity='1';clearTimeout(window.__gtoT);window.__gtoT=setTimeout(function(){d.style.opacity='0';},2400);}catch(e){}}
function checkG(id,on){for(var i=0;i<(S.grocery||[]).length;i++){if(String(S.grocery[i].id)===String(id)){S.grocery[i].checked=on?1:0;break;}}if(typeof render==='function')render();gSync('/api/grocery/check',{id:id,on:on?1:0});}
function addMeal(forced){var el=document.getElementById('gn');var v=((typeof forced==='string'?forced:(el&&el.value))||'').trim();if(!v)return;if(el)el.value='';var R=S.recipes||{};var known=R[v.toLowerCase()];if(known&&known.ingredients&&known.ingredients.length){var now=Date.now();var meName=(S.me&&S.me.name)||'me';var gn=known.name||v;known.ingredients.forEach(function(ing,k){S.grocery.push({id:'tmp'+now+'_'+k,name:ing,freq:'once',last_bought:null,added_by:meName,created_at:now,meal_group:gn,checked:0});});if(typeof render==='function')render();gSync('/api/grocery/meal',{name:v});return;}gToast('Finding ingredients for "'+v+'"…');fetch('/api/grocery/meal',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:v})}).then(function(r){return r.json();}).then(function(d){if(d&&d.ok){gToast((d.source==='ai'?'AI filled ':'Added ')+'"'+(d.name||v)+'" ('+d.count+' items)');return fetch('/api/state').then(function(r){return r.json();}).then(function(ns){if(ns&&!ns.pending){S=ns;if(typeof cur!=='undefined'&&cur==='grocery'&&typeof render==='function')render();}});}else{gToast('No recipe found for "'+v+'". Add its items, then Save recipe.');}}).catch(function(){gToast('Could not reach the kitchen. Try again.');});}
function saveRecipeI(i){var m=(window.__gmeals||[])[i];if(!m)return;fetch('/api/recipe/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:m})}).then(function(r){return r.json();}).then(function(d){gToast((d&&d.ok)?('Saved "'+m+'" recipe ('+d.count+' items) — type it next time to auto-fill'):'Could not save recipe');}).catch(function(){gToast('Could not save recipe');});}
function mealDelI(i){var m=(window.__gmeals||[])[i];if(!m)return;if(!confirm('Remove all "'+m+'" items from the list?'))return;S.grocery=(S.grocery||[]).filter(function(x){return x.meal_group!==m;});if(typeof render==='function')render();gSync('/api/grocery/mealdel',{meal:m});}
function avatarFor(name){var url=(S.avatars||{})[name];if(url)return '<img class="av" src="'+esc(url)+'">';var parts=(name||'?').trim().split(/\\s+/);var init=((parts[0]?parts[0].charAt(0):'?')+(parts[1]?parts[1].charAt(0):'')).toUpperCase();var hue=0;for(var i=0;i<(name||'').length;i++)hue=(hue*31+name.charCodeAt(i))%360;return '<div class="av init" style="background:hsl('+hue+',45%,38%)">'+esc(init)+'</div>';}
function setAvatar(url){post('/api/me/avatar',{avatar:url});}
function setAvatarUrl(){var el=document.getElementById('avurl');if(el&&el.value.trim())setAvatar(el.value.trim());}
function setAvatarById(id){var m=(S.media||[]).filter(function(x){return x.id===id;})[0];if(m)setAvatar(m.url);}
function forumCats(){return [{id:'readfirst',name:'Read Here First',d:'Start here \\u2014 ground rules and how things work.',ic:'\\uD83D\\uDCCC'},{id:'general',name:'General discussion',d:'Anything and everything.',ic:'\\uD83D\\uDCAC'},{id:'happenings',name:'Family happenings',d:'Links to what the family has going on \\u2014 share the good stuff.',ic:'\\uD83C\\uDF89'},{id:'healthstyle',name:'Healthstyle',d:'Health, fitness, food, living well.',ic:'\\uD83D\\uDCAA'},{id:'tech',name:'Tech',d:'Gadgets, fixes, projects.',ic:'\\uD83D\\uDD27'},{id:'ai',name:'AI',d:'AI tools, news, experiments.',ic:'\\uD83E\\uDD16'},{id:'dnd',name:'Dungeons & Dragons',d:'RPGs \\u00b7 Gaming \\u2014 campaigns, characters, lore, session planning.',ic:'\\uD83D\\uDC09'}];}
function forumOpen(c){window.__fcat=c;render();}
function forumBack(){window.__fcat=null;render();}
function linkify(s){return esc(s).replace(/(https?:\\/\\/[^\\s<]+)/g,function(u){return '<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>';});}
function forumGrant(email,on){post('/api/forum/grant',{email:email,on:on});}
function forumPerms(){if(!S.me.isRoyal)return '';var OWN='jesseclemit@gmail.com',QUE='jaemieclemit@gmail.com';var mem=S.members||[];var fg=S.forumGrants||{owner:[],queen:[]};var oL=(fg.owner||[]).map(function(x){return String(x).toLowerCase();});var qL=(fg.queen||[]).map(function(x){return String(x).toLowerCase();});var iAmOwner=!!S.me.isOwner;var h='<div class="card permcard"><h2>\\uD83D\\uDD10 Household access</h2><div class="sub">Both Jesse AND Jaemie must check a person for them to see the Household board. Either can uncheck to revoke instantly.</div><table class="permtbl"><tr><th>Person</th><th>Jesse</th><th>Jaemie</th><th>You</th></tr>';mem.forEach(function(u){var e=String(u.email||'').toLowerCase();if(e===OWN||e===QUE||!e)return;var oOn=oL.indexOf(e)>=0,qOn=qL.indexOf(e)>=0;var inOk=oOn&&qOn;var mineOn=iAmOwner?oOn:qOn;h+='<tr><td>'+esc(u.name||u.email)+(inOk?' <span class="inbadge">in</span>':'')+'</td><td>'+(oOn?'\\u2714':'\\u2014')+'</td><td>'+(qOn?'\\u2714':'\\u2014')+'</td><td><label class="permtog"><input type="checkbox" '+(mineOn?'checked':'')+' onchange="forumGrant(\\''+e+'\\',this.checked)"> my OK</label></td></tr>';});h+='</table></div>';return h;}
function forumMsgRender(x,fc){const who=avatarFor(x.author);const around=[];const lower=(x.body||'').toLowerCase();const seen={};S.media.forEach(mm=>{(mm.people||'').split(/[,;]/).forEach(nm=>{nm=nm.trim();if(nm&&nm.toLowerCase()!==(x.author||'').toLowerCase()&&lower.includes(nm.toLowerCase())&&!seen[nm.toLowerCase()]){seen[nm.toLowerCase()]=1;if(mm.kind==='photo')around.push(mm.url);}});});const aroundH=around.length?'<div class="around">'+around.slice(0,5).map(u=>'<img src="'+esc(u)+'">').join('')+'</div>':'';const bodyH=(fc==='happenings'?linkify(x.body):esc(x.body));return '<div class="msg'+(x.flagged?' flagged':'')+'"><div class="who">'+who+'<small>'+esc(x.author)+'</small>'+(x.flagged?'<span class="flagbadge">\\uD83D\\uDEA9 read this</span>':'')+(S.me.role!=='guest'?'<button class="mini flagbtn" onclick="flagPost('+x.id+')">'+(x.flagged?'unflag':'flag')+'</button>':'')+'</div><div class="body"><span class="t">'+new Date(x.created_at).toLocaleDateString()+'</span><br>'+bodyH+aroundH+'</div></div>';}
function notesCard(){return '<div class="catcard" style="border-color:var(--acc2)" onclick="notesOpenPanel()"><div class="cic">📝</div><div class="cnm">Personal Notes 🔒</div><div class="cds">Private to you. No one else sees a note unless you share it — and you choose for how long.</div></div>';}
function notesOpenPanel(){window.__notesOpen=true;window.__fcat=null;window.__notes=null;window.__noteTarget='private';render();notesLoad();remLoad();if(!window.__remTimer){window.__remTimer=setInterval(remPoll,60000);}}
function notesBack(){window.__notesOpen=false;window.__noteEdit=null;render();}
function notesLoad(){fetch('/api/notes').then(function(r){return r.json();}).then(function(d){window.__notes=d;if(cur==='board'&&window.__notesOpen)render();}).catch(function(e){window.__notes={error:1};if(cur==='board'&&window.__notesOpen)render();});}
function notesPost(u,b){return fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})}).then(function(r){return r.json();});}
function notesSave(){var t=document.getElementById('nnb');if(!t||!t.value.trim())return;var tgt=window.__noteTarget||'private';if(tgt==='remind'){remOpenFromComposer();return;}notesPost('/api/note',{body:t.value,important:(tgt==='important')?1:0}).then(function(r){var id=r&&r.id;function fin(){t.value='';try{localStorage.removeItem('nndraft');}catch(e){}window.__noteTarget='private';notesLoad();}if(tgt==='forjesse'&&id&&window.S&&S.king){notesPost('/api/note/share',{id:id,email:S.king,hours:0}).then(fin);}else{fin();}});}
function notesEdit(id){window.__noteEdit=id;render();}
function notesEditCancel(){window.__noteEdit=null;render();}
function notesEditSave(id){var t=document.getElementById('neb_'+id);if(!t)return;notesPost('/api/note',{id:id,body:t.value}).then(function(){window.__noteEdit=null;notesLoad();});}
function notesDelete(id){if(!confirm('Delete this private note? This cannot be undone.'))return;notesPost('/api/note/delete',{id:id}).then(notesLoad);}
function notesShare(id){var sel=document.getElementById('nsh_'+id),dur=document.getElementById('nsd_'+id);if(!sel||!sel.value){alert('Pick a person to share with first.');return;}notesPost('/api/note/share',{id:id,email:sel.value,hours:+dur.value}).then(notesLoad);}
function notesUnshare(id,email){notesPost('/api/note/share',{id:id,email:email,unshare:true}).then(notesLoad);}
function notesShareLabel(sh){if(!sh.until)return esc(sh.name)+' · no expiry';var d=new Date(sh.until);return esc(sh.name)+' · until '+d.toLocaleDateString();}
function noteRowRO(n,label){var when=new Date(n.updated_at||n.created_at).toLocaleString();return '<div class="note ro"><div class="notebody">'+esc(n.body)+'</div><div class="notemeta">'+label+' · '+when+'</div></div>';}
function noteRow(n,roster){var when=new Date(n.updated_at||n.created_at).toLocaleString();var imp=n.important?'<span class="sos"></span><span class="impmark">!</span>':'';var crown=(n.shares||[]).some(function(s){return window.S&&String(s.email||'').toLowerCase()===String(S.king||'').toLowerCase();})?'<span class="crown" title="Sent to the King">👑</span>':'';var rem='';if(n.reminders&&n.reminders.length){rem='<div class="noterems">'+n.reminders.map(function(rm){var soft=(rm.due_at-Date.now())>7200000;return '<span class="noterem'+(soft?' soft':'')+'">⏰ '+new Date(rm.due_at).toLocaleString()+' <a onclick="remCancel('+rm.id+')">cancel</a></span>';}).join('')+'</div>';}var h='<div class="note">';if(window.__noteEdit===n.id){h+='<textarea id="neb_'+n.id+'" class="noteedit">'+esc(n.body)+'</textarea><div class="noteact"><button class="mini go" onclick="notesEditSave('+n.id+')">Save</button><button class="mini" onclick="notesEditCancel()">Cancel</button></div>';}else{h+='<div class="notebody">'+crown+imp+esc(n.body)+'</div><div class="notemeta">'+when+'</div>'+rem+'<div class="noteact"><button class="mini" onclick="noteFlag('+n.id+','+(n.important?0:1)+')">'+(n.important?'Unflag':'❗ Urgent')+'</button><button class="mini" onclick="noteSendKing('+n.id+')">👑 To King</button><button class="mini" onclick="remFromNote('+n.id+')">⏰ Remind</button><button class="mini" onclick="notesEdit('+n.id+')">Edit</button><button class="mini" onclick="notesDelete('+n.id+')">Delete</button></div>';var opts='<option value="">share with…</option>';(roster||[]).forEach(function(u){opts+='<option value="'+esc(u.email)+'">'+esc(u.name||u.email)+'</option>';});h+='<div class="noteshare"><div class="row"><select id="nsh_'+n.id+'">'+opts+'</select><select id="nsd_'+n.id+'"><option value="24">1 day</option><option value="168">1 week</option><option value="720">30 days</option><option value="0">Until I revoke</option></select><button class="mini go" onclick="notesShare('+n.id+')">Share</button></div>';if(n.shares&&n.shares.length){h+='<div class="sharelist"><span>Shared with:</span>'+n.shares.map(function(sh){return '<span class="sharechip">'+notesShareLabel(sh)+' <a onclick="notesUnshare('+n.id+",'"+esc(sh.email)+"'"+')">revoke</a></span>';}).join('')+'</div>';}h+='</div>';}h+='</div>';return h;}
function notesPanel(){var d=window.__notes;if(!window.__noteTarget)window.__noteTarget='private';if(!window.__noteFilt){try{window.__noteFilt=JSON.parse(localStorage.getItem('notefilt'))||{};}catch(e){window.__noteFilt={};}}var T=window.__noteTarget,F=window.__noteFilt;var h='<div class="card"><button class="mini fback" onclick="notesBack()">← Forums</button><h2>📝 Personal Notes 🔒</h2><div class="sub">Private to you. '+((d&&d.isKing)?"As King you can also see the family's notes (read-only) at the bottom. ":"")+'Share any note with one person for a set time — it auto-expires when the timer runs out.</div>';if(!d)return h+'<div class="empty">Loading your notes…</div></div>';if(d.error)return h+'<div class="empty">Could not load your notes. Tap ← and back in to retry.</div></div>';h+='<div class="nroute"><span class="nrl">Send to:</span><span class="rchip'+(T==='private'?' on':'')+'" data-t="private" onclick="noteTarget(this)">📝 Private</span><span class="rchip'+(T==='forjesse'?' on':'')+'" data-t="forjesse" onclick="noteTarget(this)">👤 To the King 👑</span><span class="rchip'+(T==='important'?' on':'')+'" data-t="important" onclick="noteTarget(this)">❗ Important</span><span class="rchip rem'+(T==='remind'?' on':'')+'" data-t="remind" onclick="noteTarget(this)">⏰ Remind Me!</span></div>';h+='<div class="row"><textarea id="nnb" placeholder="Write a private note…" oninput="try{localStorage.setItem(\\'nndraft\\',this.value)}catch(e){}">'+esc((window.localStorage&&localStorage.getItem("nndraft"))||"")+'</textarea><button class="go" onclick="notesSave()">'+(T==='remind'?'Set reminder →':'Save note')+'</button></div>';h+=remBuilderHtml(T==='remind');h+='<div class="nfilt"><span class="nrl">Filter:</span><span class="fchip'+(F.important?' on':'')+'" data-f="important" onclick="noteFilt(this)">❗ Important</span><span class="fchip'+(F.king?' on':'')+'" data-f="king" onclick="noteFilt(this)">👤 Sent up</span><span class="fchip'+(F.rem?' on':'')+'" data-f="rem" onclick="noteFilt(this)">⏰ Reminders</span></div>';var any=F.important||F.king||F.rem;var all=d.notes||[];var mine=all.filter(function(n){return n.mine;});var showNotes=true;if(showNotes){var list=mine;if(any){list=mine.filter(function(n){var ok=false;if(F.important&&n.important)ok=true;if(F.king&&(n.shares||[]).some(function(s){return window.S&&String(s.email||'').toLowerCase()===String(S.king||'').toLowerCase();}))ok=true;if(F.rem&&n.reminders&&n.reminders.length)ok=true;return ok;});}if(!list.length)h+='<div class="empty">No notes here yet.</div>';list.forEach(function(n){h+=noteRow(n,d.roster);});}h+='</div>';if(!any){var shared=all.filter(function(n){return !n.mine&&!n.kingView;});var king=all.filter(function(n){return n.kingView;});if(shared.length){h+='<div class="card"><h2 style="font-size:1rem">📨 Shared with you</h2><div class="sub">Notes others chose to share with you. They vanish when the sharer\\'s timer runs out.</div>';shared.forEach(function(n){h+=noteRowRO(n,'from '+esc(n.owner_name));});h+='</div>';}if(king.length){h+='<div class="card" style="border-color:var(--warn)"><h2 style="font-size:1rem">👑 King view</h2><div class="sub">Every other member\\'s private notes, read-only — the King override.</div>';king.forEach(function(n){h+=noteRowRO(n,esc(n.owner_name)+"'s note");});h+='</div>';}}return h;}
var REMSTEPS=(function(){var a=[];for(var i=1;i<=24;i++)a.push({h:i});a.push({h:36});a.push({h:48});[3,4,5,6,7,10,14,21,30].forEach(function(dd){a.push({d:dd});});return a;})();
function remStepMs(s){return s.d?s.d*86400000:s.h*3600000;}
function remStepLabel(s){if(s.d)return 'in '+s.d+' days';if(s.h===24)return 'in 1 day';if(s.h>24)return 'in '+(s.h/24)+' days';return 'in '+s.h+' hour'+(s.h>1?'s':'');}
function remIsLong(){var ms=window.__remExact?(window.__remExact-Date.now()):remStepMs(REMSTEPS[window.__remIdx==null?1:window.__remIdx]);return ms>7200000;}
function remBuilderHtml(open){if(!open)return '';if(window.__remIdx==null)window.__remIdx=1;var s=REMSTEPS[window.__remIdx]||REMSTEPS[1];var lbl=window.__remExact?('at '+new Date(window.__remExact).toLocaleString()):remStepLabel(s);var warn=remIsLong()?'<div class="remnote">More than 2 hours out — I will also drop a gently pulsing note in your list so you can confirm the alarm.</div>':'';return '<div class="rembx" id="rembx"><div class="remh">⏰ Remind me — how long?</div><div class="remrow"><button class="rstep" onclick="remBump(-1)">−</button><input type="range" id="remrange" min="0" max="'+(REMSTEPS.length-1)+'" value="'+window.__remIdx+'" oninput="remSlide(this.value)"><button class="rstep" onclick="remBump(1)">+</button><button class="picktime" onclick="remPickToggle()">Pick Time</button></div><div class="remlbl" id="remlbl">'+lbl+'</div><div class="rempick" id="rempick" style="display:'+(window.__remPick?'block':'none')+'"><input type="datetime-local" id="remdt" onchange="remExact(this.value)"></div><div class="remch"><label><input type="checkbox" checked disabled> In-app</label><label><input type="checkbox" id="remc_em" checked> Email me</label><label><input type="checkbox" id="remc_sms" onchange="remSmsToggle(this)"> Text me</label></div><div class="rempick" id="remphwrap" style="display:none"><input type="tel" id="remph" placeholder="Phone for text, e.g. +18135551234"></div><div class="remgo"><button class="go" onclick="remConfirm()">Confirm reminder</button></div>'+warn+'</div>';}
function remSlide(v){window.__remIdx=+v;window.__remExact=null;var el=document.getElementById('remlbl');if(el)el.textContent=remStepLabel(REMSTEPS[window.__remIdx]);}
function remBump(dir){if(window.__remIdx==null)window.__remIdx=1;window.__remIdx=Math.max(0,Math.min(REMSTEPS.length-1,window.__remIdx+dir));window.__remExact=null;var r=document.getElementById('remrange');if(r)r.value=window.__remIdx;var el=document.getElementById('remlbl');if(el)el.textContent=remStepLabel(REMSTEPS[window.__remIdx]);}
function remPickToggle(){window.__remPick=!window.__remPick;var el=document.getElementById('rempick');if(el)el.style.display=window.__remPick?'block':'none';}
function remExact(v){if(!v)return;window.__remExact=new Date(v).getTime();var el=document.getElementById('remlbl');if(el)el.textContent='at '+new Date(window.__remExact).toLocaleString();}
function remSmsToggle(cb){var w=document.getElementById('remphwrap');if(w)w.style.display=cb.checked?'block':'none';}
function remOpenFromComposer(){window.__noteTarget='remind';render();}
function remFromNote(id){var arr=(window.__notes&&window.__notes.notes)||[];var n=arr.filter(function(x){return x.id===id;})[0];window.__noteTarget='remind';var b=n?n.body:'';try{localStorage.setItem('nndraft',b);}catch(e){}render();var t=document.getElementById('nnb');if(t)t.value=b;}
function remConfirm(){var t=document.getElementById('nnb');var body=t?t.value.trim():'';if(!body){alert('Write what to remind you about first.');return;}var due=window.__remExact?window.__remExact:(Date.now()+remStepMs(REMSTEPS[window.__remIdx==null?1:window.__remIdx]));if(due<=Date.now()){alert('Pick a time in the future.');return;}var ch=['inapp'];if(document.getElementById('remc_em')&&document.getElementById('remc_em').checked)ch.push('email');var ph=null;if(document.getElementById('remc_sms')&&document.getElementById('remc_sms').checked){ph=(document.getElementById('remph')&&document.getElementById('remph').value.trim())||'';if(!ph){alert('Add a phone number for the text, or uncheck Text me.');return;}ch.push('sms');}var title=body.length>60?(body.slice(0,60)+'…'):body;notesPost('/api/note',{body:body,important:0}).then(function(r){var id=r&&r.id;notesPost('/api/reminders',{title:title,body:body,due_at:due,channels:ch,to_phone:ph,repeat_kind:'',note_id:id}).then(function(){var tt=document.getElementById('nnb');if(tt)tt.value='';try{localStorage.removeItem('nndraft');}catch(e){}window.__noteTarget='private';window.__remExact=null;window.__remPick=false;notesLoad();});});}
function remLoad(){fetch('/api/reminders').then(function(r){return r.json();}).then(function(d){window.__rems=(d&&d.reminders)||[];if(cur==='board'&&window.__notesOpen)render();}).catch(function(e){});}
function remPoll(){fetch('/api/reminders').then(function(r){return r.json();}).then(function(d){window.__rems=(d&&d.reminders)||[];if(cur==='board'&&window.__notesOpen)render();}).catch(function(e){});}
function remCancel(id){if(!confirm('Cancel this reminder?'))return;notesPost('/api/reminders/delete',{id:id}).then(function(){remLoad();});}
function remListHtml(){var r=window.__rems||[];var now=Date.now();var pend=r.filter(function(x){return x.status==='pending';});if(!pend.length)return '';var h='<div class="card"><h2 style="font-size:1rem">⏰ Your reminders <span class="cnt">'+pend.length+'</span></h2><div class="sub">In-app, and by email or text when the time comes.</div>';pend.forEach(function(x){var due=x.due_at;var soft=(due-now)>7200000;var chans=String(x.channels||'inapp').split(',').join(' · ');h+='<div class="remitem'+(soft?' soft':'')+'"><div class="rt">'+esc(x.title||x.body||'Reminder')+'</div><div class="rm">'+new Date(due).toLocaleString()+' · '+esc(chans)+'</div><div class="ra"><button class="mini" onclick="remCancel('+x.id+')">Cancel</button></div></div>';});h+='</div>';return h;}
function noteTarget(el){window.__noteTarget=el.dataset.t;render();}
function noteFilt(el){var f=el.dataset.f;if(!window.__noteFilt)window.__noteFilt={};window.__noteFilt[f]=!window.__noteFilt[f];try{localStorage.setItem('notefilt',JSON.stringify(window.__noteFilt));}catch(e){}render();}
function noteFlag(id,val){notesPost('/api/note/flag',{id:id,important:val}).then(function(){notesLoad();});}
function noteSendKing(id){if(!(window.S&&S.king)){alert('No King is set.');return;}notesPost('/api/note/share',{id:id,email:S.king,hours:0}).then(function(){notesLoad();});}
function boardView(){if(window.__fcat===undefined)window.__fcat=null;if(window.__notesOpen)return notesPanel();var fc=window.__fcat||null;if((fc==='household'||fc==='housekeeping')&&!S.householdOk)fc=null;let h='';if(S.me.isRoyal&&(S.reviewQueue||[]).length){h+='<div class="card review"><h2>\\uD83D\\uDEA8 Needs review <span class="cnt">'+S.reviewQueue.length+'</span></h2><div class="sub">Posts flagged for profanity \\u2014 visible to the King and Queen only.</div>'+S.reviewQueue.map(function(r){return '<div class="revrow"><div><b>'+esc(r.by)+'</b> <span class="qsrc">'+esc(r.hit)+'</span><br>'+esc(r.body)+'</div><button class="mini" onclick="dismissReview('+r.id+')">dismiss</button></div>';}).join('')+'</div>';}
if(!fc){h+='<div class="card"><h2>Forums</h2><div class="sub">Pick a place to read or post.</div><div class="catgrid">';h+=notesCard();forumCats().forEach(function(c){h+='<div class="catcard'+(c.sub?' subcat':'')+'" onclick="forumOpen(\\''+c.id+'\\')"><div class="cic">'+c.ic+'</div><div class="cnm">'+(c.sub?'\\u21B3 ':'')+esc(c.name)+'</div><div class="cds">'+esc(c.d)+'</div></div>';});if(S.householdOk){h+='<div class="catcard hk" onclick="forumOpen(\\'housekeeping\\')"><div class="cic">\\uD83E\\uDDF9</div><div class="cnm">Housekeeping</div><div class="cds">Private \\u2014 Jesse &amp; Jaemie. Retired &amp; archived conversations.</div></div>';h+='<div class="catcard hh" onclick="forumOpen(\\'household\\')"><div class="cic">\\uD83D\\uDD12</div><div class="cnm">Household</div><div class="cds">Private \\u2014 just Jesse &amp; Jaemie (and anyone you both invite).</div></div>';}h+='</div></div>';return h;}
var cat=null;forumCats().forEach(function(c){if(c.id===fc)cat=c;});var isHH=fc==='household';var isHK=fc==='housekeeping';var title=isHH?'\\uD83D\\uDD12 Household':(isHK?'\\uD83E\\uDDF9 Housekeeping':(cat?cat.name:fc));var desc=isHH?'Private board for Jesse &amp; Jaemie and anyone you both invite.':(isHK?'Private \\u2014 Jesse &amp; Jaemie. Retired &amp; archived conversations.':(cat?esc(cat.d):''));
h+='<div class="card"><button class="mini fback" onclick="forumBack()">\\u2190 Forums</button><h2>'+esc(title)+'</h2><div class="sub">'+desc+'</div>';
if(fc==='readfirst')h+='<div class="card" style="border-color:var(--acc2)"><h2>\\uD83D\\uDCCC Start Here \\u2014 How Jesse built this</h2><div class="sub">The whole recipe: the post-mortem, every feature in the site with a copy-ready AI prompt to recreate it, the publish log, and the crew who made it real.</div><a class="go" href="/start-here" target="_blank" rel="noopener" style="display:inline-block;text-decoration:none;margin-top:8px">Open the Start Here guide \\u2197</a></div>';
h+='<div id="forumsV1"></div></div>';if(isHH)h+=forumPerms();return h;}
function meta(x){return '<b>'+esc(x.caption||x.title||'(untitled)')+'</b>'+(x.people?'<br>'+esc(x.people):'')+(x.place?'<br>'+esc(x.place):'');}
function cell(x){return '<div class="gcell"><img src="'+esc(x.url)+'" onclick="viewMedia('+x.id+',1)"><div class="cap">'+meta(x)+(S.me.isAdmin?' <button class="mini" onclick="delMedia('+x.id+')">x</button> <span class="nuke" title="Destroy permanently" onclick="destroyMediaItem('+x.id+')">\\uD83D\\uDCA3</span>':'')+'</div></div>';}
window.__lib=window.__lib||'movies';
window.__libSel=window.__libSel||[];
window.__libMode=window.__libMode||'movies';
function libSec(s){var m={books:'book',audiobooks:'audiobook'};libToggle(m[s]||s);}
function libKindLabel(k){return ({book:'Books',audiobook:'Audiobooks',song:'Music',video:'Videos',photo:'Pictures',movie:'Movies'})[k]||k;}
function libToggle(k){if(k==='song'){window.__libMode='song';}else if(k==='movie'){window.__libMode='movies';}else if(k==='book'||k==='audiobook'||k==='photo'){window.__libMode='stack';var a=window.__libSel||[];var i=a.indexOf(k);if(i>=0){a.splice(i,1);}else{a.push(k);}window.__libSel=a;}else{window.__libMode=k;}window.__cfi=0;render();}
function libClearSel(){window.__libSel=[];window.__libMode='stack';window.__cfi=0;render();}
function stackReel(){var sel=window.__libSel||[];if(!sel.length){return '<div class="card"><h2 style="font-size:1rem;margin-bottom:4px">No shelves selected</h2><div class="sub">Tap a shelf tile above to load it onto the shelf below.</div></div>';}var list=(S.media||[]).filter(function(x){return sel.indexOf(x.kind)>=0;});if(sel.indexOf('movie')>=0&&typeof mLive==='function'){mLive().forEach(function(m){list.push({title:m.t,caption:m.t,img:m.img,kind:'movie',id:'mov:'+m.t,people:''});});}if(!list.length){return '<div class="card"><h2 style="font-size:1rem;margin-bottom:4px">Nothing on these shelves yet</h2><div class="sub">Add items under the Add shelf &#8212; they appear here.</div></div>';}window.__cflist=list;if(typeof window.__cfi!=='number'||window.__cfi>=list.length)window.__cfi=0;var pr=libProgGet();var h='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">&#8249;</button><div class="cfstage" id="cfstage">';list.forEach(function(m,i){var t=m.title||m.caption||'Untitled';var p=pr[m.id]||0;var badge=p>0?'<div class="cfbadge">'+p+'%</div>':'';h+='<div class="cfc'+(m.img?' hascover':'')+'" onclick="cfGo('+i+')"><div class="cfflip"><div class="cffront"><div class="cftag">'+esc(libKindLabel(m.kind))+'</div>'+cfPosterFor({t:t,img:m.img||((m.kind==='audiobook'||m.kind==='book'||m.kind==='photo')&&m.url||'')})+badge+'<div class="cfinfo"><div class="cfd-title2">'+esc(t)+'</div><div class="cfd-meta">'+esc(m.people||'')+'</div><div class="cfprog" data-id="'+m.id+'"><button class="pa pb">&#8249;</button><div class="pbar"><i style="width:'+p+'%"></i></div><button class="pa pf">&#8250;</button><span class="pct">'+p+'%</span></div></div></div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">&#8250;</button></div>';setTimeout(cfPaint,30);return h;}
function libProgGet(){try{return JSON.parse(localStorage.getItem('clemitBookProg')||'{}')||{};}catch(e){return {};}}function libProgSet(id,p){try{var m=libProgGet();m[id]=Math.max(0,Math.min(100,Math.round(p)));localStorage.setItem('clemitBookProg',JSON.stringify(m));}catch(e){}}function libFeelGet(){try{var f=JSON.parse(localStorage.getItem('clemitLibFeel')||'{}')||{};return {grab:(typeof f.grab==='number'?f.grab:50),spin:(typeof f.spin==='number'?f.spin:50)};}catch(e){return {grab:50,spin:50};}}function libFeelSet(k,v){try{var f=libFeelGet();f[k]=v;localStorage.setItem('clemitLibFeel',JSON.stringify(f));}catch(e){}}function libJogInit(){try{var root=document.querySelector('.libwrapr');if(!root)return;var gear=root.querySelector('#libgear'),panel=root.querySelector('#libset');if(gear&&panel){gear.onclick=function(e){e.stopPropagation();panel.classList.toggle('open');};var feel=libFeelGet();[].forEach.call(panel.querySelectorAll('input[data-k]'),function(inp){var key=inp.getAttribute('data-k');inp.value=feel[key];var vo=panel.querySelector('[data-v="'+key+'"]');if(vo)vo.textContent=feel[key];inp.addEventListener('input',function(){if(vo)vo.textContent=inp.value;libFeelSet(key,+inp.value);});});}var cf=root.querySelector('.cf');if(cf){var jt=null;function spd(){return libFeelGet().spin;}function dvr(){return 320-libFeelGet().grab*2.2;}function jog(v){clearInterval(jt);var mag=Math.abs(v);if(mag<0.06)return;var dir=v>0?1:-1;var sf=0.25+spd()/100*0.75;var ms=Math.max(60,(520-mag*440)/sf);jt=setInterval(function(){if(dir>0){cfPrev();}else{cfNext();}},ms);}var drag=false,sx=0;cf.addEventListener('pointerdown',function(e){if(e.target.closest('.cfnav,.pa,.pbar'))return;drag=true;sx=e.clientX;try{cf.setPointerCapture(e.pointerId);}catch(x){}cf.classList.add('lgrab');});cf.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-sx;var v=Math.max(-1,Math.min(1,dx/dvr()));jog(v);});function endd(){if(!drag)return;drag=false;clearInterval(jt);jt=null;cf.classList.remove('lgrab');}cf.addEventListener('pointerup',endd);cf.addEventListener('pointercancel',endd);}[].forEach.call(root.querySelectorAll('.cfprog'),function(row){var id=row.getAttribute('data-id'),bar=row.querySelector('.pbar'),fill=bar.querySelector('i'),pct=row.querySelector('.pct');function setp(p){p=Math.max(0,Math.min(100,p));fill.style.width=p+'%';if(pct)pct.textContent=Math.round(p)+'%';libProgSet(id,p);var card=row.closest('.cfc');if(card){var b=card.querySelector('.cfbadge');if(p>0){if(!b){b=document.createElement('div');b.className='cfbadge';card.querySelector('.cffront').appendChild(b);}b.textContent=Math.round(p)+'%';b.style.display='block';}else if(b){b.style.display='none';}}}var dg=false;function fx(e){var r=bar.getBoundingClientRect();setp(((e.clientX-r.left)/r.width)*100);}bar.addEventListener('pointerdown',function(e){e.stopPropagation();dg=true;try{bar.setPointerCapture(e.pointerId);}catch(x){}fx(e);});bar.addEventListener('pointermove',function(e){if(dg)fx(e);});bar.addEventListener('pointerup',function(){dg=false;});bar.addEventListener('pointercancel',function(){dg=false;});[].forEach.call(row.querySelectorAll('.pa'),function(btn){var dir=btn.classList.contains('pf')?1:-1;var t=null,sp=0;function cur(){return parseFloat(fill.style.width)||0;}function start(){stop();sp=.6;t=setInterval(function(){sp=Math.min(6,sp*1.16);setp(cur()+dir*sp);},60);}function stop(){clearInterval(t);t=null;}btn.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();start();});btn.addEventListener('pointerup',stop);btn.addEventListener('pointerleave',stop);btn.addEventListener('pointercancel',stop);});});}catch(e){}}function booksReel(k){var list=(S.media||[]).filter(function(x){return x.kind===k;});var kl=(k==='audiobook')?'audiobooks':'books';if(!list.length){return '<div class="card"><h2 style="font-size:1rem;margin-bottom:4px">No '+kl+' yet</h2><div class="sub">Add one under the + Add shelf - it appears here on the shelf.</div></div>';}window.__cflist=list;if(typeof window.__cfi!=='number'||window.__cfi>=list.length)window.__cfi=0;var pr=libProgGet();var h='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">&#8249;</button><div class="cfstage" id="cfstage">';list.forEach(function(m,i){var t=m.title||m.caption||'Untitled';var p=pr[m.id]||0;var badge=p>0?'<div class="cfbadge">'+p+'%</div>':'';h+='<div class="cfc'+(m.img?' hascover':'')+'" onclick="cfGo('+i+')"><div class="cfflip"><div class="cffront">'+cfPosterFor({t:t,img:m.img||((m.kind==='audiobook'||m.kind==='book'||m.kind==='photo')&&m.url||'')})+badge+'<div class="cfinfo"><div class="cfd-title2">'+esc(t)+'</div><div class="cfd-meta">'+esc(m.people||'')+'</div><div class="cfprog" data-id="'+m.id+'"><button class="pa pb">&#8249;</button><div class="pbar"><i style="width:'+p+'%"></i></div><button class="pa pf">&#8250;</button><span class="pct">'+p+'%</span></div></div></div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">&#8250;</button></div>';setTimeout(cfPaint,30);return h;}
function inFlightRail(){var pr=libProgGet();var items=(S.media||[]).filter(function(x){var p=pr[x.id]||0;return p>0&&p<100;});if(!items.length)return '';var h='<div class="libnp"><div class="libnplbl">Now playing &mdash; pick up where you left off</div><div class="libnprow">';items.slice(0,12).forEach(function(m){var p=pr[m.id]||0;var t=m.title||m.caption||'Untitled';h+='<div class="libnpc"><div class="npt">'+esc(t)+'</div><div class="npbar"><i style="width:'+p+'%"></i></div><div class="nppct">'+esc(libKindLabel(m.kind))+' &middot; '+p+'%</div></div>';});h+='</div></div>';return h;}
function libraryView(){var mode=window.__libMode||'stack';var sel=window.__libSel||[];
var stackTiles=[['book','Books','&#128214;'],['audiobook','Audiobooks','&#127911;'],['movie','Movies','&#127916;'],['song','Music','&#127925;'],['photo','Pictures','&#128444;&#65039;']];
var altTiles=[];
var h='<div class="vhead"><h2>&#128218; Library</h2><span class="stamp">&#10003; Published Jun 18 2026 &#183; v6</span></div>';h+=libFilterBar();
h+='<div class="libtiles">';
stackTiles.forEach(function(c){var on=(mode==='stack'&&sel.indexOf(c[0])>=0)||(c[0]==='song'&&mode==='song')||(c[0]==='movie'&&mode==='movies');var n=(S.media||[]).filter(function(x){return x.kind===c[0];}).length;if(c[0]==='song')n+=(window.__songs||[]).length;h+='<div class="libtile'+(on?' on':'')+'" onclick="libToggle(\\''+c[0]+'\\')"><span class="chk">&#10003;</span><div class="ti">'+c[2]+'</div><div class="tn">'+c[1]+'</div><div class="tc">'+n+'</div></div>';});
altTiles.forEach(function(c){var on=(mode===c[0]);h+='<div class="libtile alt'+(on?' on':'')+'" onclick="libToggle(\\''+c[0]+'\\')"><div class="ti">'+c[2]+'</div><div class="tn">'+c[1]+'</div></div>';});
h+='</div>';
if(mode==='stack'){var names=sel.map(function(k){return libKindLabel(k);}).join(' + ');h+='<div class="libsub">Shelf &#183; '+(names?esc(names):'nothing selected')+(sel.length?' <span class="libclear" onclick="libClearSel()">clear</span>':'')+'</div>';h+=inFlightRail();h+=stackReel();h+=libSig();return h;}
if(mode==='movies'){h+=moviesBody();return h;}
if(mode==='song'&&window.__libSub==='playlists'){return h+'<div id="libV7"></div>';}if(mode==='song'){h+=musicReel();return h;}
if(mode==='radio'){h+=radioReel();return h;}
if(mode==='add'){h+='<div class="card"><h2 style="font-size:1rem;margin-bottom:4px">Add to the library</h2><div class="sub">Tag people and places so it stays sortable. Songs feed the DJ Box.</div><div class="row"><input id="mu" placeholder="URL of song / image / video..." style="flex:2 1 200px"><select id="mk"><option value="photo">Picture</option><option value="video">Video</option><option value="song">Song</option><option value="book">Book</option><option value="audiobook">Audiobook</option></select></div><div class="row"><input id="mp" placeholder="People (comma separated)"><input id="ml" placeholder="Place"><input id="mc" placeholder="Caption / meaning"><button class="go" onclick="addMedia()">Add by URL</button></div><div class="row" style="margin-top:6px;align-items:center;gap:10px;flex-wrap:wrap"><label class="go" style="cursor:pointer">&#128247; Upload photos from device<input type="file" accept="image/*" multiple onchange="uploadPhotos(this)" style="display:none"></label><span id="upStat" class="sub" style="margin:0"></span></div><div class="sub" style="margin-top:4px;font-size:.82rem">Pictures upload straight to the family library. The tags above apply to what you upload.</div></div>';return h;}
h+='<div class="row" style="margin:0 0 10px"><input id="mfilter" placeholder="filter by person or place..." oninput="window.__mf=this.value;render()" value="'+esc(window.__mf||'')+'"></div>';
h+=mediaReel(mode);return h;}
function djView(){let h='<div class="card"><h2>Library</h2><div class="sub">Songs, pictures, video - Jesses library. Tag people and places so it stays sortable. Songs here feed the DJ Box.</div><div class="row"><input id="mu" placeholder="URL of song / image / video..." style="flex:2 1 200px"><select id="mk"><option value="photo">Picture</option><option value="video">Video</option><option value="song">Song</option><option value="book">Book</option><option value="audiobook">Audiobook</option></select></div><div class="row"><input id="mp" placeholder="People (comma separated)"><input id="ml" placeholder="Place"><input id="mc" placeholder="Caption / meaning"><button class="go" onclick="addMedia()">Add</button></div><div class="row"><input id="mfilter" placeholder="filter by person or place..." oninput="window.__mf=this.value;render()" value="'+esc(window.__mf||'')+'"></div>';const f=(window.__mf||'').toLowerCase();const match=x=>!f||((x.people||'')+' '+(x.place||'')+' '+(x.caption||'')+' '+(x.title||'')).toLowerCase().includes(f);const songs=S.media.filter(x=>x.kind==='song'&&match(x)),photos=S.media.filter(x=>x.kind==='photo'&&match(x)),videos=S.media.filter(x=>x.kind==='video'&&match(x));h+='<h2 style="font-size:.95rem;margin:12px 0 6px">Pictures</h2>';h+=photos.length?'<div class="gallery">'+photos.map(cell).join('')+'</div>':'<div class="empty">No pictures'+(f?' match':' yet')+'.</div>';h+='<h2 style="font-size:.95rem;margin:16px 0 6px">Videos</h2>';h+=videos.length?'<div class="gallery">'+videos.map(x=>'<div class="gcell"><video controls onplay="viewMedia('+x.id+',0)" src="'+esc(x.url)+'"></video><div class="cap">'+meta(x)+(S.me.isAdmin?' <span class="nuke" title="Destroy permanently" onclick="destroyMediaItem('+x.id+')">\\uD83D\\uDCA3</span>':'')+'</div></div>').join('')+'</div>':'<div class="empty">No videos'+(f?' match':' yet')+'.</div>';h+='<h2 style="font-size:.95rem;margin:16px 0 6px">Songs</h2>';h+=songs.length?songs.map(x=>'<div class="song">'+esc(x.title||x.url)+' <audio controls src="'+esc(x.url)+'" style="height:32px"></audio>'+(S.me.isAdmin?'<button class="mini" onclick="delMedia('+x.id+')">x</button> <span class="nuke" title="Destroy permanently" onclick="destroyMediaItem('+x.id+')">\\uD83D\\uDCA3</span>':'')+'</div>').join(''):'<div class="empty">No songs'+(f?' match':' yet')+'.</div>';return h+'</div>';}
function reunionView(){let h='<div class="card"><h2>Reunion 2027 - RSVP</h2><div class="sub">Your household and headcount for the San Antonio base.</div><div class="row"><input id="rh" placeholder="Household"><input id="rc" type="number" placeholder="#" style="flex:0 1 90px"><input id="rn" placeholder="Note"><button class="go" onclick="addR()">RSVP</button></div>';if(!S.rsvp.length)return h+'<div class="empty">No RSVPs yet.</div></div>';var rcols=[{key:'household',label:'Household'},{key:'headcount',label:'Coming',num:true},{key:'note',label:'Note'}];h+=dataTable('rsvp',rcols,S.rsvp,{search:true,sort:'household',exportName:'reunion-rsvp'});return h+'</div>';}
function tankColor(pct,waste){if(waste)return pct>70?'var(--bad)':pct>40?'var(--warn)':'var(--acc2)';return pct<25?'var(--bad)':pct<50?'var(--warn)':'var(--acc2)';}
function gaugeRow(name,pct,waste,label){return '<li><span class="iname">'+name+'</span><span class="gauge"><div style="width:'+pct+'%;background:'+tankColor(pct,waste)+'"></div></span><span class="badge">'+(label||pct+'%')+'</span></li>';}
function mytritonView(){const tanks=[['Fresh #1',88,0],['Fresh #2',61,0],['Grey',47,1],['Black',33,1],['Galley Grey',52,1],['Diesel',74,0],['Generator Gas',40,0],['Propane',66,0],['DEF',90,0]];let h='<div class="card"><h2>MyTriton</h2><div class="sub">Live RV telemetry. <b style="color:var(--warn)">Mock values</b> - bind to the Victron VRM feed to go live.</div>';h+='<h3 style="font-size:.95rem;margin:6px 0 6px;color:var(--dim)">Tanks (9)</h3><ul>';tanks.forEach(t=>{h+=gaugeRow(t[0],t[1],t[2]);});h+='</ul>';h+='<h3 style="font-size:.95rem;margin:14px 0 6px;color:var(--dim)">Power (3 systems)</h3><ul>';h+=gaugeRow('House Battery',82,0,'82% SOC');h+='<li><span class="iname">Solar Array</span><span class="badge window">640 W in</span></li>';h+='<li><span class="iname">Inverter Load</span><span class="badge">1.2 kW</span></li>';h+='</ul>';h+='<h3 style="font-size:.95rem;margin:14px 0 6px;color:var(--dim)">Temps</h3><ul>';h+='<li><span class="iname">Fridge</span><span class="badge ok">38&deg;F</span><span class="sub" style="margin:0;flex:1">food-safe under 40&deg;F</span></li>';h+='<li><span class="iname">Cabin (dog)</span><span class="badge ok">74&deg;F</span><span class="sub" style="margin:0;flex:1">dog-safe 60-80&deg;F</span></li>';return h+'</ul></div>';}
function camerasView(){const cams=['Front','Rear','Door','Cabin','Dog Zone','Galley'];let h='<div class="card"><h2>Cameras</h2><div class="sub">Audio/Video feeds. <b style="color:var(--warn)">Offline</b> - bind your RTSP/HLS stream URLs.</div><div class="gallery">';cams.forEach(c=>{h+='<div class="gcell"><div style="height:120px;display:flex;align-items:center;justify-content:center;color:var(--dim);background:#0b0d12">&#9679; offline</div><div class="cap"><b>'+c+'</b><br>set stream URL</div></div>';});return h+'</div></div>';}
var M_TIER=["Fresh","Show-To","Kids Cartoon","Haven't Seen","Must See","House Fave"];
window.MQ=window.MQ||[];
var MOVIES=[
{t:"300",c:"",r:117,s:4,d:"Spartan stand at Thermopylae, stylized and brutal.",lw:""},
{t:"Edge of Tomorrow",c:"",r:113,s:4,d:"A soldier relives one alien battle until he wins it.",lw:""},
{t:"Lady and the Tramp II",c:"",r:70,s:2,d:"Scamp the pup runs off with the junkyard dogs.",lw:""},
{t:"Pirates: On Stranger Tides",c:"",r:137,s:3,d:"Jack hunts the Fountain of Youth with Blackbeard.",lw:""},
{t:"Mary Poppins",c:"",r:139,s:3,d:"A magical nanny sets a London family right.",lw:""},
{t:"The Island",c:"",r:136,s:3,d:"Clones discover the truth behind their perfect world.",lw:""},
{t:"Tombstone",c:"",r:130,s:4,d:"Wyatt Earp and Doc Holliday face the Cowboys.",lw:""},
{t:"V for Vendetta",c:"",r:132,s:4,d:"A masked anarchist wakes a nation against tyranny.",lw:""},
{t:"Fantastic Four",c:"",r:106,s:2,d:"Four get cosmic powers and fight Doctor Doom.",lw:""},
{t:"Spaceballs",c:"",r:96,s:4,d:"Mel Brooks spoofs Star Wars at ludicrous speed.",lw:""},
{t:"Maleficent",c:"",r:97,s:3,d:"Sleeping Beauty told from the dark fairy's view.",lw:""},
{t:"WALL-E",c:"",r:98,s:5,d:"A lonely cleanup robot finds love and saves Earth.",lw:"May 2026 \\u00b7 Kids"},
{t:"John Carter",c:"",r:132,s:3,d:"A Civil War vet is swept onto a warring Mars.",lw:""},
{t:"Push",c:"",r:111,s:2,d:"Psychic fugitives outrun a shadow agency in Hong Kong.",lw:""},
{t:"Rush Hour 2",c:"",r:90,s:3,d:"Lee and Carter take on a Hong Kong crime boss.",lw:""},
{t:"The Great Muppet Caper",c:"Muppets",o:1,r:95,s:2,d:"The Muppets chase jewel thieves through London.",lw:""},
{t:"Muppets: Wizard of Oz",c:"Muppets",o:2,r:87,s:2,d:"Kermit and crew romp down the yellow brick road.",lw:""},
{t:"Sorcerer's Stone",c:"Harry Potter",o:1,r:152,s:5,d:"Harry learns he is a wizard and reaches Hogwarts.",lw:""},
{t:"Chamber of Secrets",c:"Harry Potter",o:2,r:161,s:5,d:"A hidden monster is petrifying the students.",lw:""},
{t:"Prisoner of Azkaban",c:"Harry Potter",o:3,r:142,s:5,d:"An escaped prisoner is tied to Harry's past.",lw:""},
{t:"Goblet of Fire",c:"Harry Potter",o:4,r:157,s:5,d:"Harry is forced into a deadly tournament.",lw:""},
{t:"Order of the Phoenix",c:"Harry Potter",o:5,r:138,s:5,d:"Students train in secret as the Ministry denies the threat.",lw:""},
{t:"Half-Blood Prince",c:"Harry Potter",o:6,r:153,s:5,d:"Old secrets of the dark lord come to light.",lw:""},
{t:"Deathly Hallows Pt 1",c:"Harry Potter",o:7,r:146,s:5,d:"The trio hunts the Horcruxes on the run.",lw:""},
{t:"Deathly Hallows Pt 2",c:"Harry Potter",o:8,r:130,s:5,d:"The final battle for Hogwarts.",lw:""},
{t:"The Matrix",c:"The Matrix",o:1,r:136,s:5,d:"Neo learns reality itself is a simulation.",lw:"Apr 2026 \\u00b7 Jesse"},
{t:"Reloaded",c:"The Matrix",o:2,r:138,s:4,d:"Zion braces as Neo seeks the Source.",lw:""},
{t:"Revolutions",c:"The Matrix",o:3,r:129,s:4,d:"The war for humanity reaches its end.",lw:""},
{t:"Mad Max",c:"Mad Max",o:1,r:88,s:4,d:"A cop turns avenger on a lawless highway.",lw:""},
{t:"The Road Warrior",c:"Mad Max",o:2,r:96,s:4,d:"Max defends a fuel refinery in the wasteland.",lw:""}
];
MOVIES.forEach(function(m,i){m.i=i;});
function mHue(t){var n=0;for(var i=0;i<t.length;i++)n=(n*31+t.charCodeAt(i))%360;return n;}
function mPoster(t){var h=mHue(t);var init=t.replace(/^The /,"").split(/[ :]/).filter(Boolean).slice(0,2).map(function(w){return w.charAt(0);}).join("").toUpperCase();return '<div class="mposter" style="background:linear-gradient(150deg,hsl('+h+',46%,30%),hsl('+((h+40)%360)+',52%,15%))">'+init+'</div>';}
function mStars(s){var f="";for(var i=0;i<5;i++)f+=(i<s?"\\u2605":"\\u2606");return f;}
function mCard(m){var qd=window.MQ.indexOf(m.t)>=0;var ready=(S.movieReady||[]).indexOf(movSlug(m.t))>=0;var reqd=(S.movieReq||[]).indexOf(m.t)>=0;var lab=(m.o?'#'+m.o+' \\u00b7 ':'')+m.r+'m';var h='<div class="mcard">'+mPoster(m.t)+'<div class="mbody">';h+='<div class="mtitle">'+esc(m.t)+'</div>';h+='<div class="mmeta">'+(m.c?esc(m.c)+' \\u00b7 ':'')+lab+'</div>';h+='<div class="mstars">'+mStars(m.s)+'<span class="tier">'+M_TIER[m.s]+'</span></div>';h+='<div class="mdesc">'+esc(m.d)+'</div>';h+='<div class="mlast">'+(m.lw?('\\u25b6 Last: '+esc(m.lw)):'\\u25cb Not watched yet')+'</div>';h+='<div class="mbtns">'+(ready?'<span class="mbtn play" onclick="playMovie('+m.i+')">\\u25b6 Play</span>':reqd?'<span class="mbtn syncing">\\u23f3 Syncing</span>':'<span class="mbtn req" onclick="movRequest('+m.i+')">\\u2601 Request</span>')+'<span class="mbtn'+(qd?' on':'')+'" onclick="mQ('+m.i+')">'+(qd?'\\u2713 Queued':'+ Queue')+'</span>'+(S.me.isAdmin?'<span class="nuke" title="Destroy permanently" onclick="destroyMovie('+m.i+')">\\uD83D\\uDCA3</span>':'')+'</div>';h+='</div></div>';return h;}
function moviesBody(){if(window.__movieMode){var mm=window.__movieMode;if(mm.size==='mini')return moviesReelHtml()+miniPlayer();return moviePlayerBlock()+moviesReelHtml();}return moviesReelHtml();}
function moviesReelHtml(){var live=cfSortList(mLive(),'movies');window.__cflist=live;if(typeof window.__cfi!=='number'||window.__cfi>=live.length)window.__cfi=0;
var h='<div class="mqbar"><span class="lab">Here’s what’s up next during Movie Time!!</span><span class="mqctrls"><span class="mqbtn" onclick="mSurprise()">\\uD83C\\uDFB2 Surprise</span><span class="mqbtn sync" onclick="mSyncQueue()">\\u2601 Sync queued to cloud</span>'+(window.MQ.length?'<span class="mqclr" onclick="mClr()">Clear</span>':'')+'</span></div>';
h+='<div class="mqstrip">'+(window.MQ.length?window.MQ.map(function(q,i){return '<span class="mqpill" title="'+esc(q)+'"><span class="mqpill-t">'+esc(q)+'</span><span class="mqpill-x" onclick="mUnq('+i+')">\\u2715</span></span>';}).join(''):'<span class="mqempty">Queue is empty \\u2014 tap <b>+ Queue</b> on a movie below \\u2193</span>')+'</div>';
if(!live.length)return h+'<div class="empty">No movies.</div>';
h+=reelBar('movies');
h+='<div class="cflabels" id="cflabels">';live.forEach(function(m,i){h+='<div class="cflabel" onclick="cfGo('+i+')"><div class="cfl-title">'+esc(m.t)+'</div><div class="cfl-stat cfl-field">'+esc(String(cfFieldVal(m,cfCurSort('movies'))))+'</div></div>';});h+='</div>';
h+='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">\\u2039</button><div class="cfstage" id="cfstage">';
live.forEach(function(m,i){h+='<div class="cfc'+(m.img?' hascover':'')+(isRecycled(m.t)?' recycled':'')+'" onclick="cfClick(event,'+i+')" ondblclick="mjogQueue('+i+')"><div class="cfflip"><div class="cffront">'+cfPosterFor(m)+cfCardInfo(m)+'</div>'+(m.img?'<div class="cfback" style="background-image:url('+m.img+')"></div>':'')+'</div></div>';});
h+='</div><button class="cfnav cfnext" onclick="cfNext()">\\u203a</button></div>';
setTimeout(cfPaint,30);return h;}
function cfPolishGlobal(){if(!window.__cfDeleg){window.__cfDeleg=true;var jt=null;function fl(){return libFeelGet();}function jog(v){clearInterval(jt);var mag=Math.abs(v);if(mag<0.06)return;var dir=v>0?1:-1;var sf=0.25+fl().spin/100*0.75;var ms=Math.max(60,(520-mag*440)/sf);jt=setInterval(function(){if(dir>0){cfPrev();}else{cfNext();}},ms);}var drag=false,sx=0,dcf=null;document.addEventListener('pointerdown',function(e){if(!e.target.closest)return;var cf=e.target.closest('.cf');if(!cf)return;if(e.target.closest('.cfnav,.pa,.pbar,.libgear,.libset,.mbtn,.lmbtn'))return;drag=true;sx=e.clientX;dcf=cf;cf.classList.add('lgrab');});document.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-sx;var dv=320-fl().grab*2.2;var v=Math.max(-1,Math.min(1,dx/dv));jog(v);});function endd(){if(!drag)return;drag=false;clearInterval(jt);jt=null;if(dcf){dcf.classList.remove('lgrab');dcf=null;}}document.addEventListener('pointerup',endd);document.addEventListener('pointercancel',endd);}try{var cf=document.querySelector('.cf');if(cf&&!cf.__gear){cf.__gear=true;var g=document.createElement('div');g.className='libgear';g.innerHTML='&#9881;';cf.appendChild(g);var pan=document.createElement('div');pan.className='libset';pan.innerHTML='<div class="lsrow"><div class="lsl"><span>Grab intensity</span><span class="lsv" data-v="grab">50</span></div><input type="range" min="0" max="100" value="50" data-k="grab"></div><div class="lsrow"><div class="lsl"><span>Spin speed</span><span class="lsv" data-v="spin">50</span></div><input type="range" min="0" max="100" value="50" data-k="spin"></div>';cf.appendChild(pan);var fe=libFeelGet();g.onclick=function(e){e.stopPropagation();pan.classList.toggle('open');};[].forEach.call(pan.querySelectorAll('input[data-k]'),function(inp){var key=inp.getAttribute('data-k');inp.value=fe[key];var vo=pan.querySelector('[data-v="'+key+'"]');if(vo)vo.textContent=fe[key];inp.addEventListener('pointerdown',function(ev){ev.stopPropagation();});inp.addEventListener('input',function(){if(vo)vo.textContent=inp.value;libFeelSet(key,+inp.value);});});}[].forEach.call(document.querySelectorAll('.cfprog'),function(row){if(row.__wired)return;row.__wired=true;var id=row.getAttribute('data-id'),bar=row.querySelector('.pbar'),fill=bar.querySelector('i'),pct=row.querySelector('.pct');function setp(pp){pp=Math.max(0,Math.min(100,pp));fill.style.width=pp+'%';if(pct)pct.textContent=Math.round(pp)+'%';libProgSet(id,pp);}var dg=false;function fx(e){var r=bar.getBoundingClientRect();setp(((e.clientX-r.left)/r.width)*100);}bar.addEventListener('pointerdown',function(e){e.stopPropagation();dg=true;fx(e);});bar.addEventListener('pointermove',function(e){if(dg)fx(e);});bar.addEventListener('pointerup',function(){dg=false;});[].forEach.call(row.querySelectorAll('.pa'),function(btn){var dir=btn.classList.contains('pf')?1:-1;var t=null,sp=0;function cur(){return parseFloat(fill.style.width)||0;}function start(){stop();sp=.6;t=setInterval(function(){sp=Math.min(6,sp*1.16);setp(cur()+dir*sp);},60);}function stop(){clearInterval(t);t=null;}btn.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();start();});btn.addEventListener('pointerup',stop);btn.addEventListener('pointerleave',stop);btn.addEventListener('pointercancel',stop);});});}catch(e){}}function cfPaint(){var stage=document.getElementById('cfstage');if(!stage)return;var cards=stage.children,c=window.__cfi||0,n=cards.length;for(var i=0;i<cards.length;i++){var off=i-c;if(n>1){if(off>n/2)off-=n;else if(off<-n/2)off+=n;}var ax=Math.abs(off),card=cards[i];card.style.transform='translate(-50%,-50%) translateX('+(off*62)+'%) translateZ('+(-ax*150)+'px) rotateY('+(off>0?-44:off<0?44:0)+'deg)';card.style.opacity=ax>3?'0':String(1-ax*0.16);card.style.zIndex=String(Math.max(1,200-ax));card.style.pointerEvents=ax>3?'none':'auto';if(off===0)card.classList.add('center');else card.classList.remove('center');}var labels=document.getElementById('cflabels');if(labels){var ll=labels.children,n2=ll.length;for(var j=0;j<ll.length;j++){var o2=j-c;if(n2>1){if(o2>n2/2)o2-=n2;else if(o2<-n2/2)o2+=n2;}var a2=Math.abs(o2),lab=ll[j];lab.style.transform='translateX('+(o2*92)+'px) translateY('+(a2*15)+'px)';lab.style.opacity=a2>3?'0':String(1-a2*0.2);lab.style.fontSize=(a2===0?18:a2===1?16:14)+'px';lab.style.zIndex=String(Math.max(1,200-a2));lab.style.pointerEvents=a2>3?'none':'auto';if(o2===0)lab.classList.add('center');else lab.classList.remove('center');}}try{cfPolishGlobal();}catch(e){}}
function cfGo(i){window.__cfi=i;cfPaint();}
function cfPrev(){var n=(window.__cflist||[]).length||1;window.__cfi=((window.__cfi||0)-1+n)%n;cfPaint();}
function cfNext(){var n=(window.__cflist||[]).length||1;window.__cfi=((window.__cfi||0)+1)%n;cfPaint();}
function mediaPoster(x){if(x.kind==='photo'&&x.url)return '<div class="cfposter cover" style="background-image:url('+x.url+')"></div>';var nm=x.caption||x.title||x.place||x.people||'?';var hue=mHue(nm);var init=nm.replace(/^The /,'').split(/[ :]/).filter(Boolean).slice(0,2).map(function(w){return w.charAt(0);}).join('').toUpperCase();return '<div class="cfposter" style="background:linear-gradient(150deg,hsl('+hue+',46%,30%),hsl('+((hue+40)%360)+',52%,15%))"><span class="cfinit">'+(x.kind==='video'?'▶':esc(init||'■'))+'</span></div>';}
function mediaCardInfo(x){var btns='<span class="mbtn play" onclick="viewMedia('+x.id+',1)">'+(x.kind==='video'?'▶ Play':'🔍 View')+'</span>';if(S.me.isAdmin)btns+='<span class="nuke" title="Destroy permanently" onclick="destroyMediaItem('+x.id+')">💣</span>';var sub=[x.people,x.place].filter(Boolean).join(' · ')||'—';return '<div class="cfinfo"><div class="cfd-title2">'+esc(x.caption||x.title||'(untitled)')+'</div><div class="cfd-meta">'+esc(sub)+'</div><div class="cfd-btns">'+btns+'</div></div>';}
function mediaReel(kind){var f=(window.__mf||'').toLowerCase();var match=function(x){return !f||((x.people||'')+' '+(x.place||'')+' '+(x.caption||'')+' '+(x.title||'')).toLowerCase().indexOf(f)>=0;};var items=(S.media||[]).filter(function(x){return x.kind===kind&&match(x);});window.__cflist=items;if(typeof window.__cfi!=='number'||window.__cfi>=items.length)window.__cfi=0;var sk=cfCurSort(kind);var h=reelBar(kind);if(!items.length)return h+'<div class="empty">No '+(kind==='photo'?'pictures':'videos')+(f?' match':' yet')+'.</div>';h+='<div class="cflabels" id="cflabels">';items.forEach(function(x,i){h+='<div class="cflabel" onclick="cfGo('+i+')"><div class="cfl-title">'+esc(x.caption||x.title||'(untitled)')+'</div><div class="cfl-stat cfl-field">'+esc(String(cfFieldVal(x,sk)))+'</div></div>';});h+='</div>';h+='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">‹</button><div class="cfstage" id="cfstage">';items.forEach(function(x,i){h+='<div class="cfc" onclick="cfClick(event,'+i+')"><div class="cfflip"><div class="cffront">'+mediaPoster(x)+mediaCardInfo(x)+'</div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">›</button></div>';setTimeout(cfPaint,30);return h;}
function radioReel(){var items=RADIOS;window.__cflist=items;if(typeof window.__cfi!=='number'||window.__cfi>=items.length)window.__cfi=0;var sk=cfCurSort('radio');var h=reelBar('radio');h+='<div class="cflabels" id="cflabels">';items.forEach(function(r,i){h+='<div class="cflabel" onclick="cfGo('+i+')"><div class="cfl-title">'+esc(r.n)+'</div><div class="cfl-stat cfl-field">'+esc(r.g||'')+'</div></div>';});h+='</div>';h+='<div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">‹</button><div class="cfstage" id="cfstage">';items.forEach(function(r,i){var hue=mHue(r.n);h+='<div class="cfc" onclick="cfClick(event,'+i+')"><div class="cfflip"><div class="cffront"><div class="cfposter" style="background:linear-gradient(150deg,hsl('+hue+',46%,30%),hsl('+((hue+40)%360)+',52%,15%))"><span class="cfinit">📻</span></div><div class="cfinfo"><div class="cfd-title2">'+esc(r.n)+'</div><div class="cfd-meta">'+esc(r.g||'')+'</div><div class="cfd-btns"><span class="mbtn play" onclick="playRadio('+i+')">▶ Play</span></div></div></div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">›</button></div>';setTimeout(cfPaint,30);return h;}
function cfPosterFor(m){if(m.img)return '<div class="cfposter cover" style="background-image:url('+m.img+')"></div>';var hue=mHue(m.t);var init=m.t.replace(/^The /,"").split(/[ :]/).filter(Boolean).slice(0,2).map(function(w){return w.charAt(0);}).join("").toUpperCase();return '<div class="cfposter" style="background:linear-gradient(150deg,hsl('+hue+',46%,30%),hsl('+((hue+40)%360)+',52%,15%))"><span class="cfinit">'+init+'</span></div>';}
function cfCardInfo(m){var ready=(S.movieReady||[]).indexOf(movSlug(m.t))>=0,reqd=(S.movieReq||[]).indexOf(m.t)>=0,qd=window.MQ.indexOf(m.t)>=0,rec=isRecycled(m.t);var btn=ready?'<span class="mbtn play" onclick="playMovie('+m.i+')">\\u25b6 Play</span>':reqd?'<span class="mbtn syncing">\\u23f3 Sync</span>':'<span class="mbtn req" onclick="movRequest('+m.i+')">\\u2601 Request</span>';return '<div class="cfinfo"><div class="cfd-title2">'+esc(m.t)+'</div><div class="cfd-meta">'+(m.c?esc(m.c)+' \\u00b7 ':'')+m.r+'m \\u00b7 <span style="color:#f6c945">'+mStars(m.s)+'</span></div><div class="cfd-desc">'+esc(m.d)+'</div><div class="cfd-btns">'+btn+'<span class="mbtn'+(qd?' on':'')+'" onclick="mQ('+m.i+')">'+(qd?'\\u2713 Queued':'+ Queue')+'</span>'+(m.c?'<span class="mbtn" onclick="mQSeries(\\''+m.c+'\\')">Series</span>':'')+'<span class="mbtn rec'+(rec?' on':'')+'" title="Queue for recycling" onclick="cfRecycleMovie('+m.i+')">'+(rec?'\\u267b In bin':'\\u267b Recycle')+'</span>'+(S.me.isAdmin?'<span class="nuke" onclick="destroyMovie('+m.i+')">\\uD83D\\uDCA3</span>':'')+'</div></div>';}
function cfClick(ev,i){if(ev.target.closest('.mbtn')||ev.target.closest('.nuke'))return;var c=window.__cfi||0;if(i!==c){cfGo(i);return;}var card=ev.currentTarget;if(card.classList.contains('hascover'))card.classList.toggle('flipped');}
function cfStatus(m){var ready=(S.movieReady||[]).indexOf(movSlug(m.t))>=0,qd=window.MQ.indexOf(m.t)>=0,reqd=(S.movieReq||[]).indexOf(m.t)>=0;if(ready)return '<span class="st-play">\\u25b6 Playable</span>';if(qd)return '<span class="st-queue">\\u2713 In Queue</span>';if(reqd)return '<span class="st-sync">\\u23f3 Syncing</span>';return '<span class="st-add">+ Queue</span>';}
function cfFields(kind){if(kind==='music')return [['album','Album'],['title','Title'],['artist','Artist'],['year','Year'],['genre','Genre'],['tracks','Tracks']];if(kind==='photo'||kind==='video')return [['title','Caption'],['people','People'],['place','Place']];if(kind==='radio')return [['title','Station'],['genre','Genre']];return [['title','Title'],['series','Series'],['stars','Stars'],['runtime','Runtime'],['year','Year'],['genre','Genre'],['desc','Description']];}
function cfCurSort(kind){var f=cfFields(kind),keys=f.map(function(x){return x[0];}),c=window.__cfsort;if(keys.indexOf(c)<0){c=keys[0];window.__cfsort=c;}return c;}
function cfFieldVal(m,k){if(k==='title')return m.t||m.name||m.title||m.caption||m.n||'';if(k==='people')return (m.people||'—');if(k==='place')return (m.place||'—');if(k==='album')return m.name||(m.c||'\\u2014');if(k==='series')return m.c||'\\u2014';if(k==='runtime')return (m.r?m.r+'m':'\\u2014');if(k==='stars')return (m.s!=null?mStars(m.s):'\\u2014');if(k==='year')return (m.y||'\\u2014');if(k==='genre')return (m.g||'\\u2014');if(k==='artist')return (m.artist||'\\u2014');if(k==='tracks')return (m.songs?m.songs.length+' tracks':'\\u2014');if(k==='desc')return (m.d?(m.d.length>40?m.d.slice(0,40)+'\\u2026':m.d):'\\u2014');return '';}
function cfSortKey(m,k){if(k==='runtime')return m.r||0;if(k==='stars')return m.s||0;if(k==='tracks')return (m.songs?m.songs.length:0);if(k==='year')return +(m.y||0);return String(cfFieldVal(m,k)).toLowerCase();}
function cfSortList(list,kind){var k=cfCurSort(kind);var a=list.slice();a.sort(function(x,y){var xa=cfSortKey(x,k),ya=cfSortKey(y,k);if(xa<ya)return -1;if(xa>ya)return 1;return 0;});return a;}
function reelBar(kind){var f=cfFields(kind),cur=cfCurSort(kind);var opts=f.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===cur?' selected':'')+'>'+o[1]+'</option>';}).join('');return '<div class="reelbar"><label class="rb-l">Filter:</label><select class="rb-sel" onchange="cfSetSort(this.value)">'+opts+'</select><div class="rb-spring"><span class="rb-cap">\\u00ab</span><input type="range" class="rb-jog" id="rbjog" min="-100" max="100" value="0" oninput="cfJog(this.value)" onmouseup="cfJogRelease()" ontouchend="cfJogRelease()" onblur="cfJogRelease()"><span class="rb-cap">\\u00bb</span></div></div>';}
function cfSetSort(k){window.__cfsort=k;window.__cfi=0;render();}
var __jogT=null;
function cfJog(v){v=+v;clearInterval(__jogT);if(!v){return;}var dir=v>0?1:-1,mag=Math.abs(v),ms=Math.max(45,650-mag*6);__jogT=setInterval(function(){var n=(window.__cflist||[]).length||1;window.__cfi=((window.__cfi||0)+dir+n)%n;cfPaint();},ms);}
function cfJogRelease(){clearInterval(__jogT);__jogT=null;var el=document.getElementById('rbjog');if(el)el.value=0;}
function isRecycled(t){return (S.recycleList||[]).indexOf(t)>=0;}
function cfRecycle(t){var on=!isRecycled(t);if(on&&!confirm('Queue \\u201c'+t+'\\u201d for recycling? It rolls off per your Rotation schedule \\u2014 reversible until then.'))return;fetch('/api/recycle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:t,on:on})}).then(function(){load();});}
function cfRecycleMovie(i){var m=MOVIES[i];if(m)cfRecycle(m.t);}
function cfRecycleAlbum(i){var a=window.__cflist[i];if(a)cfRecycle('Album: '+a.name);}
function buildAlbums(){var map={},order=[];(window.__songs||[]).forEach(function(s){var key=String(s.key||'');var p=key.split('/');var alb=p.length>1?p[0]:'Singles';if(!map[alb]){map[alb]={name:alb,songs:[]};order.push(alb);}map[alb].songs.push({t:s.title,u:'/music/'+encodeURIComponent(key)});});(S.media||[]).filter(function(x){return x.kind==='song';}).forEach(function(x){var alb=(x.people||x.place||'Family');if(!map[alb]){map[alb]={name:alb,songs:[]};order.push(alb);}map[alb].songs.push({t:x.title||x.url,u:x.url});});order.sort();return order.map(function(k){return map[k];});}
function musicReel(){var albums=cfSortList(buildAlbums(),'music');window.__cflist=albums;if(typeof window.__cfi!=='number'||window.__cfi>=albums.length)window.__cfi=0;var curU=(typeof dq!=='undefined'&&dqi>=0&&dq[dqi])?dq[dqi].u:null;if(!albums.length)return '<div class="card"><div class="empty">No music yet \\u2014 add songs in Add, or upload your library.</div></div>';var sk=cfCurSort('music');var h=reelBar('music');h+='<div class="cflabels" id="cflabels">';albums.forEach(function(a,i){h+='<div class="cflabel" onclick="cfGo('+i+')"><div class="cfl-title">'+(curU&&a.songs.some(function(s){return s.u===curU;})?'\u266a ':'')+esc(a.name)+'</div><div class="cfl-stat cfl-field">'+esc(String(cfFieldVal(a,sk)))+'</div></div>';});h+='</div><div class="cf"><button class="cfnav cfprev" onclick="cfPrev()">\\u2039</button><div class="cfstage" id="cfstage">';albums.forEach(function(a,i){var hue=mHue(a.name);var init=a.name.replace(/^The /,"").split(/[ :]/).filter(Boolean).slice(0,2).map(function(w){return w.charAt(0);}).join("").toUpperCase();var rec=isRecycled('Album: '+a.name);h+='<div class="cfc'+(rec?' recycled':'')+'" onclick="cfClick(event,'+i+')"><div class="cfflip"><div class="cffront"><div class="cfposter" style="background:linear-gradient(150deg,hsl('+hue+',46%,30%),hsl('+((hue+40)%360)+',52%,15%))"><span class="cfinit">'+esc(init||"\\u266a")+'</span></div><div class="cfinfo"><div class="cfd-title2">'+esc(a.name)+'</div><div class="cfd-meta">'+a.songs.length+' tracks</div><div class="cfd-btns"><span class="mbtn play" onclick="playAlbum('+i+')">\\u25b6 Play</span><span class="mbtn" onclick="queueAlbum('+i+')">+ Queue</span><span class="mbtn rec'+(rec?' on':'')+'" title="Queue for recycling" onclick="cfRecycleAlbum('+i+')">'+(rec?'\\u267b In bin':'\\u267b Recycle')+'</span></div></div></div></div></div>';});h+='</div><button class="cfnav cfnext" onclick="cfNext()">\\u203a</button></div>';setTimeout(cfPaint,30);return h;}
function mediaNowLong(){var dk=document.getElementById('dock');if(window.__movieMode){var v=document.getElementById('dscreen');if(v&&v.duration&&isFinite(v.duration)){var rem=v.duration-v.currentTime;return v.duration>180&&rem>Math.max(60,v.duration*0.1);}return true;}if(typeof dplaying!=='undefined'&&dplaying&&dqi>=0&&dq[dqi]&&dk&&dk.duration&&isFinite(dk.duration)){var r2=dk.duration-dk.currentTime;return dk.duration>180&&r2>Math.max(60,dk.duration*0.1);}return false;}
function __mmClose(){var m=document.getElementById('mediaModal');if(m)m.remove();}
function mediaConfirm(opts){if(!mediaNowLong()){opts.onGo();return;}var btns='<button class="go" id="__mmgo">Go Now</button>';if(opts.canQueue)btns+=' <button class="mini" id="__mmgoq">Go Now &amp; queue current next</button>';btns+=' <button class="mini" id="__mmcancel">Cancel</button>';var m=document.createElement('div');m.id='mediaModal';m.setAttribute('style','position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:200');m.innerHTML='<div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px 22px;max-width:360px;text-align:center"><div style="font-weight:700;font-size:1.05rem;margin-bottom:6px">Jump out of what is playing?</div><div class="sub" style="margin-bottom:14px">You are partway through something. Open “'+esc(opts.label)+'” now?</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">'+btns+'</div></div>';document.body.appendChild(m);document.getElementById('__mmgo').onclick=function(){__mmClose();opts.onGo();};var gq=document.getElementById('__mmgoq');if(gq)gq.onclick=function(){__mmClose();(opts.onGoQueue||opts.onGo)();};document.getElementById('__mmcancel').onclick=__mmClose;}
function playAlbum(i){var a=window.__cflist[i];if(!a)return;mediaConfirm({label:a.name,canQueue:true,onGo:function(){dq=a.songs.slice();dqi=0;dplay();},onGoQueue:function(){var c=(dqi>=0&&dq[dqi])?dq[dqi]:null;dq=a.songs.slice();if(c)dq.push(c);dqi=0;dplay();}});}
function queueAlbum(i){var a=window.__cflist[i];if(!a)return;a.songs.forEach(function(s){dq.push(s);});if(dqi<0)dqi=0;dRender();dSave();}
function mvSizeBtns(active){return '<button class="mvbtn'+(active==='theater'?' on':'')+'" title="Theater" onclick="mvSize(\\'theater\\')">\\u25ad</button><button class="mvbtn'+(active==='mini'?' on':'')+'" title="Mini (keep browsing)" onclick="mvSize(\\'mini\\')">\\u25ab</button><button class="mvbtn" title="Full screen" onclick="mvSize(\\'full\\')">\\u26f6</button>';}
function moviePlayerBlock(){var mm=window.__movieMode;setTimeout(mvInit,30);return '<div class="mvmode" id="mvmode"><video id="dscreen" class="mvvideo" src="/movie/'+mm.slug+'.mp4" controls autoplay playsinline></video><div class="mvbar" id="mvbar"><span class="mvtitle">'+esc(mm.title)+'</span><span class="mvspacer"></span>'+mvSizeBtns('theater')+'<button class="mvbtn" onclick="mvExit()">\\u2715 Close</button></div></div>';}
function miniPlayer(){var mm=window.__movieMode;setTimeout(mvInit,30);return '<div class="mvmini" id="mvmode"><video id="dscreen" class="mvmini-v" src="/movie/'+mm.slug+'.mp4" controls autoplay playsinline></video><div class="mvmini-bar"><span class="mvmini-t">'+esc(mm.title)+'</span><span class="mvspacer"></span>'+mvSizeBtns('mini')+'<button class="mvbtn sm" onclick="mvExit()">\\u2715</button></div></div>';}
function mvInit(){var v=document.getElementById('dscreen');if(v&&window.__mvT){try{v.currentTime=window.__mvT;}catch(e){}}var box=document.getElementById('mvmode'),bar=document.getElementById('mvbar');if(box&&bar){var t;function show(){bar.classList.remove('hide');clearTimeout(t);t=setTimeout(function(){bar.classList.add('hide');},3000);}box.onmousemove=show;box.onmouseleave=function(){bar.classList.add('hide');};show();}}
function mvSize(s){var v=document.getElementById('dscreen');if(s==='full'){if(v&&v.requestFullscreen)v.requestFullscreen().catch(function(){});return;}if(v)window.__mvT=v.currentTime||0;window.__mvSize=s;if(window.__movieMode)window.__movieMode.size=s;render();}
function mvExit(){var v=document.getElementById('dscreen');if(v){try{v.pause();}catch(e){}}window.__movieMode=null;if(window.__djResume){var dk=document.getElementById('dock');if(dk){dk.play().catch(function(){});if(typeof dstartPlay==='function')dstartPlay();}window.__djResume=false;}render();}
function mQ(i){var t=MOVIES[i].t;var p=window.MQ.indexOf(t);if(p>=0)window.MQ.splice(p,1);else window.MQ.push(t);mSave();render();}
function mUnq(i){window.MQ.splice(i,1);mSave();render();}
function mClr(){if(window.MQ.length&&!confirm("Clear the whole Up Next queue?"))return;window.MQ=[];mSave();render();}
function mQSeries(col){MOVIES.forEach(function(m){if(m.c===col&&window.MQ.indexOf(m.t)<0)window.MQ.push(m.t);});mSave();render();}
function mQNext(col){var eps=MOVIES.filter(function(m){return m.c===col;}).sort(function(a,b){return (a.o||0)-(b.o||0);});for(var k=0;k<eps.length;k++){if(window.MQ.indexOf(eps[k].t)<0){window.MQ.push(eps[k].t);break;}}mSave();render();}
function mLive(){var dz=(S.destroyedMovies||[]);return MOVIES.filter(function(m){return dz.indexOf(m.t)<0;});}
function mSave(){try{fetch('/api/movie/queue',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:window.MQ})});}catch(e){}}
function mShuffle(){if(window.MQ.length&&!confirm('Replace the Up Next queue with a fresh shuffle?'))return;var a=mLive().slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}var cap=(window.ROT&&window.ROT.cap)||12;window.MQ=a.slice(0,cap).map(function(m){return m.t;});mSave();render();}
function mQueueAll(){if(window.MQ.length&&!confirm('Replace the Up Next queue with every title?'))return;window.MQ=mLive().map(function(m){return m.t;});mSave();render();}
function mSurprise(){var pool=mLive().filter(function(m){return window.MQ.indexOf(m.t)<0;});if(!pool.length){alert('Everything is already queued.');return;}window.MQ.push(pool[Math.floor(Math.random()*pool.length)].t);mSave();render();}
function movSlug(t){return String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
function movRequest(i){var m=MOVIES[i];if(!m)return;post('/api/movie/request',{title:m.t});}
function playRadio(i){var r=RADIOS[i];if(!r)return;mediaConfirm({label:r.n,canQueue:false,onGo:function(){dq=[{t:'\\uD83D\\uDCFB '+r.n,u:r.u}];dqi=0;dplay();}});}
function mSyncQueue(){if(!window.MQ.length){alert('Up Next is empty - queue some movies first.');return;}window.MQ.forEach(function(t){fetch('/api/movie/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:t})});});setTimeout(load,600);}
function playMovie(i){var m=MOVIES[i];if(!m)return;mediaConfirm({label:m.t,canQueue:false,onGo:function(){_playMovie(i);}});}
function _playMovie(i){var m=MOVIES[i];if(!m)return;try{var dk=document.getElementById('dock');if(dk&&!dk.paused){window.__djResume=true;dk.pause();if(typeof dstop==='function')dstop();}else window.__djResume=false;}catch(e){}window.__mvT=0;window.__movieMode={slug:movSlug(m.t),title:m.t,size:(window.__mvSize||'theater')};if(cur!=='dj'||window.__lib!=='movies'){window.__lib='movies';show('dj');}else{render();}fetch('/api/movie/watched',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:m.t})});}
function qLink(o){if(!o.u)return o.at?('<span class="qsrc">'+esc(o.at)+'</span>'):'';return '<a class="qsrc" href="'+esc(o.u)+'" target="_blank" rel="noopener noreferrer">'+(o.at?esc(o.at):'see more')+' \\u2197</a>';}
function quotesView(){var Q=(S.quotes&&S.quotes.quotes)?S.quotes.quotes:[];var F=(S.quotes&&S.quotes.favs)?S.quotes.favs:{};var P=(S.quotes&&S.quotes.pending)?S.quotes.pending:[];
var h='<div class="vhead"><h2>\\uD83D\\uDCAC Quotes</h2><span class="stamp">\\u2713 Published Jun 11 2026 \\u00b7 v1.0</span><span style="color:var(--dim);font-size:.8rem;margin-left:auto">'+Q.length+' in rotation</span></div>';
h+='<div class="msub">Family favorites \\u2014 tap a heart to add yours</div><div class="qgrid">';
Q.forEach(function(o){var favs=F[String(o.id)]||[];var mine=favs.indexOf(S.me.name)>=0;h+='<div class="qcard"><div class="qtext">\\u201c'+esc(o.q)+'\\u201d</div><div class="qauth">\\u2014 '+esc(o.a)+'</div><div>'+qLink(o)+'</div>'+(o.s?'<div class="qsub">'+esc(o.s)+'</div>':'')+'<div class="qfoot"><span class="qheart'+(mine?' on':'')+'" onclick="qFav('+o.id+')">'+(mine?'\\u2665':'\\u2661')+' '+favs.length+'</span>'+(favs.length?'<span class="qwho">'+esc(favs.join(', '))+'</span>':'')+(S.me.isRoyal?'<span class="nuke" title="Nuke quote (King/Queen only)" onclick="quoteNuke('+o.id+')">\\uD83D\\uDCA3</span>':'')+'</div></div>';});
h+='</div>';
h+='<div class="card" style="margin-top:18px"><h2 style="font-size:1.05rem">\\u2795 Add a quote</h2><div class="sub">New quotes join the rotation after a King or Queen vets them. For a real person, add a source and a link so we can verify it. Original family lines are welcome too.</div><div class="qform"><textarea id="qq" rows="2" placeholder="The quote"></textarea><input id="qa" placeholder="Who said it (name)"><input id="qat" placeholder="Their claim to fame (e.g. Roman emperor and Stoic)"><input id="qu" placeholder="Link to their page or Wikipedia"><input id="qsrc" placeholder="Source - where the quote is from"><input id="qsb" placeholder="Optional one-line nudge (sub-line)"><button class="go" onclick="qSubmit()">Submit for vetting</button></div></div>';
if(P.length){h+='<div class="card"><h2 style="font-size:1.05rem">\\u23f3 Awaiting vetting <span class="cnt">'+P.length+'</span></h2>';P.forEach(function(it,idx){h+='<div class="qpend"><div><div class="qtext">\\u201c'+esc(it.q)+'\\u201d</div><div class="qauth">\\u2014 '+esc(it.a)+(it.at?' <span class="qsrc">'+esc(it.at)+'</span>':'')+'</div>'+(it.u?'<div class="qwho">link: '+esc(it.u)+'</div>':'')+'<div class="qwho">added by '+esc(it.by)+'</div></div>'+(S.me.isAdmin?'<div class="qpb"><button class="mini ok" onclick="qApprove('+idx+')">Approve</button><button class="mini" onclick="qReject('+idx+')">Reject</button></div>':'<span class="qwho">pending</span>')+'</div>';});h+='</div>';}
return h;}
async function qFav(id){if(id==null)return;await fetch('/api/quote/fav',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id})});await load();heroFavUpd();}
async function qSubmit(){var q=(document.getElementById('qq').value||'').trim(),a=(document.getElementById('qa').value||'').trim();if(!q||!a){alert('Add the quote and who said it.');return;}await fetch('/api/quote/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:q,a:a,at:document.getElementById('qat').value,u:document.getElementById('qu').value,src:document.getElementById('qsrc').value,s:document.getElementById('qsb').value})});await load();}
async function qApprove(i){await fetch('/api/quote/approve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idx:i})});await load();}
async function qReject(i){if(!confirm('Reject and remove this submission?'))return;await fetch('/api/quote/reject',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idx:i})});await load();}
function destroyMovie(i){var m=MOVIES[i];if(!m)return;var why=prompt('RCA \\u2014 why are you destroying "'+m.t+'"? (logged for admins)');if(why===null)return;var w=prompt('Type the word DESTROY to permanently remove "'+m.t+'". A Clemit Log entry will remain.');if(w!=='DESTROY')return;post('/api/destroy',{kind:'movie',title:m.t,label:m.t,reason:why});}
function destroyMediaItem(id){var m=(S.media||[]).filter(function(x){return x.id===id;})[0];var label=m?(m.title||m.caption||m.place||m.url||('item '+id)):('item '+id);var why=prompt('RCA \\u2014 why are you destroying "'+label+'"? (logged for admins)');if(why===null)return;var w=prompt('Type the word DESTROY to permanently remove "'+label+'". A Clemit Log entry will remain.');if(w!=='DESTROY')return;post('/api/destroy',{kind:'media',id:id,label:label,reason:why});}
function logDel(ts){if(!confirm('Remove this line from the Clemit Log?'))return;post('/api/destroylog/delete',{ts:ts});}
function quoteNuke(id){var why=prompt('RCA \\u2014 why nuke this quote? (logged)');if(why===null)return;var w=prompt('Type the word DESTROY to permanently remove this quote.');if(w!=='DESTROY')return;post('/api/quote/destroy',{id:id,reason:why});}
function flagPost(id){post('/api/message/flag',{id:id});}
function dismissReview(id){post('/api/review/dismiss',{id:id});}
function logView(){var L=(S.destroyLog||[]);var h='<div class="vhead"><h2>\\uD83D\\uDCDC Clemit Log</h2><span class="stamp sm">'+(S.me.isOwner?'owner-curated':'read-only')+'</span><span style="color:var(--dim);font-size:.8rem;margin-left:auto">'+L.length+' record(s)</span></div>';
h+='<div class="card"><div class="sub">Permanent record of items destroyed from the site. All family can see this; only Boss can remove a line. Guests cannot see it.</div>';
if(!L.length){h+='<div class="empty">Nothing has been destroyed.</div>';return h+'</div>';}
var cols=[{key:'kind',label:'Type',fmt:function(v){return '<span class="lkind t-'+esc(v)+'">'+esc(v)+'</span>';}},{key:'label',label:'Item'},{key:'by',label:'By'},{key:'ts',label:'When',num:true,fmt:function(v){return new Date(v).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});},raw:function(r){return new Date(r.ts).toISOString();}}];
if(S.me.isAdmin)cols.push({key:'reason',label:'RCA'});
if(S.me.isOwner)cols.push({key:'_act',label:'',sort:false,fmt:function(v,r){return '<button class="mini" onclick="logDel('+r.ts+')">remove</button>';}});
h+=dataTable('clog',cols,L,{search:true,exportName:'clemit-log',sort:'ts',dir:'desc'});
return h+'</div>';}
function audit(kind,label,tag){try{fetch('/api/audit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:kind,label:label,tag:tag})});}catch(e){}}
function viewMedia(id,open){var m=(S.media||[]).filter(function(x){return x.id===id;})[0];if(!m)return;audit('view',m.caption||m.title||m.url,(m.kind==='video'?'Videos':'Pictures')+'/'+(m.place||m.people||'Untagged'));if(open)window.open(m.url);}
window.__auHide=window.__auHide||[];window.__auKind=window.__auKind||{};
function auditView(){var h='<div class="vhead"><h2>\\uD83D\\uDD0D System Audit</h2><span class="stamp sm">visible to all</span><span style="color:var(--dim);font-size:.8rem;margin-left:auto" id="auCount"></span></div>';
h+='<div class="card"><div class="sub">Every meaningful action on the site. Type a tag to hide it at any level \\u2014 e.g. Pictures, or Pictures/San Antonio, or Horns. Delete reasons (RCA) are admin-only and live in the Clemit Log.</div>';
h+='<div class="row"><input id="auHide" placeholder="hide a tag, then Enter" onkeydown="auHideKey(event)"><button class="mini" onclick="auClear()">show all</button></div><div class="auchips" id="auChips"></div>';
h+='<div class="aukinds" id="auKinds"></div>';
h+='<div id="auList" class="aulist"><div class="empty">Loading\\u2026</div></div></div>';setTimeout(auLoad,0);return h;}
function auLoad(){fetch('/api/audit/list').then(function(r){return r.json();}).then(function(rows){window.__audit=rows;auPaint();}).catch(function(){var el=document.getElementById('auList');if(el)el.innerHTML='<div class="empty">Audit unavailable.</div>';});}
function auHideKey(e){if(e.key==='Enter'){var v=e.target.value.trim();if(v&&window.__auHide.indexOf(v)<0)window.__auHide.push(v);e.target.value='';auPaint();}}
function auUnhide(i){window.__auHide.splice(i,1);auPaint();}
function auClear(){window.__auHide=[];window.__auKind={};auPaint();}
function auKindTog(k){window.__auKind[k]=!window.__auKind[k];auPaint();}
function auPaint(){var rows=window.__audit||[];var kinds=['login','play','view','post','upload','delete','error'];
var kc=document.getElementById('auKinds');if(kc)kc.innerHTML=kinds.map(function(k){return '<span class="aukind k-'+k+(window.__auKind[k]?' off':'')+'" onclick="auKindTog(\\''+k+'\\')">'+k+'</span>';}).join('');
var ch=document.getElementById('auChips');if(ch)ch.innerHTML=window.__auHide.length?('hiding: '+window.__auHide.map(function(t,i){return '<span class="auchip" onclick="auUnhide('+i+')">'+esc(t)+' \\u00d7</span>';}).join('')):'';
var hides=window.__auHide.map(function(s){return s.toLowerCase();});
var out=rows.filter(function(r){if(window.__auKind[r.kind])return false;var tag=(r.tag||'').toLowerCase();var segs=tag.split('/');for(var i=0;i<hides.length;i++){var hp=hides[i].split('/').map(function(s){return s.trim();}).filter(Boolean);if(hp.length===1){if(segs.indexOf(hp[0])>=0)return false;}else{if(tag.indexOf(hp.join('/'))>=0)return false;}}return true;});
var cnt=document.getElementById('auCount');if(cnt)cnt.textContent=out.length+' / '+rows.length+' shown';
var lst=document.getElementById('auList');if(!lst)return;if(!out.length){lst.innerHTML='<div class="empty">No matching activity.</div>';return;}
lst.innerHTML=out.map(function(r){return '<div class="aurow"><span class="aukind k-'+esc(r.kind)+'">'+esc(r.kind)+'</span><span class="iname">'+esc(r.label||'')+'</span>'+(r.tag?'<span class="autag">'+esc(r.tag)+'</span>':'')+'<span class="auby">'+esc(r.who||'')+'</span><span class="pd">'+new Date(r.ts).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+'</span></div>';}).join('');}
window.ROT=window.ROT||{cap:15,showPct:false,stOpen:true,rt:[{r:0,m:'Fresh / fair game',n:3,c:'#9aa3b5'},{r:1,m:'Show-to',n:1,c:'#4fc3f7'},{r:2,m:'Kids cartoon',n:2,c:'#81c784'},{r:3,m:"Haven't seen",n:2,c:'#b39ddb'},{r:4,m:'Occasional watch',n:3,c:'#f06292'},{r:5,m:'Classic',n:4,c:'#36c8ff'}],st:[{k:'Music',gb:5.5,c:'#81c784',max:60},{k:'Movies',gb:73.5,c:'#4fc3f7',max:500},{k:'Pictures',gb:3,c:'#ffb74d',max:200}]};
function rotationView(){var R=window.ROT;var h='<div class="rotwrap"><div class="vhead" style="margin-bottom:10px"><h2 style="font-size:1.15rem">\\uD83C\\uDF9b Rotation</h2><span class="stamp sm">\\u2713 Published Jun 11 2026</span></div>';
h+='<div class="rotcard"><div class="rothead">\u{1F3AC} Movie / Song / Picture Rotation <button class="mini" style="margin-left:auto" onclick="rotTog()">'+(R.showPct?'Show count':'Show %')+'</button></div>';
h+='<div class="rotcap"><span style="color:var(--dim);font-size:.85rem">Cap</span><input type="range" min="1" max="60" value="'+R.cap+'" oninput="rotCap(this.value)"><b><span id="rotCapV">'+R.cap+'</span> <span style="font-size:.7rem;color:var(--dim)">movies</span></b></div>';
h+='<div class="rottot" id="rotTot"></div>';
R.rt.forEach(function(o,i){h+='<div class="rotrow"><span class="rotdot" style="background:'+o.c+'"></span><span class="rotlab"><b>'+o.r+'</b> '+o.m+'</span><input type="range" min="0" max="'+R.cap+'" value="'+Math.min(o.n,R.cap)+'" style="accent-color:'+o.c+'" oninput="rotN('+i+',this.value)"><span class="rotout" id="rotO'+i+'"></span></div>';});
h+='</div>';
h+='<div class="rotcard"><div class="rothead rotcoll" onclick="rotStTog()"><span id="rotChev">'+(R.stOpen?'&#9662;':'&#9656;')+'</span> &#128190; Storage</div><div id="rotStBody" style="display:'+(R.stOpen?'block':'none')+'">';
h+='<div class="rotbar" id="rotBar"></div><div class="rottot" id="rotSize"></div>';
R.st.forEach(function(o,i){h+='<div class="rotrow"><span class="rotdot" style="background:'+o.c+'"></span><span class="rotlab"><b>'+o.k+'</b></span><input type="range" min="0" max="'+o.max+'" step="0.5" value="'+o.gb+'" style="accent-color:'+o.c+'" oninput="rotSt('+i+',this.value)"><span class="rotout" id="rotS'+i+'"><b>'+o.gb.toFixed(1)+'</b> GB</span></div>';});
h+='<div class="rotup" id="rotUp"></div></div></div></div>';
setTimeout(rotPaint,0);return h;}
function rotPaint(){var R=window.ROT,sum=0;R.rt.forEach(function(o){sum+=o.n;});R.rt.forEach(function(o,i){var el=document.getElementById('rotO'+i);if(el)el.innerHTML=R.showPct?('<b>'+Math.round(o.n/R.cap*100)+'%</b>'):('<b>'+o.n+'</b> mv');});var open=R.cap-sum,t=document.getElementById('rotTot');if(t)t.innerHTML='Locked <b style="color:var(--txt)">'+sum+'</b> / '+R.cap+' &middot; '+(open>=0?('<b style="color:var(--txt)">'+open+'</b> open (auto-rotate)'):'<b style="color:var(--bad)">'+(-open)+' over cap</b>');var T=0;R.st.forEach(function(o){T+=o.gb;});var scale=Math.max(120,T+110),bar=document.getElementById('rotBar');if(bar){bar.innerHTML='';R.st.forEach(function(o){if(o.gb>0){var s=document.createElement('div');s.className='rotseg';s.style.flex='0 0 '+(o.gb/scale*100)+'%';s.style.background=o.c;s.textContent=(o.gb/scale*100)>=11?o.k:'';bar.appendChild(s);}});var fr=document.createElement('div');fr.className='rotfree';fr.style.left=(10/scale*100)+'%';bar.appendChild(fr);}var cost=function(g){return Math.max(0,g-10)*0.015;},sz=document.getElementById('rotSize');if(sz)sz.innerHTML='Total <b style="color:var(--txt)">'+T.toFixed(1)+' GB</b> &middot; <b style="color:var(--txt)">$'+cost(T).toFixed(2)+'/mo</b> (10 GB free &middot; streaming free)';var up=document.getElementById('rotUp');if(up)up.innerHTML='<div class="rotchip">+50 GB<b>+$'+(cost(T+50)-cost(T)).toFixed(2)+'/mo</b></div><div class="rotchip">+100 GB<b>+$'+(cost(T+100)-cost(T)).toFixed(2)+'/mo</b></div>';}
var _rotSaveT;function rotSave(){clearTimeout(_rotSaveT);_rotSaveT=setTimeout(function(){try{fetch('/api/admin/setting',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'rotation_state',value:JSON.stringify(window.ROT)})});}catch(e){}},600);}
function rotCap(v){window.ROT.cap=+v;window.ROT.rt.forEach(function(o){if(o.n>+v)o.n=+v;});rotSave();render();}
function rotN(i,v){window.ROT.rt[i].n=+v;rotSave();rotPaint();}
function rotTog(){window.ROT.showPct=!window.ROT.showPct;rotSave();render();}
function rotSt(i,v){window.ROT.st[i].gb=+v;var el=document.getElementById('rotS'+i);if(el)el.innerHTML='<b>'+(+v).toFixed(1)+'</b> GB';rotSave();rotPaint();}
function rotStTog(){window.ROT.stOpen=!window.ROT.stOpen;rotSave();render();}
function updatesView(){
var cats=[
 {n:'Community Movies',c:'#4fc3f7',open:1,note:'shared pool',legend:'\\u26055 <b>House Favorites</b> &middot; \\u26054 <b>Must Sees</b> &middot; \\u26053 <b>Haven\\'t Seen Yet</b><br>\\u26052 <b>Kids Cartoons</b> &middot; \\u26051 <b>Show-To</b> &middot; \\u26050 <b>Fresh / Fair Game</b>',items:[['live','Movie Library - 30 titles browsable + queue','Jun 11'],['in','Stream files to R2 (hot shelf)','next'],['in','Convert 9 avi/mkv to mp4 (Mover)','Jun 10'],['out','"300" 10 GB BluRay - swap for 720p','Jun 11']]},
 {n:'Music',c:'#81c784',items:[['live','Radio station (Groove Salad)','Jun 10'],['in','4 GB starter library to clemit-music','Jun 10']]},
 {n:'Site & Features',c:'#b39ddb',items:[['live','Command-center home','Jun 10'],['live','DJ Box + queue','Jun 10'],['live','MyTriton dashboard','Jun 10'],['live','Cameras grid','Jun 10'],['live','Rotation tab + storage planner','Jun 11'],['live','Storage pod','Jun 10'],['live','Updates tab (this)','Jun 11'],['live','Movie Library + queue (stamped)','Jun 11'],['live','Quotes wall + family favorites','Jun 11'],['live','Add-a-quote (vetted) + author links','Jun 11'],['live','Board: draft-safe auto-refresh','Jun 11'],['live','DJ: delete song advances player','Jun 11'],['live','Drop-shadow depth pass','Jun 11'],['in','Mover agent','next']]},
 {n:'Pictures',c:'#ffb74d',items:[['live','clemit-pictures bucket','Jun 11'],['in','Google Photos import','exporting']]},
 {n:'Books',c:'#f06292',items:[['live','clemit-books bucket','Jun 11'],['in','400k-word manuscript','soon']]}
];
var tagn={in:'\\u2b06 queued in',live:'\\u2713 live',out:'\\u2b07 queued out',gone:'\\u2715 removed'};
var h='<div class="pl"><h2 style="margin-bottom:12px">\\uD83D\\uDE80 Updates <span style="font-weight:400;color:var(--dim);font-size:.8rem">- in \\u2b06 &middot; live \\u2713 &middot; out \\u2b07</span></h2>';
cats.forEach(function(cat){h+='<details'+(cat.open?' open':'')+'><summary><span class="chev">\\u25b8</span><span class="pdot" style="background:'+cat.c+'"></span>'+cat.n+(cat.note?' <span class="cnt">'+cat.note+'</span>':'')+'</summary><div class="pbody">';cat.items.forEach(function(it){h+='<div class="pitem"><span class="ptag t-'+it[0]+'">'+tagn[it[0]]+'</span><span>'+esc(it[1])+'</span><span class="pd">'+it[2]+'</span></div>';});if(cat.legend)h+='<div class="plegend">Star ratings:<br>'+cat.legend+'</div>';h+='</div></details>';});
if(S.me.isAdmin){h+='<div class="card" style="margin-top:14px"><h2 style="font-size:1rem;margin-bottom:4px">\\u2b06 Push media to the cloud</h2><div class="sub">Run on your PC (rclone configured). Music is capped to 4 GB.</div><div class="pushcmd"><code id="cmdMusic">rclone copy "D:&#92;Backup&#92;Audio-Video Library&#92;MP3 Library" r2:clemit-music --max-transfer 4G --transfers 16 --progress</code><button class="mini" onclick="pushCopy(\\'cmdMusic\\')">Copy cmd</button></div></div>';}
return h+'</div>';}
function pushCopy(id){var t=document.getElementById(id).textContent;if(navigator.clipboard)navigator.clipboard.writeText(t);if(window.event&&window.event.target){var b=window.event.target,o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o;},1200);}}
function controlView(){if(!(S.me.isAdmin||S.me.isRoyal))return '<div class="card"><div class="empty">Control Panel is for admins.</div></div>';var h='<div class="vhead"><h2>🎛 Control Panel</h2><span class="stamp sm">admins</span></div>';h+='<div class="sub" style="margin-bottom:10px">One place to run the site. Member list + lists still live in ⚙ Settings.</div>';h+='<div class="card"><h2 style="font-size:1rem">Site toggles</h2><div class="sub">Quick switches for the whole site.</div><p style="margin-top:8px">Guest grocery sharing: <b>'+(S.guestShare?'ON':'OFF')+'</b> <button class="mini" onclick="toggleGuest()">'+(S.guestShare?'turn off':'turn on (let guests help shop)')+'</button></p></div>';h+='<div class="card"><h2 style="font-size:1rem">Forum spaces</h2><div class="sub">The boards everyone can post in.</div><div class="catgrid" style="margin-top:8px">';forumCats().forEach(function(c){h+='<div class="catcard"><div class="cic">'+c.ic+'</div><div class="cnm">'+esc(c.name)+'</div><div class="cds">'+esc(c.d)+'</div></div>';});h+='</div></div>';h+=forumPerms();h+='<div class="card"><h2 style="font-size:1rem">People</h2><div class="sub">'+((S.users||S.members||[]).length)+' member(s). Full member management lives in Settings.</div><button class="mini" onclick="show(\\'admin\\')">Open ⚙ Settings → members</button></div>';return h;}
function ucfgKey(){return 'ucfg:'+((S.me&&S.me.email)||'anon');}
function ucfg(){try{return JSON.parse(localStorage.getItem(ucfgKey())||'{}');}catch(e){return {};}}
function ucfgSet(patch){var c=ucfg();for(var k in patch)c[k]=patch[k];try{localStorage.setItem(ucfgKey(),JSON.stringify(c));}catch(e){}return c;}
function themeSet(hex,save){if(!/^#[0-9a-fA-F]{6}$/.test(hex))return;var h=hex.replace('#','');var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);var br=function(x){return Math.round(x+(255-x)*0.5);};var rt=document.documentElement.style;rt.setProperty('--acc',hex);rt.setProperty('--acc-bright','rgb('+br(r)+','+br(g)+','+br(b)+')');rt.setProperty('--acc-glow','rgba('+r+','+g+','+b+',.55)');var sw=document.getElementById('themeSw');if(sw)sw.value=hex;if(save)ucfgSet({themeColor:hex});}
/* SINGLE ENTRY SCREEN (#pulseEntry) for ALL hosts - the ONLY splash/gate in the app. Do NOT add a separate portal or splash anywhere; a second copy is what caused the recurring two-gate problem. */
function lpFeatureList(){return [["Library coverflow v6","2h","dj"],["Movie queue on mobile","1d","dj"],["New hero skins","1d","home"],["Email + SMS reminders","2d","admin"]];}
function hidePulseEntry(){var d=document.getElementById('pulseEntry');if(d&&d.parentNode)d.parentNode.removeChild(d);}
function lpExitEntry(sp){if(!sp||sp.__exit)return;sp.__exit=1;var cov=document.createElement('div');cov.style.cssText='position:absolute;inset:0;z-index:50;background:#000;opacity:0;transition:opacity .4s ease;pointer-events:none;';sp.appendChild(cov);requestAnimationFrame(function(){cov.style.opacity='1';});var t0=Date.now();function ready(){var bv=document.getElementById('bootveil');return !bv||bv.__g;}function go(){if(!document.getElementById('pulseEntry'))return;if(ready()||Date.now()-t0>8000){sp.style.transition='opacity .5s ease';sp.style.opacity='0';setTimeout(hidePulseEntry,540);}else{setTimeout(go,80);}}setTimeout(go,420);}
function __pulseEntryEl(o){
 o=o||{};
 if(document.getElementById('pulseEntry'))return null;
 var guest=!!o.guest;
 var nm=(typeof esc==='function')?esc((S&&S.me&&S.me.name)||'guest'):((S&&S.me&&S.me.name)||'guest');
 var isAdm=!!(S&&S.me&&(S.me.isAdmin||S.me.isOwner))&&!guest;
 var bn=(S&&S.gateBanner)?String(S.gateBanner):'';
 var P0='#ff2d55';
 var label=guest?'REQUEST ACCESS':'ENTER';
 var lead=guest?('Signed in as <b style="color:#ff8aa0">'+nm+'</b>. Request access and a family admin will wave you in.'):('Welcome back, <b style="color:#ff8aa0">'+nm+'</b>. Tap to enter.');
 var d=document.createElement('div');
 d.id='pulseEntry';
 d.style.cssText='position:fixed;inset:0;z-index:3000;overflow:hidden;background:#040003;';
 var st='<style>'
 +'@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap");'
 +'#pulseEntry{font-family:inherit;}'
 +'@keyframes lpNebA{0%{transform:rotate(0) scale(1.1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1.1)}}'
 +'@keyframes lpNebB{0%{transform:rotate(360deg) scale(1.22)}50%{transform:rotate(180deg) scale(1.02)}100%{transform:rotate(0) scale(1.22)}}'
 +'@keyframes lpGlow{0%,100%{opacity:.8}50%{opacity:1}}'
 +'@keyframes lpShine{0%{left:-50%}100%{left:150%}}'
 +'#pulseEntry .lpsld{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}'
 +'#pulseEntry .lpsld::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:var(--lpthumb,#ff2d55);box-shadow:0 0 8px var(--lpthumb,#ff2d55);cursor:pointer;}'
 +'#pulseEntry .lpttl{font-family:"Cinzel",Georgia,serif;}'
 +'#pulseEntry .lpC{color:#ffd2d8;font-size:clamp(18px,3.2vw,30px);font-weight:600;letter-spacing:16px;padding-left:16px;text-shadow:0 0 16px rgba(255,45,85,.5),0 7px 13px rgba(0,0,0,.6);}'
 +'#pulseEntry .lpP{font-size:clamp(3.6rem,13vw,8rem);font-weight:500;letter-spacing:2px;line-height:1.02;margin-top:2px;text-shadow:0 0 20px rgba(255,45,85,.6),0 8px 15px rgba(0,0,0,.6);}'
 +'#pulseEntry .lpUp{position:relative;display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:4px;opacity:0;}'
 +'#pulseEntry .lpUp.lk{cursor:pointer;}#pulseEntry .lpUp.lk:hover{background:rgba(255,45,85,.14);}'
 +'#pulseEntry .lpbr{position:absolute;width:24px;height:24px;border-color:rgba(255,45,85,.4);z-index:6;}'
 +'#pulseEntry .lpx{cursor:pointer;font-size:16px;line-height:1;color:#c98a96;transition:.15s;}#pulseEntry .lpx:hover{color:#ff5a74;}'
 +'#pulseEntry .lpctl{color:#ff8a9c;font-size:.72rem;font-family:ui-monospace,Consolas,monospace;letter-spacing:1px;}'
 +'</style>';
 var bannerHtml=bn?('<div id="lpBanner" style="max-width:560px;margin:0 auto 14px;background:rgba(52,230,255,.08);border:1px solid rgba(52,230,255,.45);border-radius:8px;padding:11px 16px;color:#cdeffb;font-size:13px;line-height:1.5;text-align:center">'+bn+'</div>'):'';
 var H=st
 +'<div id="lpNebA" style="position:absolute;inset:-30%;z-index:0;filter:blur(60px) saturate(135%);animation:lpNebA 18s linear infinite;"></div>'
 +'<div id="lpNebB" style="position:absolute;inset:-30%;z-index:0;filter:blur(70px) saturate(128%);mix-blend-mode:screen;opacity:.92;animation:lpNebB 24s linear infinite;"></div>'
 +'<div id="lpBox" style="position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:2;padding:26px 60px;border-radius:12px;background:rgba(12,3,6,.7);border:1px solid rgba(255,45,85,.32);backdrop-filter:blur(4px);box-shadow:0 12px 34px rgba(0,0,0,.55);text-align:center;">'
 +'<div class="lpttl lpC" style="visibility:hidden">CLEMIT</div><div class="lpttl lpP" style="visibility:hidden;color:#ff2d55">PULSE</div></div>'
 +'<canvas id="lpEkg" style="position:absolute;left:0;top:47%;width:100%;height:300px;transform:translateY(-50%);z-index:3;"></canvas>'
 +'<div id="lpSpot" style="position:absolute;left:50%;top:41%;width:440px;max-width:78%;height:250px;z-index:3;pointer-events:none;mix-blend-mode:screen;opacity:.36;transform:translate(-50%,-50%);"></div>'
 +'<div id="lpTitle" style="position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:4;text-align:center;pointer-events:none;will-change:transform;">'
 +'<div id="lpClemit" class="lpttl lpC" style="animation:lpGlow 3.4s ease-in-out infinite;pointer-events:auto;cursor:pointer;" title="Click for my heartbeat (WPW)">CLEMIT</div>'
 +'<div id="lpBig" class="lpttl lpP" style="color:#ff2d55">PULSE</div></div>'
 +'<div id="lpBeatMsg" style="position:absolute;left:50%;top:54%;transform:translateX(-50%);z-index:4;color:#ffb3c0;font-size:12px;letter-spacing:2px;font-family:ui-monospace,Consolas,monospace;opacity:0;transition:opacity .4s;pointer-events:none;">steady - 2 beats</div>'
 +'<div style="position:absolute;left:50%;top:63%;transform:translateX(-50%);z-index:4;width:380px;max-width:90vw;text-align:center;">'
 +bannerHtml
 +'<div id="lpLead" style="color:#b78d98;font-size:12px;margin-bottom:13px;line-height:1.5">'+lead+'</div>'
 +'<button id="lpEnter" style="width:100%;max-width:380px;padding:13px 18px;border-radius:6px;font-weight:600;font-size:.9rem;letter-spacing:4px;cursor:pointer;background:rgba(10,3,6,.55);color:#ff5a74;border:1px solid rgba(255,45,85,.5);font-family:ui-monospace,Consolas,monospace;transition:.2s;box-shadow:0 12px 26px rgba(0,0,0,.62),0 0 14px rgba(255,45,85,.22);">'+label+'</button>'
 +'<div id="lpMsg" style="color:#7fd6e8;font-size:11px;margin-top:10px;min-height:14px"></div>'
 +'</div>'
 +'<div class="lpbr" style="top:13px;left:13px;border-top:1px solid;border-left:1px solid;"></div>'
 +'<div class="lpbr" style="top:13px;right:13px;border-top:1px solid;border-right:1px solid;"></div>'
 +'<div class="lpbr" style="bottom:13px;left:13px;border-bottom:1px solid;border-left:1px solid;"></div>'
 +'<div class="lpbr" style="bottom:13px;right:13px;border-bottom:1px solid;border-right:1px solid;"></div>'
 +'<div style="position:absolute;top:0;left:0;right:0;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:6;">'
 +'<div style="font-size:12px;letter-spacing:3px;font-family:ui-monospace,Consolas,monospace;"><span id="lpBr" style="color:#ff2d55;">&lt;/&gt;</span> <span style="color:#b89aa0;">CLEMIT</span> <span id="lpCk" style="color:#ff2d55;">PULSE</span></div>'
 +'<div style="display:flex;align-items:center;gap:13px;">'+(isAdm?'<a id="lpEdit" href="#" style="color:#5af0ff;font-size:9px;letter-spacing:1px;text-decoration:none;">EDIT BANNER</a>':'')+'<span id="lpClock" style="color:#8a6068;font-size:11px;font-family:ui-monospace,Consolas,monospace;"></span>'
 +'<input type="range" min="0" max="360" id="lpHue" class="lpsld" style="width:150px;background:linear-gradient(to right,hsl(0,90%,45%),hsl(330,90%,50%),hsl(280,80%,50%),hsl(190,90%,50%),hsl(120,70%,45%),hsl(40,90%,50%),hsl(0,90%,45%));" aria-label="Pick your PULSE color"></div></div>'
 +'<div id="lpExcite" style="position:absolute;right:24px;top:52px;z-index:6;display:flex;flex-direction:column;align-items:flex-end;gap:4px;">'
 +'<input type="range" min="0" max="100" id="lpEx" class="lpsld" style="width:150px;flex:0 0 auto;height:3px;padding:0;" value="35" aria-label="EKG speed and intensity"><span class="lpctl">Are you excitable?</span></div>'
 +'<div id="lpFeat" style="position:absolute;left:18px;bottom:18px;width:240px;z-index:6;background:rgba(12,3,6,.82);border:1px solid rgba(255,45,85,.42);border-radius:9px;padding:11px 12px;backdrop-filter:blur(5px);box-shadow:0 10px 28px rgba(0,0,0,.6);opacity:0;transform-origin:bottom left;overflow:hidden;">'
 +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="color:#ffd27a;font-size:14px;">&#10022;</span>'
 +'<span class="lpttl" style="color:#ffe0b4;font-size:12px;letter-spacing:1px;font-weight:600;flex:1;">New Pulse Features Inside!</span>'
 +'<span id="lpClose" class="lpx" title="Close">&#215;</span></div>'
 +lpFeatureList().map(function(it){return '<div class="lpUp'+(guest?'':' lk')+'" data-v="'+it[2]+'"><span style="color:#ff5a74;font-size:9px;">&#10022;</span><span style="color:#d9b0b8;font-size:11.5px;flex:1;">'+it[0]+'</span><span style="color:#7a545c;font-size:9.5px;font-family:ui-monospace,Consolas,monospace;">'+it[1]+'</span></div>';}).join('')
 +'</div>'
 +'<div id="lpReopen" class="lpctl" style="position:absolute;left:20px;bottom:20px;z-index:6;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .3s;">&#8635; replay</div>'
 +'<canvas id="lpFx" style="position:absolute;inset:0;z-index:7;pointer-events:none;"></canvas>';
 d.innerHTML=H;
 document.body.appendChild(d);
 function $(i){return document.getElementById(i);}
 var en=$('lpEnter');
 if(en){
  en.addEventListener('mouseenter',function(){en.style.background='rgba(255,45,85,.14)';});
  en.addEventListener('mouseleave',function(){en.style.background='rgba(10,3,6,.55)';});
  if(guest){
   en.addEventListener('click',function(){en.disabled=true;en.textContent='SENDING...';fetch('/api/access-request',{method:'POST'}).then(function(r){return r.json();}).then(function(){en.textContent='REQUEST SENT';var m=$('lpMsg');if(m)m.textContent='We will wave you in soon. You can close this tab.';}).catch(function(){en.disabled=false;en.textContent='REQUEST ACCESS';var m=$('lpMsg');if(m)m.textContent='Could not send - try again, or message Jesse.';});});
  } else {
   en.addEventListener('click',function(){window.__gatePassed=true;lpExitEntry(d);});
  }
 }
 if(!guest){var rws=d.querySelectorAll('.lpUp.lk');for(var ri=0;ri<rws.length;ri++){(function(row){row.addEventListener('click',function(){var v=row.getAttribute('data-v');window.__gatePassed=true;try{if(typeof show==='function')show(v);}catch(e){}lpExitEntry(d);});})(rws[ri]);}}
 var ed=$('lpEdit');
 if(ed)ed.addEventListener('click',function(e){e.preventDefault();var cur=(S&&S.gateBanner)?String(S.gateBanner):'';var t=prompt('Gate banner (HTML allowed; blank to clear):',cur);if(t===null)return;fetch('/api/admin/setting',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'gate_banner',value:t})}).then(function(){if(S)S.gateBanner=t;hidePulseEntry();__pulseEntryEl({guest:false});}).catch(function(){alert('Could not save banner.');});});
 try{__pulseEntryEngine(d,P0);}catch(e){}
 return d;
}
function __pulseEntryEngine(scr,P0){
 function $(i){return document.getElementById(i);}
 function alive(){return !!document.getElementById('pulseEntry');}
 function hx2rgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
 var PRGB=hx2rgb(P0),box=$('lpBox'),spot=$('lpSpot'),title=$('lpTitle');
 function setColor(hex){PRGB=hx2rgb(hex);var p=PRGB.join(',');
  var big=$('lpBig');if(big){big.style.color=hex;big.style.textShadow='0 0 20px rgba('+p+',.6),0 8px 15px rgba(0,0,0,.6)';}
  var en=$('lpEnter');if(en){en.style.color=hex;en.style.borderColor='rgba('+p+',.55)';}
  if($('lpBr'))$('lpBr').style.color=hex;if($('lpCk'))$('lpCk').style.color=hex;
  document.documentElement.style.setProperty('--lpthumb',hex);
  var ex=$('lpEx');if(ex)ex.style.background='linear-gradient(to right,rgba('+p+',.22),rgb('+p+'))';
  function dk(f){return 'rgba('+Math.round(PRGB[0]*f)+','+Math.round(PRGB[1]*f)+','+Math.round(PRGB[2]*f)+',';}
  if($('lpNebA'))$('lpNebA').style.background='radial-gradient(38% 34% at 26% 30%,'+dk(.5)+'.62),transparent 70%),radial-gradient(38% 34% at 74% 40%,'+dk(.26)+'.7),transparent 70%),radial-gradient(38% 34% at 52% 76%,'+dk(.62)+'.5),transparent 70%)';
  if($('lpNebB'))$('lpNebB').style.background='radial-gradient(38% 34% at 70% 24%,'+dk(.42)+'.6),transparent 70%),radial-gradient(38% 34% at 22% 64%,'+dk(.2)+'.72),transparent 70%),radial-gradient(38% 34% at 60% 60%,'+dk(.55)+'.45),transparent 70%)';
  if(spot)spot.style.background='radial-gradient(46% 56% at 50% 36%,rgba('+p+',.72),rgba('+p+',.18) 52%,transparent 70%),radial-gradient(66% 26% at 50% 86%,rgba('+p+',.5),transparent 74%)';
  if(typeof themeSet==='function')themeSet(hex,true);window.__lpc=hex;}
 var hu=$('lpHue');if(hu){hu.value=(typeof lsHexToHue==='function')?lsHexToHue(P0):348;}setColor(P0);
 if(hu)hu.addEventListener('input',function(){setColor(lsHslToHex(hu.value,82,57));});
 function clock(){var el=$('lpClock');if(el)el.textContent=new Date().toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}).toUpperCase();}clock();var ci=setInterval(function(){if(!alive()){clearInterval(ci);return;}clock();},15000);
 var EXC=0.35,PERIOD=1800,AMP=1,BR=1;function recompute(){PERIOD=4000*Math.pow(0.1,EXC);AMP=0.5+EXC*1.2;BR=0.6+EXC*1.6;}recompute();
 if($('lpEx'))$('lpEx').addEventListener('input',function(){EXC=this.value/100;recompute();});
 var cv=$('lpEkg'),ctx=cv.getContext('2d'),dpr=window.devicePixelRatio||1,W=0,EH=300,baseY=150;
 function rsz(){W=scr.offsetWidth;cv.width=W*dpr;cv.height=EH*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}rsz();window.addEventListener('resize',rsz);
 var maxAge,pts=[],headX=0,lastTs=null,spikes=[],pxPrev=0,beat=0,jesse=false,push=0;
 function pickN(){if(!jesse)return 2;var r=Math.random();if(r<0.03)return 5;if(r<0.07)return 4;if(r<0.22)return 3;return 2;}
 function regen(){var n=pickN();spikes=[];var seg=1/(n+1);for(var i=1;i<=n;i++)spikes.push(W*(seg*i+(Math.random()-.5)*seg*0.35));}regen();
 function bxb(){var l=box.offsetLeft,r=l+box.offsetWidth;return [l,r];}
 function boost(x){var b=bxb();if(x>=b[0]&&x<=b[1]){var t=(x-b[0])/(b[1]-b[0]);return 1+0.45*Math.sin(Math.PI*t);}return 1;}
 function bs(d2){if(d2<-34||d2>34)return 0;var e=Math.exp;var s=6*e(-Math.pow((d2+18)/3.5,2))-11*e(-Math.pow((d2+4)/1.7,2))+34*e(-Math.pow(d2/2.1,2))-15*e(-Math.pow((d2-4)/2,2))+12*e(-Math.pow((d2-13)/4.6,2));if(jesse)s+=15*e(-Math.pow((d2+5)/4.2,2));return s;}
 function wave(x){var s=0;for(var i=0;i<spikes.length;i++)s+=bs(x-spikes[i]);var bo=boost(x);return {y:baseY-s*bo*AMP,b:bo};}
 function ekg(ts){if(!alive())return;if(lastTs===null)lastTs=ts;var dt=ts-lastTs;lastTs=ts;maxAge=PERIOD*0.9;var adv=dt/PERIOD*W;var prev=headX,cur=headX+adv;
  for(var x=prev+2;x<=cur;x+=2){var xx=x;if(xx>=W)xx-=W;var w=wave(xx);pts.push({x:xx,y:w.y,t:ts,b:w.b,wrap:(xx<2)});var dd=xx-pxPrev;if(dd>0&&dd<60){for(var si=0;si<spikes.length;si++){if(pxPrev<spikes[si]&&xx>=spikes[si]){beat=1;if(EXC>0.75)push=Math.min(1.6,push+0.5);break;}}}pxPrev=xx;}
  headX=cur;if(headX>=W){headX-=W;regen();}
  beat*=Math.exp(-dt/200);push*=Math.exp(-dt/720);
  var spS=(1+0.13*EXC)+beat*(0.06+0.24*EXC),spO=Math.min(1,(0.24+0.24*EXC)+beat*(0.5+0.46*EXC));
  if(spot){spot.style.opacity=spO.toFixed(3);spot.style.transform='translate(-50%,-50%) scale('+spS.toFixed(3)+')';}
  if(EXC>0.75){var g=(EXC-0.75)/0.25,base=1+g*0.18;title.style.transform='translate(-50%,-50%) scale('+(base+push*0.30*g).toFixed(3)+','+(base+push*0.16*g).toFixed(3)+')';}else{title.style.transform='translate(-50%,-50%)';}
  var now=ts;while(pts.length&&(now-pts[0].t)>maxAge)pts.shift();
  ctx.clearRect(0,0,W,EH);ctx.strokeStyle='rgba(255,80,110,.09)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,baseY);ctx.lineTo(W,baseY);ctx.stroke();
  ctx.lineCap='round';ctx.lineJoin='round';var ac=window.__lpc||'#ff2d55';var lit=Math.round(85*(1-EXC)),aMul=0.7+0.3*EXC;
  var R=Math.min(255,PRGB[0]+lit),G=Math.min(255,PRGB[1]+lit),B=Math.min(255,PRGB[2]+lit);
  for(var i=1;i<pts.length;i++){var a=pts[i],o=pts[i-1];if(a.wrap||a.x<o.x-40)continue;var age=now-a.t,al=1-age/maxAge;if(al<=0)continue;al=Math.pow(al,0.75);ctx.shadowColor=ac;ctx.shadowBlur=(7*a.b)*(0.7+2.0*EXC);ctx.lineWidth=(1.6+0.8*a.b)*(0.8+1.0*EXC);ctx.strokeStyle='rgba('+R+','+G+','+B+','+Math.min(1,al*aMul*1.05)+')';ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(a.x,a.y);ctx.stroke();}
  if(pts.length){var hd=pts[pts.length-1];ctx.shadowColor=ac;ctx.shadowBlur=16+10*EXC;ctx.fillStyle='#fff0f4';ctx.beginPath();ctx.arc(hd.x,hd.y,3+1.4*EXC,0,6.2832);ctx.fill();}
  requestAnimationFrame(ekg);}
 requestAnimationFrame(ekg);
 var msgT;function flashMsg(t){var m=$('lpBeatMsg');if(!m)return;m.textContent=t;m.style.opacity='1';clearTimeout(msgT);msgT=setTimeout(function(){if($('lpBeatMsg'))$('lpBeatMsg').style.opacity='0';},1600);}
 if($('lpClemit'))$('lpClemit').addEventListener('click',function(){jesse=!jesse;regen();flashMsg(jesse?'♥ Jesse rhythm - WPW':'steady - 2 beats');});
 var fx=$('lpFx'),fc=fx.getContext('2d'),FW=0,FH=0;
 function frsz(){FW=scr.offsetWidth;FH=scr.offsetHeight;fx.width=FW*dpr;fx.height=FH*dpr;fc.setTransform(dpr,0,0,dpr,0,0);}frsz();window.addEventListener('resize',frsz);
 var feat=$('lpFeat'),rows=feat.querySelectorAll('.lpUp'),reopen=$('lpReopen');
 function showReopen(){if(reopen){reopen.style.opacity='1';reopen.style.pointerEvents='auto';}}
 function hideReopen(){if(reopen){reopen.style.opacity='0';reopen.style.pointerEvents='none';}}
 function clamp(v){return v<0?0:v>1?1:v;}function backE(x){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);}
 var runT0=null,running=false,gP=[],bP=[],eP=[],burstDone=false;
 function col(g){return g?[255,217,160]:PRGB;}
 function initRun(){gP=[];for(var i=0;i<64;i++){gP.push({a0:Math.random()*6.283,r0:90+Math.random()*150,sp:(i/64)*1150,g:Math.random()>.45,sz:2+Math.random()*2.6});}bP=[];eP=[];burstDone=false;feat.style.opacity='0';feat.style.transform='scale(.2)';for(var j=0;j<rows.length;j++){rows[j].style.opacity='0';rows[j].style.transform='translateX(-16px)';}}
 function doBurst(){var cx=feat.offsetLeft+feat.offsetWidth/2,cy=feat.offsetTop+feat.offsetHeight*0.4;for(var i=0;i<90;i++){var a=Math.random()*6.283,sp=50+Math.random()*180;bP.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,life:800+Math.random()*1100,born:performance.now(),g:Math.random()>.4,sz:2+Math.random()*3.4});}var sh=document.createElement('span');sh.style.cssText='position:absolute;top:0;left:-50%;width:50%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,228,180,.5),transparent);z-index:1;pointer-events:none;animation:lpShine 1.5s ease 0s 1;';feat.appendChild(sh);setTimeout(function(){if(sh.parentNode)sh.remove();},1600);}
 function run(){if(!alive())return;hideReopen();initRun();runT0=performance.now();running=true;requestAnimationFrame(fxLoop);}
 function fxLoop(ts){if(!alive()||!running)return;var t=ts-runT0;fc.clearRect(0,0,FW,FH);fc.globalCompositeOperation='lighter';
  var cx=feat.offsetLeft+feat.offsetWidth/2,cy=feat.offsetTop+feat.offsetHeight*0.45;
  for(var i=0;i<gP.length;i++){var p=gP[i];if(t<p.sp)continue;var pr=clamp((t-p.sp)/(1450-p.sp));var ang=p.a0+pr*2.6,r=p.r0*(1-pr*pr);var x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;var al=(pr<0.15?pr/0.15:1)*(1-pr*0.15);if(pr>=1)al=0;var c=col(p.g);fc.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+al+')';fc.beginPath();fc.arc(x,y,p.sz,0,6.2832);fc.fill();}
  if(t>=1400&&!burstDone){burstDone=true;doBurst();}
  if(burstDone){var rt=t-1400;if(rt<1000){var rad=18+rt*0.32,ra=1-rt/1000;fc.strokeStyle='rgba(255,228,185,'+(ra*0.85)+')';fc.lineWidth=2.4;fc.beginPath();fc.arc(cx,cy,rad,0,6.2832);fc.stroke();}if(rt<700){var fa=Math.sin(clamp(rt/700)*Math.PI)*0.9;var g=fc.createRadialGradient(cx,cy,0,cx,cy,140);g.addColorStop(0,'rgba(255,236,205,'+fa+')');g.addColorStop(1,'rgba(255,236,205,0)');fc.fillStyle=g;fc.fillRect(cx-150,cy-150,300,300);}}
  for(var j=bP.length-1;j>=0;j--){var b=bP[j];var tt=ts-b.born;if(tt>b.life){bP.splice(j,1);continue;}var s=tt/1000;var bx=b.x+b.vx*s,by=b.y+b.vy*s+60*s*s;var al2=1-tt/b.life;var c2=col(b.g);fc.fillStyle='rgba('+c2[0]+','+c2[1]+','+c2[2]+','+al2+')';fc.beginPath();fc.arc(bx,by,b.sz*al2,0,6.2832);fc.fill();}
  if(t>1500&&t<5000&&Math.random()<0.3){eP.push({x:feat.offsetLeft+Math.random()*feat.offsetWidth,y:feat.offsetTop+feat.offsetHeight,born:ts,life:1400+Math.random()*1200,sz:1+Math.random()*1.8,dx:(Math.random()-.5)*20});}
  for(var k=eP.length-1;k>=0;k--){var e=eP[k];var tt2=ts-e.born;if(tt2>e.life){eP.splice(k,1);continue;}var s2=tt2/1000;var ex2=e.x+e.dx*s2,ey=e.y-40*s2;var ea=(1-tt2/e.life)*0.8;fc.fillStyle='rgba('+PRGB[0]+','+PRGB[1]+','+PRGB[2]+','+ea+')';fc.beginPath();fc.arc(ex2,ey,e.sz,0,6.2832);fc.fill();}
  fc.globalCompositeOperation='source-over';
  var be=backE(clamp((t-1400)/1500));feat.style.opacity=clamp((t-1400)/450);var bl=12*(1-clamp((t-1400)/900));feat.style.filter=bl>0.2?'blur('+bl+'px)':'none';feat.style.transform='scale('+(0.2+0.8*be)+') rotate('+(-12*(1-be))+'deg)';
  var dly=[2500,3050,3600,4150];for(var ri=0;ri<rows.length;ri++){var rp=clamp((t-dly[ri])/500);rows[ri].style.opacity=rp;rows[ri].style.transform='translateX('+(-16*(1-rp))+'px)';}
  if(t>6500&&bP.length===0&&eP.length===0){fc.clearRect(0,0,FW,FH);running=false;return;}requestAnimationFrame(fxLoop);}
 function dismiss(){running=false;fc.clearRect(0,0,FW,FH);var s0=performance.now();function out(ts){if(!alive())return;var p=clamp((ts-s0)/450);feat.style.opacity=(1-p);feat.style.transform='scale('+(1-0.3*p)+') rotate('+(-6*p)+'deg)';if(p<1)requestAnimationFrame(out);else{feat.style.opacity='0';showReopen();}}requestAnimationFrame(out);}
 if($('lpReopen'))$('lpReopen').addEventListener('click',function(){run();});
 if($('lpClose'))$('lpClose').addEventListener('click',function(e){e.stopPropagation();dismiss();});
 setTimeout(function(){if(alive())run();},3000);
}
function showLoginSplash(){try{__pulseEntryEl({guest:false});}catch(e){}}
function pulseGate(mode){
  if(mode==="guest"){var seg=document.getElementById("seg");if(seg){var bs=seg.querySelectorAll("button");for(var i=0;i<bs.length;i++)bs[i].remove();}var r=document.getElementById("role");if(r)r.textContent="guest";}
  try{__pulseEntryEl({guest:(mode==="guest")});}catch(e){}
}
function lsPaintHue(h){var hex=lsHslToHex(h,100,58);lsPaint(hex);}
function lsHslToHex(h,s,l){h=+h;s/=100;l/=100;var a=s*Math.min(l,1-l);function f(n){var k=(n+h/30)%12;var col=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*col).toString(16).padStart(2,'0');}return '#'+f(0)+f(8)+f(4);}
function lsHexToHue(hx){var r=parseInt(hx.slice(1,3),16)/255,g=parseInt(hx.slice(3,5),16)/255,b=parseInt(hx.slice(5,7),16)/255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),dd=mx-mn,h=0;if(dd===0)h=348;else if(mx===r)h=60*(((g-b)/dd)%6);else if(mx===g)h=60*((b-r)/dd+2);else h=60*((r-g)/dd+4);if(h<0)h+=360;return Math.round(h);}
function lsPaint(h){if(!/^#[0-9a-fA-F]{6}$/.test(h))return;if(typeof themeSet==='function')themeSet(h,true);var c=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];var big=document.querySelector('#loginSplash .ls-big'),en=document.querySelector('#loginSplash .ls-enter'),dot=document.querySelector('#loginSplash .ls-live i'),sw=document.getElementById('lsSw');if(big){big.style.color=h;big.style.textShadow='0 0 24px rgba('+c[0]+','+c[1]+','+c[2]+',.85),0 0 4px '+h;}if(en){en.style.background='rgb('+Math.round(c[0]*0.72)+','+Math.round(c[1]*0.72)+','+Math.round(c[2]*0.72)+')';}if(dot){dot.style.background=h;dot.style.boxShadow='0 0 9px '+h;}if(sw){sw.style.background=h;sw.style.boxShadow='0 0 14px '+h;}}
function lsClockTick(){var el=document.getElementById('lsClock');if(!el)return;var dt=new Date();el.textContent=dt.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+', '+dt.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}
function lsEkgStart(){var cv=document.getElementById('lsEkg');if(!cv)return;var ctx=cv.getContext('2d');var dpr=window.devicePixelRatio||1,W=0,H=150,baseY=75;function rs(){W=cv.parentElement.offsetWidth;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}rs();window.addEventListener('resize',rs);var SWEEP=1100,spikes=[];function ns(){var x1=W*0.14+Math.random()*W*0.30,gap=W*(0.24+Math.random()*0.07);spikes=[x1,x1+gap];}ns();var start=null;function od(x){if(x<-12||x>14)return 0;if(x<-4)return 9*((x+12)/8);if(x<0)return 9+(-64)*((x+4)/4);if(x<5)return -55+77*(x/5);return 22+(-22)*((x-5)/9);}function yA(x){var s=0;for(var i=0;i<spikes.length;i++)s+=od(x-spikes[i]);return baseY+s;}function fr(ts){if(!document.getElementById('lsEkg'))return;if(start===null)start=ts;var el=ts-start;if(el>=SWEEP){start=ts;el=0;ns();}var hx=(el/SWEEP)*W;ctx.clearRect(0,0,W,H);ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,80,110,.30)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,baseY);ctx.lineTo(W,baseY);ctx.stroke();var x0=Math.max(0,hx-160);var ac=(ucfg().themeColor)||'#ff3b54';ctx.shadowColor=ac;ctx.shadowBlur=12;ctx.lineWidth=2.6;ctx.lineCap='round';ctx.lineJoin='round';var px=x0,py=yA(x0);for(var x=x0+3;x<=hx;x+=3){var y=yA(x),rt=(x-x0)/(hx-x0||1);ctx.strokeStyle='rgba(255,210,220,'+(0.12+0.88*rt)+')';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();px=x;py=y;}ctx.shadowBlur=16;ctx.fillStyle='#fff0f3';ctx.beginPath();ctx.arc(hx,yA(hx),3.6,0,6.2832);ctx.fill();requestAnimationFrame(fr);}requestAnimationFrame(fr);}
function hideLoginSplash(){var d=document.getElementById('loginSplash');if(d&&d.parentNode)d.parentNode.removeChild(d);}
function splashPref(skip){ucfgSet({skipSplash:!!skip});if(typeof render==='function')render();}
function applyTheme(){var c=(ucfg().themeColor)||(S&&S.themeColor)||'#2f9bff';themeSet(c,false);}

function ucfgReset(){if(!confirm('Reset ALL your personal settings on this device?'))return;try{localStorage.removeItem(ucfgKey());}catch(e){}render();}
function _mtCur(){var c=ucfg();return c.movieTime||{mode:'off',from:'08:00',to:'17:00',ratio:{on:15,of:20}};}
function mtSet(field,val){var mt=_mtCur();mt[field]=val;ucfgSet({movieTime:mt});render();}
function mtRatio(which,val){var mt=_mtCur();mt.ratio=mt.ratio||{on:15,of:20};mt.ratio[which]=Math.max(1,parseInt(val||'0',10)||1);ucfgSet({movieTime:mt});render();}
function myPrefsCard(){var mt=_mtCur();var modes=[['off','Off'],['all-day','All day'],['window','Between hours'],['outside','Outside hours']];var h='<div class="card"><h2>\\u2699 My preferences</h2><div class="sub">Your personal settings on this device. Saved per device for now; cloud sync comes later.</div>';h+=__monikerSection();h+=(window.HS?HS.settingsHtml():"");h+='<h2 style="font-size:.95rem;margin:14px 0 6px">Movie Time schedule</h2><div class="sub">When the movie queue plays for you. The engine that acts on this arrives in a later phase.</div><div class="row" style="margin-top:8px;flex-wrap:wrap">';modes.forEach(function(m){h+='<button class="qbtn'+(mt.mode===m[0]?' on':'')+'" onclick="mtSet(\\'mode\\',\\''+m[0]+'\\')">'+m[1]+'</button>';});h+='</div>';if(mt.mode==='window'||mt.mode==='outside'){h+='<div class="row" style="margin-top:8px;align-items:center;gap:8px"><span class="sub" style="margin:0">From</span><input type="time" value="'+esc(mt.from||'08:00')+'" onchange="mtSet(\\'from\\',this.value)"><span class="sub" style="margin:0">to</span><input type="time" value="'+esc(mt.to||'17:00')+'" onchange="mtSet(\\'to\\',this.value)"></div>';}h+='<div class="row" style="margin-top:10px;align-items:center;gap:8px;flex-wrap:wrap"><span class="sub" style="margin:0">Commercial-break ratio: movie</span><input type="number" min="1" style="width:64px" value="'+(mt.ratio?mt.ratio.on:15)+'" onchange="mtRatio(\\'on\\',this.value)"><span class="sub" style="margin:0">of every</span><input type="number" min="1" style="width:64px" value="'+(mt.ratio?mt.ratio.of:20)+'" onchange="mtRatio(\\'of\\',this.value)"><span class="sub" style="margin:0">minutes</span></div>';var __c=ucfg();var __g=(typeof __c.gate==="boolean")?__c.gate:!!(S.me&&S.me.isOwner);var __i=(typeof __c.idle==="number")?__c.idle:0;h+='<h2 style="font-size:.95rem;margin:14px 0 6px">Screen &amp; login</h2><div class="sub">Saved on this device.</div><div class="row" style="margin-top:8px"><button class="qbtn'+(__g?" on":"")+'" onclick="gatePref(true)">Show login each visit</button><button class="qbtn'+(!__g?" on":"")+'" onclick="gatePref(false)">Go straight in</button></div><div class="sub" style="margin-top:12px">Show the Clemit Pulse splash screen each time you sign in.</div><div class="row" style="margin-top:8px"><button class="qbtn'+(!__c.skipSplash?" on":"")+'" onclick="splashPref(false)">Show splash on sign-in</button><button class="qbtn'+(__c.skipSplash?" on":"")+'" onclick="splashPref(true)">Skip the splash</button></div><div class="sub" style="margin-top:12px">After this idle, the screen dims to a dark PULSE screensaver. Indefinite = Dashboard mode (never sleeps).</div><div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="qbtn'+(__i===5?" on":"")+'" onclick="idlePref(5)">5 min</button><button class="qbtn'+(__i===10?" on":"")+'" onclick="idlePref(10)">10 min</button><button class="qbtn'+(__i===15?" on":"")+'" onclick="idlePref(15)">15 min</button><button class="qbtn'+(__i===30?" on":"")+'" onclick="idlePref(30)">30 min</button><button class="qbtn'+(__i===0?" on":"")+'" onclick="idlePref(0)">Indefinite</button></div>';var __pd=(typeof __c.paradeDelay===\'number\')?__c.paradeDelay:5;h+=\'<h2 style="font-size:.95rem;margin:14px 0 6px">\\uD83C\\uDFAE Arcade Parade</h2><div class="sub">Little pixel characters march across the Library and dive into the Arcade button once you have lingered on the Library this long. Off hides the parade. (After you open the Arcade, it rests until tomorrow.)</div><div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="qbtn\'+(__pd===-1?" on":"")+\'" onclick="paradeDelayPref(-1)">Off</button><button class="qbtn\'+(__pd===1?" on":"")+\'" onclick="paradeDelayPref(1)">1 min</button><button class="qbtn\'+(__pd===2?" on":"")+\'" onclick="paradeDelayPref(2)">2 min</button><button class="qbtn\'+(__pd===5?" on":"")+\'" onclick="paradeDelayPref(5)">5 min</button><button class="qbtn\'+(__pd===10?" on":"")+\'" onclick="paradeDelayPref(10)">10 min</button></div>\';h+='<div class="row" style="margin-top:16px"><button class="qbtn warnb" onclick="ucfgReset()">Reset all my settings</button></div></div>';return h;}
var MON_Q=["After you'd slain ten thousand enemies, what would your foes call you?","When the war is sung a hundred years from now, what name do the bards give you?","Your enemies carved one word on their shields to ward you off \\u2014 what was it?","If a kingdom crowned you tomorrow, what title would they proclaim?","The heralds announce you at the great hall \\u2014 what do they shout?","On the door of the corner office you always wanted, what does the nameplate read?","If your business card had no limits, what title would it print?","The board just made you Chief of Everything \\u2014 Chief of what, exactly?","You've earned every medal there is \\u2014 what rank do they salute?","Command gives you a callsign for life \\u2014 what is it?","Jersey retired, first ballot \\u2014 what do the fans chant?","The commentator screams your nickname as you win it all \\u2014 what is it?","The stars rename a constellation after you \\u2014 what's it called?","If the old gods feared one mortal, what name made them flinch?","Death itself steps aside when you arrive \\u2014 what does it call you?","Every wanted poster in the territory bears your alias \\u2014 what does it say?","The underworld whispers one name in the dark \\u2014 yours. What is it?","After a long life of hard-won wisdom, what honorific do the young give you?","The village seeks your counsel \\u2014 by what title do they ask for you?","You are the undisputed master of your craft \\u2014 what do apprentices call you?","Your flag flies and the ports go quiet \\u2014 what name do they fear at sea?","If you were the apex predator of your domain, what would the prey name you?","In the network's deepest logs, one handle commands root \\u2014 what is it?","If you were the wizard the realm sent for, what name would they summon?","Plain and simple \\u2014 what should we call you?","What name do the people you love use for you?","If you became exactly who you're meant to be, what would they call you then?","Fill in the blank on your dream title: 'The ___.'","A title only you could ever earn \\u2014 what is it?","The town owes you its peace \\u2014 what do they call the one who rode in?","The oracle names you in prophecy \\u2014 what word does she speak?","At the feast thrown in your honor, how does the host toast you?","You charted lands no one had seen \\u2014 what do the maps name you?","They raise a statue of you in the square \\u2014 what's engraved on the base?","The people follow you into the storm \\u2014 what do they cry as your banner rises?","If you needed only one name, like the legends \\u2014 what would it be?"];
var MON_TITLES=["Your Majesty","Captain","El Jefe","Chief","Boss","Skipper","Champ","Maestro","The Great One","Top Dog","Ace","Sensei","Commander","Your Excellency","The Magnificent","Big Cheese"];
function monPickQ(){var c=ucfg();var i=(typeof c.monQi==="number")?c.monQi:0;if(i<0||i>=MON_Q.length)i=0;ucfgSet({monQi:(i+1)%MON_Q.length});return MON_Q[i];}
function monDailyTitle(){var d=new Date();var doy=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);return MON_TITLES[((doy%MON_TITLES.length)+MON_TITLES.length)%MON_TITLES.length];}
function monAddName(n){n=(n||"").trim();if(!n)return;var c=ucfg();var arr=(c.monikers||[]).slice();if(arr.map(function(x){return x.toLowerCase();}).indexOf(n.toLowerCase())<0)arr.push(n);ucfgSet({monikers:arr,monikerAsked:true});window.__monBag=null;if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function monRemoveAt(i){var c=ucfg();var arr=(c.monikers||[]).slice();if(i>=0&&i<arr.length)arr.splice(i,1);ucfgSet({monikers:arr});window.__monBag=null;if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function monAddInput(){var el=document.getElementById("monikerInput");if(el){monAddName(el.value);el.value="";}}
function monikerName(){var c=ucfg();var arr=(c.monikers&&c.monikers.length)?c.monikers:null;if(arr){if(arr.length===1)return arr[0];if(!window.__monBag||!window.__monBag.length){var b=arr.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=b[i];b[i]=b[j];b[j]=x;}window.__monBag=b;}return window.__monBag.shift();}if(c&&c.moniker)return c.moniker;if(c&&c.monRotateDaily)return monDailyTitle();var nm=(S.me&&S.me.name)?S.me.name:"";return nm?nm.split(" ")[0]:"friend";}
function setMoniker(v){v=(v||"").trim();ucfgSet({moniker:v,monRotateDaily:false,monikerAsked:true});if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function __monClose(){var m=document.getElementById("monikerModal");if(m)m.remove();}
function __monGo(){var el=document.getElementById("monikerAsk");var v=el?(el.value||""):"";if(!v.trim()){return;}__monClose();monAddName(v);}
function __monName(){__monClose();ucfgSet({moniker:"",monRotateDaily:false,monikerAsked:true});if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function monDailyOn(){__monClose();ucfgSet({moniker:"",monRotateDaily:true,monikerAsked:true});if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function monDailyToggle(){var c=ucfg();if(c.monRotateDaily){ucfgSet({monRotateDaily:false,monikerAsked:true});}else{ucfgSet({monRotateDaily:true,moniker:"",monikerAsked:true});}if(typeof heroGreetUpd==="function")heroGreetUpd();render();}
function monOfferDaily(){var box=document.getElementById("monikerBox");if(!box)return;box.innerHTML='<div style="font-weight:800;font-size:1.2rem;margin-bottom:8px">No worries</div><div class="sub" style="margin-bottom:14px;font-size:.95rem">Want PULSE to crown you with a fresh, fun title every day, on the house?</div>';var row=document.createElement("div");row.setAttribute("style","display:flex;flex-wrap:wrap;gap:8px;justify-content:center");var y=document.createElement("button");y.className="go";y.textContent="Yes, surprise me daily";y.onclick=monDailyOn;var n=document.createElement("button");n.className="mini";n.textContent="No, just my name";n.onclick=__monName;row.appendChild(y);row.appendChild(n);box.appendChild(row);}
function monAsk(){if(!S.me)return;__monClose();var q=monPickQ();var m=document.createElement("div");m.id="monikerModal";m.setAttribute("style","position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:300;padding:16px");var box=document.createElement("div");box.id="monikerBox";box.setAttribute("style","background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:24px;max-width:440px;text-align:center");box.innerHTML='<div style="font-weight:800;font-size:1.3rem;margin-bottom:8px">Welcome to <span style="color:var(--acc)">PULSE</span></div><div class="sub" id="monQ" style="margin-bottom:14px;font-size:.98rem;line-height:1.4"></div><input id="monikerAsk" placeholder="Type your title\\u2026" style="width:100%;margin-bottom:12px">';var qd=box.querySelector("#monQ");if(qd)qd.textContent=q;var row=document.createElement("div");row.setAttribute("style","display:flex;flex-wrap:wrap;gap:8px;justify-content:center");var b1=document.createElement("button");b1.className="go";b1.textContent="Crown me with this";b1.onclick=__monGo;var b2=document.createElement("button");b2.className="mini";b2.textContent="Hmm, none fit";b2.onclick=monOfferDaily;row.appendChild(b1);row.appendChild(b2);box.appendChild(row);m.appendChild(box);document.body.appendChild(m);var inp=document.getElementById("monikerAsk");if(inp){inp.focus();inp.onkeydown=function(e){if(e.key==="Enter")__monGo();};}}
function changeMoniker(){monAsk();}
function askMoniker(){if(!S.me)return;var c=ucfg();if(c.moniker||c.monRotateDaily||c.monikerAsked)return;monAsk();}
function __monikerSection(){var c=ucfg();var arr=c.monikers||[];var chips=arr.length?arr.map(function(n,i){return '<span class="mqchip">'+esc(n)+' <span class="x" onclick="monRemoveAt('+i+')">×</span></span>';}).join(''):'<span class="sub">None yet — PULSE will use your first name.</span>';var sugg=['Sir','Boss','Amigo','GodKing Emperor','AlphaGrandpa','Your Majesty','Captain','El Jefe','Chief','Maestro','Legend','Champ','Skipper','Commander','Sensei','Big Cheese','Sovereign','Trailblazer','Maverick','Sweetness','Sunshine','Wizard','Queen Bee','Admiral'];var suggHtml=sugg.map(function(n){return '<span class="qbtn" style="cursor:pointer" onclick="monAddName(\\''+n+'\\')">+ '+esc(n)+'</span>';}).join('');var h='<h2 style="font-size:.95rem;margin:14px 0 6px">How PULSE greets you</h2><div class="sub">PULSE rotates through your titles — it shows every one before reshuffling. Add as many as you like; leave it empty to just use your first name.</div>';h+='<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">'+chips+'</div>';h+='<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><input id="monikerInput" placeholder="Add your own title…" onkeydown="if(event.key===String.fromCharCode(69,110,116,101,114))monAddInput()"><button class="go" onclick="monAddInput()">Add</button></div>';h+='<div class="sub" style="margin-top:12px">Quick add — tap any:</div><div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap">'+suggHtml+'</div>';h+='<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="qbtn" onclick="changeMoniker()">Inspire me with a question</button><button class="qbtn'+(c.monRotateDaily?" on":"")+'" onclick="monDailyToggle()">Surprise me daily instead</button></div>';return h;}
function logsTab(t){window.__logsTab=t;render();}
function logsView(){window.__logsTab=window.__logsTab||'log';var h='<div class="row" style="gap:8px;margin-bottom:10px"><button class="qbtn'+(window.__logsTab==='log'?' on':'')+'" onclick="logsTab(\\'log\\')">Clemit Log</button><button class="qbtn'+(window.__logsTab==='audit'?' on':'')+'" onclick="logsTab(\\'audit\\')">System Audit</button></div>';h+=(window.__logsTab==='audit'?auditView():logView());return h;}
function tabMove(id,dir){var c=ucfg();var base=tabsBase().map(function(t){return t[0];});var order=(c.tabOrder&&c.tabOrder.length)?c.tabOrder.filter(function(x){return base.indexOf(x)>=0;}):base.slice();base.forEach(function(x){if(order.indexOf(x)<0)order.push(x);});var i=order.indexOf(id);if(i<0)return;var j=i+dir;if(j<0||j>=order.length)return;var tmp=order[i];order[i]=order[j];order[j]=tmp;ucfgSet({tabOrder:order});if(typeof buildNav==='function')buildNav();render();}
function tabHideToggle(id){var c=ucfg();var hide=c.tabHide||{};hide[id]=!hide[id];ucfgSet({tabHide:hide});if(typeof buildNav==='function')buildNav();render();}
function tabManagerCard(){var c=ucfg();var base=tabsBase();var order=(c.tabOrder&&c.tabOrder.length)?c.tabOrder.slice():base.map(function(t){return t[0];});base.forEach(function(t){if(order.indexOf(t[0])<0)order.push(t[0]);});var byId={};base.forEach(function(t){byId[t[0]]=t;});var hide=c.tabHide||{};var lock={home:1,admin:1};var h='<div class="card"><h2>\\uD83D\\uDDC2 Tab manager</h2><div class="sub">Reorder your tabs and hide what you do not use. Saved for you. Home and Settings stay visible.</div>';order.forEach(function(id){var t=byId[id];if(!t)return;h+='<div class="row" style="align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:6px 2px"><span style="flex:1">'+esc(t[1])+'</span><button class="mini" title="Up" onclick="tabMove(\\''+id+'\\',-1)">\\u2191</button><button class="mini" title="Down" onclick="tabMove(\\''+id+'\\',1)">\\u2193</button>'+(lock[id]?'<span class="sub" style="margin:0">always on</span>':'<button class="mini'+(hide[id]?' warnb':'')+'" onclick="tabHideToggle(\\''+id+'\\')">'+(hide[id]?'hidden':'visible')+'</button>')+'</div>';});h+='</div>';return h;}
function _succ(){return (S.succession||[]).slice();}
function _kingReload(){if(typeof load==='function'){setTimeout(load,300);}}
function kingSaveSucc(list){post('/api/king/succession',{succession:list});_kingReload();}
function kingSuccMove(i,d){var l=_succ();var j=i+d;if(j<0||j>=l.length)return;var t=l[i];l[i]=l[j];l[j]=t;kingSaveSucc(l);}
function kingSuccDel(i){var l=_succ();l.splice(i,1);kingSaveSucc(l);}
function kingSuccAdd(){var e=((document.getElementById('succAdd')||{}).value||'').trim();if(!e)return;var l=_succ();l.push(e);kingSaveSucc(l);}
function kingSaveLetter(){var v=(document.getElementById('kingLetter')||{}).value||'';post('/api/king/letter',{letter:v});alert('Letter saved.');}
function kingVeto(){post('/api/king/veto',{});_kingReload();}
var KING_SILENCE_DAYS=90,KING_GRACE_DAYS=30;
function kingView(){if(!(S.me&&S.me.isKing))return '<div class="card"><div class="empty">The King tab is private.</div></div>';var succ=S.succession||[];var seen=S.kingSeen?new Date(S.kingSeen).toLocaleString():'\\u2014';var claim=S.claim;var h='<div class="vhead"><h2>\\uD83D\\uDC51 King</h2><span class="stamp sm">private \\u2014 King only</span></div>';h+='<div class="card"><h2 style="font-size:1rem">Status</h2><div class="sub">Heartbeat (last King activity): '+esc(seen)+'. Succession unlocks after '+KING_SILENCE_DAYS+' days of silence; the heir then has a '+KING_GRACE_DAYS+'-day window you can veto.</div>'+(claim?'<p style="color:var(--warn);margin-top:8px">\\u26a0 A succession claim is active by '+esc(claim.heir||'?')+'. <button class="qbtn" onclick="kingVeto()">Veto \\u2014 I am here</button></p>':'<p class="sub" style="margin-top:8px">No active claim. All is well.</p>')+'</div>';h+='<div class="card"><h2 style="font-size:1rem">Line of succession</h2><div class="sub">Each inherits only when the one before is gone. Add the email for each heir.</div><div style="margin-top:8px">';succ.forEach(function(e,i){h+='<div class="row" style="align-items:center;gap:8px;padding:4px 2px;border-bottom:1px solid var(--line)"><span style="width:22px;color:var(--dim)">'+(i+1)+'</span><span style="flex:1">'+esc(e)+'</span><button class="mini" onclick="kingSuccMove('+i+',-1)">\\u2191</button><button class="mini" onclick="kingSuccMove('+i+',1)">\\u2193</button><button class="mini warnb" onclick="kingSuccDel('+i+')">remove</button></div>';});h+='</div><div class="row" style="margin-top:8px;gap:8px"><input id="succAdd" placeholder="next heir email"><button class="go" onclick="kingSuccAdd()">Add heir</button></div></div>';h+='<div class="card"><h2 style="font-size:1rem">Letter to my heir</h2><div class="sub">A private message the next King reads when they inherit.</div><textarea id="kingLetter" rows="5" style="width:100%;margin-top:8px">'+esc(S.kingLetter||'')+'</textarea><div class="row" style="margin-top:8px"><button class="go" onclick="kingSaveLetter()">Save letter</button></div></div>';h+='<div class="card"><h2 style="font-size:1rem">Runbook \\u2014 how to run PULSE</h2><div class="sub">Deploy: double-click Deploy PULSE.cmd. Rollback: Rollback PULSE.cmd. Source of truth: GitHub jesseclemit/clemit-family + local src/index.js. Data: Cloudflare D1 (settings) + R2 (music / movies / pictures). Design + ops docs live in the project folder (CLAUDE.md, PMoP.md, KING-SUCCESSION-DESIGN.md).</div></div>';return h;}
function gamePrefs(){var c=ucfg();return c.gamePrefs||{muteSounds:true,pauseMovies:true};}
function gpToggle(k){var p=gamePrefs();p[k]=!p[k];ucfgSet({gamePrefs:p});var el=document.getElementById('gp_'+k);if(el)el.textContent=p[k]?'Yes':'No';}
function __gameClose(){var m=document.getElementById('gameModal');if(m)m.remove();}
function gameLaunch(i){var g=(window.__games||[])[i];if(!g)return;var p=gamePrefs();if(p.muteSounds){try{var d=document.getElementById('dock');if(d)d.muted=true;}catch(e){}}if(p.pauseMovies){try{var v=document.getElementById('dscreen');if(v)v.pause();}catch(e){}}__gameClose();window.open(g.u,'_blank','noopener');}
function gameInfo(i){var g=(window.__games||[])[i];if(!g)return;var p=gamePrefs();var info='<table style="width:100%;font-size:.85rem;margin:10px 0"><tr><td style="color:var(--dim)">Type</td><td style="text-align:right">'+esc(g.genre||'—')+'</td></tr><tr><td style="color:var(--dim)">Source</td><td style="text-align:right">'+esc(g.source||'—')+'</td></tr><tr><td style="color:var(--dim)">Year</td><td style="text-align:right">'+esc(g.year||'—')+'</td></tr><tr><td style="color:var(--dim)">Publisher</td><td style="text-align:right">'+esc(g.publisher||'—')+'</td></tr><tr><td style="color:var(--dim)">Developer</td><td style="text-align:right">'+esc(g.dev||'—')+'</td></tr><tr><td style="color:var(--dim)">Controls</td><td style="text-align:right">'+esc(g.controls||'—')+'</td></tr></table>';var m=document.createElement('div');m.id='gameModal';m.setAttribute('style','position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:300;padding:16px');m.innerHTML='<div style="background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:22px;max-width:420px;width:100%"><div style="display:flex;align-items:center;gap:8px"><h2 style="font-size:1.2rem;flex:1">'+esc(g.title)+'</h2><button class="mini" onclick="__gameClose()">✕</button></div>'+info+'<div style="border-top:1px solid var(--line);padding-top:10px;margin-top:6px"><div class="sub" style="margin-bottom:6px">Gaming experience</div><div class="row" style="justify-content:space-between;align-items:center"><span>Disable PULSE sounds while playing</span><button class="qbtn" id="gp_muteSounds" onclick="gpToggle(\\'muteSounds\\')">'+(p.muteSounds?'Yes':'No')+'</button></div><div class="row" style="justify-content:space-between;align-items:center;margin-top:6px"><span>Pause movies while playing</span><button class="qbtn" id="gp_pauseMovies" onclick="gpToggle(\\'pauseMovies\\')">'+(p.pauseMovies?'Yes':'No')+'</button></div></div><div class="row" style="margin-top:14px;justify-content:center"><button class="go" onclick="gameLaunch('+i+')">▶ Play</button></div></div>';document.body.appendChild(m);}
function adminView(){var h='<div class="card"><h2>\\uD83D\\uDC64 Your Profile</h2><div class="sub">How you show up on the board and around the site.</div><div class="profrow">'+avatarFor(S.me.name)+'<div><b>'+esc(S.me.name)+'</b><br><span class="sub" style="margin:0">'+esc(S.me.role)+'</span></div></div><div class="row" style="margin-top:10px"><button class="mini" onclick="setAvatar(\\'\\')">Use my initials</button><input id="avurl" placeholder="paste an image URL (any non-pornographic image)"><button class="go" onclick="setAvatarUrl()">Save image</button></div>';h+='<div class="card"><h2>\uD83D\uDCEC Daily digest email</h2><div class="sub">A 9am summary of what is new on PULSE \u2014 boards, notes shared with you, your reminders and more. Turn it off anytime.</div><p style="margin-top:8px">Status: <b>'+((S.me&&S.me.digestOff)?'OFF':'ON')+'</b> <button class="mini" onclick="setDigest('+((S.me&&S.me.digestOff)?'0':'1')+')">'+((S.me&&S.me.digestOff)?'turn on':'turn off')+'</button></p></div>';
var pics=(S.media||[]).filter(function(x){return x.kind==="photo";}).slice(0,24);
if(pics.length){h+='<div class="sub" style="margin-top:12px">Or pick one from Pictures:</div><div class="avpick">'+pics.map(function(x){return '<img src="'+esc(x.url)+'" title="'+esc(x.caption||x.place||"")+'" onclick="setAvatarById('+x.id+')">';}).join('')+'</div>';}
h+='</div>';
h+=myPrefsCard();h+=tabManagerCard();if(S.me.isAdmin){var lists=S.memberLists||['Grocery'];var lm=S.listMembers||{};
h+='<div class="card"><h2>Admin</h2><div class="sub">The user list is permanent - only an admin changes it.</div><p style="margin-bottom:8px">Guest grocery sharing: <b>'+(S.guestShare?'ON':'OFF')+'</b> <button class="mini" onclick="toggleGuest()">'+(S.guestShare?'turn off':'turn on (let guests help shop)')+'</button></p>';
h+='<h2 style="font-size:.95rem;margin:12px 0 6px">Lists</h2><div class="sub">These feed the checkboxes below. Add one and it shows up for everyone.</div><div class="row"><input id="newlist" placeholder="new list name (e.g. Movies, Trips)"><button class="go" onclick="addList()">Add list</button></div><div class="listchips">'+lists.map(function(l){return '<span class="badge">'+esc(l)+'</span>';}).join('')+'</div>';
h+='<h2 style="font-size:.95rem;margin:14px 0 6px">Add / update member</h2><div class="row"><input id="ue" placeholder="email"><input id="un" placeholder="name"><select id="ur"><option value="member">member</option><option value="admin">admin</option><option value="guest">guest</option></select><button class="go" onclick="addUser()">Save</button></div><p class="sub">Also add their email to the Cloudflare Access policy so they can reach the site.</p>';
var ucols=[{key:'name',label:'Member',fmt:function(v,u){return '<div style="display:flex;align-items:center;gap:8px">'+avatarFor(u.name)+'<div><b>'+esc(u.name)+'</b><br><span style="color:var(--dim);font-size:.72rem">'+esc(u.email)+'</span></div></div>';}},{key:'role',label:'Role',fmt:function(v,u){var io=(u.email||'').toLowerCase()==='jesseclemit@gmail.com';return '<select class="urole" '+(io?'disabled':'')+' onchange="setRole(\\''+u.email+'\\',this.value)">'+['guest','member','admin'].map(function(r){return '<option value="'+r+'"'+(u.role===r?' selected':'')+'>'+r+'</option>';}).join('')+'</select>';}},{key:'_lists',label:'Lists',sort:false,fmt:function(v,u){return lists.map(function(l){var mem=((lm[l]||[]).map(function(s){return String(s).toLowerCase();}).indexOf((u.email||'').toLowerCase())>=0)||(l==='Grocery'&&u.grocery_access);return '<label class="ulist"><input type="checkbox" '+(mem?'checked':'')+' onchange="setList(\\''+u.email+'\\',\\''+esc(l)+'\\',this.checked)">'+esc(l)+'</label>';}).join(' ');}},{key:'_act',label:'',sort:false,fmt:function(v,u){var io=(u.email||'').toLowerCase()==='jesseclemit@gmail.com';return io?'<span class="badge super">\\u2b50 SuperAdmin</span>':'<button class="mini" onclick="delUser(\\''+u.email+'\\')">remove</button>';}}];h+=dataTable('users',ucols,S.users||[],{search:true,sort:'name',exportName:'clemit-members'});h+='</div>';}
if(S.me.isAdmin||S.me.isRoyal){h+='<div class="card"><h2>💡 AI & costs — plain English (for the family)</h2><div class="sub">What Jesse is doing here, in 8th-grade terms. Tap any question to open it. Nothing hidden — turn the light on.</div>';
h+='<details class="card" style="margin-top:10px"><summary style="cursor:pointer;font-weight:600">What is Claude, and what is Jesse doing?</summary><div class="sub" style="margin-top:8px">Claude is an AI helper. Jesse tells it what he wants built for our family site (Pulse) — like the music library or the movie carousel. The AI writes the computer code; Jesse reviews it and approves before anything goes live. Think of it like a very fast contractor who only builds what Jesse signs off on.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">What is a “token”?</summary><div class="sub" style="margin-top:8px">AI reads and writes in tiny word-pieces called tokens — roughly ¾ of a word each. Every question Jesse asks and every answer the AI gives uses some. More work in a sitting = more tokens used. It is just a way to measure how much thinking happened.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">How do the plans work?</summary><div class="sub" style="margin-top:8px">There are tiers, and higher tiers give more room to work each week:<br>• Free — $0, light use<br>• Pro — $20/mo, about 5× the Free room<br>• Max — $100/mo, about 25× Free<br>• Max — $200/mo, about 100× Free<br>Jesse is on a paid tier and sometimes bumps the ceiling when a big build needs more room.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">Is there a receipt? Where does the money go?</summary><div class="sub" style="margin-top:8px">Yes — a meter, not an itemized bill. In the Claude app under Settings → Usage you can see how much of the plan has been used this cycle. There is no line-by-line “this feature cost X” receipt for a chat plan; that level of detail only exists on the developer API. The honest summary: it is a flat monthly subscription with a usage ceiling.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">Is this safe? Could the AI break our stuff?</summary><div class="sub" style="margin-top:8px">Guardrails are in place. Before every change, a dated backup is saved, so anything can be undone with one click (rollback). Jesse approves each deploy — nothing publishes on its own. The AI never deletes our photos, music, or lists. If something looks wrong, we roll back to the last good version.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">Why are we being so open about it?</summary><div class="sub" style="margin-top:8px">Because people fear what they cannot see. Jesse would rather show everything than hide it — turn the light on, and the dark room is just a room. If anyone ever says “hey, that looks crazy,” great: look closely, ask questions. Openness is the safeguard.</div></details>';
h+='<details class="card" style="margin-top:8px"><summary style="cursor:pointer;font-weight:600">Visualize will not load? (the claudemcpcontent.com error)</summary><div class="sub" style="margin-top:8px">Claude draws charts and diagrams with a helper at claudemcpcontent.com. The error means your browser could not reach it for a moment. It is almost always temporary. Try in order: 1) Run the visual again, then fully close and reopen Claude or the browser tab. 2) Ask Claude to render it as a downloadable PNG instead — that path does not use claudemcpcontent.com at all. 3) If it keeps failing, wait a few minutes — it is usually an Anthropic-side blip, not our network. Checked 2026-06-16: this home network reaches the servers fine, so a block on our end is not the cause.</div></details>';
h+='<div class="sub" style="margin-top:12px">See the real usage meter anytime: <a href="https://claude.ai/settings/usage" target="_blank" rel="noopener" style="color:var(--acc)">claude.ai/settings/usage</a></div>';
h+='</div>';}
return h;}
async function post(u,b){await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})});await load();}
function addG(){var n=document.getElementById('gn');var v=((n&&n.value)||'').trim();if(!v)return;var fq=(document.getElementById('gf')||{}).value||'once';var R=S.recipes||{};if(R[v.toLowerCase()]){if(n)n.value='';return addMeal(v);}S.grocery=S.grocery||[];S.grocery.push({id:'tmp'+Date.now(),name:v,freq:fq,last_bought:null,added_by:(S.me&&S.me.name)||'me',created_at:Date.now(),meal_group:null,checked:0});if(n)n.value='';if(typeof render==='function')render();gSync('/api/grocery',{name:v,freq:fq});}
function gotG(id){for(var i=0;i<(S.grocery||[]).length;i++){if(String(S.grocery[i].id)===String(id)){S.grocery[i].last_bought=Date.now();break;}}if(typeof render==='function')render();gSync('/api/grocery/bought',{id:id});}
function delG(id){S.grocery=(S.grocery||[]).filter(function(x){return String(x.id)!==String(id);});if(typeof render==='function')render();gSync('/api/grocery/delete',{id:id});}
function addM(){const t=document.getElementById('mb');if(!t.value.trim())return;var c=window.__fcat||'general';audit('post',t.value.slice(0,80),'Forum/'+c);try{localStorage.removeItem('mbdraft_'+c);}catch(e){}post('/api/message',{body:t.value,category:c});}
function addR(){const h=document.getElementById('rh');post('/api/rsvp',{year:2027,household:h.value,headcount:+document.getElementById('rc').value||0,note:document.getElementById('rn').value});}
function addMedia(){const u=document.getElementById('mu');if(!u.value.trim())return;var k=document.getElementById('mk').value;audit('upload',document.getElementById('mc').value||u.value,(k==='photo'?'Pictures':k==='video'?'Videos':'Music'));post('/api/media',{url:u.value,kind:k,people:document.getElementById('mp').value,place:document.getElementById('ml').value,caption:document.getElementById('mc').value});}
function uploadPhotos(inp){var files=inp&&inp.files?inp.files:null;if(!files||!files.length)return;var st=document.getElementById('upStat');var people=encodeURIComponent((document.getElementById('mp')||{}).value||'');var place=encodeURIComponent((document.getElementById('ml')||{}).value||'');var caption=encodeURIComponent((document.getElementById('mc')||{}).value||'');var qs='?people='+people+'&place='+place+'&caption='+caption;var total=files.length,done=0,fail=0,i=0;function step(){if(i>=total){if(st)st.textContent=done+' uploaded'+(fail?(', '+fail+' failed'):'');if(inp)inp.value='';audit('upload',done+' photo(s)','Pictures');load();return;}var f=files[i++];if(!f||f.type.slice(0,6)!=='image/'){fail++;step();return;}if(f.size>26214400){fail++;if(st)st.textContent='one file over 25MB skipped';step();return;}if(st)st.textContent='Uploading '+i+' of '+total+'\\u2026';fetch('/api/media/upload'+qs,{method:'POST',headers:{'content-type':f.type},body:f}).then(function(r){return r.json();}).then(function(j){if(j&&j.ok){done++;}else{fail++;}step();}).catch(function(){fail++;step();});}step();}
function delMedia(id){var m=(S.media||[]).filter(function(x){return x.id===id;})[0];audit('delete',m?(m.title||m.caption||m.url):('item '+id),'Deleted/'+(m?m.kind:'media'));post('/api/media/delete',{id});}
function toggleGuest(){post('/api/admin/setting',{key:'guest_grocery',value:S.guestShare?'0':'1'});}
function setDigest(off){fetch('/api/digest/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({off:off?1:0})}).then(function(){if(S&&S.me)S.me.digestOff=off?1:0;if(typeof load==='function')load();});}
function addUser(){const e=document.getElementById('ue');if(!e.value.trim())return;post('/api/admin/user',{email:e.value,name:document.getElementById('un').value,role:document.getElementById('ur').value,grocery_access:(document.getElementById('ug')&&document.getElementById('ug').checked)?1:0});}
function delUser(em){if(confirm('Remove '+em+'?'))post('/api/admin/user/delete',{email:em});}
function setRole(email,role){post('/api/admin/user/role',{email:email,role:role});}
function setList(email,list,on){post('/api/admin/list/member',{email:email,list:list,on:on});}
function addList(){var el=document.getElementById('newlist');if(el&&el.value.trim())post('/api/admin/list/add',{name:el.value.trim()});}
let dq=[],dqi=-1,dplaying=false,danim;
function dsongs(){const r=(window.__songs||[]).map(s=>({t:s.title,u:'/music/'+encodeURIComponent(s.key)}));const m=(S.media||[]).filter(x=>x.kind==='song').map(x=>({t:x.title||x.url,u:x.url}));return r.concat(m);}
function qKindIcon(k){return k==='video'?'\\u25b6':k==='photo'?'\\u25a3':k==='doc'?'\\u25a4':'\\u266a';}
function qPickFilter(q){q=(q||'').toLowerCase().trim();var all=dsongs();var box=document.getElementById('qpickres');if(!box)return;if(!all.length){box.innerHTML='<div class="qpmore">No songs in the library yet \\u2014 upload some under Library.</div>';window.__qpickList=[];return;}var list=q?all.filter(function(s){return (s.t||'').toLowerCase().indexOf(q)>=0;}):all;window.__qpickList=list;if(!list.length){box.innerHTML='<div class="qpmore">No matches for \\u201c'+esc(q)+'\\u201d.</div>';return;}var show=list.slice(0,8);var h='';show.forEach(function(s,i){h+='<div class="qprow" onclick="qPickAdd('+i+')"><span class="qpi">\\u266a</span><span class="qpt">'+esc(s.t)+'</span><span class="qpadd">+ Add</span></div>';});if(list.length>8)h+='<div class="qpmore">+'+(list.length-8)+' more \\u2014 keep typing to narrow\\u2026</div>';box.innerHTML=h;}
function qPickAdd(i){var s=(window.__qpickList||[])[i];if(!s)return;dq.push({t:s.t,u:s.u,k:'song'});if(dqi<0)dqi=0;dRender();dSave();if(typeof nqToast==='function')nqToast('Added: '+s.t);}
function qDragStart(e,i){if(e&&e.preventDefault)e.preventDefault();window.__qdrag={from:i,to:i};var rows=document.querySelectorAll('#ql .qrow');if(rows[i])rows[i].classList.add('qdrag');function mv(ev){var y=ev.clientY;var rs=document.querySelectorAll('#ql .qrow');var to=rs.length;for(var k=0;k<rs.length;k++){var rc=rs[k].getBoundingClientRect();if(y<rc.top+rc.height/2){to=k;break;}}if(window.__qdrag)window.__qdrag.to=to;}function up(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);var d=window.__qdrag;window.__qdrag=null;if(!d){dRender();return;}var from=d.from,to=(d.to==null?from:d.to);if(to>from)to--;if(to<0)to=0;if(to>dq.length-1)to=dq.length-1;if(to!==from&&from>=0&&from<dq.length){var cur=(dqi>=0?dq[dqi]:null);var it=dq.splice(from,1)[0];dq.splice(to,0,it);if(cur)dqi=dq.indexOf(cur);}dRender();dSave();}document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);}
function dshuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
function dsetNow(){const t=dqi>=0&&dq[dqi]?dq[dqi]:null;document.getElementById('npt').textContent=t?t.t:'Nothing playing';document.getElementById('npa').textContent=t?'family library':'\\u2014';}
function dRender(){const ql=document.getElementById('ql');document.getElementById('qc').textContent=dq.length?'('+dq.length+')':'';ql.innerHTML='';if(!dq.length){ql.innerHTML='<div class="qempty">Queue empty \\u2014 search above to add songs.</div>';dsetNow();dSave();return;}dq.forEach((t,i)=>{const r=document.createElement('div');r.className='qrow'+(i===dqi?' cur':'');r.innerHTML='<span class="qgrip" title="Drag to reorder">\\u283f</span><span class="qtype">'+qKindIcon(t.k)+'</span><span class="qm">'+esc(t.t)+'</span>'+((S.me&&S.me.isAdmin)?'<button class="qnuke" title="Destroy from library">&#128163;</button>':'')+'<button class="qx" title="Remove">&#10005;</button>';r.querySelector('.qm').onclick=(e)=>{dqRowClick(e,i);};var gp=r.querySelector('.qgrip');if(gp)gp.onpointerdown=function(e){qDragStart(e,i);};r.querySelector('.qx').onclick=e=>{e.stopPropagation();var wasCur=(i===dqi);dq.splice(i,1);if(!dq.length){dqi=-1;var d0=document.getElementById('dock');d0.pause();d0.removeAttribute('src');dstop();dRender();return;}if(i<dqi){dqi--;dRender();}else if(wasCur){if(dqi>dq.length-1)dqi=0;if(dplaying){dplay();}else{var d1=document.getElementById('dock');d1.src=dq[dqi].u;dRender();}}else{dRender();}};var nk=r.querySelector('.qnuke');if(nk)nk.onclick=function(e){e.stopPropagation();dqNuke(i);};ql.appendChild(r);});ql.onscroll=qArmHome;qArmHome();dsetNow();dqSelPaint();dSave();if(typeof dPinSync==='function'){dPinSync();dPinIdle();}}
var _djSaveT;function dSave(){clearTimeout(_djSaveT);_djSaveT=setTimeout(function(){try{fetch('/api/dj/queue',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q:dq,i:dqi})});}catch(e){}},500);}
function dqRowClick(e,i){window.__qsel=window.__qsel||{};if(e&&(e.ctrlKey||e.metaKey)){if(window.__qsel[i])delete window.__qsel[i];else window.__qsel[i]=1;window.__qlast=i;dqSelPaint();return;}if(e&&e.shiftKey){var a=(window.__qlast!=null)?window.__qlast:i,lo=Math.min(a,i),hi=Math.max(a,i);for(var k=lo;k<=hi;k++)window.__qsel[k]=1;dqSelPaint();return;}window.__qsel={};window.__qlast=i;dqi=i;dplay();}
function dqSelPaint(){var sel=window.__qsel||{};var rows=document.querySelectorAll('#ql .qrow');for(var k=0;k<rows.length;k++)rows[k].classList.toggle('qsel',!!sel[k]);var n=0;for(var key in sel)n++;var b=document.getElementById('qdelsel');if(b){b.style.display=n?'inline-block':'none';b.textContent='Delete '+n;}}
function dqDelSel(){var sel=window.__qsel||{};var idx=[];for(var key in sel)idx.push(+key);idx.sort(function(a,b){return b-a;});if(!idx.length)return;idx.forEach(function(i){if(i<0||i>=dq.length)return;dq.splice(i,1);if(i<dqi)dqi--;else if(i===dqi)dqi=Math.min(dqi,dq.length-1);});window.__qsel={};window.__qlast=null;if(!dq.length){dqi=-1;var d=document.getElementById('dock');d.pause();d.removeAttribute('src');dstop();}dRender();}
function dnosong(){alert('No songs in the library yet - add some under Library.');}
function dqNuke(i){var s=dq[i];if(!s)return;var why=prompt('RCA \\u2014 why nuke "'+s.t+'"? (logged)');if(why===null)return;if(!confirm('Destroy "'+s.t+'" from the library permanently? A Clemit Log entry will remain.'))return;var key=(s.u&&s.u.indexOf('/music/')===0)?decodeURIComponent(s.u.slice(7)):null;var med=(S.media||[]).filter(function(x){return x.kind==='song'&&x.url===s.u;})[0];if(key){post('/api/music/destroy',{key:key,label:s.t,reason:why});}else if(med){post('/api/destroy',{kind:'media',id:med.id,label:s.t,reason:why});}var wasCur=(i===dqi);dq.splice(i,1);if(!dq.length){dqi=-1;var d=document.getElementById('dock');d.pause();d.removeAttribute('src');dstop();}else if(i<dqi){dqi--;}else if(wasCur){if(dqi>dq.length-1)dqi=0;if(dplaying)dplay();}dRender();}
function dgen(n){const pool=dsongs();if(!pool.length)return dnosong();if(dq.length&&!confirm('Replace the queue ('+dq.length+' song(s)) with a fresh '+n+'-song set?'))return;const p=dshuf(pool.slice());let out=[];while(out.length<n&&p.length)out=out.concat(p);dq=out.slice(0,n);dqi=0;dplay();}
function d50(){const pool=dsongs();if(!pool.length)return dnosong();dq=dq.concat(dshuf(pool.slice()).slice(0,50));if(dqi<0)dqi=0;dRender();dstartPlay();}
function dall(){const pool=dsongs();if(!pool.length)return dnosong();pool.forEach(s=>dq.push(s));if(dqi<0)dqi=0;dRender();dstartPlay();}
function dshufq(){if(dq.length<2){dRender();return;}const c=dqi>=0?dq[dqi]:null;dshuf(dq);dqi=c?dq.indexOf(c):-1;dRender();dstartPlay();}
function dclear(){if(dq.length&&!confirm('Clear the queue ('+dq.length+' song(s))?'))return;dq=[];dqi=-1;const d=document.getElementById('dock');try{d.pause();d.currentTime=0;}catch(e){}d.removeAttribute('src');try{d.load();}catch(e){}dstop();dRender();}
function dplay(){if(dqi<0||!dq[dqi]){dRender();return;}const d=document.getElementById('dock');d.src=dq[dqi].u;d.play().catch(()=>{});audit('play',dq[dqi].t,'Music');dstartPlay();dRender();qHome();}
var __qHomeT=null;
function qHome(){var ql=document.getElementById('ql');if(!ql)return;var cc=ql.querySelector('.qrow.cur');if(cc&&ql.scrollHeight>ql.clientHeight)ql.scrollTop=Math.max(0,cc.offsetTop-8);}
function qArmHome(){clearTimeout(__qHomeT);__qHomeT=setTimeout(qHome,3000);}
function dstartPlay(){dplaying=true;document.getElementById('dplay').innerHTML='&#10074;&#10074;';clearInterval(danim);const bars=document.querySelectorAll('#eq i');danim=setInterval(()=>bars.forEach(b=>b.style.height=(8+Math.random()*20)+'px'),150);msSync();}
function dstop(){dplaying=false;document.getElementById('dplay').innerHTML='&#9654;';clearInterval(danim);document.querySelectorAll('#eq i').forEach(b=>b.style.height='8px');msSync();}
function dnext(){if(!dq.length)return;dqi=(dqi+1)%dq.length;dplay();}
function dprev(){if(!dq.length)return;dqi=(dqi-1+dq.length)%dq.length;dplay();}
function fmtTime(s){s=Math.floor(s||0);var m=Math.floor(s/60),ss=s%60;return m+':'+(ss<10?'0':'')+ss;}
function toggleMovieTime(){var k='mtOffDate';var today=new Date().toISOString().slice(0,10);var off=false;try{off=localStorage.getItem(k)===today;}catch(e){}try{if(off)localStorage.removeItem(k);else localStorage.setItem(k,today);}catch(e){}var nowOff=!off;var b=document.getElementById('mtoff');if(b){b.textContent=nowOff?'Movie Time off today':'Disable Movie Time';b.classList.toggle('warnb',nowOff);}}
window.__acc=window.__acc||{Player:1,Qctl:1,Queue:1};
function _accApply(){['Player','Qctl','Queue'].forEach(function(k){var el=document.querySelector('.acc[data-acc="'+k+'"]');if(el)el.classList.toggle('collapsed',!window.__acc[k]);});}
function accToggle(k){window.__acc[k]=!window.__acc[k];_accApply();}
var __qlIdleT;
function dPinJump(){var ql=document.getElementById('ql');var cur=ql&&ql.querySelector('.qrow.cur');if(cur){try{ql.scrollTo({top:cur.offsetTop-4,behavior:'smooth'});}catch(e){ql.scrollTop=cur.offsetTop-4;}}}
function dPinSync(){var ql=document.getElementById('ql'),pin=document.getElementById('qlpin');if(!ql||!pin)return;var cur=ql.querySelector('.qrow.cur');if(!cur){pin.style.display='none';return;}var top=cur.offsetTop,h=cur.offsetHeight,vTop=ql.scrollTop,vBot=vTop+ql.clientHeight;var qm=cur.querySelector('.qm');var label=qm?qm.outerHTML:'<span class="qm">(playing)</span>';var html='<div class="qrow cur" style="cursor:pointer" onclick="dPinJump()">'+label+'<span style="margin-left:auto;font-size:.62rem;letter-spacing:.06em;color:var(--acc)">NOW PLAYING</span></div>';if(top+h<=vTop+1){pin.innerHTML=html;pin.style.display='block';pin.style.top='0px';pin.style.bottom='auto';}else if(top>=vBot-1){pin.innerHTML=html;pin.style.display='block';pin.style.bottom='0px';pin.style.top='auto';}else{pin.style.display='none';}}
function dPinIdle(){clearTimeout(__qlIdleT);__qlIdleT=setTimeout(function(){dPinJump();setTimeout(dPinSync,450);},3000);}
function djInit(){if(typeof _accApply==='function')_accApply();var __qlS=document.getElementById('ql');if(__qlS&&!__qlS.__pinWired){__qlS.__pinWired=1;__qlS.addEventListener('scroll',function(){dPinSync();dPinIdle();});}const eq=document.getElementById('eq');if(eq&&!eq.children.length){for(let i=0;i<12;i++)eq.appendChild(document.createElement('i'));}
document.getElementById('qshuf').onclick=dshufq;document.getElementById('qclear').onclick=dclear;try{qPickFilter('');}catch(e){}var _mt=document.getElementById('mtoff');if(_mt){try{if(localStorage.getItem('mtOffDate')===new Date().toISOString().slice(0,10)){_mt.textContent='Movie Time off today';_mt.classList.add('warnb');}}catch(e){}}
document.getElementById('dplay').onclick=function(){if(dplaying){document.getElementById('dock').pause();dstop();}else if(!dq.length){dgen(24);}else{document.getElementById('dock').play().catch(()=>{});dstartPlay();}};
document.getElementById('dnext').onclick=dnext;document.getElementById('dprev').onclick=dprev;
var mp=document.getElementById('msPlay');if(mp)mp.onclick=function(){document.getElementById('dplay').click();setTimeout(msSync,40);};var mn=document.getElementById('msNext');if(mn)mn.onclick=function(){dnext();msSync();};
var _dk=document.getElementById('dock'),_sk=document.getElementById('seek'),_vl=document.getElementById('vol'),_vm=document.getElementById('vmute');
if(_dk){_dk.ontimeupdate=function(){var tc=document.getElementById('tcur');if(_dk.duration&&isFinite(_dk.duration)){if(_sk&&!window.__seeking)_sk.value=String(Math.round(_dk.currentTime/_dk.duration*1000));if(tc)tc.textContent=fmtTime(_dk.currentTime);}};_dk.onloadedmetadata=function(){var td=document.getElementById('tdur');if(td)td.textContent=(isFinite(_dk.duration)?fmtTime(_dk.duration):'live');};}
if(_sk){_sk.oninput=function(){window.__seeking=true;};_sk.onchange=function(){if(_dk&&_dk.duration&&isFinite(_dk.duration))_dk.currentTime=(_sk.value/1000)*_dk.duration;window.__seeking=false;};}
if(_vl){_vl.oninput=function(){if(_dk)_dk.volume=_vl.value/100;if(_vm)_vm.innerHTML=(_vl.value==0?'&#128263;':'&#128266;');};}
if(_vm){_vm.onclick=function(){if(_dk)_dk.muted=!_dk.muted;_vm.innerHTML=(_dk&&_dk.muted?'&#128263;':'&#128266;');};}
document.getElementById('dock').onended=dnext;var st=document.getElementById('djst');if(st)st.onclick=function(e){var c=e.target.closest('.dchip');if(!c)return;var s=c.dataset.s;var map={lib:'song',videos:'video',photos:'photo',radio:'radio'};if(map[s]){window.__lib=map[s];show('dj');return;}dRender();};dRender();}
function msSync(){var strip=document.getElementById('ministrip');if(!strip)return;var t=(typeof dq!=='undefined'&&typeof dqi!=='undefined'&&dqi>=0&&dq[dqi])?dq[dqi]:null;var active=!!t;var scrolled=(window.scrollY||window.pageYOffset||0)>120;strip.classList.toggle('on',scrolled&&active);var hero=document.getElementById('hero');if(hero)hero.classList.toggle('mini',scrolled);var tt=document.getElementById('msTitle');if(tt)tt.textContent=t?t.t:'\\u2014';var pb=document.getElementById('msPlay');if(pb)pb.innerHTML=(typeof dplaying!=='undefined'&&dplaying)?'&#10074;&#10074;':'&#9654;';var mq=document.getElementById('msQuote');if(mq){var L=heroList();var o=L&&L[heroQi];mq.textContent=o?('\\u201c'+o.q+'\\u201d \\u2014 '+o.a):'';}}
window.addEventListener('scroll',msSync,{passive:true});
window.addEventListener('resize',moveSlider);
function loadSpace(){fetch('/api/usage').then(r=>r.json()).then(d=>{var gb=(d.bytes||0)/1073741824;document.getElementById('spaceFill').style.width=Math.min(100,gb/10*100)+'%';document.getElementById('spaceFill').style.background=gb<=10?'var(--acc2)':gb<=100?'var(--warn)':'var(--bad)';var cost=Math.max(0,gb-10)*0.015;document.getElementById('spaceN').textContent=gb.toFixed(2)+' GB / 10 free'+(cost>0?' - ~$'+cost.toFixed(2)+'/mo':'');}).catch(function(){document.getElementById('spaceN').textContent='unavailable';});}
window.__dbg={err:0,lastErr:'',fps:0,t0:Date.now()};
(function(){var last=(window.performance&&performance.now)?performance.now():Date.now(),f=0;function loop(){f++;var now=(window.performance&&performance.now)?performance.now():Date.now();if(now-last>=1000){window.__dbg.fps=f;f=0;last=now;}requestAnimationFrame(loop);}if(window.requestAnimationFrame)requestAnimationFrame(loop);})();
function dbgRow(k,v){return '<div><span style="color:#7fa6b5">'+k+':</span> '+v+'</div>';}
function dbgOk(b){return b?'<span style="color:#39d98a">✓</span>':'<span style="color:#ff5d6e">✗</span>';}
function dbgTri(b){return b===null?'<span style="color:#e9a045">…</span>':dbgOk(b);}
function dbgTick(){var box=document.getElementById('dbgBox');if(!box)return;var d=window.__dbg||{};
var cur_=(typeof cur!=='undefined'?cur:'?');var lib_=window.__lib||'-';
var mq=(window.MQ&&window.MQ.length)||0;var cfl=(window.__cflist&&window.__cflist.length)||0;var cfi=(window.__cfi||0);
var dql=(typeof dq!=='undefined'&&dq?dq.length:0);var dqi_=(typeof dqi!=='undefined'?dqi:-1);
var playing=(typeof dplaying!=='undefined'&&dplaying)?'yes':'no';
var sOk=!!(typeof S!=='undefined'&&S&&S.me);
var stage=document.getElementById('cfstage');var cards=stage?stage.children.length:null;var cardsOk=(cards===null)||(cards===cfl);
var dockOk=!!document.getElementById('dock');
var spaceN=(document.getElementById('spaceN')||{}).textContent||'';
var apiOk=/GB/.test(spaceN)?true:(/unavailable/.test(spaceN)?false:null);
var nodes=document.getElementsByTagName('*').length;
var heap=(window.performance&&performance.memory)?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'n/a';
var up=Math.round((Date.now()-(d.t0||Date.now()))/1000);
var h='';
h+='<div style="color:#37e0ff;font-weight:700">STATES</div>';
h+=dbgRow('view',esc(cur_))+dbgRow('libTab',esc(lib_))+dbgRow('coverflow',cfi+'/'+cfl)+dbgRow('movieQ',mq)+dbgRow('djQueue',(dqi_>=0?dqi_+'/':'')+dql)+dbgRow('playing',playing);
h+='<div style="color:#37e0ff;font-weight:700;margin-top:5px">ASSERTIONS</div>';
h+=dbgRow('session',dbgOk(sOk))+dbgRow('cards=list',dbgOk(cardsOk)+' ('+(cards===null?'-':cards)+'/'+cfl+')')+dbgRow('audio dock',dbgOk(dockOk));
h+='<div style="color:#37e0ff;font-weight:700;margin-top:5px">VIABILITY</div>';
h+=dbgRow('/api/usage',dbgTri(apiOk))+dbgRow('identity',(sOk&&S.me.email)?esc(S.me.email):'—');
h+='<div style="color:#37e0ff;font-weight:700;margin-top:5px">RESILIENCE</div>';
h+=dbgRow('errors',d.err||0)+dbgRow('last err',esc(d.lastErr||'—'));
h+='<div style="color:#37e0ff;font-weight:700;margin-top:5px">PERFORMANCE</div>';
h+=dbgRow('fps',d.fps||0)+dbgRow('DOM nodes',nodes)+dbgRow('JS heap',heap)+dbgRow('uptime',up+'s');h+='<span style="color:#37e0ff;font-weight:700">R2</span>'+dbgRow('storage',esc(spaceN||'—'));
box.innerHTML=h;}
function dbgStart(){var p=document.getElementById('spacePod');if(p)p.style.display='none';var __dt=document.getElementById('dbgTab');if(__dt&&typeof S!=='undefined'&&S&&S.me&&S.me.isAdmin)__dt.style.display='block';dbgTick();setInterval(dbgTick,1000);}
try{dbgStart();}catch(e){}

var spX=document.getElementById('spaceX');if(spX)spX.onclick=function(){document.getElementById('spacePod').style.display='none';var __dt=document.getElementById('dbgTab');if(__dt)__dt.style.display='block';};var __dbgTab=document.getElementById('dbgTab');if(__dbgTab)__dbgTab.onclick=function(){this.style.display='none';var __p=document.getElementById('spacePod');if(__p)__p.style.display='flex';};
window.onerror=function(m){window.__dbg=window.__dbg||{err:0,lastErr:''};window.__dbg.err++;window.__dbg.lastErr=String(m).slice(0,80);audit('error',String(m).slice(0,160),'Errors');return false;};
loadSpace();setInterval(loadSpace,60000);

/* ===== Jaemie phone preview (owner-only mobile view) ===== */
function JPV_IN(){return /[?&]inphone=1/.test(location.search);}
var JPV_DEV={pixel:{n:'Pixel 7 · Android',w:412,h:915,os:'android'},galaxy:{n:'Galaxy S22 · Android',w:360,h:780,os:'android'},iphone:{n:'iPhone 15',w:393,h:852,os:'ios'}};
var jpvDev='pixel',jpvScale='fit',jpvDrag=null;
function jpvCfg(){var c=ucfg();if(c.phoneDev&&JPV_DEV[c.phoneDev])jpvDev=c.phoneDev;if(c.phoneScale!=null)jpvScale=c.phoneScale;return c;}
function phonePreviewMaybe(){if(JPV_IN())return;if(!(S&&S.me&&S.me.isOwner))return;if(document.getElementById('jpvWrap')){jpvOpen();return;}jpvCfg();jpvBuild();jpvOpen();}
function jpvBuild(){
  var c=ucfg();var w=document.createElement('div');w.id='jpvWrap';
  var opts='';for(var k in JPV_DEV){opts+='<option value="'+k+'"'+(k===jpvDev?' selected':'')+'>'+JPV_DEV[k].n+'</option>';}
  w.innerHTML='<div id="jpvBar">'+
    '<span class="jpvTitle">📱 Mobile preview</span>'+
    '<span class="jpvTag" title="The preview is signed in as you. It shows the real mobile layout and the tabs your account sees.">as you</span>'+
    '<select id="jpvSel" onpointerdown="event.stopPropagation()" onchange="jpvSetDevice(this.value)">'+opts+'</select>'+
    '<span class="jpvSpacer"></span>'+
    '<span class="jpvDims" id="jpvDims"></span>'+
    '<button class="jpvBtn" title="Zoom out" onpointerdown="event.stopPropagation()" onclick="jpvZoom(-1)">−</button>'+
    '<button class="jpvBtn" title="Zoom in" onpointerdown="event.stopPropagation()" onclick="jpvZoom(1)">+</button>'+
    '<button class="jpvBtn" title="Reload the phone" onpointerdown="event.stopPropagation()" onclick="jpvReload()">↻</button>'+
    '<button class="jpvBtn jpvX" title="Close. A phone button stays in the corner to reopen." onpointerdown="event.stopPropagation()" onclick="jpvClose()">✕</button>'+
    '</div>'+
    '<div id="jpvBox"><div id="jpvPhone">'+
      '<div class="jpvFrame" id="jpvFrame">'+
        '<div class="jpvSide p"></div><div class="jpvSide v"></div>'+
        '<div class="jpvPunch" id="jpvPunch"></div>'+
        '<div class="jpvScreen"><iframe id="jpvDoc" src="/?inphone=1" title="Mobile preview"></iframe></div>'+
        '<div class="jpvNav" id="jpvNav"><b class="tri"></b><b class="cir"></b><b></b></div>'+
      '</div>'+
    '</div></div>';
  document.body.appendChild(w);
  var lc=document.createElement('div');lc.id='jpvLauncher';lc.title='Show the mobile preview';lc.innerHTML='📱';lc.onclick=jpvOpen;document.body.appendChild(lc);
  if(c.phonePos&&typeof c.phonePos.x==='number'){w.style.left=c.phonePos.x+'px';w.style.top=c.phonePos.y+'px';w.style.right='auto';}
  jpvDragWire();jpvFit();
}
function jpvFit(){
  var d=JPV_DEV[jpvDev];var ph=document.getElementById('jpvPhone'),box=document.getElementById('jpvBox'),fr=document.getElementById('jpvFrame'),doc=document.getElementById('jpvDoc'),nav=document.getElementById('jpvNav');
  if(!ph||!d)return;
  doc.style.width=d.w+'px';doc.style.height=d.h+'px';
  fr.style.width=d.w+'px';fr.style.height=d.h+'px';
  ph.style.width=(d.w+22)+'px';ph.style.height=(d.h+22)+'px';
  fr.className='jpvFrame'+(d.os==='ios'?' ios':'');
  nav.className='jpvNav'+(d.os==='ios'?' ios':'');
  var k=jpvScale;
  if(k==='fit'||k==null){var avail=window.innerHeight-150;k=Math.min(.92,Math.max(.42,avail/(d.h+34)));}
  k=Math.max(.35,Math.min(1.15,k));
  ph.style.transform='scale('+k+')';
  box.style.width=((d.w+22)*k)+'px';box.style.height=((d.h+22)*k)+'px';
  var dims=document.getElementById('jpvDims');if(dims)dims.textContent=d.w+' × '+d.h;
}
function jpvSetDevice(id){if(!JPV_DEV[id])return;jpvDev=id;ucfgSet({phoneDev:id});jpvFit();}
function jpvZoom(dir){var d=JPV_DEV[jpvDev];var cur=jpvScale;if(cur==='fit'||cur==null){var avail=window.innerHeight-150;cur=Math.min(.92,Math.max(.42,avail/(d.h+34)));}cur=Math.max(.35,Math.min(1.15,cur+dir*0.08));jpvScale=cur;ucfgSet({phoneScale:cur});jpvFit();}
function jpvReload(){var f=document.getElementById('jpvDoc');if(f){try{f.contentWindow.location.reload();}catch(e){f.src='/?inphone=1&r='+Date.now();}}}
function jpvClose(){var w=document.getElementById('jpvWrap');if(w)w.classList.add('jpvHidden');var l=document.getElementById('jpvLauncher');if(l)l.classList.add('show');}
function jpvOpen(){var w=document.getElementById('jpvWrap');if(w)w.classList.remove('jpvHidden');var l=document.getElementById('jpvLauncher');if(l)l.classList.remove('show');jpvFit();}
function jpvDragWire(){
  var bar=document.getElementById('jpvBar'),w=document.getElementById('jpvWrap');if(!bar||!w)return;
  bar.addEventListener('pointerdown',function(e){if(e.target.closest('button,select'))return;var r=w.getBoundingClientRect();jpvDrag={dx:e.clientX-r.left,dy:e.clientY-r.top};bar.classList.add('jpvGrab');try{bar.setPointerCapture(e.pointerId);}catch(x){}});
  bar.addEventListener('pointermove',function(e){if(!jpvDrag)return;var x=e.clientX-jpvDrag.dx,y=e.clientY-jpvDrag.dy;x=Math.max(2,Math.min(window.innerWidth-90,x));y=Math.max(2,Math.min(window.innerHeight-50,y));w.style.left=x+'px';w.style.top=y+'px';w.style.right='auto';});
  function up(){if(!jpvDrag)return;jpvDrag=null;bar.classList.remove('jpvGrab');var r=w.getBoundingClientRect();ucfgSet({phonePos:{x:Math.round(r.left),y:Math.round(r.top)}});}
  bar.addEventListener('pointerup',up);bar.addEventListener('pointercancel',up);
}
window.addEventListener('resize',function(){if(jpvScale==='fit'||jpvScale==null){var w=document.getElementById('jpvWrap');if(w&&!w.classList.contains('jpvHidden'))jpvFit();}});
/* ===== end phone preview ===== */


/* ===== Movie Queue overlay (mobile) - reuses window.MQ + mSave; royalty-gated removal ===== */
function mjogQueue(i){var L=window.__cflist||[];var m=L[i];if(m&&m.t&&typeof mqvAdd==='function')mqvAdd(m.t);}
function mqvCanRemove(){return !!(window.S&&S.me&&(S.me.isRoyal||S.me.inLine));}
function mqvEnsure(){
  if(document.getElementById('mqvWrap'))return;
  var w=document.createElement('div');w.id='mqvWrap';
  w.innerHTML='<div id="mqvHead"><span>\uD83C\uDFAC</span><b>Movie Queue</b><span class="mqvCnt" id="mqvCnt"></span><span class="mqvX" id="mqvX" title="Close">\u2715</span></div><div id="mqvList"></div><div id="mqvNote"></div>';
  document.body.appendChild(w);
  var l=document.createElement('div');l.id='mqvLauncher';l.innerHTML='\uD83C\uDFAC Queue';l.onclick=mqvOpen;document.body.appendChild(l);
  document.getElementById('mqvX').onclick=mqvClose;
  mqvDragWire();
}
function mqvRender(){
  if(!document.getElementById('mqvWrap'))return;
  var MQ=window.MQ||[];var list=document.getElementById('mqvList');var can=mqvCanRemove();
  document.getElementById('mqvCnt').textContent='('+MQ.length+')';
  if(!MQ.length){list.innerHTML='<div class="empty">Empty - double-tap a movie in Movie Jog to queue it.</div>';}
  else{var h='';MQ.forEach(function(t,i){h+='<div class="mqvRow"><span class="n">'+(i+1)+'</span><span class="t" title="'+esc(t)+'">'+esc(t)+'</span><span class="a" onclick="mqvMove('+i+',-1)" title="Up">\u25B2</span><span class="a" onclick="mqvMove('+i+',1)" title="Down">\u25BC</span>'+(can?'<span class="rm" onclick="mqvRemove('+i+')" title="Remove">\u2715</span>':'')+'</div>';});list.innerHTML=h;}
  document.getElementById('mqvNote').innerHTML=can?'\u2715 removes \u00b7 drag header to move':'\uD83D\uDD12 Only Royalty can remove queued movies';
}
function mqvOpen(){mqvEnsure();var w=document.getElementById('mqvWrap');w.classList.remove('mqvHide');var l=document.getElementById('mqvLauncher');if(l)l.classList.remove('show');mqvRender();}
function mqvClose(){var w=document.getElementById('mqvWrap');if(w)w.classList.add('mqvHide');var l=document.getElementById('mqvLauncher');if(l)l.classList.add('show');}
function mqvAdd(t){t=String(t||'').trim();if(!t)return;window.MQ=window.MQ||[];if(window.MQ.indexOf(t)<0){window.MQ.push(t);if(typeof mSave==='function')mSave();}mqvOpen();var w=document.getElementById('mqvWrap');if(w){w.style.boxShadow='0 12px 34px rgba(0,0,0,.6),0 0 0 3px #00e5ff';setTimeout(function(){w.style.boxShadow='0 12px 34px rgba(0,0,0,.6),0 0 16px rgba(255,61,240,.3)';},280);}}
function mqvMove(i,dir){var MQ=window.MQ||[];var j=i+dir;if(j<0||j>=MQ.length)return;var x=MQ.splice(i,1)[0];MQ.splice(j,0,x);if(typeof mSave==='function')mSave();mqvRender();}
function mqvRemove(i){if(!mqvCanRemove()){alert('Only Royalty can remove queued movies.');return;}var MQ=window.MQ||[];if(i<0||i>=MQ.length)return;MQ.splice(i,1);if(typeof mSave==='function')mSave();mqvRender();if(typeof render==='function'&&window.cur==='dj')render();}
function mqvDragWire(){
  var w=document.getElementById('mqvWrap'),hh=document.getElementById('mqvHead');if(!w||!hh)return;var dr=null;
  hh.addEventListener('pointerdown',function(e){if(e.target.closest('.mqvX'))return;var r=w.getBoundingClientRect();dr={dx:e.clientX-r.left,dy:e.clientY-r.top,id:e.pointerId};hh.classList.add('mqvGrab');try{hh.setPointerCapture(e.pointerId);}catch(x){}});
  hh.addEventListener('pointermove',function(e){if(!dr||e.pointerId!==dr.id)return;var r=w.getBoundingClientRect();var x=Math.max(2,Math.min(window.innerWidth-r.width-2,e.clientX-dr.dx)),y=Math.max(2,Math.min(window.innerHeight-r.height-2,e.clientY-dr.dy));w.style.left=x+'px';w.style.top=y+'px';w.style.right='auto';});
  function up(){dr=null;hh.classList.remove('mqvGrab');}hh.addEventListener('pointerup',up);hh.addEventListener('pointercancel',up);
}
/* ===== end Movie Queue overlay ===== */

/* ===== two-tier Library filter bar (drives existing __libMode/__libSel) ===== */
function libCurTop(){var m=window.__libMode,sel=window.__libSel||[];if(m==='movies')return 'movies';if(m==='song'||m==='radio')return 'music';if(sel.indexOf('photo')>=0)return 'pictures';if(sel.indexOf('book')>=0||sel.indexOf('audiobook')>=0)return 'books';return 'movies';}
function libTop(t){window.__libSub='';if(t==='movies'){window.__libMode='movies';window.__libSub='mjog';}else if(t==='music'){window.__libMode='song';window.__libSub='ajog';}else if(t==='pictures'){window.__libMode='stack';window.__libSel=['photo'];}else if(t==='books'){window.__libMode='stack';window.__libSel=['book'];window.__libSub='';}if(typeof render==='function')render();}
function libSubSet(s){window.__libSub=s;if(s==='queued'){if(typeof mqvOpen==='function')mqvOpen();}else if(s==='mjog'){window.__libMode='movies';}else if(s==='audiobooks'){window.__libMode='stack';window.__libSel=['audiobook'];}else if(s==='ajog'){window.__libMode='song';}else if(s==='playlists'){window.__libMode='song';}else if(s&&s.indexOf('g_')===0){window.__mf=s.slice(2);}if(typeof render==='function')render();}
function libFilterBar(){
  if(!window.__lfbWired){window.__lfbWired=1;document.addEventListener('click',function(e){if(!e.target.closest)return;var a=e.target.closest('[data-libtop]');if(a){libTop(a.getAttribute('data-libtop'));return;}var b=e.target.closest('[data-libsub]');if(b){libSubSet(b.getAttribute('data-libsub'));}});}
  var top=libCurTop();var sub=window.__libSub||'';
  var TOPS=[['movies','Movies'],['music','Music'],['pictures','Pictures'],['books','Books']];
  var SUBS={movies:[['queued','Queued Movies'],['mjog','Movie Jog']],music:[['playlists','Playlists'],['ajog','Album Jog']],pictures:[['recent','Recent'],['people','People'],['places','Places']],books:[['audiobooks','Audiobooks'],['g_adventure','Adventure'],['g_scifi','SciFi'],['g_comedy','Comedy'],['g_action','Action']]};
  var h='<div class="libfbar"><div class="lfb-top">';
  TOPS.forEach(function(t){h+='<span class="lfb-chip'+(t[0]===top?' on':'')+'" data-libtop="'+t[0]+'">'+t[1]+'</span>';});
  h+='</div><div class="lfb-sub">';
  (SUBS[top]||[]).forEach(function(t){h+='<span class="lfb-schip'+(t[0]===sub?' on':'')+'" data-libsub="'+t[0]+'">'+t[1]+'</span>';});
  h+='</div></div>';return h;
}
/* ===== end Library filter bar ===== */
load().then(bootReveal).catch(bootReveal);setTimeout(bootReveal,7000);
function userBusy(){var e=document.activeElement;return !!(e&&(e.tagName==='TEXTAREA'||e.tagName==='INPUT'||e.tagName==='SELECT'||e.isContentEditable));}
function hasDraft(){var f=document.querySelectorAll('#main textarea, #main input');for(var i=0;i<f.length;i++){var el=f[i];if(el.type==='checkbox'||el.type==='radio')continue;if((el.value||'').trim())return true;}return false;}
function refSig(s){try{var m=(s.messages||[]).map(function(x){return x.id+':'+(x.category||'')+':'+((x.body||'').length);}).join(',');return m+'|'+((s.grocery||[]).length)+'|'+(((s.quotes&&s.quotes.quotes)||[]).length)+'|'+((s.movieQueue||[]).length)+'|'+((s.reviewQueue||[]).length)+'|'+((s.rsvp||[]).length);}catch(e){return 'x'+Date.now();}}
function safeRefresh(){if(!['home','board','grocery','quotes'].includes(cur))return;if(userBusy()||hasDraft())return;fetch('/api/state').then(function(r){return r.json();}).then(function(ns){if(!ns||ns.pending)return;var sig=refSig(ns);if(sig===window.__refSig)return;window.__refSig=sig;load();}).catch(function(){});}
setInterval(safeRefresh,20000);
(function(){try{if(/[?&]digest=off/.test(location.search)){fetch('/api/digest/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({off:1})}).then(function(){alert('Daily digest turned OFF. You can turn it back on in Settings.');});}else if(/[?&]digest=on/.test(location.search)){fetch('/api/digest/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({off:0})}).then(function(){alert('Daily digest turned ON.');});}}catch(e){}})();
<\/script><div id="nqWrap" onclick="if(event.target===this)noteQuickClose()"><div class="nq">
  <h3>Quick note</h3>
  <div class="nqsub">Pick a type and any actions, then send it to your Personal Notes.</div>
  <div class="nqlbl">Type</div>
  <div class="nqtags nqtwo" id="nqTypes">
    <span class="nqtag on" data-t="note" onclick="nqType(this)">📝 Note</span>
    <span class="nqtag" data-t="shopping" onclick="nqType(this)">🛒 Shopping List</span>
    <span class="nqtag" data-t="idea" onclick="nqType(this)">💡 Idea</span>
  </div>
  <div class="nqlbl">Actions <span class="nqlblh">(tap any — they stack)</span></div>
  <div class="nqtags nqtwo" id="nqActs">
    <span class="nqact king" data-a="king" onclick="nqAct(this)">👑 For Jesse (King)</span>
    <span class="nqact urgent" data-a="urgent" onclick="nqAct(this)">❗ Urgent!</span>
    <span class="nqact reminder" data-a="reminder" onclick="nqAct(this)">⏰ Reminder!</span>
  </div>
  <div id="nqRemBox"></div>
  <textarea id="nqText" placeholder="Type or talk... (tap your keyboard mic to dictate)"></textarea>
  <div class="nqmic">Tip: tap the mic on your phone keyboard to talk instead of type.</div>
  <div class="nqrow">
    <button class="nqsend" id="nqSend" disabled onclick="noteQuickSend()">Send to Forum Personal Notes!</button>
    <button class="nqcancel" onclick="noteQuickClose()">Cancel</button>
  </div>
</div></div>
<div class="nqtoast" id="nqToast">Saved to Personal Notes</div>
</body></html>`;
export {
  index_default as default
};
