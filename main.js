/* HOOD USDP — original concept site (main.js)
 * All front-end demo: phone send animation, live sealed-ledger feed,
 * privacy chips, count-ups, reveal. Nothing moves real money.
 */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  /* cursor + nav + reveal */
  (function () {
    var g = $("#cursorGlow");
    if (g && window.matchMedia("(hover:hover)").matches)
      window.addEventListener("mousemove", function (e) { g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; });
    var nav = $("#nav");
    var on = function () { if (nav) nav.classList.toggle("scrolled", window.scrollY > 12); };
    on(); window.addEventListener("scroll", on, { passive: true });
    var els = $$(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
      els.forEach(function (e) { io.observe(e); });
    } else els.forEach(function (e) { e.classList.add("in"); });
  })();

  /* count-ups */
  (function () {
    var nums = $$("[data-count]");
    var run = function (el) {
      var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10), suf = el.dataset.suffix || "", t0 = null, dur = 1300;
      var step = function (t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (target * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec) + suf; };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }); }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* privacy chips toggle */
  $$("#psPrivacy .chip").forEach(function (c) { c.addEventListener("click", function () { c.classList.toggle("on"); }); });

  /* phone send demo */
  (function () {
    var screen = $("#phoneScreen"), send = $("#psSend");
    if (!send) return;
    function fmtAmt(v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0; return n.toFixed(2); }
    function randHash() { var h = "0123456789abcdef", s = "0x"; for (var i = 0; i < 40; i++) s += h[Math.floor(Math.random() * 16)]; return s; }
    send.addEventListener("click", function () {
      var to = ($("#toPhone").value || "your contact").trim();
      var amt = fmtAmt($("#amount").value);
      send.disabled = true; send.textContent = "Sealing amount…";
      setTimeout(function () { send.textContent = "Generating ZK proof…"; }, 620);
      setTimeout(function () { send.textContent = "Settling…"; }, 1240);
      setTimeout(function () {
        var ov = document.createElement("div");
        ov.className = "ps-success";
        ov.innerHTML =
          '<div class="ps-check">✓</div>' +
          '<h4>Sent privately</h4>' +
          '<p>$' + amt + ' USDG → ' + to + '</p>' +
          '<p class="dim">they\'ll get a text to claim — no wallet needed</p>' +
          '<p class="hash">tx ' + randHash() + '</p>' +
          '<button class="ps-again">send another</button>';
        screen.appendChild(ov);
        requestAnimationFrame(function () { ov.classList.add("show"); });
        ov.querySelector(".ps-again").addEventListener("click", function () {
          ov.classList.remove("show");
          setTimeout(function () { ov.remove(); }, 350);
          send.disabled = false; send.textContent = "Send privately";
        });
        // also drop a row into the live ledger
        pushLedger(true);
      }, 1900);
    });
  })();

  /* live sealed-ledger feed */
  var ledgerBody = $("#ledgerBody");
  function pushLedger(mine) {
    if (!ledgerBody) return;
    var hash = "0x" + Math.random().toString(16).slice(2, 8) + "…" + Math.random().toString(16).slice(2, 6);
    var row = document.createElement("div");
    row.className = "ledger-row";
    row.innerHTML = '<span class="lx"><b>' + hash + '</b> · transfer' + (mine ? ' · you' : '') + '</span><span class="sealed">🔒 sealed</span>';
    ledgerBody.insertBefore(row, ledgerBody.firstChild);
    while (ledgerBody.children.length > 8) ledgerBody.removeChild(ledgerBody.lastChild);
  }
  (function () {
    if (!ledgerBody) return;
    for (var i = 0; i < 6; i++) pushLedger(false);
    var loop = function () { pushLedger(false); setTimeout(loop, rand(1400, 3200)); };
    var box = $("#ledger"), started = false, go = function () { if (started) return; started = true; loop(); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: 0.3 });
      io.observe(box);
    } else go();
  })();

  /* get-app form */
  var getBtn = $("#getBtn");
  if (getBtn) getBtn.addEventListener("click", function () {
    var note = $("#getNote"), phone = ($("#getPhone").value || "").trim();
    if (!phone) { note.textContent = "enter a phone number first"; note.classList.remove("ok"); return; }
    getBtn.textContent = "Sending…"; getBtn.disabled = true;
    setTimeout(function () {
      note.textContent = "✓ link on its way to " + phone + " · demo only";
      note.classList.add("ok");
      getBtn.textContent = "Send me the app"; getBtn.disabled = false;
    }, 900);
  });
})();
