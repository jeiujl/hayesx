"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Alert, Button, Card, Cite, Field, Label, Pill, TextArea, TextInput } from "@/components/ui";
import { db } from "@/lib/db";
import {
  fmtDateTime,
  fromDateTimeInput,
  toDateInput,
  toTimeInput,
} from "@/lib/format";
import {
  RuleError,
  deleteFlightDraft,
  signFlight,
  updateFlightDraft,
} from "@/lib/repo";

export default function FlightEntry() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const flight = useLiveQuery(() => db.flights.get(id), [id]);
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const amendments = useLiveQuery(
    () => db.amendments.where("originalFlightId").equals(id).toArray(),
    [id]
  );

  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The stored profile signature is offered as the default.
  useEffect(() => {
    if (profile?.signature && !signature) setSignature(profile.signature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.signature]);

  if (!flight) return <div className="py-10 text-center text-mut">Loading…</div>;

  const locked = flight.signedAt !== null;
  const set = (patch: Parameters<typeof updateFlightDraft>[1]) =>
    updateFlightDraft(id, patch).catch((e) =>
      setError(e instanceof RuleError ? e.message : "Could not save.")
    );

  async function sign() {
    if (!signature) return;
    try {
      await signFlight(id, signature);
      setError(null);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not sign the entry.");
    }
  }

  async function discard() {
    await deleteFlightDraft(id);
    router.replace("/logbook");
  }

  return (
    <div className="flex flex-col gap-3 rise">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">
            {locked ? "Flight record" : "New flight"}
          </h1>
          <div className="mt-0.5 text-[12.5px] text-mut">
            {locked
              ? `Signed ${fmtDateTime(flight.signedAt!)}`
              : "Most of this is already filled in for you"}
          </div>
        </div>
        {locked ? <Pill tone="go">Signed</Pill> : <Pill tone="caut">Draft</Pill>}
      </div>

      {locked ? (
        <Alert tone="info" title="Locked">
          <div className="text-[13.5px] leading-snug">
            A certified entry cannot be edited. File an amendment and both stay visible.
          </div>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Field label="Aircraft" hint="registry">
          <TextInput value={flight.aircraftDescription} readOnly />
        </Field>
        <Field label="Serial no." hint="registry">
          <TextInput value={flight.aircraftSerial} readOnly />
        </Field>
      </div>
      <Field label="Category" hint="registry">
        <TextInput value={flight.aircraftCategory} readOnly />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Pilot" hint={locked ? undefined : "account"}>
          <TextInput
            value={flight.pilotName}
            readOnly={locked}
            onChange={(e) => set({ pilotName: e.target.value })}
          />
        </Field>
        <Field label="Flight time" hint={flight.preflightId ? "timer" : undefined}>
          <TextInput
            type="number"
            inputMode="numeric"
            min={1}
            value={flight.flightMinutes || ""}
            readOnly={locked}
            onChange={(e) => set({ flightMinutes: parseInt(e.target.value || "0", 10) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Date" hint={locked ? undefined : "device"}>
          <TextInput
            type="date"
            value={toDateInput(flight.flightDateTime)}
            readOnly={locked}
            onChange={(e) =>
              set({
                flightDateTime: fromDateTimeInput(
                  e.target.value,
                  toTimeInput(flight.flightDateTime)
                ),
              })
            }
          />
        </Field>
        <Field label="Time">
          <TextInput
            type="time"
            value={toTimeInput(flight.flightDateTime)}
            readOnly={locked}
            onChange={(e) =>
              set({
                flightDateTime: fromDateTimeInput(
                  toDateInput(flight.flightDateTime),
                  e.target.value
                ),
              })
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="From">
          <TextInput
            value={flight.routeFrom}
            readOnly={locked}
            placeholder="Jean Ridge"
            onChange={(e) => set({ routeFrom: e.target.value })}
          />
        </Field>
        <Field label="To">
          <TextInput
            value={flight.routeTo}
            readOnly={locked}
            placeholder="Sandy Valley"
            onChange={(e) => set({ routeTo: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Weather condition">
        <TextInput
          value={flight.weather}
          readOnly={locked}
          placeholder="CAVU, 6 kt SW"
          onChange={(e) => set({ weather: e.target.value })}
        />
      </Field>

      <label className="block rounded-xl border border-line bg-card px-3 py-2">
        <Label>Notes</Label>
        <TextArea
          rows={3}
          value={flight.notes}
          readOnly={locked}
          placeholder="About flight or machine…"
          onChange={(e) => set({ notes: e.target.value })}
        />
      </label>

      {flight.preflightId ? (
        <Link href={`/preflight/${flight.preflightId}`}>
          <Card className="border-sky-line bg-sky-bg">
            <Label>Linked preflight</Label>
            <div className="mt-0.5 text-[13.5px] font-medium">View the signed record →</div>
          </Card>
        </Link>
      ) : null}

      {!locked ? (
        <button
          type="button"
          onClick={() => set({ hardLanding: !flight.hardLanding })}
          className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left ${
            flight.hardLanding ? "border-warn-line bg-warn-bg" : "border-line bg-card"
          }`}
        >
          <span
            className={`grid h-[22px] w-[22px] flex-none place-items-center rounded-md text-[13px] ${
              flight.hardLanding ? "bg-warn text-white" : "border border-line bg-card text-transparent"
            }`}
          >
            ✓
          </span>
          <span className="text-[13.5px] leading-snug">
            Hard landing, capsize, blade strike, battery shock or parachute deployment
            <br />
            <Cite>FM 3.16 — signing will ground the aircraft for inspection</Cite>
          </span>
        </button>
      ) : flight.hardLanding ? (
        <Alert tone="danger" title="Hard landing reported" cite="FM 3.16">
          <div className="text-[13.5px]">
            The aircraft was grounded on this entry. Flights may resume only after inspection and
            release by authorised HayesX personnel.
          </div>
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" title="Cannot sign">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      {locked ? (
        <Card>
          <Label>Certified correct</Label>
          {flight.signature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flight.signature}
              alt="Pilot signature"
              className="mt-1 h-[56px] w-full object-contain object-left"
            />
          ) : null}
          <div className="mt-1 border-t border-line2 pt-2">
            <Cite>
              {flight.pilotName} · {fmtDateTime(flight.signedAt!)}
            </Cite>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-md bg-go text-[13px] text-white">
                ✓
              </span>
              <span className="text-[13.5px] leading-snug">
                I certify that the information in this logbook entry is complete and accurate.
              </span>
            </div>
          </Card>
          <SignaturePad value={signature} onChange={setSignature} />
          <Button tone="go" disabled={!signature} onClick={sign}>
            SIGN &amp; LOCK ENTRY
          </Button>
          <Button tone="quiet" small onClick={discard}>
            Discard draft
          </Button>
        </>
      )}

      {(amendments?.length ?? 0) > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Amendments</Label>
          {amendments!.map((a) => (
            <Card key={a.id} className="border-caut-line bg-caut-bg">
              <div className="text-[13.5px] font-medium">{a.reason}</div>
              <Cite>{fmtDateTime(a.signedAt)}</Cite>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
