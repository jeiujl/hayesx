'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { KeyRound, Copy } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Transcript, Composer } from '@/components/Chat'
import { Button, Confirm, Empty, IconButton, Sheet, Spinner, toast } from '@/components/ui'
import { useApp } from '@/lib/client/store'
import { api } from '@/lib/client/api'

export default function StaffThreadPage() {
  return (
    <Suspense fallback={null}>
      <StaffThread />
    </Suspense>
  )
}

function StaffThread() {
  const uid = useSearchParams().get('uid')
  const { user } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [temp, setTemp] = useState(null)
  const [resetting, setResetting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api(`/api/support/threads/${encodeURIComponent(uid)}`)
      setData(res)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [uid])

  useEffect(() => {
    if (user?.role !== 'staff') return
    load()
    const id = setInterval(() => document.visibilityState === 'visible' && load(), 10_000)
    return () => clearInterval(id)
  }, [load, user?.role])

  if (user?.role !== 'staff') {
    return (
      <>
        <PageHeader title="Conversation" back="/messages" />
        <Empty title="Staff access required">Unlock HayesX staff access from Account.</Empty>
      </>
    )
  }

  async function send({ text, attachments }) {
    const res = await api(`/api/support/threads/${encodeURIComponent(uid)}`, {
      method: 'POST',
      body: { text, attachments: attachments.map((a) => ({ dataUrl: a.dataUrl, width: a.width, height: a.height })) },
    })
    setData((d) => ({ ...d, thread: res.thread }))
  }

  async function resetPassword() {
    setResetting(true)
    try {
      const res = await api(`/api/support/pilots/${encodeURIComponent(uid)}/password`, { method: 'POST' })
      setTemp(res.temporaryPassword)
      setConfirmReset(false)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-64px-env(safe-area-inset-bottom))] flex-col">
      <PageHeader
        title={data?.pilot?.name || 'Conversation'}
        eyebrow={data?.pilot?.email || 'Pilot'}
        back="/messages"
        className="shrink-0"
        actions={
          data && (
            <IconButton label="Issue temporary password" onClick={() => setConfirmReset(true)}>
              <KeyRound className="size-5" />
            </IconButton>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4">
          {error ? (
            <p className="py-10 text-center text-sm text-warning">{error}</p>
          ) : !data ? (
            <div className="grid place-items-center py-16">
              <Spinner />
            </div>
          ) : (
            <Transcript thread={data.thread} me="staff" attachmentUid={uid} emptyText="No messages yet. Start the conversation." />
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl shrink-0">
        <Composer onSend={send} placeholder={`Reply to ${data?.pilot?.name || 'pilot'}`} disabled={!data} />
      </div>

      <Confirm
        open={confirmReset}
        title="Issue a temporary password?"
        body="Only do this after verifying the pilot’s identity. Their current password stops working and they are signed out on every device."
        confirmLabel="Issue password"
        loading={resetting}
        onCancel={() => setConfirmReset(false)}
        onConfirm={resetPassword}
      />
      <Sheet
        open={Boolean(temp)}
        onClose={() => setTemp(null)}
        title="Temporary password"
        footer={
          <Button
            full
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(temp)
                toast('Copied', 'success')
              } catch {
                toast('Copy failed. Select the text instead.', 'error')
              }
            }}
          >
            <Copy className="size-4" aria-hidden /> Copy
          </Button>
        }
      >
        <p className="text-sm text-ink-2">Give this to {data?.pilot?.name} directly (not in this chat). It is shown only once. Ask them to change it in Account → Security.</p>
        <div className="hx-mono mt-4 select-all rounded-2xl bg-surface-2 px-4 py-5 text-center text-2xl font-semibold tracking-wider">{temp}</div>
      </Sheet>
    </div>
  )
}
