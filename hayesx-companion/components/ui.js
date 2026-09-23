'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { X, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react'

const cx = (...c) => c.filter(Boolean).join(' ')
export { cx }

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 active:brightness-95',
  carbon: 'bg-carbon text-on-carbon hover:bg-carbon-2',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-warning text-white hover:brightness-110',
  'danger-outline': 'border border-warning/50 text-warning hover:bg-warning-soft',
  go: 'bg-go text-white hover:brightness-110',
}
const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-12 px-4 text-[15px] rounded-xl gap-2',
  lg: 'h-14 px-5 text-base rounded-2xl gap-2.5',
}

export function Button({ variant = 'primary', size = 'md', className, loading, disabled, children, href, full, ...rest }) {
  const classes = cx(
    'inline-flex items-center justify-center font-semibold select-none transition disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    full && 'w-full',
    className
  )
  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function IconButton({ label, className, children, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx('inline-flex size-11 items-center justify-center rounded-xl text-ink hover:bg-surface-2 transition', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Layout bits                                                         */
/* ------------------------------------------------------------------ */

export function Card({ className, children, as: As = 'div', ...rest }) {
  return (
    <As className={cx('hx-card', className)} {...rest}>
      {children}
    </As>
  )
}

export function SectionTitle({ children, action, className }) {
  return (
    <div className={cx('flex items-end justify-between gap-3 px-1 mb-2 mt-6', className)}>
      <h2 className="hx-label">{children}</h2>
      {action}
    </div>
  )
}

const TONES = {
  neutral: 'bg-surface-2 text-ink-2',
  accent: 'bg-accent-soft text-accent',
  go: 'bg-go-soft text-go',
  caution: 'bg-caution-soft text-caution',
  warning: 'bg-warning-soft text-warning',
  carbon: 'bg-carbon text-on-carbon',
}

export function Pill({ tone = 'neutral', className, children }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', TONES[tone], className)}>
      {children}
    </span>
  )
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      {Icon && (
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
          <Icon className="size-7" aria-hidden />
        </div>
      )}
      <p className="hx-display text-xl">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ className }) {
  return <Loader2 className={cx('size-5 animate-spin text-muted', className)} aria-label="Loading" />
}

export function Stat({ label, value, sub, className }) {
  return (
    <div className={cx('min-w-0', className)}>
      <div className="hx-label !text-[0.7rem]">{label}</div>
      <div className="hx-num text-2xl font-semibold leading-tight mt-0.5 truncate">{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export function Field({ label, hint, error, children, className, htmlFor, optional }) {
  return (
    <div className={cx('block', className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-ink-2">
          <span>{label}</span>
          {optional && <span className="text-xs font-normal text-muted">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-warning" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ label, hint, error, optional, className, id, ...rest }) {
  const autoId = useId()
  const fid = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid} optional={optional} className={className}>
      <input id={fid} className="hx-input" aria-invalid={Boolean(error) || undefined} {...rest} />
    </Field>
  )
}

export function Textarea({ label, hint, error, optional, className, id, ...rest }) {
  const autoId = useId()
  const fid = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid} optional={optional} className={className}>
      <textarea id={fid} className="hx-input" aria-invalid={Boolean(error) || undefined} {...rest} />
    </Field>
  )
}

export function Select({ label, hint, error, optional, className, id, children, ...rest }) {
  const autoId = useId()
  const fid = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fid} optional={optional} className={className}>
      <select id={fid} className="hx-input appearance-none bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat pr-10" style={{ backgroundImage: CHEVRON }} {...rest}>
        {children}
      </select>
    </Field>
  )
}
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f7680' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`

export function Segmented({ value, onChange, options, className, label }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex rounded-xl bg-surface-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
            value === o.value ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bottom sheet / dialog                                               */
/* ------------------------------------------------------------------ */

export function Sheet({ open, onClose, title, children, footer, size = 'md', labelledBy }) {
  const ref = useRef(null)
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  // Keep the latest onClose without re-running the open/focus effect on every parent render
  // (parents re-render during background sync; re-running would steal focus mid-typing).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // The portal is already in the DOM when this effect runs, so focus synchronously.
    const box = ref.current
    if (box && !box.contains(document.activeElement)) {
      const target = box.querySelector('[data-autofocus]')
      if (target) target.focus()
      else box.focus()
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open])
  if (!open || !mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId}
        tabIndex={-1}
        className={cx(
          'hx-anim-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-surface shadow-2xl outline-none sm:rounded-3xl',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 id={titleId} className="hx-display text-2xl leading-tight">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="hx-safe-bottom border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

/* ------------------------------------------------------------------ */
/* Confirm                                                             */
/* ------------------------------------------------------------------ */

export function Confirm({ open, title, body, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel, loading }) {
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone} full onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="text-ink-2">{body}</div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

let toasts = []
const toastListeners = new Set()
function emitToasts() {
  for (const l of toastListeners) l()
}
export function toast(message, tone = 'info', ms = 3200) {
  const id = Math.random().toString(36).slice(2)
  toasts = [{ id, message, tone }]
  emitToasts()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emitToasts()
  }, ms)
}

export function Toaster() {
  const list = useSyncExternalStore(
    (fn) => {
      toastListeners.add(fn)
      return () => toastListeners.delete(fn)
    },
    () => toasts,
    () => toasts
  )
  const icon = { info: Info, success: CheckCircle2, error: AlertTriangle }
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[60] flex flex-col items-center gap-2 px-4">
      {list.map((t) => {
        const Icon = icon[t.tone] || Info
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={cx(
              'hx-anim-in flex max-w-md items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl',
              t.tone === 'error' ? 'bg-warning text-white' : t.tone === 'success' ? 'bg-go text-white' : 'bg-carbon text-on-carbon'
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Callout                                                             */
/* ------------------------------------------------------------------ */

const CALLOUT = {
  warning: { cls: 'border-warning/40 bg-warning-soft', ink: 'text-warning', Icon: AlertTriangle },
  caution: { cls: 'border-caution/40 bg-caution-soft', ink: 'text-caution', Icon: AlertTriangle },
  info: { cls: 'border-accent/30 bg-accent-soft', ink: 'text-accent', Icon: Info },
  note: { cls: 'border-line bg-surface-2', ink: 'text-ink-2', Icon: Info },
  go: { cls: 'border-go/40 bg-go-soft', ink: 'text-go', Icon: CheckCircle2 },
}

export function Callout({ tone = 'note', title, text, lines, children, className }) {
  const c = CALLOUT[tone] || CALLOUT.note
  return (
    <div className={cx('rounded-2xl border px-4 py-3', c.cls, className)} role={tone === 'warning' ? 'note' : undefined}>
      {title && (
        <div className={cx('flex items-center gap-2 font-display text-[0.95rem] font-bold uppercase tracking-wider', c.ink)}>
          <c.Icon className="size-4 shrink-0" aria-hidden />
          {title}
        </div>
      )}
      {text && <p className={cx('text-[15px] text-ink', title && 'mt-1')}>{text}</p>}
      {lines?.length > 0 && (
        <ul className="mt-1.5 space-y-1 text-[15px] text-ink">
          {lines.map((l) => (
            <li key={l} className="flex gap-2">
              <span className={cx('mt-2 size-1.5 shrink-0 rounded-full', tone === 'warning' ? 'bg-warning' : tone === 'caution' ? 'bg-caution' : 'bg-muted')} />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  )
}
