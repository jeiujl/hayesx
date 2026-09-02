# 1. Product Outline

## 1.1 One-line

**HayesX** is the offline-first pilot companion for the HayesX-250 eVTOL: it walks
the pilot through the preflight checklist, decides go / no-go, records the flight
in a signed digital logbook, and keeps the flight and maintenance manuals in the
pilot's pocket.

## 1.2 Why it exists

Today a HayesX-250 pilot juggles three things at the aircraft:

1. A ~50-page Flight Manual PDF they are required to have reviewed before flight
   (FM 4.2), which nobody carries to a field.
2. A ~60-item preflight inspection (FM 4.3–4.7) done from memory or a printout,
   where a single missed item — a cracked propeller, a bulging battery, a QS12
   connector with burn marks — is a fatality.
3. A paper logbook that has to be totalled by hand and gets lost.

The app collapses all three into one thing the pilot already carries. The
preflight checklist is the wedge: it is the highest-frequency, highest-stakes,
most annoying part of the pilot's day.

## 1.3 Users

| User | Needs | Frequency |
|---|---|---|
| **Owner-pilot** (primary) | Fast, unambiguous preflight. Effortless logbook. Manual on hand. | Every flight |
| **Guest / instructor pilot** | Log a flight under their own name on someone else's airframe | Occasional |
| **Ground crew / maintainer** | See the defect that grounded the aircraft, with photos | On defect |
| **HayesX support** (back office) | Push bulletins and manual revisions; see fleet-wide defects | Continuous |

v1.0 serves the **owner-pilot**. Ground crew and back office are served
indirectly (defect records, Messages) and get their own surfaces in Phase 2.

## 1.4 Design principles

These come out of the source documents, not out of a style guide.

1. **Daylight-first, glove-first.** Part 103 operations are daytime-only (FM 2.7).
   The app will be used outdoors in direct sun, standing next to a running
   aircraft, possibly with gloves. Default to a **high-contrast light theme**,
   minimum 56 px tap targets, no gestures that require precision.
2. **Offline is the normal case, not the edge case.** Recommended operating areas
   are "open terrain… no significant obstacles from tall buildings" (FM 2.7) —
   i.e. exactly where there is no cell service. Every screen must work with the
   radio off. Sync is a background nicety.
3. **The checklist is a sequence, not a list.** FM 4.1: *"It is important to
   perform all procedures in the sequence outlined in the checklist."* The UI
   enforces order. You cannot tick "boarding" before "propellers".
4. **A failed item is an event, not a red checkbox.** Any no-go creates a defect
   record, grounds the aircraft in the app, and blocks the logbook. There is no
   "continue anyway" button.
5. **Signed records are immutable.** Once a pilot signs a preflight or a logbook
   entry, it is append-only. Mistakes are corrected by a linked amendment, never
   by an edit. (Paper logbook precedent: *"All times and entries on this page are
   certified correct."*)
6. **Never invent a limit.** Every number the app enforces — 95 %, 35 %, 30 %,
   100 km/h, 216 kg — is quoted from the Flight Manual with its section number
   shown next to it. If a manual revision changes a number, the app changes with
   it; nothing is hard-coded in a component.

## 1.5 Feature map

```
HayesX App
│
├── ① PREFLIGHT CHECKLIST                       ← the wedge
│   ├── Aircraft status banner (AIRWORTHY / GROUNDED)
│   ├── Guided sequence, 10 sections, ~60 items (FM 4.2 → 4.7)
│   │     A Preflight preparation      F BRS / parachute
│   │     B Airframe structure         G Power-up + HV connectors
│   │     C Propellers                 H System initialisation
│   │     D Motors                     I Propulsion check
│   │     E Battery system             J Boarding
│   ├── Inline safety interstitials (FM 4.4.3, 4.4.4)
│   ├── Battery gate — numeric entry, ≥ 95 % required (FM 4.7 / 2.5)
│   ├── NO-GO path → photo + defect record + aircraft grounded
│   ├── Sign & complete → timestamp + GPS + signature
│   ├── → Start flight (timer)  →  End flight  →  prefilled logbook entry
│   └── Preflight history, exportable
│
├── ② DIGITAL LOGBOOK
│   ├── Entry form (9 fields, most pre-filled — see §3.3)
│   ├── Certify + digitally sign  →  entry locked
│   ├── List, newest first, linked to its preflight record
│   ├── Search by date range                     ← explicitly required
│   ├── Totals: flights + total minutes for range, and to date
│   └── Export CSV / PDF
│
├── ③ MANUALS
│   ├── Flight Manual (FM-001 Rev A) — chaptered, searchable
│   ├── Maintenance Manual — chaptered, searchable, EN/中文
│   ├── Offline download with revision badge
│   ├── ⚠ EMERGENCY — 16 one-tap procedures from FM Ch. 3
│   ├── Revision notices requiring pilot acknowledgement (feeds FM 4.2)
│   └── Bookmarks
│
├── ④ MESSAGES
│   ├── Support thread with HayesX (attachments, defect photos)
│   ├── Safety & service bulletins (broadcast, read-receipt required)
│   └── Unread badge
│
└── ⑤ ACCOUNT
    ├── Pilot profile (default "Pilot" on logbook entries)
    ├── Aircraft registry — serial number, entered once
    ├── Signature — drawn once, reused
    ├── Units (metric / imperial), theme, notifications
    ├── Sync status + offline storage
    └── Legal: Part 103 statement, terms, privacy, support
```

## 1.6 Explicitly out of scope for v1.0

Named so nobody assumes them:

- **No telemetry or live link to the aircraft.** The app does not talk to the
  Flight Control System, PFD, or Flight Data Recorder. Flight time is a timer the
  pilot starts and stops. (See Q9 — FDR integration is the single biggest
  Phase 2 unlock.)
- **No in-flight use.** FM 4.1 restricts all pilot movement to inside the roll
  cage. v1.0 ships an explicit "ground reference only" disclaimer on the
  emergency procedures screen. See Q4.
- **No maintenance tracking.** Hours-to-500 h inspection, battery cycle counts,
  and life-limited part countdowns are designed for but not built in v1.0 —
  Phase 2, Epic H.
- **No fleet / dealer dashboard.** Phase 2.
- **No flight planning, weather, or airspace data.** FM 4.2 requires the pilot to
  verify weather and airspace; the app records *that they did*, it does not
  supply the data. Integrating an aviation weather or TFR feed is Phase 3 and
  carries its own liability.

## 1.7 Success measures

| Measure | Target |
|---|---|
| Preflights completed in-app vs. flights logged | > 95 % |
| Median time to complete a full preflight | < 6 min |
| Flights logged in-app vs. estimated actual flights | > 90 % |
| Preflights completed with zero network | works, 100 % |
| Defects raised through the no-go path | > 0 — proof pilots trust the gate |
| Bulletins acknowledged within 7 days | > 90 % |

The fifth one matters most. If nobody ever fails a checklist item, pilots are
tapping through and the product is worse than paper.
