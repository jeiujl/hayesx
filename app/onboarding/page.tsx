"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Alert, Button, Cite, Field, TextInput } from "@/components/ui";
import { CHECKLIST } from "@/lib/checklist";
import { db } from "@/lib/db";
import { registerAircraft, saveProfile } from "@/lib/repo";
import { seedMessages } from "@/lib/seed";

const STEPS = ["Pilot", "Aircraft", "Signature"] as const;

export default function Onboarding() {
  const router = useRouter();
  const profile = useLiveQuery(async () => (await db.profile.get("me")) ?? null, []);
  const aircraftCount = useLiveQuery(() => db.aircraft.count(), []);

  const [step, setStep] = useState(0);
  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergency] = useState("");
  const [serialNumber, setSerial] = useState("");
  const [tailId, setTail] = useState("");
  const [inServiceDate, setInService] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already set up — nothing to do here.
  useEffect(() => {
    if (profile && (aircraftCount ?? 0) > 0) router.replace("/preflight");
  }, [profile, aircraftCount, router]);

  async function finish() {
    setBusy(true);
    await saveProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      emergencyContact: emergencyContact.trim(),
      signature,
      units: "metric",
    });
    await registerAircraft({
      serialNumber: serialNumber.trim().toUpperCase(),
      model: "HayesX-250",
      category: "Ultralight — FAA Part 103",
      tailId: tailId.trim(),
      inServiceDate,
    });
    await seedMessages();
    router.replace("/preflight");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col gap-5 px-5 pt-8 pb-10">
      <div>
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-accent">
          Set up · step {step + 1} of 3
        </div>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
          {step === 0 ? "Who is flying?" : step === 1 ? "Which airframe?" : "Sign once"}
        </h1>
        <p className="mt-2 text-[14.5px] text-mut">
          {step === 0
            ? "Your name goes on every preflight and logbook entry as pilot in command."
            : step === 1
              ? "The serial number is entered once here and reused on every record — you never retype it."
              : "Draw your signature once. It is copied onto each record you certify, so changing it later never alters past entries."}
        </p>
      </div>

      <div className="flex gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>

      {step === 0 ? (
        <div className="flex flex-col gap-2.5">
          <Field label="Full name">
            <TextInput
              value={fullName}
              onChange={(e) => setName(e.target.value)}
              placeholder="J. Hayes"
              autoComplete="name"
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Phone">
            <TextInput
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 702 555 0148"
              autoComplete="tel"
            />
          </Field>
          <Field label="Emergency contact">
            <TextInput
              value={emergencyContact}
              onChange={(e) => setEmergency(e.target.value)}
              placeholder="Name and number"
            />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-2.5">
          <Field label="Model" hint="default">
            <TextInput value="HayesX-250" readOnly />
          </Field>
          <Field label="Category" hint="default">
            <TextInput value="Ultralight — FAA Part 103" readOnly />
          </Field>
          <Field label="Serial number" hint="entered once">
            <TextInput
              value={serialNumber}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="HX250-0047"
              autoCapitalize="characters"
            />
          </Field>
          <Field label="Tail / display ID">
            <TextInput
              value={tailId}
              onChange={(e) => setTail(e.target.value)}
              placeholder="N250HX"
              autoCapitalize="characters"
            />
          </Field>
          <Field label="In service since">
            <TextInput
              type="date"
              value={inServiceDate}
              onChange={(e) => setInService(e.target.value)}
            />
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3">
          <SignaturePad value={signature} onChange={setSignature} />
          <Alert tone="info" cite={`Flight Manual ${CHECKLIST.documentNumber} Rev ${CHECKLIST.revision}`}>
            <div className="text-[13.5px] leading-relaxed">
              The preflight checklist in this app is generated from {CHECKLIST.itemCount} items
              in Chapter 4 of the Flight Manual. Two items are still awaiting confirmation from
              HayesX engineering and are flagged where they appear.
            </div>
          </Alert>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Button
          onClick={() => (step === 2 ? finish() : setStep(step + 1))}
          disabled={
            busy ||
            (step === 0 && !fullName.trim()) ||
            (step === 1 && !serialNumber.trim()) ||
            (step === 2 && !signature)
          }
        >
          {step === 2 ? "Finish Setup" : "Continue"}
        </Button>
        {step > 0 ? (
          <Button tone="quiet" small onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <div className="text-center">
            <Cite>Everything is stored on this device and works offline.</Cite>
          </div>
        )}
      </div>
    </div>
  );
}
