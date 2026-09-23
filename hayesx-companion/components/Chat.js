'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Send, X, ClipboardCheck, Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/client/image'
import { fmtTime, fmtDate } from '@/lib/client/format'
import { Sheet, cx, toast } from './ui'

/**
 * Chat transcript + composer shared by the pilot view and the HayesX staff view.
 * `me` is the side the current viewer is on: 'pilot' or 'staff'.
 */
export function Transcript({ thread, me, attachmentUid, emptyText }) {
  const endRef = useRef(null)
  const [zoom, setZoom] = useState(null)
  const count = thread?.messages?.length || 0
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [count])

  if (!count) return <div className="px-6 py-14 text-center text-sm text-muted">{emptyText}</div>

  let lastDay = ''
  return (
    <div className="space-y-2 py-2">
      {thread.messages.map((m) => {
        const mine = m.from === me
        const day = fmtDate(m.at, { weekday: 'short' })
        const showDay = day !== lastDay
        lastDay = day
        return (
          <div key={m.id}>
            {showDay && <div className="hx-label my-4 text-center !text-[0.66rem]">{day}</div>}
            <div className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cx('max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-card', mine ? 'rounded-br-md bg-accent text-accent-ink' : 'rounded-bl-md border border-line bg-surface text-ink')}>
                {!mine && <div className={cx('mb-0.5 text-xs font-bold', m.from === 'staff' ? 'text-accent' : 'text-ink-2')}>{m.from === 'staff' ? `${m.authorName} · HayesX` : m.authorName}</div>}
                {m.meta?.kind === 'checklist-report' && (
                  <div className={cx('mb-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', mine ? 'bg-white/20' : 'bg-warning-soft text-warning')}>
                    <ClipboardCheck className="size-3" aria-hidden /> Checklist report
                  </div>
                )}
                {m.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{m.text}</p>}
                {m.attachments?.length > 0 && (
                  <div className={cx('mt-1.5 grid gap-1.5', m.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                    {m.attachments.map((a) => {
                      const src = `/api/messages/attachment?uid=${encodeURIComponent(attachmentUid)}&id=${encodeURIComponent(a.id)}`
                      return (
                        <button key={a.id} onClick={() => setZoom(src)} className="overflow-hidden rounded-xl bg-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Attached photo" width={a.width || 400} height={a.height || 300} loading="lazy" className="h-40 w-full object-cover" />
                        </button>
                      )
                    })}
                  </div>
                )}
                <div className={cx('mt-1 text-right text-[11px]', mine ? 'text-white/75' : 'text-muted')}>{fmtTime(m.at)}</div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={endRef} />
      <Sheet open={Boolean(zoom)} onClose={() => setZoom(null)} title="Photo" size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {zoom && <img src={zoom} alt="Attached photo, full size" className="w-full rounded-xl" />}
      </Sheet>
    </div>
  )
}

export function Composer({ onSend, placeholder = 'Message', disabled }) {
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef(null)

  async function addFiles(files) {
    const list = [...files].slice(0, 3 - photos.length)
    if (!list.length) return toast('Up to 3 photos per message', 'error')
    setProcessing(true)
    try {
      const out = []
      for (const f of list) out.push(await compressImage(f))
      setPhotos((p) => [...p, ...out].slice(0, 3))
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (busy || (!text.trim() && !photos.length)) return
    setBusy(true)
    try {
      await onSend({ text: text.trim(), attachments: photos })
      setText('')
      setPhotos([])
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-line bg-surface/95 px-3 py-2 backdrop-blur-md">
      {photos.length > 0 && (
        <div className="mb-2 flex gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt={`Photo ${i + 1} to send`} className="size-16 rounded-lg object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-carbon text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} data-testid="photo-input" />
        <button
          type="button"
          aria-label="Attach photo"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || photos.length >= 3 || processing}
          className="grid size-11 shrink-0 place-items-center rounded-xl text-ink-2 hover:bg-surface-2 disabled:opacity-40"
        >
          {processing ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia('(pointer: fine)').matches) submit(e)
          }}
          rows={1}
          placeholder={placeholder}
          aria-label="Message"
          disabled={disabled}
          className="hx-input max-h-36 min-h-11 flex-1 resize-none !py-2.5"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={disabled || busy || (!text.trim() && !photos.length)}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink disabled:opacity-40"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </div>
    </form>
  )
}
