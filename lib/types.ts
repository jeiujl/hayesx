/** Domain types. Mirrors docs/03-data-model.md. */

export type ItemType = "check" | "declaration" | "numeric_gate" | "sequence";
export type ItemResult = "pass" | "no_go";

export interface ChecklistItem {
  id: string;
  type: ItemType;
  text: string;
  fmSection: string;
  ref?: string;
  unresolved?: boolean;
  unresolvedNote?: string;
  /** numeric_gate only */
  unit?: string;
  min?: number;
  comparison?: "gte";
  failText?: string;
  /** grouping, filled in by the loader */
  sectionId: string;
  groupId: string;
}

export interface ChecklistWarning {
  level: "warning" | "danger";
  fmSection: string;
  text: string;
}

export interface ChecklistGroup {
  id: string;
  title: string | null;
  fmSection: string;
  sequential: boolean;
  orderNote?: string;
  items: ChecklistItem[];
}

export interface AbnormalConditions {
  fmSection: string;
  conditions: string[];
  action: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  fmSection: string;
  intro?: string;
  warningBefore?: ChecklistWarning;
  groups: ChecklistGroup[];
  abnormalConditions?: AbnormalConditions;
  itemCount: number;
}

export interface Checklist {
  schemaVersion: number;
  revision: string;
  documentNumber: string;
  validityMinutes: number;
  sections: ChecklistSection[];
  itemCount: number;
  unresolved: ChecklistItem[];
}

/* ── Records ─────────────────────────────────────────────────────────── */

export interface Profile {
  id: "me";
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  signature: string | null; // data URL
  units: "metric" | "imperial";
  createdAt: number;
}

export type AircraftStatus = "airworthy" | "grounded";

export interface Aircraft {
  id: string;
  serialNumber: string;
  model: string;
  category: string;
  tailId: string;
  inServiceDate: string;
  status: AircraftStatus;
  groundedDefectId: string | null;
  createdAt: number;
}

export type PreflightStatus =
  | "in_progress"
  | "no_go"
  | "complete_unsigned"
  | "signed"
  | "expired";

export interface Preflight {
  id: string;
  aircraftId: string;
  aircraftSerial: string;
  pilotName: string;
  checklistVersion: number;
  manualRevision: string;
  status: PreflightStatus;
  startedAt: number;
  completedAt: number | null;
  signedAt: number | null;
  expiresAt: number | null;
  signature: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  batteryPercent: number | null;
  appVersion: string;
}

export interface ItemResultRecord {
  id: string;
  preflightId: string;
  itemId: string;
  itemText: string;
  fmSection: string;
  result: ItemResult;
  numericValue: number | null;
  answeredAt: number;
  sequenceIndex: number;
}

export type DefectSource =
  | "preflight"
  | "hard_landing"
  | "abnormal_condition"
  | "manual";

export interface Defect {
  id: string;
  aircraftId: string;
  source: DefectSource;
  itemId: string | null;
  itemText: string;
  fmSection: string;
  note: string;
  status: "open" | "closed";
  raisedAt: number;
  raisedBy: string;
  latitude: number | null;
  longitude: number | null;
  closedByRtsId: string | null;
}

export interface DefectPhoto {
  id: string;
  defectId: string;
  blob: Blob;
  takenAt: number;
}

/** Maintenance Manual Ch. 15 + 16 record the same fields. */
export interface ReturnToService {
  id: string;
  aircraftId: string;
  defectId: string;
  aircraftSerial: string;
  flightMinutesAtService: number;
  maintenanceItem: string;
  defectDescription: string;
  correctiveAction: string;
  replacedComponent: string;
  componentSerial: string;
  functionalCheck: boolean;
  personnel: string;
  inspector: string;
  signature: string | null;
  signedAt: number;
}

export interface Flight {
  id: string;
  aircraftId: string;
  preflightId: string | null;
  aircraftDescription: string;
  aircraftCategory: string;
  aircraftSerial: string;
  pilotName: string;
  flightDateTime: number;
  routeFrom: string;
  routeTo: string;
  flightMinutes: number;
  weather: string;
  notes: string;
  hardLanding: boolean;
  certified: boolean;
  signature: string | null;
  signedAt: number | null;
  createdAt: number;
}

export interface Amendment {
  id: string;
  originalFlightId: string;
  reason: string;
  changes: Partial<
    Pick<
      Flight,
      | "routeFrom"
      | "routeTo"
      | "flightMinutes"
      | "weather"
      | "notes"
      | "pilotName"
      | "flightDateTime"
    >
  >;
  signature: string | null;
  signedAt: number;
}

export interface Message {
  id: string;
  kind: "bulletin" | "revision" | "support";
  severity: "info" | "service" | "safety";
  title: string;
  body: string;
  reference: string | null;
  requiresAck: boolean;
  acknowledgedAt: number | null;
  receivedAt: number;
  read: boolean;
}

/** Ephemeral app state: the run in progress and the open flight timer. */
export interface SessionState {
  id: "session";
  activePreflightId: string | null;
  flightStartedAt: number | null;
  flightPreflightId: string | null;
  acknowledgedRevision: string | null;
  acknowledgedRevisionAt: number | null;
}
