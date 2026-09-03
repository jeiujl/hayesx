"use client";

/**
 * Repository layer. Every rule from docs/03-data-model.md §3.3 is enforced
 * here, so no screen can produce an invalid safety record:
 *
 *   1. Signed records are immutable.
 *   2. A grounded aircraft cannot open a flight.
 *   3. A preflight only signs when every required item passed.
 *   4. Any no-go grounds the aircraft and raises a defect.
 *   5. Un-grounding requires a signed Return to Service.
 *   6. Signatures are copied by value onto each record.
 *   7. Totals count signed flights only.
 */

import { CHECKLIST, allItems, gatePasses } from "./checklist";
import { APP_VERSION, db, readSession, patchSession, uid } from "./db";
import type {
  Aircraft,
  Amendment,
  Defect,
  Flight,
  ItemResult,
  ItemResultRecord,
  Preflight,
  Profile,
  ReturnToService,
} from "./types";

export class RuleError extends Error {}

/* ── Setup ───────────────────────────────────────────────────────────── */

export async function saveProfile(p: Omit<Profile, "id" | "createdAt">) {
  const existing = await db.profile.get("me");
  await db.profile.put({
    id: "me",
    createdAt: existing?.createdAt ?? Date.now(),
    ...p,
  });
}

export async function registerAircraft(
  a: Omit<Aircraft, "id" | "status" | "groundedDefectId" | "createdAt">
) {
  const id = uid();
  await db.aircraft.put({
    ...a,
    id,
    status: "airworthy",
    groundedDefectId: null,
    createdAt: Date.now(),
  });
  return id;
}

export async function activeAircraft(): Promise<Aircraft | undefined> {
  return (await db.aircraft.toCollection().first()) ?? undefined;
}

/* ── Preflight ───────────────────────────────────────────────────────── */

export async function startPreflight(): Promise<string> {
  const [aircraft, profile] = await Promise.all([activeAircraft(), db.profile.get("me")]);
  if (!aircraft) throw new RuleError("No aircraft registered.");
  if (aircraft.status === "grounded") {
    throw new RuleError(
      "This aircraft is grounded. File a signed Return to Service before flying again."
    );
  }

  // Resume an unfinished run rather than starting a second one.
  const open = await db.preflights
    .where("aircraftId")
    .equals(aircraft.id)
    .filter((p) => p.status === "in_progress")
    .first();
  if (open) return open.id;

  const id = uid();
  await db.preflights.put({
    id,
    aircraftId: aircraft.id,
    aircraftSerial: aircraft.serialNumber,
    pilotName: profile?.fullName ?? "",
    checklistVersion: CHECKLIST.schemaVersion,
    manualRevision: CHECKLIST.revision,
    status: "in_progress",
    startedAt: Date.now(),
    completedAt: null,
    signedAt: null,
    expiresAt: null,
    signature: null,
    latitude: null,
    longitude: null,
    locationAccuracy: null,
    batteryPercent: null,
    appVersion: APP_VERSION,
  });
  await patchSession({ activePreflightId: id });
  return id;
}

function assertMutable(p: Preflight) {
  if (p.signedAt !== null) throw new RuleError("This preflight is signed and cannot change.");
}

/** Rule 4: recording a no-go raises a defect and grounds the aircraft. */
export async function answerItem(
  preflightId: string,
  itemId: string,
  result: ItemResult,
  numericValue: number | null = null
) {
  const p = await db.preflights.get(preflightId);
  if (!p) throw new RuleError("Preflight not found.");
  assertMutable(p);

  const item = allItems().find((i) => i.id === itemId);
  if (!item) throw new RuleError(`Unknown checklist item ${itemId}.`);

  const prior = await db.itemResults.where("preflightId").equals(preflightId).toArray();
  const existing = prior.find((r) => r.itemId === itemId);

  const rec: ItemResultRecord = {
    id: existing?.id ?? uid(),
    preflightId,
    itemId,
    itemText: item.text,
    fmSection: item.fmSection,
    result,
    numericValue,
    answeredAt: Date.now(),
    sequenceIndex: existing?.sequenceIndex ?? prior.length,
  };
  await db.itemResults.put(rec);

  if (result === "no_go") {
    const defectId = await raiseDefect({
      aircraftId: p.aircraftId,
      source: "preflight",
      itemId: item.id,
      itemText:
        item.type === "numeric_gate" && numericValue !== null
          ? `${item.text} — ${numericValue}${item.unit ?? ""} (minimum ${item.min}${item.unit ?? ""})`
          : item.text,
      fmSection: item.fmSection,
      note: "",
      raisedBy: p.pilotName,
    });
    await db.preflights.update(preflightId, { status: "no_go" });
    // The run is over: a no-go cannot be resumed, so drop the session pointer.
    await patchSession({ activePreflightId: null });
    return defectId;
  }
  return null;
}

