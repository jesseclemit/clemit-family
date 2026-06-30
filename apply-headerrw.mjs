// apply-headerrw.mjs - header layout rework.
// 1) move the theme-color control between CLEMIT and PULSE, skin it as a diamond "separator"
//    (hover -> "Select a new theme color?")
// 2) left-justify the Good Evening greeting
// 3) drop the blue Notes circle to row 2, left, on the same line as the quote
// 4) quote scrolls + fades out before it reaches the Notes circle.
// All injected CSS is escape-free (no backslashes).
import fs from "node:fs";

const SRC = process.argv[2] || "src/index.js";
let s = fs.readFileSync(SRC, "utf8");
const before = s.length;
function must(c, m){ if(!c){ console.error("ABORT: " + m); process.exit(2); } }
function count(n){ return s.split(n).length - 1; }
function swap(n, r, label){ must(count(n) === 1, label + " - expected 1 anchor, found " + count(n)); s = s.replace(n, r); }

must(s.indexOf("hqscroll") === -1 && s.indexOf("hdnote") === -1, "header rework already applied");

/* 1) lift the whole theme control (button#themeSw + #tcpop popover) out of the header-right */
const tcStart = s.indexOf('<span class="hdColor tcwrap"');
must(tcStart !== -1, "tcwrap not found");
const tcHue = s.indexOf('id="tcHue"', tcStart);
must(tcHue !== -1, "tcHue not found");
const tcEnd = s.indexOf("</div></span>", tcHue) + "</div></span>".length;
must(tcEnd > tcStart && (tcEnd - tcStart) < 1400, "tcwrap end not found");
let tcwrap = s.slice(tcStart, tcEnd);
must(count(tcwrap) === 1, "tcwrap not unique");
s = s.slice(0, tcStart) + s.slice(tcEnd);                 // remove from header-right
// relabel for the new hover text
const diamond = tcwrap.replace(
  'title="Choose your PULSE color" aria-label="Choose your PULSE color"',
  'title="Select a new theme color?" aria-label="Select a new theme color?"');
must(diamond !== tcwrap, "color title not relabelled");

/* ...and drop it between CLEMIT and PULSE in the wordmark */
const wm = '<h1 class="wm"><span class="wmC">Clemit</span> <span class="wmP">Pulse</span></h1>';
swap(wm, '<h1 class="wm"><span class="wmC">Clemit</span> ' + diamond + ' <span class="wmP">Pulse</span></h1>', "wordmark");

/* 2/3) take the Notes circle out of the greeting (it moves to row 2) */
swap("+tail+heroNoteBtn();", "+tail;", "heroRestHtml note btn");

/* 3) put the Notes circle at the left of row 2 (same line as the quote) */
swap(
  '<div class="hdrow hdrow2"><div class="hdQline" id="heroQline">',
  '<div class="hdrow hdrow2"><button class="note-cta hdnote" onclick="noteQuickOpen()" title="Got a note now?" aria-label="Got a note now?">&#128172;</button><div class="hdQline" id="heroQline">',
  "hdrow2");

/* 4) styles: diamond, left greeting, row-2 circle + scrolling/fading quote */
const css = '<style>'
+ '#themeSw{width:14px;height:14px;padding:0;border-radius:3px;transform:rotate(45deg);cursor:pointer;border:1px solid rgba(255,255,255,.3);background:conic-gradient(from 0deg,#ff2d55,#b14bff,#00e5ff,#3affb0,#ffd23f,#ff2d55);box-shadow:0 0 9px rgba(0,229,255,.5)}'
+ '#themeSw:hover{box-shadow:0 0 15px rgba(0,229,255,.95)}'
+ '.wm .tcwrap{margin:0 4px;align-self:center}'
+ '.hdr2 .hdrow1{justify-content:flex-start}'
+ '.hdr2 .hdrow1 .honors{margin-left:auto}'
+ '.hdr2 .hdrow2{justify-content:flex-start;gap:12px;align-items:center}'
+ '.hdnote{flex:none;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(0,229,255,.55);background:rgba(0,229,255,.12);color:#aef0ff;font-size:14px;line-height:1;padding:0}'
+ '.hdnote:hover{background:rgba(0,229,255,.22);box-shadow:0 0 9px rgba(0,229,255,.6)}'
+ '.hdr2 .hdrow2 .hdQline{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 12%,#000 100%);mask-image:linear-gradient(90deg,transparent 0,#000 12%,#000 100%)}'
+ '.hdr2 #heroQwrap{display:inline-block;animation:hqscroll 22s linear infinite}'
+ '@keyframes hqscroll{0%{transform:translateX(6%)}100%{transform:translateX(-110%)}}'
+ '</style>';
swap("</body></html>", css + "</body></html>", "body close");

fs.writeFileSync(SRC, s);
console.log("OK header rework applied. bytes " + before + " -> " + s.length + " (delta " + (s.length - before) + ")");
