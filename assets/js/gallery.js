/* Sree Mithra — clinic gallery: "View more photos" and the photo viewer.
   Tiles come from src/gallery.json (built into the page). Animations use the
   Web Animations API on transform and opacity; the photo viewer's grow-from-tile
   also animates clip-path so the crop matches the tile while it grows. */
(function () {
  "use strict";

  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var canAnimate = typeof Element !== "undefined" && "animate" in Element.prototype;
  if (!canAnimate) reduce = true;

  var grid = $("[data-gallery]");
  if (!grid) return;
  var wrap = grid.parentElement;
  var tiles = $$(".gtile", grid);
  var extras = tiles.filter(function (t) { return t.classList.contains("is-extra"); });
  var base = tiles.filter(function (t) { return !t.classList.contains("is-extra"); });

  /* Soft pink placeholder until each photo has loaded (no layout jump: frames are fixed 4:3) */
  $$(".gitem__img", grid).forEach(function (img) {
    var frame = img.parentElement;
    var done = function () { frame.classList.remove("is-loading"); };
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); }
  });

  /* ------------------------------------------------------------------
     View more / Show fewer
  ------------------------------------------------------------------ */
  var toggle = $("[data-gallery-toggle]");
  var label = toggle && $("[data-gallery-label]", toggle);
  var expanded = false, busy = false;

  var rectsOf = function (list) { return list.map(function (el) { return el.getBoundingClientRect(); }); };
  var flip = function (els, before, after) {
    els.forEach(function (el, i) {
      var dx = before[i].left - after[i].left, dy = before[i].top - after[i].top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 500, easing: EASE });
    });
  };
  var growHeight = function (h0, h1) {
    if (Math.abs(h1 - h0) < 1) return;
    wrap.style.overflow = "hidden";
    var a = wrap.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 500, easing: EASE });
    a.onfinish = a.oncancel = function () { wrap.style.overflow = ""; };
  };
  var setButton = function (open) {
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Show fewer photos" : "View more photos";
  };

  function expand() {
    if (reduce) {
      extras.forEach(function (t) { t.classList.add("is-shown"); if (canAnimate) t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }); });
      setButton(true); expanded = true; return;
    }
    busy = true;
    var before = rectsOf(base), h0 = wrap.offsetHeight;
    extras.forEach(function (t) { t.classList.add("is-shown"); });
    var after = rectsOf(base), h1 = wrap.offsetHeight;
    flip(base, before, after);
    growHeight(h0, h1);
    extras.forEach(function (t, i) {
      t.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
        { duration: 600, delay: i * 90, easing: EASE, fill: "backwards" });
    });
    setButton(true); expanded = true;
    setTimeout(function () { busy = false; }, 600 + extras.length * 90);
  }

  function collapse() {
    var focusInExtra = extras.some(function (t) { return t.contains(document.activeElement); });
    var finish = function () {
      var before = rectsOf(base), h0 = wrap.offsetHeight;
      extras.forEach(function (t) { t.classList.remove("is-shown"); });
      var after = rectsOf(base), h1 = wrap.offsetHeight;
      if (!reduce) { flip(base, before, after); growHeight(h0, h1); }
      setButton(false); expanded = false; busy = false;
      if (focusInExtra) toggle.focus();
      // keep the button in view after the grid shrinks
      setTimeout(function () {
        var r = toggle.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) toggle.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      }, reduce ? 0 : 520);
    };
    if (reduce) {
      if (!canAnimate) return finish();
      var q = extras.map(function (t) { return t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }); });
      return Promise.all(q.map(function (a) { return a.finished; })).then(function () { finish(); q.forEach(function (a) { a.cancel(); }); });
    }
    busy = true;
    var anims = extras.slice().reverse().map(function (t, i) {
      return t.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.94)" }],
        { duration: 320, delay: i * 60, easing: EASE, fill: "forwards" });
    });
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      finish();
      anims.forEach(function (a) { a.cancel(); });
    });
  }

  if (toggle && extras.length) {
    toggle.hidden = false;
    toggle.addEventListener("click", function () { if (!busy) (expanded ? collapse : expand)(); });
  }

  /* ------------------------------------------------------------------
     Photo viewer
  ------------------------------------------------------------------ */
  var lb = $("#lightbox");
  var items = $$("button.gitem", grid); // photo and placeholder tiles (not rejected ones)
  if (!lb || !items.length) return;
  var media = $("[data-lb-media]", lb), capEl = $("[data-lb-caption]", lb), countEl = $("[data-lb-count]", lb);
  var backdrop = $(".lightbox__backdrop", lb);
  var controls = $$(".lightbox__btn, .lightbox__cap", lb);
  var idx = 0, isOpen = false, sliding = false, lastFocus = null;

  function slideFor(btn) {
    var s = document.createElement("div");
    s.className = "lightbox__slide";
    var full = btn.getAttribute("data-full");
    if (full) {
      var tileImg = $("img", btn), img = new Image();
      img.alt = tileImg ? tileImg.alt : btn.getAttribute("data-caption");
      img.width = +btn.getAttribute("data-w"); img.height = +btn.getAttribute("data-h");
      img.decoding = "async"; img.draggable = false;
      img.src = full;
      s.appendChild(img);
    } else {
      var ph = $(".ph", btn).cloneNode(true);
      ph.removeAttribute("aria-hidden");
      ph.setAttribute("role", "img");
      ph.setAttribute("aria-label", btn.getAttribute("data-caption") + " (photo to be supplied)");
      s.appendChild(ph);
    }
    return s;
  }
  var current = function () { return media.lastElementChild; };
  var shown = function (el) { return el.firstElementChild; };

  function setMeta(i, fade) {
    capEl.textContent = items[i].getAttribute("data-caption");
    countEl.textContent = (i + 1) + " / " + items.length;
    if (fade && canAnimate) countEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 150 : 260, easing: "ease" });
  }

  // Grow the photo from its tile: same centre, scaled down to the tile, cropped like the tile
  function tileRect(btn) {
    var tile = btn.closest(".gtile");
    if (!tile || tile.offsetParent === null) return null;
    var r = $(".gitem__frame", btn).getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight || !r.width) return null;
    return r;
  }
  function flipFrames(T, F) {
    var s = Math.max(T.width / F.width, T.height / F.height);
    var dx = (T.left + T.width / 2) - (F.left + F.width / 2), dy = (T.top + T.height / 2) - (F.top + F.height / 2);
    var ix = Math.max(0, (F.width - T.width / s) / 2), iy = Math.max(0, (F.height - T.height / s) / 2);
    return [
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")", clipPath: "inset(" + iy + "px " + ix + "px round " + (16 / s) + "px)" },
      { transform: "none", clipPath: "inset(0px 0px round 14px)" }
    ];
  }

  // Preload the photos either side, so sliding never shows a blank frame while one downloads
  var preloaded = {};
  function preloadAround(i) {
    [-1, 1].forEach(function (d) {
      var k = (i + d + items.length) % items.length, src = items[k].getAttribute("data-full");
      if (src && !preloaded[src]) { preloaded[src] = true; var im = new Image(); im.decoding = "async"; im.src = src; }
    });
  }

  function open(i) {
    preloadAround(i);
    lastFocus = document.activeElement;
    idx = i; isOpen = true;
    media.innerHTML = "";
    media.appendChild(slideFor(items[i]));
    setMeta(i, false);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (reduce) { if (canAnimate) lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }); }
    else {
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease" });
      controls.forEach(function (c) { c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 150, easing: "ease", fill: "backwards" }); });
      var target = shown(current()), T = tileRect(items[i]), F = target.getBoundingClientRect();
      if (T && F.width) target.animate(flipFrames(T, F), { duration: 450, easing: EASE });
      else target.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: EASE });
    }
    $(".lightbox__close", lb).focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    var btn = items[idx];
    var done = function () {
      lb.hidden = true;
      media.innerHTML = "";
      document.body.style.overflow = "";
      var tileVisible = btn.closest(".gtile").offsetParent !== null;
      (tileVisible ? btn : (lastFocus || toggle || document.body)).focus({ preventScroll: true });
    };
    if (reduce) {
      if (!canAnimate) return done();
      lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).onfinish = done;
      return;
    }
    var target = shown(current()), T = tileRect(btn), F = target.getBoundingClientRect();
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" });
    controls.forEach(function (c) { c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }); });
    var a = (T && F.width)
      ? target.animate(flipFrames(T, F).reverse(), { duration: 400, easing: EASE, fill: "forwards" })
      : target.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.96)" }], { duration: 250, easing: EASE, fill: "forwards" });
    a.onfinish = function () {
      done();
      backdrop.getAnimations().concat(controls.reduce(function (acc, c) { return acc.concat(c.getAnimations()); }, [])).forEach(function (x) { x.cancel(); });
    };
  }

  // Slide: the current photo moves 40px out and fades, the next arrives from the same direction
  function go(dir, fromOffset) {
    if (sliding || items.length < 2) return;
    var old = current();
    var next = (idx + dir + items.length) % items.length;
    var slide = slideFor(items[next]);
    media.appendChild(slide);
    idx = next;
    preloadAround(next);
    setMeta(next, true);
    if (reduce) {
      old.remove();
      if (canAnimate) slide.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      return;
    }
    sliding = true;
    var start = fromOffset || 0;
    old.style.transform = "";
    old.animate([{ transform: "translateX(" + start + "px)", opacity: Math.max(0, 1 - Math.abs(start) / 500) },
                 { transform: "translateX(" + (start - 40 * dir) + "px)", opacity: 0 }],
      { duration: 420, easing: EASE, fill: "forwards" }).onfinish = function () { old.remove(); };
    slide.animate([{ transform: "translateX(" + (40 * dir) + "px)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 420, easing: EASE }).onfinish = function () { sliding = false; };
  }

  items.forEach(function (btn, i) { btn.addEventListener("click", function () { open(i); }); });
  $$("[data-lb-close]", lb).forEach(function (el) { el.addEventListener("click", close); });
  $("[data-lb-prev]", lb).addEventListener("click", function () { go(-1); });
  $("[data-lb-next]", lb).addEventListener("click", function () { go(1); });
  media.addEventListener("click", function (e) { if (e.target.classList.contains("lightbox__slide") && !dragMoved) close(); });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "Tab") {
      var f = $$("button", lb).filter(function (b) { return !b.hidden; });
      var k = f.indexOf(document.activeElement);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Swipe: the photo follows the finger, then either slides on or snaps back
  var dragX = null, dragDx = 0, dragMoved = false, dragId = null;
  media.addEventListener("pointerdown", function (e) {
    if (sliding || e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "mouse") e.preventDefault(); // keep focus inside the viewer and stop native image drag
    dragX = e.clientX; dragDx = 0; dragMoved = false; dragId = e.pointerId;
  });
  media.addEventListener("pointermove", function (e) {
    if (dragX === null || e.pointerId !== dragId) return;
    dragDx = e.clientX - dragX;
    if (!dragMoved && Math.abs(dragDx) > 6) { dragMoved = true; try { media.setPointerCapture(dragId); } catch (err) {} }
    if (dragMoved && !reduce) {
      var c = current();
      c.style.transform = "translateX(" + dragDx + "px)";
      c.style.opacity = String(Math.max(0.35, 1 - Math.abs(dragDx) / 500));
    }
  });
  var endDrag = function () {
    if (dragX === null) return;
    var dx = dragDx, c = current();
    dragX = null;
    if (!dragMoved) return;
    if (Math.abs(dx) > 60) { c.style.opacity = ""; go(dx < 0 ? 1 : -1, reduce ? 0 : dx); }
    else if (!reduce) {
      c.animate([{ transform: "translateX(" + dx + "px)", opacity: c.style.opacity || 1 }, { transform: "none", opacity: 1 }],
        { duration: 300, easing: EASE });
      c.style.transform = ""; c.style.opacity = "";
    }
    setTimeout(function () { dragMoved = false; }, 0);
  };
  media.addEventListener("pointerup", endDrag);
  media.addEventListener("pointercancel", endDrag);
})();
