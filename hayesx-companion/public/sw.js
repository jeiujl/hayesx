/* HayesX service worker: makes the app shell, checklists and manuals available offline. */

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE = `hayesx-${VERSION}`

const FLIGHT_CHAPTERS = ['1', '2', '3', '4', '5']
const MAINT_CHAPTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', 'A', 'B']

const ROUTES = [
  '/',
  '/checklist',
  '/checklist/run',
  '/checklist/record',
  '/checklist/history',
  '/logbook',
  '/logbook/new',
  '/logbook/entry',
  '/manuals',
  '/manuals/emergency',
  '/manuals/search',
  '/manuals/maintenance-log',
  '/manuals/flight',
  '/manuals/maintenance',
  ...FLIGHT_CHAPTERS.map((c) => `/manuals/flight/${c}`),
  ...MAINT_CHAPTERS.map((c) => `/manuals/maintenance/${c}`),
  '/messages',
  '/messages/staff',
  '/account',
  '/account/aircraft',
]

const ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/img/hx250-profile-mask.webp',
  '/img/hx250-front.webp',
  '/img/hx250-side.webp',
  '/img/hx250-top.webp',
  '/img/torque-seal.webp',
  '/img/pfd-battery-indicator.webp',
  '/img/pfd-virtual-sticks.webp',
  '/img/pfd-display.webp',
]

async function precache() {
  const cache = await caches.open(CACHE)
  await Promise.allSettled(ASSETS.map((u) => cache.add(u)))
  const staticUrls = new Set()
  await Promise.allSettled(
    ROUTES.map(async (route) => {
      const res = await fetch(route, { credentials: 'same-origin', cache: 'no-store' })
      if (!res.ok) return
      const html = await res.clone().text()
      await cache.put(route, res)
      // Pull every hashed build asset the page references so it renders offline.
      for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) staticUrls.add(m[0])
    })
  )
  await Promise.allSettled([...staticUrls].map((u) => cache.add(u)))
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k.startsWith('hayesx-') && k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Hashed build assets and images never change: cache first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/img/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
      )
    )
    return
  }

  // Pages and RSC payloads: network first, fall back to the cached copy offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === 'navigate' || url.searchParams.has('_rsc'))) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(async () => {
        const cache = await caches.open(CACHE)
        const hit = (await cache.match(req)) || (await cache.match(url.pathname)) || (await cache.match(req, { ignoreSearch: true }))
        if (hit) return hit
        if (req.mode === 'navigate') return (await cache.match('/checklist')) || Response.error()
        return Response.error()
      })
  )
})
