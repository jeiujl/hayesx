'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { CloudOff } from 'lucide-react'
import { boot, useApp, setUnread } from '@/lib/client/store'
import { api } from '@/lib/client/api'
import TabBar from './TabBar'
import AuthScreen from './AuthScreen'
import Wordmark from './Wordmark'
import { Toaster } from './ui'

export default function AppShell({ children }) {
  const { status, online, user, sync } = useApp()
  const pathname = usePathname()

  useEffect(() => {
    boot()
  }, [])

  // Screens swap in place on sign-in/out; start each at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [status])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    const v = process.env.NEXT_PUBLIC_BUILD_ID || 'dev'
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(v)}`, { scope: '/', updateViaCache: 'none' }).catch(() => {})
  }, [])

  // Keep the Messages badge fresh while the app is open.
  useEffect(() => {
    if (status !== 'ready') return
    let stop = false
    const tick = async () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return
      try {
        const res = await api('/api/messages?summary=1')
        if (!stop) setUnread(res.unread + (res.staffUnread || 0))
      } catch {
        /* offline or signed out */
      }
    }
    tick()
    const id = setInterval(tick, 45_000)
    return () => {
      stop = true
      clearInterval(id)
    }
  }, [status, user?.uid, user?.role, pathname])

  if (status === 'loading') return <Splash />
  if (status === 'signed-out') {
    return (
      <>
        <AuthScreen offline={!online} />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-dvh pb-[calc(64px+env(safe-area-inset-bottom))]">
      {!online && (
        <div role="status" className="hx-no-print sticky top-0 z-50 flex items-center justify-center gap-2 bg-caution px-4 py-1.5 text-center text-xs font-semibold text-black">
          <CloudOff className="size-3.5" aria-hidden />
          Offline. Your entries are saved on this device{sync.pending ? ` (${sync.pending} to sync)` : ''} and sync when you reconnect.
        </div>
      )}
      <main id="main">{children}</main>
      <TabBar />
      <Toaster />
    </div>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-carbon text-on-carbon">
      <div className="flex flex-col items-center gap-5">
        <Wordmark size="lg" tone="light" />
        <div className="h-0.5 w-24 overflow-hidden rounded bg-white/10">
          <div className="h-full w-1/3 animate-[hx-slide_1.1s_ease-in-out_infinite] rounded bg-accent" />
        </div>
      </div>
      <style>{`@keyframes hx-slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  )
}
