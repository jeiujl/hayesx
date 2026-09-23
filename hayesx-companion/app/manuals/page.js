'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpenText, Wrench, Siren, Search, ChevronRight, ClipboardList, Gauge } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Pill, SectionTitle } from '@/components/ui'
import { useMaintenanceStatus, useAirframeHours } from '@/lib/client/selectors'
import { MANUALS } from '@/content/manuals'
import { fmtHours } from '@/lib/client/format'

const QUICK = [
  { href: '/manuals/flight/2', label: 'Operating limitations', Icon: Gauge },
  { href: '/manuals/flight/5', label: 'Performance data', Icon: Gauge },
  { href: '/manuals/maintenance/12', label: 'Scheduled maintenance', Icon: ClipboardList },
  { href: '/manuals/maintenance/13', label: 'Life-limited parts', Icon: ClipboardList },
]

export default function ManualsPage() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const maint = useMaintenanceStatus()
  const hours = useAirframeHours()
  const tone = maint.overdue ? 'warning' : maint.soon ? 'caution' : 'go'
  return (
    <>
      <PageHeader title="Manuals" eyebrow="Product & maintenance" />
      <Page>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim()) router.push(`/manuals/search?q=${encodeURIComponent(q.trim())}`)
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search both manuals (e.g. wind, BRS, 500 hour)"
            aria-label="Search manuals"
            className="hx-input !pl-11"
          />
        </form>

        <Link href="/manuals/emergency" className="mt-4 flex items-center gap-4 rounded-2xl bg-warning p-4 text-white hover:brightness-110">
          <span className="grid size-12 place-items-center rounded-xl bg-black/15">
            <Siren className="size-6" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="hx-display block text-2xl uppercase leading-none">Emergency procedures</span>
            <span className="mt-1 block text-sm text-white/85">Quick reference · Flight Manual Ch. 3</span>
          </span>
          <ChevronRight className="size-5" aria-hidden />
        </Link>

        <SectionTitle>Library</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(MANUALS).map((m) => (
            <Link key={m.id} href={`/manuals/${m.id}`} className="group hx-card flex flex-col p-4 hover:bg-surface-2">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-carbon text-on-carbon">
                  {m.id === 'flight' ? <BookOpenText className="size-5" aria-hidden /> : <Wrench className="size-5" aria-hidden />}
                </span>
                <ChevronRight className="size-5 text-muted transition group-hover:translate-x-0.5" aria-hidden />
              </div>
              <span className="hx-label mt-4 !text-[0.66rem]">{m.id === 'flight' ? 'Product manual' : 'Maintenance'}</span>
              <span className="hx-display text-2xl uppercase leading-tight">{m.title}</span>
              <span className="mt-1 text-sm text-muted">
                {m.revision ? `${m.docNo} · Rev ${m.revision}` : m.docNo} · {m.chapters.length} chapters
              </span>
            </Link>
          ))}
        </div>

        <SectionTitle>Maintenance tracker</SectionTitle>
        <Link href="/manuals/maintenance-log" className="hx-card flex items-center gap-4 p-4 hover:bg-surface-2">
          <span className="grid size-11 place-items-center rounded-xl bg-surface-2">
            <Wrench className="size-5 text-ink-2" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Inspections, life-limited parts & records</span>
            <span className="block text-sm text-muted">
              Airframe <span className="hx-num">{fmtHours(hours)}</span> h
            </span>
          </span>
          <Pill tone={tone}>{maint.overdue ? `${maint.overdue} overdue` : maint.soon ? `${maint.soon} due soon` : 'Up to date'}</Pill>
        </Link>

        <SectionTitle>Quick reference</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold hover:bg-surface-2">
              <Icon className="size-4 shrink-0 text-muted" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </Page>
    </>
  )
}
