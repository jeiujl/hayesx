"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import {
  Button,
  Card,
  Cite,
  Field,
  Label,
  List,
  Pill,
  Row,
  ScreenTitle,
  TextInput,
} from "@/components/ui";
import { CHECKLIST } from "@/lib/checklist";
import { APP_VERSION, db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { activeAircraft, saveProfile } from "@/lib/repo";

export default function Account() {
  const profile = useLiveQuery(async () => (await db.profile.get("me")) ?? null, []);
  const aircraft = useLiveQuery(() => activeAircraft(), []);
  const counts = useLiveQuery(async () => {
    const [flights, preflights, defects] = await Promise.all([
      db.flights.count(),
      db.preflights.count(),
      db.defects.count(),
    ]);
    return { flights, preflights, defects };
  }, []);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!profile || !aircraft) return null;

  async function exportAll() {
    const [flights, preflights, itemResults, defects, rts, amendments] = await Promise.all([
      db.flights.toArray(),
      db.preflights.toArray(),
      db.itemResults.toArray(),
      db.defects.toArray(),
      db.returnToService.toArray(),
      db.amendments.toArray(),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      checklistVersion: CHECKLIST.schemaVersion,
      manualRevision: CHECKLIST.revision,
      profile,
      aircraft: await db.aircraft.toArray(),
      flights,
      preflights,
      itemResults,
      defects,
      returnToService: rts,
      amendments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hayesx-${aircraft!.serialNumber}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveSignature(sig: string | null) {
    await saveProfile({ ...profile!, signature: sig });
  }

  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle title="Account" />

      <Card>
        <div className="flex items-center gap-3">
          <div className="grid h-[46px] w-[46px] flex-none place-items-center rounded-full bg-sky-bg font-display text-[17px] font-bold text-sky">
            {profile.fullName
              .split(/\s+/)
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "—"}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <TextInput
                autoFocus
                value={name || profile.fullName}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <div className="text-base font-semibold">{profile.fullName}</div>
            )}
            <Cite>
              {[profile.email, profile.phone].filter(Boolean).join(" · ") || "No contact details"}
            </Cite>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (editing && name.trim()) await saveProfile({ ...profile, fullName: name.trim() });
              setEditing(!editing);
            }}
            className="font-mono text-[10px] uppercase tracking-wider text-sky"
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>
      </Card>

      <Label>Aircraft</Label>
      <Card>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">{aircraft.model}</div>
            <Cite>
              S/N {aircraft.serialNumber}
              {aircraft.tailId ? ` · ${aircraft.tailId}` : ""}
              {aircraft.inServiceDate
                ? ` · in service ${fmtDate(new Date(aircraft.inServiceDate).getTime())}`
                : ""}
            </Cite>
          </div>
          {aircraft.status === "grounded" ? (
            <Pill tone="warn">Grounded</Pill>
          ) : (
            <Pill tone="go">Airworthy</Pill>
          )}
        </div>
        <div className="mt-2.5 border-t border-line2 pt-2">
          <Cite>
            The serial number is entered once at setup and copied onto every record. Editing it
            here would not change records already signed.
          </Cite>
        </div>
      </Card>

      <Label>Signature</Label>
      <SignaturePad value={profile.signature} onChange={saveSignature} />
      <Cite>
        Changing your signature never alters a record you have already signed — each one keeps its
        own copy.
      </Cite>

      <List>
        <Row title="Units" right={<Cite>Metric</Cite>} />
        <Row title="Theme" right={<Cite>Daylight</Cite>} />
        <Row title="Language" right={<Cite>English</Cite>} />
        <Row
          title="Notifications"
          sub={<Cite>Safety bulletins always on</Cite>}
          right={<Cite>On</Cite>}
        />
      </List>

      <List>
        <Row
          title="Data & sync"
          sub={
            <Cite>
              {counts?.flights ?? 0} flights · {counts?.preflights ?? 0} preflights ·{" "}
              {counts?.defects ?? 0} defects
            </Cite>
          }
          right={<Pill tone="caut">On device</Pill>}
        />
        <Row title="Export all data" onClick={exportAll} sub={<Cite>JSON</Cite>} />
      </List>

      <Card>
        <Label>FAA Part 103</Label>
        <p className="mt-1.5 text-[13px] leading-relaxed text-mut">
          The HayesX-250 is designed, built and operated in accordance with US FAA Part 103 and
          CCAR-91-R4 requirements for ultralight vehicles. No vehicle certification, airworthiness
          certificate, or certification as a conventional aircraft is required.
        </p>
        <div className="mt-2 border-t border-line2 pt-2">
          <Cite>
            Flight Manual 1.4 · app {APP_VERSION} · checklist v{CHECKLIST.schemaVersion} · manual
            rev {CHECKLIST.revision}
          </Cite>
        </div>
      </Card>

      <Button
        tone="quiet"
        small
        onClick={async () => {
          if (!confirm("Delete every record on this device? This cannot be undone.")) return;
          await Promise.all(db.tables.map((t) => t.clear()));
          location.href = "/onboarding";
        }}
      >
        Reset this device
      </Button>
    </div>
  );
}
