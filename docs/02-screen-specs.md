# 2. Screen Specifications

Navigation is a **5-tab bottom bar**, matching the sitemap in
`HayesX Mobile App.xlsx`. Tab order is deliberate: Preflight first because it is
the first thing done at the aircraft.

```
┌─────────────────────────────────────────────┐
│  ⚠  N250HX · GROUNDED — prop crack   [view] │  ← persistent status banner
├─────────────────────────────────────────────┤
│                                             │
│                 screen body                 │
│                                             │
├─────────────────────────────────────────────┤
│  ✓        ▤        ▣        ✉        ●     │
│ Preflight Logbook  Manuals Messages Account │
└─────────────────────────────────────────────┘
```

The **status banner** is global and always reflects the active aircraft:
`AIRWORTHY` (green), `PREFLIGHT VALID · flight open` (blue, with elapsed timer),
or `GROUNDED` (red, with the reason and a link to the defect).

---

## 2.0 Onboarding (first run)

Four steps, skippable only where noted. Everything is stored locally and synced
when a connection appears.

1. **Sign in / create account** — email + password, or magic link.
2. **Pilot profile** — name, phone, emergency contact. Becomes the default
   `Pilot` on every logbook entry.
3. **Register aircraft** — model (defaults `HayesX-250`), category (defaults
   `Ultralight — FAA Part 103`), **serial number**, tail/ID, in-service date.
   The Digital Logbook brief calls out that the serial *"only need[s] to be
   populate[d] once"* — this is where.
4. **Draw signature** — captured once on a canvas, reused for every preflight and
   logbook certification. Re-drawable in Account.

Then: offer manual download for offline use (~large; show size, allow deferral).

---

## 2.1 Preflight Checklist

### 2.1.1 Tab home

- Aircraft card: model, serial, status.
- **Last preflight**: relative time, pass/fail, who signed.
- Primary button: **Start Preflight** — full width, 64 px tall.
  - Disabled with an explanation if the aircraft is `GROUNDED`.
- Secondary: **Preflight History** (list, filterable, each opens a read-only
  signed record).
- If a flight is currently open: the primary button becomes **End Flight
  (00:14:22)**.

### 2.1.2 The checklist run

One **section per screen**, ten sections, in Flight Manual order. A slim progress
rail across the top shows `A B C D E F G H I J` with the current one filled.

Sections and their sources:

| # | Section | FM § | Items |
|---|---|---|---|
| A | Preflight Preparation | 4.2 | 7 |
| B | Aircraft Structural Checks | 4.3.1 | 5 |
| C | Propellers | 4.3.2 | 6 |
| D | Motors | 4.3.3 | 3 |
| E | Battery System | 4.3.4 | 4 |
| F | Ballistic Recovery System | 4.3.5 | 3 |
| G | Power-Up + HV Connectors | 4.4, 4.4.2 | 5 + 6 |
| H | System Initialisation | 4.5 | 4 |
| I | Propulsion System Check | 4.6, 4.6.1 | 4 + 3 |
| J | Boarding | 4.7 | 6 |

Full item text and metadata: [`data/preflight-checklist.json`](../data/preflight-checklist.json).

**Item interaction.** Each row is a single card with the item text at 17 px
minimum and two buttons:

```
┌───────────────────────────────────────────┐
│ Check propeller tie wire fixing is intact │
│                                           │
│   ┌───────────────┐  ┌─────────────────┐  │
│   │    ✓  PASS    │  │   ✗   NO-GO     │  │
│   └───────────────┘  └─────────────────┘  │
└───────────────────────────────────────────┘
```

- No third state. There is no "N/A" and no "skip" on a safety item.
- Advancing to the next section requires every item in the current one answered.
- Back is always allowed; forward-jumping is not.
- Some items carry an **ℹ** that opens the exact manual passage in a sheet —
  no leaving the checklist.

**Special item types** (the `type` field in the JSON):

| Type | Behaviour |
|---|---|
| `check` | Standard pass / no-go |
| `declaration` | Section A only — pilot self-attestation (fit for flight, not under the influence, weather is VFR, area permissible, flight planned). Rendered as toggles with a preamble making clear this is a legal declaration. |
| `numeric_gate` | J-05 battery charge. Numeric keypad. **≥ 95 % required** (FM 4.7, cross-ref FM 2.5). Below 95 % is an automatic no-go with the limit and its citation shown. |
| `sequence` | Section G power-up. Steps must be confirmed in order and cannot be batch-ticked, because the order *is* the safety property. |
| `acknowledge` | Warning interstitials — full-screen, amber/red, one button. |

**Warning interstitials.** Rendered full-screen before the step they protect:

- Before G (power-up), from FM 4.4.3:
  > **DO NOT** connect or disconnect QS12 connectors under electrical load.
  > **DO NOT** short-circuit battery terminals.
  > **DO NOT** operate with damaged connectors.
- After G, from FM 4.4.4: an "abnormal conditions" card the pilot can tap at any
  later point — arcing, burning smell, connector overheating, startup failure →
  *disconnect power immediately and discontinue operation* → straight to the
  no-go flow.
