/* Sree Mithra — the hero tooth's eyes follow the cursor.
   The image is untouched: an SVG layer (in the image's own 736 x 736 coordinates)
   covers each drawn eyeball and draws a new one that moves. */
(function () {
  "use strict";

  var CONFIG = {
    travel: 0.35,        // furthest move, as a share of the lens radius
    reach: 220,          // px from the eye at which the eyes are fully turned
    ballRadius: 21.5,    // eyeball radius in image units
    lensMargin: 2,       // keep this gap (image units) between eyeball and lens edge
    ease: 0.15,          // lerp per frame
    touchHold: 2000,     // ms a tap keeps the eyes looking at it
    blinkEvery: [4000, 6000],
    blinkMs: 140
  };

  var svg = document.querySelector(".mascot__eyes");
  if (!svg) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eyes = Array.prototype.slice.call(svg.querySelectorAll("[data-eye]")).map(function (g) {
    var d = g.dataset;
    return {
      ball: g.querySelector("[data-ball]"), blink: g.querySelector("[data-blink]"),
      cx: +d.cx, cy: +d.cy, lx: +d.lensCx, ly: +d.lensCy, lr: +d.lensR,
      x: 0, y: 0, tx: 0, ty: 0
    };
  });

  var pointer = null;      // {x, y} in viewport px, or null to look straight ahead
  var touchTimer = 0, raf = 0, visible = true;

  // Target offset for one eye, in image units, clamped so the eyeball stays inside the lens
  function aim(e, rect, scale) {
    if (!pointer) { e.tx = 0; e.ty = 0; return; }
    var ex = rect.left + e.cx * scale, ey = rect.top + e.cy * scale;   // eye centre in viewport px
    var dx = pointer.x - ex, dy = pointer.y - ey, dist = Math.hypot(dx, dy);
    if (dist < 0.5) { e.tx = 0; e.ty = 0; return; }
    var amount = CONFIG.travel * e.lr * Math.min(1, dist / CONFIG.reach);
    var ox = dx / dist * amount, oy = dy / dist * amount;
    // clamp: centre of the moved eyeball must stay within (lens radius - ball radius - margin) of the lens centre
    var limit = e.lr - CONFIG.ballRadius - CONFIG.lensMargin;
    var px = e.cx + ox - e.lx, py = e.cy + oy - e.ly, pd = Math.hypot(px, py);
    if (pd > limit) { px *= limit / pd; py *= limit / pd; ox = e.lx + px - e.cx; oy = e.ly + py - e.cy; }
    e.tx = ox; e.ty = oy;
  }

  function frame() {
    raf = 0;
    var rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    var scale = rect.width / 736, moving = false;
    eyes.forEach(function (e) {
      aim(e, rect, scale);
      if (reduce) { e.x = e.tx; e.y = e.ty; }
      else {
        e.x += (e.tx - e.x) * CONFIG.ease;
        e.y += (e.ty - e.y) * CONFIG.ease;
        if (Math.abs(e.tx - e.x) > 0.05 || Math.abs(e.ty - e.y) > 0.05) moving = true;
        else { e.x = e.tx; e.y = e.ty; }
      }
      e.ball.setAttribute("transform", "translate(" + e.x.toFixed(2) + " " + e.y.toFixed(2) + ")");
    });
    // keep going while easing, or while the tooth floats and the pointer is set (its position changes)
    if (visible && (moving || (pointer && !reduce))) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  window.addEventListener("mousemove", function (e) { pointer = { x: e.clientX, y: e.clientY }; kick(); }, { passive: true });
  document.addEventListener("mouseout", function (e) { if (!e.relatedTarget) { pointer = null; kick(); } });
  window.addEventListener("blur", function () { pointer = null; kick(); });
  // Touch: look at the last tap for 2 s, then recentre. Passive, so scrolling is untouched.
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    pointer = { x: e.clientX, y: e.clientY };
    kick();
    clearTimeout(touchTimer);
    touchTimer = setTimeout(function () { pointer = null; kick(); }, CONFIG.touchHold);
  }, { passive: true });
  window.addEventListener("scroll", function () { if (pointer) kick(); }, { passive: true });
  window.addEventListener("resize", kick);

  // Only work while the hero is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(svg);
  }

  // Blink every 4-6 s at random (not with reduced motion)
  if (!reduce && "animate" in Element.prototype) {
    var blink = function () {
      if (visible && !document.hidden) {
        eyes.forEach(function (e) {
          e.blink.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0.1)" }, { transform: "scaleY(1)" }],
            { duration: CONFIG.blinkMs, easing: "ease-in-out" });
        });
      }
      setTimeout(blink, CONFIG.blinkEvery[0] + Math.random() * (CONFIG.blinkEvery[1] - CONFIG.blinkEvery[0]));
    };
    setTimeout(blink, 2500 + Math.random() * 2000);
  }

  window.SreeMithraEyes = { config: CONFIG };
})();
