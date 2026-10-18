# Animation and effects audit — 18 Oct 2026

## How it was tested

- **Browser:** Chromium (headless Edge), driven by script.
- **Widths:** 360, 390, 768, 1024, 1280 and 1440px; a phone in landscape (844×390); and 150% zoom (960px at 1.5×).
- **Phones:** emulated with touch input and `hover: none`.
- **Reduced motion:** emulated (`prefers-reduced-motion`).
- **Frame rate:** 4× CPU throttle, the same setting as the DevTools Performance panel.
- **Not available here:** Safari on iOS and Chrome on Android hardware. Phone results come from Chromium's mobile emulation (see the end).

**What was measured:**
- Layout shift on load (CLS).
- Sideways overflow.
- Console errors.
- Every animation actually running during a full scroll and hover pass, with the CSS property it changes.
- Frame times while the hero is idle, while the pointer moves over the hero, and while scrolling.

Screenshots of the hero and the booking form at 390px and 1440px are in `audit-screenshots/`.

## Results by effect

| Effect | File · selector | Desktop | Mobile | Fixed? |
|---|---|---|---|---|
| Hero entrance (headline mask, fades) | site.css `.hero [data-hero]`, `.line > span` | OK, plays once | OK | — |
| Scroll reveals (rise and fade, stagger) | site.css `[data-reveal]`; site.js reveal observer | OK, once each via IntersectionObserver | OK | — |
| Service title word reveal | site.css `.split .w` | OK | OK | — |
| Service cards: lift, top line, icon tilt, spotlight, number | site.css `.scard*`; site.js spotlight | Shadow was animated | Lift stuck after tap | **Yes:** shadow no longer animated; touch reset |
| Why Choose Us stage sequence and ripple | site.css `.why__col*`, `whyRipple` | OK | OK, swipe row | — |
| Doctor photo curtain, frame, chip, hover sheen and tilt | site.css `.doc__media*`, `.doc__reveal*` | Shadow was animated | Tilt stuck after tap | **Yes** |
| Parallax (hero tooth, doctor photos, dots) | site.js `[data-parallax]` | OK, batched reads and writes | OK | — |
| Hero particles (drift, cursor halo) | particles.js | Read layout on every pointer move | OK | **Yes:** cached position; idle redraw halved |
| Tooth float and floor shadow | site.css `mascotFloat`, `mascotShadow` | OK | OK | **Yes:** pauses in hidden tabs |
| Tooth lean towards cursor | site.js `[data-mascot-lean]` | Read layout on every move | Off on touch | **Yes:** cached geometry |
| Tooth eyes follow, blink | mascot-eyes.js | OK, stays inside lenses | Follows tap, recentres after 2 s | — |
| Floating badges (service-page heroes) | site.css `.float` | OK | OK | **Yes:** pause in hidden tabs |
| Scroll cue | site.css `cue` | OK, fades after first scroll | Hidden under 960px | **Yes:** pauses in hidden tabs |
| Header shadow on scroll | site.css `.header.is-scrolled` | Shadow was animated | Same | **Yes:** fades on a pseudo-element |
| Nav underline, scroll spy | site.css `.nav a::after`; site.js scroll spy | OK, transform | — | — |
| Buttons: lift, magnetic pull, hover shadow | site.css `.btn`; site.js magnetic | Shadow was animated | Lift reset on touch | **Yes:** shadow fades on `::after` |
| Skip link | site.css `.skip-link` | Animated `top` | — | **Yes:** transform |
| Rating overview: count-up, stars, bars, glow | site.css `.rv-*`; site.js count-up | Card shadow was animated | Tooltip was hover-only | **Yes:** shadow static; tap shows tooltip for 1.6 s |
| Reviews carousel: swipe, arrows, dots | site.css `.carousel*`; site.js | OK; no scroll at 3-up | Swipe OK | **Yes:** dots stretch with `scaleX`, not width |
| Gallery: view more/fewer, viewer, swipe | gallery.js; site.css `.ggrid`, `.lightbox*` | OK | OK | **Yes:** neighbouring photos preload (no blank frame) |
| Map embed | build.mjs `.map__embed` | Lazy loaded | Lazy loaded | — |
| FAQ accordion | site.css `.acc__panel` | Height animation (see below) | Same | Kept, see below |
| Booking: focus underline, label lift | site.css `.bk__input::after` | OK | OK | — |
| Booking: period cards, slot grid, slot pulse | booking.js; site.css `.bk-period*`, `.bk-slot*` | Pulse animated `box-shadow` | OK at 360px | **Yes:** ring scales on `::after` |
| Booking: error slide and 2px shake | booking.js `showError` | OK | OK at 360px | — |
| Booking: submit spinner, check, success scale-in | booking.js; site.css `.bk__btn`, `.bk-success` | OK | OK | — |
| Booking vs sticky mobile bars | site.css `.fab`, `.mbar` | — | Book pill and bottom bar could cover the button | **Yes:** both step aside at the form |
| Page fade between pages | site.css `pageFade`, `pageIn` | OK | OK | — |

## Fixes, one line each

