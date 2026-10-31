import { ArrowUpRight } from 'lucide-react'
import type { ComponentId } from '../../types/hardware'
import { componentById } from '../../data/components'
import type { ProcessStep, SystemProcess } from '../../types/systemProcess'
import { ACCENTS } from './ProcessDiagram'

interface ExplanationProps {
  process: SystemProcess
  step: ProcessStep
  stepIndex: number
  onSelectComponent: (id: ComponentId) => void
}

/** Step explanation + the hardware that participates in the process. */
export default function ProcessExplanation({ process, step, stepIndex, onSelectComponent }: ExplanationProps) {
  const accent = ACCENTS[process.accent]
  return (
    <div className="mt-8 grid gap-8 border-t border-[rgba(188,211,245,0.14)] pt-7 lg:grid-cols-12">
      <div className="lg:col-span-7" key={`${process.id}-${step.id}`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>
          Step {String(stepIndex + 1).padStart(2, '0')} / {String(process.steps.length).padStart(2, '0')} : {step.label}
        </p>
        <p className="panel-in mt-3 max-w-xl text-[17px] leading-relaxed text-ink">{step.explanation}</p>
        <p className="mt-4 max-w-xl leading-relaxed text-secondary">{process.description}</p>
        <p className="mt-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-muted">{process.note}</p>
      </div>
      <div className="lg:col-span-5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Key components</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {process.components.map((id) => {
            const c = componentById(id)
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelectComponent(id)}
                  aria-label={`Inspect ${c.name} on the exploded view`}
                  className="inline-flex items-center gap-2 border border-[rgba(188,211,245,0.25)] px-3.5 py-2.5 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
                >
                  <span className="font-mono text-[11px] text-accent">{c.index}</span>
                  {c.name}
                  <ArrowUpRight size={14} aria-hidden className="text-muted" />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Select a component to jump back to the exploded view and open its function diagram.
        </p>
      </div>
    </div>
  )
}
