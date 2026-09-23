'use client'

import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Card, Empty, Segmented } from '@/components/ui'
import { RunRow } from '@/components/checklist/shared'
import { useChecklistRuns } from '@/lib/client/selectors'

export default function HistoryPage() {
  const runs = useChecklistRuns()
  const [filter, setFilter] = useState('all')
  const shown = useMemo(
    () =>
      runs.filter((r) => {
        if (filter === 'go') return r.result === 'go'
        if (filter === 'no-go') return r.result === 'no-go'
        return true
      }),
    [runs, filter]
  )
  return (
    <>
      <PageHeader title="Checklist history" back="/checklist">
        <Segmented
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All (${runs.length})` },
            { value: 'go', label: 'GO' },
            { value: 'no-go', label: 'NO-GO' },
          ]}
        />
      </PageHeader>
      <Page>
        {shown.length === 0 ? (
          <Empty icon={History} title="Nothing here yet">
            Completed and cancelled checklists are listed here.
          </Empty>
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {shown.map((r) => (
              <RunRow key={r.id} run={r} />
            ))}
          </Card>
        )}
      </Page>
    </>
  )
}
