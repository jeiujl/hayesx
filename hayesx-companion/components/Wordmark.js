import { BRAND } from '@/lib/brand'
import { cx } from './ui'

/** HayesX wordmark. Uses BRAND.logo when an official logo file is configured. */
export default function Wordmark({ className, size = 'md', tone = 'ink' }) {
  const h = size === 'lg' ? 34 : size === 'sm' ? 18 : 24
  if (BRAND.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND.logo.src}
        alt={BRAND.name}
        height={h}
        style={{ height: h, width: 'auto' }}
        className={cx(BRAND.logo.invertOnDark && tone === 'ink' && 'dark:invert', className)}
      />
    )
  }
  return (
    <span
      className={cx('hx-display inline-flex items-baseline uppercase leading-none tracking-[0.14em]', tone === 'light' ? 'text-on-carbon' : 'text-ink', className)}
      style={{ fontSize: h }}
      aria-label={BRAND.name}
    >
      Hayes<span className="text-accent">X</span>
    </span>
  )
}
