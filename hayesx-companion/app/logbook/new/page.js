'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Minus, Plus, ArrowRight, ClipboardCheck, PenLine } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import SignaturePad from '@/components/SignaturePad'
import { Button, Callout, Card, Input, Textarea, cx, toast } from '@/components/ui'
import { useApp, putRecord, setSection, getState } from '@/lib/client/store'
import { AIRCRAFT_DEFAULTS, newId } from '@/lib/shared/doc'
import { toLocalInput, fmtDateTime } from '@/lib/client/format'

const MAX_PLANNED_ENDURANCE = 30 // minutes, Flight Manual 5.7

export default function NewEntryPage() {
  return (
    <Suspense fallback={null}>
      <NewEntry />
    </Suspense>
  )
}

function NewEntry() {
  const router = useRouter()
  const params = useSearchParams()
  const { doc, user } = useApp()
  const checklistId = params.get('checklist')
  const run = checklistId ? doc.checklists[checklistId] : null
  const serialLocked = Boolean(doc.aircraft?.serialNumber)

  const [f, setF] = useState(() => ({
    aircraftDescription: doc.aircraft?.description || AIRCRAFT_DEFAULTS.description,
    aircraftCategory: doc.aircraft?.category || AIRCRAFT_DEFAULTS.category,
    serialNumber: doc.aircraft?.serialNumber || '',
    pilot: doc.profile?.name || user?.name || '',
    dateTime: toLocalInput(run?.startedAt || new Date()),
    routeFrom: '',
    routeTo: '',
    minutes: '',
    weather: '',
    notes: '',
  }))
  const [certified, setCertified] = useState(false)
  const [signature, setSignature] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const clearError = (k) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }))
    clearError(k)
  }

  const minutesNum = Number(f.minutes)
  const long = Number.isFinite(minutesNum) && minutesNum > MAX_PLANNED_ENDURANCE

  const recentPlaces = useMemo(() => {
    const seen = new Map()
    for (const e of Object.values(doc.logbook || {})) {
      if (e.deleted) continue
      for (const p of [e.routeFrom, e.routeTo]) if (p) seen.set(p.trim(), (seen.get(p.trim()) || 0) + 1)
    }
    return [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p]) => p)
  }, [doc.logbook])

  function stepMinutes(delta) {
    const n = Math.max(0, Math.min(600, (Number(f.minutes) || 0) + delta))
    setF((s) => ({ ...s, minutes: String(n) }))
    clearError('minutes')
  }

  function validate() {
    const e = {}
    if (!f.aircraftDescription.trim()) e.aircraftDescription = 'Required.'
    if (!f.aircraftCategory.trim()) e.aircraftCategory = 'Required.'
    if (!f.serialNumber.trim()) e.serialNumber = 'Enter the aircraft serial number. You only need to do this once.'
    if (!f.pilot.trim()) e.pilot = 'Enter the pilot’s name.'
    if (!f.dateTime || Number.isNaN(new Date(f.dateTime).getTime())) e.dateTime = 'Enter the date and time of the flight.'
    else if (new Date(f.dateTime).getTime() > Date.now() + 5 * 60_000) e.dateTime = 'The flight can’t be in the future.'
    if (!f.routeFrom.trim()) e.routeFrom = 'Where did the flight start?'
    if (!f.routeTo.trim()) e.routeTo = 'Where did it end?'
    if (!Number.isInteger(minutesNum) || minutesNum < 1 || minutesNum > 600) e.minutes = 'Enter whole minutes, 1 to 600.'
    if (!f.weather.trim()) e.weather = 'Describe the weather (e.g. Clear, wind 5 kt).'
    if (!certified) e.certified = 'You must certify the entry.'
    if (!signature?.paths?.length) e.signature = 'Sign the entry.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function save(ev) {
    ev.preventDefault()
    if (!validate()) {
      toast('Check the highlighted fields', 'error')
      setTimeout(() => document.querySelector('[aria-invalid="true"], [data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
      return
    }
    setSaving(true)
    const serial = f.serialNumber.trim()
    if (!serialLocked) setSection('aircraft', { serialNumber: serial, description: f.aircraftDescription.trim(), category: f.aircraftCategory.trim() })
    const now = Date.now()
    const entry = putRecord('logbook', {
      id: newId('lb_'),
      aircraftDescription: f.aircraftDescription.trim(),
      aircraftCategory: f.aircraftCategory.trim(),
      serialNumber: serial,
      pilot: f.pilot.trim(),
      dateTime: new Date(f.dateTime).toISOString(),
      routeFrom: f.routeFrom.trim(),
      routeTo: f.routeTo.trim(),
      minutes: minutesNum,
      weather: f.weather.trim(),
      notes: f.notes.trim(),
      certified: true,
      signature,
      signerName: f.pilot.trim(),
      signedAt: now,
      checklistId: run?.id || null,
    })
    if (run) putRecord('checklists', { ...getState().doc.checklists[run.id], logEntryId: entry.id })
    toast('Flight logged and signed', 'success')
    router.replace(`/logbook/entry?id=${encodeURIComponent(entry.id)}&saved=1`)
  }

  return (
    <>
      <PageHeader title="New entry" eyebrow="Digital logbook" back="/logbook" />
      <Page>
        <form onSubmit={save} noValidate className="space-y-4">
          {run && (
            <Callout tone={run.result === 'go' ? 'go' : 'note'} title="Linked checklist">
              <p className="mt-1 flex items-center gap-2 text-[15px]">
                <ClipboardCheck className="size-4 shrink-0" aria-hidden />
                Preflight {run.result === 'go' ? 'GO' : run.result?.toUpperCase() || ''} · {fmtDateTime(run.completedAt || run.startedAt)}
              </p>
            </Callout>
          )}

          <Card className="space-y-4 p-4">
            <h2 className="hx-label">Aircraft</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Aircraft description" value={f.aircraftDescription} onChange={set('aircraftDescription')} error={errors.aircraftDescription} />
              <Input label="Aircraft category" value={f.aircraftCategory} onChange={set('aircraftCategory')} error={errors.aircraftCategory} />
            </div>
            {serialLocked ? (
              <div>
                <div className="mb-1.5 text-sm font-semibold text-ink-2">Aircraft serial number</div>
                <div className="flex min-h-12 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5">
                  <Lock className="size-4 text-muted" aria-hidden />
                  <span className="hx-mono flex-1 font-semibold">{f.serialNumber}</span>
                  <Link href="/account/aircraft" className="text-sm font-semibold text-accent">
                    Change
                  </Link>
                </div>
              </div>
            ) : (
              <Input
                label="Aircraft serial number"
                value={f.serialNumber}
                onChange={set('serialNumber')}
                error={errors.serialNumber}
                hint="Entered once. It’s saved to your aircraft profile and filled in automatically next time."
                autoCapitalize="characters"
                className="[&_input]:font-mono"
              />
            )}
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="hx-label">Flight</h2>
            <Input label="Pilot" value={f.pilot} onChange={set('pilot')} error={errors.pilot} hint="Defaults to the account owner. Type a different name if someone else flew." autoComplete="name" />
            <Input label="Date and time" type="datetime-local" value={f.dateTime} onChange={set('dateTime')} error={errors.dateTime} max={toLocalInput(new Date(Date.now() + 5 * 60_000))} />
            <div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                <Input label="From" value={f.routeFrom} onChange={set('routeFrom')} error={errors.routeFrom} placeholder="Departure" list="hx-places" />
                <ArrowRight className="mt-10 size-5 text-muted" aria-hidden />
                <Input label="To" value={f.routeTo} onChange={set('routeTo')} error={errors.routeTo} placeholder="Arrival" list="hx-places" />
              </div>
              <datalist id="hx-places">
                {recentPlaces.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              {f.routeFrom && !f.routeTo && (
                <button
                  type="button"
                  onClick={() => {
                    setF((s) => ({ ...s, routeTo: s.routeFrom }))
                    clearError('routeTo')
                  }}
                  className="mt-2 text-sm font-semibold text-accent">
                  Same as departure (local flight)
                </button>
              )}
            </div>
            <div>
              <label htmlFor="minutes" className="mb-1.5 block text-sm font-semibold text-ink-2">
                Flight time (minutes)
              </label>
              <div className="flex items-stretch gap-2">
                <button type="button" onClick={() => stepMinutes(-1)} aria-label="Decrease by 1 minute" className="grid w-12 place-items-center rounded-xl border border-line bg-surface hover:bg-surface-2">
                  <Minus className="size-5" />
                </button>
                <input
                  id="minutes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={600}
                  step={1}
                  value={f.minutes}
                  onChange={set('minutes')}
                  placeholder="0"
                  aria-invalid={Boolean(errors.minutes) || undefined}
                  className="hx-input hx-num flex-1 text-center text-2xl font-semibold"
                />
                <button type="button" onClick={() => stepMinutes(1)} aria-label="Increase by 1 minute" className="grid w-12 place-items-center rounded-xl border border-line bg-surface hover:bg-surface-2">
                  <Plus className="size-5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, 15, 20, 25].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setF((s) => ({ ...s, minutes: String(m) }))
                      clearError('minutes')
                    }}
                    className={cx('rounded-full border px-3 py-1 text-sm font-semibold', String(m) === f.minutes ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-2 hover:bg-surface-2')}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              {errors.minutes && <p className="mt-1.5 text-sm text-warning">{errors.minutes}</p>}
              {long && !errors.minutes && (
                <p className="mt-1.5 text-sm text-caution">Longer than the 30-minute maximum planned battery endurance (FM 5.7). Double-check the time.</p>
              )}
            </div>
            <Input label="Weather conditions" value={f.weather} onChange={set('weather')} error={errors.weather} placeholder="e.g. Clear, 24 °C, wind 6 kt W" />
            <Textarea label="Notes" optional value={f.notes} onChange={set('notes')} placeholder="About the flight or the machine" />
          </Card>

          <Card className="space-y-4 p-4" data-error={Boolean(errors.certified || errors.signature) || undefined}>
            <h2 className="hx-label flex items-center gap-2">
              <PenLine className="size-4" aria-hidden /> Certification
            </h2>
            <label className={cx('flex cursor-pointer gap-3 rounded-xl border p-3', errors.certified ? 'border-warning bg-warning-soft' : 'border-line')}>
              <input type="checkbox" checked={certified} onChange={(e) => {
                  setCertified(e.target.checked)
                  clearError('certified')
                }} className="mt-1 size-5 shrink-0 accent-[var(--hx-accent)]" />
              <span className="text-[15px]">
                I certify that the information in this logbook entry is complete and accurate.
                {errors.certified && <span className="mt-1 block text-sm text-warning">{errors.certified}</span>}
              </span>
            </label>
            <SignaturePad
              value={signature}
              onChange={(v) => {
                setSignature(v)
                if (v) clearError('signature')
              }}
              label={`Signature of pilot${f.pilot ? ` (${f.pilot})` : ''}`} />
            {errors.signature && <p className="text-sm text-warning">{errors.signature}</p>}
          </Card>

          <Button type="submit" size="lg" full loading={saving}>
            Sign and save entry
          </Button>
          <p className="text-center text-xs text-muted">Signed entries are locked. They can be deleted, but not edited.</p>
        </form>
      </Page>
    </>
  )
}
