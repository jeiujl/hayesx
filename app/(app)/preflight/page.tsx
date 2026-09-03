"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Cite,
  Label,
  LinkButton,
  List,
  Pill,
  Row,
  ScreenTitle,
} from "@/components/ui";
import { CHECKLIST } from "@/lib/checklist";
import { db, readSession } from "@/lib/db";
import { fmtDateTime, hhmm, relative } from "@/lib/format";
import {
  RuleError,
  activeAircraft,
  createFlightDraft,
  endFlight,
  latestSignedPreflight,
  preflightValid,
  resumablePreflight,
  startPreflight,
  totalsOf,
} from "@/lib/repo";

export default function PreflightHome() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const aircraft = useLiveQuery(() => activeAircraft(), []);
  const session = useLiveQuery(() => readSession(), []);
  const last = useLiveQuery(
    async () => (aircraft ? latestSignedPreflight(aircraft.id) : undefined),
    [aircraft?.id]
  );
  const resumable = useLiveQuery(
    async () => (aircraft ? ((await resumablePreflight(aircraft.id)) ?? null) : null),
    [aircraft?.id]
  );
  const flights = useLiveQuery(() => db.flights.toArray(), []);
  const historyCount = useLiveQuery(() => db.preflights.count(), []);
  const pendingAck = useLiveQuery(
    () => db.messages.filter((m) => m.requiresAck && !m.acknowledgedAt).toArray(),
    []
  );

  const grounded = aircraft?.status === "grounded";
  const totals = totalsOf(flights ?? []);
  const valid = preflightValid(last);

  async function begin() {
    try {
      const id = await startPreflight();
      router.push(`/preflight/run?id=${id}`);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not start the preflight.");
    }
  }

  async function finishFlight() {
    const minutes = await endFlight();
    const s = await readSession();
    const flightId = await createFlightDraft(s.flightPreflightId, minutes);
    router.push(`/logbook/${flightId}`);
  }

  if (!aircraft) return null;

  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle
        title="Preflight"
        sub={`Flight Manual Ch. 4 · ${CHECKLIST.itemCount} items · ${CHECKLIST.sections.length} sections`}
      />

      <Card>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold">{aircraft.model}</div>
            <Cite>
              S/N {aircraft.serialNumber}
              {aircraft.tailId ? ` · ${aircraft.tailId}` : ""} · {aircraft.category}
            </Cite>
          </div>
          {grounded ? <Pill tone="warn">Grounded</Pill> : <Pill tone="go">Airworthy</Pill>}
        </div>
      </Card>

      {error ? (
        <Alert tone="danger" title="Cannot start">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      {(pendingAck?.length ?? 0) > 0 ? (
        <Link href="/messages">
          <Alert tone="caution" title="Acknowledgement required" cite="Blocks preflight until acknowledged">
            <div className="text-[14px] leading-snug">
              {pendingAck?.[0]?.reference ? `${pendingAck[0].reference} · ` : ""}
              {pendingAck?.[0]?.title}
            </div>
          </Alert>
        </Link>
      ) : null}

      {grounded ? (
        <>
          <LinkButton href="/preflight/grounded" tone="warn">
            VIEW DEFECT &amp; RETURN TO SERVICE
          </LinkButton>
          <Cite>
            A grounded aircraft cannot start a preflight or open a logbook entry.
            Maintenance Manual Ch. 16.
          </Cite>
        </>
      ) : session?.flightStartedAt ? (
        <Button tone="warn" onClick={finishFlight}>
          END FLIGHT
        </Button>
      ) : valid && last ? (
        <>
          <Alert tone="info" title="Preflight valid" cite={`Expires ${fmtDateTime(last.expiresAt!)}`}>
            <div className="text-[14px]">
              Signed {relative(last.signedAt!)} — all {CHECKLIST.itemCount} items passed.
            </div>
          </Alert>
          <LinkButton href={`/preflight/${last.id}`} tone="go">
            START FLIGHT
          </LinkButton>
          <Button tone="quiet" small onClick={begin}>
            Run a new preflight instead
          </Button>
        </>
      ) : (
        <Button tone="go" onClick={begin}>
          {resumable ? "RESUME PREFLIGHT" : "START PREFLIGHT"}
        </Button>
      )}

      <List>
        <Row
          href={last ? `/preflight/${last.id}` : "/preflight/history"}
          title={last ? `${relative(last.signedAt!)} · all ${CHECKLIST.itemCount} passed` : "No preflight yet"}
          sub={
            last ? (
              <Cite>
                Signed {last.pilotName}
                {last.latitude !== null
                  ? ` · ${last.latitude.toFixed(4)}, ${last.longitude!.toFixed(4)}`
                  : ""}
              </Cite>
            ) : (
              <Cite>Your first preflight will appear here</Cite>
            )
          }
        />
        <Row
          href="/manuals"
          title={`Flight Manual revision ${CHECKLIST.revision}`}
          sub={<Cite>{CHECKLIST.documentNumber} · required by FM 4.2</Cite>}
          right={<Pill tone="go">OK</Pill>}
        />
        <Row
          href="/preflight/history"
          title="Preflight history"
          sub={<Cite>{historyCount ?? 0} records</Cite>}
        />
      </List>

      <div className="flex items-baseline gap-3.5 px-1 text-[12.5px] text-mut">
        <Label>To date</Label>
        <span className="ml-auto">
          <b className="font-mono text-[15px] font-semibold text-ink tabular-nums">
            {totals.flights}
          </b>{" "}
          flights
        </span>
        <span>
          <b className="font-mono text-[15px] font-semibold text-ink tabular-nums">
            {hhmm(totals.minutes)}
          </b>{" "}
          hours
        </span>
      </div>
    </div>
  );
}
