import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { ANATOMY_STEPS } from '../../data/anatomySteps'
import BlueprintStudy from './BlueprintStudy'

const STEP_MS = 3200
const TONE_COLORS: Record<string, string> = {
  heat: '#F2B25C',
  power: '#F2B25C',
  data: '#86D8FF',
  air: '#BFE3FF',
}

const transportBtn =
  'border border-[rgba(188,211,245,0.25)] p-2 text-secondary transition-colors hover:border-[rgba(188,211,245,0.5)] hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[rgba(188,211,245,0.25)] disabled:hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focusring'

/**
 * FIG. 03 study exhibit: the line schematic as a six-step guided anatomy
 * walkthrough. One state machine (active step + playing) drives the SVG
 * reveals, pathway cues, callouts, and the synced explanation panel.
 * Playback only advances while the exhibit is on screen; selecting a step
 * or a callout pauses it so the text can be read.
 */
export default function AnatomyStudy({ reducedMotion }: { reducedMotion: boolean }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const [compact, setCompact] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  const last = ANATOMY_STEPS.length - 1
  const step = ANATOMY_STEPS[stepIndex]

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    const t = setTimeout(() => {
      if (stepIndex >= last) setPlaying(false)
      else setStepIndex(stepIndex + 1)
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [playing, inView, stepIndex, last])

  const goto = (i: number) => {
    setStepIndex(i)
    setPlaying(false)
  }
  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
    } else if (stepIndex >= last) {
      setStepIndex(0)
      setPlaying(true)
    } else {
      setPlaying(true)
    }
  }
  const replay = () => {
    setStepIndex(0)
    setPlaying(!reducedMotion)
  }

  return (
    <div>
      <p className="text-lg font-medium text-ink">Discover how the parts fit together.</p>
      <p className="mt-1 text-sm text-muted">
        Follow the assembly-style walkthrough, or select a component label on the drawing to
        inspect its role.
      </p>

      <div
        ref={frameRef}
        className="blueprint-grid relative mt-5 border border-[rgba(188,211,245,0.22)] bg-deep px-3 pb-3 pt-11 sm:px-5 sm:pb-5"
      >
        <p className="pointer-events-none absolute left-4 top-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          System anatomy <span className="text-accent">/</span> Study 001
        </p>
        <p className="pointer-events-none absolute right-4 top-3.5 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:block">
          Exploded arrangement: line study
        </p>

        <BlueprintStudy
          stepIndex={stepIndex}
          compact={compact}
          motion={!reducedMotion}
          onJump={goto}
        />

        {/* sequence controls */}
        <div className="mt-4 border-t border-[rgba(188,211,245,0.16)] pt-4">
          <ol className="grid grid-cols-6 gap-1.5" aria-label="Anatomy walkthrough steps">
            {ANATOMY_STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goto(i)}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  className={`w-full border px-2 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focusring ${
                    i === stepIndex
                      ? 'border-[rgba(134,216,255,0.55)] bg-surface'
                      : 'border-[rgba(188,211,245,0.16)] hover:border-[rgba(188,211,245,0.4)]'
                  }`}
                >
                  <span
                    className={`block font-mono text-[10px] tracking-[0.14em] ${
                      i === stepIndex ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`mt-0.5 hidden truncate text-[11px] font-medium md:block ${
                      i === stepIndex ? 'text-ink' : 'text-secondary'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className={transportBtn}
              onClick={() => goto(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              aria-label="Previous step"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className={transportBtn}
              onClick={togglePlay}
              aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
              aria-pressed={playing}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              className={transportBtn}
              onClick={() => goto(Math.min(last, stepIndex + 1))}
              disabled={stepIndex === last}
              aria-label="Next step"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className={transportBtn}
              onClick={replay}
              aria-label="Replay walkthrough"
            >
              <RotateCcw size={16} />
            </button>
            <p aria-live="polite" className="ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Step {String(stepIndex + 1).padStart(2, '0')} / {String(ANATOMY_STEPS.length).padStart(2, '0')}:{' '}
              {step.title}
            </p>
          </div>
        </div>

        {/* synced explanation */}
        <div key={step.id} className={reducedMotion ? 'mt-5' : 'panel-in mt-5'}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-ink">{step.components.join(' + ')}</h4>
            {step.legend && (
              <span className="inline-flex items-center gap-1.5 border border-[rgba(188,211,245,0.25)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-secondary">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: TONE_COLORS[step.legend.tone] }}
                />
                {step.legend.label}
              </span>
            )}
          </div>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-secondary">{step.explanation}</p>
          <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-muted">
            {step.placement}
          </p>
        </div>
      </div>
    </div>
  )
}
