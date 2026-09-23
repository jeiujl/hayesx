'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cx } from './ui'

export default function PageHeader({ title, eyebrow, back, actions, children, className }) {
  const router = useRouter()
  return (
    <header className={cx('hx-safe-top sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md hx-no-print', className)}>
      <div className="mx-auto flex max-w-2xl items-center gap-1 px-2 pt-2 pb-2 min-h-[60px]">
        {back &&
          (typeof back === 'string' ? (
            <Link href={back} aria-label="Back" className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-2">
              <ChevronLeft className="size-6" />
            </Link>
          ) : (
            <button aria-label="Back" onClick={() => router.back()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-surface-2">
              <ChevronLeft className="size-6" />
            </button>
          ))}
        <div className={cx('min-w-0 flex-1', !back && 'pl-3')}>
          {eyebrow && <div className="hx-label !text-[0.68rem] leading-none mb-0.5 truncate">{eyebrow}</div>}
          <h1 className="hx-display truncate text-[1.65rem] leading-tight uppercase tracking-wide">{title}</h1>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1 pr-1">{actions}</div>}
      </div>
      {children && <div className="mx-auto max-w-2xl px-4 pb-3">{children}</div>}
    </header>
  )
}

export function Page({ children, className }) {
  return <div className={cx('mx-auto w-full max-w-2xl px-4 pb-8 pt-4', className)}>{children}</div>
}
