/**
 * Maintenance tracking rules derived from the Maintenance Manual (Ch. 12, 13)
 * and Flight Manual 2.6. Hours come from the signed logbook.
 */

export const HOUR_INSPECTIONS = [
  {
    id: 'insp-10h',
    label: '10-hour inspection',
    hours: 10,
    covers: 'Airframe, CF rotors, propulsion battery, power & signal wiring, seat',
    ref: 'MM Ch. 12',
  },
  {
    id: 'insp-50h',
    label: '50-hour inspection',
    hours: 50,
    covers: 'Airframe, CF rotors, motors, ECS, propulsion battery, wiring, flight control, seat',
    ref: 'MM Ch. 12',
  },
  {
    id: 'insp-100h',
    label: '100-hour inspection',
    hours: 100,
    covers: 'Airframe, CF rotors, motors, ECS, propulsion battery, wiring, flight control, seat',
    ref: 'MM Ch. 12',
  },
  {
    id: 'insp-500h',
    label: '500-hour scheduled inspection',
    hours: 500,
    covers: 'Motors, ECS and CF rotors (scheduled inspections, documented separately), airframe, wiring, flight control, seat',
    ref: 'MM 4.2, 5.2, 6.2',
  },
]

export const CYCLE_INSPECTIONS = [
  { id: 'batt-400', label: 'Battery 400-cycle inspection', cycles: 400, repeat: true, ref: 'MM 7.3' },
  { id: 'batt-800', label: 'Battery 800-cycle performance inspection', cycles: 800, repeat: false, ref: 'MM 7.4' },
]

export const LIFE_LIMITED = [
  { id: 'gps-mount', label: 'GPS mount base', years: 2, dateField: 'gpsMountDate', ref: 'MM 13.8' },
  { id: 'gnss-mount', label: 'Differential GNSS antenna mount base', years: 2, dateField: 'gnssMountDate', ref: 'MM 13.9' },
  { id: 'pyro', label: 'GBS 10 pyroactuator', years: 5, hours: 100, dateField: 'pyroDate', ref: 'MM 13.5' },
  { id: 'parachute', label: 'Rescue parachute validity', years: 6, dateField: 'parachuteDate', ref: 'FM 2.6' },
]

export const RECORD_ITEMS = [
  ...HOUR_INSPECTIONS.map((i) => ({ id: i.id, label: i.label })),
  ...CYCLE_INSPECTIONS.map((i) => ({ id: i.id, label: i.label })),
  ...LIFE_LIMITED.map((i) => ({ id: `replace-${i.id}`, label: `Replace ${i.label.toLowerCase().replace(' validity', '')}` })),
  { id: 'defect', label: 'Defect rectification' },
  { id: 'battery', label: 'Battery maintenance' },
  { id: 'software', label: 'Software / configuration change' },
  { id: 'post-activation', label: 'BRS post-activation inspection' },
  { id: 'storage', label: 'Long-term storage / return to service' },
  { id: 'other', label: 'Other' },
]

const DAY = 864e5

function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

/**
 * Computes the status of every tracked item.
 * @param {object} p
 * @param {number} p.hours          total airframe hours (logbook + base hours)
 * @param {Array}  p.logEntries     live logbook entries (for hours-since-date)
 * @param {Array}  p.records        live maintenance records
 * @param {object} p.aircraft       aircraft profile (install dates, cycles)
 * @param {number} [p.now]
 */
export function maintenanceStatus({ hours, logEntries, records, aircraft, now = Date.now() }) {
  const latest = (itemId) =>
    records
      .filter((r) => r.item === itemId)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.hoursAt || 0) - (a.hoursAt || 0))[0]

  const hourItems = HOUR_INSPECTIONS.map((def) => {
    const last = latest(def.id)
    const base = last ? Number(last.hoursAt) || 0 : 0
    const dueAt = base + def.hours
    const remaining = dueAt - hours
    const soon = Math.max(1, def.hours * 0.1)
    return {
      ...def,
      kind: 'hours',
      last,
      dueAt,
      remaining,
      status: remaining <= 0 ? 'overdue' : remaining <= soon ? 'soon' : 'ok',
    }
  })

  const cycles = Number(aircraft?.batteryCycles) || 0
  const cycleItems = CYCLE_INSPECTIONS.map((def) => {
    const last = latest(def.id)
    let dueAt
    if (def.repeat) dueAt = (last ? Number(last.cyclesAt) || 0 : 0) + def.cycles
    else dueAt = last ? null : def.cycles
    const remaining = dueAt == null ? null : dueAt - cycles
    return {
      ...def,
      kind: 'cycles',
      last,
      dueAt,
      remaining,
      status: dueAt == null ? 'done' : remaining <= 0 ? 'overdue' : remaining <= 40 ? 'soon' : 'ok',
    }
  })

  const lifeItems = LIFE_LIMITED.map((def) => {
    const replaced = latest(`replace-${def.id}`)
    const start = [aircraft?.[def.dateField], replaced?.date].filter(Boolean).sort().pop() || null
    if (!start) return { ...def, kind: 'life', start: null, status: 'unknown' }
    const expires = addYears(start, def.years)
    const daysLeft = Math.floor((expires.getTime() - now) / DAY)
    let hoursSince = null
    let hoursLeft = null
    if (def.hours) {
      const startMs = new Date(start).getTime()
      hoursSince = logEntries.filter((e) => new Date(e.dateTime).getTime() >= startMs).reduce((s, e) => s + (Number(e.minutes) || 0), 0) / 60
      hoursLeft = def.hours - hoursSince
    }
    const overdue = daysLeft < 0 || (hoursLeft != null && hoursLeft <= 0)
    const soon = daysLeft <= 60 || (hoursLeft != null && hoursLeft <= 10)
    return {
      ...def,
      kind: 'life',
      start,
      expires: expires.toISOString().slice(0, 10),
      daysLeft,
      hoursSince,
      hoursLeft,
      status: overdue ? 'overdue' : soon ? 'soon' : 'ok',
    }
  })

  const all = [...hourItems, ...cycleItems, ...lifeItems]
  return {
    hourItems,
    cycleItems,
    lifeItems,
    overdue: all.filter((i) => i.status === 'overdue').length,
    soon: all.filter((i) => i.status === 'soon').length,
    unknown: all.filter((i) => i.status === 'unknown').length,
  }
}
