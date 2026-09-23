import Link from 'next/link'
import { ChevronDown, Siren } from 'lucide-react'
import PageHeader, { Page } from '@/components/PageHeader'
import ManualBlocks from '@/components/ManualBlocks'
import { FLIGHT_MANUAL } from '@/content/flight-manual'

export const metadata = { title: 'Emergency procedures' }

const chapter = FLIGHT_MANUAL.chapters.find((c) => c.emergency)
const PINNED = ['3.1', '3.2']

export default function EmergencyPage() {
  const pinned = chapter.sections.filter((s) => PINNED.includes(s.id))
  const procedures = chapter.sections.filter((s) => !PINNED.includes(s.id))
  return (
    <>
      <PageHeader title="Emergency" eyebrow="Flight Manual Chapter 3" back />
      <Page>
        <div className="rounded-3xl bg-warning p-5 text-white">
          <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            <Siren className="size-4" aria-hidden /> First
          </div>
          <p className="hx-display mt-1 text-3xl uppercase leading-tight">Maintain controlled flight</p>
          <ol className="mt-4 grid gap-2 text-[15px] font-semibold">
            {pinned[1].blocks.find((b) => b.t === 'ol').items.map((it, i) => (
              <li key={it} className="flex items-center gap-3 rounded-xl bg-black/15 px-3 py-2">
                <span className="hx-num grid size-7 place-items-center rounded-lg bg-white text-sm text-warning">{i + 1}</span>
                {it}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-white/85">{pinned[0].blocks.map((b) => b.text).join(' ')}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm">
          <span className="font-semibold">BRS handle:</span> red handle on the pilot’s left. Max deployment speed 100 km/h, minimum recommended height 10 m AGL. Deployment cannot be cancelled.
        </div>

        <h2 className="hx-label mt-6 mb-2 px-1">Procedures</h2>
        <div className="space-y-2.5">
          {procedures.map((s) => (
            <details key={s.id} id={`s-${s.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface open:border-warning/40">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="hx-mono w-9 shrink-0 text-sm font-semibold text-warning">{s.id}</span>
                <span className="hx-display flex-1 text-xl uppercase leading-tight">{s.title}</span>
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
              </summary>
              <div className="border-t border-line px-4 py-4">
                <ManualBlocks blocks={s.blocks} />
              </div>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Full text in the{' '}
          <Link href="/manuals/flight/3" className="font-semibold text-accent">
            Flight Manual, Chapter 3
          </Link>
          .
        </p>
      </Page>
    </>
  )
}
