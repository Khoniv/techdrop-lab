import type { ComponentId } from '../types/hardware'
import { COMPONENTS } from '../data/components'
import { hotspots } from '../data/hotspots'

interface ViewerProps {
  selected: ComponentId | null
  hovered: ComponentId | null
  onSelect: (id: ComponentId) => void
  onHover: (id: ComponentId | null) => void
  reducedMotion: boolean
}

/**
 * The 2D viewer: the exploded-view illustration with a numbered marker on
 * each component. Selecting a part (marker, index, or study) zooms the
 * drawing to that part; the markers travel with the image so they always
 * sit on their component.
 */
export default function ExplodedViewer({ selected, hovered, onSelect, onHover, reducedMotion }: ViewerProps) {
  const focus = selected ? hotspots[selected] : null
  const zoom = focus?.zoom ?? 1

  // Translate (in % of the layer's own size, transform-origin 0 0) so the
  // focus point lands in the centre, clamped so the image always covers
  // the frame.
  let tx = 0
  let ty = 0
  if (focus) {
    const clamp = (v: number) => Math.min(0, Math.max(100 - 100 * zoom, v))
    tx = clamp(50 - focus.x * zoom)
    ty = clamp(50 - focus.y * zoom)
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-3 pt-12 sm:p-5 sm:pt-12">
      <div className="relative aspect-square h-full max-h-full overflow-hidden border border-[rgba(188,211,245,0.25)] bg-deep shadow-[0_18px_50px_rgba(0,0,0,0.45)] min-[480px]:w-auto max-lg:w-full lg:w-auto">
        <div
          className={`absolute inset-0 ${reducedMotion ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.21,1)]'}`}
          style={{ transform: `translate(${tx}%, ${ty}%) scale(${zoom})`, transformOrigin: '0 0' }}
        >
          <img
            src="/images/exploded-pc.webp"
            alt="Exploded view of a desktop computer: cooler, processor, motherboard, memory, graphics card, SSD, power supply, and case fans pulled apart beside an open black ATX case"
            className="h-full w-full select-none object-cover"
            draggable={false}
          />
          {COMPONENTS.map((c) => {
            const h = hotspots[c.id]
            const isActive = selected === c.id || hovered === c.id
            const isHovered = hovered === c.id
            const markerScale = (1 / zoom) * (isHovered || selected === c.id ? 1.18 : 1)
            return (
              <button
                key={c.id}
                type="button"
                data-marker={c.id}
                aria-label={`Inspect ${c.name}`}
                aria-pressed={selected === c.id}
                onClick={() => onSelect(c.id)}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(c.id)}
                onBlur={() => onHover(null)}
                className={`absolute z-10 flex items-center justify-center rounded-full border font-mono text-[11px] font-semibold backdrop-blur-[2px] transition-[background-color,border-color,opacity] duration-200 ${
                  isActive
                    ? 'border-accent bg-accent text-[#102141]'
                    : 'border-[rgba(12,29,59,0.55)] bg-[rgba(233,233,234,0.82)] text-[#102141] hover:border-accent hover:bg-accent'
                } ${selected && !isActive ? 'opacity-40' : 'opacity-100'}`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: 30,
                  height: 30,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                }}
              >
                {c.index}
                {isHovered && !selected && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap border border-[rgba(134,216,255,0.45)] bg-deep px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
                    {c.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {selected && (
          <span className="pointer-events-none absolute inset-0 z-20 border-2 border-accent/70" aria-hidden />
        )}
      </div>
    </div>
  )
}
