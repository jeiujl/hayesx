"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, Button, Cite, Empty, Label, ScreenTitle, TextInput } from "@/components/ui";
import { db } from "@/lib/db";
import { fmtMonth, hhmm, toDateInput } from "@/lib/format";
import { RuleError, activeAircraft, createFlightDraft, totalsOf } from "@/lib/repo";
import type { Flight } from "@/lib/types";

type RangeKey = "month" | "30" | "year" | "all" | "custom";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "30", label: "Last 30 days" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom…" },
];

function rangeBounds(key: RangeKey, from: string, to: string): [number, number] {
  const now = new Date();
  switch (key) {
    case "month":
      return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), Infinity];
    case "30":
      return [Date.now() - 30 * 86_400_000, Infinity];
    case "year":
      return [new Date(now.getFullYear(), 0, 1).getTime(), Infinity];
    case "custom": {
      const lo = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
      const hi = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
      return [lo, hi];
    }
    default:
      return [-Infinity, Infinity];
  }
}

export default function Logbook() {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("year");
  const [from, setFrom] = useState(toDateInput(Date.now() - 30 * 86_400_000));
  const [to, setTo] = useState(toDateInput(Date.now()));
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const aircraft = useLiveQuery(() => activeAircraft(), []);
  const all = useLiveQuery(() => db.flights.toArray(), []);

  const [lo, hi] = rangeBounds(range, from, to);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (all ?? [])
      .filter((f) => f.flightDateTime >= lo && f.flightDateTime <= hi)
      .filter(
        (f) =>
          term === "" ||
          `${f.routeFrom} ${f.routeTo} ${f.weather} ${f.notes} ${f.pilotName}`
            .toLowerCase()
            .includes(term)
      )
      .sort((a, b) => b.flightDateTime - a.flightDateTime);
  }, [all, lo, hi, q]);

  const totals = totalsOf(filtered);
  const lifetime = totalsOf(all ?? []);

  const grouped = useMemo(() => {
    const out: Array<[string, Flight[]]> = [];
    for (const f of filtered) {
      const key = fmtMonth(f.flightDateTime);
      const last = out[out.length - 1];
      if (last && last[0] === key) last[1].push(f);
      else out.push([key, [f]]);
    }
    return out;
  }, [filtered]);

  async function newEntry() {
    try {
      const id = await createFlightDraft(null, 0);
      router.push(`/logbook/${id}`);
    } catch (e) {
      setError(e instanceof RuleError ? e.message : "Could not create the entry.");
    }
  }

  return (
    <div className="flex flex-col gap-3.5 rise">
      <ScreenTitle title="Logbook" sub={aircraft ? `S/N ${aircraft.serialNumber}` : undefined} />

      {/* Totals — the paper logbook's page-totals block */}
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="grid grid-cols-2 px-2 pt-4 pb-3.5 text-center">
          <div>
            <div className="font-mono text-[32px] font-semibold leading-none tracking-tighter tabular-nums">
              {totals.flights}
            </div>
            <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-faint">
              Flights
            </div>
          </div>
          <div className="border-l border-line2">
            <div className="font-mono text-[32px] font-semibold leading-none tracking-tighter tabular-nums">
              {totals.minutes.toLocaleString()}
            </div>
            <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-faint">
              Minutes · {hhmm(totals.minutes)}
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-dashed border-line px-3.5 py-2 font-mono text-[11.5px] text-mut">
          <span>
            Longest {totals.longest} · avg {totals.average}
          </span>
          <span>
            To date {lifetime.flights} / {lifetime.minutes.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`rounded-full px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest ${
              range === r.key ? "bg-sky text-white" : "bg-line2 text-mut"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="block rounded-xl border border-line bg-card px-3 py-2">
            <Label>From</Label>
            <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="block rounded-xl border border-line bg-card px-3 py-2">
            <Label>To</Label>
            <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      ) : null}

      <label className="block rounded-xl border border-line bg-card px-3 py-2">
        <Label>Search</Label>
        <TextInput
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Route, weather or notes…"
        />
      </label>

      {error ? (
        <Alert tone="danger" title="Cannot add an entry">
          <div className="text-[14px]">{error}</div>
        </Alert>
      ) : null}

      {grouped.length === 0 ? (
        <Empty>
          {(all?.length ?? 0) === 0
            ? "No flights logged yet. Complete a preflight, fly, then log it here."
            : "No flights in this range."}
        </Empty>
      ) : (
        grouped.map(([month, entries]) => (
          <div key={month} className="flex flex-col gap-2">
            <div className="px-1 pt-1 text-[10.5px] font-bold uppercase tracking-[0.13em] text-faint">
              {month}
            </div>
            {entries.map((f) => {
              const d = new Date(f.flightDateTime);
              return (
                <Link
                  key={f.id}
                  href={`/logbook/${f.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-2.5"
                >
                  <div className="w-11 flex-none text-center font-mono text-[11px] leading-tight text-faint">
                    <b className="block text-[17px] font-semibold text-ink">
                      {String(d.getDate()).padStart(2, "0")}
                    </b>
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">
                      {f.routeFrom || "—"} → {f.routeTo || "—"}
                    </div>
                    <Cite>
                      {f.weather || "No weather noted"} · {f.pilotName}
                    </Cite>
                  </div>
                  <div className="flex-none text-right">
                    <div className="font-mono text-[13px] font-semibold tabular-nums">
                      {f.flightMinutes}′
                    </div>
                    <div
                      className={`font-mono text-[10.5px] ${f.signedAt ? "text-go" : "text-caut"}`}
                    >
                      {f.signedAt ? "✓" : "draft"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))
      )}

      <Button small onClick={newEntry}>
        NEW ENTRY
      </Button>
    </div>
  );
}
