"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Alert, Button, Cite, Group, Pill } from "@/components/ui";
import { CHECKLIST, gatePasses } from "@/lib/checklist";
import { db } from "@/lib/db";
import { locate } from "@/lib/geo";
import {
  RuleError,
  abandonPreflight,
  answerItem,
  raiseDefect,
  resultsFor,
  signPreflight,
} from "@/lib/repo";
import type { ChecklistItem, ChecklistSection } from "@/lib/types";

/* ── Progress: ten segments, one per section ─────────────────────────── */
function Progress({ index, done }: { index: number; done: boolean[] }) {
  const total = CHECKLIST.sections.length;
  const complete = done.filter(Boolean).length;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-mut">
          Section {CHECKLIST.sections[index]?.id ?? ""} of {CHECKLIST.sections[total - 1].id}
        </span>
        <span className="text-[13px] text-faint tabular-nums">
          {complete}/{total} complete
        </span>
      </div>
      <div className="flex gap-[3px]" aria-hidden="true">
        {CHECKLIST.sections.map((s, i) => (
          <i
            key={s.id}
            className={`h-1.5 flex-1 rounded-full ${
              i === index ? "bg-accent" : done[i] ? "bg-go" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Status glyph: empty ring, green check, red cross ────────────────── */
function Mark({ state }: { state: "pass" | "no_go" | undefined }) {
  if (state === "pass") {
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-go text-white" aria-label="Passed">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.2l2.3 2.3 4.7-5" />
        </svg>
      </span>
    );
  }
  if (state === "no_go") {
    return (
      <span className="grid h-6 w-6 place-items-center rounded-full bg-warn text-white" aria-label="No-go">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 3l6 6M9 3l-6 6" />
        </svg>
      </span>
    );
  }
  return <span className="block h-6 w-6 rounded-full border-2 border-line" aria-label="Not answered" />;
}

/* ── One checklist item, as a row in a grouped table ─────────────────── */
function ItemRow({
  item,
  state,
  locked,
  onAnswer,
}: {
  item: ChecklistItem;
  state: "pass" | "no_go" | undefined;
  locked: boolean;
  onAnswer: (r: "pass" | "no_go") => void;
}) {
  return (
    <div
      className={`flex gap-3 border-b border-line2 py-3.5 pr-4 pl-4 last:border-b-0 ${
        state === "no_go" ? "bg-warn-bg" : ""
      } ${locked ? "opacity-40" : ""}`}
    >
      <div className="pt-0.5">
        <Mark state={state} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11.5px] text-faint">{item.id}</span>
          {item.unresolved ? <Pill tone="caut">Unconfirmed</Pill> : null}
        </div>
        <div
          className={`mt-0.5 text-[16px] leading-snug ${
            state === "pass" ? "text-mut" : "text-ink"
          }`}
        >
          {item.text}
        </div>
        {item.ref ? (
          <div className="mt-1 text-[12.5px] leading-snug text-faint">{item.ref}</div>
        ) : null}
        {item.unresolved ? (
          <div className="mt-2 rounded-lg bg-caut-bg px-3 py-2 text-[12.5px] leading-snug text-ink">
            {item.unresolvedNote}
          </div>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={locked}
            onClick={() => onAnswer("pass")}
            className={`min-h-11 rounded-[10px] text-[15px] font-semibold transition-colors ${
              state === "pass" ? "bg-go text-white" : "bg-go-bg text-go"
            }`}
          >
            ✓ Pass
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => onAnswer("no_go")}
            className={`min-h-11 rounded-[10px] text-[15px] font-semibold transition-colors ${
              state === "no_go" ? "bg-warn text-white" : "bg-warn-bg text-warn"
            }`}
          >
            ✗ No-go
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Numeric gate (item J-05) ─────────────────────────────────────────── */
function NumericGate({
  item,
  onConfirm,
}: {
  item: ChecklistItem;
  onConfirm: (value: number, passes: boolean) => void;
}) {
  const [buf, setBuf] = useState("");
  const value = buf === "" ? null : parseInt(buf, 10);
  const passes = value !== null && value <= 100 && gatePasses(item, value);

  function key(k: string) {
    if (k === "c") setBuf("");
    else if (k === "x") setBuf((b) => b.slice(0, -1));
    else setBuf((b) => (b.length >= 3 ? b : b === "0" ? k : b + k));
  }

  const tone = value === null ? "text-faint" : passes ? "text-go" : "text-warn";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-card">
        <div className="px-4 pt-3.5">
          <span className="font-mono text-[11.5px] text-faint">{item.id}</span>
          <div className="text-[17px] font-semibold">{item.text}</div>
          <div className="mt-0.5 text-[12.5px] text-faint">{item.ref}</div>
        </div>
        <div className="px-4 pt-5 pb-4 text-center">
          <div className={`text-[64px] leading-none font-semibold tracking-[-0.04em] tabular-nums ${tone}`}>
            {buf === "" ? "—" : buf}
            <span className="ml-1 text-[28px] font-medium text-faint">{item.unit}</span>
          </div>
          <div className={`mt-3 text-[13px] font-semibold ${tone}`}>
            {value === null
              ? "Enter the reading from the PFD"
              : passes
                ? `Meets the ${item.min}${item.unit} minimum before takeoff`
                : item.failText}
          </div>
          {/* gauge: where the reading sits against the limit */}
          <div className="relative mx-auto mt-4 h-2 max-w-[260px] overflow-hidden rounded-full bg-line2">
            <i
              className={`absolute inset-y-0 left-0 rounded-full ${passes ? "bg-go" : value === null ? "bg-line" : "bg-warn"}`}
              style={{ width: `${Math.min(100, value ?? 0)}%` }}
            />
            <i className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${item.min ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "c", "0", "x"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k)}
            className={`min-h-[52px] rounded-xl text-[24px] font-medium transition-colors active:bg-line ${
              k === "c" || k === "x" ? "bg-line2 text-mut" : "bg-card text-ink"
            }`}
          >
            {k === "c" ? "C" : k === "x" ? "⌫" : k}
          </button>
        ))}
      </div>

      <Button
        tone={passes ? "go" : "warn"}
        disabled={value === null}
        onClick={() => value !== null && onConfirm(value, passes)}
      >
        {value === null ? "Enter a Value" : passes ? "Confirm — Pass" : "Confirm — No-go"}
      </Button>
    </div>
  );
}

/* ── The run ──────────────────────────────────────────────────────────── */
function Run() {
  const router = useRouter();
  const params = useSearchParams();
  const preflightId = params.get("id") ?? "";

  const [index, setIndex] = useState(0);
  const [ackWarnings, setAck] = useState<Set<string>>(new Set());
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preflight = useLiveQuery(() => db.preflights.get(preflightId), [preflightId]);
  const results = useLiveQuery(() => resultsFor(preflightId), [preflightId]);

  const answers = useMemo(() => {
    const m = new Map<string, "pass" | "no_go">();
    for (const r of results ?? []) m.set(r.itemId, r.result);
    return m;
  }, [results]);

  const section: ChecklistSection | undefined = CHECKLIST.sections[index];
  const sectionDone = CHECKLIST.sections.map((s) =>
    s.groups.every((g) => g.items.every((i) => answers.has(i.id)))
  );
  const thisSectionComplete = sectionDone[index] ?? false;
  const allComplete = sectionDone.every(Boolean);

  async function answer(item: ChecklistItem, r: "pass" | "no_go", numeric: number | null = null) {
    try {
      const defectId = await answerItem(preflightId, item.id, r, numeric);
      if (defectId) router.replace(`/preflight/nogo/${defectId}`);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not record that answer.");
    }
  }

  async function abnormal() {
    if (!preflight) return;
    const id = await raiseDefect({
      aircraftId: preflight.aircraftId,
      source: "abnormal_condition",
      itemId: null,
      itemText: "Abnormal condition during power-up",
      fmSection: section?.abnormalConditions?.fmSection ?? "4.4.4",
      note: "Power disconnected and operation discontinued.",
      raisedBy: preflight.pilotName,
    });
    router.replace(`/preflight/nogo/${id}`);
  }

  async function sign() {
    if (!signature || busy) return;
    setBusy(true);
    setError(null);
    // Location is best-effort and time-boxed — it must never block signing.
    const pos = await locate();
    try {
      await signPreflight({
        preflightId,
        signature,
        latitude: pos?.coords.latitude ?? null,
        longitude: pos?.coords.longitude ?? null,
        accuracy: pos?.coords.accuracy ?? null,
      });
      router.replace(`/preflight/${preflightId}`);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not sign the preflight.");
      setBusy(false);
    }
  }

  async function cancel() {
    await abandonPreflight(preflightId);
    router.replace("/preflight");
  }

  if (!preflight) {
    return <div className="py-10 text-center text-mut">Loading preflight…</div>;
  }
  if (!section) return null;

  const showWarning = !!section.warningBefore && !ackWarnings.has(section.id);

  /* Completion + signature */
  if (signing) {
    return (
      <div className="flex flex-col gap-5 rise">
        <div>
          <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-0.025em]">Preflight complete</h1>
          <div className="mt-1 text-[14px] text-mut">
            All {CHECKLIST.itemCount} items passed ·{" "}
            {Math.max(1, Math.round((Date.now() - preflight.startedAt) / 60_000))} min
          </div>
        </div>

        <Progress index={CHECKLIST.sections.length - 1} done={sectionDone} />

        <Group label="Certification">
          <div className="px-4 py-3.5 text-[15px] leading-relaxed">
            I certify that I have completed the preflight inspection for{" "}
            <b className="font-semibold">{preflight.aircraftSerial}</b> in the sequence set out in
            the Flight Manual, and that every item passed.
          </div>
        </Group>

        <SignaturePad value={signature} onChange={setSignature} />

        <Group label="Record">
          <div className="grid grid-cols-3 divide-x divide-line2 text-center">
            <div className="px-2 py-3">
              <div className="text-[11.5px] text-mut">Manual</div>
              <div className="mt-0.5 text-[15px] font-semibold">Rev {preflight.manualRevision}</div>
            </div>
            <div className="px-2 py-3">
              <div className="text-[11.5px] text-mut">Checklist</div>
              <div className="mt-0.5 text-[15px] font-semibold">v{preflight.checklistVersion}</div>
            </div>
            <div className="px-2 py-3">
              <div className="text-[11.5px] text-mut">Valid for</div>
              <div className="mt-0.5 text-[15px] font-semibold">{CHECKLIST.validityMinutes / 60} h</div>
            </div>
          </div>
        </Group>

        {error ? (
          <Alert tone="danger" title="Cannot sign">
            <div className="text-[15px]">{error}</div>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button tone="go" disabled={!signature || busy} onClick={sign}>
            {busy ? "Signing…" : "Sign & Complete"}
          </Button>
          <Button tone="quiet" small onClick={() => setSigning(false)}>
            Back to Checklist
          </Button>
        </div>
      </div>
    );
  }

  /* Full-screen warning interstitial */
  if (showWarning) {
    const w = section.warningBefore!;
    const danger = w.level === "danger";
    return (
      <div className="flex flex-col gap-5 rise">
        <Progress index={index} done={sectionDone} />

        <div className={`overflow-hidden rounded-2xl ${danger ? "bg-warn" : "bg-caut"} text-white`}>
          <div className="flex items-center gap-2.5 px-5 pt-5">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5L1.5 21h21L12 2.5zm0 5.2l6.6 11.6H5.4L12 7.7zm-1 4.3v4h2v-4h-2zm0 5v2h2v-2h-2z" />
            </svg>
            <h1 className="text-[22px] font-bold tracking-tight">{danger ? "Warning" : "Caution"}</h1>
            <span className="ml-auto font-mono text-[12px] opacity-80">FM {w.fmSection}</span>
          </div>
          <ul className="flex flex-col gap-3 px-5 pt-4 pb-5">
            {w.text.split("\n").map((line) => (
              <li key={line} className="text-[17px] leading-snug font-medium">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <Group label="Next">
          <div className="px-4 py-3.5">
            <div className="text-[16px] font-medium">
              Section {section.id} · {section.title}
            </div>
            <div className="mt-0.5 text-[13px] text-mut">
              {section.itemCount} items · FM {section.fmSection}
            </div>
          </div>
        </Group>

        <div className="flex flex-col gap-2">
          <Button tone={danger ? "warn" : "caut"} onClick={() => setAck(new Set([...ackWarnings, section.id]))}>
            I Understand — Continue
          </Button>
          <Button tone="quiet" small onClick={cancel}>
            Cancel Preflight
          </Button>
        </div>
      </div>
    );
  }

  const answered = section.groups.flatMap((g) => g.items).filter((i) => answers.has(i.id)).length;

  return (
    <div className="flex flex-col gap-5 rise">
      <Progress index={index} done={sectionDone} />

      <div>
        <h1 className="text-[30px] leading-[1.1] font-bold tracking-[-0.025em]">{section.title}</h1>
        <div className="mt-1 flex items-center gap-2 text-[14px] text-mut">
          <span>Section {section.id}</span>
          <span className="text-faint">·</span>
          <Cite>FM {section.fmSection}</Cite>
          <span className="ml-auto tabular-nums">
            {answered}/{section.itemCount}
          </span>
        </div>
      </div>

      {section.intro ? (
        <Alert tone="info">
          <div className="text-[14.5px] leading-snug">{section.intro}</div>
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" title="Error">
          <div className="text-[15px]">{error}</div>
        </Alert>
      ) : null}

      {section.groups.map((group) => {
        // A sequential group has to be answered top to bottom — the order is
        // the safety property (FM 4.4 power-up).
        const firstUnanswered = group.items.findIndex((i) => !answers.has(i.id));
        // Split the table around any numeric gate so every item keeps the
        // position the Flight Manual prints it in.
        const segments: ChecklistItem[][] = [[]];
        for (const it of group.items) {
          if (it.type === "numeric_gate") segments.push([it], []);
          else segments[segments.length - 1].push(it);
        }
        const label = group.title ? (
          <span className="flex items-center gap-2">
            {group.id} · {group.title}
            {group.sequential ? <Pill tone="caut">In order</Pill> : null}
          </span>
        ) : undefined;
        return (
          <div key={group.id} className="flex flex-col gap-3">
            {segments.map((seg, si) => {
              if (seg.length === 0) return null;
              if (seg[0].type === "numeric_gate") {
                const gate = seg[0];
                return (
                  <NumericGate
                    key={gate.id}
                    item={gate}
                    onConfirm={(v, passes) => answer(gate, passes ? "pass" : "no_go", v)}
                  />
                );
              }
              return (
                <Group
                  key={`${group.id}-${si}`}
                  label={si === 0 ? label : undefined}
                  footer={si === 0 ? group.orderNote : undefined}
                >
                  {seg.map((item) => {
                    const i = group.items.indexOf(item);
                    return (
                      <ItemRow
                        key={item.id}
                        item={item}
                        state={answers.get(item.id)}
                        locked={group.sequential && firstUnanswered !== -1 && i > firstUnanswered}
                        onAnswer={(r) => answer(item, r)}
                      />
                    );
                  })}
                </Group>
              );
            })}
          </div>
        );
      })}

      {section.abnormalConditions ? (
        <button
          type="button"
          onClick={abnormal}
          className="relative overflow-hidden rounded-xl bg-warn-bg py-3.5 pr-4 pl-5 text-left"
        >
          <i className="absolute inset-y-0 left-0 w-1 bg-warn" aria-hidden="true" />
          <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-warn">
            Abnormal condition · FM {section.abnormalConditions.fmSection}
          </div>
          <div className="mt-1 text-[14px] leading-snug text-ink">
            {section.abnormalConditions.conditions.join(" · ")} —{" "}
            {section.abnormalConditions.action}
          </div>
          <div className="mt-1.5 text-[14px] font-semibold text-warn">Report and Stop →</div>
        </button>
      ) : null}

      <div className="flex flex-col gap-2 pt-1">
        {index === CHECKLIST.sections.length - 1 ? (
          <Button tone="go" disabled={!allComplete} onClick={() => setSigning(true)}>
            {allComplete ? "Complete & Sign" : "Answer Every Item"}
          </Button>
        ) : (
          <Button disabled={!thisSectionComplete} onClick={() => setIndex(index + 1)}>
            Continue to Section {CHECKLIST.sections[index + 1].id}
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button tone="quiet" small disabled={index === 0} onClick={() => setIndex(index - 1)}>
            Previous
          </Button>
          <Button tone="quiet" small onClick={cancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RunPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-mut">Loading…</div>}>
      <Run />
    </Suspense>
  );
}
