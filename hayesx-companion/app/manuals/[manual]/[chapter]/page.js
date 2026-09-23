import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, Siren } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import ManualBlocks from '@/components/ManualBlocks'
import { MANUALS, chapterLabel } from '@/content/manuals'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(MANUALS).flatMap((m) => m.chapters.map((c) => ({ manual: m.id, chapter: c.id })))
}

export async function generateMetadata({ params }) {
  const { manual, chapter } = await params
  const c = MANUALS[manual]?.chapters.find((x) => x.id === chapter)
  return { title: c ? `${c.title} · ${MANUALS[manual].title}` : 'Manual' }
}

export default async function ChapterPage({ params }) {
  const { manual, chapter } = await params
  const m = MANUALS[manual]
  const idx = m?.chapters.findIndex((c) => c.id === chapter) ?? -1
  if (!m || idx < 0) notFound()
  const c = m.chapters[idx]
  const prev = m.chapters[idx - 1]
  const next = m.chapters[idx + 1]

  return (
    <>
      <PageHeader title={c.title} eyebrow={`${m.title} · ${chapterLabel(m, c)}`} back={`/manuals/${m.id}`}>
        {c.sections.length > 1 && (
          <nav aria-label="Sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
            {c.sections.map((s) => (
              <a key={s.id} href={`#s-${s.id}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink-2 hover:bg-surface-2">
                <span className="hx-mono text-muted">{s.id}</span> {s.title.length > 28 ? s.title.slice(0, 26) + '…' : s.title}
              </a>
            ))}
          </nav>
        )}
      </PageHeader>
      <Page>
        {c.emergency && (
          <Link href="/manuals/emergency" className="mb-4 flex items-center gap-3 rounded-2xl bg-warning px-4 py-3 font-semibold text-white">
            <Siren className="size-5" aria-hidden />
            <span className="flex-1">Open the emergency quick reference</span>
            <ChevronRight className="size-5" aria-hidden />
          </Link>
        )}
        <div className="space-y-8">
          {c.sections.map((s) => (
            <section key={s.id} id={`s-${s.id}`} className="scroll-mt-40">
              <h2 className="mb-3 flex items-baseline gap-2.5 border-b border-line pb-2">
                <span className="hx-mono text-sm font-semibold text-accent">{s.id}</span>
                <span className="hx-display text-2xl uppercase leading-tight">{s.title}</span>
              </h2>
              <ManualBlocks blocks={s.blocks} />
            </section>
          ))}
        </div>

        <nav aria-label="Chapters" className="mt-10 grid grid-cols-2 gap-3">
          {prev ? (
            <Link href={`/manuals/${m.id}/${prev.id}`} className="hx-card flex items-center gap-2 p-3 hover:bg-surface-2">
              <ChevronLeft className="size-5 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0">
                <span className="hx-label !text-[0.64rem] block">Previous</span>
                <span className="block truncate font-semibold">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/manuals/${m.id}/${next.id}`} className="hx-card flex items-center justify-end gap-2 p-3 text-right hover:bg-surface-2">
              <span className="min-w-0">
                <span className="hx-label !text-[0.64rem] block">Next</span>
                <span className="block truncate font-semibold">{next.title}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
            </Link>
          )}
        </nav>
      </Page>
    </>
  )
}
