/* PULSE Report-Bug client. ESCAPE-FREE by rule: contains NO backslash characters,
   so it survives the one-big-template-literal page intact (the Notes-Event crash lesson). */
(function(){
  var SHOT = "";          // current screenshot data URL (jpeg)
  var BUSY = false;

  function el(id){ return document.getElementById(id); }

  function bugSys(){
    var ua = navigator.userAgent || "";
    function has(s){ return ua.indexOf(s) >= 0; }
    var os = "Unknown";
    if (has("Windows NT 10")) os = "Windows 10/11";
    else if (has("Windows")) os = "Windows";
    else if (has("iPhone")) os = "iOS (iPhone)";
    else if (has("iPad")) os = "iPadOS";
    else if (has("Android")) os = "Android";
    else if (has("Mac OS X")) os = "macOS";
    else if (has("Linux")) os = "Linux";
    var br = "Unknown";
    if (has("Edg")) br = "Edge";
    else if (has("OPR") || has("Opera")) br = "Opera";
    else if (navigator.brave) br = "Brave";
    else if (has("Chrome")) br = "Chrome";
    else if (has("Firefox")) br = "Firefox";
    else if (has("Safari")) br = "Safari";
    var kind = (has("Mobi") || has("iPhone") || has("Android")) ? "Phone" : "Desktop";
    return {
      url: location.href,
      ua: ua,
      os: os,
      browser: br,
      kind: kind,
      viewport: window.innerWidth + " x " + window.innerHeight
    };
  }

  function loadH2C(cb){
    if (window.html2canvas){ cb(true); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = function(){ cb(true); };
    s.onerror = function(){ cb(false); };
    document.head.appendChild(s);
  }

  function shrink(canvas, maxW, q){
    var w = canvas.width, h = canvas.height;
    if (w > maxW){ h = Math.round(h * (maxW / w)); w = maxW; }
    var c2 = document.createElement("canvas");
    c2.width = w; c2.height = h;
    c2.getContext("2d").drawImage(canvas, 0, 0, w, h);
    return c2.toDataURL("image/jpeg", q);
  }

  function setStatus(t){ var s = el("bugShotStatus"); if (s) s.textContent = t; }

  function capture(){
    var modal = el("bugModal");
    setStatus("Capturing the screen...");
    if (modal) modal.style.visibility = "hidden";
    loadH2C(function(ok){
      if (!ok){
        if (modal) modal.style.visibility = "visible";
        setStatus("Screenshot tool could not load. You can still send the report.");
        return;
      }
      var scale = Math.min(1, 1100 / Math.max(1, window.innerWidth));
      window.html2canvas(document.body, { scale: scale, backgroundColor: "#05060c", logging: false, useCORS: true })
        .then(function(canvas){
          var data = shrink(canvas, 1000, 0.5);
          if (data.length > 320000) data = shrink(canvas, 850, 0.4);
          if (data.length > 320000) data = shrink(canvas, 700, 0.32);
          SHOT = data;
          var img = el("bugShotImg");
          if (img){ img.src = data; img.style.display = "block"; }
          setStatus("Screenshot attached (" + Math.round(data.length / 1024) + " KB). Tap to retake.");
          if (modal) modal.style.visibility = "visible";
        })
        .catch(function(){
          if (modal) modal.style.visibility = "visible";
          setStatus("Could not capture the screen. You can still send the report.");
        });
    });
  }

  function buildModal(){
    if (el("bugModal")) return;
    var info = bugSys();
    var isRoyal = !!(window.S && S.me && (S.me.isRoyal || S.me.isKing));
    var wrap = document.createElement("div");
    wrap.id = "bugModal";
    wrap.className = "bugModal";
    var rows = ""
      + row("Page", info.url)
      + row("Device", info.kind + " / " + info.os)
      + row("Browser", info.browser)
      + row("Screen", info.viewport);
    var royalBtn = isRoyal
      ? "<button type='button' class='bugBtn ghost' onclick='PulseBug.viewReports()'>View reports</button>"
      : "";
    wrap.innerHTML =
      "<div class='bugCard'>"
      +   "<div class='bugHead'><span class='bugTitle'>Report a Bug</span>"
      +     "<button type='button' class='bugX' onclick='PulseBug.close()' title='Close'>&times;</button></div>"
      +   "<div class='bugSub'>Tell us what went wrong. We grab a screenshot and your device info automatically.</div>"
      +   "<div class='bugShotBox' onclick='PulseBug.capture()' title='Tap to (re)capture'>"
      +     "<img id='bugShotImg' alt='screenshot' style='display:none'>"
      +     "<div id='bugShotStatus' class='bugShotStatus'>Preparing screenshot...</div>"
      +   "</div>"
      +   "<div class='bugInfo'>" + rows + "</div>"
      +   "<textarea id='bugFeedback' class='bugTa' placeholder='What happened? What were you trying to do?'></textarea>"
      +   "<div class='bugActions'>"
      +     royalBtn
      +     "<span style='flex:1'></span>"
      +     "<button type='button' class='bugBtn ghost' onclick='PulseBug.close()'>Cancel</button>"
      +     "<button type='button' class='bugBtn go' id='bugSend' onclick='PulseBug.submit()'>Send report</button>"
      +   "</div>"
      +   "<div id='bugReports' class='bugReports'></div>"
      + "</div>";
    document.body.appendChild(wrap);
  }

  function row(k, v){
    return "<div class='bugRow'><span class='bugK'>" + esc(k) + "</span><span class='bugV'>" + esc(v) + "</span></div>";
  }
  function esc(s){
    s = String(s == null ? "" : s);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function open(){
    buildModal();
    SHOT = "";
    var fb = el("bugFeedback"); if (fb) fb.value = "";
    var img = el("bugShotImg"); if (img){ img.style.display = "none"; img.src = ""; }
    var rep = el("bugReports"); if (rep){ rep.style.display = "none"; rep.innerHTML = ""; }
    var m = el("bugModal"); if (m){ m.style.display = "flex"; m.style.visibility = "visible"; }
    setTimeout(capture, 120);
  }

  function close(){ var m = el("bugModal"); if (m) m.style.display = "none"; }

  function submit(){
    if (BUSY) return;
    var fb = el("bugFeedback");
    var text = fb ? (fb.value || "").trim() : "";
    if (!text){ if (fb){ fb.focus(); fb.style.borderColor = "#ff2d55"; } setStatus("Please add a few words first."); return; }
    BUSY = true;
    var btn = el("bugSend"); if (btn){ btn.disabled = true; btn.textContent = "Sending..."; }
    var info = bugSys();
    fetch("/api/bug/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: info.url, ua: info.ua, platform: info.kind + " / " + info.os,
        browser: info.browser, viewport: info.viewport, feedback: text, shot: SHOT
      })
    }).then(function(r){ return r.json(); }).then(function(){
      BUSY = false;
      var card = document.querySelector("#bugModal .bugCard");
      if (card) card.innerHTML = "<div class='bugDone'><div class='bugDoneMark'>&#10003;</div>"
        + "<div class='bugTitle'>Thank you!</div>"
        + "<div class='bugSub'>Your report reached the King. We are on it.</div>"
        + "<button type='button' class='bugBtn go' onclick='PulseBug.close()'>Close</button></div>";
    }).catch(function(){
      BUSY = false;
      if (btn){ btn.disabled = false; btn.textContent = "Send report"; }
      setStatus("Could not send. Check your connection and try again.");
    });
  }

  function viewReports(){
    var rep = el("bugReports");
    if (!rep) return;
    rep.style.display = "block";
    rep.innerHTML = "<div class='bugSub'>Loading reports...</div>";
    fetch("/api/bug/list").then(function(r){ return r.json(); }).then(function(d){
      var list = (d && d.reports) || [];
      if (!list.length){ rep.innerHTML = "<div class='bugSub'>No bug reports yet.</div>"; return; }
      var h = "<div class='bugListHead'>" + list.length + " report(s)</div>";
      list.forEach(function(b){
        var when = new Date(b.created_at || 0).toLocaleString();
        h += "<div class='bugLi' onclick='PulseBug.openReport(" + b.id + ")'>"
          + "<div class='bugLiTop'><b>" + esc(b.reporter_name || b.reporter_email || "someone") + "</b>"
          + "<span class='bugLiWhen'>" + esc(when) + "</span></div>"
          + "<div class='bugLiTxt'>" + esc((b.feedback || "").slice(0, 140)) + "</div>"
          + "<div class='bugLiMeta'>" + esc(b.platform || "") + " &middot; " + esc(b.browser || "") + "</div>"
          + "<div id='bugDetail" + b.id + "' class='bugDetail'></div></div>";
      });
      rep.innerHTML = h;
    }).catch(function(){ rep.innerHTML = "<div class='bugSub'>Could not load reports.</div>"; });
  }

  function openReport(id){
    var box = el("bugDetail" + id);
    if (!box) return;
    if (box.getAttribute("data-open") === "1"){ box.style.display = "none"; box.setAttribute("data-open", "0"); return; }
    box.style.display = "block"; box.setAttribute("data-open", "1");
    box.innerHTML = "<div class='bugSub'>Loading...</div>";
    fetch("/api/bug/get?id=" + id).then(function(r){ return r.json(); }).then(function(d){
      var b = d && d.report;
      if (!b){ box.innerHTML = "<div class='bugSub'>Not found.</div>"; return; }
      var h = "<div class='bugDetUrl'><a href='" + esc(b.url) + "' target='_blank' rel='noopener'>" + esc(b.url) + "</a></div>";
      h += "<div class='bugDetTxt'>" + esc(b.feedback || "") + "</div>";
      h += "<div class='bugDetMeta'>" + esc(b.platform || "") + " &middot; " + esc(b.browser || "") + " &middot; " + esc(b.viewport || "") + "</div>";
      h += "<div class='bugDetUa'>" + esc(b.ua || "") + "</div>";
      if (b.shot) h += "<img class='bugDetShot' src='" + b.shot + "' alt='screenshot'>";
      box.innerHTML = h;
    }).catch(function(){ box.innerHTML = "<div class='bugSub'>Could not load.</div>"; });
  }

  window.PulseBug = { open: open, close: close, capture: capture, submit: submit, viewReports: viewReports, openReport: openReport };
  window.openBugModal = open;
})();
