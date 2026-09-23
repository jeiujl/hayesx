'use client'

import { useSyncExternalStore } from 'react'
import { api, ApiError } from './api'
import { idbGet, idbSet, idbDelete } from './idb'
import { emptyDoc, mergeDocs, changesSince, newId, live } from '../shared/doc'

/* ------------------------------------------------------------------ */
/* State container                                                     */
/* ------------------------------------------------------------------ */

const initial = {
  status: 'loading', // 'loading' | 'signed-out' | 'ready'
  user: null,
  doc: emptyDoc(),
  sync: { state: 'idle', lastAt: null, error: null, pending: 0 },
  online: true,
  unread: 0,
}

let state = initial
const listeners = new Set()

function set(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  for (const l of listeners) l()
}

export function getState() {
  return state
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useApp() {
  return useSyncExternalStore(subscribe, getState, () => initial)
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const USER_KEY = 'hx:user'
let meta = { lastSyncStart: 0 }
let syncTimer

function cachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function cacheUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

async function persistNow() {
  const uid = state.user?.uid
  if (!uid) return
  await idbSet(`doc:${uid}`, state.doc)
  await idbSet(`meta:${uid}`, meta)
}

function pendingCount(doc = state.doc) {
  return changesSince(doc, meta.lastSyncStart || 0).count
}

/* ------------------------------------------------------------------ */
/* Boot & auth                                                         */
/* ------------------------------------------------------------------ */

let booted = false

export async function boot() {
  if (booted) return
  booted = true
  if (typeof window === 'undefined') return

  set({ online: navigator.onLine })
  window.addEventListener('online', () => {
    set({ online: true })
    syncNow()
  })
  window.addEventListener('offline', () => set({ online: false }))
  window.addEventListener('hx:unauthorized', () => {
    if (state.user) signedOutLocally()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncNow()
    else flushOnHide()
  })
  window.addEventListener('pagehide', flushOnHide)
  setInterval(() => {
    if (document.visibilityState === 'visible') syncNow()
  }, 60_000)

  const cached = cachedUser()
  if (cached) await enter(cached, { fromCache: true })

  try {
    const { user } = await api('/api/auth/me')
    cacheUser(user)
    if (!state.user || state.user.uid !== user.uid) await enter(user)
    else set({ user })
    syncNow()
  } catch (err) {
    if (err instanceof ApiError && err.offline) {
      if (!state.user) set({ status: 'signed-out' })
    } else {
      signedOutLocally()
    }
  }
}

async function enter(user, { fromCache = false } = {}) {
  cacheUser(user)
  const [doc, m] = await Promise.all([idbGet(`doc:${user.uid}`), idbGet(`meta:${user.uid}`)])
  meta = m || { lastSyncStart: 0 }
  const base = doc ? mergeDocs(emptyDoc(), doc) : emptyDoc()
  if (!base.profile.name) base.profile = { ...base.profile, name: user.name }
  set({ user, doc: base, status: 'ready', sync: { ...state.sync, pending: pendingCount(base) } })
  applyTheme(base.prefs?.theme)
  if (!fromCache) syncNow()
}

function clearDeviceCaches(uid) {
  try {
    if (uid) localStorage.removeItem(`hx:thread:${uid}`)
    localStorage.removeItem('hx:bulletins')
  } catch {
    /* ignore */
  }
}

function signedOutLocally() {
  clearDeviceCaches(state.user?.uid)
  cacheUser(null)
  meta = { lastSyncStart: 0 }
  set({ user: null, status: 'signed-out', doc: emptyDoc(), unread: 0 })
}

export async function signIn(email, password) {
  const { user } = await api('/api/auth/login', { method: 'POST', body: { email, password } })
  await enter(user)
  return user
}

export async function signUp(name, email, password) {
  const { user } = await api('/api/auth/signup', { method: 'POST', body: { name, email, password } })
  await enter(user)
  setSection('profile', { name: user.name })
  return user
}

export async function signOut() {
  const uid = state.user?.uid
  try {
    await syncNow({ force: true })
  } catch {
    /* best effort */
  }
  try {
    await api('/api/auth/logout', { method: 'POST' })
  } catch {
    /* the cookie expires on its own */
  }
  if (uid) {
    await idbDelete(`doc:${uid}`)
    await idbDelete(`meta:${uid}`)
  }
  signedOutLocally()
}

export async function forgetLocalAccount() {
  const uid = state.user?.uid
  if (uid) {
    await idbDelete(`doc:${uid}`)
    await idbDelete(`meta:${uid}`)
  }
  signedOutLocally()
}

export function setUser(user) {
  cacheUser(user)
  set({ user })
}

/* ------------------------------------------------------------------ */
/* Sync                                                                */
/* ------------------------------------------------------------------ */

let syncing = null
let queued = false

export function syncSoon() {
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => syncNow(), 1200)
}

export async function syncNow({ force = false } = {}) {
  if (!state.user) return
  if (syncing) {
    queued = true
    return syncing
  }
  if (!force && typeof navigator !== 'undefined' && !navigator.onLine) {
    set({ sync: { ...state.sync, state: 'offline', pending: pendingCount() } })
    return
  }
  syncing = (async () => {
    const t0 = Date.now()
    const { delta } = changesSince(state.doc, meta.lastSyncStart || 0)
    set({ sync: { ...state.sync, state: 'syncing', error: null } })
    try {
      const res = await api('/api/sync', { method: 'POST', body: { delta } })
      meta = { ...meta, lastSyncStart: t0 - 1 }
      const doc = mergeDocs(state.doc, res.doc)
      set({ doc, sync: { state: 'idle', lastAt: Date.now(), error: null, pending: pendingCount(doc) } })
      applyTheme(doc.prefs?.theme)
      await persistNow()
    } catch (err) {
      set({
        sync: {
          ...state.sync,
          state: err.offline ? 'offline' : 'error',
          error: err.offline ? null : err.message,
          pending: pendingCount(),
        },
      })
      if (!force) return
      throw err
    } finally {
      syncing = null
      if (queued) {
        queued = false
        syncSoon()
      }
    }
  })()
  return syncing
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

function commit(doc) {
  set({ doc, sync: { ...state.sync, pending: pendingCount(doc) } })
  // Write through to device storage right away so nothing is lost if the app is closed.
  persistNow()
  syncSoon()
}

/** Last-chance flush when the page is hidden or closed. */
function flushOnHide() {
  if (!state.user) return
  persistNow()
  const { delta, count } = changesSince(state.doc, meta.lastSyncStart || 0)
  if (count && navigator.onLine && navigator.sendBeacon) {
    try {
      navigator.sendBeacon('/api/sync', new Blob([JSON.stringify({ delta })], { type: 'application/json' }))
    } catch {
      /* the next sync picks it up */
    }
  }
}

export function setSection(key, patch) {
  const doc = { ...state.doc, [key]: { ...state.doc[key], ...patch, updatedAt: Date.now() } }
  commit(doc)
  if (key === 'prefs' && patch.theme) applyTheme(patch.theme)
}

export function putRecord(collection, record) {
  const id = record.id || newId()
  const now = Date.now()
  const prev = state.doc[collection]?.[id]
  const next = { ...prev, ...record, id, createdAt: prev?.createdAt || record.createdAt || now, updatedAt: now }
  commit({ ...state.doc, [collection]: { ...state.doc[collection], [id]: next } })
  return next
}

export function removeRecord(collection, id) {
  const now = Date.now()
  commit({ ...state.doc, [collection]: { ...state.doc[collection], [id]: { id, deleted: true, updatedAt: now } } })
}

export function records(collection) {
  return live(state.doc[collection])
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export function applyTheme(theme = 'system') {
  if (typeof document === 'undefined') return
  const t = ['light', 'dark'].includes(theme) ? theme : 'system'
  if (t === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem('hx:theme', t)
  } catch {
    /* ignore */
  }
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B0D10' : '#0E1116')
}

/* ------------------------------------------------------------------ */
/* Messages badge                                                      */
/* ------------------------------------------------------------------ */

export function setUnread(unread) {
  if (unread !== state.unread) set({ unread })
}
