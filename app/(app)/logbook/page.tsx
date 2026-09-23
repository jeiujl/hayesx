"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, Empty, Group, Row, ScreenTitle, Segmented, TextInput } from "@/components/ui";
import { db } from "@/lib/db";
import { fmtMonth, hhmm, toDateInput } from "@/lib/format";
import { RuleError, activeAircraft, createFlightDraft, totalsOf } from "@/lib/repo";
import type { Flight } from "@/lib/types";

type RangeKey = "month" | "30" | "year" | "all" | "custom";

const RANGES: { value: RangeKey; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "30", label: "30 days" },
  { value: "year", label: "Year" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
];

const RANGE_NAME: Record<RangeKey, string> = {
  month: "This month",
  "30": "Last 30 days",
  year: "This year",
  all: "All time",
  custom: "Custom range",
};

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
    <div className="flex flex-col gap-5 rise">
      <ScreenTitle
        title="Logbook"
        sub={aircraft ? `${aircraft.model} · ${aircraft.serialNumber}` : undefined}
        action={
          <button
            type="button"
            onClick={newEntry}
            aria-label="New entry"
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white active:opacity-80"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M8 2.5v11M2.5 8h11" />
            </svg>
          </button>
        }
      />

      {/* Search, native style */}
      <label className="flex items-center gap-2 rounded-[10px] bg-line2 px-3">
        <svg viewBox="0 0 16 16" className="h-4 w-4 flex-none text-faint" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" strokeLinecap="round" />
        </svg>
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search route, weather, notes"
          className="min-h-9 w-full bg-transparent text-[16px] outline-none placeholder:text-faint"
        />
      </label>

      <Segmented label="Date range" options={RANGES} value={range} onChange={setRange} />

      {range === "custom" ? (
        <Group>
          <div className="grid grid-cols-2 divide-x divide-line2">
            <label className="block px-4 py-2.5">
              <span className="text-[12.5px] font-medium text-mut">From</span>
              <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="block px-4 py-2.5">
              <span className="text-[12.5px] font-medium text-mut">To</span>
              <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        </Group>
      ) : null}

      {/* Totals — the paper logbook's page-totals block */}
      <Group label={RANGE_NAME[range]} footer={`Totals to date: ${lifetime.flights} flights · ${lifetime.minutes.toLocaleString()} min`}>
        <div className="grid grid-cols-2 divide-x divide-line2">
          <div className="px-4 py-3.5">
            <div className="text-[12.5px] text-mut">Flights</div>
            <div data-testid="total-flights" className="mt-0.5 text-[30px] leading-none font-semibold tracking-tight tabular-nums">
              {totals.flights}
            </div>
          </div>
          <div className="px-4 py-3.5">
            <div className="text-[12.5px] text-mut">Flight time</div>
            <div className="mt-0.5 text-[30px] leading-none font-semibold tracking-tight tabular-nums">
              {hhmm(totals.minutes)}
            </div>
            <div className="mt-1 text-[12px] text-faint tabular-nums">{totals.minutes.toLocaleString()} min</div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line2 border-t border-line2">
          <div className="flex items-baseline justify-between px-4 py-2.5 text-[14px]">
            <span className="text-mut">Longest</span>
            <span className="tabular-nums">{totals.longest} min</span>
          </div>
          <div className="flex items-baseline justify-between px-4 py-2.5 text-[14px]">
            <span className="text-mut">Average</span>
            <span className="tabular-nums">{totals.average} min</span>
          </div>
        </div>
      </Group>

      {error ? (
        <Alert tone="danger" title="Cannot add an entry">
          <div className="text-[15px]">{error}</div>
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
          <Group key={month} label={month}>
            {entries.map((f) => {
              const d = new Date(f.flightDateTime);
              return (
                <Row
                  key={f.id}
                  href={`/logbook/${f.id}`}
                  leading={
                    <div className="w-10 text-center leading-tight">
                      <div className="text-[19px] font-semibold tabular-nums">
                        {String(d.getDate()).padStart(2, "0")}
                      </div>
                      <div className="text-[11px] font-medium text-faint uppercase">
                        {d.toLocaleDateString(undefined, { weekday: "short" })}
                      </div>
                    </div>
                  }
                  title={
                    <span className="block truncate">
                      {f.routeFrom || "—"} <span className="text-faint">→</span> {f.routeTo || "—"}
                    </span>
                  }
                  sub={`${f.weather || "No weather noted"} · ${f.pilotName}`}
                  right={
                    <div className="flex-none text-right">
                      <div className="text-[16px] font-medium tabular-nums">{f.flightMinutes} min</div>
                      <div className={`text-[12px] font-semibold ${f.signedAt ? "text-go" : "text-caut"}`}>
                        {f.signedAt ? "Signed" : "Draft"}
                      </div>
                    </div>
                  }
                />
              );
            })}
          </Group>
        ))
      )}
    </div>
  );
}
