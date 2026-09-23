# HayesX Mobile App

Product outline and clickable draft for the **HayesX** pilot companion app — the
mobile counterpart to the HayesX-250 single-seat eVTOL.

The app has five tabs, taken from the `HayesX Mobile App.xlsx` sitemap:

| Tab | Purpose |
|---|---|
| **Preflight Checklist** | Guided, sequenced execution of Flight Manual Ch. 4 with a hard go / no-go gate |
| **Digital Logbook** | Signed flight records, date search, flight/minute totals, export |
| **Manuals** | Flight Manual + Maintenance Manual, offline, with emergency-procedure quick access |
| **Messages** | Support thread and safety/service bulletins from HayesX |
| **Account** | Pilot profile, aircraft registry (serial no.), signature, units, sync |

## The app

A **Next.js 16 PWA**, local-first: every screen reads and writes IndexedDB in
the browser, so the whole app works with the radio off — which is the normal
case at a Part 103 field, not the edge case.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run test:e2e   # 22-step end-to-end run (needs a build running)
```

**Live:** https://hayesx.vercel.app

Deploying to Vercel needs no configuration: import the repo and it builds. There
is no database to provision and no environment variable to set — see
[`docs/04-tech-stack.md`](docs/04-tech-stack.md) for how to swap the local store
for Supabase when you want records to sync across devices.

### What is built

| Area | State |
|---|---|
| Onboarding — pilot, airframe (serial entered once), signature | ✅ |
| Preflight run — all 57 items, 10 sections, enforced order | ✅ |
| Warning interstitials (FM 4.4.3), sequential power-up, abnormal conditions | ✅ |
| Battery gate — numeric, refuses below 95% with the FM citation | ✅ |
| NO-GO → photo + note → defect → aircraft grounded app-wide | ✅ |
| Return to Service — the only route back to airworthy | ✅ |
| Sign preflight — time, GPS, manual revision, immutable | ✅ |
| Flight timer → pre-filled logbook entry | ✅ |
| Logbook — 9 fields, certify + sign, locked, amendments | ✅ |
| Date-range search and flight/minute totals | ✅ |
| Manuals — chapters, search, Ch. 2 limits table | ✅ |
| Emergency procedures — all 16 from FM Ch. 3, offline | ✅ |
| Messages — bulletins with required acknowledgement | ✅ |
| Account — profile, registry, signature, export, reset | ✅ |
| Day / Night / Auto themes, applied before first paint | ✅ |
| Multi-device sync, push notifications, maintenance tracking | Phase 2 |

The safety rules from [`docs/03-data-model.md`](docs/03-data-model.md) §3.3 live
in [`lib/repo.ts`](lib/repo.ts), not in the screens, so no UI path can produce an
invalid record. [`tests/e2e.mjs`](tests/e2e.mjs) proves each one.

### Design language

The UI follows the conventions of aviation electronic flight bags — ForeFlight
in particular, the category leader, which has the same three pillars as this
app: checklist, logbook, documents. A HayesX pilot almost certainly has it on
their phone already, so matching its conventions makes the app feel familiar
from the first tap:

- **Day / Night / Auto**, chosen with a three-button control, as EFBs do.
  Day is the default because Part 103 operations are daytime-only.
- **Grouped tables** — large titles, caps section headers, right-aligned
  values, chevrons — and segmented controls for filters.
- **Colour-coded checklist** states: open ring, green check, red cross.
- **System fonts** — San Francisco on iPhone — which also means nothing loads
  from the network, so the app renders identically offline.

It adopts the category's conventions, not ForeFlight's branding: no logo,
name, colours or assets of theirs are used.

### Code map

| Path | What it is |
|---|---|
| `app/(app)/` | The five tabs |
| `app/onboarding/` | First-run setup |
| `lib/checklist.ts` | Loads and validates `data/preflight-checklist.json` |
| `lib/repo.ts` | Every safety rule, enforced in one place |
| `lib/db.ts` | Dexie/IndexedDB schema |
| `lib/limits.ts` | Flight Manual limits, read from the data file |
| `lib/emergency.ts` | FM Ch. 3 procedures |
| `components/` | App shell, signature pad, UI primitives |

## What's in this repo

| Path | What it is |
|---|---|
| [`docs/01-product-outline.md`](docs/01-product-outline.md) | Vision, users, scope, principles, feature map |
| [`docs/02-screen-specs.md`](docs/02-screen-specs.md) | Screen-by-screen spec with states and behaviours |
| [`docs/03-data-model.md`](docs/03-data-model.md) | Entities, fields, relationships, integrity rules |
| [`docs/04-tech-stack.md`](docs/04-tech-stack.md) | Recommended build (Next.js PWA on Vercel) and why |
| [`docs/05-sprint-plan.md`](docs/05-sprint-plan.md) | Epics, user stories, estimates, six sprints to v1.0 |
| [`docs/06-open-questions.md`](docs/06-open-questions.md) | Decisions needed before build, with owners |
| [`data/preflight-checklist.json`](data/preflight-checklist.json) | The full checklist as structured data, ready to import |
| [`prototype/index.html`](prototype/index.html) | The original clickable design draft — kept as the design reference |

**Live prototype:** https://claude.ai/code/artifact/9436b345-1efb-448f-9b88-47fb3edf08fc

## Source material

Derived from the supplied `Mobile App Developer` pack:

- `HayesX-250 Flight Manual.docx` — Doc. No. HayesX-250-FM-001, Revision A, 2026
- `HayesX-250 Maintenance Manual.docx` — bilingual EN/中文
- `Preflight Checklist.docx` — excerpt of Flight Manual Ch. 4
- `Digital Logbook.docx` — required logbook fields
- `Logbook (manual) for reference.png` — paper logbook the digital one replaces
- `HayesX Mobile App.xlsx` — top-level app sitemap

> **Note on regulatory posture.** The HayesX-250 is operated as an ultralight
> vehicle under FAA Part 103 and CCAR-91-R4. No airworthiness certificate is
> required, so nothing in this app is a certified avionics function. It is a
> pilot record-keeping and reference tool. See
> [`docs/06-open-questions.md`](docs/06-open-questions.md) Q4 and Q5.
