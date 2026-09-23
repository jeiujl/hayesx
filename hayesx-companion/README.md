# HayesX Companion

A standalone mobile web app (installable PWA) for HayesX-250 owners and pilots. It is a separate project from the other app versions in this repository and shares no code with them.

It has five tabs, matching the app brief:

| Tab | What it does |
| --- | --- |
| **Checklist** | Interactive preflight (Flight Manual 4.2–4.7) and shutdown (4.8) checklists. Tap to confirm items, flag discrepancies with a note, and enter the PFD battery reading (below 95% automatically fails). Each run finishes as GO or NO-GO with a timestamped record. A NO-GO can be reported to HayesX support in one tap. A GO links straight to a new logbook entry. |
| **Logbook** | Digital logbook with the fields from the brief: aircraft description (default HayesX-250), category (default Ultralight FAA Part 103), serial number (entered once, then filled in automatically), pilot (defaults to the account owner, editable), date and time (defaults to now), route from/to, flight time in minutes, weather, and notes. The pilot certifies each entry and signs it on screen. Search by date range with a report that totals flights and minutes. CSV export and print. |
| **Manuals** | Full Flight Manual (HayesX-250-FM-001 Rev A) and Maintenance Manual, with search, an emergency quick reference, and a maintenance tracker. The tracker covers 10/50/100/500-hour inspections from logged hours, battery cycle inspections, life-limited parts by date, and Chapter 15 maintenance records. |
| **Messages** | Two-way chat with HayesX support, with photo attachments, plus HayesX bulletins. HayesX staff get an inbox of pilot conversations, can reply, publish bulletins, and issue a temporary password to a locked-out pilot. |
| **Account** | Pilot profile, aircraft profile (serial, prior hours, battery cycles, life-limited part dates), theme (system/light/dark), sync status, data export (CSV/JSON), password change, staff access, sign out, account deletion. |

The app works offline after the first sign-in. The service worker caches the app shell and both manuals. Checklists, logbook entries, and maintenance records are saved on the device (IndexedDB) and sync to the account when the connection returns.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, JavaScript
- Tailwind CSS 4, Barlow / Barlow Condensed / JetBrains Mono (self-hosted via Fontsource)
- Vercel Blob (private store) for accounts, synced data, messages, and photos. There's no separate database.
- Route handlers under `app/api/*`, with HMAC-signed session cookies and scrypt password hashes

## Run locally

```bash
cd hayesx-companion
npm install
npm run dev            # http://localhost:3000
```

Without `BLOB_READ_WRITE_TOKEN` the server stores everything under `./.data` on disk, so no cloud setup is needed for development. The local staff access code is `dev-staff-code`.

End-to-end test (26 checks, phone viewport, needs a running server and Chromium):

```bash
npm run build && npx next start -p 3100 &
BASE_URL=http://localhost:3100 npm run test:e2e
```

## Environment variables (production)

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Set automatically when a private Vercel Blob store is connected to the project. |
| `AUTH_SECRET` | Random string used to sign session cookies. Changing it signs everyone out. |
| `HAYESX_STAFF_CODE` | Code HayesX employees enter in Account → HayesX staff access. Leave it unset to disable staff access. |
| `HEALTH_TOKEN` | Optional. Enables `GET /api/health?deep=<token>`, an end-to-end storage self-test. |

## Applying the official HayesX brand

The build environment couldn't reach hayesx.net, so the visual identity is provisional. The palette comes from the aircraft itself (carbon fiber, PFD blue, red torque-seal and BRS handle) and the wordmark is set in type. To switch to the official brand kit:

1. Put the logo in `public/brand/` and set `BRAND.logo` in `lib/brand.js`.
2. Update the color tokens at the top of `app/globals.css` (light and dark blocks).
3. Replace the icons in `public/icons/` (or edit and rerun `node scripts/make-icons.mjs`).

## Content sources

- `content/checklists.js`: Preflight Checklist (Flight Manual Ch. 4 excerpt)
- `content/flight-manual.js`: HayesX-250 Flight Manual, Rev A
- `content/maintenance-manual.js`: HayesX-250 Maintenance Manual (English text of the bilingual source)
- `content/maintenance.js`: tracking rules derived from Maintenance Manual Ch. 12–13 and Flight Manual 2.6

The printed manuals remain the controlling documents.
