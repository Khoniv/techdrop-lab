import { ArrowRight, MousePointerClick, X } from 'lucide-react'
import type { ComponentId, HardwareComponent } from '../types/hardware'
import { componentById } from '../data/components'

interface Props {
  component: HardwareComponent | null
  onClose: () => void
  onSelect: (id: ComponentId) => void
}

function StudyLabel({ children }: { children: string }) {
  return (
    <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">{children}</h4>
  )
}

export default function ComponentPanel({ component, onClose, onSelect }: Props) {
  if (!component) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-start justify-center border border-[rgba(188,211,245,0.18)] bg-surface p-6 md:p-10">
        <MousePointerClick size={28} strokeWidth={1.5} className="text-accent" aria-hidden />
        <h3 className="mt-5 text-2xl font-semibold text-ink">Select a component to inspect.</h3>
        <p className="mt-3 max-w-md leading-relaxed text-secondary">
          Click a part of the computer in the viewer above, or choose one from the component index. Its
          study — what it is, what it does, and how it works — opens here, and the camera moves to it in
          the 3D view.
        </p>
        <p className="mt-6 font-mono text-xs text-muted">8 COMPONENTS · ALL SELECTABLE FROM THE INDEX</p>
      </div>
    )
  }

  return (
    <article
      key={component.id}
      className="panel-in relative border border-[rgba(188,211,245,0.18)] bg-surface"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[rgba(188,211,245,0.14)] p-6 pb-5 md:p-8 md:pb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Fig. 02.{component.index} / {component.category}
          </p>
          <h3 className="mt-2 text-3xl font-bold leading-none text-ink md:text-4xl">{component.name}</h3>
          <p className="mt-2 text-secondary">{component.fullName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close component details"
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(188,211,245,0.25)] text-secondary transition-colors hover:bg-raised hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <div className="panel-scroll grid max-h-[560px] gap-7 overflow-y-auto p-6 md:grid-cols-2 md:p-8">
        <div className="space-y-7">
          <p className="text-[17px] leading-relaxed text-ink">{component.description}</p>
          <div>
            <StudyLabel>Primary function</StudyLabel>
            <p className="mt-2 leading-relaxed text-secondary">{component.primaryFunction}</p>
          </div>
          <div>
            <StudyLabel>Location</StudyLabel>
            <p className="mt-2 leading-relaxed text-secondary">{component.location}</p>
          </div>
        </div>
        <div className="space-y-7">
          <div>
            <StudyLabel>How it works</StudyLabel>
            <p className="mt-2 leading-relaxed text-secondary">{component.howItWorks}</p>
          </div>
          <div>
            <StudyLabel>Worth knowing</StudyLabel>
            <ul className="mt-2 space-y-2">
              {component.facts.map((fact) => (
                <li key={fact} className="flex gap-2.5 leading-relaxed text-secondary">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <StudyLabel>Related components</StudyLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {component.related.map((id) => {
                const rel = componentById(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    className="inline-flex items-center gap-1.5 border border-[rgba(188,211,245,0.25)] px-3 py-2 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
                  >
                    {rel.name}
                    <ArrowRight size={14} aria-hidden />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
