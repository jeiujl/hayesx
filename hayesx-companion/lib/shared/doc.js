/**
 * The pilot's app data lives in one document that is cached on the device
 * (IndexedDB) and synced to the server. Sections are either single records
 * (last write wins by `updatedAt`) or collections keyed by id (per-record last
 * write wins; deletions are tombstones with `deleted: true`).
 */

export const SINGLE_SECTIONS = ['profile', 'aircraft', 'prefs']
export const COLLECTION_SECTIONS = ['logbook', 'checklists', 'maintenance']

export const AIRCRAFT_DEFAULTS = {
  description: 'HayesX-250',
  category: 'Ultralight (FAA Part 103)',
}

export function emptyDoc() {
  return {
    v: 1,
    profile: { updatedAt: 0 },
    aircraft: { ...AIRCRAFT_DEFAULTS, serialNumber: '', updatedAt: 0 },
    prefs: { theme: 'system', updatedAt: 0 },
    logbook: {},
    checklists: {},
    maintenance: {},
  }
}

const ts = (r) => (r && typeof r.updatedAt === 'number' ? r.updatedAt : 0)

export function mergeDocs(a, b) {
  const base = emptyDoc()
  const out = { v: 1 }
  for (const key of SINGLE_SECTIONS) {
    const x = a?.[key]
    const y = b?.[key]
    out[key] = { ...base[key], ...(ts(y) > ts(x) ? y : x || y || {}) }
  }
  for (const key of COLLECTION_SECTIONS) {
    const x = a?.[key] || {}
    const y = b?.[key] || {}
    const merged = { ...x }
    for (const [id, rec] of Object.entries(y)) {
      if (!merged[id] || ts(rec) > ts(merged[id])) merged[id] = rec
    }
    out[key] = merged
  }
  return out
}

/** Records changed after `since` (used to send a small delta to the server). */
export function changesSince(doc, since) {
  const delta = { v: 1 }
  let count = 0
  for (const key of SINGLE_SECTIONS) {
    if (ts(doc[key]) > since) {
      delta[key] = doc[key]
      count++
    }
  }
  for (const key of COLLECTION_SECTIONS) {
    const part = {}
    for (const [id, rec] of Object.entries(doc[key] || {})) {
      if (ts(rec) > since) {
        part[id] = rec
        count++
      }
    }
    delta[key] = part
  }
  return { delta, count }
}

export function live(collection) {
  return Object.values(collection || {}).filter((r) => r && !r.deleted)
}

export function newId(prefix = '') {
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18)
  return prefix + Date.now().toString(36) + rand
}
