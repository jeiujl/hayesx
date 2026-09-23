'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Flag, Minus, CircleCheck, OctagonAlert, Send, NotebookPen, Trash2, MessagesSquare, CircleDashed } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Card, Confirm, Empty, IconButton, Pill, cx, toast } from '@/components/ui'
import { useApp, putRecord, removeRecord, getState } from '@/lib/client/store'
import { CHECKLISTS, summarize } from '@/content/checklists'
import { api } from '@/lib/client/api'
import { fmtDateTime } from '@/lib/client/format'

export default function RecordPage() {
  return (
    <Suspense fallback={null}>
      <Record />
    </Suspense>
  )
}

function Record() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')
  const justDone = params.get('done') === '1'
  const { doc } = useApp()
  const run = doc.checklists[id]
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!run || run.deleted) {
    return (
      <>
        <PageHeader title="Checklist" back="/checklist" />
        <Page>
          <Empty icon={CircleDashed} title="Checklist not found" action={<Button href="/checklist">Back to checklists</Button>}>
            It may have been deleted on another device.
          </Empty>
        </Page>
      </>
    )
  }

  const list = CHECKLISTS[run.type]
  const s = summarize(list, run)
  const go = run.result === 'go'
  const nogo = run.result === 'no-go'
  const logged = run.logEntryId && doc.logbook[run.logEntryId] && !doc.logbook[run.logEntryId].deleted

  async function report() {
    setSending(true)
    try {
      const lines = s.flagged.map((f) => `• [${f.sectionId}] ${f.text}: ${f.note || 'no note'}`).join('\n')
      const text = `NO-GO ${list.title.toLowerCase()} checklist${run.serialNumber ? ` on S/N ${run.serialNumber}` : ''} (${fmtDateTime(run.completedAt)}).\n\nDiscrepancies:\n${lines}`
      await api('/api/messages', { method: 'POST', body: { text, meta: { kind: 'checklist-report', ref: run.id } } })
      putRecord('checklists', { ...getState().doc.checklists[run.id], reportedAt: Date.now() })
      toast('Report sent to HayesX support', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHeader
        title={`${list.title} record`}
        eyebrow={fmtDateTime(run.startedAt)}
        back={justDone ? '/checklist' : true}
        actions={
          <IconButton label="Delete record" onClick={() => setConfirmDelete(true)} className="text-muted">
            <Trash2 className="size-5" />
          </IconButton>
        }
      />
      <Page>
        <div
          className={cx(
            'hx-anim-in flex flex-col items-center rounded-3xl px-4 py-7 text-center',
            go ? 'bg-go-soft' : nogo ? 'bg-warning-soft' : 'bg-surface-2'
          )}
        >
          {go ? (
            <CircleCheck className="hx-anim-pop size-14 text-go" aria-hidden />
          ) : nogo ? (
            <OctagonAlert className="hx-anim-pop size-14 text-warning" aria-hidden />
          ) : (
            <CircleDashed className="size-14 text-muted" aria-hidden />
          )}
          <div className={cx('hx-display mt-2 text-5xl uppercase', go ? 'text-go' : nogo ? 'text-warning' : 'text-ink-2')}>
            {go ? 'GO' : nogo ? 'NO-GO' : run.status === 'abandoned' ? 'Cancelled' : 'In progress'}
          </div>
          <p className="mt-1 max-w-sm text-ink-2">
            {go
              ? run.type === 'preflight'
                ? 'All preflight items verified. Fly within the limits of the Flight Manual.'
                : 'Shutdown complete. Aircraft secured and stored.'
              : nogo
                ? 'Do not fly. Correct every discrepancy before flight.'
                : `${s.answered} of ${s.total} items were answered.`}
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          {go && run.type === 'preflight' && !logged && (
            <Button size="lg" href={`/logbook/new?checklist=${encodeURIComponent(run.id)}`}>
              <NotebookPen className="size-5" aria-hidden /> Log this flight
            </Button>
          )}
          {logged && (
            <Button size="lg" variant="secondary" href={`/logbook/entry?id=${encodeURIComponent(run.logEntryId)}`}>
              <NotebookPen className="size-5" aria-hidden /> View logbook entry
            </Button>
          )}
          {nogo &&
            (run.reportedAt ? (
              <Button size="lg" variant="secondary" href="/messages">
                <MessagesSquare className="size-5" aria-hidden /> Reported {fmtDateTime(run.reportedAt)}: open messages
              </Button>
            ) : (
              <Button size="lg" variant="danger" onClick={report} loading={sending}>
                <Send className="size-5" aria-hidden /> Report to HayesX support
              </Button>
            ))}
        </div>

        <Card className="mt-4 grid grid-cols-2 gap-4 p-4 text-sm">
          <Meta label="Pilot" value={run.pilot || '—'} />
          <Meta label="Aircraft S/N" value={run.serialNumber || '—'} />
          <Meta label="Started" value={fmtDateTime(run.startedAt)} />
          <Meta label="Completed" value={run.completedAt ? fmtDateTime(run.completedAt) : '—'} />
          {run.type === 'preflight' && <Meta label="Battery at boarding" value={run.batteryPercent != null ? `${run.batteryPercent}%` : '—'} />}
          <Meta label="Items" value={`${s.done} ok · ${s.flagged.length} flagged`} />
        </Card>

        {list.sections.map((section) => (
          <Card key={section.id} className="mt-3 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5">
              <span className="hx-mono text-xs text-muted">{section.id}</span>
              <h2 className="hx-display text-base uppercase tracking-wide">{section.title}</h2>
            </div>
            <ul className="divide-y divide-line">
              {section.items.map((item) => {
                const st = run.items?.[item.id]
                return (
                  <li key={item.id} className="flex gap-3 px-4 py-2.5">
                    {st?.state === 'ok' ? (
                      <Check className="mt-0.5 size-5 shrink-0 text-go" aria-label="Checked" />
                    ) : st?.state === 'fail' ? (
                      <Flag className="mt-0.5 size-5 shrink-0 text-warning" aria-label="Flagged" />
                    ) : (
                      <Minus className="mt-0.5 size-5 shrink-0 text-muted" aria-label="Not answered" />
                    )}
                    <div className="min-w-0 flex-1 text-[15px]">
                      {item.text}
                      {st?.value != null && <span className="hx-num ml-2 text-muted">{st.value}%</span>}
                      {st?.state === 'fail' && <div className="text-sm text-warning">{st.note}</div>}
                    </div>
                    {st?.at && <span className="hx-num shrink-0 text-xs text-muted">{new Date(st.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>}
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
        <p className="mt-4 text-center text-xs text-muted">Source: {list.source}</p>
      </Page>
      <Confirm
        open={confirmDelete}
        title="Delete this checklist record?"
        body="This removes the record from every device signed in to your account."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          removeRecord('checklists', run.id)
          toast('Checklist record deleted')
          router.replace('/checklist')
        }}
      />
    </>
  )
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="hx-label !text-[0.68rem]">{label}</div>
      <div className="mt-0.5 truncate font-semibold">{value}</div>
    </div>
  )
}
