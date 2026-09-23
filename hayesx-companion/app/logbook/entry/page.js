'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, BadgeCheck, ClipboardCheck, Printer, Trash2, NotebookPen } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Signature } from '@/components/SignaturePad'
import { Button, Card, Confirm, Empty, IconButton, Pill, toast } from '@/components/ui'
import { useApp, removeRecord } from '@/lib/client/store'
import { fmtDateTime, fmtMinutes } from '@/lib/client/format'

export default function EntryPage() {
  return (
    <Suspense fallback={null}>
      <Entry />
    </Suspense>
  )
}

function Entry() {
  const params = useSearchParams()
  const router = useRouter()
  const { doc } = useApp()
  const id = params.get('id')
  const e = doc.logbook[id]
  const [confirm, setConfirm] = useState(false)

  if (!e || e.deleted) {
    return (
      <>
        <PageHeader title="Logbook entry" back="/logbook" />
        <Page>
          <Empty icon={NotebookPen} title="Entry not found" action={<Button href="/logbook">Back to logbook</Button>}>
            It may have been deleted on another device.
          </Empty>
        </Page>
      </>
    )
  }

  const run = e.checklistId ? doc.checklists[e.checklistId] : null

  return (
    <>
      <PageHeader
        title={`${e.routeFrom} → ${e.routeTo}`}
        eyebrow={fmtDateTime(e.dateTime)}
        back="/logbook"
        actions={
          <>
            <IconButton label="Print entry" onClick={() => window.print()}>
              <Printer className="size-5" />
            </IconButton>
            <IconButton label="Delete entry" onClick={() => setConfirm(true)} className="text-muted">
              <Trash2 className="size-5" />
            </IconButton>
          </>
        }
      />
      <Page>
        <div className="hidden print:block mb-4">
          <div className="text-2xl font-bold">HayesX Digital Logbook</div>
          <div>Entry printed {new Date().toLocaleString()}</div>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 bg-carbon px-5 py-5 text-on-carbon">
            <div className="min-w-0 flex-1">
              <div className="hx-label !text-white/50">Flight time</div>
              <div className="hx-num text-4xl font-semibold">{e.minutes} min</div>
              {e.minutes >= 60 && <div className="text-sm text-white/60">{fmtMinutes(e.minutes)}</div>}
            </div>
            <Pill tone="go" className="!bg-go !text-white">
              <BadgeCheck className="size-3.5" aria-hidden /> Signed
            </Pill>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-5 text-[15px]">
            <Row label="Aircraft" value={e.aircraftDescription} />
            <Row label="Category" value={e.aircraftCategory} />
            <Row label="Serial number" value={<span className="hx-mono">{e.serialNumber}</span>} />
            <Row label="Pilot" value={e.pilot} />
            <Row label="Date and time" value={fmtDateTime(e.dateTime)} />
            <Row
              label="Route"
              value={
                <span className="inline-flex flex-wrap items-center gap-1">
                  {e.routeFrom} <ArrowRight className="size-3.5 text-muted" aria-hidden /> {e.routeTo}
                </span>
              }
            />
            <Row label="Weather" value={e.weather} wide />
            <Row label="Notes" value={e.notes || '—'} wide />
          </dl>
        </Card>

        {run && (
          <Link href={`/checklist/record?id=${encodeURIComponent(run.id)}`} className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:bg-surface-2 hx-no-print">
            <ClipboardCheck className="size-5 text-go" aria-hidden />
            <span className="flex-1 text-[15px] font-semibold">Preflight checklist</span>
            <Pill tone={run.result === 'go' ? 'go' : 'warning'}>{run.result === 'go' ? 'GO' : 'NO-GO'}</Pill>
          </Link>
        )}

        <Card className="mt-3 p-5">
          <div className="hx-label">Certification</div>
          <p className="mt-2 text-[15px] text-ink-2">
            I certify that the information in this logbook entry is complete and accurate.
          </p>
          <div className="mt-3 rounded-xl border border-line bg-surface-2/50 px-3 py-2">
            <Signature value={e.signature} className="max-h-32" />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-muted">
            <span>Signed by {e.signerName || e.pilot}</span>
            <span>{fmtDateTime(e.signedAt)}</span>
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-muted hx-no-print">Signed entries are locked and cannot be edited.</p>
      </Page>
      <Confirm
        open={confirm}
        title="Delete this entry?"
        body="The signed entry is removed from your logbook on every device. Totals will be recalculated."
        confirmLabel="Delete entry"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          removeRecord('logbook', e.id)
          toast('Entry deleted')
          router.replace('/logbook')
        }}
      />
    </>
  )
}

function Row({ label, value, wide }) {
  return (
    <div className={wide ? 'col-span-2' : 'min-w-0'}>
      <dt className="hx-label !text-[0.68rem]">{label}</dt>
      <dd className="mt-0.5 break-words font-medium whitespace-pre-wrap">{value}</dd>
    </div>
  )
}
