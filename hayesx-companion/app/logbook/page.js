'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, NotebookPen, Download, Printer, ArrowRight, CalendarRange, X, BadgeCheck } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Card, Empty, Stat, cx, toast } from '@/components/ui'
import { useLogbook, totals } from '@/lib/client/selectors'
import { useApp } from '@/lib/client/store'
import { fmtMinutes, fmtHM, fmtDate, toDateInput } from '@/lib/client/format'
import { downloadFile, logbookCsv } from '@/lib/client/download'

function presetRange(key) {
  const now = new Date()
  const today = toDateInput(now)
  if (key === '30d') return { from: toDateInput(new Date(now.getTime() - 29 * 864e5)), to: today }
  if (key === 'month') return { from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), to: today }
  if (key === 'year') return { from: toDateInput(new Date(now.getFullYear(), 0, 1)), to: today }
  return { from: '', to: '' }
}

const PRESETS = [
  { key: 'all', label: 'All time' },
  { key: 'month', label: 'This month' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'year', label: 'This year' },
]

export default function LogbookPage() {
  const entries = useLogbook()
  const { doc } = useApp()
  const [range, setRange] = useState({ from: '', to: '' })
  const [preset, setPreset] = useState('all')

  const filtered = useMemo(() => {
    const from = range.from ? new Date(range.from + 'T00:00:00').getTime() : -Infinity
    const to = range.to ? new Date(range.to + 'T23:59:59.999').getTime() : Infinity
    return entries.filter((e) => {
      const t = new Date(e.dateTime).getTime()
      return t >= from && t <= to
    })
  }, [entries, range])

  const report = totals(filtered)
  const all = totals(entries)
  const rangeError = range.from && range.to && range.from > range.to

  const groups = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      const d = new Date(e.dateTime)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, { key, label: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), items: [] })
      map.get(key).items.push(e)
    }
    return [...map.values()]
  }, [filtered])

  function choose(key) {
    setPreset(key)
    setRange(presetRange(key))
  }

  function exportCsv() {
    if (!filtered.length) return toast('No entries in this range to export', 'error')
    const stamp = new Date().toISOString().slice(0, 10)
    downloadFile(`hayesx-logbook-${stamp}.csv`, logbookCsv(filtered), 'text/csv;charset=utf-8')
    toast(`Exported ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`, 'success')
  }

  const rangeLabel =
    range.from || range.to ? `${range.from ? fmtDate(range.from + 'T12:00') : 'First flight'} – ${range.to ? fmtDate(range.to + 'T12:00') : 'Today'}` : 'All time'

  return (
    <>
      <PageHeader
        title="Logbook"
        eyebrow={`${all.flights} flight${all.flights === 1 ? '' : 's'} · ${fmtMinutes(all.minutes)}`}
        actions={
          <Button href="/logbook/new" size="sm" className="!h-10">
            <Plus className="size-4" aria-hidden /> New
          </Button>
        }
      />
      <Page>
        {entries.length === 0 ? (
          <Empty
            icon={NotebookPen}
            title="No flights logged yet"
            action={
              <Button href="/logbook/new" size="lg">
                <Plus className="size-5" aria-hidden /> Log your first flight
              </Button>
            }
          >
            Each entry records the aircraft, pilot, route, flight time and weather, and is certified with your signature.
          </Empty>
        ) : (
          <>
            {/* Search & report */}
            <Card className="p-4 hx-no-print">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4 text-muted" aria-hidden />
                <h2 className="hx-label">Search by date</h2>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => choose(p.key)}
                    className={cx(
                      'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                      preset === p.key ? 'border-accent bg-accent text-accent-ink' : 'border-line text-ink-2 hover:bg-surface-2'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted">From</span>
                  <input
                    type="date"
                    className="hx-input"
                    value={range.from}
                    max={range.to || undefined}
                    onChange={(e) => {
                      setPreset('custom')
                      setRange((r) => ({ ...r, from: e.target.value }))
                    }}
                    aria-label="From date"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted">To</span>
                  <input
                    type="date"
                    className="hx-input"
                    value={range.to}
                    min={range.from || undefined}
                    onChange={(e) => {
                      setPreset('custom')
                      setRange((r) => ({ ...r, to: e.target.value }))
                    }}
                    aria-label="To date"
                  />
                </label>
              </div>
              {rangeError && <p className="mt-2 text-sm text-warning">The start date is after the end date.</p>}
              {(range.from || range.to) && (
                <button onClick={() => choose('all')} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  <X className="size-4" aria-hidden /> Clear dates
                </button>
              )}

              <div className="mt-4 rounded-2xl bg-carbon p-4 text-on-carbon" aria-live="polite" data-testid="logbook-report">
                <div className="hx-label !text-white/50">Report · {rangeLabel}</div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <Stat label="Total flights" value={report.flights} className="[&_.hx-label]:!text-white/45" />
                  <Stat label="Total minutes" value={report.minutes} className="[&_.hx-label]:!text-white/45" />
                  <Stat label="Hours (h:mm)" value={fmtHM(report.minutes)} className="[&_.hx-label]:!text-white/45" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={exportCsv}>
                  <Download className="size-4" aria-hidden /> Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                  <Printer className="size-4" aria-hidden /> Print report
                </Button>
              </div>
            </Card>

            {/* Entries */}
            {filtered.length === 0 ? (
              <Empty icon={CalendarRange} title="No flights in this range">
                Try a wider date range.
              </Empty>
            ) : (
              groups.map((g) => (
                <section key={g.key} className="hx-no-print">
                  <div className="mt-6 mb-2 flex items-baseline justify-between px-1">
                    <h3 className="hx-label">{g.label}</h3>
                    <span className="hx-num text-xs text-muted">
                      {g.items.length} · {fmtMinutes(totals(g.items).minutes)}
                    </span>
                  </div>
                  <Card className="divide-y divide-line overflow-hidden">
                    {g.items.map((e) => (
                      <EntryRow key={e.id} e={e} />
                    ))}
                  </Card>
                </section>
              ))
            )}

            {/* Print-only report */}
            <PrintReport entries={filtered} report={report} rangeLabel={rangeLabel} serial={doc.aircraft?.serialNumber} pilot={doc.profile?.name} />
          </>
        )}
      </Page>
    </>
  )
}

