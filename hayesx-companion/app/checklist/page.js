'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, PowerOff, Siren, ChevronRight, Wrench, NotebookPen, History } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import Wordmark from '@/components/Wordmark'
import { Card, Pill, SectionTitle, Stat, cx } from '@/components/ui'
import { useApp } from '@/lib/client/store'
import { useChecklistRuns, useInProgressRun, useMaintenanceStatus, useTotals, useLogbook } from '@/lib/client/selectors'
import { CHECKLISTS, summarize } from '@/content/checklists'
import { fmtMinutes, relTime, fmtDate } from '@/lib/client/format'
import { startRun, RunRow } from '@/components/checklist/shared'

export default function ChecklistHome() {
  const router = useRouter()
  const { doc, user } = useApp()
  const runs = useChecklistRuns()
  const preflight = useInProgressRun('preflight')
  const shutdown = useInProgressRun('shutdown')
  const { flights, minutes } = useTotals()
  const entries = useLogbook()
  const maint = useMaintenanceStatus()
  const recent = runs.filter((r) => r.status !== 'in-progress').slice(0, 4)
  const firstName = (doc.profile?.name || user?.name || '').split(' ')[0]

  function open(type) {
    const current = type === 'preflight' ? preflight : shutdown
    if (!current) startRun(type, doc, user)
    router.push(`/checklist/run?type=${type}`)
  }

  const maintTone = maint.overdue ? 'warning' : maint.soon ? 'caution' : 'go'
  const maintText = maint.overdue ? `${maint.overdue} overdue` : maint.soon ? `${maint.soon} due soon` : 'Up to date'

  return (
    <>
      <PageHeader
        title="Checklist"
        eyebrow={firstName ? `Welcome, ${firstName}` : 'HayesX-250'}
        actions={
          <Link href="/manuals/emergency" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-warning px-3 text-sm font-bold text-white">
            <Siren className="size-4" aria-hidden />
            Emergency
          </Link>
        }
      />
      <Page>
        {/* Aircraft hero */}
        <section className="hx-anim-in relative overflow-hidden rounded-3xl bg-carbon p-5 text-on-carbon shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Wordmark size="sm" tone="light" />
              <div className="hx-display mt-2 text-3xl uppercase leading-none">{doc.aircraft?.description || 'HayesX-250'}</div>
              <div className="mt-1.5 text-sm text-white/60">
                {doc.aircraft?.serialNumber ? (
                  <>
                    S/N <span className="hx-mono text-white/85">{doc.aircraft.serialNumber}</span>
                  </>
                ) : (
                  <Link href="/account/aircraft" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                    Add serial number
                  </Link>
                )}
                <span className="mx-2 text-white/25">·</span>
                {doc.aircraft?.category || 'Ultralight (FAA Part 103)'}
              </div>
            </div>
          </div>
          <div className="relative -mx-2 my-3 h-28 sm:h-36" aria-hidden>
            <div className="hx-mask-aircraft absolute inset-0 bg-white/80" />
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <Link href="/logbook" className="min-w-0 rounded-lg hover:bg-white/5">
              <Stat label="Flights" value={flights} className="[&_.hx-label]:text-white/45" />
            </Link>
            <Link href="/logbook" className="min-w-0 rounded-lg hover:bg-white/5">
              <Stat label="Flight time" value={fmtMinutes(minutes)} className="[&_.hx-label]:text-white/45" />
            </Link>
            <Link href="/logbook" className="min-w-0 rounded-lg hover:bg-white/5">
              <Stat label="Last flight" value={entries[0] ? fmtDate(entries[0].dateTime, { year: undefined }) : '—'} className="[&_.hx-label]:text-white/45" />
            </Link>
          </div>
        </section>

        <Link href="/manuals/maintenance-log" className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:bg-surface-2">
          <Wrench className="size-5 text-muted" aria-hidden />
          <span className="flex-1 text-[15px] font-semibold">Maintenance</span>
          <Pill tone={maintTone}>{maintText}</Pill>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>

        <SectionTitle>Ready to fly?</SectionTitle>
        <div className="grid gap-3">
          <ChecklistCard list={CHECKLISTS.preflight} run={preflight} Icon={ClipboardCheck} onOpen={() => open('preflight')} primary />
          <ChecklistCard list={CHECKLISTS.shutdown} run={shutdown} Icon={PowerOff} onOpen={() => open('shutdown')} />
        </div>

        <SectionTitle
          action={
            runs.length > 0 && (
              <Link href="/checklist/history" className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <History className="size-4" aria-hidden /> All
              </Link>
            )
          }
        >
          Recent checklists
        </SectionTitle>
        {recent.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted">Completed checklists appear here with their GO / NO-GO result.</Card>
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {recent.map((r) => (
              <RunRow key={r.id} run={r} />
            ))}
          </Card>
        )}

        <Link href="/logbook/new" className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-4 text-ink-2 hover:bg-surface">
          <NotebookPen className="size-5" aria-hidden />
          <span className="flex-1 font-semibold">Log a flight without a checklist</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </Page>
    </>
  )
}

function ChecklistCard({ list, run, Icon, onOpen, primary }) {
  const s = run ? summarize(list, run) : null
  return (
    <button
      onClick={onOpen}
      className={cx(
        'group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition',
        primary ? 'border-transparent bg-accent text-accent-ink hover:brightness-110' : 'border-line bg-surface hover:bg-surface-2'
      )}
    >
      <span className={cx('grid size-12 shrink-0 place-items-center rounded-xl', primary ? 'bg-white/15' : 'bg-surface-2')}>
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="hx-display block text-2xl uppercase leading-none">{run ? `Resume ${list.title}` : `Start ${list.title}`}</span>
        <span className={cx('mt-1 block text-sm', primary ? 'text-white/80' : 'text-muted')}>
          {s ? `${s.answered} of ${s.total} items · started ${relTime(run.startedAt)}` : `${list.subtitle} · ${list.source}`}
        </span>
        {s && (
          <span className={cx('mt-2 block h-1.5 overflow-hidden rounded-full', primary ? 'bg-white/20' : 'bg-surface-3')}>
            <span className={cx('block h-full rounded-full', primary ? 'bg-white' : 'bg-accent')} style={{ width: `${s.pct}%` }} />
          </span>
        )}
      </span>
      <ChevronRight className="size-5 shrink-0 opacity-70 transition group-hover:translate-x-0.5" aria-hidden />
    </button>
  )
}
