# Booking section

The "Book your appointment" section on the home page talks to the clinic's Google Apps Script backend.

- Markup: the `#booking` section in `src/build.mjs` (run `node src/build.mjs` after editing)
- Behaviour: `assets/js/booking.js`, with every setting in the `CONFIG` block at the top (API URL, time zone, 7-day window, periods, service names, doctor names, clinic phone, message limit, draft key)
- Styles: the "Booking" blocks in `assets/css/site.css`

## How it works

- **Slots:** `GET ?action=slots&date=YYYY-MM-DD`. Only the free slots the server returns are shown, labelled like "10:00 AM to 10:30 AM". Changing the date or the period clears the chosen slot.
- **Request:** `POST` with a JSON body sent as `text/plain;charset=utf-8`, which avoids a CORS preflight. Fields sent: `name`, `mobile` (10 digits), `email`, `service`, `doctor`, `date`, `period`, `slotStart`, `message` (200 characters at most), `consent`, and `website` (the honeypot).
- **Replies:**
  - `pending`: the success panel shows the booking ID.
  - `error`: the server's message appears in a red alert, the details stay filled in, and the slot list reloads.
  - Network failure: "Could not send your request. Please call 088192 20055."
- **Date window:** today through 7 days ahead, in Asia/Kolkata time. The date picker's `min` and `max` follow this window.
- **Privacy:**
  - Patient details are only sent in the POST body, never in a URL.
  - Only the form draft is kept in `localStorage` (name, mobile, email, service, doctor and message, under `sm-booking-draft`).
  - The draft is deleted after a successful request and isn't saved again for that request.
- **Spam:** a `website` field is hidden off-screen (not `display:none`). People never see it, so it stays empty. It's always sent, and the server decides what to do with it.

## Decisions that differ from the written spec

- **All four steps are visible from the start.** The spec described revealing them one at a time; the client asked for them all to show.
- **Email is required.** The spec said optional; the client asked for it to be required.

## Tested (18 Oct 2026, headless Edge)

Slot lookups used the live endpoint. Every POST was intercepted by the test, so no rows were written to the sheet.

- [x] **Valid booking:**
  - The live slots loaded and the POST body matched the backend's fields, sent as `text/plain`.
  - The success panel showed the booking ID and a summary, and the saved draft was deleted.
- [x] **Slot taken while filling in the form:**
  - The server's message appeared in the alert, the details stayed filled in, and the fields unlocked again.
  - The slot list reloaded without the taken time, with the message "That time is no longer available. Please choose another time slot."
- [x] **Sunday evening:** "Evening visits are not available on Sundays. Please choose morning or another date."
- [x] **Date outside the window:** the picker is limited to today through 7 days ahead. A date typed beyond that gives "Please choose a date within the next 7 days.", and the last day in the window loads its 8 morning slots.
- [x] **Network failure:** "Could not send your request. Please call 088192 20055.", with the details kept.
- [x] **Honeypot filled:** the value is sent as `website`, and the server's reply is shown.
- [x] **Slot list fails to load:** "Could not load times. Please call 088192 20055."
- [x] **Submitting too early:** the first missing item gets focus, for example the consent box with "Please confirm that we may contact you about your appointment."
- [x] **Layout:** at 360px wide there is no horizontal scroll, with one column and the left panel first.

## Seen on the live backend

- On 18 Oct 2026 at 10:30 AM IST, the live endpoint returned no morning slots for today, although 11:00 AM to 1:30 PM had not passed. This may be an intended same-day cut-off or a bug in the Apps Script. The form shows "No appointments are available on this date. Please choose another date." in that case.

## To confirm with the client

- **Logo:** still a text placeholder.
- **Doctor names and degrees:** "Dr. G. Sriramu Subbareddy, M.D.S (OMFS)", against the signboard's "Dr. S.R.S. Reddy, G.P.D.S. (OMFS)", and "Dr. G.V.N. Lakshmi, B.D.S." The names sent to the backend are set in `CONFIG.doctors`.
- **Final submit wording:**
  - Button: "Request Appointment".
  - Success panel: "Request received. It is not confirmed yet. We will confirm by phone or message shortly."
  - Email line: "We have also sent the details to your email…" This should only stay if the backend actually sends an email.
- **Hours:** the left panel and the site say Mon to Sat 9 AM to 8 PM, while evening slots run to 9 PM. The client is updating the listed hours.
