'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Megaphone, Inbox, LifeBuoy, ChevronRight, Plus, Trash2, WifiOff, Search } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Transcript, Composer } from '@/components/Chat'
import { Button, Card, Confirm, Empty, Input, Pill, Segmented, Select, Sheet, Spinner, Textarea, cx, toast } from '@/components/ui'
import { useApp, setUnread } from '@/lib/client/store'
import { api } from '@/lib/client/api'
import { fmtDate, relTime } from '@/lib/client/format'

export default function MessagesPage() {
  const { user } = useApp()
  const staff = user?.role === 'staff'
  const [tab, setTab] = useState(staff ? 'inbox' : 'support')
  const options = [
    { value: 'support', label: 'Support' },
    { value: 'bulletins', label: 'Bulletins' },
    ...(staff ? [{ value: 'inbox', label: 'Inbox' }] : []),
  ]
  return (
    <div className="flex h-[calc(100dvh-64px-env(safe-area-inset-bottom))] flex-col">
      <PageHeader title="Messages" eyebrow={staff ? 'HayesX staff' : 'HayesX support'} className="shrink-0">
        <Segmented label="Messages view" value={tab} onChange={setTab} options={options} />
      </PageHeader>
      {tab === 'support' && <SupportThread />}
      {tab === 'bulletins' && <Bulletins staff={staff} />}
      {tab === 'inbox' && staff && <StaffInbox />}
    </div>
  )
}

function cacheKey(uid) {
  return `hx:thread:${uid}`
}

function SupportThread() {
  const { user, online } = useApp()
  const [thread, setThread] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(cacheKey(user.uid)) || 'null')
    } catch {
      return null
    }
  })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await api('/api/messages')
      setThread(res.thread)
      setError('')
      try {
        localStorage.setItem(cacheKey(user.uid), JSON.stringify(res.thread))
      } catch {
        /* ignore */
      }
      if (res.unread > 0) {
        await api('/api/messages/read', { method: 'POST' })
      }
      setUnread(0)
    } catch (err) {
      setError(err.offline ? 'offline' : err.message)
    }
  }, [user.uid])

  useEffect(() => {
    load()
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 10_000)
    return () => clearInterval(id)
  }, [load])

  async function send({ text, attachments }) {
    const res = await api('/api/messages', {
      method: 'POST',
      body: { text, attachments: attachments.map((a) => ({ dataUrl: a.dataUrl, width: a.width, height: a.height })) },
    })
    setThread(res.thread)
    try {
      localStorage.setItem(cacheKey(user.uid), JSON.stringify(res.thread))
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-carbon text-on-carbon">
              <LifeBuoy className="size-5" aria-hidden />
            </span>
            <div className="text-sm">
              <div className="font-semibold text-ink">HayesX support</div>
              <p className="text-ink-2">Questions about your HayesX-250, maintenance or a discrepancy? Send a message and photos. The HayesX team replies here.</p>
            </div>
          </div>
          {!thread && !error ? (
            <div className="grid place-items-center py-16">
              <Spinner />
            </div>
          ) : (
            <Transcript thread={thread} me="pilot" attachmentUid={user.uid} emptyText="No messages yet. Say hello to the HayesX team." />
          )}
          {error && error !== 'offline' && <p className="py-2 text-center text-sm text-warning">{error}</p>}
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl shrink-0">
        {!online && (
          <p className="flex items-center justify-center gap-2 border-t border-line bg-caution-soft px-4 py-2 text-xs font-semibold text-caution">
            <WifiOff className="size-3.5" aria-hidden /> Messages need a connection. You can read cached messages offline.
          </p>
        )}
        <Composer onSend={send} placeholder="Message HayesX support" disabled={!online} />
      </div>
    </>
  )
}

const LEVELS = {
  info: { tone: 'accent', label: 'Info' },
  advisory: { tone: 'caution', label: 'Advisory' },
  mandatory: { tone: 'warning', label: 'Mandatory' },
}