/** The run a pilot can actually resume: in progress, on this airframe. */
export async function resumablePreflight(aircraftId: string) {
  return db.preflights
    .where("aircraftId")
    .equals(aircraftId)
    .filter((p) => p.status === "in_progress")
    .first();
}

export async function resultsFor(preflightId: string) {
  return db.itemResults.where("preflightId").equals(preflightId).toArray();
}

/** Rule 3: sign only when every required item has passed. */
export async function signPreflight(opts: {
  preflightId: string;
  signature: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}) {
  const p = await db.preflights.get(opts.preflightId);
  if (!p) throw new RuleError("Preflight not found.");
  assertMutable(p);

  const results = await resultsFor(opts.preflightId);
  const byId = new Map(results.map((r) => [r.itemId, r]));
  const missing = allItems().filter((i) => !byId.has(i.id));
  if (missing.length > 0) {
    throw new RuleError(`${missing.length} item(s) unanswered — cannot sign.`);
  }
  const failed = results.filter((r) => r.result === "no_go");
  if (failed.length > 0) {
    throw new RuleError("A checklist item was marked NO-GO — cannot sign.");
  }

  const gate = allItems().find((i) => i.type === "numeric_gate");
  const battery = gate ? (byId.get(gate.id)?.numericValue ?? null) : null;

  const now = Date.now();
  await db.preflights.update(opts.preflightId, {
    status: "signed",
    completedAt: now,
    signedAt: now,
    expiresAt: now + CHECKLIST.validityMinutes * 60_000,
    signature: opts.signature, // rule 6: copied by value
    latitude: opts.latitude,
    longitude: opts.longitude,
    locationAccuracy: opts.accuracy,
    batteryPercent: battery,
  });
  await patchSession({ activePreflightId: null });
}

export async function abandonPreflight(id: string) {
  const p = await db.preflights.get(id);
  if (!p || p.signedAt !== null) return;
  await db.itemResults.where("preflightId").equals(id).delete();
  await db.preflights.delete(id);
  await patchSession({ activePreflightId: null });
}

export function preflightValid(p: Preflight | undefined | null): boolean {
  return !!p && p.status === "signed" && !!p.expiresAt && p.expiresAt > Date.now();
}

export async function latestSignedPreflight(aircraftId: string) {
  const all = await db.preflights.where("aircraftId").equals(aircraftId).toArray();
  return all
    .filter((p) => p.status === "signed")
    .sort((a, b) => (b.signedAt ?? 0) - (a.signedAt ?? 0))[0];
}

/* ── Defects & grounding ─────────────────────────────────────────────── */

export async function raiseDefect(
  d: Omit<Defect, "id" | "status" | "raisedAt" | "latitude" | "longitude" | "closedByRtsId">
): Promise<string> {
  const id = uid();
  await db.defects.put({
    ...d,
    id,
    status: "open",
    raisedAt: Date.now(),
    latitude: null,
    longitude: null,
    closedByRtsId: null,
  });
  await db.aircraft.update(d.aircraftId, {
    status: "grounded",
    groundedDefectId: id,
  });
  return id;
}

export async function addDefectNote(defectId: string, note: string) {
  await db.defects.update(defectId, { note });
}

export async function addDefectPhoto(defectId: string, blob: Blob) {
  await db.photos.put({ id: uid(), defectId, blob, takenAt: Date.now() });
}

export async function openDefect(aircraftId: string) {
  return db.defects
    .where("aircraftId")
    .equals(aircraftId)
    .filter((d) => d.status === "open")
    .first();
}

/** Rule 5: the only route from grounded back to airworthy. */
export async function returnToService(
  r: Omit<ReturnToService, "id" | "signedAt">
): Promise<string> {
  if (!r.signature) throw new RuleError("A Return to Service must be signed.");
  const id = uid();
  await db.returnToService.put({ ...r, id, signedAt: Date.now() });
  await db.defects.update(r.defectId, { status: "closed", closedByRtsId: id });

  const stillOpen = await openDefect(r.aircraftId);
  if (!stillOpen) {
    await db.aircraft.update(r.aircraftId, {
      status: "airworthy",
      groundedDefectId: null,
    });
  }
  return id;
}

