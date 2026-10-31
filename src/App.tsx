import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import type { ComponentId } from './types/hardware'
import { componentById } from './data/components'
import ExplodedViewer from './components/ExplodedViewer'
import FunctionInspector from './components/FunctionInspector'
import MatrixRainBackground from './components/MatrixRainBackground'
import SystemStudySection from './components/system-study/SystemStudySection'
import AboutSection from './components/about/AboutSection'

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function App() {
  const [selected, setSelected] = useState<ComponentId | null>(null)
  const [hovered, setHovered] = useState<ComponentId | null>(null)
  const [inspectorId, setInspectorId] = useState<ComponentId | null>(null)
  const [inspectorClosing, setInspectorClosing] = useState(false)
  const reducedMotion = useReducedMotion()

  const close = useCallback(() => {
    setSelected(null)
  }, [])

  const openInspector = useCallback((id: ComponentId) => {
    setSelected(id)
    setInspectorClosing(false)
    setInspectorId(id)
  }, [])

  const requestCloseInspector = useCallback(() => {
    setInspectorClosing(true)
  }, [])

  const handleInspectorExited = useCallback(() => {
    setInspectorId(null)
    setInspectorClosing(false)
    setSelected(null)
  }, [])


  const inspectComponent = useCallback(
    (id: ComponentId) => {
      openInspector(id)
      document.getElementById('stage')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
    },
    [openInspector, reducedMotion],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (inspectorId) requestCloseInspector()
      else close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, inspectorId, requestCloseInspector])

  const selectedComponent = selected ? componentById(selected) : null

  const controlButton =
    'flex h-11 w-11 items-center justify-center border border-[rgba(188,211,245,0.25)] bg-surface text-secondary transition-colors hover:bg-raised hover:text-ink'

  return (
    <div className="min-h-screen overflow-x-clip bg-bg font-sans text-ink">
      <MatrixRainBackground />
      <div className="relative z-10">
      <header className="sticky top-0 z-40 border-b border-[rgba(188,211,245,0.18)] bg-bg">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14">
          <a href="#top" className="flex items-center gap-2.5" aria-label="TechDrop Lab — back to top">
            <span aria-hidden className="flex h-6 w-6 items-center justify-center border border-accent">
              <span className="h-2 w-2 bg-ink" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">TechDrop Lab</span>
          </a>
          <nav aria-label="Main" className="flex items-center gap-6 text-sm">
            <a href="#explore" className="text-secondary transition-colors hover:text-ink">
              Explore
            </a>
            <a href="#about" className="text-secondary transition-colors hover:text-ink">
              About
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------- Cover sheet: copy + the exploded drawing ---------- */}
        <section className="mx-auto max-w-[1440px] px-5 pb-14 pt-10 md:px-10 lg:px-14 lg:pt-12">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 lg:pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Fig. 01 <span className="text-accent">/</span> Anatomy of a computer
              </p>
              <h1 className="mt-5 text-[clamp(2.85rem,5.4vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.02em]">
                Look inside the machine.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-secondary">
                Explore the parts of a desktop computer in an exploded view. Select a component to see
                where it sits, what it does, and how it works.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#explore"
                  className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-semibold text-[#102141] transition-colors hover:bg-accent"
                >
                  Explore Computer
                  <ArrowRight size={18} aria-hidden />
                </a>
                <p className="font-mono text-xs text-muted">SELECT A MARKER TO INSPECT</p>
              </div>
              <dl className="mt-12 hidden max-w-md space-y-3 border-l-2 border-[rgba(188,211,245,0.18)] pl-5 font-mono text-xs leading-relaxed text-muted lg:block">
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">SUBJECT</dt>
                  <dd>Desktop computer, exploded view illustration</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">CONTENTS</dt>
                  <dd>8 components, each marked on the drawing and listed in the index</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">METHOD</dt>
                  <dd>Select a part → the view zooms in → read its study</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7">
              <div
                id="stage"
                className="blueprint-grid relative h-[440px] scroll-mt-20 border border-[rgba(188,211,245,0.18)] bg-deep sm:h-[520px] lg:h-[calc(100vh-170px)] lg:min-h-[540px]"
              >
                <p className="pointer-events-none absolute left-4 top-3.5 z-10 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  Fig. 01 — Desktop system
                </p>
                <p className="pointer-events-none absolute right-4 top-3.5 z-10 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:block">
                  Exploded view
                </p>

                <ExplodedViewer
                  selected={selected}
                  hovered={hovered}
                  onSelect={openInspector}
                  onHover={setHovered}
                  reducedMotion={reducedMotion}
                />

                <p className="absolute bottom-3.5 left-4 z-10 max-w-[70%] bg-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary">
                  {selectedComponent
                    ? `${selectedComponent.index} — ${selectedComponent.name} · function diagram open`
                    : hovered
                      ? `${componentById(hovered).name} — click to inspect`
                      : 'Select a component to inspect'}
                </p>
                <div className="absolute bottom-3.5 right-4 z-10 flex gap-2">
                  <button type="button" aria-label="Reset view" className={controlButton} onClick={close}>
                    <RotateCcw size={18} aria-hidden />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Exploded illustration · Meshy AI
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Process sheet: how the parts work together ---------- */}
        <SystemStudySection reducedMotion={reducedMotion} onSelectComponent={inspectComponent} />

        {/* ---------- Behind the project ---------- */}
        <AboutSection reducedMotion={reducedMotion} />
      </main>

      {inspectorId && (
        <FunctionInspector
          componentId={inspectorId}
          closing={inspectorClosing}
          reducedMotion={reducedMotion}
          onClose={requestCloseInspector}
          onSwitch={(id) => {
            setSelected(id)
            setInspectorId(id)
          }}
          onExited={handleInspectorExited}
        />
      )}

      <footer className="border-t border-[rgba(188,211,245,0.18)]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-7 font-mono text-[11px] uppercase tracking-[0.12em] text-muted md:px-10 lg:px-14">
          <p>TechDrop Lab — Explore the hardware. Understand the technology.</p>
          <p>© 2026 Khonif Zakaria</p>
        </div>
      </footer>
      </div>
    </div>
  )
}
