"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Card, Cite, Label } from "@/components/ui";
import { PROCEDURES } from "@/lib/emergency";
import { activeAircraft, raiseDefect } from "@/lib/repo";

export default function ProcedureDetail() {
  const router = useRouter();
  const { section } = useParams<{ section: string }>();
  const aircraft = useLiveQuery(() => activeAircraft(), []);
  const p = PROCEDURES.find((x) => x.section === decodeURIComponent(section));

  if (!p) {
    return (
      <div className="py-10 text-center text-mut">
        Procedure not found.
        <div className="mt-4">
          <Button tone="quiet" small onClick={() => router.push("/manuals/emergency")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  async function ground() {
    if (!aircraft || aircraft.status === "grounded" || !p) return;
    const id = await raiseDefect({
      aircraftId: aircraft.id,
      source: "manual",
      itemId: null,
      itemText: `${p.section} ${p.title}`,
      fmSection: p.section,
      note: "Grounded from the emergency procedure. No further flight allowed.",
      raisedBy: "",
    });
    router.push(`/preflight/nogo/${id}`);
  }

  return (
    <div className="flex flex-col gap-3.5 rise">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-wide text-warn">
          FM {p.section}
        </div>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-warn">
          {p.title}
        </h1>
      </div>

      {p.indication ? (
        <Card>
          <Label>Indication</Label>
          <div className="mt-1 text-[14.5px] leading-snug">{p.indication}</div>
        </Card>
      ) : null}

      <ol className="flex flex-col gap-2">
        {p.steps.map((s, i) => (
          <li
            key={s}
            className="flex gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
          >
            <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-warn-bg font-mono text-[13px] font-bold text-warn">
              {i + 1}
            </span>
            <span className="pt-0.5 text-[16px] leading-snug font-medium">{s}</span>
          </li>
        ))}
      </ol>

      {p.warning ? (
        <Alert tone="danger" title="⚠ Warning">
          <div className="text-[14.5px] leading-snug">{p.warning}</div>
        </Alert>
      ) : null}

      {p.followUp ? (
        <Card className={p.noFurtherFlight ? "border-warn-line bg-warn-bg" : ""}>
          <Label>Follow-up</Label>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-[14px] leading-snug">
            {p.followUp.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {p.noFurtherFlight && aircraft?.status === "airworthy" ? (
        <Button tone="warn" onClick={ground}>
          GROUND THIS AIRCRAFT
        </Button>
      ) : null}

      <Button tone="quiet" small onClick={() => router.push("/manuals/emergency")}>
        All procedures
      </Button>

      <div className="px-2 text-center">
        <Cite>Ground reference only. Do not operate a device in flight. — FM 4.1</Cite>
      </div>
    </div>
  );
}
