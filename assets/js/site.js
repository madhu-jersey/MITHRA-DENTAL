/* Sree Mithra — site behaviour. Vanilla JS, no framework. */
(function () {
  "use strict";

  window.__smReady = true;
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Smooth scrolling (disabled for reduced motion)
  ------------------------------------------------------------------ */
  /* Scrolling is the browser's own (no wheel hijacking), so it responds instantly.
     In-page links still glide to their section via scrollIntoView below. */
  var lenis = null;

  function headerOffset() {
    var h = $(".header");
    return h ? -(h.offsetHeight + 12) : 0;
  }

  function scrollToId(id, focus) {
    var el = doc.getElementById(id);
    if (!el) return false;
    if (lenis) lenis.scrollTo(el, { offset: headerOffset() });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (focus) {
      var target = el.querySelector("h2, h1") || el;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
    }
    return true;
  }

  /* ------------------------------------------------------------------
     Booking pre-selection: [data-book-service] / [data-book-doctor]
  ------------------------------------------------------------------ */
  function preselect(service, doctor) {
    var d = $("#bk-doctor");
    if (service) {
      // Service is a group of radio chips
      var chip = $('#booking-form input[name="service"][value="' + service + '"]');
      if (chip) chip.checked = true;
    }
    if (d && doctor) { d.value = doctor; d.dispatchEvent(new Event("change")); }
  }

  doc.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");

    // Same-page anchors
    if (href.charAt(0) === "#" && href.length > 1) {
      var id = href.slice(1);
      if (doc.getElementById(id)) {
        e.preventDefault();
        closeMenu();
        preselect(a.getAttribute("data-book-service"), a.getAttribute("data-book-doctor"));
        scrollToId(id, id === "booking");
        history.replaceState(null, "", href);
      }
      return;
    }

    // Page transition for internal page links
    if (reduceMotion || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (/^(tel:|mailto:|https?:)/.test(href) || a.hasAttribute("download")) return;
    e.preventDefault();
    doc.body.classList.add("is-leaving");
    setTimeout(function () { window.location.href = a.href; }, 220);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) doc.body.classList.remove("is-leaving"); });

  // Arriving from a service page: ?service=implants#booking
  (function () {
    var p = new URLSearchParams(window.location.search);
    if (p.get("service") || p.get("doctor")) preselect(p.get("service"), p.get("doctor"));
    if (window.location.hash && window.location.hash.length > 1) {
      var id = window.location.hash.slice(1);
      setTimeout(function () { scrollToId(id, false); }, 60);
    }
  })();

  /* ------------------------------------------------------------------
     Header shadow, scroll cue
  ------------------------------------------------------------------ */
  var header = $(".header");
  var cue = $(".scroll-cue");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (cue && y > 40) { cue.classList.add("is-hidden"); cue = null; }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Scroll spy (home page): highlight the nav link for the section in view.
     Sections without their own link (why, booking, faq) keep the previous
     link active. Uses aria-current="location" for in-page sections.
  ------------------------------------------------------------------ */
  (function () {
    var navLinks = $$('.nav a[href^="#"]');
    if (!navLinks.length) return;
    var targets = navLinks.map(function (a) {
      var id = a.getAttribute("href").slice(1);
      return { link: a, el: id === "top" ? null : doc.getElementById(id) };
    }).filter(function (t) { return t.el || t.link.getAttribute("href") === "#top"; });
    var current = null, queued = false;
    var setActive = function (link) {
      if (link === current) return;
      navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
      if (link) link.setAttribute("aria-current", link.getAttribute("href") === "#top" ? "page" : "location");
      current = link;
    };
    var update = function () {
      queued = false;
      var line = (header ? header.getBoundingClientRect().bottom : 0) + window.innerHeight * 0.3;
      // Home until a linked section's top passes the line; then the closest such section wins.
      // (Nav order differs from page order, so compare positions, not list order.)
      var active = targets[0].link, best = -Infinity;
      targets.forEach(function (t) {
        if (!t.el) return;
        var top = t.el.getBoundingClientRect().top;
        if (top <= line && top > best) { best = top; active = t.link; }
      });
      setActive(active);
    };
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ------------------------------------------------------------------
     Mobile menu (focus trap, Esc to close)
  ------------------------------------------------------------------ */
  var burger = $(".burger");
  var menu = $("#mobile-menu");
  function openMenu() {
    if (!menu) return;
    menu.classList.add("is-open");
    menu.removeAttribute("inert");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    doc.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    var first = menu.querySelector("a");
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("inert", "");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    doc.body.style.overflow = "";
    if (lenis) lenis.start();
    burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.contains("is-open") ? closeMenu() : openMenu(); });
    doc.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab") {
        var f = $$("a, button", menu).concat([burger]);
        var i = f.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1080) closeMenu(); });
  }

  /* ------------------------------------------------------------------
     Language toggle (English / Telugu). Telugu strings are a draft
     and must be reviewed by the client.
  ------------------------------------------------------------------ */
  var TE = {
    home: "హోమ్", about: "మా గురించి", services: "సేవలు", gallery: "గ్యాలరీ", doctors: "డాక్టర్లు",
    reviews: "సమీక్షలు", contact: "సంప్రదించండి", book: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    call: "క్లినిక్‌కు కాల్ చేయండి", directions: "దారి తెలుసుకోండి", location: "తణుకు, ఆంధ్రప్రదేశ్"
  };
  var i18nEls = $$("[data-i18n]");
  i18nEls.forEach(function (el) { el.setAttribute("data-en", el.textContent); });
  function setLang(lang) {
    i18nEls.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.textContent = lang === "te" && TE[k] ? TE[k] : el.getAttribute("data-en");
    });
    root.setAttribute("lang", lang === "te" ? "te" : "en");
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    try { localStorage.setItem("sm-lang", lang); } catch (err) { /* storage unavailable */ }
  }
  $$(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  try { if (localStorage.getItem("sm-lang") === "te") setLang("te"); } catch (err) { /* ignore */ }

  /* ------------------------------------------------------------------
     Hero entrance
  ------------------------------------------------------------------ */
  var hero = $(".hero");
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add("is-in"); }); });

  /* ------------------------------------------------------------------
     Scroll reveal (stagger via data-stagger on the parent)
  ------------------------------------------------------------------ */
  $$("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 90;
    $$("[data-reveal]", group).forEach(function (el, i) {
      if (el.closest("[data-stagger]") === group) el.style.setProperty("--d", (i * step) + "ms");
    });
  });

  var revealTargets = $$("[data-reveal], .draw-line, .why__col, .expect");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("is-in");
        io.unobserve(el);
        // Once the entrance has played, drop the stagger delay so hover feels instant
        var d = parseInt(el.style.getPropertyValue("--d"), 10) || 0;
        setTimeout(function () { el.classList.add("is-done"); }, d + 1300);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in", "is-done"); });
  }

  /* Service cards: soft spotlight follows the pointer (desktop only) */
  if (finePointer && !reduceMotion) {
    $$(".scard").forEach(function (card) {
      var glow = card.querySelector(".scard__glow");
      if (!glow) return;
      var raf = 0, x = 0, y = 0;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          glow.style.setProperty("--gx", x + "px");
          glow.style.setProperty("--gy", y + "px");
          raf = 0;
        });
      });
    });
  }

  /* Pause floating badges when off screen */
  if ("IntersectionObserver" in window) {
    var floatIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-offscreen", !en.isIntersecting); });
    });
    $$("[data-float-scope]").forEach(function (el) { floatIo.observe(el); });
  }

  /* ------------------------------------------------------------------
     Count-up: only runs when data-count holds a confirmed number
  ------------------------------------------------------------------ */
  var counters = $$("[data-count]").filter(function (el) { return /^\d+$/.test(el.getAttribute("data-count")); });
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute("data-count"), 10), suffix = el.getAttribute("data-suffix") || "";
        if (reduceMotion) { el.textContent = end + suffix; return; }
        var t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------------------
     Parallax (20-30px), desktop + motion allowed only
  ------------------------------------------------------------------ */
  var px = $$("[data-parallax]");
  if (px.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      var vh = window.innerHeight;
      // Read every position first, then write: interleaving reads and writes
      // forces a layout per element on every frame. The parent is measured so
      // the element's own transform does not feed back into the result.
      var moves = px.map(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return null;
        var range = parseFloat(el.getAttribute("data-parallax")) || 24;
        var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
        return Math.max(-1, Math.min(1, progress)) * range;
      });
      px.forEach(function (el, i) {
        if (moves[i] !== null) el.style.transform = "translate3d(0," + moves[i].toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------------------
     Hero mascot leans gently towards the cursor (desktop, motion allowed).
     The CSS transition on .mascot__lean does the easing.
  ------------------------------------------------------------------ */
  var lean = $("[data-mascot-lean]"), heroEl = $(".hero[data-particles]");
  if (lean && heroEl && finePointer && !reduceMotion) {
    var leanQueued = false, lastEv = null, geo = null;
    // Positions in page coordinates, measured once and on resize, so a mouse move never forces layout
    var measureLean = function () {
      var hr = heroEl.getBoundingClientRect(), mr = lean.parentElement.getBoundingClientRect();
      geo = { top: hr.top + window.scrollY, bottom: hr.bottom + window.scrollY, w: hr.width, h: hr.height,
              cx: mr.left + window.scrollX + mr.width / 2, cy: mr.top + window.scrollY + mr.height / 2 };
    };
    window.addEventListener("resize", function () { geo = null; });
    var applyLean = function () {
      leanQueued = false;
      if (!geo) measureLean();
      var inside = lastEv.pageY >= geo.top && lastEv.pageY <= geo.bottom;
      var nx = 0, ny = 0;
      if (inside) {
        nx = Math.max(-1, Math.min(1, (lastEv.pageX - geo.cx) / (geo.w / 2)));
        ny = Math.max(-1, Math.min(1, (lastEv.pageY - geo.cy) / (geo.h / 2)));
      }
      lean.style.setProperty("--lx", (nx * 16).toFixed(1) + "px");
      lean.style.setProperty("--ly", (ny * 10).toFixed(1) + "px");
      lean.style.setProperty("--lr", (nx * 4).toFixed(2) + "deg");
    };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      lastEv = e;
      if (!leanQueued) { leanQueued = true; requestAnimationFrame(applyLean); }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Audit fixes: pause loops in hidden tabs, keep the floating "Book" pill
     off the booking form, and give the rating tooltip a tap equivalent.
  ------------------------------------------------------------------ */
  var onVis = function () { root.classList.toggle("is-tab-hidden", document.hidden); };
  doc.addEventListener("visibilitychange", onVis);
  onVis();
  var bookingSection = doc.getElementById("booking");
  if (bookingSection && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { doc.body.classList.toggle("in-booking", en[0].isIntersecting); }, { threshold: 0.05 }).observe(bookingSection);
  }
  var submitArea = doc.querySelector(".bk-step--confirm");
  if (submitArea && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { doc.body.classList.toggle("at-submit", en[0].isIntersecting); }, { rootMargin: "0px 0px 80px 0px" }).observe(submitArea);
  }
  var tipTimer = 0;
  doc.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    var row = e.target.closest && e.target.closest(".rv-bar__link");
    $$(".rv-bar__link.is-tip").forEach(function (r) { if (r !== row) r.classList.remove("is-tip"); });
    if (!row) return;
    row.classList.add("is-tip");
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { row.classList.remove("is-tip"); }, 1600);
  }, { passive: true });

  /* ------------------------------------------------------------------
     Magnetic buttons (desktop pointer only)
  ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        b.style.setProperty("--mx", (x * 5).toFixed(1) + "px");
        b.style.setProperty("--my", (y * 4).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* ------------------------------------------------------------------
     Accordions
  ------------------------------------------------------------------ */
  $$(".acc").forEach(function (acc) {
    $$(".acc__btn", acc).forEach(function (btn) {
      var item = btn.closest(".acc__item");
      var panel = doc.getElementById(btn.getAttribute("aria-controls"));
      var set = function (open) {
        btn.setAttribute("aria-expanded", String(open));
        item.classList.toggle("is-open", open);
        if (panel) { if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", ""); }
      };
      set(btn.getAttribute("aria-expanded") === "true");
      btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    });
  });

  /* ------------------------------------------------------------------
     Reviews overview (once, when the card enters view):
     average 0.0 -> value (900ms, last digit pulses as it lands),
     total 0 -> value (700ms), stars fill in CSS, then rows 5 to 1
     (120ms apart, from 300ms) count 0 -> value over 800ms while their
     bars grow in CSS. Null counts stay "–".
  ------------------------------------------------------------------ */
  var rvBox = $(".rv-overview");
  if (rvBox && !reduceMotion && "IntersectionObserver" in window) {
    var rateEl = $("[data-rv-rating]", rvBox), countEl = $("[data-rv-count]", rvBox);
    var rate = parseFloat(rateEl.getAttribute("data-rv-rating")), total = parseInt(countEl.getAttribute("data-rv-count"), 10);
    var rowCounts = $$(".rv-bar__count[data-rv-n]", rvBox);
    var renderRate = function (v) {
      var s = v.toFixed(1);
      rateEl.innerHTML = s.slice(0, -1) + '<span class="rv-score__last">' + s.slice(-1) + "</span>";
    };
    var countUp = function (dur, delay, draw, done) {
      setTimeout(function () {
        var t0 = performance.now();
        (function tick(t) {
          var p = Math.min(1, Math.max(0, (t - t0) / dur));
          draw(1 - Math.pow(1 - p, 3));
          if (p < 1) requestAnimationFrame(tick); else if (done) done();
        })(t0);
      }, delay);
    };
    renderRate(0);
    countEl.textContent = "0";
    rowCounts.forEach(function (el) { el.textContent = "0"; });

    var rvIo = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      rvIo.disconnect();
      countUp(900, 0, function (k) { renderRate(rate * k); }, function () {
        renderRate(rate);
        var last = $(".rv-score__last", rateEl);
        if (last) last.classList.add("is-pulse");
      });
      countUp(700, 0, function (k) { countEl.textContent = String(Math.round(total * k)); });
      rowCounts.forEach(function (el) {
        var n = parseInt(el.getAttribute("data-rv-n"), 10);
        var i = parseInt(el.closest(".rv-bar").style.getPropertyValue("--i"), 10) || 0;
        countUp(800, 300 + i * 120, function (k) { el.textContent = String(Math.round(n * k)); }, function () {
          el.classList.add("is-settled");
        });
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    rvIo.observe(rvBox);
  }

  /* ------------------------------------------------------------------
     Contact card: mark today's hours and show open/closed, using clinic
     time (Asia/Kolkata) whatever the visitor's own time zone.
     Mon-Sat 9:00-20:00, Sun 9:00-17:00.
  ------------------------------------------------------------------ */
  (function () {
    var rows = $$(".ccard__hours > div[data-days]"), status = $("[data-open-status]");
    if (!rows.length) return;
    var day, mins;
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
      day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      mins = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
    } catch (err) { return; }
    if (day < 0) return;
    rows.forEach(function (r) { r.classList.toggle("is-today", r.getAttribute("data-days").split(",").indexOf(String(day)) > -1); });
    if (!status) return;
    var close = day === 0 ? 17 * 60 : 20 * 60, open = 9 * 60;
    var isOpen = mins >= open && mins < close;
    status.textContent = isOpen ? "Open now, until " + (day === 0 ? "5 pm" : "8 pm") : (mins < open ? "Closed, opens 9 am" : "Closed, opens 9 am tomorrow");
    status.classList.toggle("is-closed", !isOpen);
    status.hidden = false;
  })();

  /* Review text: clamp to 5 lines with a Read more toggle when needed */
  $$(".rcard").forEach(function (card) {
    var text = $(".rcard__text", card), more = $(".rcard__more", card);
    if (!text || !more) return;
    var check = function () {
      if (card.classList.contains("is-expanded")) return;
      more.hidden = text.scrollHeight <= text.clientHeight + 2;
    };
    more.addEventListener("click", function () {
      var open = card.classList.toggle("is-expanded");
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Read less" : "Read more";
    });
    check();
    window.addEventListener("resize", check);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(check);
  });

  /* ------------------------------------------------------------------
     Reviews carousel: native momentum scroll with snap points, arrows
     (with ripple), dots, active card. Auto-advance only when
     data-autoplay="true"; it pauses on hover, focus and touch.
  ------------------------------------------------------------------ */
  $$(".carousel").forEach(function (car) {
    var track = $(".carousel__track", car);
    var cards = $$(".rcard", track);
    var prev = $("[data-prev]", car), next = $("[data-next]", car), dotsWrap = $(".dots-nav", car);
    if (!track || !cards.length) return;
    var gap = function () { return parseFloat(getComputedStyle(track).columnGap) || 22; };
    var step = function () { return cards[0].getBoundingClientRect().width + gap(); };
    var maxScroll = function () { return track.scrollWidth - track.clientWidth - 2; };
    var dots = [];
    var buildDots = function () {
      dotsWrap.innerHTML = "";
      var pages = Math.max(1, Math.round(maxScroll() / step()) + 1);
      dots = [];
      for (var i = 0; i < pages; i++) (function (i) {
        var b = doc.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to review " + (i + 1));
        b.addEventListener("click", function () { track.scrollTo({ left: Math.min(i * step(), maxScroll() + 2) }); });
        dotsWrap.appendChild(b);
        dots.push(b);
      })(i);
    };
    var sync = function () {
      var scrollable = track.scrollWidth > track.clientWidth + 2;
      car.classList.toggle("is-scrollable", scrollable);
      var i = Math.round(track.scrollLeft / step());
      if (track.scrollLeft >= maxScroll()) i = dots.length - 1;
      dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === i)); });
      // Active card: the one nearest the start edge (the last one at the end)
      var active = !scrollable ? -1 : track.scrollLeft >= maxScroll() ? cards.length - 1 : Math.round(track.scrollLeft / step());
      cards.forEach(function (c, k) { c.classList.toggle("is-active", k === active); });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll();
    };
    var ripple = function (btn, e) {
      if (reduceMotion) return;
      var r = btn.getBoundingClientRect(), s = doc.createElement("span");
      s.className = "ripple";
      s.style.left = ((e.clientX || r.left + r.width / 2) - r.left) + "px";
      s.style.top = ((e.clientY || r.top + r.height / 2) - r.top) + "px";
      btn.appendChild(s);
      setTimeout(function () { s.remove(); }, 600);
    };
    prev.addEventListener("click", function (e) { ripple(prev, e); track.scrollBy({ left: -step() }); });
    next.addEventListener("click", function (e) { ripple(next, e); track.scrollBy({ left: step() }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", function () { buildDots(); sync(); });
    buildDots();
    sync();

    // Stagger the cards in when the carousel enters view
    if (!reduceMotion && "IntersectionObserver" in window) {
      var cio2 = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        cio2.disconnect();
        car.classList.add("is-in");
        setTimeout(function () { car.classList.add("is-done"); }, cards.length * 100 + 700);
      }, { threshold: 0.15 });
      cio2.observe(car);
    } else {
      car.classList.add("is-in", "is-done");
    }

    if (car.getAttribute("data-autoplay") === "true" && !reduceMotion) {
      var paused = false, visible = false;
      car.addEventListener("mouseenter", function () { paused = true; });
      car.addEventListener("mouseleave", function () { paused = false; });
      car.addEventListener("focusin", function () { paused = true; });
      car.addEventListener("focusout", function () { paused = false; });
      track.addEventListener("touchstart", function () { paused = true; }, { passive: true });
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(car);
      setInterval(function () {
        if (paused || !visible || doc.hidden || !car.classList.contains("is-scrollable")) return;
        if (track.scrollLeft >= maxScroll()) track.scrollTo({ left: 0 });
        else track.scrollBy({ left: step() });
      }, 6000);
    }
  });

})();
