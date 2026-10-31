import { useRef } from 'react'
import { motion } from 'motion/react'
import { SYSTEM_PROCESSES } from '../../data/systemProcesses'
import type { ProcessId } from '../../types/systemProcess'
import { ACCENTS } from './ProcessDiagram'
import { CometCard } from '../ui/comet-card'

interface SelectorProps {
  value: ProcessId
  onChange: (id: ProcessId) => void
  reducedMotion: boolean
}

/**
 * Process tabs with full keyboard support (arrows move + select). The
 * active tab's surface is a shared motion element (layoutId) that glides
 * between tabs: the interaction model of the official Aceternity UI Tabs
 * registry component, adapted to a controlled component with full ARIA tab
 * semantics and TechDrop Lab styling. Each tab card also carries the
 * restrained Comet Card tilt (components/ui/comet-card.tsx). Selection
 * state itself stays in the parent section.
 */
export default function ProcessSelector({ value, onChange, reducedMotion }: SelectorProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (index + 1) % SYSTEM_PROCESSES.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + SYSTEM_PROCESSES.length) % SYSTEM_PROCESSES.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = SYSTEM_PROCESSES.length - 1
    if (next === null) return
    e.preventDefault()
    onChange(SYSTEM_PROCESSES[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="System processes" className="grid gap-2 sm:grid-cols-3">
      {SYSTEM_PROCESSES.map((p, i) => {
        const selected = p.id === value
        const accent = ACCENTS[p.accent]
        return (
          <CometCard key={p.id} disabled={reducedMotion} className="h-full">
            <button
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              id={`process-tab-${p.id}`}
              aria-selected={selected}
              aria-controls="process-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(p.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative h-full w-full overflow-hidden border px-4 py-3.5 text-left transition-colors ${
                selected
                  ? 'border-transparent'
                  : 'border-[rgba(188,211,245,0.18)] bg-transparent hover:bg-surface/60'
              }`}
            >
              {selected &&
                (reducedMotion ? (
                  <span className="absolute inset-0 border border-[rgba(188,211,245,0.45)] bg-surface" />
                ) : (
                  <motion.span
                    layoutId="process-tab-active"
                    transition={{ type: 'spring', bounce: 0.12, duration: 0.42 }}
                    className="absolute inset-0 border border-[rgba(188,211,245,0.45)] bg-surface"
                  />
                ))}
              <span className="relative flex items-baseline justify-between gap-3">
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: selected ? accent : undefined }}
                >
                  <span className={selected ? '' : 'text-muted'}>{p.index}</span>
                </span>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5"
                  style={{ backgroundColor: selected ? accent : 'rgba(129,151,181,0.4)' }}
                />
              </span>
              <span className={`relative mt-1.5 block text-[15px] font-semibold ${selected ? 'text-ink' : 'text-secondary'}`}>
                {p.label}
              </span>
            </button>
          </CometCard>
        )
      })}
    </div>
  )
}
