"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import ThemeControl from "@/components/ThemeControl";
import { Button, Group, Row, ScreenTitle, Status, TextInput } from "@/components/ui";
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

  const initials =
    profile.fullName
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "—";

  return (
    <div className="flex flex-col gap-6 rise">
      <ScreenTitle title="Account" />

      {/* Profile */}
      <div className="flex items-center gap-4 rounded-2xl bg-card p-4">
        <div className="grid h-14 w-14 flex-none place-items-center rounded-full bg-accent text-[20px] font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <TextInput autoFocus value={name || profile.fullName} onChange={(e) => setName(e.target.value)} />
          ) : (
            <div className="text-[19px] font-semibold tracking-[-0.01em]">{profile.fullName}</div>
          )}
          <div className="mt-0.5 truncate text-[13.5px] text-mut">
            {[profile.email, profile.phone].filter(Boolean).join(" · ") || "No contact details"}
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (editing && name.trim()) await saveProfile({ ...profile, fullName: name.trim() });
            setEditing(!editing);
          }}
          className="min-h-11 px-1 text-[16px] font-medium text-accent"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <Group
        label="Aircraft"
        footer="The serial number is entered once at setup and copied onto every record. Editing it would not change records already signed."
      >
        <Row
          title={aircraft.model}
          sub={
            <span className="font-mono">
              {aircraft.serialNumber}
              {aircraft.tailId ? ` · ${aircraft.tailId}` : ""}
            </span>
          }
          right={
            aircraft.status === "grounded" ? (
              <Status tone="warn">Grounded</Status>
            ) : (
              <Status tone="go">Airworthy</Status>
            )
          }
          chevron={false}
        />
        {aircraft.inServiceDate ? (
          <Row title="In service" value={fmtDate(new Date(aircraft.inServiceDate).getTime())} chevron={false} />
        ) : null}
        <Row title="Category" value="Part 103" chevron={false} />
      </Group>

      <section>
        <h2 className="group-label mb-1.5 px-4">Display</h2>
        <div className="rounded-xl bg-card p-3">
          <ThemeControl />
        </div>
        <p className="mt-1.5 px-4 text-[12.5px] leading-snug text-faint">
          Day for bright outdoor light. Night for low light. Auto follows your device.
        </p>
      </section>

      <section>
        <h2 className="group-label mb-1.5 px-4">Signature</h2>
        <SignaturePad value={profile.signature} onChange={saveSignature} />
        <p className="mt-1.5 px-4 text-[12.5px] leading-snug text-faint">
          Changing your signature never alters a record already signed — each keeps its own copy.
        </p>
      </section>

      <Group label="Preferences">
        <Row title="Units" value="Metric" chevron={false} />
        <Row title="Language" value="English" chevron={false} />
        <Row title="Notifications" sub="Safety bulletins are always on" value="On" chevron={false} />
      </Group>

      <Group label="Data">
        <Row
          title="Stored on this device"
          sub={`${counts?.flights ?? 0} flights · ${counts?.preflights ?? 0} preflights · ${counts?.defects ?? 0} defects`}
          chevron={false}
        />
        <Row title="Export all data" sub="JSON" onClick={exportAll} />
      </Group>

      <Group
        label="FAA Part 103"
        footer={`Flight Manual 1.4 · app ${APP_VERSION} · checklist v${CHECKLIST.schemaVersion} · manual rev ${CHECKLIST.revision}`}
      >
        <p className="px-4 py-3.5 text-[14px] leading-relaxed text-mut">
          The HayesX-250 is designed, built and operated in accordance with US FAA Part 103 and
          CCAR-91-R4 requirements for ultralight vehicles. No vehicle certification,
          airworthiness certificate, or certification as a conventional aircraft is required.
        </p>
      </Group>

      <Button
        tone="quiet"
        small
        className="!text-warn"
        onClick={async () => {
          if (!confirm("Delete every record on this device? This cannot be undone.")) return;
          await Promise.all(db.tables.map((t) => t.clear()));
          location.href = "/onboarding";
        }}
      >
        Reset This Device
      </Button>
    </div>
  );
}