- Section F carries FM 2.6's note that **BRS deployment cannot be cancelled**.

### 2.1.3 The NO-GO path

The moment any item is marked no-go:

1. Full-screen red **NO-GO** result. No dismissal to "continue anyway".
2. Capture: photo(s) — camera opens directly — plus a note. The photo is the
   highest-value field here; it is what the maintainer actually needs.
3. Creates a **Defect** record: item id, item text, FM section, aircraft, pilot,
   timestamp, GPS, photos, note.
4. Sets the aircraft to `GROUNDED`, with the defect as the reason. The banner
   goes red app-wide.
5. Offers: **Send to HayesX support** — opens the Messages tab with the defect
   pre-attached.
6. The Logbook cannot open a new entry for this aircraft while grounded.

The aircraft is un-grounded by a **Return to Service** action (Maintenance Manual
Ch. 16): who cleared it, what was done, parts replaced with serial numbers, and
whether a functional check was performed. In v1.0 this is a simple signed form;
in Phase 2 it becomes the maintenance module.

The same grounding is triggered by the FM 3.16 conditions — landing-gear damage,
structural damage, capsize, blade strike, parachute deployment, battery shock —
offered as a **Post Hard Landing** action on the logbook entry.

### 2.1.4 Completion

- Summary: all sections, all pass, duration.
- Certification text + signature pad (pre-filled with the stored signature,
  re-drawable).
- On sign: record becomes immutable; stamped with UTC + local time, GPS
  coordinates, app version, and the **manual revision** the checklist was
  generated from.
- Preflight validity: **4 hours**, or until the aircraft is powered down. After
  that a new preflight is required. (Proposed — needs confirmation, Q3.)
- Then: **Start Flight** → foreground timer, survives app backgrounding, shows in
  the status banner. **End Flight** → rounds to the nearest minute and opens a
  pre-filled logbook entry.

### 2.1.5 States

`idle` · `in-progress` (resumable if the app is killed) · `no-go` ·
`complete-unsigned` · `signed` · `expired` · `flight-open`

---

## 2.2 Digital Logbook

### 2.2.1 Entry form

Fields exactly as specified in `Digital Logbook.docx`:

| Field | Default | Notes |
|---|---|---|
| Aircraft Description | `HayesX-250` | From aircraft registry; editable |
| Aircraft Category | `Ultralight — FAA Part 103` | From registry; editable |
| Aircraft Serial Number | from registry | Entered once at onboarding, never retyped |
| Pilot | account owner | Free-text override for a guest pilot |
| Date & Time | device date/time | Editable for back-entry |
| Flight Route | `From —— To ——` | Two fields; recent locations autocomplete |
| Flight Time (minutes) | from flight timer | Integer minutes, editable |
| Weather Condition | — | Free text, per the brief. Chips for common cases (CAVU, light wind, gusty) as a shortcut, not a replacement |
| Notes | — | "About Flight or Machine". Long text |

Plus, added:

- **Linked preflight** — read-only chip showing the preflight record for this
  flight. Present automatically when the entry came from a flight timer.
- **Post Hard Landing?** — toggle that triggers the FM 3.16 grounding flow.

### 2.2.2 Certification

Verbatim intent from the brief and from the paper logbook:

> I certify that the information in this logbook entry is complete and accurate.

Checkbox + signature pad. On sign the entry is **locked**. Editing is impossible;
an **Amend** action creates a linked correction entry that shows beneath the
original. Both are visible forever. Unsigned entries are drafts and can be freely
edited or deleted.

### 2.2.3 List and search

- Reverse-chronological, grouped by month.
- Row: date · route · minutes · pilot · a small ✓ if signed.
- **Search by date range** — explicitly required by the brief. Presets: This
  month · Last 30 days · This year · Custom range. Plus free-text over route,
  weather, and notes.

### 2.2.4 Totals report

Required by the brief: *"The report will tally total number of flights and total
flight times in minutes."* Modelled on the paper logbook's page-totals block:

```
┌──────────────────────────────────────────┐
│  1 Jan 2026 – 2 Sep 2026                 │
│                                          │
│      47              1,284 min           │
│    FLIGHTS        21 h 24 m TOTAL        │
│                                          │
│  Longest 38 min · Average 27 min         │
│  ─────────────────────────────────────── │
│  Totals to date   112 flights  3,006 min │
└──────────────────────────────────────────┘
```

`Totals to date` is the running lifetime figure, mirroring "TOTALS TO DATE" in
the paper book. It also becomes the input to the maintenance hour tracking in
Phase 2.

### 2.2.5 Export

CSV (all fields, one row per flight) and PDF (formatted to resemble the paper
logbook page, with the certification block and signature image). Share sheet.

---

## 2.3 Manuals

### 2.3.1 Library

Two cards: **Flight Manual** and **Maintenance Manual**. Each shows document
number, revision letter, issue date, and offline status (`Downloaded` /
`Download 4.2 MB`).

