"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Cite, Label, TextArea } from "@/components/ui";
import { db } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { addDefectNote, addDefectPhoto } from "@/lib/repo";

export default function NoGo() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const defect = useLiveQuery(() => db.defects.get(id), [id]);
  const photos = useLiveQuery(() => db.photos.where("defectId").equals(id).toArray(), [id]);
  const [note, setNote] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (defect && note === "") setNote(defect.note);
    // Only seed the field once, from the stored defect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defect?.id]);

  useEffect(() => {
    const made = (photos ?? []).map((p) => URL.createObjectURL(p.blob));
    setUrls(made);
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  async function addPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await addDefectPhoto(id, file);
    e.target.value = "";
  }

  async function confirm() {
    await addDefectNote(id, note.trim());
    router.replace("/preflight/grounded");
  }

  if (!defect) return <div className="py-10 text-center text-mut">Loading…</div>;

  return (
    <div className="flex flex-col gap-3.5 rise">
      <Alert tone="danger" cite={`FM ${defect.fmSection} · ${fmtDateTime(defect.raisedAt)}`}>
        <h1 className="font-display text-[26px] font-extrabold tracking-[0.18em] text-warn">
          NO-GO
        </h1>
        <div className="mt-2 text-[15px] font-semibold leading-snug">
          {defect.itemId ? `${defect.itemId} — ` : ""}
          {defect.itemText}
        </div>
      </Alert>

      <Card className="border-warn-line">
        <Label>Photograph the fault</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {urls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={u}
              src={u}
              alt="Defect photo"
              className="aspect-square w-full rounded-lg border border-line object-cover"
            />
          ))}
          <label className="grid aspect-square w-full cursor-pointer place-items-center rounded-lg border-[1.5px] border-dashed border-line bg-card text-2xl text-sky">
            +
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={addPhoto}
              className="sr-only"
            />
          </label>
        </div>
        <div className="mt-2">
          <Cite>The photo is what the maintainer actually needs. Add one if you can.</Cite>
        </div>
      </Card>

      <label className="block rounded-xl border border-line bg-card px-3 py-2">
        <Label>Note</Label>
        <TextArea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you find, and where?"
        />
      </label>

      <Alert tone="danger" cite="Maintenance Manual Ch. 16">
        <div className="text-[13.5px] leading-snug">
          The aircraft is grounded. No preflight can be started and no logbook entry can be
          opened until a signed Return to Service closes this defect.
        </div>
      </Alert>

      <Button tone="warn" onClick={confirm}>
        SAVE DEFECT
      </Button>
      <Button tone="quiet" small onClick={() => router.push("/messages")}>
        Send to HayesX support
      </Button>
    </div>
  );
}
