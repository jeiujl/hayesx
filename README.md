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
| [`prototype/index.html`](prototype/index.html) | Self-contained clickable prototype — open in a browser |

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
