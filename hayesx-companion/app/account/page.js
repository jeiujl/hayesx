'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plane,
  UserRound,
  Palette,
  RefreshCw,
  Download,
  KeyRound,
  ShieldCheck,
  LogOut,
  Trash2,
  ChevronRight,
  Info,
  CloudOff,
  CloudCheck,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Card, Confirm, Input, Pill, SectionTitle, Segmented, Sheet, cx, toast } from '@/components/ui'
import { useApp, setSection, syncNow, signOut, forgetLocalAccount, setUser } from '@/lib/client/store'
import { useLogbook } from '@/lib/client/selectors'
import { api } from '@/lib/client/api'
import { downloadFile, logbookCsv } from '@/lib/client/download'
import { initials, relTime, toDateInput } from '@/lib/client/format'
import { BRAND } from '@/lib/brand'

const MAX_PILOT_WEIGHT = 100

export default function AccountPage() {
  const { user, doc, sync, online } = useApp()
  const entries = useLogbook()
  const [sheet, setSheet] = useState(null)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const profile = doc.profile || {}
  const weight = Number(profile.weightKg)

  async function doSync() {
    try {
      await syncNow({ force: true })
      toast('Synced', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  function exportAll() {
    const data = { exportedAt: new Date().toISOString(), account: { name: user.name, email: user.email }, ...doc }
    downloadFile(`hayesx-data-${toDateInput()}.json`, JSON.stringify(data, null, 2), 'application/json')
    toast('Data exported', 'success')
  }

  return (
    <>
      <PageHeader title="Account" eyebrow={user.email} />
      <Page>
        <Card className="flex items-center gap-4 p-4">
          <span className="hx-display grid size-14 shrink-0 place-items-center rounded-2xl bg-carbon text-2xl text-on-carbon">{initials(profile.name || user.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold">{profile.name || user.name}</div>
            <div className="truncate text-sm text-muted">{user.email}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Pill tone={user.role === 'staff' ? 'carbon' : 'accent'}>{user.role === 'staff' ? 'HayesX staff' : 'Pilot'}</Pill>
              {profile.certificate && <Pill>{profile.certificate}</Pill>}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSheet('profile')}>
            Edit
          </Button>
        </Card>
        {weight > MAX_PILOT_WEIGHT && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-warning-soft px-3 py-2 text-sm font-semibold text-warning">
            <AlertTriangle className="size-4 shrink-0" aria-hidden /> Your weight is above the {MAX_PILOT_WEIGHT} kg maximum pilot weight (FM 2.2).
          </p>
        )}

        <SectionTitle>Aircraft</SectionTitle>
        <Link href="/account/aircraft" className="hx-card flex items-center gap-3 p-4 hover:bg-surface-2">
          <Plane className="size-5 text-muted" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{doc.aircraft?.description || 'HayesX-250'}</div>
            <div className="truncate text-sm text-muted">
              {doc.aircraft?.serialNumber ? `S/N ${doc.aircraft.serialNumber}` : 'Serial number not set'} · {doc.aircraft?.category}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted" aria-hidden />
        </Link>

        <SectionTitle>Appearance</SectionTitle>
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-2">
            <Palette className="size-4" aria-hidden /> Theme
          </div>
          <Segmented
            label="Theme"
            value={doc.prefs?.theme || 'system'}
            onChange={(theme) => setSection('prefs', { theme })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
          <p className="mt-2 text-xs text-muted">Light is easiest to read in direct sunlight.</p>
        </Card>

        <SectionTitle>Sync & data</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            {sync.state === 'offline' || !online ? (
              <CloudOff className="size-5 text-caution" aria-hidden />
            ) : sync.state === 'error' ? (
              <AlertTriangle className="size-5 text-warning" aria-hidden />
            ) : (
              <CloudCheck className="size-5 text-go" aria-hidden />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <div className="font-semibold">
                {sync.state === 'syncing'
                  ? 'Syncing…'
                  : !online || sync.state === 'offline'
                    ? 'Offline'
                    : sync.state === 'error'
                      ? 'Sync problem'
                      : sync.pending
                        ? 'Changes waiting to sync'
                        : 'Synced to your account'}
              </div>
              <div className="text-muted">
                {sync.error ? sync.error : sync.lastAt ? `Last synced ${relTime(sync.lastAt)}` : 'Not synced yet'}
                {sync.pending ? ` · ${sync.pending} change${sync.pending === 1 ? '' : 's'} waiting` : ''}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={doSync} loading={sync.state === 'syncing'} disabled={!online}>
              <RefreshCw className="size-4" aria-hidden /> Sync
            </Button>
          </div>
          <Row
            Icon={Download}
            label="Export logbook (CSV)"
            onClick={() => {
              if (!entries.length) return toast('No logbook entries yet', 'error')
              downloadFile(`hayesx-logbook-${toDateInput()}.csv`, logbookCsv(entries), 'text/csv;charset=utf-8')
            }}
          />
          <Row Icon={Download} label="Export all my data (JSON)" onClick={exportAll} />
        </Card>

        <SectionTitle>Security</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          <Row Icon={KeyRound} label="Change password" onClick={() => setSheet('password')} />
          <Row Icon={LogOut} label="Sign out" onClick={() => setConfirmSignOut(true)} />
        </Card>

        <SectionTitle>HayesX team</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          {user.role === 'staff' ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 text-sm">
                <ShieldCheck className="size-5 text-go" aria-hidden />
                <span className="flex-1">Staff access is on. The Messages tab shows the support inbox and bulletin publishing.</span>
              </div>
              <Row
                Icon={ShieldCheck}
                label="Turn off staff access"
                onClick={async () => {
                  try {
                    const res = await api('/api/auth/staff', { method: 'DELETE' })
                    setUser(res.user)
                    toast('Staff access turned off')
                  } catch (err) {
                    toast(err.message, 'error')
                  }
                }}
              />
            </>
          ) : (
            <Row Icon={ShieldCheck} label="HayesX staff access" hint="For HayesX employees" onClick={() => setSheet('staff')} />
          )}
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card className="space-y-2 p-4 text-sm text-ink-2">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Info className="size-4" aria-hidden /> {BRAND.appName} for the {BRAND.product}
          </div>
          <p>
            Checklists and manual content are transcribed from the HayesX-250 Flight Manual (HayesX-250-FM-001, Rev A) and the HayesX-250 Maintenance Manual. The
            printed manuals remain the controlling documents.
          </p>
          <a href={BRAND.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent">
            hayesx.net <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <p className="text-xs text-muted">
            {BRAND.company} · {BRAND.location} · Version {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
          </p>
        </Card>

        <button onClick={() => setSheet('delete')} className="mx-auto mt-8 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-warning hover:bg-warning-soft">
          <Trash2 className="size-4" aria-hidden /> Delete account
        </button>
      </Page>

      <ProfileSheet open={sheet === 'profile'} onClose={() => setSheet(null)} />
      <PasswordSheet open={sheet === 'password'} onClose={() => setSheet(null)} />
      <StaffSheet open={sheet === 'staff'} onClose={() => setSheet(null)} />
      <DeleteSheet open={sheet === 'delete'} onClose={() => setSheet(null)} />
      <Confirm
        open={confirmSignOut}
        title="Sign out?"
        body={sync.pending ? `${sync.pending} change(s) haven’t synced yet. Signing out now will try to sync first; unsynced changes on this device will be lost if it fails.` : 'Your data stays in your account. Sign in again on any device.'}
        confirmLabel="Sign out"
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={async () => {
          setConfirmSignOut(false)
          await signOut()
        }}
      />
    </>
  )
}

function Row({ Icon, label, hint, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2">
      <Icon className="size-5 text-muted" aria-hidden />
      <span className="flex-1 font-semibold">{label}</span>
      {hint && <span className="text-sm text-muted">{hint}</span>}
      <ChevronRight className="size-4 text-muted" aria-hidden />
    </button>
  )
}

function useFormState(open, init) {
  const [state, setState] = useState(init)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setState(init())
  }
  return [state, setState]
}

function ProfileSheet({ open, onClose }) {
  const { doc, user } = useApp()
  const [f, setF] = useFormState(open, () => ({
    name: doc.profile?.name || user.name || '',
    phone: doc.profile?.phone || '',
    certificate: doc.profile?.certificate || '',
    weightKg: doc.profile?.weightKg ?? '',
  }))
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  function save() {
    if (!f.name.trim()) return setErr('Enter your name.')
    const w = f.weightKg === '' ? '' : Number(f.weightKg)
    if (w !== '' && (!Number.isFinite(w) || w <= 0 || w > 300)) return setErr('Enter your weight in kg.')
    setSection('profile', { name: f.name.trim(), phone: f.phone.trim(), certificate: f.certificate.trim(), weightKg: w })
    toast('Profile saved', 'success')
    setErr('')
    onClose()
  }
  const w = Number(f.weightKg)
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Pilot profile"
      footer={
        <Button full size="lg" onClick={save}>
          Save
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Input label="Full name" value={f.name} onChange={set('name')} autoComplete="name" hint="Used as the default pilot in new logbook entries." data-autofocus />
        <Input label="Phone" optional type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
        <Input label="Pilot certificate / ID" optional value={f.certificate} onChange={set('certificate')} placeholder="e.g. Part 103 training cert." />
        <Input
          label="Pilot weight (kg)"
          optional
          type="number"
          inputMode="decimal"
          value={f.weightKg}
          onChange={set('weightKg')}
          hint={w > MAX_PILOT_WEIGHT ? undefined : `Maximum pilot weight is ${MAX_PILOT_WEIGHT} kg (FM 2.2).`}
          error={w > MAX_PILOT_WEIGHT ? `Above the ${MAX_PILOT_WEIGHT} kg maximum pilot weight.` : undefined}
        />
        {err && <p className="text-sm text-warning">{err}</p>}
      </div>
    </Sheet>
  )
}

function PasswordSheet({ open, onClose }) {
  const [f, setF] = useFormState(open, () => ({ current: '', next: '', confirm: '' }))
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function save() {
    if (f.next.length < 8) return setErr('New password must be at least 8 characters.')
    if (f.next !== f.confirm) return setErr('New passwords don’t match.')
    setBusy(true)
    try {
      await api('/api/auth/password', { method: 'POST', body: { current: f.current, next: f.next } })
      toast('Password changed. Other devices were signed out.', 'success')
      setErr('')
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Change password"
      footer={
        <Button full size="lg" onClick={save} loading={busy} disabled={!f.current || !f.next}>
          Change password
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Input label="Current password" type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} data-autofocus />
        <Input label="New password" type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} hint="At least 8 characters." />
        <Input label="Confirm new password" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
        {err && (
          <p role="alert" className="text-sm text-warning">
            {err}
          </p>
        )}
      </div>
    </Sheet>
  )
}

function StaffSheet({ open, onClose }) {
  const [code, setCode] = useFormState(open, () => '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit() {
    setBusy(true)
    try {
      const res = await api('/api/auth/staff', { method: 'POST', body: { code } })
      setUser(res.user)
      toast('Staff access on', 'success')
      setErr('')
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="HayesX staff access"
      footer={
        <Button full size="lg" onClick={submit} loading={busy} disabled={!code.trim()}>
          Unlock
        </Button>
      }
    >
      <p className="text-sm text-ink-2">HayesX employees can unlock the support inbox, reply to pilots, and publish bulletins. Enter the staff access code issued by HayesX.</p>
      <Input className="mt-4" label="Staff access code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" error={err || undefined} data-autofocus />
    </Sheet>
  )
}

function DeleteSheet({ open, onClose }) {
  const [password, setPassword] = useFormState(open, () => '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function del() {
    setBusy(true)
    try {
      await api('/api/auth/account', { method: 'DELETE', body: { password } })
      await forgetLocalAccount()
      toast('Account deleted')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Delete account"
      footer={
        <Button full size="lg" variant="danger" onClick={del} loading={busy} disabled={!password}>
          Permanently delete
        </Button>
      }
    >
      <p className={cx('rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning')}>
        This permanently deletes your account, logbook, checklists, maintenance records and messages. Export your data first if you need a copy. This can’t be undone.
      </p>
      <Input className="mt-4" label="Enter your password to confirm" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={err || undefined} />
    </Sheet>
  )
}
