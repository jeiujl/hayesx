"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  LinkButton,
  Row,
  ScreenTitle,
  Status,
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

  const primary = grounded ? (
    <LinkButton href="/preflight/grounded" tone="warn">
      View Defect &amp; Return to Service
    </LinkButton>
  ) : session?.flightStartedAt ? (
    <Button tone="warn" onClick={finishFlight}>
      End Flight
    </Button>
  ) : valid && last ? (
    <LinkButton href={`/preflight/${last.id}`} tone="go">
      Start Flight
    </LinkButton>
  ) : (
    <Button tone="go" onClick={begin}>
      {resumable ? "Resume Preflight" : "Start Preflight"}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6 rise">
      <ScreenTitle title="Preflight" sub={`Flight Manual Ch. 4 · ${CHECKLIST.itemCount} items`} />

      {/* Aircraft card */}
      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="flex items-start gap-4 p-4">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-accent-bg text-accent">
            {/* Plan view: arms run to the rotor centres, so it reads as an
                octocopter rather than a looped glyph. */}
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="6.2" cy="6.2" r="4" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
              <circle cx="17.8" cy="6.2" r="4" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
              <circle cx="6.2" cy="17.8" r="4" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
              <circle cx="17.8" cy="17.8" r="4" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
              <rect x="9.6" y="8.8" width="4.8" height="6.4" rx="1.8" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[19px] font-semibold tracking-[-0.01em]">{aircraft.model}</div>
            <div className="mt-0.5 font-mono text-[13px] text-mut">
              {aircraft.serialNumber}
              {aircraft.tailId ? ` · ${aircraft.tailId}` : ""}
            </div>
            <div className="mt-2">
              {grounded ? <Status tone="warn">Grounded</Status> : <Status tone="go">Airworthy</Status>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line2">
          <div className="px-4 py-3">
            <div className="text-[12px] text-mut">Flights</div>
            <div className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">{totals.flights}</div>
          </div>
          <div className="border-l border-line2 px-4 py-3">
            <div className="text-[12px] text-mut">Total time</div>
            <div className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">
              {hhmm(totals.minutes)}
              <span className="ml-1 text-[13px] font-medium text-mut">h</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <Alert tone="danger" title="Cannot start">
          <div className="text-[15px]">{error}</div>
        </Alert>
      ) : null}

      {(pendingAck?.length ?? 0) > 0 ? (
        <Link href="/messages">
          <Alert tone="caution" title="Acknowledgement required" cite="Blocks preflight until acknowledged">
            <div className="text-[15px] leading-snug">
              {pendingAck?.[0]?.reference ? `${pendingAck[0].reference} · ` : ""}
              {pendingAck?.[0]?.title}
            </div>
          </Alert>
        </Link>
      ) : null}

      {valid && last && !grounded && !session?.flightStartedAt ? (
        <Alert tone="info" title="Preflight valid" cite={`Expires ${fmtDateTime(last.expiresAt!)}`}>
          <div className="text-[15px]">
            Signed {relative(last.signedAt!)} — all {CHECKLIST.itemCount} items passed.
          </div>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        {primary}
        {valid && last && !grounded && !session?.flightStartedAt ? (
          <Button tone="quiet" small onClick={begin}>
            Run a New Preflight
          </Button>
        ) : null}
        {grounded ? (
          <p className="px-4 text-[12.5px] leading-snug text-faint">
            A grounded aircraft cannot start a preflight or open a logbook entry. Maintenance
            Manual Ch. 16.
          </p>
        ) : null}
      </div>

      <Group label="Status">
        <Row
          href={last ? `/preflight/${last.id}` : "/preflight/history"}
          title="Last preflight"
          sub={
            last
              ? `${last.pilotName}${
                  last.latitude !== null
                    ? ` · ${last.latitude.toFixed(3)}, ${last.longitude!.toFixed(3)}`
                    : ""
                }`
              : "None yet"
          }
          value={last ? relative(last.signedAt!) : "—"}
        />
        <Row
          href="/manuals"
          title="Flight Manual"
          sub={`${CHECKLIST.documentNumber} · required by FM 4.2`}
          value={`Rev ${CHECKLIST.revision}`}
        />
      </Group>

      <Group label="Records">
        <Row href="/preflight/history" title="Preflight history" value={historyCount ?? 0} />
      </Group>
    </div>
  );
}
