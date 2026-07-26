// apply-header-notes-nav.mjs — three surgical header/nav changes.
//  1) NOTES icon moves up to header row 1 as the FIRST element (left of the
//     Clemit/Pulse wordmark) so it is the last thing to disappear as the header
//     narrows. The color "diamond" moves to the RIGHT of Pulse and is the FIRST
//     thing hidden when the screen shrinks (hidden <=600px).
//  2) On phones, the katakana "matrix" decode greeting is skipped — the final
//     greeting shows immediately (you can't read the scramble on a small screen).
//  3) On phones (<=700px) the clipped horizontal tab strip (.seg) is hidden;
//     the MENU button already opens the full menu, so no unreadable stubs.
// Idempotent + anchor-guarded. All injected CSS is backslash-free.
import fs from "node:fs";

const SRC = process.argv[2] || "src/index.js";
let s = fs.readFileSync(SRC, "utf8");
const before = s.length;
function must(c, m){ if(!c){ console.error("ABORT: " + m); process.exit(2); } }
function count(n){ return s.split(n).length - 1; }
function swap(n, r, label){ must(count(n) === 1, label + " - expected 1 anchor, found " + count(n)); s = s.replace(n, r); }

must(s.indexOf("hdNoteLeft") === -1, "header-notes-nav already applied (hdNoteLeft present)");

/* ---- 1a) lift the color diamond (span.hdColor.tcwrap + #tcpop) out of the wordmark ---- */
const tcStart = s.indexOf('<span class="hdColor tcwrap"');
must(tcStart !== -1, "hdColor tcwrap not found");
const tcHue = s.indexOf('id="tcHue"', tcStart);
must(tcHue !== -1, "tcHue not found");
const tcEnd = s.indexOf("</div></span>", tcHue) + "</div></span>".length;
must(tcEnd > tcStart && (tcEnd - tcStart) < 2000, "tcwrap end not found / too long");
let tcwrap = s.slice(tcStart, tcEnd);
must(count(tcwrap) === 1, "tcwrap not unique");
s = s.slice(0, tcStart) + s.slice(tcEnd);   // remove it from between Clemit and Pulse

/* ---- 1b) drop the color diamond back in on the RIGHT side of Pulse ---- */
swap('Pulse</span></h1><span class="tdiv"></span>',
     'Pulse</span></h1>' + tcwrap + '<span class="tdiv"></span>',
     "reinsert color right of Pulse");

/* ---- 1c) pull the row-2 Notes button out ---- */
const noteBtn = '<button class="note-cta hdnote" onclick="noteQuickOpen()" title="Got a note now?" aria-label="Got a note now?">&#128172;</button>';
swap(noteBtn, '', "remove row-2 notes button");

/* ---- 1d) place Notes as the FIRST element of row 1 (left of the wordmark) ---- */
const noteBtnLeft = '<button class="note-cta hdnote hdNoteLeft" onclick="noteQuickOpen()" title="Got a note now?" aria-label="Got a note now?">&#128172;</button>';
swap('<div class="hdrow hdrow1"><h1 class="wm">',
     '<div class="hdrow hdrow1">' + noteBtnLeft + '<h1 class="wm">',
     "insert notes left of wordmark");

/* ---- 2) skip the matrix decode greeting on phones ---- */
const hgPrefix = 'function heroGreetUpd(){var g=document.getElementById(\'heroGreet\');if(!g)return;';
swap(hgPrefix,
     hgPrefix + 'if(typeof heroIsPhone==="function"&&heroIsPhone()){window.__heroIntroDone=true;window.__heroFinished=true;g.innerHTML=heroRestHtml();if(typeof monFitHeader==="function")monFitHeader();return;}',
     "phone greeting bypass");

/* ---- 3) CSS: layout + hide color on phone + hide clipped strip on phone ---- */
const css = '<style>'
+ '.hdr2 .hdrow1{gap:8px}'
+ '.hdr2 .hdNoteLeft{flex:none;margin:0 2px 0 0}'
+ '.hdr2 .hdrow1 .hdColor.tcwrap{margin:0 2px 0 4px;align-self:center}'
+ '@media(max-width:600px){.hdr2 .hdrow1 .hdColor.tcwrap{display:none!important}}'
+ '@media(max-width:700px){.seg{display:none!important}}'
+ '</style>';
swap("</body></html>", css + "</body></html>", "body close");

fs.writeFileSync(SRC, s);
console.log("OK header-notes-nav applied. bytes " + before + " -> " + s.length + " (delta " + (s.length - before) + ")");
