# 5. Sprint Plan

> The `/product-management:sprint-planning` skill is not installed in this
> session, so this plan follows a standard agile shape rather than a house
> template: epics → user stories → estimates → sprint goals. Say the word if
> your team uses a specific format (Jira import CSV, Linear, Shortcut) and I'll
> re-cut it.

## 5.1 Assumptions

| | |
|---|---|
| Sprint length | 2 weeks |
| Team | 1 full-stack dev, 1 designer (part-time), 1 PM/pilot SME (part-time) |
| Velocity | ~20 points/sprint, ramping to 25 after Sprint 1 |
| Scale | Fibonacci — 1, 2, 3, 5, 8, 13 |
| Definition of Ready | Acceptance criteria written · design attached · content confirmed against the Flight Manual · open questions for that story resolved |
| Definition of Done | Merged · unit + E2E tests green · works offline · accessible (AA) · tested on a real phone in direct sunlight · demoed to the pilot SME |

**Total: 176 points across 6 sprints ≈ 12 weeks to v1.0**, plus a 2-week field
beta running in parallel with Sprint 5.

## 5.2 Epics

| | Epic | Points | Value |
|---|---|---|---|
| **A** | Foundations & offline shell | 26 | Enabler |
| **B** | Account, aircraft registry & signature | 21 | Enabler — everything else needs the serial number and the signature |
| **C** | Preflight checklist engine | 47 | ★ The wedge. Highest value, highest risk |
| **D** | Digital logbook | 34 | ★ Replaces a physical object the pilot loses |
| **E** | Manuals & emergency procedures | 29 | ★ Safety + satisfies FM 4.2 |
| **F** | Messages & bulletins | 19 | Closes the loop back to HayesX |
| **G** | Hardening, beta & launch | 20 | Ship |
| **H** | *Maintenance tracking* | *~40* | *Phase 2 — not in v1.0* |

Sequencing rationale: **C before D** because the preflight is what pilots do
first and it produces the data the logbook consumes. **B before C** because a
preflight cannot be signed without a signature and cannot name an aircraft
without a serial number. **E after C** because the emergency procedures reuse the
manual reader that the checklist's ℹ passages already need.

---

## Sprint 0 — Foundations
**Goal: an installable, offline-capable, five-tab shell that a pilot can put on
their home screen — with nothing in it.** · 26 pts

| ID | Story | Pts |
|---|---|---|
| A-1 | As a dev, I have a Next.js + TypeScript + Tailwind repo deploying to Vercel previews on every PR | 3 |
| A-2 | As a pilot, I can install the app to my home screen and open it with no network | 5 |
| A-3 | As a dev, I have the Supabase schema from §3 with migrations, RLS, and the immutability triggers | 8 |
| A-4 | As a pilot, I can sign in and stay signed in across app restarts | 5 |
| A-5 | As a pilot, I see a five-tab bottom bar and the aircraft status banner (stubbed) | 3 |
| A-6 | As a dev, the design tokens enforce ≥56 px targets, AA contrast, and a daylight theme | 2 |

**Risk:** A-3 carries the database triggers that make signed records immutable.
Do it now, not later — retrofitting immutability onto live legal records is
miserable.

---

## Sprint 1 — Account, aircraft & signature
**Goal: a pilot can onboard, register their airframe once, and draw the
signature every later record will carry.** · 21 pts

| ID | Story | Pts |
|---|---|---|
| B-1 | As a new pilot, I complete a 4-step onboarding: account → profile → aircraft → signature | 5 |
| B-2 | As a pilot, I enter my aircraft serial number **once** and never retype it | 3 |
| B-3 | As a pilot, I draw my signature once and reuse it on every record | 5 |
| B-4 | As a pilot, I can edit my profile, units, theme and notification preferences | 3 |
| B-5 | As a pilot, I see sync status, pending item count, and storage used | 3 |
| B-6 | As a pilot, I can export all my data and read the Part 103 legal statement | 2 |

