"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Alert, Button, Card, Cite, Label, Pill } from "@/components/ui";
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

/* ── Progress rail: A B C … J ─────────────────────────────────────────── */
function Rail({ index, done }: { index: number; done: boolean[] }) {
  return (
    <div className="flex gap-[3px]" aria-label={`Section ${index + 1} of ${CHECKLIST.sections.length}`}>
      {CHECKLIST.sections.map((s, i) => (
        <i
          key={s.id}
          className={`grid h-[22px] flex-1 place-items-center rounded font-mono text-[10px] font-semibold not-italic ${
            i === index
              ? "bg-sky text-white"
              : done[i]
                ? "bg-go-bg text-go"
                : "bg-line2 text-faint"
          }`}
        >
          {s.id}
        </i>
      ))}
    </div>
  );
}

/* ── A single pass / no-go item ───────────────────────────────────────── */
function ItemCard({
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
      className={`flex flex-col gap-2 rounded-xl border bg-card px-3 pt-2.5 pb-3 ${
        state === "pass"
          ? "border-go-line"
          : state === "no_go"
            ? "border-warn-line"
            : "border-line"
      } ${locked ? "opacity-45" : ""}`}
    >
      <div>
        <div className="font-mono text-[10px] tracking-[0.06em] text-faint">{item.id}</div>
        <div className="mt-0.5 text-[14.5px] font-medium leading-snug">{item.text}</div>
        {item.ref ? <div className="mt-1"><Cite>{item.ref}</Cite></div> : null}
        {item.unresolved ? (
          <div className="mt-2 rounded-lg border border-caut-line bg-caut-bg px-2.5 py-2">
            <Label>Unconfirmed</Label>
            <div className="mt-0.5 text-[12px] leading-snug text-ink">
              {item.unresolvedNote}
            </div>
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={locked}
          onClick={() => onAnswer("pass")}
          className={`min-h-11 rounded-lg border-[1.5px] font-display text-[13.5px] font-bold tracking-wider ${
            state === "pass"
              ? "border-go bg-go text-white"
              : "border-line bg-card text-mut"
          }`}
        >
          ✓ PASS
        </button>
        <button
          type="button"
          disabled={locked}
          onClick={() => onAnswer("no_go")}
          className={`min-h-11 rounded-lg border-[1.5px] font-display text-[13.5px] font-bold tracking-wider ${
            state === "no_go"
              ? "border-warn bg-warn text-white"
              : "border-line bg-card text-mut"
          }`}
        >
          ✗ NO-GO
        </button>
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

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="font-mono text-[10px] tracking-[0.06em] text-faint">{item.id}</div>
        <div className="mt-0.5 font-display text-xl font-bold tracking-tight">{item.text}</div>
        <Cite>{item.ref}</Cite>
      </div>

      <div
        className={`rounded-xl border-[1.5px] bg-card px-4 py-4 text-center ${
          value === null ? "border-line" : passes ? "border-go-line" : "border-warn-line"
        }`}
      >
        <div
          className={`font-mono text-[60px] font-semibold leading-none tracking-tighter tabular-nums ${
            value === null ? "text-faint" : passes ? "text-go" : "text-warn"
          }`}
        >
          {buf === "" ? "—" : buf}
          <span className="ml-1 text-[26px] text-faint">{item.unit}</span>
        </div>
        <div
          className={`mt-2 font-mono text-[10.5px] font-semibold tracking-wide ${
            value === null ? "text-faint" : passes ? "text-go" : "text-warn"
          }`}
        >
          {value === null
            ? `ENTER THE PFD READING`
            : passes
              ? `MEETS THE ${item.min}${item.unit} MINIMUM BEFORE TAKEOFF`
              : (item.failText ?? "").toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "c", "0", "x"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => key(k)}
            className="min-h-12 rounded-lg border border-line bg-card font-mono text-[19px]"
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
        {value === null ? "ENTER A VALUE" : passes ? "CONFIRM — PASS" : "CONFIRM — NO-GO"}
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
      <div className="flex flex-col gap-3.5 rise">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight">Preflight complete</h1>
          <div className="mt-0.5 text-[12.5px] text-mut">
            All {CHECKLIST.itemCount} items passed ·{" "}
            {Math.max(1, Math.round((Date.now() - preflight.startedAt) / 60_000))} min
          </div>
        </div>

        <Rail index={CHECKLIST.sections.length - 1} done={sectionDone} />

        <Card>
          <div className="text-[14px] leading-relaxed">
            I certify that I have completed the preflight inspection for{" "}
            <b>{preflight.aircraftSerial}</b> in the sequence set out in the Flight Manual, and
            that every item passed.
          </div>
        </Card>

        <SignaturePad value={signature} onChange={setSignature} />

        <div className="rounded-xl bg-sky-bg px-3 py-2.5 font-mono text-[10.5px] leading-relaxed text-mut">
          Manual rev <b className="font-semibold text-ink">{preflight.manualRevision}</b> · checklist
          v{preflight.checklistVersion} · app {preflight.appVersion}
          <br />
          Valid for {CHECKLIST.validityMinutes / 60} h once signed
        </div>

        {error ? (
          <Alert tone="danger" title="Cannot sign">
            <div className="text-[14px]">{error}</div>
          </Alert>
        ) : null}

        <Button tone="go" disabled={!signature || busy} onClick={sign}>
          {busy ? "SIGNING…" : "SIGN & COMPLETE"}
        </Button>
        <Button tone="quiet" small onClick={() => setSigning(false)}>
          Back to the checklist
        </Button>
      </div>
    );
  }

  /* Full-screen warning interstitial */
  if (showWarning) {
    const w = section.warningBefore!;
    return (
      <div className="flex flex-col gap-3.5 rise">
        <Rail index={index} done={sectionDone} />
        <Alert
          tone={w.level === "danger" ? "danger" : "caution"}
          title={w.level === "danger" ? "⚠ Warning" : "⚠ Caution"}
          cite={`FM ${w.fmSection}`}
        >
          <ul className="flex list-disc flex-col gap-2 pl-4 text-[14.5px] leading-snug">
            {w.text.split("\n").map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Alert>
        <Card>
          <Label>Next</Label>
          <div className="mt-0.5 text-[15px] font-medium">
            Section {section.id} · {section.title}
          </div>
          <Cite>
            {section.itemCount} items · FM {section.fmSection}
          </Cite>
        </Card>
        <Button
          tone={w.level === "danger" ? "warn" : "sky"}
          onClick={() => setAck(new Set([...ackWarnings, section.id]))}
        >
          I UNDERSTAND — CONTINUE
        </Button>
        <Button tone="quiet" small onClick={cancel}>
          Cancel preflight
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 rise">
      <Rail index={index} done={sectionDone} />

      <div>
        <h1 className="font-display text-xl font-bold tracking-tight">
          Section {section.id} · {section.title}
        </h1>
        <div className="mt-0.5 text-[12.5px] text-mut">
          <Cite>FM {section.fmSection}</Cite> · answer every item to continue
        </div>
      </div>

      {section.intro ? (
        <Card className="bg-sky-bg border-sky-line">
          <div className="text-[13.5px] leading-snug">{section.intro}</div>
        </Card>
      ) : null}

      {error ? (
        <Alert tone="danger" title="Error">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      {section.groups.map((group) => {
        // A sequential group has to be answered top to bottom — the order is
        // the safety property (FM 4.4 power-up).
        const firstUnanswered = group.items.findIndex((i) => !answers.has(i.id));
        return (
          <div key={group.id} className="flex flex-col gap-2.5">
            {group.title ? (
              <div className="flex items-center gap-2 pt-1">
                <Label>
                  {group.id} · {group.title}
                </Label>
                {group.sequential ? <Pill tone="caut">In order</Pill> : null}
              </div>
            ) : null}
            {group.orderNote ? (
              <div className="rounded-lg border border-caut-line bg-caut-bg px-2.5 py-2 text-[12px] leading-snug">
                {group.orderNote}
              </div>
            ) : null}
            {group.items.map((item, i) =>
              item.type === "numeric_gate" ? (
                <NumericGate
                  key={item.id}
                  item={item}
                  onConfirm={(v, passes) => answer(item, passes ? "pass" : "no_go", v)}
                />
              ) : (
                <ItemCard
                  key={item.id}
                  item={item}
                  state={answers.get(item.id)}
                  locked={
                    group.sequential && firstUnanswered !== -1 && i > firstUnanswered
                  }
                  onAnswer={(r) => answer(item, r)}
                />
              )
            )}
          </div>
        );
      })}

      {section.abnormalConditions ? (
        <button
          type="button"
          onClick={abnormal}
          className="rounded-xl border border-warn-line bg-warn-bg px-3 py-2.5 text-left"
        >
          <Label>Abnormal condition · FM {section.abnormalConditions.fmSection}</Label>
          <div className="mt-1 text-[13px] leading-snug text-ink">
            {section.abnormalConditions.conditions.join(" · ")} —{" "}
            {section.abnormalConditions.action}
          </div>
          <div className="mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-warn">
            Report and stop →
          </div>
        </button>
      ) : null}

      <div className="flex items-center justify-between px-1">
        <Cite>
          {section.groups.flatMap((g) => g.items).filter((i) => answers.has(i.id)).length} of{" "}
          {section.itemCount} answered
        </Cite>
        <Cite>
          Section {index + 1} / {CHECKLIST.sections.length}
        </Cite>
      </div>

      {index === CHECKLIST.sections.length - 1 ? (
        <Button tone="go" disabled={!allComplete} onClick={() => setSigning(true)}>
          {allComplete ? "COMPLETE & SIGN" : "ANSWER EVERY ITEM"}
        </Button>
      ) : (
        <Button disabled={!thisSectionComplete} onClick={() => setIndex(index + 1)}>
          CONTINUE TO SECTION {CHECKLIST.sections[index + 1].id}
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button tone="quiet" small disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Previous
        </Button>
        <Button tone="quiet" small onClick={cancel}>
          Cancel
        </Button>
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
