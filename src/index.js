// Clemit Family Hub — D1-backed, per-user, role-aware, media-rich
const DAY=86400000, PERIOD={weekly:7*DAY, monthly:30*DAY};
function json(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});}
function whoami(req){return req.headers.get("Cf-Access-Authenticated-User-Email")||"guest";}
async function getUser(env,email){const r=await env.DB.prepare("SELECT * FROM users WHERE email=?").bind(email).first();if(r)return r;return {email,name:email.split("@")[0],role:"guest",grocery_access:0};}
async function getSetting(env,k){const r=await env.DB.prepare("SELECT value FROM settings WHERE key=?").bind(k).first();return r?r.value:null;}
export default {
  async fetch(req,env){
    const url=new URL(req.url), p=url.pathname;
    const me=await getUser(env,whoami(req));
    const isAdmin=me.role==="admin";
    const guestShare=(await getSetting(env,"guest_grocery"))==="1";
    const groceryVisible=me.grocery_access===1||guestShare;
    const requireAdmin=()=>{if(!isAdmin)throw new Error("admin only");};
    try{
      if(p==="/api/state"){
        const grocery=groceryVisible?(await env.DB.prepare("SELECT * FROM grocery_items ORDER BY id").all()).results:[];
        const messages=(await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 50").all()).results;
        const rsvp=(await env.DB.prepare("SELECT * FROM rsvp ORDER BY id DESC").all()).results;
        const media=(await env.DB.prepare("SELECT * FROM media ORDER BY COALESCE(taken_at,created_at) DESC LIMIT 300").all()).results;
        let users=[]; if(isAdmin) users=(await env.DB.prepare("SELECT * FROM users ORDER BY role, name").all()).results;
        return json({me:{name:me.name,role:me.role,isAdmin},groceryVisible,guestShare,grocery,messages,rsvp,media,users});
      }
      if(p==="/api/grocery"&&req.method==="POST"){if(!groceryVisible)return json({error:"no access"},403);const b=await req.json();const name=(b.name||"").trim();const freq=["once","weekly","monthly"].includes(b.freq)?b.freq:"once";if(!name)return json({error:"name required"},400);await env.DB.prepare("INSERT INTO grocery_items (name,freq,last_bought,added_by,created_at) VALUES (?,?,NULL,?,?)").bind(name,freq,me.name,Date.now()).run();return json({ok:true});}
      if(p==="/api/grocery/bought"&&req.method==="POST"){if(!groceryVisible)return json({error:"no access"},403);const b=await req.json();await env.DB.prepare("UPDATE grocery_items SET last_bought=? WHERE id=?").bind(Date.now(),b.id).run();return json({ok:true});}
      if(p==="/api/grocery/delete"&&req.method==="POST"){if(!groceryVisible)return json({error:"no access"},403);const b=await req.json();await env.DB.prepare("DELETE FROM grocery_items WHERE id=?").bind(b.id).run();return json({ok:true});}
      if(p==="/api/message"&&req.method==="POST"){const b=await req.json();const body=(b.body||"").trim();if(!body)return json({error:"empty"},400);await env.DB.prepare("INSERT INTO messages (author,body,created_at) VALUES (?,?,?)").bind(me.name,body,Date.now()).run();return json({ok:true});}
      if(p==="/api/rsvp"&&req.method==="POST"){const b=await req.json();await env.DB.prepare("INSERT INTO rsvp (year,household,headcount,note,created_at) VALUES (?,?,?,?,?)").bind(b.year||2027,(b.household||me.name).trim(),b.headcount||0,(b.note||"").trim(),Date.now()).run();return json({ok:true});}
      if(p==="/api/media"&&req.method==="POST"){const b=await req.json();const u=(b.url||"").trim();if(!u)return json({error:"url required"},400);const kind=["song","photo","video"].includes(b.kind)?b.kind:"photo";const people=(b.people||"").trim(),place=(b.place||"").trim(),caption=(b.caption||"").trim();if(kind!=="song"&&!people&&!place&&!caption)return json({error:"add a person, place, or caption so it is not junk"},400);await env.DB.prepare("INSERT INTO media (kind,title,url,added_by,created_at,people,place,caption,taken_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(kind,(b.title||"").trim(),u,me.name,Date.now(),people,place,caption,b.taken_at?new Date(b.taken_at).getTime():null).run();return json({ok:true});}
      if(p==="/api/media/delete"&&req.method==="POST"){requireAdmin();const b=await req.json();await env.DB.prepare("DELETE FROM media WHERE id=?").bind(b.id).run();return json({ok:true});}
      if(p==="/api/admin/user"&&req.method==="POST"){requireAdmin();const b=await req.json();const em=(b.email||"").trim().toLowerCase();if(!em)return json({error:"email required"},400);await env.DB.prepare("INSERT OR REPLACE INTO users (email,name,role,grocery_access,created_at,approved_by) VALUES (?,?,?,?,?,?)").bind(em,(b.name||em.split("@")[0]).trim(),b.role||"member",b.grocery_access?1:0,Date.now(),me.email).run();return json({ok:true});}
      if(p==="/api/admin/user/delete"&&req.method==="POST"){requireAdmin();const b=await req.json();if((b.email||"").toLowerCase()===me.email.toLowerCase())return json({error:"cannot remove yourself"},400);await env.DB.prepare("DELETE FROM users WHERE email=?").bind((b.email||"").toLowerCase()).run();return json({ok:true});}
      if(p==="/api/admin/setting"&&req.method==="POST"){requireAdmin();const b=await req.json();await env.DB.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind(b.key,String(b.value)).run();return json({ok:true});}
      if(p==="/"||p==="/index.html")return new Response(HTML,{headers:{"content-type":"text/html; charset=utf-8"}});
      return new Response("Not found",{status:404});
    }catch(e){return json({error:String(e)},500);}
  }
};

const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>Clemit Family</title>
<style>
:root{--bg:#0f1115;--panel:#181c24;--panel2:#1f2430;--line:#2a3040;--txt:#e8eaf0;--dim:#9aa3b5;--acc:#4fc3f7;--acc2:#81c784;--warn:#ffb74d;--due:#ef5350;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--txt);font:16px/1.55 'Segoe UI',system-ui,sans-serif;min-height:100vh;}
header{padding:22px 28px 4px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
header h1{font-size:1.5rem;}header h1 span{color:var(--acc);}
.role{font-size:.7rem;padding:2px 9px;border-radius:20px;border:1px solid var(--acc2);color:var(--acc2);text-transform:uppercase;}
header .right{margin-left:auto;display:flex;gap:14px;align-items:center;color:var(--dim);font-size:.85rem;}
header .right a{color:var(--dim);text-decoration:none;}header .right a:hover{color:var(--acc);}
.greet{padding:2px 28px 0;color:var(--dim);}
.segwrap{padding:14px 28px;}
.seg{position:relative;display:inline-flex;background:var(--panel2);border:1px solid var(--line);border-radius:24px;padding:4px;gap:2px;max-width:100%;overflow:auto;}
.seg button{position:relative;z-index:2;background:none;border:none;color:var(--dim);padding:8px 16px;border-radius:20px;cursor:pointer;font-size:.9rem;white-space:nowrap;transition:color .2s;}
.seg button.active{color:#062033;font-weight:600;}
.seg .slider{position:absolute;z-index:1;top:4px;bottom:4px;background:var(--acc);border-radius:20px;transition:left .28s cubic-bezier(.4,0,.2,1),width .28s cubic-bezier(.4,0,.2,1);}
main{padding:6px 28px 48px;max-width:1100px;margin:0 auto;}
.view{animation:slidein .28s ease;}
@keyframes slidein{from{opacity:0;transform:translateX(14px);}to{opacity:1;transform:none;}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:18px;}
.card h2{font-size:1.1rem;margin-bottom:4px;display:flex;gap:9px;align-items:center;}
.card .sub{color:var(--dim);font-size:.85rem;margin-bottom:14px;}
.row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
input,select,textarea{background:var(--panel2);border:1px solid var(--line);color:var(--txt);padding:9px 11px;border-radius:8px;font-size:.92rem;font-family:inherit;}
input{flex:1 1 140px;}select{flex:1 1 110px;}textarea{flex:1 1 100%;min-height:50px;resize:vertical;}
button.go{background:var(--acc);color:#062033;border:none;padding:9px 16px;border-radius:8px;font-weight:600;cursor:pointer;}button.go:hover{filter:brightness(1.1);}
ul{list-style:none;}li{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid var(--line);}li:last-child{border-bottom:none;}.iname{flex:1;}
.badge{font-size:.7rem;padding:2px 8px;border-radius:20px;border:1px solid var(--line);color:var(--dim);white-space:nowrap;}
.badge.due{color:#fff;background:var(--due);border-color:var(--due);font-weight:600;}.badge.window{color:var(--warn);border-color:var(--warn);}
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
footer{text-align:center;color:#5a5f6b;font-size:.76rem;padding:22px;}
</style></head><body>
<header><h1>Clemit <span>Family</span></h1><span class="role" id="role">...</span>
<div class="right"><span id="clock"></span><a href="/cdn-cgi/access/logout">Sign out</a></div></header>
<div class="greet" id="greet"></div>
<div class="segwrap"><div class="seg" id="seg"><span class="slider" id="slider"></span></div></div>
<main id="main"></main>
<footer>family.clemits.com - your space</footer>
<script>
const DAY=86400000,PERIOD={weekly:7*DAY,monthly:30*DAY};
let S={},cur='home';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function clock(){document.getElementById('clock').textContent=new Date().toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'});}
clock();setInterval(clock,30000);
function photoOf(name){if(!name)return null;const n=name.toLowerCase();const m=S.media.find(x=>x.kind==='photo'&&(x.people||'').toLowerCase().includes(n));return m?m.url:null;}
async function load(){S=await (await fetch('/api/state')).json();document.getElementById('role').textContent=S.me.role;document.getElementById('greet').textContent='Welcome back, '+S.me.name+'.';buildNav();render();}
function tabs(){const t=[['home','Home']];if(S.groceryVisible)t.push(['grocery','Grocery']);t.push(['board','Board'],['dj','DJ Library'],['reunion','Reunion 2027']);if(S.me.isAdmin)t.push(['admin','Admin']);return t;}
function buildNav(){const seg=document.getElementById('seg');[...seg.querySelectorAll('button')].forEach(b=>b.remove());tabs().forEach(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.dataset.v=id;b.onclick=()=>show(id);if(id===cur)b.classList.add('active');seg.appendChild(b);});moveSlider();}
function moveSlider(){const seg=document.getElementById('seg');const a=seg.querySelector('button.active');const s=document.getElementById('slider');if(a){s.style.left=a.offsetLeft+'px';s.style.width=a.offsetWidth+'px';}}
function show(v){cur=v;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));moveSlider();render();}
function render(){const m=document.getElementById('main');const fn={home:homeView,grocery:groceryView,board:boardView,dj:djView,reunion:reunionView,admin:adminView}[cur]||homeView;m.innerHTML='<div class="view">'+fn()+'</div>';setTimeout(moveSlider,0);}
function homeView(){let h='<div class="card"><h2>Welcome, '+esc(S.me.name)+'</h2><div class="sub">Your stuff, in one place.</div>';const feat=S.media.find(x=>x.kind==='photo');if(feat)h+='<div class="feature"><img src="'+esc(feat.url)+'"><div class="cap">'+esc(feat.caption||'')+(feat.place?' - '+esc(feat.place):'')+(feat.people?' - '+esc(feat.people):'')+'</div></div>';if(S.groceryVisible){const due=S.grocery.filter(gDue);h+='<p>'+due.length+' grocery item(s) need attention.</p>';}if(S.messages[0])h+='<p style="margin-top:8px">Latest from <b>'+esc(S.messages[0].author)+'</b>: '+esc(S.messages[0].body.slice(0,80))+'</p>';h+='<p style="margin-top:8px">Reunion 2027: <b>'+S.rsvp.length+'</b> RSVP(s).</p></div>';return h;}
function gDue(it){if(!it.last_bought)return true;if(it.freq==='once')return false;return (Date.now()-it.last_bought)>=PERIOD[it.freq];}
function gState(it){if(!it.last_bought)return'due';if(it.freq==='once')return'done';return (Date.now()-it.last_bought)>=PERIOD[it.freq]?'due':'waiting';}
function dLeft(it){return Math.max(0,Math.ceil((PERIOD[it.freq]-(Date.now()-it.last_bought))/DAY));}
function groceryView(){let h='<div class="card"><h2>Shared Grocery</h2><div class="sub">Yours and Jaemies'+(S.guestShare?' (shared with guests now)':'')+'. Weekly re-ups after 7 days, monthly after 30.</div><div class="row"><input id="gn" placeholder="Add item..." onkeydown="if(event.key===String.fromCharCode(69,110,116,101,114))addG()"><select id="gf"><option value="once">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select><button class="go" onclick="addG()">Add</button></div><ul>';const live=S.grocery.filter(it=>gState(it)!=='done').sort((a,b)=>(gState(a)==='due'?0:1)-(gState(b)==='due'?0:1));if(!live.length)h+='<li class="empty">List is empty.</li>';for(const it of live){const st=gState(it);const fq=it.freq!=='once'?'<span class="badge">'+it.freq+'</span>':'';const bd=st==='due'?'<span class="badge due">'+(it.freq==='once'?'buy':'re-up')+'</span>':'<span class="badge window">'+dLeft(it)+'d</span>';h+='<li class="'+(st==='waiting'?'checked':'')+'"><span class="iname">'+esc(it.name)+'</span>'+fq+bd+(st==='due'?'<button class="mini" onclick="gotG('+it.id+')">got it</button>':'')+'<button class="mini" onclick="delG('+it.id+')">x</button></li>';}return h+'</ul></div>';}
function boardView(){let h='<div class="card"><h2>Family Board</h2><div class="sub">Everyone signed in sees this. Posts show whos involved.</div><div class="row"><textarea id="mb" placeholder="Write a message... (mention names and their photos show up)"></textarea><button class="go" onclick="addM()">Post</button></div>';if(!S.messages.length)h+='<div class="empty">No messages yet.</div>';for(const x of S.messages){const av=photoOf(x.author);const who=av?'<img src="'+esc(av)+'">':'<div class="ph">'+esc((x.author||'?')[0].toUpperCase())+'</div>';const around=[];const lower=(x.body||'').toLowerCase();const seen={};S.media.forEach(mm=>{(mm.people||'').split(/[,;]/).forEach(nm=>{nm=nm.trim();if(nm&&nm.toLowerCase()!==(x.author||'').toLowerCase()&&lower.includes(nm.toLowerCase())&&!seen[nm.toLowerCase()]){seen[nm.toLowerCase()]=1;if(mm.kind==='photo')around.push(mm.url);}});});const aroundH=around.length?'<div class="around">'+around.slice(0,5).map(u=>'<img src="'+esc(u)+'">').join('')+'</div>':'';h+='<div class="msg"><div class="who">'+who+'<small>'+esc(x.author)+'</small></div><div class="body"><span class="t">'+new Date(x.created_at).toLocaleDateString()+'</span><br>'+esc(x.body)+aroundH+'</div></div>';}return h+'</div>';}
function meta(x){return '<b>'+esc(x.caption||x.title||'(untitled)')+'</b>'+(x.people?'<br>'+esc(x.people):'')+(x.place?'<br>'+esc(x.place):'');}
function cell(x){return '<div class="gcell"><img src="'+esc(x.url)+'" onclick="window.open(this.src)"><div class="cap">'+meta(x)+(S.me.isAdmin?' <button class="mini" onclick="delMedia('+x.id+')">x</button>':'')+'</div></div>';}
function djView(){let h='<div class="card"><h2>DJ Library</h2><div class="sub">Songs, pictures, video - Jesses library. Tag people and places so it stays sortable.</div><div class="row"><input id="mu" placeholder="URL of song / image / video..." style="flex:2 1 200px"><select id="mk"><option value="photo">Picture</option><option value="video">Video</option><option value="song">Song</option></select></div><div class="row"><input id="mp" placeholder="People (comma separated)"><input id="ml" placeholder="Place"><input id="mc" placeholder="Caption / meaning"><button class="go" onclick="addMedia()">Add</button></div><div class="row"><input id="mfilter" placeholder="filter by person or place..." oninput="window.__mf=this.value;render()" value="'+esc(window.__mf||'')+'"></div>';const f=(window.__mf||'').toLowerCase();const match=x=>!f||((x.people||'')+' '+(x.place||'')+' '+(x.caption||'')+' '+(x.title||'')).toLowerCase().includes(f);const songs=S.media.filter(x=>x.kind==='song'&&match(x)),photos=S.media.filter(x=>x.kind==='photo'&&match(x)),videos=S.media.filter(x=>x.kind==='video'&&match(x));h+='<h2 style="font-size:.95rem;margin:12px 0 6px">Pictures</h2>';h+=photos.length?'<div class="gallery">'+photos.map(cell).join('')+'</div>':'<div class="empty">No pictures'+(f?' match':' yet')+'.</div>';h+='<h2 style="font-size:.95rem;margin:16px 0 6px">Videos</h2>';h+=videos.length?'<div class="gallery">'+videos.map(x=>'<div class="gcell"><video controls src="'+esc(x.url)+'"></video><div class="cap">'+meta(x)+'</div></div>').join('')+'</div>':'<div class="empty">No videos'+(f?' match':' yet')+'.</div>';h+='<h2 style="font-size:.95rem;margin:16px 0 6px">Songs</h2>';h+=songs.length?songs.map(x=>'<div class="song">'+esc(x.title||x.url)+' <audio controls src="'+esc(x.url)+'" style="height:32px"></audio>'+(S.me.isAdmin?'<button class="mini" onclick="delMedia('+x.id+')">x</button>':'')+'</div>').join(''):'<div class="empty">No songs'+(f?' match':' yet')+'.</div>';return h+'</div>';}
function reunionView(){let h='<div class="card"><h2>Reunion 2027 - RSVP</h2><div class="sub">Your household and headcount for the San Antonio base.</div><div class="row"><input id="rh" placeholder="Household"><input id="rc" type="number" placeholder="#" style="flex:0 1 90px"><input id="rn" placeholder="Note"><button class="go" onclick="addR()">RSVP</button></div><ul>';h+=S.rsvp.length?S.rsvp.map(r=>'<li><span class="iname">'+esc(r.household)+(r.note?' - '+esc(r.note):'')+'</span><span class="badge">'+r.headcount+' coming</span></li>').join(''):'<li class="empty">No RSVPs yet.</li>';return h+'</ul></div>';}
function adminView(){let h='<div class="card"><h2>Admin</h2><div class="sub">The user list is permanent - only an admin changes it.</div><p style="margin-bottom:10px">Guest grocery sharing: <b>'+(S.guestShare?'ON':'OFF')+'</b> <button class="mini" onclick="toggleGuest()">'+(S.guestShare?'turn off':'turn on (let guests help shop)')+'</button></p><h2 style="font-size:.95rem;margin:10px 0 6px">Add / update member</h2><div class="row"><input id="ue" placeholder="email"><input id="un" placeholder="name"><select id="ur"><option value="member">member</option><option value="admin">admin</option><option value="guest">guest</option></select><label style="display:flex;align-items:center;gap:5px;color:var(--dim);font-size:.85rem;flex:0"><input type="checkbox" id="ug" style="flex:0;width:auto">grocery</label><button class="go" onclick="addUser()">Save</button></div><p class="sub">Also add their email to the Cloudflare Access policy so they can reach the site.</p><ul>';h+=(S.users||[]).map(u=>'<li><span class="iname">'+esc(u.name)+' - '+esc(u.email)+'</span><span class="badge">'+esc(u.role)+'</span>'+(u.grocery_access?'<span class="badge">grocery</span>':'')+'<button class="mini" onclick="delUser('+JSON.stringify(u.email)+')">remove</button></li>').join('');return h+'</ul></div>';}
async function post(u,b){await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b||{})});await load();}
function addG(){const n=document.getElementById('gn');if(!n.value.trim())return;post('/api/grocery',{name:n.value,freq:document.getElementById('gf').value});}
function gotG(id){post('/api/grocery/bought',{id});}function delG(id){post('/api/grocery/delete',{id});}
function addM(){const t=document.getElementById('mb');if(!t.value.trim())return;post('/api/message',{body:t.value});}
function addR(){const h=document.getElementById('rh');post('/api/rsvp',{year:2027,household:h.value,headcount:+document.getElementById('rc').value||0,note:document.getElementById('rn').value});}
function addMedia(){const u=document.getElementById('mu');if(!u.value.trim())return;post('/api/media',{url:u.value,kind:document.getElementById('mk').value,people:document.getElementById('mp').value,place:document.getElementById('ml').value,caption:document.getElementById('mc').value});}
function delMedia(id){post('/api/media/delete',{id});}
function toggleGuest(){post('/api/admin/setting',{key:'guest_grocery',value:S.guestShare?'0':'1'});}
function addUser(){const e=document.getElementById('ue');if(!e.value.trim())return;post('/api/admin/user',{email:e.value,name:document.getElementById('un').value,role:document.getElementById('ur').value,grocery_access:document.getElementById('ug').checked?1:0});}
function delUser(em){if(confirm('Remove '+em+'?'))post('/api/admin/user/delete',{email:em});}
window.addEventListener('resize',moveSlider);
load();setInterval(()=>{if(['home','board','grocery'].includes(cur))load();},20000);
</script></body></html>`;
