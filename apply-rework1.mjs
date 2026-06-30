// apply-rework1.mjs - Phase 1 rework of the Quick Note composer + cleanup.
// 1) remove the 2 duplicate header buttons I added   2) remove the standalone bug modal block
// 3) move Sign Out from header into Control Panel     4) add a Report Bug type to the composer
// 5) relabel the send button + add a contextual Day Manager / Forum link.
// Keeps the crown fix + /api/bug/* routes. Injected client JS is ESCAPE-FREE (no backslashes).
import fs from "node:fs";

const SRC = process.argv[2] || "src/index.js";
let s = fs.readFileSync(SRC, "utf8");
const before = s.length;

function must(c, m){ if(!c){ console.error("ABORT: " + m); process.exit(2); } }
function once(needle, label){
  const n = s.split(needle).length - 1;
  must(n === 1, label + " - expected 1 anchor, found " + n);
}
function swap(needle, repl, label){ once(needle, label); s = s.replace(needle, repl); }

must(s.indexOf('data-t="bug"') === -1 && s.indexOf("nqDeviceInfo") === -1, "already applied");

/* 1) remove the two header buttons I added */
const hdrBtns =
  '<button type="button" class="pulseHdrBtn" onclick="notesOpenPanel()" title="Open your Personal Notes">\u{1F4DD} <span class="pulseHdrTxt">Notes</span></button>'
+ '<button type="button" class="pulseHdrBtn bug" onclick="PulseBug.open()" title="Report a bug">\u{1F41E} <span class="pulseHdrTxt">Report Bug</span></button>';
swap(hdrBtns, "", "header buttons");

/* 2) remove Sign Out from the header (re-homed in Control Panel below) */
const signout = '<a href="/cdn-cgi/access/logout">Sign Out</a>';
swap(signout, "", "header Sign Out");

/* 3) remove the standalone bug modal block (style+script) before </body> */
const bugStart = s.indexOf("<style>/* PULSE Report-Bug");
must(bugStart !== -1, "bug block start not found");
const bugEnd = s.indexOf("</body></html>", bugStart);
must(bugEnd !== -1 && (bugEnd - bugStart) < 60000, "bug block end not found");
s = s.slice(0, bugStart) + s.slice(bugEnd);

/* 4) re-home Sign Out inside Control Panel */
swap(
  "<h2>\u{1F39B} Control Panel</h2></div>';",
  "<h2>\u{1F39B} Control Panel</h2></div>';h+='<div class=\"card\"><h2 style=\"font-size:1rem\">Session</h2><a class=\"mini\" href=\"/cdn-cgi/access/logout\" style=\"display:inline-block;text-decoration:none\">\u{23CF} Sign Out</a></div>';",
  "Control Panel head"
);

/* 5) Report Bug type chip (after Idea) */
swap(
  '<span class="nqtag" data-t="idea" onclick="nqType(this)">\u{1F4A1} Idea</span>',
  '<span class="nqtag" data-t="idea" onclick="nqType(this)">\u{1F4A1} Idea</span><span class="nqtag" data-t="bug" onclick="nqType(this)">\u{1F41E} Report Bug</span>',
  "Idea chip"
);

/* 6) bug box placeholder (after reminder box) */
swap('<div id="nqRemBox"></div>', '<div id="nqRemBox"></div><div id="nqBugBox" style="display:none"></div>', "nqRemBox");

/* 7) contextual link (after the mic tip) */
swap(
  '<div class="nqmic">Tip: tap the mic on your phone keyboard to talk instead of type.</div>',
  '<div class="nqmic">Tip: tap the mic on your phone keyboard to talk instead of type.</div><div class="nqlinkrow"><a id="nqLink" class="nqlink" href="#" onclick="nqGoLink(event)">Open Forum / Personal Notes</a></div>',
  "mic tip"
);

/* 8) relabel send button */
swap(
  '<button class="nqsend" id="nqSend" disabled onclick="noteQuickSend()">Send to Forum Personal Notes!</button>',
  '<button class="nqsend" id="nqSend" disabled onclick="noteQuickSend()">Save to Personal Notes in Forum.</button>',
  "send button"
);

