"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Cite, Empty, List, Pill, Row, ScreenTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";

export default function History() {
  const records = useLiveQuery(
    async () => (await db.preflights.toArray()).sort((a, b) => b.startedAt - a.startedAt),
    []
  );

  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle title="Preflight history" sub={`${records?.length ?? 0} records`} />
      {records && records.length > 0 ? (
        <List>
          {records.map((r) => (
            <Row
              key={r.id}
              href={`/preflight/${r.id}`}
              title={fmtDateTime(r.startedAt)}
              sub={
                <Cite>
                  {r.pilotName} · rev {r.manualRevision}
                  {r.batteryPercent !== null ? ` · battery ${r.batteryPercent}%` : ""}
                </Cite>
              }
              right={
                r.status === "signed" ? (
                  <Pill tone="go">Signed</Pill>
                ) : r.status === "no_go" ? (
                  <Pill tone="warn">No-go</Pill>
                ) : (
                  <Pill tone="neutral">{r.status.replace("_", " ")}</Pill>
                )
              }
            />
          ))}
        </List>
      ) : (
        <Empty>No preflight records yet.</Empty>
      )}
    </div>
  );
}