function EntryRow({ e }) {
  const d = new Date(e.dateTime)
  return (
    <Link href={`/logbook/entry?id=${encodeURIComponent(e.id)}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
      <div className="w-11 shrink-0 text-center">
        <div className="hx-num text-xl font-semibold leading-none">{d.getDate()}</div>
        <div className="hx-label !text-[0.62rem] mt-0.5">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">
          {e.routeFrom === e.routeTo ? (
            <>
              {e.routeFrom} <span className="font-normal text-muted">· local</span>
            </>
          ) : (
            <>
              {e.routeFrom} <ArrowRight className="inline size-3.5 align-[-2px] text-muted" aria-hidden /> {e.routeTo}
            </>
          )}
        </div>
        <div className="truncate text-sm text-muted">
          {d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {e.pilot} · {e.weather}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="hx-num font-semibold">{e.minutes} min</div>
        <BadgeCheck className="ml-auto mt-0.5 size-4 text-go" aria-label="Signed" />
      </div>
    </Link>
  )
}

function PrintReport({ entries, report, rangeLabel, serial, pilot }) {
  return (
    <div className="hidden print:block">
      <h1 className="text-2xl font-bold">HayesX Digital Logbook</h1>
      <p className="text-sm">
        {rangeLabel} · Aircraft S/N {serial || '—'} · Printed {new Date().toLocaleString()}
      </p>
      <table className="mt-4 w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-1 pr-2">Date</th>
            <th className="pr-2">Aircraft</th>
            <th className="pr-2">Pilot</th>
            <th className="pr-2">Route</th>
            <th className="pr-2 text-right">Min</th>
            <th className="pr-2">Weather</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-gray-300 align-top">
              <td className="py-1 pr-2 whitespace-nowrap">{new Date(e.dateTime).toLocaleString()}</td>
              <td className="pr-2">
                {e.aircraftDescription} ({e.serialNumber})
              </td>
              <td className="pr-2">{e.pilot}</td>
              <td className="pr-2">
                {e.routeFrom} → {e.routeTo}
              </td>
              <td className="pr-2 text-right">{e.minutes}</td>
              <td className="pr-2">{e.weather}</td>
              <td>{e.notes}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black font-bold">
            <td className="py-1" colSpan={4}>
              Totals: {report.flights} flights
            </td>
            <td className="text-right">{report.minutes}</td>
            <td colSpan={2}>({fmtMinutes(report.minutes)})</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-8 text-sm">All entries were individually certified and signed in the HayesX app{pilot ? ` by the pilot named on each entry (account: ${pilot})` : ''}.</p>
    </div>
  )
}

