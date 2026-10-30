import { CircuitBoard, Cpu, Fan, Gpu, HardDrive, MemoryStick, PlugZap, Snowflake, type LucideIcon } from 'lucide-react'
import type { ComponentId } from '../types/hardware'
import { COMPONENTS } from '../data/components'

export const COMPONENT_ICONS: Record<ComponentId, LucideIcon> = {
  motherboard: CircuitBoard,
  cpu: Cpu,
  ram: MemoryStick,
  gpu: Gpu,
  ssd: HardDrive,
  psu: PlugZap,
  cooler: Snowflake,
  fans: Fan,
}

interface Props {
  selected: ComponentId | null
  onSelect: (id: ComponentId) => void
}

/** Accessible alternative to clicking meshes: the full component index. */
export default function ComponentList({ selected, onSelect }: Props) {
  return (
    <nav aria-label="Component index">
      <ul className="divide-y divide-[rgba(188,211,245,0.14)] border border-[rgba(188,211,245,0.18)] bg-surface">
        {COMPONENTS.map((c) => {
          const Icon = COMPONENT_ICONS[c.id]
          const active = selected === c.id
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
                  active
                    ? 'border-l-2 border-accent bg-raised text-ink'
                    : 'border-l-2 border-transparent text-secondary hover:bg-raised hover:text-ink'
                }`}
              >
                <span className={`font-mono text-xs ${active ? 'text-accent' : 'text-muted'}`}>{c.index}</span>
                <Icon size={19} strokeWidth={1.75} className={active ? 'text-accent' : 'text-muted'} aria-hidden />
                <span className="flex-1">
                  <span className="block text-[15px] font-medium leading-tight">{c.name}</span>
                  <span className="block text-xs text-muted">{c.category}</span>
                </span>
                <span
                  aria-hidden
                  className={`h-2 w-2 ${active ? 'bg-accent' : 'bg-transparent border border-[rgba(188,211,245,0.35)]'}`}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
