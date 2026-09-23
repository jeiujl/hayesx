'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Wrench, CalendarClock, Battery, Timer, Trash2, ChevronRight, Download } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Card, Confirm, Empty, Input, Pill, Select, SectionTitle, Sheet, Stat, Textarea, cx, toast } from '@/components/ui'
import { useApp, putRecord, removeRecord, setSection } from '@/lib/client/store'
import { useAirframeHours, useMaintenanceRecords, useMaintenanceStatus } from '@/lib/client/selectors'
import { RECORD_ITEMS } from '@/content/maintenance'
import { fmtDate, fmtHours, toDateInput } from '@/lib/client/format'
import { newId } from '@/lib/shared/doc'
import { downloadFile, toCsv } from '@/lib/client/download'

const STATUS = {
  overdue: { tone: 'warning', label: 'Overdue' },
  soon: { tone: 'caution', label: 'Due soon' },
  ok: { tone: 'go', label: 'OK' },
  done: { tone: 'neutral', label: 'Done' },
  unknown: { tone: 'neutral', label: 'Set date' },
}

export default function MaintenancePage() {
  const { doc } = useApp()
  const hours = useAirframeHours()
  const status = useMaintenanceStatus()
  const records = useMaintenanceRecords()
  const [form, setForm] = useState(null)
  const [view, setView] = useState(null)
  const [cyclesOpen, setCyclesOpen] = useState(false)
  const itemLabel = (id) => RECORD_ITEMS.find((i) => i.id === id)?.label || id

  function exportCsv() {
    if (!records.length) return toast('No maintenance records yet', 'error')
    const rows = [
      ['Date', 'Aircraft S/N', 'Flight hours', 'Battery cycles', 'Maintenance item', 'Defect description', 'Corrective action', 'Replaced component', 'Component S/N', 'Maintenance personnel', 'Inspector'],
      ...records.map((r) => [
        r.date,
        r.serialNumber,
        r.hoursAt,
        r.cyclesAt ?? '',
        itemLabel(r.item),
        r.defect,
        r.action,
        r.component,
        r.componentSerial,
        r.personnel,
        r.inspector,
      ]),
    ]
    downloadFile(`hayesx-maintenance-${toDateInput()}.csv`, '﻿' + toCsv(rows), 'text/csv;charset=utf-8')
  }

  return (
    <>
      <PageHeader
        title="Maintenance"
        eyebrow="Tracker · MM Ch. 12, 13, 15"
        back="/manuals"
        actions={
          <Button size="sm" className="!h-10" onClick={() => setForm({ item: 'insp-10h' })}>
            <Plus className="size-4" aria-hidden /> Record
          </Button>
        }
      />
      <Page>
        <Card className="grid grid-cols-3 gap-3 p-4">
          <Stat label="Airframe hours" value={fmtHours(hours)} sub={Number(doc.aircraft?.baseHours) ? `incl. ${doc.aircraft.baseHours} h prior` : 'from logbook'} />
          <button onClick={() => setCyclesOpen(true)} className="rounded-lg text-left hover:bg-surface-2">
            <Stat label="Battery cycles" value={Number(doc.aircraft?.batteryCycles) || 0} sub={<span className="text-accent font-semibold">Update</span>} />
          </button>
          <Stat
            label="Status"
            value={<span className={status.overdue ? 'text-warning' : status.soon ? 'text-caution' : 'text-go'}>{status.overdue ? status.overdue : status.soon ? status.soon : '✓'}</span>}
            sub={status.overdue ? 'overdue' : status.soon ? 'due soon' : 'all current'}
          />
        </Card>

        <SectionTitle>Hour-based inspections</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          {status.hourItems.map((i) => (
            <TrackRow
              key={i.id}
              Icon={Timer}
              title={i.label}
              sub={i.covers}
              detail={
                <>
                  Due at <span className="hx-num">{fmtHours(i.dueAt)} h</span> ·{' '}
                  {i.remaining > 0 ? (
                    <>
                      <span className="hx-num">{fmtHours(i.remaining)} h</span> left
                    </>
                  ) : (
                    <>
                      <span className="hx-num">{fmtHours(-i.remaining)} h</span> over
                    </>
                  )}
                  {i.last && <> · last {fmtDate(i.last.date)}</>}
                </>
              }
              status={i.status}
              onRecord={() => setForm({ item: i.id })}
            />
          ))}
        </Card>

        <SectionTitle>Propulsion battery</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          {status.cycleItems.map((i) => (
            <TrackRow
              key={i.id}
              Icon={Battery}
              title={i.label}
              sub={i.ref}
              detail={
                i.dueAt == null ? (
                  <>Completed {i.last ? fmtDate(i.last.date) : ''}</>
                ) : (
                  <>
                    Due at <span className="hx-num">{i.dueAt}</span> cycles · <span className="hx-num">{Math.max(0, i.remaining)}</span> left
                  </>
                )
              }
              status={i.status}
              onRecord={() => setForm({ item: i.id })}
            />
          ))}
        </Card>

        <SectionTitle>Life-limited parts</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          {status.lifeItems.map((i) => (
            <TrackRow
              key={i.id}
              Icon={CalendarClock}
              title={i.label}
              sub={`${i.years} years${i.hours ? ` or ${i.hours} flight hours` : ''} · ${i.ref}`}
              detail={
                i.start ? (
                  <>
                    Since {fmtDate(i.start)} · expires {fmtDate(i.expires)}
                    {i.hoursLeft != null && (
                      <>
                        {' '}
                        · <span className="hx-num">{fmtHours(Math.max(0, i.hoursLeft))}</span> h left
                      </>
                    )}
                  </>
                ) : (
                  <Link href="/account/aircraft" className="font-semibold text-accent">
                    Set the installation date in Aircraft profile
                  </Link>
                )
              }
              status={i.status}
              onRecord={() => setForm({ item: `replace-${i.id}` })}
              recordLabel="Replaced"
            />
          ))}
        </Card>

        <SectionTitle
          action={
            records.length > 0 && (
              <button onClick={exportCsv} className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                <Download className="size-4" aria-hidden /> CSV
              </button>
            )
          }
        >
          Maintenance records
        </SectionTitle>
        {records.length === 0 ? (
          <Card>
            <Empty icon={Wrench} title="No records yet" action={<Button onClick={() => setForm({ item: 'insp-10h' })}>Add a record</Button>}>
              Record every inspection, defect and replacement (Maintenance Manual Ch. 15).
            </Empty>
          </Card>
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {records.map((r) => (
              <button key={r.id} onClick={() => setView(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2">
                <Wrench className="size-5 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{itemLabel(r.item)}</div>
                  <div className="truncate text-sm text-muted">
                    {fmtDate(r.date)} · <span className="hx-num">{fmtHours(r.hoursAt)} h</span>
                    {r.personnel ? ` · ${r.personnel}` : ''}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </button>
            ))}
          </Card>
        )}
      </Page>

      <RecordForm initial={form} hours={hours} onClose={() => setForm(null)} />
      <RecordView record={view} itemLabel={itemLabel} onClose={() => setView(null)} />
      <CyclesSheet open={cyclesOpen} onClose={() => setCyclesOpen(false)} value={Number(doc.aircraft?.batteryCycles) || 0} />
    </>
  )
}

function TrackRow({ Icon, title, sub, detail, status, onRecord, recordLabel = 'Done' }) {
  const s = STATUS[status] || STATUS.ok
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon className={cx('mt-0.5 size-5 shrink-0', status === 'overdue' ? 'text-warning' : status === 'soon' ? 'text-caution' : 'text-muted')} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{title}</span>
          <Pill tone={s.tone}>{s.label}</Pill>
        </div>
        <div className="mt-0.5 text-sm text-ink-2">{detail}</div>
        {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
      </div>
      <Button size="sm" variant="secondary" onClick={onRecord} className="shrink-0">
        {recordLabel}
      </Button>
    </div>
  )
}

function RecordForm({ initial, hours, onClose }) {
  const { doc } = useApp()
  const [f, setF] = useState(null)
  const [err, setErr] = useState({})
  if (initial && !f) {
    setF({
      date: toDateInput(),
      item: initial.item,
      hoursAt: fmtHours(hours),
      cyclesAt: String(Number(doc.aircraft?.batteryCycles) || 0),
      defect: '',
      action: '',
      component: '',
      componentSerial: '',
      personnel: doc.profile?.name || '',
      inspector: '',
    })
  }
  if (!initial && f) setF(null)
  if (!f) return null
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const isBattery = f.item.startsWith('batt-')

  function save() {
    const e = {}
    if (!f.date) e.date = 'Required.'
    if (f.hoursAt === '' || Number.isNaN(Number(f.hoursAt)) || Number(f.hoursAt) < 0) e.hoursAt = 'Enter the airframe hours.'
    if (isBattery && (f.cyclesAt === '' || Number(f.cyclesAt) < 0)) e.cyclesAt = 'Enter the battery cycle count.'
    if (!f.action.trim()) e.action = 'Describe the work performed.'
    if (!f.personnel.trim()) e.personnel = 'Who performed the maintenance?'
    setErr(e)
    if (Object.keys(e).length) return
    putRecord('maintenance', {
      id: newId('mx_'),
      ...f,
      hoursAt: Number(f.hoursAt),
      cyclesAt: isBattery ? Number(f.cyclesAt) : null,
      serialNumber: doc.aircraft?.serialNumber || '',
      defect: f.defect.trim(),
      action: f.action.trim(),
      component: f.component.trim(),
      componentSerial: f.componentSerial.trim(),
      personnel: f.personnel.trim(),
      inspector: f.inspector.trim(),
    })
    toast('Maintenance recorded', 'success')
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Maintenance record"
      footer={
        <Button full size="lg" onClick={save}>
          Save record
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Select label="Maintenance item" value={f.item} onChange={set('item')}>
          {RECORD_ITEMS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={f.date} onChange={set('date')} error={err.date} max={toDateInput()} />
          <Input label="Flight hours" type="number" inputMode="decimal" step="0.1" min="0" value={f.hoursAt} onChange={set('hoursAt')} error={err.hoursAt} />
        </div>
        {isBattery && <Input label="Battery cycles at service" type="number" inputMode="numeric" min="0" value={f.cyclesAt} onChange={set('cyclesAt')} error={err.cyclesAt} />}
        <Textarea label="Defect description" optional value={f.defect} onChange={set('defect')} rows={2} />
        <Textarea label="Corrective action / work performed" value={f.action} onChange={set('action')} error={err.action} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Replaced component" optional value={f.component} onChange={set('component')} />
          <Input label="Component S/N" optional value={f.componentSerial} onChange={set('componentSerial')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Maintenance personnel" value={f.personnel} onChange={set('personnel')} error={err.personnel} />
          <Input label="Inspector" optional value={f.inspector} onChange={set('inspector')} />
        </div>
      </div>
    </Sheet>
  )
}

function RecordView({ record, itemLabel, onClose }) {
  const [confirm, setConfirm] = useState(false)
  if (!record) return null
  const rows = [
    ['Date', fmtDate(record.date)],
    ['Aircraft S/N', record.serialNumber || '—'],
    ['Flight hours', `${fmtHours(record.hoursAt)} h`],
    ...(record.cyclesAt != null ? [['Battery cycles', record.cyclesAt]] : []),
    ['Defect', record.defect || '—'],
    ['Corrective action', record.action],
    ['Replaced component', record.component || '—'],
    ['Component S/N', record.componentSerial || '—'],
    ['Maintenance personnel', record.personnel],
    ['Inspector', record.inspector || '—'],
  ]
  return (
    <>
      <Sheet
        open={!confirm}
        onClose={onClose}
        title={itemLabel(record.item)}
        footer={
          <Button variant="danger-outline" full onClick={() => setConfirm(true)}>
            <Trash2 className="size-4" aria-hidden /> Delete record
          </Button>
        }
      >
        <dl className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-[15px]">
              <dt className="text-muted">{k}</dt>
              <dd className="whitespace-pre-wrap font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Sheet>
      <Confirm
        open={confirm}
        title="Delete this record?"
        body="Due dates will be recalculated from the remaining records."
        confirmLabel="Delete"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          removeRecord('maintenance', record.id)
          setConfirm(false)
          toast('Record deleted')
          onClose()
        }}
      />
    </>
  )
}

function CyclesSheet({ open, onClose, value }) {
  const [v, setV] = useState(String(value))
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setV(String(value))
  }
  const n = Number(v)
  const bad = v === '' || !Number.isInteger(n) || n < 0 || n > 100000
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Battery cycles"
      footer={
        <Button
          full
          size="lg"
          disabled={bad}
          onClick={() => {
            setSection('aircraft', { batteryCycles: n })
            toast('Battery cycles updated', 'success')
            onClose()
          }}
        >
          Save
        </Button>
      }
    >
      <p className="text-sm text-ink-2">
        Enter the higher cycle count of the two propulsion packs, as reported by the BMS. One cycle is a cumulative discharge equal to 100% of rated capacity (MM 7.5).
      </p>
      <Input className="mt-4" label="Complete charge-discharge cycles" type="number" inputMode="numeric" min="0" value={v} onChange={(e) => setV(e.target.value)} error={v !== '' && bad ? 'Enter a whole number.' : undefined} data-autofocus />
    </Sheet>
  )
}
