export function fmtMinutes(total) {
  const m = Math.max(0, Math.round(Number(total) || 0))
  const h = Math.floor(m / 60)
  const r = m % 60
  return h ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`
}

/** Pilot-logbook style hours:minutes, e.g. 1:05. */
export function fmtHM(total) {
  const m = Math.max(0, Math.round(Number(total) || 0))
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
}

export function fmtHours(hours, digits = 1) {
  const n = Number(hours) || 0
  return n.toFixed(digits)
}

export function fmtDate(value, opts = {}) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', ...opts })
}

export function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function fmtTime(value) {
  const d = new Date(value)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function relTime(value) {
  const d = new Date(value).getTime()
  const diff = Date.now() - d
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h ago`
  const days = Math.round(h / 24)
  if (days < 7) return `${days} d ago`
  return fmtDate(value)
}

/** Value for <input type="datetime-local"> in the device's local time. */
export function toLocalInput(date = new Date()) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function toDateInput(date = new Date()) {
  return toLocalInput(date).slice(0, 10)
}

export function initials(name) {
  return (
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || 'HX'
  )
}
