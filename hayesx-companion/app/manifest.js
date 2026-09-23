import { BRAND } from '@/lib/brand'

export default function manifest() {
  return {
    id: '/',
    name: `${BRAND.appName} · ${BRAND.product}`,
    short_name: BRAND.appName,
    description: 'Preflight checklist, signed digital logbook, manuals and messages for HayesX-250 pilots.',
    start_url: '/checklist',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: BRAND.background,
    theme_color: BRAND.themeColor,
    categories: ['navigation', 'productivity', 'utilities'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Preflight checklist', url: '/checklist', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'New logbook entry', url: '/logbook/new', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Emergency procedures', url: '/manuals/emergency', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