A red **⚠ EMERGENCY PROCEDURES** button sits above both, always reachable.

### 2.3.2 Reader

- Chapter/section table of contents; deep links (`fm://3.13`) so the checklist
  and defect records can point at exact passages.
- Full-text search across both manuals, results grouped by document.
- Sticky section number in the header — you always know you're in 4.4.2.
- Bookmarks, adjustable text size, dark mode.
- Renders the manual tables (limitations, specifications, maintenance intervals)
  as real tables, horizontally scrollable — these are the most-referenced content
  and must not be images.
- Maintenance Manual is bilingual EN / 中文; a language toggle shows one or both.
  See Q8.

### 2.3.3 Emergency procedures

Sixteen cards from Flight Manual Chapter 3, one tap each, largest legible type,
red header, working offline, no scroll-to-find:

`3.3` Low Battery ≤35 % · `3.4` Emergency Battery ≤30 % · `3.5` Single Motor
Failure · `3.6` Multiple Motor Failure · `3.7` Flight Control System Failure ·
`3.8` Joystick Failure · `3.9` GPS Signal Loss · `3.10` Battery Overheating ·
`3.11` Battery Thermal Runaway · `3.12` Auto Flight Function Failure ·
`3.13` BRS Deployment · `3.14` Ditching · `3.15` Pilot Incapacitation ·
`3.16` Post Hard Landing Inspection

Pinned at the top of the list, from FM 3.2 — the response priority that governs
all of them:

> **1** Maintain vehicle control · **2** Select safe landing area ·
> **3** AUTO LAND · **4** RETURN TO HOME · **5** Manual landing · **6** BRS

Each card is action steps only — no prose. Procedures ending in "no further
flight allowed" (3.5, 3.8, 3.12) show that as a red footer and offer a one-tap
**Ground this aircraft**, which closes the loop back into the preflight gate.

The screen carries a persistent footer: *Ground reference only. Do not operate a
device in flight.* See Q4.

### 2.3.4 Revisions

The Flight Manual carries a revision record (`A · 2026 · Initial Release`). When
HayesX publishes a revision:

1. Push notification + Messages bulletin.
2. Badge on the Manuals tab.
3. A blocking **"Review required"** card on the Preflight tab, because FM 4.2
   requires the pilot to confirm the Flight Manual has been reviewed.
4. Pilot acknowledges → timestamped, stored, and visible to HayesX.
5. Any preflight signed after the revision cites the new revision letter.

---

## 2.4 Messages

- **Support** — one thread per pilot with HayesX. Text, photos, and file
  attachments. Defects arrive here pre-attached from the no-go flow.
- **Bulletins** — one-way broadcast from HayesX: safety notices, service
  bulletins, manual revisions, scheduled maintenance reminders.
  - A bulletin can be flagged `Acknowledgement required`; until acknowledged it
    shows as a card on the Preflight tab. This is the mechanism for anything
    safety-of-flight.
- Unread badge on the tab. Notifications respect Account settings, except that
  safety-critical bulletins always notify.
- Offline: messages queue and send on reconnect, with a clear pending state.

---

## 2.5 Account

| Group | Contents |
|---|---|
| **Profile** | Name, email, phone, emergency contact, photo |
| **Aircraft** | Registry list. Each: model, category, **serial number**, tail/ID, in-service date, current status, defect history, Return to Service log. Multi-aircraft supported by the schema; the UI ships single-aircraft with an "Add aircraft" affordance |
| **Signature** | View / redraw the stored signature |
| **Preferences** | Units (metric ⇄ imperial — the manuals mix km/h with mph and kg with lb), theme (Daylight / Dark / Auto), text size, language |
| **Notifications** | Bulletins, support replies, maintenance due. Safety-critical cannot be disabled |
| **Data & sync** | Last sync, pending items count, storage used, downloaded manuals, **Export all data** |
| **Legal** | FAA Part 103 statement (quoting FM 1.4), terms, privacy, licences |
| **Support** | Contact HayesX, app version, aircraft serial, diagnostics |

---

## 2.6 Cross-cutting behaviours

**Offline.** Every read is served from local storage. Every write goes to a local
queue with an optimistic UI and a visible pending state. A sync indicator lives in
Account, never in the way. Conflicts on signed records are impossible by design
(append-only); conflicts on drafts are resolved last-write-wins with the loser
kept as a copy.

**Permissions**, each requested in context with a reason, never on launch:
camera (defect photos) · location (preflight and logbook stamping) · notifications
(bulletins) · storage (offline manuals).

**Accessibility.** WCAG 2.2 AA. Full screen-reader labelling on every checklist
item. Nothing conveyed by colour alone — every pass/no-go carries an icon and
text as well. Dynamic type up to 200 % without loss of function.

**Analytics.** Checklist completion funnel, per-item no-go rates (fleet-wide, this
is a genuine safety signal — which item fails most often?), time-to-complete,
crash-free rate. No flight-route or location data leaves the device without
explicit opt-in. See Q7.
