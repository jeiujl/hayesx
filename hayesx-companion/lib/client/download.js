'use client'

export function downloadFile(filename, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows) {
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function logbookCsv(entries) {
  const header = [
    'Date',
    'Time',
    'Aircraft',
    'Category',
    'Serial number',
    'Pilot',
    'From',
    'To',
    'Flight time (min)',
    'Weather',
    'Notes',
    'Certified by',
    'Signed at',
  ]
  const rows = entries.map((e) => {
    const d = new Date(e.dateTime)
    return [
      d.toLocaleDateString('en-CA'),
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      e.aircraftDescription,
      e.aircraftCategory,
      e.serialNumber,
      e.pilot,
      e.routeFrom,
      e.routeTo,
      e.minutes,
      e.weather,
      e.notes,
      e.signerName,
      e.signedAt ? new Date(e.signedAt).toISOString() : '',
    ]
  })
  const total = entries.reduce((s, e) => s + (Number(e.minutes) || 0), 0)
  rows.push([])
  rows.push(['Total flights', entries.length])
  rows.push(['Total flight time (min)', total])
  return '﻿' + toCsv([header, ...rows])
}
