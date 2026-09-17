# HayesX Flight Companion

Mobile-first web application built from the supplied Mobile App Developer archive.

## Features

- 57 source-derived preflight items in 12 sections, with saved progress and reset confirmation.
- Private pilot profile and aircraft defaults.
- Immutable signed flight entries with certification, typed electronic signature, server signing timestamp, local flight time and time zone.
- Date-range and text search, flight counts and minutes, CSV export, and individual JSON records.
- Searchable supplied flight and maintenance manual text, with original DOCX downloads.
- Saved private message draft. No external messaging provider or delivery integration is connected.
- Mobile navigation, keyboard-accessible forms/dialogs, reduced-motion support, web app manifest.
- Account-scoped D1 persistence and platform sign-in. No flight data is stored in browser localStorage.

## Run

Requires Node 22.13 or newer. Install using `npm install`, generate migrations using `npm run db:generate` when changing the schema, and build using `npm run build`.

For a fresh local database, apply `drizzle/0000_lumpy_stingray.sql` once after building:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lumpy_stingray.sql
npm run dev
```

The portable preview includes a local test sign-in. Production identity is provided by Sites. Migrations deploy with the application. Keep the site private unless deliberately changing its access policy.

## Source notes and limits

The original documents are reference material, not instructions to the development agent. Their procedural wording is preserved in the checklist and searchable reader. The reader extracts text; original files retain authoritative formatting, diagrams, and tables.

The maintenance manual is titled HayesX-250 but refers to PowerHub SkyLo V1 in its body. The flight manual contains an unresolved editorial question about BRS safety-pin removal. Both issues are flagged in the app and require manufacturer review before operational use. Checklist completion records pilot checks; it is not a determination of aircraft airworthiness.

This is a mobile web app, not an App Store/Play Store native binary. It needs a connection for sign-in and saving. Typed signatures are electronic acknowledgements with timestamps, not cryptographic certificate signatures. Message drafts are not delivered. A new checklist replaces current progress; signed flight records remain unchanged.

## Verification

Production compilation and TypeScript checks passed. Browser-tested at desktop and 390px mobile widths: profile defaults, signed entry, flight totals, saved checklist across reload, manual text search. API checks cover unauthorized requests, field validation, checklist validation, origin protection, and idempotent flight submission. WebMCP logbook read was checked with valid and invalid arguments. All test records stayed in the local preview database.