/* 9) helpers + extended nqType (escape-free; sentinel-wrapped for the served check) */
const oldNqType = "function nqType(el){__nqType=el.dataset.t;var p=el.parentNode.querySelectorAll('.nqtag');for(var i=0;i<p.length;i++)p[i].classList.remove('on');el.classList.add('on');}";
const helpers = `/* RW1-helpers */
function nqEsc(s){s=String(s==null?'':s);return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function nqDeviceInfo(){var ua=navigator.userAgent||'';function H(x){return ua.indexOf(x)>=0;}var os='Unknown';if(H('Windows NT 10'))os='Windows 10/11';else if(H('Windows'))os='Windows';else if(H('iPhone'))os='iOS (iPhone)';else if(H('iPad'))os='iPadOS';else if(H('Android'))os='Android';else if(H('Mac OS X'))os='macOS';else if(H('Linux'))os='Linux';var br='Unknown';if(H('Edg'))br='Edge';else if(H('OPR')||H('Opera'))br='Opera';else if(navigator.brave)br='Brave';else if(H('Chrome'))br='Chrome';else if(H('Firefox'))br='Firefox';else if(H('Safari'))br='Safari';var kind=(H('Mobi')||H('iPhone')||H('Android'))?'Phone':'Desktop';return{url:location.href,ua:ua,platform:kind+' / '+os,browser:br,viewport:window.innerWidth+' x '+window.innerHeight};}
function nqBugFill(){var bx=document.getElementById('nqBugBox');if(!bx||bx.getAttribute('data-ready')==='1')return;var d=nqDeviceInfo();bx.setAttribute('data-ready','1');bx.innerHTML='<div class="nqbugmeta">'+nqEsc(d.platform)+' &middot; '+nqEsc(d.browser)+' &middot; '+nqEsc(d.viewport)+'</div><label class="nqbugfile">Attach a screenshot (optional)<input type="file" accept="image/*" onchange="nqBugShot(this)"></label><div id="nqBugStat" class="nqbugstat"></div>';}
function nqBugShot(input){var f=input&&input.files&&input.files[0];var st=document.getElementById('nqBugStat');if(!f){window.__nqBugShot='';if(st)st.textContent='';return;}var r=new FileReader();r.onload=function(){window.__nqBugShot=r.result||'';if(st)st.textContent='Screenshot attached ('+Math.round((r.result||'').length/1024)+' KB).';};r.readAsDataURL(f);}
function nqGoLink(e){if(e&&e.preventDefault)e.preventDefault();var t=__nqType;if(t==='shopping'||t==='idea'||t==='event'){location.href='/daymanager';}else{noteQuickClose();notesOpenPanel();}}
function nqSync(){var t=__nqType;var bx=document.getElementById('nqBugBox');if(bx){if(t==='bug'){bx.style.display='block';nqBugFill();}else{bx.style.display='none';}}var lk=document.getElementById('nqLink');if(lk){var dm=(t==='shopping'||t==='idea'||t==='event');lk.textContent=dm?'Open Day Manager':'Open Forum / Personal Notes';}var sb=document.getElementById('nqSend');if(sb)sb.textContent=(t==='shopping')?'Add to Shopping List':(t==='idea')?'Save Idea to Personal Notes':(t==='bug')?'Send Bug Report to the King':'Save to Personal Notes in Forum.';}
function nqType(el){__nqType=el.dataset.t;var p=el.parentNode.querySelectorAll('.nqtag');for(var i=0;i<p.length;i++)p[i].classList.remove('on');el.classList.add('on');nqSync();}
/* RW1-end */`;
swap(oldNqType, helpers, "nqType");

/* 10) bug branch inside noteQuickSend (after the shopping branch) */
const shopBranch = "if(type==='shopping'){post('/api/grocery',{name:v,freq:'once'});nqReset();nqToast('Added to Shopping List ✓');return;}";
const bugBranch = "if(type==='bug'){var di=nqDeviceInfo();var fb=v+(acts.urgent?' [URGENT]':'')+(acts.king?' [For King]':'');var jobs=[notesPost('/api/bug/report',{url:di.url,ua:di.ua,platform:di.platform,browser:di.browser,viewport:di.viewport,feedback:fb,shot:window.__nqBugShot||''})];if(acts.reminder){var bd=window.__remExact?window.__remExact:(Date.now()+remStepMs(REMSTEPS[window.__remIdx==null?1:window.__remIdx]));jobs.push(notesPost('/api/reminders',{title:'Bug: '+v.slice(0,50),body:v,due_at:bd,channels:['inapp','email'],repeat_kind:''}));}Promise.all(jobs).then(function(){window.__nqBugShot='';nqReset();nqToast('Bug report sent to the King ✓');});return;}";
swap(shopBranch, shopBranch + bugBranch, "shopping branch");

/* 11) small CSS before </body> */
const css = '<style>.nqlinkrow{margin:6px 0 2px;text-align:center}.nqlink{color:#5fd0ff;font-size:.82rem;text-decoration:none;border-bottom:1px dashed rgba(0,229,255,.4);cursor:pointer}.nqlink:hover{color:#9fe9ff}#nqBugBox{margin:8px 0;padding:10px;border:1px solid rgba(255,45,85,.35);border-radius:9px;background:rgba(255,45,85,.06)}.nqbugmeta{font-size:.74rem;color:#ffd2dc;margin-bottom:8px}.nqbugfile{display:block;font-size:.8rem;color:#cdeeff}.nqbugfile input{display:block;margin-top:5px;font-size:.78rem;color:#cdeeff}.nqbugstat{font-size:.72rem;color:#8fd9ff;margin-top:5px}</style>';
const bc = "</body></html>";
once(bc, "</body></html>");
s = s.replace(bc, css + bc);

fs.writeFileSync(SRC, s);
console.log("OK rework1 applied. bytes " + before + " -> " + s.length + " (delta " + (s.length - before) + ")");
