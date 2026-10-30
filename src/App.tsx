import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Info, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { ComponentId } from './types/hardware'
import { componentById } from './data/components'
import PCScene, { type ViewerApi } from './three/PCScene'
import ComponentList from './components/ComponentList'
import ComponentPanel from './components/ComponentPanel'

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

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

const TECH: Array<[string, string]> = [
  ['React + TypeScript', 'Interface and application logic'],
  ['Three.js · React Three Fiber', 'Real-time 3D computer, built from geometry'],
  ['Tailwind CSS', 'Blueprint design system and layout'],
  ['Vite', 'Development and production build'],
]

export default function App() {
  const [selected, setSelected] = useState<ComponentId | null>(null)
  const [hovered, setHovered] = useState<ComponentId | null>(null)
  const [focusNonce, setFocusNonce] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)
  const reducedMotion = useReducedMotion()
  const [webgl] = useState(supportsWebGL)
  const apiRef = useRef<ViewerApi | null>(null)
  const scrollRef = useRef(0)

  // Scroll progress over roughly the first viewport drives the stage parallax.
  useEffect(() => {
    const onScroll = () => {
      const range = Math.max(window.innerHeight * 1.15, 1)
      scrollRef.current = Math.min(Math.max(window.scrollY / range, 0), 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const select = useCallback((id: ComponentId) => {
    setSelected(id)
    setFocusNonce((n) => n + 1)
  }, [])

  const close = useCallback(() => {
    setSelected(null)
    setFocusNonce((n) => n + 1)
  }, [])

  const selectAndShowStage = useCallback(
    (id: ComponentId) => {
      select(id)
      document.getElementById('stage')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
    },
    [select, reducedMotion],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const selectedComponent = selected ? componentById(selected) : null

  const controlButton =
    'flex h-11 w-11 items-center justify-center border border-[rgba(188,211,245,0.25)] bg-surface text-secondary transition-colors hover:bg-raised hover:text-ink'

  return (
    <div className="min-h-screen overflow-x-clip bg-bg font-sans text-ink">
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
        {/* ---------- Cover sheet: copy + the 3D stage ---------- */}
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
                Explore the parts of a desktop computer in 3D. Select a component to see where it sits,
                what it does, and how it works.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#explore"
                  className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-semibold text-[#102141] transition-colors hover:bg-accent"
                >
                  Explore Computer
                  <ArrowRight size={18} aria-hidden />
                </a>
                <p className="font-mono text-xs text-muted">DRAG TO ROTATE · SCROLL TO INSPECT</p>
              </div>
              <dl className="mt-12 hidden max-w-md space-y-3 border-l-2 border-[rgba(188,211,245,0.18)] pl-5 font-mono text-xs leading-relaxed text-muted lg:block">
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">SUBJECT</dt>
                  <dd>Desktop computer, open side panel</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">CONTENTS</dt>
                  <dd>8 components, each selectable in 3D and from the index</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-secondary">METHOD</dt>
                  <dd>Select a part → camera focuses → read its study</dd>
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
                  Open side panel
                </p>

                {webgl ? (
                  <>
                    {!sceneReady && (
                      <p className="absolute inset-0 z-10 flex items-center justify-center font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        Loading model…
                      </p>
                    )}
                    <PCScene
                      selected={selected}
                      hovered={hovered}
                      onSelect={select}
                      onHover={setHovered}
                      reducedMotion={reducedMotion}
                      focusNonce={focusNonce}
                      apiRef={apiRef}
                      scrollRef={scrollRef}
                      onReady={() => setSceneReady(true)}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                    <Info size={26} className="text-accent" aria-hidden />
                    <p className="max-w-sm leading-relaxed text-secondary">
                      Your browser could not start WebGL, so the 3D model is unavailable. The component
                      index and studies below still contain the full lesson.
                    </p>
                  </div>
                )}

                <p className="absolute bottom-3.5 left-4 z-10 max-w-[70%] bg-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary">
                  {selectedComponent
                    ? `${selectedComponent.index} — ${selectedComponent.name} · study open below`
                    : hovered
                      ? `${componentById(hovered).name} — click to inspect`
                      : 'Select a component to inspect'}
                </p>
                <div className="absolute bottom-3.5 right-4 z-10 flex gap-2">
                  <button type="button" aria-label="Zoom in" className={controlButton} onClick={() => apiRef.current?.zoomIn()}>
                    <ZoomIn size={18} aria-hidden />
                  </button>
                  <button type="button" aria-label="Zoom out" className={controlButton} onClick={() => apiRef.current?.zoomOut()}>
                    <ZoomOut size={18} aria-hidden />
                  </button>
                  <button type="button" aria-label="Reset view" className={controlButton} onClick={close}>
                    <RotateCcw size={18} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Inspection sheet: index + study ---------- */}
        <section id="explore" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[rgba(188,211,245,0.18)] pt-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Fig. 02 <span className="text-accent">/</span> Hardware explorer
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-none">
                Component study
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-secondary">
              Choose a part from the index — or click it directly in the viewer. The camera moves to the
              part and its study opens beside the index.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Component index
              </h3>
              <ComponentList selected={selected} onSelect={selectAndShowStage} />
              <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
                TIP — THE CPU SITS UNDER ITS COOLER. SELECT IT AND THE COOLER FADES AWAY.
              </p>
            </div>
            <div className="lg:col-span-8">
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Component study
              </h3>
              <ComponentPanel component={selectedComponent} onClose={close} onSelect={selectAndShowStage} />
            </div>
          </div>
        </section>

        {/* ---------- About ---------- */}
        <section id="about" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-20 md:px-10 lg:px-14">
          <div className="grid gap-10 border-t border-[rgba(188,211,245,0.18)] pt-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Fig. 03 <span className="text-accent">/</span> About
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">A field guide, not a store.</h2>
              <p className="mt-5 max-w-xl leading-relaxed text-secondary">
                TechDrop Lab is an interactive educational exhibit about the inside of a desktop computer.
                It exists for one reason: to make hardware understandable by letting you look at it —
                turn the machine around, pick a part, and read a plain explanation of what that part
                does and how it works.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-secondary">
                The computer in the viewer is modelled from individual parts — motherboard, processor,
                memory, graphics card, storage, power supply, and cooling — arranged the way they sit in
                a real case. No shop, no scores, no accounts: just the machine and its study.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-secondary">
                Built by <span className="text-ink">Khonif Zakaria</span>, software engineer, as a
                learning and portfolio project.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://nivdev.ai.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
                >
                  Portfolio — nivdev.ai.id
                  <ArrowUpRight size={15} aria-hidden />
                </a>
                <a
                  href="https://github.com/Khoniv"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
                >
                  GitHub — Khoniv
                  <ArrowUpRight size={15} aria-hidden />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Built with</h3>
              <ul className="mt-2">
                {TECH.map(([name, note]) => (
                  <li
                    key={name}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(188,211,245,0.14)] py-3"
                  >
                    <span className="font-medium text-ink">{name}</span>
                    <span className="text-sm text-muted">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(188,211,245,0.18)]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-7 font-mono text-[11px] uppercase tracking-[0.12em] text-muted md:px-10 lg:px-14">
          <p>TechDrop Lab — Explore the hardware. Understand the technology.</p>
          <p>© 2026 Khonif Zakaria</p>
        </div>
      </footer>
    </div>
  )
}
