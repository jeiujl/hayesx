'use client'

import Link from 'next/link'
import { CircleCheck, CircleAlert, CircleDashed } from 'lucide-react'
import { Pill, cx } from '@/components/ui'
import { putRecord } from '@/lib/client/store'
import { CHECKLISTS, summarize } from '@/content/checklists'
import { fmtDate } from '@/lib/client/format'
import { newId } from '@/lib/shared/doc'

export function startRun(type, doc, user) {
  return putRecord('checklists', {
    id: newId('cl_'),
    type,
    status: 'in-progress',
    result: null,
    startedAt: Date.now(),
    pilot: doc.profile?.name || user?.name || '',
    serialNumber: doc.aircraft?.serialNumber || '',
    items: {},
  })
}

export function RunRow({ run }) {
  const list = CHECKLISTS[run.type]
  const s = list ? summarize(list, run) : null
  const tone = run.result === 'go' ? 'go' : run.result === 'no-go' ? 'warning' : 'neutral'
  const Icon = run.result === 'go' ? CircleCheck : run.result === 'no-go' ? CircleAlert : CircleDashed
  return (
    <Link href={`/checklist/record?id=${encodeURIComponent(run.id)}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
      <Icon className={cx('size-5 shrink-0', tone === 'go' ? 'text-go' : tone === 'warning' ? 'text-warning' : 'text-muted')} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{list?.title || run.type} checklist</div>
        <div className="truncate text-sm text-muted">
          {fmtDate(run.completedAt || run.startedAt)} · {run.pilot || 'Pilot'}
          {s && run.result === 'no-go' ? ` · ${s.flagged.length} discrepanc${s.flagged.length === 1 ? 'y' : 'ies'}` : ''}
        </div>
      </div>
      <Pill tone={tone}>{run.result === 'go' ? 'GO' : run.result === 'no-go' ? 'NO-GO' : run.status === 'abandoned' ? 'Cancelled' : 'Open'}</Pill>
    </Link>
  )
}
