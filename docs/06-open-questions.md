# 6. Open Questions

Ten decisions needed. **Q1 and Q2 block Sprint 2** — the checklist cannot be
built from content that is still in question.

---

### Q1 — BRS safety pin · ⛔ BLOCKER

`Preflight Checklist.docx`, section 4.3.5, contains an unanswered author query
left in the document:

> Safety pin removed — **Question for Ben — should the safety pin be removed
> before flight?**

The published Flight Manual lists "Safety pin removed" as a preflight item, but
the query means it is not settled. This is a pyrotechnic whole-aircraft
parachute. Getting it backwards means either an inert BRS in an emergency or an
inadvertent deployment on the ground.

**Needed:** HayesX engineering (Ben) confirms the intended pin state before
flight, and whether it is removed before or after power-up. Marked `unresolved`
in `data/preflight-checklist.json` (item `F-01`).
**Owner:** HayesX Engineering · **By:** before Sprint 2 planning

---

### Q2 — HV connector inspection ordering · ⛔ BLOCKER

Flight Manual 4.4 prints the connection sequence *before* 4.4.2 "Preflight
Inspection" of the QS12 connectors. Read literally, that has the pilot connecting
108 V DC and then inspecting the connectors for burn marks — which contradicts
4.4.3's "do not operate with damaged connectors".

The checklist JSON orders inspection first (`G1` before `G2`) with a note.

**Needed:** confirm the correct order, and whether the Flight Manual should be
corrected in Revision B.
**Owner:** HayesX Engineering · **By:** before Sprint 2 planning

---

### Q3 — Preflight validity window

How long does a signed preflight stay valid? The Flight Manual does not say. The
app needs an answer to decide when to force a re-check — after a pause on the
ground, between two flights the same morning, after shutdown.

**Proposed:** valid for 4 hours, and invalidated by any main-power shutdown.
Between flights within that window, the pilot re-confirms sections H, I and J
only (a short "between-flights" checklist).
**Owner:** HayesX Engineering + pilot SME · **By:** Sprint 3

---

### Q4 — Is the phone used in flight?

Flight Manual 4.1: *"All pilot operations and movements must be within the
Formula 1 inspired roll cage. In the interest of pilot safety, no arm movements
permitted outside the roll cage."*

This decides the emergency-procedures design. If the phone is ground-reference
only, v1.0 ships as specified with a disclaimer. If pilots will mount it and
reference it in flight, that is a different product: glanceable layout, no
scrolling, voice, screen-lock behaviour, mount certification — and it materially
raises the liability profile.

**Proposed for v1.0:** ground reference only, stated explicitly on-screen.
**Owner:** HayesX + counsel · **By:** Sprint 5

---

### Q5 — Legal standing of the digital logbook and signature

FAA Part 103 does not require a pilot logbook, so nothing here is regulatorily
mandated. But these records will be used — for insurance, for resale, for
incident investigation, for training credit.

**Needed:**
- Is an e-signature standard required (ESIGN/UETA compliance, audit trail), or is
  a drawn signature with a timestamp sufficient?
- Retention period, and what happens to records if a pilot deletes their account?
- Exact wording of the certification statement. The draft is *"I certify that the
  information in this logbook entry is complete and accurate."*
- Does HayesX want the ability to read pilot logbooks, or is the pilot the sole
  owner? (Feeds Q7.)

**Owner:** HayesX legal · **By:** Sprint 4

---

### Q6 — Aircraft branding mismatch

The Flight Manual is for the **HayesX-250** by HayesX Inc., Las Vegas. The
Maintenance Manual is titled **PowerHub SkyLo V1** throughout, with a different
propulsion description in places. Both appear to describe the same airframe —
four-axis, eight-rotor, dual high-voltage batteries, GBS 10 parachute.

Shipping a maintenance manual under a different product name inside the HayesX
app will confuse pilots and undermine trust in the documentation.

**Needed:** confirm they are the same aircraft, and decide whether to re-brand
the Maintenance Manual, ship it as-is with an explanatory note, or hold it out
of v1.0.
**Owner:** HayesX product · **By:** Sprint 5 (E-0 content conversion)

---

### Q7 — Data ownership and privacy

Flight records contain routes, timestamps and GPS coordinates — a detailed
movement history of an identifiable person.

**Needed:** who can see a pilot's flight logs? Options: pilot only (HayesX sees
aggregate defect data only) · pilot plus HayesX support on request · HayesX by
default. This shapes RLS policies, the privacy policy, and the analytics design.

**Recommended:** pilot-owned by default; defect and no-go rates shared with
HayesX in aggregate, because fleet-wide "which item fails most often" is a
genuine safety signal; individual flight routes shared only on explicit opt-in or
per-incident consent.
**Owner:** HayesX + counsel · **By:** Sprint 1 (it affects the schema)

---

### Q8 — Bilingual support

The Maintenance Manual is fully bilingual English / 中文. The Flight Manual is
English only.

**Needed:** is Chinese a launch requirement or a later addition? It roughly
doubles the content-conversion work in E-0 and adds i18n plumbing throughout.

**Recommended:** build with i18n scaffolding from Sprint 0 (cheap now, expensive
to retrofit), ship the UI in English for v1.0, and render the Maintenance Manual
bilingually since the source already is.
**Owner:** HayesX product · **By:** Sprint 0

---

### Q9 — Flight Data Recorder integration

Checklist item H-03 confirms the Flight Data Recorder is ON. If the FDR can
export flight time, battery state and faults, the logbook could be populated
automatically instead of from a phone timer — which is more accurate, and would
make the Phase 2 maintenance tracking trustworthy enough to rely on.

**Needed:** what the FDR records, what interface it exposes (SD card, USB, BLE,
Wi-Fi), and whether HayesX will document it.
**Owner:** HayesX Engineering · **By:** Phase 2 planning

---

### Q10 — Multi-device and shared-aircraft handling

Two pilots on one airframe, or one pilot on two phones. Whose preflight counts?
If pilot A grounds the aircraft offline and pilot B starts a preflight offline
before syncing, what happens on reconnect?

**Proposed:** the aircraft's grounded state is authoritative and always wins on
sync; a preflight started against a stale airworthy state is invalidated on
reconnect with a clear explanation. Signed records never conflict because they are
append-only.
**Owner:** engineering · **By:** Sprint 3
