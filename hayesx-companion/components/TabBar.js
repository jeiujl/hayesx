'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardCheck, NotebookPen, BookOpenText, MessagesSquare, CircleUserRound } from 'lucide-react'
import { useApp } from '@/lib/client/store'
import { cx } from './ui'

export const TABS = [
  { href: '/checklist', label: 'Checklist', Icon: ClipboardCheck },
  { href: '/logbook', label: 'Logbook', Icon: NotebookPen },
  { href: '/manuals', label: 'Manuals', Icon: BookOpenText },
  { href: '/messages', label: 'Messages', Icon: MessagesSquare },
  { href: '/account', label: 'Account', Icon: CircleUserRound },
]

export default function TabBar() {
  const pathname = usePathname() || '/'
  const { unread } = useApp()
  return (
    <nav aria-label="Main" className="hx-no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-carbon/95 text-on-carbon backdrop-blur-md hx-safe-bottom">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/') || (href === '/checklist' && pathname === '/')
          const badge = href === '/messages' && unread > 0 ? unread : 0
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-wide transition',
                  active ? 'text-white' : 'text-white/55 hover:text-white/85'
                )}
              >
                <span className={cx('relative grid h-8 w-14 place-items-center rounded-full transition', active && 'bg-white/12')}>
                  <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                  {badge > 0 && (
                    <span className="hx-anim-pop absolute -top-0.5 right-2 min-w-[18px] rounded-full bg-warning px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                      {badge > 9 ? '9+' : badge}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