---

## Sprint 2 — Checklist engine (core)
**Goal: a pilot can run the full 57-item preflight offline and sign it.** · 26 pts

| ID | Story | Pts |
|---|---|---|
| C-1 | As a dev, the app renders the checklist from `preflight-checklist.json` with a runtime validator; no item text is hard-coded | 5 |
| C-2 | As a pilot, I work through sections A–J in enforced order and cannot skip forward | 5 |
| C-3 | As a pilot, each item gives me PASS / NO-GO in thumb-sized targets, with no third option | 3 |
| C-4 | As a pilot, section A presents the seven items as legal declarations, not casual checkboxes | 2 |
| C-5 | As a pilot, section G shows the FM 4.4.3 danger warning full-screen before I connect anything | 3 |
| C-6 | As a pilot, section G's power-up steps must be confirmed one at a time, in order | 3 |
| C-7 | As a pilot, item J-05 asks for a battery percentage and rejects anything under 95% with the FM citation | 3 |
| C-8 | As a pilot, my in-progress checklist survives the app being killed | 2 |

---

## Sprint 3 — No-go path, signing & flight timer
**Goal: the safety gate actually holds, and a completed preflight flows into a
flight.** · 21 pts

| ID | Story | Pts |
|---|---|---|
| C-9 | As a pilot, marking any item NO-GO stops the checklist, with no "continue anyway" | 3 |
| C-10 | As a pilot, a no-go lets me photograph the fault and add a note, creating a defect record | 5 |
| C-11 | As a pilot, a no-go grounds the aircraft app-wide and blocks new logbook entries | 3 |
| C-12 | As an owner, I can return an aircraft to service with a signed record naming the corrective action and any replaced part | 5 |
| C-13 | As a pilot, I sign a completed preflight and it is stamped with time, GPS, manual revision, and locked | 3 |
| C-14 | As a pilot, I start a flight timer from a signed preflight and end it to open a pre-filled logbook entry | 2 |

**This is the sprint the product lives or dies in.** If pilots find a way around
the gate, or find it so obstructive that they stop using the app, every other
feature is decoration. Field-test C-9 through C-11 with a real pilot before
Sprint 4 starts.

---

## Sprint 4 — Digital logbook
**Goal: the paper logbook is replaced, including its totals and its
signature.** · 29 pts

| ID | Story | Pts |
|---|---|---|
| D-1 | As a pilot, I create a logbook entry with all nine specified fields, most pre-filled | 5 |
| D-2 | As a pilot, I certify the entry as complete and accurate and sign it, after which it is locked | 5 |
| D-3 | As a pilot, I correct a mistake by filing a linked amendment; the original stays visible | 3 |
| D-4 | As a pilot, I browse my flights newest-first, grouped by month, with the preflight linked | 3 |
| D-5 | As a pilot, I search my logs by date range with presets and a custom range | 5 |
| D-6 | As a pilot, I see total flights and total minutes for the range, plus lifetime totals to date | 5 |
| D-7 | As a pilot, I export to CSV and to a PDF laid out like the paper logbook page | 3 |

---

## Sprint 5 — Manuals & emergency procedures
**Goal: the pilot has both manuals and all sixteen emergency procedures in their
pocket, offline.** · 29 pts

| ID | Story | Pts |
|---|---|---|
| E-0 | As a content task, both manuals are converted to structured content with stable section IDs | 8 |
| E-1 | As a pilot, I browse either manual by chapter with the section number always visible | 5 |
| E-2 | As a pilot, I download the manuals for offline use and see which revision I hold | 3 |
| E-3 | As a pilot, I search the full text of both manuals | 3 |
| E-4 | As a pilot, one red button gives me all 16 emergency procedures, offline, in large type | 5 |
| E-5 | As a pilot, procedures ending "no further flight allowed" offer a one-tap Ground this aircraft | 2 |
| E-6 | As a pilot, a new manual revision blocks my preflight until I acknowledge I have reviewed it | 3 |