1. **Shadows:** box-shadow no longer animates. Hover shadows on buttons, review cards and problem cards, and the header's scroll shadow, now live on a pseudo-element that fades in with opacity. Cards that clip their own contents switch shadow without a transition while the lift still animates. *Why:* shadow animation repaints every frame.
2. **Form controls:** inputs, period cards, slots and accordion borders no longer transition box-shadow. *Why:* same paint cost, and an instant state change reads fine.
3. **Booking slot pulse:** it's now a ring that scales and fades on `::after`, instead of a `boxShadow` animation. *Why:* transform and opacity only.
4. **Skip link:** it slides in with `transform` instead of `top`. *Why:* `top` causes layout.
5. **Carousel dots:** the active dot stretches with `scaleX` instead of `width`. *Why:* `width` causes layout.
6. **Touch screens:** lifts, tilts, glows and the spotlight are reset under `hover: none`. *Why:* on touch, `:hover` stays stuck after a tap.
7. **Rating tooltip:** tapping a row shows it for 1.6 seconds. *Why:* it was hover-only, with no tap equivalent.
8. **Hidden tabs:** looping CSS animations pause while the tab is hidden (`.is-tab-hidden`). *Why:* the spec asks for paused loops; particles and blinking already stopped.
9. **Particles:**
   - The hero position is cached, so a pointer move no longer forces layout.
   - At rest the canvas redraws every other frame.
   - *Why:* both cut main-thread work. Mouse-over-hero at 1440px went from 48 to 71 fps typical.
10. **Tooth lean:** geometry is cached in page coordinates. *Why:* it was reading layout on every mouse move.
11. **Gallery viewer:** the next and previous photos preload. *Why:* avoids a blank frame when sliding to a photo that hasn't downloaded.
12. **Mobile booking:** the floating "Book" pill hides inside the booking section, and the bottom Call/Directions bar steps aside while the submit button is on screen. *Why:* at 360px they could cover "Request Appointment".

## Accessibility checks (after fixes)

- **Reduced motion:** no looping animations run. The tooth doesn't float, parallax is off, the particles are still, there's no auto-advance and no blinking. Every reveal is at its final state, and the rating shows 4.9 / 52 straight away.
- **Flashing:** nothing flashes more than three times a second. The fastest repeating change is the eye blink, once every 4 to 6 seconds.
- **Focus:** the keyboard focus ring (3px crimson) shows on animated elements, for example the service card links. The skip link appears on the first Tab.
- **Booking at 360px:** pressing submit too early moves focus to the first missing field, and that field stays clear of the bottom bar.

## Measurements

- **Layout shift on load (CLS):** 0.0003 to 0.0017 on phones, tablets and 150% zoom. At 1440px it's 0.017, from the web fonts swapping in (see below).
- **Sideways overflow:** none at any width.
- **Console errors:** none.
- **Frame rate at 4× CPU throttle:**

| | Idle hero | Pointer over hero | Full-page scroll |
|---|---|---|---|
| 390px, before | 143 fps typical (0.4% of frames below 55) | n/a | 72 typical, 41% below 55 |
| 390px, after | 145 typical (0.2% below 55) | 143 typical (0% below 55) | 73 typical, 37% below 55 |
| 1440px, before | 143 typical (0.6% below 55) | 48 typical (67% below 55) | 36 typical (61% below 55) |
| 1440px, after | 145 typical (0% below 55) | 71 typical (50% below 55) | 48 typical (57% below 55) |

## Left unfixed, with reasons

- **Scrolling is still below 55 fps in this test environment.**
  - While scrolling, the site's own scripts used about 0.2 s of 7.8 s, style recalculation about 1.2 s and layout 0.3 s. The rest is the browser drawing pixels.
  - Switching off the particles, every shadow, or the map changed nothing.
  - This headless browser draws everything in software even with GPU flags on, so it overstates drawing cost compared with a real phone, which draws on its GPU.
  - **Next step:** profile on a real mid-range Android phone in Chrome DevTools before changing the design.
- **Layout shift of 0.017 at 1440px on load** comes from Clash Display and General Sans arriving from Fontshare after first paint. It's within "good" (under 0.1). Saving the two fonts into the project with `<link rel="preload">` would remove most of it. That needs your go-ahead (offered earlier).
- **The gallery's height change and the FAQ expand** still animate height (gallery.js `growHeight`; site.css `.acc__panel`). Both run only when someone clicks, last under 0.5 s, and were specifically asked for ("section height grows smoothly", "smooth height expand"). There's no transform-only way to grow a section without stretching its contents.
- **Booking step reveal:** there's nothing to animate, because all four steps are always shown, as you asked.
- **Desktop reviews carousel:** with 3 reviews, all fit at once, so there's nothing to scroll or move with the keyboard on desktop. On tablet and phone it scrolls, swipes and works with the arrow buttons.
- **Safari on iOS and Chrome on Android hardware weren't available.** Touch, `hover: none`, landscape and zoom were checked in Chromium emulation. Real-device checks are still worth doing, especially iOS Safari's handling of `:hover` and smooth scrolling.
