'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Card, Input, SectionTitle, toast } from '@/components/ui'
import { useApp, setSection } from '@/lib/client/store'
import { useTotals } from '@/lib/client/selectors'
import { AIRCRAFT_DEFAULTS } from '@/lib/shared/doc'
import { fmtMinutes, toDateInput } from '@/lib/client/format'

const DATE_FIELDS = [
  { key: 'parachuteDate', label: 'Rescue parachute (GBS 10) in service since', hint: '6-year validity (FM 2.6).' },
  { key: 'pyroDate', label: 'GBS 10 pyroactuator installed', hint: '5 years or 100 flight hours (MM 13.5).' },
  { key: 'gpsMountDate', label: 'GPS mount base installed', hint: 'Replace every 2 years (MM 13.8).' },
  { key: 'gnssMountDate', label: 'Differential GNSS antenna mount installed', hint: 'Replace every 2 years (MM 13.9).' },
]

export default function AircraftPage() {
  const router = useRouter()
  const { doc } = useApp()
  const { minutes } = useTotals()
  const a = doc.aircraft || {}
  const [f, setF] = useState(() => ({
    description: a.description || AIRCRAFT_DEFAULTS.description,
    category: a.category || AIRCRAFT_DEFAULTS.category,
    serialNumber: a.serialNumber || '',
    baseHours: a.baseHours ?? '',
    batteryCycles: a.batteryCycles ?? '',
    parachuteDate: a.parachuteDate || '',
    pyroDate: a.pyroDate || '',
    gpsMountDate: a.gpsMountDate || '',
    gnssMountDate: a.gnssMountDate || '',
  }))
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  function save(e) {
    e.preventDefault()
    const errors = {}
    if (!f.description.trim()) errors.description = 'Required.'
    if (!f.category.trim()) errors.category = 'Required.'
    if (f.baseHours !== '' && (Number.isNaN(Number(f.baseHours)) || Number(f.baseHours) < 0)) errors.baseHours = 'Enter hours, 0 or more.'
    if (f.batteryCycles !== '' && (!Number.isInteger(Number(f.batteryCycles)) || Number(f.batteryCycles) < 0)) errors.batteryCycles = 'Enter a whole number.'
    setErr(errors)
    if (Object.keys(errors).length) return
    setSection('aircraft', {
      ...f,
      description: f.description.trim(),
      category: f.category.trim(),
      serialNumber: f.serialNumber.trim(),
      baseHours: f.baseHours === '' ? 0 : Number(f.baseHours),
      batteryCycles: f.batteryCycles === '' ? 0 : Number(f.batteryCycles),
    })
    toast('Aircraft saved', 'success')
    router.back()
  }

  return (
    <>
      <PageHeader title="Aircraft" eyebrow="Profile" back />
      <Page>
        <Card className="overflow-hidden">
          <div className="bg-white p-4">
            <Image src="/img/hx250-side.webp" alt="HayesX-250 side view" width={989} height={474} className="hx-drawing-img mx-auto h-auto w-full max-w-md" priority />
          </div>
          <div className="grid grid-cols-2 border-t border-line text-center text-sm">
            <div className="border-r border-line p-3">
              <div className="hx-label !text-[0.66rem]">Logged time</div>
              <div className="hx-num font-semibold">{fmtMinutes(minutes)}</div>
            </div>
            <div className="p-3">
              <div className="hx-label !text-[0.66rem]">Airframe total</div>
              <div className="hx-num font-semibold">{((Number(f.baseHours) || 0) + minutes / 60).toFixed(1)} h</div>
            </div>
          </div>
        </Card>

        <form onSubmit={save} className="space-y-4" noValidate>
          <SectionTitle>Identification</SectionTitle>
          <Card className="space-y-4 p-4">
            <Input label="Aircraft description" value={f.description} onChange={set('description')} error={err.description} />
            <Input label="Aircraft category" value={f.category} onChange={set('category')} error={err.category} />
            <Input label="Serial number" value={f.serialNumber} onChange={set('serialNumber')} className="[&_input]:font-mono" hint="Filled into every logbook entry automatically." autoCapitalize="characters" />
          </Card>

          <SectionTitle>Hours & cycles</SectionTitle>
          <Card className="space-y-4 p-4">
            <Input
              label="Hours flown before using this app"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={f.baseHours}
              onChange={set('baseHours')}
              error={err.baseHours}
              hint="Added to your logbook time to give total airframe hours for maintenance."
            />
            <Input label="Propulsion battery cycles" type="number" inputMode="numeric" min="0" value={f.batteryCycles} onChange={set('batteryCycles')} error={err.batteryCycles} hint="Highest of the two packs, from the BMS." />
          </Card>

          <SectionTitle>Life-limited parts</SectionTitle>
          <Card className="space-y-4 p-4">
            {DATE_FIELDS.map((d) => (
              <Input key={d.key} label={d.label} type="date" value={f[d.key]} onChange={set(d.key)} hint={d.hint} max={toDateInput()} />
            ))}
          </Card>

          <Button type="submit" full size="lg">
            Save aircraft
          </Button>
        </form>
      </Page>
    </>
  )
}