/* ── Flights ─────────────────────────────────────────────────────────── */

export async function startFlight(preflightId: string) {
  const p = await db.preflights.get(preflightId);
  if (!preflightValid(p)) throw new RuleError("A valid signed preflight is required.");
  await patchSession({ flightStartedAt: Date.now(), flightPreflightId: preflightId });
}

export async function endFlight(): Promise<number> {
  const s = await readSession();
  if (!s.flightStartedAt) return 0;
  const minutes = Math.max(1, Math.round((Date.now() - s.flightStartedAt) / 60_000));
  await patchSession({ flightStartedAt: null });
  return minutes;
}

/** Rule 2: a grounded aircraft cannot open a flight. */
export async function createFlightDraft(preflightId: string | null, minutes: number) {
  const [aircraft, profile] = await Promise.all([activeAircraft(), db.profile.get("me")]);
  if (!aircraft) throw new RuleError("No aircraft registered.");
  if (aircraft.status === "grounded") {
    throw new RuleError("This aircraft is grounded — no new logbook entries.");
  }
  const id = uid();
  const draft: Flight = {
    id,
    aircraftId: aircraft.id,
    preflightId,
    aircraftDescription: aircraft.model,
    aircraftCategory: aircraft.category,
    aircraftSerial: aircraft.serialNumber,
    pilotName: profile?.fullName ?? "",
    flightDateTime: Date.now(),
    routeFrom: "",
    routeTo: "",
    flightMinutes: minutes,
    weather: "",
    notes: "",
    hardLanding: false,
    certified: false,
    signature: null,
    signedAt: null,
    createdAt: Date.now(),
  };
  await db.flights.put(draft);
  return id;
}

/** Rule 1: drafts are editable, signed entries are not. */
export async function updateFlightDraft(id: string, patch: Partial<Flight>) {
  const f = await db.flights.get(id);
  if (!f) throw new RuleError("Flight not found.");
  if (f.signedAt !== null) {
    throw new RuleError("This entry is signed. File an amendment instead.");
  }
  await db.flights.update(id, patch);
}

export async function signFlight(id: string, signature: string) {
  const f = await db.flights.get(id);
  if (!f) throw new RuleError("Flight not found.");
  if (f.signedAt !== null) throw new RuleError("Already signed.");
  if (!f.routeFrom.trim() || !f.routeTo.trim()) {
    throw new RuleError("Enter the flight route before signing.");
  }
  if (!Number.isFinite(f.flightMinutes) || f.flightMinutes <= 0) {
    throw new RuleError("Flight time must be at least one minute.");
  }
  await db.flights.update(id, {
    certified: true,
    signature,
    signedAt: Date.now(),
  });

  if (f.hardLanding) {
    await raiseDefect({
      aircraftId: f.aircraftId,
      source: "hard_landing",
      itemId: null,
      itemText: "Hard landing reported — post hard landing inspection required",
      fmSection: "3.16",
      note: "Grounded automatically on a hard landing report. Flights may resume only after inspection and release by authorised HayesX personnel.",
      raisedBy: f.pilotName,
    });
  }
}

export async function deleteFlightDraft(id: string) {
  const f = await db.flights.get(id);
  if (!f || f.signedAt !== null) return;
  await db.flights.delete(id);
}

export async function amendFlight(
  originalFlightId: string,
  reason: string,
  changes: Amendment["changes"],
  signature: string
) {
  const f = await db.flights.get(originalFlightId);
  if (!f) throw new RuleError("Flight not found.");
  if (f.signedAt === null) throw new RuleError("Unsigned entries are edited directly.");
  const id = uid();
  await db.amendments.put({
    id,
    originalFlightId,
    reason,
    changes,
    signature,
    signedAt: Date.now(),
  });
  return id;
}

/* ── Totals (rule 7: signed flights only) ────────────────────────────── */

export interface Totals {
  flights: number;
  minutes: number;
  longest: number;
  average: number;
}

export function totalsOf(flights: Flight[]): Totals {
  const signed = flights.filter((f) => f.signedAt !== null);
  const minutes = signed.reduce((n, f) => n + f.flightMinutes, 0);
  return {
    flights: signed.length,
    minutes,
    longest: signed.reduce((n, f) => Math.max(n, f.flightMinutes), 0),
    average: signed.length ? Math.round(minutes / signed.length) : 0,
  };
}
