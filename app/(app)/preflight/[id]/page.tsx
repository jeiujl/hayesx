"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Cite, Label, List, Pill, Row } from "@/components/ui";
import { CHECKLIST } from "@/lib/checklist";
import { db, readSession } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import {
  RuleError,
  createFlightDraft,
  endFlight,
  preflightValid,
  resultsFor,
  startFlight,
} from "@/lib/repo";

export default function PreflightRecord() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);

  const record = useLiveQuery(() => db.preflights.get(id), [id]);
  const results = useLiveQuery(() => resultsFor(id), [id]);
  const session = useLiveQuery(() => readSession(), []);

  if (!record) return <div className="py-10 text-center text-mut">Loading…</div>;

  const byId = new Map((results ?? []).map((r) => [r.itemId, r]));
  const valid = preflightValid(record);
  const flying = !!session?.flightStartedAt;

  async function begin() {
    try {
      await startFlight(id);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not start the flight.");
    }
  }

  async function finish() {
    const minutes = await endFlight();
    const s = await readSession();
    const flightId = await createFlightDraft(s.flightPreflightId, minutes);
    router.push(`/logbook/${flightId}`);
  }

  return (
    <div className="flex flex-col gap-3.5 rise">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">Preflight record</h1>
          <div className="mt-0.5 text-[12.5px] text-mut">{fmtDateTime(record.startedAt)}</div>
        </div>
        {record.status === "signed" ? (
          <Pill tone={valid ? "go" : "neutral"}>{valid ? "Valid" : "Expired"}</Pill>
        ) : record.status === "no_go" ? (
          <Pill tone="warn">No-go</Pill>
        ) : (
          <Pill tone="neutral">{record.status.replace("_", " ")}</Pill>
        )}
      </div>

      {error ? (
        <Alert tone="danger" title="Error">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      {record.status === "signed" ? (
        flying ? (
          <Button tone="warn" onClick={finish}>
            END FLIGHT
          </Button>
        ) : valid ? (
          <Button tone="go" onClick={begin}>
            START FLIGHT
          </Button>
        ) : (
          <Alert tone="caution" title="Expired">
            <div className="text-[14px]">
              This preflight was valid for {CHECKLIST.validityMinutes / 60} hours. Run a new one
              before flying.
            </div>
          </Alert>
        )
      ) : null}

      {record.signature ? (
        <Card>
          <Label>Certified by</Label>
          <div className="mt-1 text-[15px] font-semibold">{record.pilotName}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={record.signature}
            alt="Pilot signature"
            className="mt-1 h-[56px] w-full object-contain object-left"
          />
          <div className="mt-1 border-t border-line2 pt-2 font-mono text-[10.5px] leading-relaxed text-mut">
            <b className="font-semibold text-ink">{fmtDateTime(record.signedAt!)}</b>
            <br />
            {record.latitude !== null
              ? `${record.latitude.toFixed(4)}, ${record.longitude!.toFixed(4)} · ±${Math.round(
                  record.locationAccuracy ?? 0
                )} m`
              : "Location not recorded"}
            <br />
            S/N {record.aircraftSerial} · manual rev {record.manualRevision} · checklist v
            {record.checklistVersion} · app {record.appVersion}
            {record.batteryPercent !== null ? (
              <>
                <br />
                Battery at boarding <b className="font-semibold text-ink">{record.batteryPercent}%</b>
              </>
            ) : null}
            <br />
            Valid until <b className="font-semibold text-ink">{fmtDateTime(record.expiresAt!)}</b>
          </div>
        </Card>
      ) : null}

      <Label>Sections</Label>
      <List>
        {CHECKLIST.sections.map((s) => {
          const items = s.groups.flatMap((g) => g.items);
          const answered = items.filter((i) => byId.has(i.id));
          const failed = answered.filter((i) => byId.get(i.id)!.result === "no_go");
          return (
            <Row
              key={s.id}
              title={`${s.id} · ${s.title}`}
              sub={
                <Cite>
                  FM {s.fmSection} · {answered.length}/{items.length} answered
                </Cite>
              }
              right={
                failed.length > 0 ? (
                  <Pill tone="warn">{failed.length} no-go</Pill>
                ) : answered.length === items.length ? (
                  <Pill tone="go">Pass</Pill>
                ) : (
                  <Pill tone="neutral">—</Pill>
                )
              }
            />
          );
        })}
      </List>

      <Cite>
        Signed records are append-only. Corrections are filed as linked amendments, never as
        edits.
      </Cite>
    </div>
  );
}
