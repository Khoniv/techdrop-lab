import { useRef } from 'react'
import { SYSTEM_PROCESSES } from '../../data/systemProcesses'
import type { ProcessId } from '../../types/systemProcess'
import { ACCENTS } from './ProcessDiagram'

interface SelectorProps {
  value: ProcessId
  onChange: (id: ProcessId) => void
}

/** Process tabs with full keyboard support (arrows move + select). */
export default function ProcessSelector({ value, onChange }: SelectorProps) {
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
          <button
            key={p.id}
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
            className={`border px-4 py-3.5 text-left transition-colors ${
              selected
                ? 'border-[rgba(188,211,245,0.45)] bg-surface'
                : 'border-[rgba(188,211,245,0.18)] bg-transparent hover:bg-surface/60'
            }`}
          >
            <span className="flex items-baseline justify-between gap-3">
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
            <span className={`mt-1.5 block text-[15px] font-semibold ${selected ? 'text-ink' : 'text-secondary'}`}>
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
