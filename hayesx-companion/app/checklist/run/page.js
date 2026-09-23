'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Flag, RotateCcw, Siren, ImageIcon, BatteryFull } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Callout, Card, Confirm, IconButton, Sheet, Textarea, cx, toast, Empty } from '@/components/ui'
import { useApp, putRecord, getState } from '@/lib/client/store'
import { useInProgressRun } from '@/lib/client/selectors'
import { startRun } from '@/components/checklist/shared'
import { CHECKLISTS, BATTERY_MIN_TAKEOFF, summarize } from '@/content/checklists'

export default function RunPage() {
  return (
    <Suspense fallback={null}>
      <Run />
    </Suspense>
  )
}

function Run() {
  const params = useSearchParams()
  const type = params.get('type') === 'shutdown' ? 'shutdown' : 'preflight'
  const list = CHECKLISTS[type]
  const run = useInProgressRun(type)
  const { doc, user } = useApp()

  if (!run) {
    return (
      <>
        <PageHeader title={`${list.title}`} eyebrow="Checklist" back="/checklist" />
        <Page>
          <Empty
            icon={Check}
            title={`No ${list.title.toLowerCase()} in progress`}
            action={
              <Button onClick={() => startRun(type, doc, user)} size="lg">
                Start {list.title.toLowerCase()} checklist
              </Button>
            }
          >
            {list.subtitle}. Source: {list.source}.
          </Empty>
        </Page>
      </>
    )
  }
  return <RunBody key={run.id} list={list} run={run} />
}

