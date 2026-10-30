import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { ComponentId } from '../types/hardware'
import { COMPONENTS, componentById } from '../data/components'
import { functionStudies } from '../data/functionDiagrams'
import { CoolerDiagram, FansDiagram, PsuDiagram, SsdDiagram } from './diagrams/DiagramsB'
import { CpuDiagram, GpuDiagram, MotherboardDiagram, RamDiagram } from './diagrams/DiagramsA'

const DIAGRAMS: Record<ComponentId, ComponentType<{ m: boolean }>> = {
  motherboard: MotherboardDiagram,
  cpu: CpuDiagram,
  ram: RamDiagram,
  gpu: GpuDiagram,
  ssd: SsdDiagram,
  psu: PsuDiagram,
  cooler: CoolerDiagram,
  fans: FansDiagram,
}

interface InspectorProps {
  componentId: ComponentId
  closing: boolean
  reducedMotion: boolean
  onClose: () => void
  onSwitch: (id: ComponentId) => void
  onExited: () => void
}

interface Layout {
  mode: 'float' | 'sheet'
  left: number
  top: number
  side: 'left' | 'right'
  markerCx: number
  markerCy: number
  markerR: number
  popW: number
}

const POP_W = 480
const GAP = 30
const EXIT_MS = 210

export default function FunctionInspector({
  componentId,
  closing,
  reducedMotion,
  onClose,
  onSwitch,
  onExited,
}: InspectorProps) {
  const [layout, setLayout] = useState<Layout | null>(null)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const rootRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(componentId)
  idRef.current = componentId
  const layoutRef = useRef<Layout | null>(null)

  const component = componentById(componentId)
  const study = functionStudies[componentId]
  const Diagram = DIAGRAMS[componentId]
  const navPosition = COMPONENTS.findIndex((c) => c.id === componentId)
  const prevId = COMPONENTS[(navPosition - 1 + COMPONENTS.length) % COMPONENTS.length].id
  const nextId = COMPONENTS[(navPosition + 1) % COMPONENTS.length].id
  const motion = !reducedMotion && pageVisible

  /** Measure the live marker element and place the popup beside it. */
  const measure = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (vw < 768) {
      const next: Layout = { mode: 'sheet', left: 0, top: 0, side: 'right', markerCx: 0, markerCy: 0, markerR: 0, popW: 0 }
      if (layoutRef.current?.mode !== 'sheet') {
        layoutRef.current = next
        setLayout(next)
      }
      return
    }
    const marker = document.querySelector<HTMLElement>(`[data-marker="${idRef.current}"]`)
    if (!marker) return
    const r = marker.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const popW = Math.min(POP_W, vw - 20)
    const popH = rootRef.current?.offsetHeight || 470
    // Prefer keeping the whole illustration uncovered: first try fully
    // left of the plate, then fully right of it, and only then beside the
    // marker itself (which always keeps the selected marker clear).
    const plate = document.querySelector<HTMLElement>('[data-plate="true"]')
    const pr = plate?.getBoundingClientRect()
    let side: 'left' | 'right' = 'right'
    let left = cx + GAP
    if (pr && pr.left - GAP - popW >= 10) {
      side = 'left'
      left = pr.left - GAP - popW
    } else if (pr && pr.right + GAP + popW <= vw - 10) {
      side = 'right'
      left = pr.right + GAP
    } else if (left + popW > vw - 10) {
      side = 'left'
      left = cx - GAP - popW
      if (left < 10) {
        // Not enough room on either side: take the roomier side, clamped.
        side = cx > vw / 2 ? 'left' : 'right'
        left = Math.max(10, Math.min(vw - popW - 10, side === 'left' ? cx - GAP - popW : cx + GAP))
      }
    }
    const top = Math.max(10, Math.min(vh - popH - 10, cy - 56))
    const prev = layoutRef.current
    if (
      !prev ||
      prev.mode !== 'float' ||
      Math.abs(prev.left - left) > 1 ||
      Math.abs(prev.top - top) > 1 ||
      Math.abs(prev.markerCx - cx) > 1 ||
      Math.abs(prev.markerCy - cy) > 1 ||
      prev.side !== side
    ) {
      const next: Layout = { mode: 'float', left, top, side, markerCx: cx, markerCy: cy, markerR: r.width / 2, popW }
      layoutRef.current = next
      setLayout(next)
    }
  }, [])

  // Track the marker continuously while open (covers the stage zoom
  // transition, scrolling, and window resizes) without per-frame renders:
  // state only changes when the measured position actually moves.
  useEffect(() => {
    measure()
    let raf = 0
    const loop = () => {
      measure()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [measure])

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Exit: play the close transition, then unmount via the parent.
  useEffect(() => {
    if (!closing) return
    const t = window.setTimeout(
      () => {
        // If focus is inside the popup, hand it back to the marker.
        if (rootRef.current?.contains(document.activeElement)) {
          document.querySelector<HTMLElement>(`[data-marker="${idRef.current}"]`)?.focus()
        }
        onExited()
      },
      reducedMotion ? 30 : EXIT_MS,
    )
    return () => window.clearTimeout(t)
  }, [closing, onExited, reducedMotion])

  const connector =
    layout?.mode === 'float'
      ? {
          sx: layout.markerCx + (layout.side === 'right' ? layout.markerR : -layout.markerR),
          ex: layout.side === 'right' ? layout.left : layout.left + layout.popW,
          ey: layout.top + 46,
        }
      : null

  return (
    <>
      {/* Connector line from the marker to the popup (desktop float mode) */}
      {connector && !closing && (
        <svg className="pointer-events-none fixed inset-0 z-40 h-full w-full" aria-hidden>
          <path
            key={componentId}
            d={`M ${connector.sx} ${layout!.markerCy} L ${connector.ex} ${layout!.markerCy} L ${connector.ex} ${connector.ey}`}
            pathLength={1}
            fill="none"
            stroke="#86D8FF"
            strokeWidth="1.2"
            className={reducedMotion ? undefined : 'connector-line'}
          />
          <circle cx={connector.sx} cy={layout!.markerCy} r="2.6" fill="none" stroke="#86D8FF" strokeWidth="1.2" />
          <circle cx={connector.ex} cy={connector.ey} r="2.2" fill="#86D8FF" />
        </svg>
      )}

      <div
        ref={rootRef}
        role="dialog"
        aria-labelledby="inspector-title"
        style={
          layout?.mode === 'float'
            ? { left: layout.left, top: layout.top, width: layout.popW }
            : undefined
        }
        className={
          layout?.mode === 'sheet'
            ? `fixed inset-x-3 bottom-3 z-50 max-h-[74vh] overflow-y-auto border border-[rgba(188,211,245,0.28)] bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.5)] ${closing ? 'inspector-out' : 'inspector-in'}`
            : `fixed z-50 border border-[rgba(188,211,245,0.28)] bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.5)] ${closing ? 'inspector-out' : 'inspector-in'} ${layout ? '' : 'invisible'}`
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[rgba(188,211,245,0.18)] bg-deep/60 px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Function diagram <span className="text-accent">/</span> {component.index}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close function diagram"
            className="flex h-8 w-8 items-center justify-center border border-[rgba(188,211,245,0.25)] text-secondary transition-colors hover:bg-raised hover:text-ink"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        <div key={componentId} className={reducedMotion ? undefined : 'diagram-swap'}>
          {/* Title */}
          <div className="px-4 pt-3.5">
            <h3 id="inspector-title" className="text-[22px] font-bold leading-tight tracking-tight text-ink">
              {component.name}
              <span className="ml-2 align-middle text-[13px] font-medium text-muted">— How it works</span>
            </h3>
          </div>

          {/* Animated function diagram */}
          <div className="px-4 pt-3">
            <div className="blueprint-grid border border-[rgba(188,211,245,0.22)] bg-deep p-2.5">
              <Diagram m={motion} />
            </div>
          </div>

          {/* Explanation */}
          <p className="px-4 pt-3 text-[13.5px] leading-relaxed text-secondary">{study.summary}</p>

          {/* Steps, illuminated in sequence with the diagram */}
          <ol className="flex flex-wrap gap-1.5 px-4 pb-1 pt-3">
            {study.steps.map((step, i) => (
              <li
                key={step}
                className={`border border-[rgba(188,211,245,0.22)] bg-deep/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-secondary ${motion ? 'seq' : ''}`}
                style={
                  motion
                    ? ({ '--delay': `${i * 1.5}s`, '--cycle': '6s' } as React.CSSProperties)
                    : undefined
                }
              >
                <span className="text-accent">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Footer navigation */}
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-[rgba(188,211,245,0.18)] bg-deep/60 px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {component.index} / 08
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSwitch(prevId)}
              aria-label={`Previous component — ${componentById(prevId).name}`}
              className="inline-flex items-center gap-2 border border-[rgba(188,211,245,0.25)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary transition-colors hover:bg-raised hover:text-ink"
            >
              <ArrowLeft size={13} aria-hidden />
              Previous
            </button>
            <button
              type="button"
              onClick={() => onSwitch(nextId)}
              aria-label={`Next component — ${componentById(nextId).name}`}
              className="inline-flex items-center gap-2 border border-[rgba(188,211,245,0.25)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary transition-colors hover:bg-raised hover:text-ink"
            >
              Next
              <ArrowRight size={13} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Polite announcement of the open component for screen readers */}
      <p className="sr-only" aria-live="polite">
        {component.name} — how it works
      </p>
    </>
  )
}
