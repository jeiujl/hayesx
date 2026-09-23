'use client'

import { useMemo } from 'react'
import { useApp } from './store'
import { live } from '../shared/doc'
import { maintenanceStatus } from '@/content/maintenance'

export function useLogbook() {
  const { doc } = useApp()
  return useMemo(() => live(doc.logbook).sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime))), [doc.logbook])
}

export function useChecklistRuns() {
  const { doc } = useApp()
  return useMemo(() => live(doc.checklists).sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)), [doc.checklists])
}

export function useMaintenanceRecords() {
  const { doc } = useApp()
  return useMemo(() => live(doc.maintenance).sort((a, b) => String(b.date).localeCompare(String(a.date))), [doc.maintenance])
}

export function totals(entries) {
  const minutes = entries.reduce((s, e) => s + (Number(e.minutes) || 0), 0)
  return { flights: entries.length, minutes }
}

export function useTotals() {
  const entries = useLogbook()
  return useMemo(() => totals(entries), [entries])
}

/** Airframe hours = hours recorded before using the app + logged flight time. */
export function useAirframeHours() {
  const { doc } = useApp()
  const { minutes } = useTotals()
  const base = Number(doc.aircraft?.baseHours) || 0
  return base + minutes / 60
}

export function useMaintenanceStatus() {
  const { doc } = useApp()
  const entries = useLogbook()
  const records = useMaintenanceRecords()
  const hours = useAirframeHours()
  return useMemo(
    () => maintenanceStatus({ hours, logEntries: entries, records, aircraft: doc.aircraft }),
    [hours, entries, records, doc.aircraft]
  )
}

export function useInProgressRun(type) {
  const runs = useChecklistRuns()
  return runs.find((r) => r.type === type && r.status === 'in-progress') || null
}