function RunBody({ list, run }) {
  const router = useRouter()
  const summary = useMemo(() => summarize(list, run), [list, run])
  const [flagItem, setFlagItem] = useState(null)
  const [imageItem, setImageItem] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const sectionRefs = useRef({})

  function setItem(itemId, value) {
    const current = getState().doc.checklists[run.id]
    const items = { ...(current?.items || {}) }
    if (value === null) delete items[itemId]
    else items[itemId] = { ...value, at: Date.now() }
    putRecord('checklists', { ...current, items })
  }

  function toggle(item, sectionIndex) {
    const st = run.items?.[item.id]
    if (st?.state === 'ok') return setItem(item.id, null)
    setItem(item.id, { state: 'ok' })
    // When a section completes, bring the next one into view (EFB-style flow).
    const section = list.sections[sectionIndex]
    const remaining = section.items.filter((i) => i.id !== item.id && !run.items?.[i.id])
    if (remaining.length === 0 && list.sections[sectionIndex + 1]) {
      setTimeout(() => sectionRefs.current[list.sections[sectionIndex + 1].id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180)
    }
  }

  function finish() {
    const current = getState().doc.checklists[run.id]
    const s = summarize(list, current)
    if (!s.complete) return
    const result = s.go ? 'go' : 'no-go'
    const battery = current.items?.['4.7.e']?.value
    putRecord('checklists', { ...current, status: 'complete', result, completedAt: Date.now(), batteryPercent: battery ?? null })
    router.replace(`/checklist/record?id=${encodeURIComponent(current.id)}&done=1`)
  }

  function reset() {
    const current = getState().doc.checklists[run.id]
    putRecord('checklists', { ...current, status: 'abandoned', completedAt: Date.now() })
    setConfirmReset(false)
    toast('Checklist cancelled')
    router.push('/checklist')
  }

  return (
    <>
      <PageHeader
        title={list.title}
        eyebrow={`${list.source}`}
        back="/checklist"
        actions={
          <>
            <Link href="/manuals/emergency" aria-label="Emergency procedures" className="inline-flex size-11 items-center justify-center rounded-xl text-warning hover:bg-warning-soft">
              <Siren className="size-5" />
            </Link>
            <IconButton label="Cancel checklist" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-5" />
            </IconButton>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={summary.total} aria-valuenow={summary.answered} aria-label="Checklist progress">
            <div className={cx('h-full rounded-full transition-all', summary.flagged.length ? 'bg-warning' : 'bg-go')} style={{ width: `${summary.pct}%` }} />
          </div>
          <span className="hx-num text-sm font-semibold">
            {summary.answered}/{summary.total}
          </span>
        </div>
      </PageHeader>

      <Page className="pb-28">
        {list.sections.map((section, si) => {
          const done = section.items.filter((i) => run.items?.[i.id]).length
          const failed = section.items.some((i) => run.items?.[i.id]?.state === 'fail')
          const showGroup = section.group && section.group !== list.sections[si - 1]?.group
          return (
            <section key={section.id} ref={(el) => (sectionRefs.current[section.id] = el)} className="scroll-mt-32">
              {showGroup && <div className="hx-label mt-7 mb-1 px-1">{section.group}</div>}
              <Card className={cx('mt-3 overflow-hidden', done === section.items.length && !failed && 'border-go/40')}>
                <div className="flex items-center gap-3 border-b border-line bg-surface-2/60 px-4 py-3">
                  <span className="hx-mono rounded-md bg-carbon px-1.5 py-0.5 text-xs font-semibold text-on-carbon">{section.id}</span>
                  <h2 className="hx-display flex-1 text-lg uppercase leading-tight tracking-wide">{section.title}</h2>
                  <span className={cx('hx-num text-sm', failed ? 'text-warning' : done === section.items.length ? 'text-go' : 'text-muted')}>
                    {done}/{section.items.length}
                  </span>
                </div>
                <div className="space-y-3 px-4 pt-3 empty:hidden">
                  {section.lead && <p className="text-sm text-ink-2">{section.lead}</p>}
                  {section.notes?.map((n) => (
                    <Callout key={n.title} tone={n.tone} title={n.title} text={n.text} lines={n.lines} />
                  ))}
                </div>
                <ul className="py-1">
                  {section.items.map((item) =>
                    item.kind === 'battery' ? (
                      <BatteryItem key={item.id} item={item} state={run.items?.[item.id]} onChange={(v) => setItem(item.id, v)} />
                    ) : (
                      <ItemRow
                        key={item.id}
                        item={item}
                        state={run.items?.[item.id]}
                        onToggle={() => toggle(item, si)}
                        onFlag={() => setFlagItem(item)}
                        onImage={() => setImageItem(item)}
                      />
                    )
                  )}
                </ul>
                {section.after?.map((n) => (
                  <div key={n.title} className="px-4 pb-4">
                    <Callout tone={n.tone} title={n.title} text={n.text} lines={n.lines} />
                  </div>
                ))}
              </Card>
            </section>
          )
        })}
      </Page>

      <div className="hx-no-print fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 text-sm">
            {summary.complete ? (
              summary.flagged.length ? (
                <span className="font-semibold text-warning">{summary.flagged.length} discrepancy flagged</span>
              ) : (
                <span className="font-semibold text-go">All items checked</span>
              )
            ) : (
              <span className="text-muted">{summary.total - summary.answered} items remaining</span>
            )}
          </div>
          <Button onClick={finish} disabled={!summary.complete} variant={summary.flagged.length ? 'danger' : 'go'}>
            Finish checklist
          </Button>
        </div>
      </div>

      <FlagSheet
        item={flagItem}
        state={flagItem ? run.items?.[flagItem.id] : null}
        onClose={() => setFlagItem(null)}
        onSave={(note) => {
          setItem(flagItem.id, { state: 'fail', note })
          setFlagItem(null)
        }}
        onClear={() => {
          setItem(flagItem.id, null)
          setFlagItem(null)
        }}
      />

      <Sheet open={Boolean(imageItem)} onClose={() => setImageItem(null)} title={imageItem?.text || ''} size="lg">
        {imageItem?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageItem.image.src} alt={imageItem.image.alt} width={imageItem.image.w} height={imageItem.image.h} className="w-full rounded-xl" />
        )}
        {imageItem?.detail && <p className="mt-3 text-ink-2">{imageItem.detail}</p>}
      </Sheet>

      <Confirm
        open={confirmReset}
        title="Cancel this checklist?"
        body="The run is kept in your history as cancelled. You can start a fresh checklist at any time."
        confirmLabel="Cancel checklist"
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />

    </>
  )
}

