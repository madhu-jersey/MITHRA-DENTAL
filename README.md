# Sree Mithra Dental & Maxface Specialists: website

A static site with no framework. The home page and five service pages are generated from one layout and one service template.

```
src/data.mjs      clinic facts, doctors, all service content (draft medical copy)
src/icons.mjs     inline SVG icon set
src/build.mjs     templates, writes index.html + services/<slug>/index.html
src/serve.mjs     local preview server (no dependencies)
assets/css/site.css
assets/js/site.js booking form, menu, lightbox, carousel, reveals, parallax
```

Build: `node src/build.mjs`. Preview: `node src/serve.mjs`, then open http://localhost:4173.

Routes are `/`, `/services/dental/`, `/services/cosmetology/`, `/services/implants/`, `/services/facial-trauma/` and `/services/maxillofacial/`. Any static host serves these as folder index pages. Upload everything except `src/`.

External resources: Google Fonts (Inter, Plus Jakarta Sans, `display=swap`) and the Google Maps embed. Scrolling is the browser's native scrolling (no smooth-scroll library), so the wheel responds instantly; in-page links glide to their section.

See `PLACEHOLDERS.md` for what the client must supply and `ACCESSIBILITY-REPORT.md` for the contrast and accessibility checks.

## Hero particle field

`assets/js/particles.js` draws the interactive dots and dashes behind the home hero (home page only). At rest the field is faint (`restAlpha`); near the cursor particles fade up to full colour and gather into a halo that follows the pointer (`radius`, `ringRadius`, `ringSpread`, `pull`, `swirl`, `glowRadius`). All tuning values are in the `CONFIG` object at the top of that file, including density, sizes, dash ratio, spring, damping, drift and speed limits. The single particle colour is the CSS token `--particle-color` in `assets/css/site.css` (brand crimson `#9E0B24`). The field pauses when the hero is off screen or the tab is hidden, thins out on phones and low-power devices, and is drawn still for visitors who prefer reduced motion.

## Gallery

Photos are listed in `src/gallery.json` (`src`, `alt`, `caption`, `focus`). Every tile is a fixed 4:3 frame and photos of any shape are cropped evenly with `object-fit: cover`; `focus` (e.g. `top`, `left 30%`) chooses what stays visible. The first `initialCount` (5) show by default, the rest behind "View more photos".

To add photos:

```
node src/optimize-gallery.mjs   # makes 1600px and 800px WebP copies (uses Edge or Chrome)
node src/build.mjs
```

Photos narrower than `minWidth` (800px) are not shown; the tile asks for a larger photo and the build prints a warning. Behaviour lives in `assets/js/gallery.js` (view more/fewer, photo viewer).
