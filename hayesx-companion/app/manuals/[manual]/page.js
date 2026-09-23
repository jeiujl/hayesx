import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Siren, FileText } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import { MANUALS, chapterLabel } from '@/content/manuals'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(MANUALS).map((manual) => ({ manual }))
}

export async function generateMetadata({ params }) {
  const { manual } = await params
  return { title: MANUALS[manual]?.title || 'Manual' }
}

export default async function ManualToc({ params }) {
  const { manual: id } = await params
  const m = MANUALS[id]
  if (!m) notFound()
  return (
    <>
      <PageHeader title={m.title} eyebrow="HayesX-250" back="/manuals" />
      <Page>
        <div className="hx-card flex items-start gap-3 p-4">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="hx-label !text-[0.66rem]">Document</dt>
              <dd className="font-semibold">{m.docNo}</dd>
            </div>
            <div>
              <dt className="hx-label !text-[0.66rem]">Revision</dt>
              <dd className="font-semibold">{m.revision ? `${m.revision} · ${m.issued}` : m.issued}</dd>
            </div>
            <div className="col-span-2">
              <dt className="hx-label !text-[0.66rem]">Prepared by</dt>
              <dd className="font-semibold">{m.preparedBy}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label={`${m.title} contents`} className="mt-4 space-y-3">
          {m.chapters.map((c) => (
            <Link
              key={c.id}
              href={`/manuals/${m.id}/${c.id}`}
              className={`group block overflow-hidden rounded-2xl border ${c.emergency ? 'border-warning/40 bg-warning-soft' : 'border-line bg-surface'} hover:brightness-[0.98]`}
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className={`hx-num grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${c.emergency ? 'bg-warning text-white' : 'bg-carbon text-on-carbon'}`}>
                  {c.emergency ? <Siren className="size-5" aria-hidden /> : c.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="hx-label !text-[0.66rem] block">{chapterLabel(m, c)}</span>
                  <span className="hx-display block text-xl uppercase leading-tight">{c.title}</span>
                </span>
                <ChevronRight className="size-5 text-muted transition group-hover:translate-x-0.5" aria-hidden />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line/70 px-4 py-2 text-xs text-muted">
                {c.sections.slice(0, 6).map((s) => (
                  <span key={s.id}>
                    <span className="hx-mono">{s.id}</span> {s.title}
                  </span>
                ))}
                {c.sections.length > 6 && <span>+{c.sections.length - 6} more</span>}
              </div>
            </Link>
          ))}
        </nav>
        {m.revisions && (
          <div className="mt-6 text-center text-xs text-muted">
            Revision record: {m.revisions.map(([r, d, desc]) => `${r} (${d}) ${desc}`).join('; ')}
          </div>
        )}
      </Page>
    </>
  )
}