function ItemRow({ item, state, onToggle, onFlag, onImage }) {
  const ok = state?.state === 'ok'
  const fail = state?.state === 'fail'
  return (
    <li className={cx('flex items-stretch gap-1 px-2', fail && 'bg-warning-soft/60')}>
      <button
        onClick={fail ? onFlag : onToggle}
        role="checkbox"
        aria-checked={ok}
        data-state={ok ? 'ok' : fail ? 'fail' : 'none'}
        className="flex min-h-[56px] flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface-2 active:scale-[0.99]"
      >
        <span
          className={cx(
            'grid size-8 shrink-0 place-items-center rounded-full border-2 transition',
            ok ? 'hx-anim-pop border-go bg-go text-white' : fail ? 'border-warning bg-warning text-white' : 'border-line bg-surface'
          )}
          aria-hidden
        >
          {ok && <Check className="size-4" strokeWidth={3} />}
          {fail && <Flag className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cx('block text-[16px] font-medium leading-snug', ok && 'text-ink-2')}>{item.text}</span>
          {item.detail && <span className="mt-0.5 block text-sm text-muted">{item.detail}</span>}
          {fail && <span className="mt-1 block text-sm font-semibold text-warning">Discrepancy: {state.note || 'No note'}</span>}
        </span>
      </button>
      {item.image && (
        <IconButton label={`View reference photo for ${item.text}`} onClick={onImage} className="self-center text-muted">
          <ImageIcon className="size-5" />
        </IconButton>
      )}
      <IconButton label={fail ? `Edit discrepancy for ${item.text}` : `Flag a discrepancy for ${item.text}`} onClick={onFlag} className={cx('self-center', fail ? 'text-warning' : 'text-muted')}>
        <Flag className="size-5" />
      </IconButton>
    </li>
  )
}

function BatteryItem({ item, state, onChange }) {
  const [value, setValue] = useState(state?.value ?? '')
  const num = value === '' ? null : Number(value)
  const valid = num !== null && Number.isFinite(num) && num >= 0 && num <= 100
  function commit(v) {
    setValue(v)
    const n = v === '' ? null : Number(v)
    if (n === null || !Number.isFinite(n) || n < 0 || n > 100) return onChange(null)
    if (n >= BATTERY_MIN_TAKEOFF) onChange({ state: 'ok', value: n })
    else onChange({ state: 'fail', value: n, note: `Battery ${n}%: below the ${BATTERY_MIN_TAKEOFF}% minimum for takeoff (FM 2.5)` })
  }
  return (
    <li className={cx('px-4 py-3', state?.state === 'fail' && 'bg-warning-soft/60')}>
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'grid size-8 shrink-0 place-items-center rounded-full border-2',
            state?.state === 'ok' ? 'border-go bg-go text-white' : state?.state === 'fail' ? 'border-warning bg-warning text-white' : 'border-line'
          )}
          aria-hidden
        >
          <BatteryFull className="size-4" />
        </span>
        <label htmlFor="battery-pct" className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium leading-snug">{item.text}</span>
          <span className="block text-sm text-muted">{item.detail}</span>
        </label>
        <div className="relative w-28">
          <input
            id="battery-pct"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="—"
            value={value}
            onChange={(e) => commit(e.target.value)}
            className="hx-input hx-num !pr-8 text-right text-lg font-semibold"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">%</span>
        </div>
      </div>
      {valid && num < BATTERY_MIN_TAKEOFF && (
        <p className="mt-2 text-sm font-semibold text-warning" role="alert">
          Below {BATTERY_MIN_TAKEOFF}% minimum before takeoff. Charge before flight.
        </p>
      )}
      {value !== '' && !valid && <p className="mt-2 text-sm text-warning">Enter a value from 0 to 100.</p>}
    </li>
  )
}

function FlagSheet({ item, state, onClose, onSave, onClear }) {
  const [note, setNote] = useState('')
  useEffect(() => {
    setNote(state?.state === 'fail' ? state.note || '' : '')
  }, [item, state])
  return (
    <Sheet
      open={Boolean(item)}
      onClose={onClose}
      title="Flag discrepancy"
      footer={
        <div className="flex gap-2">
          {state && (
            <Button variant="secondary" onClick={onClear}>
              Clear
            </Button>
          )}
          <Button variant="danger" full onClick={() => onSave(note.trim())} disabled={!note.trim()}>
            <Flag className="size-4" aria-hidden /> Flag item
          </Button>
        </div>
      }
    >
      <p className="font-semibold">{item?.text}</p>
      <p className="mt-1 text-sm text-muted">A flagged item makes this checklist NO-GO. Describe what you found so it can be reported to HayesX.</p>
      <Textarea className="mt-4" label="What did you find?" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Hairline crack at rear-left arm joint" data-autofocus />
    </Sheet>
  )
}
