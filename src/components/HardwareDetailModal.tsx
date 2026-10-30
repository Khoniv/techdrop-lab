import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { ComponentId } from '../types/hardware'
import { COMPONENTS, componentById } from '../data/components'
import { hotspots } from '../data/hotspots'

interface ModalProps {
  /** The component the modal should show (changes on prev/next). */
  componentId: ComponentId
  /** True while the exit animation should play; onExited fires when done. */
  closing: boolean
  reducedMotion: boolean
  onClose: () => void
  onSwitch: (id: ComponentId) => void
  onExited: () => void
}

const EXIT_MS = 250
const SWITCH_OUT_MS = 180

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{children}</h4>
  )
}

/** Zoom transform that centres the component's hotspot, clamped to cover. */
function focusTransform(id: ComponentId): string {
  const h = hotspots[id]
  const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * h.zoom, v))
  const tx = clamp(50 - h.x * h.zoom)
  const ty = clamp(50 - h.y * h.zoom)
  return `translate(${tx}%, ${ty}%) scale(${h.zoom})`
}

export default function HardwareDetailModal({
  componentId,
  closing,
  reducedMotion,
  onClose,
  onSwitch,
  onExited,
}: ModalProps) {
  // shownId lags componentId during the switch crossfade.
  const [shownId, setShownId] = useState<ComponentId>(componentId)
  const [switching, setSwitching] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const switchTimer = useRef<number | null>(null)
  const switchedOnce = useRef(false)
  const firstOpen = useRef(true)

  const component = componentById(shownId)
  // Navigation is computed from the latest requested component (the prop),
  // not the still-displayed one, so rapid prev/next clicks accumulate.
  const navPosition = COMPONENTS.findIndex((c) => c.id === componentId)
  const prevId = COMPONENTS[(navPosition - 1 + COMPONENTS.length) % COMPONENTS.length].id
  const nextId = COMPONENTS[(navPosition + 1) % COMPONENTS.length].id

  // Opening stagger is only for the first paint of a component, not switches.
  const useRise = !reducedMotion && !switching && shownId === componentId && !switchedOnce.current
  const riseCls = (_delay: number) => (useRise ? 'rise-in' : '')
  const riseStyle = (delay: number) =>
    useRise ? ({ animationDelay: `${delay}ms` } as const) : undefined

  // Component switching: slide the old content out, then swap + slide in.
  useEffect(() => {
    if (componentId === shownId) return
    if (reducedMotion) {
      setShownId(componentId)
      return
    }
    switchedOnce.current = true
    setSwitching(true)
    switchTimer.current = window.setTimeout(() => {
      setShownId(componentId)
      setSwitching(false)
      switchTimer.current = null
    }, SWITCH_OUT_MS)
    return () => {
      if (switchTimer.current) window.clearTimeout(switchTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId, reducedMotion])

  // Exit animation: notify the parent only after it has played.
  useEffect(() => {
    if (!closing) return
    const t = window.setTimeout(onExited, reducedMotion ? 30 : EXIT_MS)
    return () => window.clearTimeout(t)
  }, [closing, onExited, reducedMotion])

  // Focus the close button on first mount.
  useEffect(() => {
    if (firstOpen.current) {
      firstOpen.current = false
      closeRef.current?.focus()
    }
  }, [])

  // Keyboard: Escape closes; Tab stays inside the dialog (focus trap).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const anim = (name: string) => (reducedMotion ? '' : name)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-[#050d1d]/70 backdrop-blur-[2px] ${anim(
          closing ? 'modal-overlay-out' : 'modal-overlay-in',
        )}`}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hw-modal-title"
        className={`relative flex max-h-[100dvh] w-full max-w-[960px] flex-col border border-[rgba(188,211,245,0.28)] bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:max-h-[90vh] ${anim(
          closing ? 'modal-out' : 'modal-in',
        )}`}
      >
        {/* Header */}
        <div
          style={riseStyle(0)}
          className={`flex items-center justify-between gap-4 border-b border-[rgba(188,211,245,0.18)] bg-deep/60 px-5 py-3.5 ${riseCls(0)}`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            TechDrop Lab <span className="text-accent">/</span> Hardware study
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-secondary sm:block">
              Component {component.index} / 08
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close component details"
              className="flex h-9 w-9 items-center justify-center border border-[rgba(188,211,245,0.25)] text-secondary transition-colors hover:bg-raised hover:text-ink"
            >
              <X size={17} aria-hidden />
            </button>
          </div>
        </div>

        {/* Body: swaps content on prev/next */}
        <div
          key={shownId}
          className={`panel-scroll grid min-h-0 flex-1 overflow-y-auto md:overflow-hidden md:grid-cols-[38%_62%] ${
            switching ? anim('switch-out') : switchedOnce.current ? anim('switch-in') : ''
          }`}
        >
          {/* Left — component visualization */}
          <div className="border-b border-[rgba(188,211,245,0.18)] p-5 md:border-b-0 md:border-r">
            <div style={riseStyle(60)} className={riseCls(60)}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Fig. {component.index} <span className="text-accent">/</span> {component.category}
              </p>
              <div className="blueprint-grid relative mt-3 aspect-square overflow-hidden border border-[rgba(188,211,245,0.22)] bg-deep">
                <div
                  className="absolute inset-0"
                  style={{ transform: focusTransform(shownId), transformOrigin: '0 0' }}
                >
                  <img
                    src="/images/exploded-pc.webp"
                    alt={`Exploded view detail — ${component.name}`}
                    className="h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </div>
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/80"
                />
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                />
                <span className="absolute bottom-2 left-2 bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary">
                  {component.index} · {component.name}
                </span>
              </div>
              <dl className="mt-4 space-y-2 font-mono text-[11px] uppercase tracking-[0.1em]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Number</dt>
                  <dd className="text-secondary">{component.index} of 08</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Category</dt>
                  <dd className="text-secondary">{component.category}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Position</dt>
                  <dd className="text-right text-secondary">Exploded view</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right — educational information */}
          <div className="panel-scroll p-5 md:overflow-y-auto md:p-6">
            <div style={riseStyle(120)} className={riseCls(120)}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Component / {component.index}
              </p>
              <h3 id="hw-modal-title" className="mt-2 text-3xl font-bold tracking-tight text-ink">
                {component.name}
              </h3>
              <p className="mt-1 text-[15px] text-secondary">{component.fullName}</p>
            </div>

            <div style={riseStyle(180)} className={`mt-6 ${riseCls(180)}`}>
              <SectionLabel>Overview</SectionLabel>
              <p className="mt-2 leading-relaxed text-secondary">{component.description}</p>
            </div>

            <div style={riseStyle(230)} className={`mt-6 ${riseCls(230)}`}>
              <SectionLabel>Primary function</SectionLabel>
              <p className="mt-2 leading-relaxed text-secondary">{component.primaryFunction}</p>
            </div>

            <div style={riseStyle(280)} className={`mt-6 ${riseCls(280)}`}>
              <SectionLabel>How it works</SectionLabel>
              <p className="mt-2 leading-relaxed text-secondary">{component.howItWorks}</p>
            </div>

            <div style={riseStyle(330)} className={`mt-6 ${riseCls(330)}`}>
              <SectionLabel>Location</SectionLabel>
              <p className="mt-2 leading-relaxed text-secondary">{component.location}</p>
            </div>

            <div style={riseStyle(380)} className={`mt-6 ${riseCls(380)}`}>
              <SectionLabel>Key facts</SectionLabel>
              <ul className="mt-2 space-y-2.5">
                {component.facts.map((fact) => (
                  <li key={fact} className="flex gap-3 leading-relaxed text-secondary">
                    <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-accent" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer navigation */}
        <div
          style={riseStyle(430)}
          className={`flex items-center justify-between gap-4 border-t border-[rgba(188,211,245,0.18)] bg-deep/60 px-5 py-3.5 ${riseCls(430)}`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {component.index} / 08
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSwitch(prevId)}
              aria-label={`Previous component — ${componentById(prevId).name}`}
              className="inline-flex items-center gap-2 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary transition-colors hover:bg-raised hover:text-ink"
            >
              <ArrowLeft size={14} aria-hidden />
              Previous
            </button>
            <button
              type="button"
              onClick={() => onSwitch(nextId)}
              aria-label={`Next component — ${componentById(nextId).name}`}
              className="inline-flex items-center gap-2 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary transition-colors hover:bg-raised hover:text-ink"
            >
              Next
              <ArrowRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
