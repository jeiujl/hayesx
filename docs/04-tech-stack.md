# 4. Recommended Build

You mentioned Vercel or Replit. Here is what I would actually build this on, and
the honest trade-offs.

## 4.1 Recommendation: Next.js PWA on Vercel

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js 15, App Router, TypeScript** | Vercel-native, one codebase for iOS + Android + desktop |
| Delivery | **Installable PWA** | Home-screen install, no app-store review |
| UI | **Tailwind CSS + shadcn/ui** | Fast, and easy to force the large-target, high-contrast rules from §1.4 |
| Offline | **Service worker (Serwist) + IndexedDB (Dexie)** | The non-negotiable requirement |
| Backend | **Supabase** — Postgres, Auth, Storage, Row-Level Security | One service covers auth, DB, file storage and per-pilot access rules |
| ORM | **Drizzle** | Typed schema, real SQL migrations for the triggers in §3.3 |
| Signature | `signature_pad` on a canvas | Small, well-tested |
| PDF export | `@react-pdf/renderer` | Logbook pages that look like the paper book |
| Push | Web Push (VAPID) | See the iOS caveat below |
| Errors | Sentry | |

### Why a PWA and not a native app

The decisive argument is **manual revisions**. This app is a distribution channel
for safety documentation. When HayesX issues a revision or a service bulletin,
every pilot needs it now — not after a 1–3 day App Store review. A PWA updates
the moment you deploy.

Second: it is one codebase instead of three, and Vercel is where you already
wanted to be.

### The honest caveat

**iOS web push requires iOS 16.4+ and the app installed to the home screen.** If
a pilot browses in Safari without installing, they get no notifications. For
safety bulletins that is a real gap. Mitigations, in order of cost:

1. Make home-screen install a required onboarding step, with a short guided
   prompt. Also send safety bulletins by email and SMS as a backstop.
2. If that is not good enough, wrap the same web app in **Capacitor** later. The
   codebase does not change; you gain native push, reliable background tasks,
   and store presence. Plan for this — do not build for it on day one.

Going straight to **React Native / Expo** is the other defensible choice: better
camera and offline story, real push everywhere. It costs you the instant-update
property, adds store review to every manual revision, and is more work. I would
only pick it if in-flight or in-cockpit mounting becomes a requirement (see
open question Q4) or if a hardware/FDR link lands on the roadmap early.

### On Replit

Good for the prototype and for a quick shared preview while the checklist content
is being reviewed. For production, deploy on Vercel and keep the database in
Supabase — you want migrations, backups, and RLS on records that are legal
documents.

## 4.2 Project shape

```
hayesx-app/
├── app/
│   ├── (auth)/            sign-in, sign-up, onboarding
│   ├── (app)/
│   │   ├── preflight/     home · [runId] · history · no-go · sign
│   │   ├── logbook/       list · new · [id] · totals · export
│   │   ├── manuals/       library · [doc]/[section] · emergency · search
│   │   ├── messages/      threads · [id] · bulletins
│   │   └── account/       profile · aircraft · signature · settings · data
│   └── api/               sync, export, push, webhooks
├── components/
│   ├── checklist/         ItemCard · SectionScreen · WarningInterstitial · NumericGate
│   ├── signature/         SignaturePad · SignatureBlock
│   └── ui/                shadcn primitives
├── lib/
│   ├── db/                drizzle schema · migrations · triggers
│   ├── offline/           dexie · outbox · sync engine
│   ├── checklist/         loader + validator for data/preflight-checklist.json
│   └── limits/            typed constants from the Flight Manual, single source
├── data/
│   ├── preflight-checklist.json
│   └── manuals/           structured manual content (see §4.3)
└── public/                icons, manifest, service worker
```

## 4.3 Manual content — do not ship PDFs

The Flight Manual and Maintenance Manual should be converted **once** into
structured JSON/MDX with stable section IDs, not embedded as PDFs. Reasons:

- PDF is unreadable on a phone in sunlight and cannot reflow for large type.
- Deep links (`fm://3.13`) from checklist items and defect records need anchors.
- Full-text search needs indexable text.
- The tables (limits, specifications, maintenance intervals) need to be real
  tables.

This is a one-off content-engineering task, sized in Sprint 4. The bilingual
Maintenance Manual doubles it — see Q8.

## 4.4 Environment and delivery

- **Environments:** `preview` (per PR, Vercel), `staging` (pilot beta),
  `production`. Separate Supabase projects for staging and production.
- **Secrets** in Vercel environment variables; nothing in the repo.
- **CI:** typecheck, lint, unit tests, and a Playwright run of the full checklist
  happy path plus the no-go path on every PR.
- **Migrations** run on deploy, forward-only.
- **Backups:** daily Supabase backups plus a weekly export of `flights` and
  `preflight_records` to cold storage. These are legal records.
- **Monitoring:** Sentry for errors, Vercel Analytics for web vitals, and an alert
  on sync-outbox failures above a threshold.
