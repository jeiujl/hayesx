'use client'

import { useState } from 'react'
import { ShieldCheck, NotebookPen, BookOpenText, WifiOff } from 'lucide-react'
import { signIn, signUp } from '@/lib/client/store'
import { BRAND } from '@/lib/brand'
import Wordmark from './Wordmark'
import { Button, Input, Segmented, toast } from './ui'

export default function AuthScreen({ offline }) {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password)
        toast('Welcome back', 'success')
      } else {
        await signUp(form.name, form.email, form.password)
        toast('Account created', 'success')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh bg-carbon text-on-carbon">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 hx-safe-top">
        <div className="pt-10">
          <Wordmark size="lg" tone="light" />
          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/50 font-display">{BRAND.product} pilot app</p>
        </div>

        <div className="relative my-8 h-40" aria-hidden>
          <div className="hx-mask-aircraft absolute inset-0 bg-white/85" />
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-sand/60 to-transparent" />
        </div>

        <h1 className="hx-display text-4xl uppercase leading-[0.95]">
          Preflight. Fly.
          <br />
          <span className="text-accent">Log it.</span>
        </h1>
        <ul className="mt-5 space-y-2.5 text-sm text-white/75">
          <li className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-accent" aria-hidden /> Interactive preflight from the Flight Manual
          </li>
          <li className="flex items-center gap-3">
            <NotebookPen className="size-4 text-accent" aria-hidden /> Signed digital logbook with totals
          </li>
          <li className="flex items-center gap-3">
            <BookOpenText className="size-4 text-accent" aria-hidden /> Flight & maintenance manuals, offline
          </li>
        </ul>

        <form onSubmit={submit} className="mt-8 rounded-3xl bg-surface p-5 text-ink shadow-2xl" noValidate>
          <Segmented
            label="Account"
            value={mode}
            onChange={(m) => {
              setMode(m)
              setError('')
            }}
            options={[
              { value: 'signin', label: 'Sign in' },
              { value: 'signup', label: 'Create account' },
            ]}
          />
          <div className="mt-4 space-y-3">
            {mode === 'signup' && (
              <Input label="Full name" autoComplete="name" value={form.name} onChange={update('name')} required placeholder="Pilot name" />
            )}
            <Input label="Email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={update('email')} required placeholder="you@example.com" />
            <Input
              label="Password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
              hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
            />
          </div>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
              {error}
            </p>
          )}
          {offline && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-caution-soft px-3 py-2 text-sm text-caution">
              <WifiOff className="size-4" aria-hidden /> You’re offline. Connect once to sign in; after that the app works offline.
            </p>
          )}
          <Button type="submit" full size="lg" className="mt-4" loading={busy} disabled={offline}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          {mode === 'signin' && (
            <p className="mt-3 text-center text-xs text-muted">Forgot your password? Contact HayesX support. After verifying your identity they can issue a temporary password.</p>
          )}
        </form>

        <p className="mt-auto py-6 text-center text-xs text-white/40">
          {BRAND.company} · {BRAND.location}
        </p>
      </div>
    </div>
  )
}