function Bulletins({ staff }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [compose, setCompose] = useState(false)
  const [remove, setRemove] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await api('/api/bulletins')
      setList(res.bulletins)
      setError('')
      try {
        localStorage.setItem('hx:bulletins', JSON.stringify(res.bulletins))
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(err.message)
      try {
        setList((l) => l || JSON.parse(localStorage.getItem('hx:bulletins') || '[]'))
      } catch {
        setList((l) => l || [])
      }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Page>
        {staff && (
          <Button full variant="carbon" onClick={() => setCompose(true)} className="mb-4">
            <Plus className="size-4" aria-hidden /> Publish a bulletin
          </Button>
        )}
        {error && <p className="mb-3 text-center text-sm text-muted">{error}</p>}
        {!list ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <Empty icon={Megaphone} title="No bulletins">
            Service bulletins and announcements from HayesX appear here.
          </Empty>
        ) : (
          <div className="space-y-3">
            {list.map((b) => (
              <Card key={b.id} as="article" className={cx('p-4', b.level === 'mandatory' && 'border-warning/40')}>
                <div className="flex items-center gap-2">
                  <Pill tone={LEVELS[b.level]?.tone || 'accent'}>{LEVELS[b.level]?.label || 'Info'}</Pill>
                  <span className="text-xs text-muted">
                    {fmtDate(b.at)} · {b.author}
                  </span>
                  {staff && (
                    <button onClick={() => setRemove(b)} aria-label={`Delete bulletin ${b.title}`} className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface-2">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <h3 className="hx-display mt-2 text-xl uppercase leading-tight">{b.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-[15px] text-ink-2">{b.body}</p>
              </Card>
            ))}
          </div>
        )}
      </Page>
      {staff && <BulletinComposer open={compose} onClose={() => setCompose(false)} onPublished={load} />}
      <Confirm
        open={Boolean(remove)}
        title="Delete bulletin?"
        body={`“${remove?.title}” will be removed for all pilots.`}
        confirmLabel="Delete"
        onCancel={() => setRemove(null)}
        onConfirm={async () => {
          try {
            await api(`/api/bulletins?id=${encodeURIComponent(remove.id)}`, { method: 'DELETE' })
            toast('Bulletin deleted')
            setRemove(null)
            load()
          } catch (err) {
            toast(err.message, 'error')
          }
        }}
      />
    </div>
  )
}

function BulletinComposer({ open, onClose, onPublished }) {
  const [f, setF] = useState({ title: '', body: '', level: 'info' })
  const [busy, setBusy] = useState(false)
  async function publish() {
    setBusy(true)
    try {
      await api('/api/bulletins', { method: 'POST', body: f })
      toast('Bulletin published', 'success')
      setF({ title: '', body: '', level: 'info' })
      onClose()
      onPublished()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New bulletin"
      footer={
        <Button full size="lg" onClick={publish} loading={busy} disabled={!f.title.trim() || !f.body.trim()}>
          Publish to all pilots
        </Button>
      }
    >
      <div className="space-y-4 pt-1">
        <Select label="Level" value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })}>
          <option value="info">Info</option>
          <option value="advisory">Advisory</option>
          <option value="mandatory">Mandatory</option>
        </Select>
        <Input label="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} data-autofocus />
        <Textarea label="Message" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} rows={6} />
      </div>
    </Sheet>
  )
}

function StaffInbox() {
  const [threads, setThreads] = useState(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [finding, setFinding] = useState(false)
  const { user } = useApp()
  const router = useRouter()

  const load = useCallback(async () => {
    try {
      const res = await api('/api/support/threads')
      setThreads(res.threads.filter((t) => t.uid !== user.uid))
      setError('')
    } catch (err) {
      setError(err.message)
      setThreads((t) => t || [])
    }
  }, [user.uid])

  useEffect(() => {
    load()
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 15_000)
    return () => clearInterval(id)
  }, [load])

  async function find(e) {
    e.preventDefault()
    setFinding(true)
    try {
      const res = await api(`/api/support/pilots?email=${encodeURIComponent(email.trim())}`)
      router.push(`/messages/staff?uid=${encodeURIComponent(res.pilot.uid)}`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setFinding(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Page>
        <form onSubmit={find} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Find pilot by email" aria-label="Find pilot by email" className="hx-input !pl-10" />
          </div>
          <Button type="submit" variant="secondary" loading={finding} disabled={!email.trim()}>
            Open
          </Button>
        </form>
        {error && <p className="mt-3 text-center text-sm text-warning">{error}</p>}
        {!threads ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : threads.length === 0 ? (
          <Empty icon={Inbox} title="Inbox is empty">
            Conversations from pilots appear here.
          </Empty>
        ) : (
          <Card className="mt-4 divide-y divide-line overflow-hidden">
            {threads.map((t) => (
              <Link key={t.uid} href={`/messages/staff?uid=${encodeURIComponent(t.uid)}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 font-display font-bold">{(t.name || '?').slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cx('truncate', t.unreadForStaff ? 'font-bold' : 'font-semibold')}>{t.name || 'Pilot'}</span>
                    <span className="shrink-0 text-xs text-muted">{t.lastAt ? relTime(t.lastAt) : ''}</span>
                  </div>
                  <div className={cx('truncate text-sm', t.unreadForStaff ? 'text-ink' : 'text-muted')}>
                    {t.lastFrom === 'staff' ? 'You: ' : ''}
                    {t.preview}
                  </div>
                </div>
                {t.unreadForStaff > 0 && <span className="min-w-6 rounded-full bg-warning px-1.5 text-center text-xs font-bold leading-6 text-white">{t.unreadForStaff}</span>}
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            ))}
          </Card>
        )}
      </Page>
    </div>
  )
}
