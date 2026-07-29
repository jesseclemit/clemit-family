// PULSE <- MyTriton "Everything" modal.
//  Inserts the shared TCV modal component (same code as mytriton.clemit.net/mt-modal.js:
//  no backticks / no dollar-brace, safe inside the outer template literal) just above
//  mytritonView(), and adds a "🔱 Everything" launcher badge to the MyTriton view header.
//  Links auto-open absolute -> mytriton.clemit.net in a new tab when not on that host.
//  Idempotent; unique anchors; node --check after write.
// Usage: node apply-mytriton-modal.mjs src/index.js
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const target = process.argv[2] || 'src/index.js';
let s = fs.readFileSync(target, 'utf8');

if (s.indexOf('function mtOpen(') >= 0) {
  console.error('MyTriton modal already present - nothing to do.');
  process.exit(2);
}

const MT = `
/* ============================================================
   MyTriton "Everything" modal — shared TCV component.
   Used on mytriton.clemit.net (index.html + rig.html) AND inlined
   into Clemit PULSE (family.clemits.com) via apply-mytriton-modal.mjs.
   RULES so the same code can live inside PULSE's template literal:
   no backticks, no dollar-brace, no closing-script substring.
   Auto-detects host: on mytriton.clemit.net links are relative/_self;
   anywhere else they're absolute/_blank.
   ============================================================ */
function mtHome(){try{return location.hostname==='mytriton.clemit.net';}catch(e){return false;}}
function mtLinks(){
  var B=mtHome()?'':'https://mytriton.clemit.net/';
  return [
    {g:'Live'},
    {t:'Boss Board',        s:'weather · tanks · power · places', ic:'🚐', c:'PUDC',    u:B+'index.html#board'},
    {t:'Drug & Supplement', s:'regimen reference',                ic:'💊', c:'#c678dd', u:B+'index.html#meds'},
    {t:'Family Health Log', s:'symptoms · visits · vitals',       ic:'🩺', c:'#5ee07a', u:B+'index.html#health'},
    {t:'Rig Map',           s:'exploded systems view',            ic:'🗺️', c:'#9fb2c8', u:B+'rig.html'},
    {g:'Knowledge Base'},
    {t:'Rig Overview',      s:'README · system map',              ic:'🚐', c:'PUDC',    u:B+'kb.html?doc=README.md'},
    {t:'Power — 48V/12V',   s:'bank · bus · buffer',              ic:'⚡',       c:'#f5a623', u:B+'kb.html?doc=01-power-12v-architecture.md'},
    {t:'Solar Runtime',     s:'input vs. A/C math',               ic:'☀️', c:'#f5a623', u:B+'kb.html?doc=07-solar-runtime.md'},
    {t:'DC-DC Install',     s:'Daygreen 100A plan',               ic:'🔌', c:'#f5a623', u:B+'kb.html?doc=08-dcdc-install-plan.md'},
    {t:'Generator',         s:'Onan 5500 · charging',             ic:'⛽',       c:'#e0683c', u:B+'kb.html?doc=06-generator-charging.md'},
    {t:'HVAC & Furnace',    s:'A/Cs · thermostat',                ic:'❄️', c:'#5ee07a', u:B+'kb.html?doc=05-hvac-furnace.md'},
    {t:'Water Systems',     s:'fresh · grey · black',             ic:'💧', c:'#3ec5ff', u:B+'kb.html?doc=10-water-system.md'},
    {t:'Network',           s:'Pepwave · Cat6 · APs',             ic:'📡', c:'#4aa3e0', u:B+'kb.html?doc=02-network.md'},
    {t:'Cameras',           s:'4-cam · rear port fix',            ic:'📷', c:'#4aa3e0', u:B+'kb.html?doc=03-cameras.md'},
    {t:'Sensors',           s:'temp · leak · alerts',             ic:'🌡️', c:'#4aa3e0', u:B+'kb.html?doc=04-sensors.md'},
    {t:'Entertainment',     s:'HDMI-over-Cat6 · karaoke',         ic:'🎤', c:'#c678dd', u:B+'kb.html?doc=09-entertainment.md'},
    {t:'Factory Specs',     s:'as-built reference',               ic:'📋', c:'#9fb2c8', u:B+'kb.html?doc=11-factory-specs.md'},
    {t:'Open Questions',    s:'verify before buying',             ic:'❓',       c:'PUDC',    u:B+'kb.html?doc=99-open-questions.md'},
    {t:'Archive Notes',     s:'retired decisions',                ic:'🗄️', c:'#9fb2c8', u:B+'kb.html?doc=98-archive.md'},
    {g:'Design Archive'},
    {t:'Dashboard v1',      s:'original Boss Board',              ic:'🖥️', c:'#9fb2c8', u:B+'archive/dashboard-v1.html'},
    {t:'System Map',        s:'logical wiring map',               ic:'🧭', c:'#9fb2c8', u:B+'archive/system-map.html'},
    {t:'Rig Map v1',        s:'first exploded view',              ic:'🗺️', c:'#9fb2c8', u:B+'archive/rigmap-v1.html'}
  ];
}
function mtCss(){
  if(document.getElementById('mtModalCss'))return;
  var st=document.createElement('style');st.id='mtModalCss';
  st.textContent=
  '#mtOv{position:fixed;inset:0;z-index:9990;display:none;align-items:flex-start;justify-content:center;padding:4vh 14px;overflow-y:auto;background:rgba(3,6,14,.72);backdrop-filter:blur(7px)}'+
  '#mtOv.mtShow{display:flex;animation:mtFade .18s ease-out}'+
  '@keyframes mtFade{from{opacity:0}to{opacity:1}}'+
  '.mtPanel{position:relative;width:min(880px,96vw);background:linear-gradient(165deg,rgba(16,24,44,.96),rgba(7,11,22,.97));border:1px solid rgba(var(--acc-rgb,255,59,84),.32);border-radius:16px;padding:20px 22px 16px;box-shadow:0 0 34px rgba(var(--acc-rgb,255,59,84),.16), inset 0 0 40px rgba(0,0,0,.5);animation:mtPop .22s ease-out}'+
  '@keyframes mtPop{from{transform:translateY(14px) scale(.97);opacity:0}to{transform:none;opacity:1}}'+
  '.mtPanel:before,.mtPanel:after{content:"";position:absolute;width:18px;height:18px;pointer-events:none}'+
  '.mtPanel:before{top:-1px;left:-1px;border-top:2px solid var(--acc,#ff3b54);border-left:2px solid var(--acc,#ff3b54);border-top-left-radius:14px;filter:drop-shadow(0 0 6px var(--acc-glow,rgba(255,59,84,.55)))}'+
  '.mtPanel:after{bottom:-1px;right:-1px;border-bottom:2px solid var(--acc,#ff3b54);border-right:2px solid var(--acc,#ff3b54);border-bottom-right-radius:14px;filter:drop-shadow(0 0 6px var(--acc-glow,rgba(255,59,84,.55)))}'+
  '.mtHead{display:flex;align-items:center;gap:12px;margin-bottom:6px}'+
  '.mtHead b{font-size:1.15em;letter-spacing:.04em;color:#e8eef5;text-shadow:0 0 14px rgba(var(--acc-rgb,255,59,84),.5)}'+
  '.mtHead span{color:#8195ab;font-size:.8em}'+
  '.mtX{margin-left:auto;background:none;border:1px solid rgba(var(--acc-rgb,255,59,84),.4);color:#cfe4ff;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:1em;line-height:1}'+
  '.mtX:hover{border-color:var(--acc,#ff3b54);box-shadow:0 0 10px rgba(var(--acc-rgb,255,59,84),.4)}'+
  '.mtG{font-size:.72em;text-transform:uppercase;letter-spacing:.2em;color:#8195ab;margin:14px 2px 8px;display:flex;align-items:center;gap:10px}'+
  '.mtG:after{content:"";flex:1;height:1px;background:rgba(var(--acc-rgb,255,59,84),.25)}'+
  '.mtGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(196px,1fr));gap:9px}'+
  'a.mtT{display:flex;align-items:center;gap:10px;background:rgba(8,14,30,.72);border:1px solid rgba(255,255,255,.06);border-left:3px solid var(--mtc,#9fb2c8);border-radius:10px;padding:9px 11px;text-decoration:none;color:#e8eef5;font-size:.85em;transition:border-color .12s, box-shadow .12s, transform .12s}'+
  'a.mtT:hover{border-color:rgba(var(--acc-rgb,255,59,84),.55);box-shadow:0 0 12px rgba(var(--acc-rgb,255,59,84),.28);transform:translateY(-1px)}'+
  'a.mtT .ic{width:1.5em;text-align:center;font-size:1.1em;filter:drop-shadow(0 0 4px var(--mtc,#9fb2c8))}'+
  'a.mtT small{display:block;color:#8195ab;font-size:.8em;margin-top:1px}'+
  '.mtSig{margin-top:16px;padding-top:9px;border-top:1px solid rgba(var(--acc-rgb,255,59,84),.18);color:#8195ab;font-size:.72em;letter-spacing:.04em;text-align:center}'+
  'body.mtLock{overflow:hidden}';
  document.head.appendChild(st);
}
function mtClose(){var o=document.getElementById('mtOv');if(o){o.classList.remove('mtShow');document.body.classList.remove('mtLock');}}
function mtOpen(){
  mtCss();
  var o=document.getElementById('mtOv');
  if(!o){
    o=document.createElement('div');o.id='mtOv';
    o.addEventListener('click',function(ev){if(ev.target===o)mtClose();});
    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')mtClose();});
    document.body.appendChild(o);
  }
  var tgt=mtHome()?'_self':'_blank';
  var h='<div class="mtPanel"><div class="mtHead"><b>🔱 MyTriton</b><span>everything on the rig, one tap away</span><button class="mtX" onclick="mtClose()" aria-label="Close">✕</button></div>';
  var L=mtLinks();
  var open=false;
  for(var i=0;i<L.length;i++){
    var d=L[i];
    if(d.g){if(open)h+='</div>';h+='<div class="mtG">'+d.g+'</div><div class="mtGrid">';open=true;continue;}
    var col=(d.c==='PUDC')?'var(--acc,#ff3b54)':d.c;
    h+='<a class="mtT" style="--mtc:'+col+'" href="'+d.u+'" target="'+tgt+'" rel="noopener"><span class="ic">'+d.ic+'</span><span>'+d.t+'<small>'+d.s+'</small></span></a>';
  }
  if(open)h+='</div>';
  h+='<div class="mtSig">Designed, built &amp; documented by <b>Jesse Clemit</b> · MyTriton off-grid platform</div></div>';
  o.innerHTML=h;
  o.classList.add('mtShow');document.body.classList.add('mtLock');
}
`;