**E-0 is content work, not code, and it is the most commonly under-estimated item
in this plan.** Start it in Sprint 3 in parallel if the SME has capacity.

---

## Sprint 6 — Messages, bulletins & launch
**Goal: HayesX can reach every pilot, and v1.0 ships.** · 39 pts (spans a
2-week beta)

| ID | Story | Pts |
|---|---|---|
| F-1 | As a pilot, I have a support thread with HayesX and can attach photos | 5 |
| F-2 | As a pilot, a defect from the no-go flow can be sent to support pre-attached | 3 |
| F-3 | As a pilot, I receive safety and service bulletins from HayesX | 5 |
| F-4 | As HayesX, I can require acknowledgement of a bulletin and see who has done so | 3 |
| F-5 | As a pilot, I get a push notification for safety bulletins and support replies | 3 |
| G-1 | Field beta: 3–5 pilots, 2 weeks, real flights, structured feedback | 5 |
| G-2 | Sunlight, glove and one-handed usability pass on real hardware | 3 |
| G-3 | Accessibility audit to WCAG 2.2 AA | 3 |
| G-4 | Security review: RLS policies, immutability triggers, signature handling, PII | 5 |
| G-5 | Launch: production environment, backups, monitoring, support runbook, install guide | 3 |
| G-6 | Legal sign-off on certification wording, Part 103 statement, privacy policy | 1 |

---

## 5.3 Phase 2 backlog — Epic H, Maintenance Tracking

Designed for in the schema, deliberately not built in v1.0. Roughly 40 points.

Everything below comes straight out of the Maintenance Manual, and all of it
depends on trustworthy flight-hour totals — which is exactly what the logbook
starts producing on day one of v1.0.

| Story | Source |
|---|---|
| Hours-to-next-inspection for rotors, motors and ECS against the 500-hour interval | Maint. Ch. 12, App. A |
| Battery cycle counter with 400-cycle inspection and 800-cycle performance check | Maint. Ch. 7 |
| Life-limited parts countdown: GPS mount base 2 yr · GNSS antenna mount base 2 yr · GBS 10 pyroactuator 5 yr or 100 flight hours, whichever first | Maint. Ch. 13 |
| BRS activation counter against the ~7-activation design basis | Maint. Ch. 13 |
| Maintenance record log with the ten fields Ch. 15 requires | Maint. Ch. 15 |
| Return-to-service functional checks per system | Maint. Ch. 16 |
| Long-term storage checklist and reminders | Maint. Ch. 14 |
| Per-flight and 10 h / 50 h / 100 h scheduled inspection checklists | Maint. Ch. 12 |

## 5.4 Phase 3 candidates

Fleet/dealer dashboard · multi-aircraft for operators · Flight Data Recorder
import (removes manual flight-time entry entirely) · weather and TFR integration
· instructor endorsements and training records · Apple Watch companion for the
flight timer · CSV import of historical paper logbook pages.

## 5.5 Top risks

| Risk | Impact | Mitigation |
|---|---|---|
| Checklist content is not signed off by HayesX engineering | Blocks Sprint 2 entirely | Resolve Q1 and Q2 **before** Sprint 2 planning |
| Pilots tap through the checklist without looking | The product becomes worse than paper | Enforced sequence, no batch-tick, per-item no-go analytics, field observation in G-1 |
| Offline sync bugs lose a signed record | Loss of a legal document | Append-only design, outbox with retry, local-first reads, restore test in G-4 |
| Manual conversion (E-0) is bigger than 8 points | Sprint 5 slips | Start it in Sprint 3, timebox, ship Flight Manual first and Maintenance Manual after |
| iOS push does not reach uninstalled users | Safety bulletins missed | Required install step, email/SMS backstop, Capacitor wrapper as the escape hatch |
| Digital signature is challenged as a record | Legal exposure | Q5 to counsel now, not at G-6 |
