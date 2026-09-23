import Link from 'next/link'
import { Callout } from './ui'

/** Renders manual content blocks (see content/flight-manual.js for the schema). */
export default function ManualBlocks({ blocks }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <Block key={i} b={b} />
      ))}
    </div>
  )
}

function Block({ b }) {
  switch (b.t) {
    case 'p':
      return <p className="text-[16px] leading-relaxed text-ink-2">{b.text}</p>
    case 'h':
      return <h4 className="hx-display pt-2 text-lg uppercase tracking-wide text-ink">{b.text}</h4>
    case 'ul':
      return (
        <ul className="space-y-1.5">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-[16px] leading-snug text-ink">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="space-y-1.5">
          {b.items.map((it, i) => (
            <li key={it} className="flex gap-3 text-[16px] leading-snug text-ink">
              <span className="hx-num grid size-6 shrink-0 place-items-center rounded-md bg-carbon text-xs font-semibold text-on-carbon">{i + 1}</span>
              <span className="pt-0.5">{it}</span>
            </li>
          ))}
        </ol>
      )
    case 'kv':
      return (
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {b.rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3 px-4 py-2.5 text-[15px]">
              <dt className="text-ink-2">{k}</dt>
              <dd className="hx-num text-right text-[14px] font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-surface-2">
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="px-3 py-2 font-display text-[0.8rem] font-semibold uppercase tracking-wider text-ink-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={j === 0 ? 'px-3 py-2 font-semibold' : 'px-3 py-2 text-ink-2'}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'callout':
      return (
        <Callout tone={b.tone} title={b.title} text={b.text} lines={b.lines}>
          {b.link && (
            <Link href={b.link.href} className="mt-2 inline-block text-sm font-semibold text-accent underline underline-offset-2">
              {b.link.label}
            </Link>
          )}
        </Callout>
      )
    case 'img':
      return (
        <figure className="overflow-hidden rounded-2xl border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.src} alt={b.alt} width={b.w} height={b.h} loading="lazy" className={`h-auto w-full ${b.src.includes('/hx250-') ? 'hx-drawing-img' : ''}`} />
          {b.caption && <figcaption className="border-t border-line bg-surface px-4 py-2 text-sm text-muted">{b.caption}</figcaption>}
        </figure>
      )
    default:
      return null
  }
}