// 1) insert component above mytritonView (unique anchor)
const anchor = 'function mytritonView(){';
const i = s.indexOf(anchor);
if (i < 0) throw new Error('anchor not found: function mytritonView');
if (s.indexOf(anchor, i + 1) >= 0) throw new Error('anchor not unique: function mytritonView');
s = s.slice(0, i) + MT + '\n' + s.slice(i);

// 2) launcher badge in the view header (unique anchor)
const oldHead = 'var h=\'<div class="vhead"><h2>🔱 MyTriton</h2></div>\';';
const newHead = 'var h=\'<div class="vhead"><h2>🔱 MyTriton</h2><button class="badge" onclick="mtOpen()" style="cursor:pointer;background:rgba(var(--acc-rgb),.12)">🔱 Everything</button></div>\';';
const j = s.indexOf(oldHead);
if (j < 0) throw new Error('anchor not found: mytritonView vhead line');
if (s.indexOf(oldHead, j + 1) >= 0) throw new Error('anchor not unique: mytritonView vhead line');
s = s.slice(0, j) + newHead + s.slice(j + oldHead.length);

fs.writeFileSync(target, s);
execSync('node --check ' + JSON.stringify(target), { stdio: 'inherit' });
console.log('MyTriton modal applied OK ->', target, s.length, 'bytes; node --check PASS');
