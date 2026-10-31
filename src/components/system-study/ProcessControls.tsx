import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import type { SystemProcess } from '../../types/systemProcess'
import { ACCENTS } from './ProcessDiagram'

interface ControlsProps {
  process: SystemProcess
  stepIndex: number
  playing: boolean
  onSelectStep: (index: number) => void
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onReplay: () => void
}

const transportBtn =
  'flex h-11 w-11 items-center justify-center border border-[rgba(188,211,245,0.25)] bg-surface text-secondary transition-colors hover:bg-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-surface disabled:hover:text-secondary'

/** Step timeline + transport (previous / play-pause / next / replay). */
export default function ProcessControls({
  process,
  stepIndex,
  playing,
  onSelectStep,
  onPrev,
  onNext,
  onTogglePlay,
  onReplay,
}: ControlsProps) {
  const accent = ACCENTS[process.accent]
  const last = process.steps.length - 1
  return (
    <div className="mt-5">
      {/* Timeline */}
      <ol className="grid gap-2 sm:grid-cols-4" aria-label={`${process.label} steps`}>
        {process.steps.map((s, i) => {
          const active = i === stepIndex
          const done = i < stepIndex
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelectStep(i)}
                aria-current={active ? 'step' : undefined}
                className={`w-full border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? 'border-[rgba(188,211,245,0.45)] bg-surface'
                    : 'border-[rgba(188,211,245,0.15)] hover:bg-surface/60'
                }`}
              >
                <span
                  className="block h-0.5 w-full"
                  style={{ backgroundColor: active ? accent : done ? 'rgba(178,195,219,0.55)' : 'rgba(129,151,181,0.25)' }}
                  aria-hidden
                />
                <span className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] ${active ? 'text-ink' : 'text-muted'}`}>
                  Step {String(i + 1).padStart(2, '0')} — {s.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {/* Transport */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={transportBtn} onClick={onPrev} disabled={stepIndex === 0} aria-label="Previous step">
          <SkipBack size={17} aria-hidden />
        </button>
        <button
          type="button"
          className="flex h-11 items-center gap-2 border border-[rgba(188,211,245,0.35)] bg-surface px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:bg-raised"
          onClick={onTogglePlay}
          aria-pressed={playing}
          aria-label={playing ? `Pause ${process.label}` : `Play ${process.label}`}
        >
          {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className={transportBtn} onClick={onNext} disabled={stepIndex === last} aria-label="Next step">
          <SkipForward size={17} aria-hidden />
        </button>
        <button type="button" className={transportBtn} onClick={onReplay} aria-label={`Replay ${process.label} from step one`}>
          <RotateCcw size={16} aria-hidden />
        </button>
        <p className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted" aria-live="polite">
          Step {String(stepIndex + 1).padStart(2, '0')} / {String(process.steps.length).padStart(2, '0')} —{' '}
          {process.steps[stepIndex].label}
        </p>
      </div>
    </div>
  )
}
