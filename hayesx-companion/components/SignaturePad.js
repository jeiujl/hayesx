'use client'

import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'
import { cx } from './ui'

const W = 600
const H = 200

/**
 * Finger/stylus signature capture. Strokes are stored as compact SVG path data
 * (in a 600×200 coordinate space) so a signed entry stays small and renders
 * crisply anywhere.
 */
export default function SignaturePad({ value, onChange, className, label = 'Signature' }) {
  const canvasRef = useRef(null)
  const strokes = useRef(value?.paths ? [...value.paths] : [])
  const current = useRef(null)
  const [empty, setEmpty] = useState(!value?.paths?.length)

  function ctx() {
    const c = canvasRef.current
    const g = c.getContext('2d')
    return { c, g }
  }

  function redraw() {
    if (!canvasRef.current) return
    const { c, g } = ctx()
    const ratio = c.width / W
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, c.width, c.height)
    g.setTransform(ratio, 0, 0, ratio, 0, 0)
    g.lineWidth = 2.6
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = getComputedStyle(c).color
    for (const d of strokes.current) g.stroke(new Path2D(d))
    if (current.current) g.stroke(new Path2D(current.current))
  }

  useEffect(() => {
    const c = canvasRef.current
    const resize = () => {
      if (!canvasRef.current) return
      const rect = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      c.width = Math.round(rect.width * dpr)
      c.height = Math.round((rect.width * H) / W * dpr)
      redraw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function point(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  }

  function down(e) {
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    current.current = `M${point(e)}`
    redraw()
  }
  function move(e) {
    if (!current.current) return
    current.current += ` L${point(e)}`
    redraw()
  }
  function up() {
    if (!current.current) return
    // A single tap becomes a dot.
    const d = current.current.includes('L') ? current.current : `${current.current} l0.1 0.1`
    strokes.current.push(d)
    current.current = null
    setEmpty(false)
    redraw()
    onChange?.({ w: W, h: H, paths: [...strokes.current] })
  }
  function clear() {
    strokes.current = []
    current.current = null
    setEmpty(true)
    redraw()
    onChange?.(null)
  }

  return (
    <div className={cx('select-none', className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-2">{label}</span>
        <button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-accent hover:bg-accent-soft disabled:opacity-40" disabled={empty}>
          <Eraser className="size-4" aria-hidden /> Clear
        </button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={empty ? 'Signature area: draw your signature with your finger or mouse' : 'Your signature'}
          className="block w-full touch-none text-ink"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={(e) => e.buttons === 0 && up()}
          data-testid="signature-pad"
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-line" />
        {empty && <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted">Sign here</span>}
      </div>
    </div>
  )
}

export function Signature({ value, className }) {
  if (!value?.paths?.length) return null
  return (
    <svg viewBox={`0 0 ${value.w || W} ${value.h || H}`} className={cx('w-full text-ink', className)} role="img" aria-label="Pilot signature">
      {value.paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
