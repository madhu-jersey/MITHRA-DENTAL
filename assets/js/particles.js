/* Sree Mithra — interactive particle field for the home hero.
   A canvas of tiny dots and short dashes in ONE solid colour, read from the
   CSS custom property --particle-color. At rest the field is faint; near the
   cursor particles fade up to full colour, gather into a soft halo around it
   and orbit as it moves, then glide home and fade once it has passed.
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG: every tunable value lives here.
  ------------------------------------------------------------------ */
  var CONFIG = {
    colorVar: "--particle-color",   // single solid colour, set in site.css
    fallbackColor: "#9E0B24",

    // Density: one particle per `spacing` x `spacing` px, capped
    spacing: 46,
    maxParticles: 420,
    mobileFactor: 0.55,             // multiplier under 768px
    lowPowerFactor: 0.6,            // multiplier on low-core / low-memory devices
    copyClearance: 0.92,            // chance to drop a particle behind the headline, text and buttons

    dotRadius: [0.9, 1.7],          // px
    dashLength: [5, 10],            // px
    dashWidth: 1.4,                 // px
    dashRatio: 0.45,                // share of particles drawn as dashes

    // Visibility: one colour, strength rises with closeness to the cursor
    restAlpha: 0.22,                // strength of particles away from the cursor
    activeAlpha: 1,                 // strength right around the cursor
    glowRadius: 290,                // px over which particles fade up
    fadeSpeed: 0.12,                // how quickly strength follows (0-1 per frame)
    alphaLevels: 8,                 // strengths are drawn in this many batches

    // Cursor halo: particles inside `radius` are drawn towards a ring around the cursor
    radius: 320,                    // cursor influence radius (px)
    ringRadius: 70,                 // inner edge of the halo (px)
    ringSpread: 70,                 // halo thickness: each particle picks a spot in this band
    pull: 0.06,                     // strength of the pull towards the halo
    swirl: 0.3,                     // orbit around the cursor
    drag: 0.22,                     // carry particles along with cursor movement
    spring: 0.03,                   // pull back towards home
    releaseSpring: 0.15,            // share of the home spring kept while held by the cursor
    damping: 0.86,                  // velocity kept each frame (lower = calmer)
    maxSpeed: 10,                   // px per frame clamp, prevents jumps

    idleAmplitude: 3,               // px of gentle drift when nothing is happening
    idleSpeed: 0.00045,             // drift speed
    alignToMotion: 0.7,             // how much dashes turn to follow their movement

    touchLinger: 900,               // ms a touch keeps influencing particles
    maxDpr: 2
  };

  var hero = document.querySelector("[data-particles]");
  if (!hero) return;
  var canvas = hero.querySelector(".hero__particles");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                 (navigator.deviceMemory && navigator.deviceMemory <= 4);

  var W = 0, H = 0, dpr = 1, color = CONFIG.fallbackColor;
  var heroBox = { left: 0, top: 0 }, oddFrame = false;
  var parts = [];
  var pointer = { x: -9999, y: -9999, vx: 0, vy: 0, active: false, until: 0 };
  var rafId = 0, running = false, visible = true, lastT = 0;
  var slowFrames = 0;

  var rand = function (a, b) { return a + Math.random() * (b - a); };

  function readColor() {
    var v = getComputedStyle(hero).getPropertyValue(CONFIG.colorVar).trim();
    color = v || CONFIG.fallbackColor;
  }

  // Areas where text and buttons sit, relative to the hero (particles thin out there)
  function copyRects() {
    var hr = hero.getBoundingClientRect();
    return Array.prototype.slice.call(hero.querySelectorAll(".hero__title, .hero__sub, .hero__actions, .chips, .stat-card, .pill-outline"))
      .map(function (el) {
        var r = el.getBoundingClientRect();
        return { l: r.left - hr.left - 18, t: r.top - hr.top - 14, r: r.right - hr.left + 18, b: r.bottom - hr.top + 14 };
      });
  }

  function build() {
    var rect = hero.getBoundingClientRect();
    W = Math.round(rect.width); H = Math.round(rect.height);
    heroBox = { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColor();

    var factor = (W < 768 ? CONFIG.mobileFactor : 1) * (lowPower ? CONFIG.lowPowerFactor : 1);
    var step = CONFIG.spacing / Math.sqrt(factor);
    var cols = Math.ceil(W / step), rows = Math.ceil(H / step);
    var copy = copyRects();
    parts = [];
    // Jittered grid: even coverage that still looks natural
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = (c + rand(0.15, 0.85)) * step, y = (r + rand(0.15, 0.85)) * step;
        if (x > W || y > H) continue;
        var inCopy = copy.some(function (q) { return x > q.l && x < q.r && y > q.t && y < q.b; });
        if (inCopy && Math.random() < CONFIG.copyClearance) continue;
        var dash = Math.random() < CONFIG.dashRatio;
        parts.push({
          ox: x, oy: y, x: x, y: y, vx: 0, vy: 0,
          dash: dash,
          size: dash ? rand(CONFIG.dashLength[0], CONFIG.dashLength[1]) : rand(CONFIG.dotRadius[0], CONFIG.dotRadius[1]),
          angle: rand(0, Math.PI),
          phase: rand(0, Math.PI * 2),
          freq: rand(0.7, 1.3),
          ring: CONFIG.ringRadius + Math.random() * CONFIG.ringSpread, // this particle's spot in the halo
          a: CONFIG.restAlpha                                       // current strength (0-1)
        });
      }
    }
    if (parts.length > CONFIG.maxParticles * factor) {
      parts.sort(function () { return Math.random() - 0.5; });
      parts.length = Math.round(CONFIG.maxParticles * factor);
    }
  }

  // Particles are grouped into a few strength levels; each level is one fill
  // for dots and one stroke for dashes, all in the same single colour.
  var buckets = [];
  function draw() {
    var L = CONFIG.alphaLevels, lo = CONFIG.restAlpha, hi = CONFIG.activeAlpha;
    for (var b = 0; b < L; b++) { if (!buckets[b]) buckets[b] = []; buckets[b].length = 0; }
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i];
      var lvl = hi > lo ? Math.round((q.a - lo) / (hi - lo) * (L - 1)) : 0;
      buckets[Math.max(0, Math.min(L - 1, lvl))].push(q);
    }
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = CONFIG.dashWidth;
    ctx.lineCap = "round";
    for (var lv = 0; lv < L; lv++) {
      var list = buckets[lv];
      if (!list.length) continue;
      ctx.globalAlpha = L > 1 ? lo + (hi - lo) * lv / (L - 1) : lo;
      ctx.beginPath();
      for (var m = 0; m < list.length; m++) {
        var p = list[m];
        if (p.dash) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.beginPath();
      for (var n = 0; n < list.length; n++) {
        var d = list[n];
        if (!d.dash) continue;
        var hx = Math.cos(d.angle) * d.size / 2, hy = Math.sin(d.angle) * d.size / 2;
        ctx.moveTo(d.x - hx, d.y - hy);
        ctx.lineTo(d.x + hx, d.y + hy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function step(t) {
    if (!running) return;
    var dt = lastT ? Math.min(48, t - lastT) : 16.7;
    lastT = t;
    var k = dt / 16.7; // frame-rate independent

    // Adaptive quality: if frames stay slow, thin the field once
    if (dt > 26) { if (++slowFrames > 90 && parts.length > 120) { parts = parts.filter(function (_, i) { return i % 3; }); slowFrames = 0; } }
    else if (slowFrames > 0) slowFrames--;

    var now = performance.now();
    var hasPointer = pointer.active || now < pointer.until;
    var R = CONFIG.radius, R2 = R * R;
    var damp = Math.pow(CONFIG.damping, k);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      // home position with a slow idle drift
      var tx = p.ox + Math.sin(t * CONFIG.idleSpeed * p.freq + p.phase) * CONFIG.idleAmplitude;
      var ty = p.oy + Math.cos(t * CONFIG.idleSpeed * 0.8 * p.freq + p.phase) * CONFIG.idleAmplitude;
      var springK = CONFIG.spring, targetA = CONFIG.restAlpha, ax = 0, ay = 0;

      if (hasPointer) {
        var dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy;
        var dist = Math.sqrt(d2) || 0.01;
        // strength: fades up smoothly towards the cursor
        var g = Math.max(0, 1 - dist / CONFIG.glowRadius); g = g * g * (3 - 2 * g);
        targetA = CONFIG.restAlpha + (CONFIG.activeAlpha - CONFIG.restAlpha) * g;
        if (d2 < R2) {
          var f = 1 - dist / R; f = f * f * (3 - 2 * f);      // smoothstep falloff
          var nx = dx / dist, ny = dy / dist;
          var toRing = (dist - p.ring) * CONFIG.pull * f;     // > 0: pull inwards, < 0: push outwards
          ax += -nx * toRing - ny * CONFIG.swirl * f + pointer.vx * CONFIG.drag * f;
          ay += -ny * toRing + nx * CONFIG.swirl * f + pointer.vy * CONFIG.drag * f;
          springK *= 1 - f * (1 - CONFIG.releaseSpring);       // home lets go while the cursor holds it
        }
      }
      ax += (tx - p.x) * springK; ay += (ty - p.y) * springK;
      p.a += (targetA - p.a) * Math.min(1, CONFIG.fadeSpeed * k);

      p.vx = (p.vx + ax * k) * damp;
      p.vy = (p.vy + ay * k) * damp;
      var sp = p.vx * p.vx + p.vy * p.vy;
      if (sp > CONFIG.maxSpeed * CONFIG.maxSpeed) { var s = CONFIG.maxSpeed / Math.sqrt(sp); p.vx *= s; p.vy *= s; }
      p.x += p.vx * k; p.y += p.vy * k;

      // dashes turn to follow their own motion, then settle back
      if (p.dash && sp > 0.04) {
        var target = Math.atan2(p.vy, p.vx), diff = target - p.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        if (Math.abs(diff) > Math.PI / 2) diff = diff - Math.sign(diff) * Math.PI; // a dash has no head
        p.angle += diff * CONFIG.alignToMotion * Math.min(1, sp / 4) * 0.2 * k;
      }
    }
    // cursor velocity fades so a still cursor stops pushing
    pointer.vx *= 0.85; pointer.vy *= 0.85;

    // At rest the drift is a few pixels over several seconds, so drawing every other
    // frame looks the same and halves the canvas work. Near the cursor, draw every frame.
    var busy = hasPointer || parts.some(function (q) { return q.vx * q.vx + q.vy * q.vy > 0.02 || Math.abs(q.a - CONFIG.restAlpha) > 0.02; });
    if (busy || (oddFrame = !oddFrame)) draw();
    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (running || mqReduce.matches || !visible || document.hidden) return;
    running = true; lastT = 0;
    rafId = requestAnimationFrame(step);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  /* Pointer: listen on the window so the canvas can keep pointer-events: none */
  // The hero's page position is measured in build() (load and resize), so a pointer move never forces layout
  function toLocal(e) {
    var x = e.pageX - heroBox.left, y = e.pageY - heroBox.top;
    return { x: x, y: y, inside: x >= 0 && y >= 0 && x <= W && y <= H };
  }
  function onMove(e) {
    var l = toLocal(e);
    if (!l.inside) { pointer.active = false; return; }
    if (pointer.active) { pointer.vx = (l.x - pointer.x) * 0.5 + pointer.vx * 0.5; pointer.vy = (l.y - pointer.y) * 0.5 + pointer.vy * 0.5; }
    pointer.x = l.x; pointer.y = l.y;
    pointer.active = e.pointerType !== "touch";
    if (e.pointerType === "touch") pointer.until = performance.now() + CONFIG.touchLinger;
  }
  function onLeave() { pointer.active = false; }

  /* Lifecycle */
  var io = null, resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build(); draw(); }, 150);
  }
  function onVisibility() { if (document.hidden) stop(); else start(); }
  function onMotionPref() { if (mqReduce.matches) { stop(); build(); draw(); } else start(); }
  var mqDark = window.matchMedia("(prefers-color-scheme: dark)");
  function onScheme() { readColor(); draw(); }

  function init() {
    build();
    draw(); // static field first (also the reduced-motion version)
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (mqReduce.addEventListener) mqReduce.addEventListener("change", onMotionPref);
    if (mqDark.addEventListener) mqDark.addEventListener("change", onScheme);
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); });
      io.observe(hero);
    }
    start();
  }

  function destroy() {
    stop();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    if (mqReduce.removeEventListener) mqReduce.removeEventListener("change", onMotionPref);
    if (mqDark.removeEventListener) mqDark.removeEventListener("change", onScheme);
    if (io) io.disconnect();
    ctx.clearRect(0, 0, W, H);
    parts = [];
  }

  // Start once fonts are ready (so text areas are measured at their final size),
  // but never wait more than 1.2 s; if fonts arrive later, re-measure quietly.
  var booted = false;
  function boot() { if (!booted) { booted = true; init(); } }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (booted) { build(); draw(); } else boot(); });
    setTimeout(boot, 1200);
  } else boot();

  window.SreeMithraParticles = {
    config: CONFIG,
    destroy: destroy,
    rebuild: function () { build(); draw(); },
    // read-only summary for testing: average and largest distance from home, in px
    stats: function () {
      var sum = 0, max = 0;
      parts.forEach(function (q) { var d = Math.hypot(q.x - q.ox, q.y - q.oy); sum += d; if (d > max) max = d; });
      // bright particles (strength > 0.6): how many, where their centre is, how far from the cursor
      var bright = parts.filter(function (q) { return q.a > 0.6; });
      var cx = 0, cy = 0, rd = 0;
      bright.forEach(function (q) { cx += q.x; cy += q.y; rd += Math.hypot(q.x - pointer.x, q.y - pointer.y); });
      var nB = bright.length || 1;
      return { count: parts.length, avg: parts.length ? sum / parts.length : 0, max: max,
               bright: bright.length, brightCentre: [Math.round(cx / nB), Math.round(cy / nB)], brightToCursor: Math.round(rd / nB),
               restAlphaShare: parts.filter(function (q) { return q.a < CONFIG.restAlpha + 0.05; }).length / (parts.length || 1) };
    }
  };
})();
