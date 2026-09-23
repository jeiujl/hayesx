'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SearchX } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { Card, Empty } from '@/components/ui'
import { searchIndex } from '@/content/manuals'

const INDEX = searchIndex()

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function snippet(text, terms) {
  const lower = text.toLowerCase()
  let pos = -1
  for (const t of terms) {
    pos = lower.indexOf(t)
    if (pos >= 0) break
  }
  const start = Math.max(0, pos - 60)
  const s = (start > 0 ? '…' : '') + text.slice(start, start + 180) + (start + 180 < text.length ? '…' : '')
  return s
}

function Highlight({ text, terms }) {
  if (!terms.length) return text
  const parts = text.split(new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi'))
  return parts.map((p, i) =>
    terms.includes(p.toLowerCase()) ? (
      <mark key={i} className="rounded bg-accent-soft px-0.5 text-accent">
        {p}
      </mark>
    ) : (
      p
    )
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  )
}

function SearchInner() {
  const params = useSearchParams()
  const router = useRouter()
  const initial = params.get('q') || ''
  const [q, setQ] = useState(initial)
  const terms = useMemo(
    () =>
      q
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1),
    [q]
  )
  const results = useMemo(() => {
    if (!terms.length) return []
    return INDEX.map((r) => {
      const title = r.title.toLowerCase()
      const text = r.text.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (!title.includes(t) && !text.includes(t) && !r.chapterTitle.toLowerCase().includes(t)) return null
        if (title.includes(t)) score += 5
        score += text.split(t).length - 1
      }
      return { ...r, score }
    })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
  }, [terms])

  return (
    <>
      <PageHeader title="Search" eyebrow="Manuals" back="/manuals">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            router.replace(`/manuals/search?q=${encodeURIComponent(q.trim())}`)
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search both manuals" aria-label="Search manuals" className="hx-input !pl-11" />
        </form>
      </PageHeader>
      <Page>
        {terms.length === 0 ? (
          <Empty icon={Search} title="Search the manuals">
            Try “wind”, “battery”, “BRS”, “500 hour” or “torque seal”.
          </Empty>
        ) : results.length === 0 ? (
          <Empty icon={SearchX} title="No matches">
            Nothing in the Flight or Maintenance Manual matches “{q}”.
          </Empty>
        ) : (
          <>
            <p className="mb-2 px-1 text-sm text-muted" aria-live="polite">
              {results.length} section{results.length === 1 ? '' : 's'}
            </p>
            <Card className="divide-y divide-line overflow-hidden">
              {results.map((r) => (
                <Link key={`${r.manual}-${r.section}`} href={r.href} className="block px-4 py-3 hover:bg-surface-2">
                  <div className="hx-label !text-[0.64rem]">
                    {r.manualTitle} · {r.chapterTitle}
                  </div>
                  <div className="mt-0.5 font-semibold">
                    <span className="hx-mono mr-1.5 text-accent">{r.section}</span>
                    <Highlight text={r.title} terms={terms} />
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-ink-2">
                    <Highlight text={snippet(r.text, terms)} terms={terms} />
                  </div>
                </Link>
              ))}
            </Card>
          </>
        )}
      </Page>
    </>
  )
}
