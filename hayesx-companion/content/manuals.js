import { FLIGHT_MANUAL } from './flight-manual'
import { MAINTENANCE_MANUAL } from './maintenance-manual'

export const MANUALS = {
  flight: FLIGHT_MANUAL,
  maintenance: MAINTENANCE_MANUAL,
}

function blockText(b) {
  switch (b.t) {
    case 'p':
    case 'h':
      return b.text
    case 'ul':
    case 'ol':
      return b.items.join(' · ')
    case 'kv':
      return b.rows.map(([k, v]) => `${k}: ${v}`).join(' · ')
    case 'table':
      return [b.head.join(' '), ...b.rows.map((r) => r.join(' '))].join(' · ')
    case 'callout':
      return [b.title, b.text, ...(b.lines || [])].filter(Boolean).join(' · ')
    case 'img':
      return b.caption || ''
    default:
      return ''
  }
}

/** Flat list of sections for full-text search. */
export function searchIndex() {
  const out = []
  for (const m of Object.values(MANUALS)) {
    for (const c of m.chapters) {
      for (const s of c.sections) {
        out.push({
          manual: m.id,
          manualTitle: m.title,
          chapter: c.id,
          chapterTitle: c.title,
          section: s.id,
          title: s.title,
          text: s.blocks.map(blockText).join(' · '),
          href: `/manuals/${m.id}/${c.id}#s-${s.id}`,
        })
      }
    }
  }
  return out
}

export function chapterLabel(manual, chapter) {
  return /^[A-Z]$/.test(chapter.id) ? chapter.title : `Chapter ${chapter.id}`
}
