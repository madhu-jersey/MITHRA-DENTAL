# Accessibility and contrast check

Checked on 17 Oct 2026 against WCAG 2.1 AA. Contrast ratios come from the WCAG relative-luminance formula. The palette values are estimates, so check them again once colours are sampled from the logo.

## Colour contrast (text)

| Text / background | Ratio | AA normal (4.5) | Used for |
|---|---|---|---|
| Deep maroon #2B0A12 on white | 18.18 | Pass | Headlines, labels |
| Deep maroon #2B0A12 on blush #FDEEF1 | 16.17 | Pass | Hero headline, tiles |
| Heading maroon #7A2535 on white | 9.80 | Pass | Subheadings, TBC labels |
| Heading maroon #7A2535 on blush | 8.71 | Pass | |
| Button red #C41E3A on white | 5.84 | Pass | Eyebrows, links, outline buttons |
| Button red #C41E3A on blush | 5.20 | Pass | Eyebrows and links on tinted sections |
| Button red #C41E3A on off-white #FBFAF8 | 5.60 | Pass | |
| White on button red #C41E3A | 5.84 | Pass | Primary buttons |
| White on crimson #9E0B24 | 8.31 | Pass | Top bar, footer, closing band |
| Blush #FDEEF1 on crimson | 7.39 | Pass | Footer body text |
| Body grey #5B5B5B on white | 6.79 | Pass | Body text |
| Body grey #5B5B5B on blush | 6.04 | Pass | |
| Body grey #5B5B5B on off-white | 6.51 | Pass | |
| Deep maroon on yellow #F7C600 | 11.28 | Pass | Yellow footer and band buttons |
| Deep maroon on gold #E0A000 | 7.96 | Pass | Yellow button hover |

### Pairs that fail and how they are handled

| Pair | Ratio | Decision |
|---|---|---|
| **Deep maroon #2B0A12 on crimson #9E0B24** | **2.19 (fail)** | The brief asked for maroon footer text on crimson. That fails AA, so the footer uses white and blush text instead. Maroon appears in the footer only as text on the yellow button. |
| Yellow #F7C600 on white | 1.61 (fail) | Never used for text on white. Yellow appears only as accents and button fills on crimson. |
| Gold #E0A000 on white | 2.28 | Used only for the review stars, which are decorative. Each star row has a text alternative (`role="img"` + `aria-label`), and the rating (4.9) is also given as text. |
| Pale pink #F3D3DB on white | 1.39 | Used only for the decorative card numbers 01 to 05 (`aria-hidden`), borders and dot patterns. Never used for information. |
| Button red on soft pink #F3D3DB | 4.22 | Avoided for small text. Chips use a white background. |

## Structure and semantics

- One `<h1>` on each page: the hero headline on the home page, the service name on service pages. Headings follow in order (h2 sections, h3 cards).
- Landmarks: `header`, `nav` (Main, Mobile, Breadcrumb, Quick actions), `main#main`, and `footer`. Each section is labelled by its heading.
- A skip-to-content link is the first focusable element.
- Every form field has a `<label>`. Required fields have `aria-required` and a visible marker, and the meaning of the marker is stated in text. Errors are linked to fields with `aria-describedby`, announced through `aria-live`, and fields get `aria-invalid`. On a failed submit, focus moves to the first invalid field.
- Success message: `role="status"`, and it receives focus. Error message: `role="alert"`.
- Accordions use `<button aria-expanded aria-controls>` with `role="region"` panels. Collapsed panels are `inert`. The first item is open by default.
- The lightbox is a `role="dialog"` with `aria-modal`. It traps focus, closes with Esc, supports the arrow keys, and returns focus to the photo that opened it.
- The mobile menu traps focus, closes with Esc, and is `inert` while closed.
- Image placeholders use `role="img"` with descriptive labels, and decorative frames are `aria-hidden`. Real photos must each get descriptive `alt` text.
- External links state "(opens in a new tab)" for screen readers.
- The language toggle uses `aria-pressed` and updates `<html lang>`. Telugu text carries `lang="te"`.

## Keyboard and focus

- All interactive elements can be reached by keyboard. Focus rings are a 3px crimson outline, and yellow on crimson backgrounds.
- Touch targets are at least 44px (buttons 44–56px, nav links 44px, carousel dots 28×44px, footer links 44px).

## Motion

- `prefers-reduced-motion: reduce` makes all content appear at once. It also turns off smooth in-page link scrolling, parallax, floating badges, carousel auto-advance, count-up and page transitions.
- The home hero particle field is drawn still (no motion, no cursor response) for reduced-motion visitors, ignores pointer input (`pointer-events: none`), is hidden from screen readers, and is kept clear of the headline, text and buttons.
- Content can be read without JavaScript. Reveal styles apply only when the `js` class is set, and a 3-second fallback removes that class if the script fails to load.
- The reviews carousel does not auto-advance by default (`autoAdvance` in `src/reviews.json`). If it is turned on, it pauses on hover, focus, touch, when off screen, and when the tab is hidden. Inactive cards are dimmed to 85% opacity; body text stays above 4.5:1.

## Responsive

- Tested at 360, 375 and 1440px wide. No horizontal page scroll at 360px (`scrollWidth` equals viewport width). The only sideways scrolling is in the intended carousels (Reviews, and Why Choose Us on mobile).

## Validation

- HTML checked with `html-validate` (recommended rules). No structural errors remain. One stylistic warning is ignored: `tel-non-breaking`, which flags spaces in "Call Clinic" link labels.

## Still to check once real assets arrive

- Alt text for each real photo.
- Contrast of any text placed over photos.
- Contrast of the logo colours, once sampled.
- A screen reader pass (NVDA + Chrome, TalkBack on Android) and a Lighthouse run on a mid-range Android device for the 2-second first-paint target.
