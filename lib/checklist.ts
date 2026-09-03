/**
 * Loads and validates data/preflight-checklist.json into the runtime model.
 *
 * The app renders whatever this file contains. No checklist item text is
 * written into a component anywhere in the codebase — see docs/01 §1.4.
 */
import raw from "@/data/preflight-checklist.json";
import type {
  Checklist,
  ChecklistGroup,
  ChecklistItem,
  ChecklistSection,
} from "./types";

interface RawItem {
  id: string;
  type: string;
  text: string;
  fmSection?: string;
  ref?: string;
  unresolved?: boolean;
  unresolvedNote?: string;
  unit?: string;
  min?: number;
  comparison?: string;
  failText?: string;
}
interface RawGroup {
  id: string;
  title: string;
  fmSection: string;
  sequential?: boolean;
  sequentialNote?: string;
  orderNote?: string;
  items: RawItem[];
}
interface RawSection {
  id: string;
  title: string;
  fmSection: string;
  intro?: string;
  warningBefore?: { level: string; fmSection: string; text: string };
  items?: RawItem[];
  subsections?: RawGroup[];
  abnormalConditions?: {
    fmSection: string;
    conditions: string[];
    action: string;
  };
}

const VALID_TYPES = new Set(["check", "declaration", "numeric_gate", "sequence"]);

function toItem(r: RawItem, sectionId: string, groupId: string, fallbackFm: string): ChecklistItem {
  if (!VALID_TYPES.has(r.type)) {
    throw new Error(`Checklist item ${r.id}: unknown type "${r.type}"`);
  }
  if (r.type === "numeric_gate" && typeof r.min !== "number") {
    throw new Error(`Checklist item ${r.id}: numeric_gate needs a numeric "min"`);
  }
  return {
    id: r.id,
    type: r.type as ChecklistItem["type"],
    text: r.text,
    fmSection: r.fmSection ?? fallbackFm,
    ref: r.ref,
    unresolved: r.unresolved,
    unresolvedNote: r.unresolvedNote,
    unit: r.unit,
    min: r.min,
    comparison: r.comparison as "gte" | undefined,
    failText: r.failText,
    sectionId,
    groupId,
  };
}

function build(): Checklist {
  const src = raw as unknown as {
    schemaVersion: number;
    sourceDocument: { documentNumber: string; revision: string };
    rules: { validityMinutes: number };
    sections: RawSection[];
  };

  const seen = new Set<string>();
  const sections: ChecklistSection[] = src.sections.map((s) => {
    const groups: ChecklistGroup[] = (
      s.subsections
        ? s.subsections
        : [{ id: s.id, title: "", fmSection: s.fmSection, items: s.items ?? [] } as RawGroup]
    ).map((g) => ({
      id: g.id,
      title: g.title || null,
      fmSection: g.fmSection,
      sequential: g.sequential === true,
      orderNote: g.orderNote,
      items: g.items.map((i) => {
        if (seen.has(i.id)) throw new Error(`Duplicate checklist item id ${i.id}`);
        seen.add(i.id);
        return toItem(i, s.id, g.id, g.fmSection);
      }),
    }));

    return {
      id: s.id,
      title: s.title,
      fmSection: s.fmSection,
      intro: s.intro,
      warningBefore: s.warningBefore as ChecklistSection["warningBefore"],
      groups,
      abnormalConditions: s.abnormalConditions,
      itemCount: groups.reduce((n, g) => n + g.items.length, 0),
    };
  });

  const all = sections.flatMap((s) => s.groups.flatMap((g) => g.items));

  return {
    schemaVersion: src.schemaVersion,
    revision: src.sourceDocument.revision,
    documentNumber: src.sourceDocument.documentNumber,
    validityMinutes: src.rules.validityMinutes,
    sections,
    itemCount: all.length,
    unresolved: all.filter((i) => i.unresolved),
  };
}

export const CHECKLIST: Checklist = build();

export function allItems(): ChecklistItem[] {
  return CHECKLIST.sections.flatMap((s) => s.groups.flatMap((g) => g.items));
}

export function findItem(id: string): ChecklistItem | undefined {
  return allItems().find((i) => i.id === id);
}

/** A numeric_gate passes only if it meets its limit. */
export function gatePasses(item: ChecklistItem, value: number): boolean {
  if (item.min === undefined) return true;
  return item.comparison === "gte" ? value >= item.min : value === item.min;
}
