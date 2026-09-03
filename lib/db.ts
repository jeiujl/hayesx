"use client";

import Dexie, { type EntityTable } from "dexie";
import type {
  Aircraft,
  Amendment,
  Defect,
  DefectPhoto,
  Flight,
  ItemResultRecord,
  Message,
  Preflight,
  Profile,
  ReturnToService,
  SessionState,
} from "./types";

class HayesXDB extends Dexie {
  profile!: EntityTable<Profile, "id">;
  aircraft!: EntityTable<Aircraft, "id">;
  preflights!: EntityTable<Preflight, "id">;
  itemResults!: EntityTable<ItemResultRecord, "id">;
  defects!: EntityTable<Defect, "id">;
  photos!: EntityTable<DefectPhoto, "id">;
  returnToService!: EntityTable<ReturnToService, "id">;
  flights!: EntityTable<Flight, "id">;
  amendments!: EntityTable<Amendment, "id">;
  messages!: EntityTable<Message, "id">;
  session!: EntityTable<SessionState, "id">;

  constructor() {
    super("hayesx");
    this.version(1).stores({
      profile: "id",
      aircraft: "id, serialNumber, status",
      preflights: "id, aircraftId, startedAt, status",
      itemResults: "id, preflightId, itemId",
      defects: "id, aircraftId, status, raisedAt",
      photos: "id, defectId",
      returnToService: "id, aircraftId, defectId",
      flights: "id, aircraftId, flightDateTime, signedAt",
      amendments: "id, originalFlightId",
      messages: "id, kind, receivedAt",
      session: "id",
    });
  }
}

export const db = new HayesXDB();

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const APP_VERSION = "1.0.0";

const DEFAULT_SESSION: SessionState = {
  id: "session",
  activePreflightId: null,
  flightStartedAt: null,
  flightPreflightId: null,
  acknowledgedRevision: null,
  acknowledgedRevisionAt: null,
};

/**
 * Read-only. Dexie live queries run inside a read transaction, so anything a
 * component subscribes to must never write — hence the default is returned
 * rather than persisted here.
 */
export async function readSession(): Promise<SessionState> {
  return (await db.session.get("session")) ?? DEFAULT_SESSION;
}

export async function patchSession(p: Partial<SessionState>) {
  const s = (await db.session.get("session")) ?? DEFAULT_SESSION;
  await db.session.put({ ...s, ...p });
}
