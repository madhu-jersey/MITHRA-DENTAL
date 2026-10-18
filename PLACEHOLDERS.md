# Placeholders to resolve before publishing

Every item below is shown on the site with a dashed "To be confirmed" label, or is marked with a comment in the source.
Text content lives in `src/data.mjs` and `src/build.mjs`. Run `node src/build.mjs` after editing.

| # | Item | Where it appears | What is needed |
|---|------|------------------|----------------|
| 1 | **Logo** | Done: header, footer, About panel, browser tab and home-screen icon use the supplied badge (`assets/img/logo.webp`, with sized copies `logo-96/192/320.webp`, `logo-192.png`, `favicon-32/48.png`, `apple-touch-icon.png`) | Check the name: the badge reads "Sree Mithra Dental Specialists" and "Facial Trauma, Laser & Dental Implant Center", while the site says "Dental & Maxface Specialists" and does not mention laser treatment. |
| 2 | **Clinic photos** | Gallery (9 slots), service-page heroes, "Why they occur" illustrations (the home hero now uses the tooth mascot, `assets/img/tooth-mascot.png` / `.webp`; please confirm the clinic has the rights to use that image) | Real photos. Export as AVIF or WebP with a JPEG fallback, using `<picture>` and `loading="lazy"`. See the comment above `ph()` in `build.mjs`. |
| 3 | **Doctor photos** | Doctors section | One photo per doctor. Check each photo matches its name. |
| 4 | **Doctor name and degrees** | Doctors section, booking dropdown | Confirm "Dr. G. Sriramu Subbareddy, M.D.S (OMFS)". The first signboard reads "Dr. S.R.S. Reddy, G.P.D.S. (OMFS)". Only one name is shown. |
| 5 | **Doctor specialty labels** | Doctors section eyebrows | Dr. Subbareddy: confirm the "Oral & Maxillofacial Surgery" label. Dr. Lakshmi: specialty not supplied. |
| 6 | **Doctor registration numbers, quotes, key services** | Doctors section | Registration numbers, a short quote from each doctor, and the confirmed list of services for each. |
| 7 | **Google star breakdown** | Reviews overview bars (currently ESTIMATED 45/7/0/0/0) | Number of reviews for each star rating (5 to 1) from the listing. Enter them in `breakdown.counts` in `src/reviews.json`. Bars, counts, hover percentages and the removal of the "to be confirmed" badge then work automatically. The rating (4.9) and count (52) are a snapshot from 17 Oct 2026. Update them from Google when needed. |
| 8 | **More reviews** | Reviews carousel (3 real reviews from the listing) | Add only reviews that the client or Google confirms, copied exactly, with names as initials, to `reviews` in `src/reviews.json`. Relative times ("3 weeks ago") were captured on 17 Oct 2026 and will go out of date. |
| 9 | **Google links** | Done | The reviews and directions links to the Google listing are set in `src/reviews.json`. Each review card links to the listing, because individual review links were not supplied. |
| 10 | **Stat numbers** | Hero "Years of care" `[N]` (the About panel now shows only confirmed facts: 5 specialities, 2 doctors, open 7 days) | Confirmed numbers. Put the number in `data-count` and the count-up animation will run. |
| 11 | **Gallery photos** | Gallery ("[N] photographs" counts real photos automatically) | Put each photo (JPG, PNG or WebP, at least 800px wide) in `assets/img/gallery/`, set its `src` (and optional `focus`) in `src/gallery.json`, then run `node src/optimize-gallery.mjs` and `node src/build.mjs`. Uploading from the browser needs the same backend as the booking form. |
| 12 | **Insurance** | Home FAQ question 6 | Whether insurance is accepted, and which providers. |
| 13 | **Emergency arrangements** | Home FAQ question 5; facial trauma page | Whether the clinic sees emergencies, and when. Check the "First steps" box on the facial trauma page. |
| 14 | **Booking backend** | Connected: the form uses the clinic Google Apps Script (`CONFIG.apiUrl` in `assets/js/booking.js`). See `BOOKING.md` for the tests and open points | Confirm the final submit wording and whether the backend emails patients (the success panel says it does). Evening slots run 6 to 9 PM; the listed hours elsewhere (8 PM) are being updated by the client. |
| 15 | **Map embed** | Done | The contact section shows a live Google map of the clinic. The embed URL is `mapEmbedUrl` in `src/reviews.json`. Optional: replace it with the official code from Google Maps > Share > Embed a map. |
| 16 | **Medical content approval** | All five service pages, plus FAQ answers | The dentists must review every problem, cause, treatment and FAQ answer. Recovery times are marked "To be confirmed by the doctor". Remove the draft label only after approval. |
| 17 | **Items marked TBC within services** | Cosmetology: minor orthodontic options. Implants: bone grafting and healing time. Facial trauma: referral. Maxillofacial: "certain diseases" | Details from the doctors. |
| 18 | **Telugu translation** | Language toggle (navigation and button labels only) | The Telugu strings in `site.js` (`TE`) are a draft. A native speaker should review them, and the client should decide whether to translate the full site. |
| 19 | **Domain** | Footer copyright | The final domain (`clinic.domain` in `data.mjs`). |
| 20 | **Gallery captions** | Gallery | Match the captions to the photos supplied, for example Reception, Treatment room, Sterilisation, Clinic exterior. |
