"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Alert, Button, Card, Cite, Field, Label, TextArea, TextInput } from "@/components/ui";
import { db } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { RuleError, activeAircraft, openDefect, returnToService, totalsOf } from "@/lib/repo";

export default function Grounded() {
  const router = useRouter();
  const aircraft = useLiveQuery(() => activeAircraft(), []);
  const defect = useLiveQuery(
    async () => (aircraft ? openDefect(aircraft.id) : undefined),
    [aircraft?.id]
  );
  const photos = useLiveQuery(
    async () => (defect ? db.photos.where("defectId").equals(defect.id).toArray() : []),
    [defect?.id]
  );
  const flights = useLiveQuery(() => db.flights.toArray(), []);
  const profile = useLiveQuery(() => db.profile.get("me"), []);

  const [urls, setUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    maintenanceItem: "",
    correctiveAction: "",
    replacedComponent: "",
    componentSerial: "",
    personnel: "",
    inspector: "",
    functionalCheck: false,
  });
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const made = (photos ?? []).map((p) => URL.createObjectURL(p.blob));
    setUrls(made);
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  useEffect(() => {
    if (profile && !form.personnel) setForm((f) => ({ ...f, personnel: profile.fullName }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.fullName]);

  async function release() {
    if (!aircraft || !defect || !signature) return;
    try {
      await returnToService({
        aircraftId: aircraft.id,
        defectId: defect.id,
        aircraftSerial: aircraft.serialNumber,
        flightMinutesAtService: totalsOf(flights ?? []).minutes,
        maintenanceItem: form.maintenanceItem.trim(),
        defectDescription: `${defect.itemText}${defect.note ? ` — ${defect.note}` : ""}`,
        correctiveAction: form.correctiveAction.trim(),
        replacedComponent: form.replacedComponent.trim(),
        componentSerial: form.componentSerial.trim(),
        functionalCheck: form.functionalCheck,
        personnel: form.personnel.trim(),
        inspector: form.inspector.trim(),
        signature,
      });
      router.replace("/preflight");
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not return the aircraft to service.");
    }
  }

  if (!aircraft) return null;

  if (!defect) {
    return (
      <div className="flex flex-col gap-3.5 rise">
        <Alert tone="info" title="No open defect">
          <div className="text-[14px]">
            {aircraft.model} {aircraft.serialNumber} is airworthy.
          </div>
        </Alert>
        <Button tone="quiet" onClick={() => router.push("/preflight")}>
          Back to preflight
        </Button>
      </div>
    );
  }

  const ready =
    !!signature &&
    form.maintenanceItem.trim() !== "" &&
    form.correctiveAction.trim() !== "" &&
    form.personnel.trim() !== "";

  return (
    <div className="flex flex-col gap-3.5 rise">
      <Alert tone="danger" title="Aircraft grounded" cite={`FM ${defect.fmSection} · ${fmtDateTime(defect.raisedAt)}`}>
        <div className="text-[15px] font-semibold leading-snug">
          {defect.itemId ? `${defect.itemId} — ` : ""}
          {defect.itemText}
        </div>
        {defect.note ? (
          <div className="mt-1.5 text-[13.5px] leading-snug text-mut">{defect.note}</div>
        ) : null}
      </Alert>

      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u}
              src={u}
              alt="Defect photo"
              className="aspect-square w-full rounded-lg border border-line object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="pt-1">
        <h2 className="font-display text-xl font-bold tracking-tight">Return to service</h2>
        <div className="mt-0.5 text-[12.5px] text-mut">
          Maintenance Manual Ch. 15 and 16 require every field below.
        </div>
      </div>

      <Field label="Maintenance item">
        <TextInput
          value={form.maintenanceItem}
          onChange={(e) => setForm({ ...form, maintenanceItem: e.target.value })}
          placeholder="Rotor 3 upper propeller replacement"
        />
      </Field>
      <label className="block rounded-xl border border-line bg-card px-3 py-2">
        <Label>Corrective action</Label>
        <TextArea
          rows={3}
          value={form.correctiveAction}
          onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
          placeholder="What was done"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Replaced component">
          <TextInput
            value={form.replacedComponent}
            onChange={(e) => setForm({ ...form, replacedComponent: e.target.value })}
            placeholder="Optional"
          />
        </Field>
        <Field label="Component S/N">
          <TextInput
            value={form.componentSerial}
            onChange={(e) => setForm({ ...form, componentSerial: e.target.value })}
            placeholder="Optional"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Maintenance personnel">
          <TextInput
            value={form.personnel}
            onChange={(e) => setForm({ ...form, personnel: e.target.value })}
          />
        </Field>
        <Field label="Inspector">
          <TextInput
            value={form.inspector}
            onChange={(e) => setForm({ ...form, inspector: e.target.value })}
            placeholder="If applicable"
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setForm({ ...form, functionalCheck: !form.functionalCheck })}
        className="flex items-start gap-3 rounded-xl border border-line bg-card px-3.5 py-3 text-left"
      >
        <span
          className={`grid h-[22px] w-[22px] flex-none place-items-center rounded-md text-[13px] ${
            form.functionalCheck ? "bg-go text-white" : "border border-line bg-card text-transparent"
          }`}
        >
          ✓
        </span>
        <span className="text-[13.5px] leading-snug">
          Functional check performed on the affected system.
          <br />
          <Cite>Maintenance Manual Ch. 16</Cite>
        </span>
      </button>

      <SignaturePad value={signature} onChange={setSignature} caption="Signature of releasing person" />

      {error ? (
        <Alert tone="danger" title="Cannot release">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      <Button tone="go" disabled={!ready} onClick={release}>
        Sign &amp; Return to Service
      </Button>
      <Card>
        <Cite>
          This is the only route from grounded back to airworthy. The record is kept against
          S/N {aircraft.serialNumber}.
        </Cite>
      </Card>
    </div>
  );
}
