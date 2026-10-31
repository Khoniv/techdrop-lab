import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentId } from '../../types/hardware'
import type { ProcessId } from '../../types/systemProcess'
import { processById } from '../../data/systemProcesses'
import ProcessSelector from './ProcessSelector'
import ProcessDiagram from './ProcessDiagram'
import ProcessControls from './ProcessControls'
import ProcessExplanation from './ProcessExplanation'

const STEP_MS = 3600

interface SectionProps {
  reducedMotion: boolean
  onSelectComponent: (id: ComponentId) => void
}

/**
 * FIG. 02 — System in Motion. A deterministic step machine drives the
 * diagram highlights, the moving flows, and the explanation together;
 * switching processes resets the machine so no timers or highlights
 * can leak between workflows.
 */
export default function SystemStudySection({ reducedMotion, onSelectComponent }: SectionProps) {
  const [processId, setProcessId] = useState<ProcessId>('loading')
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const process = processById(processId)
  const step = process.steps[stepIndex]
  const last = process.steps.length - 1

  // Pause the auto-advance while the section is off-screen (never resets
  // the visitor's chosen step, per the interaction contract).
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    const t = window.setTimeout(() => {
      if (stepIndex < last) setStepIndex(stepIndex + 1)
      else setPlaying(false)
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [playing, inView, stepIndex, last])

  const switchProcess = useCallback((id: ProcessId) => {
    setProcessId(id)
    setStepIndex(0)
    setPlaying(false)
  }, [])

  const selectStep = useCallback((i: number) => {
    setStepIndex(i)
  }, [])

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && stepIndex >= last) setStepIndex(0) // play from the end restarts
      return !p
    })
  }, [stepIndex, last])

  const replay = useCallback(() => {
    setStepIndex(0)
    setPlaying(true)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="explore"
      className="mx-auto max-w-[1440px] scroll-mt-16 px-5 py-14 md:px-10 lg:px-14 lg:py-20"
      aria-labelledby="system-motion-title"
    >
      <div className="flex flex-wrap items-end justify-between gap-6 border-t border-[rgba(188,211,245,0.18)] pt-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Fig. 02 <span className="text-accent">/</span> System in motion
          </p>
          <h2 id="system-motion-title" className="mt-3 max-w-xl text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-[1.05]">
            Every component. One connected system.
          </h2>
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-secondary">
          See how computer hardware works together. Choose a process to follow the flow of power,
          data, or graphics through the system.
        </p>
      </div>

      <div className="mt-9">
        <ProcessSelector value={processId} onChange={switchProcess} />
      </div>

      <div
        role="tabpanel"
        id="process-panel"
        aria-labelledby={`process-tab-${processId}`}
        className="mt-5"
      >
        <div className="blueprint-grid relative border border-[rgba(188,211,245,0.22)] bg-deep px-3 pb-3 pt-11 sm:px-5 sm:pb-5">
          <p className="pointer-events-none absolute left-4 top-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Process visualization — {process.label}
          </p>
          <p className="pointer-events-none absolute right-4 top-3.5 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:block">
            Step {String(stepIndex + 1).padStart(2, '0')} / {String(process.steps.length).padStart(2, '0')}
          </p>
          <ProcessDiagram
            process={process}
            step={step}
            stepIndex={stepIndex}
            playing={playing}
            motion={!reducedMotion}
          />
        </div>

        <ProcessControls
          process={process}
          stepIndex={stepIndex}
          playing={playing}
          onSelectStep={selectStep}
          onPrev={() => setStepIndex(Math.max(0, stepIndex - 1))}
          onNext={() => setStepIndex(Math.min(last, stepIndex + 1))}
          onTogglePlay={togglePlay}
          onReplay={replay}
        />

        <ProcessExplanation
          process={process}
          step={step}
          stepIndex={stepIndex}
          onSelectComponent={onSelectComponent}
        />
      </div>
    </section>
  )
}
