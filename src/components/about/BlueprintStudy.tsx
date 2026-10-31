import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const LINE = 'rgba(134,216,255,0.75)'
const FAINT = 'rgba(134,216,255,0.4)'
const MONO = 'IBM Plex Mono, monospace'

function Annot({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'end' | 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontSize="10.5" letterSpacing="0.14em" fill="rgba(178,195,219,0.9)">
      {children}
    </text>
  )
}

/**
 * An original line schematic of the same exploded-PC arrangement shown on
 * Page 01 — drawn as an engineering study, not a copy of the illustration.
 * Outlines draw themselves in when the study first scrolls into view.
 */
export default function BlueprintStudy({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setOn(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion])

  const d = (delay: number) => ({ '--d': `${delay}s` }) as CSSProperties
  const draw = (delay: number) => ({ className: 'bp-draw', style: d(delay) })
  const fade = (delay: number) => ({ className: 'bp-fade', style: d(delay) })

  return (
    <div
      ref={ref}
      className={`blueprint-grid relative border border-[rgba(188,211,245,0.22)] bg-deep px-3 pb-3 pt-11 sm:px-5 sm:pb-5 ${on ? 'bp-on' : ''}`}
    >
      <p className="pointer-events-none absolute left-4 top-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        System anatomy <span className="text-accent">/</span> Study 001
      </p>
      <p className="pointer-events-none absolute right-4 top-3.5 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:block">
        Exploded arrangement: line study
      </p>
      <svg viewBox="0 0 880 520" className="h-auto w-full" role="img" aria-label="Line blueprint of the exploded desktop computer: cooler and processor above the motherboard, memory and graphics card beside it, power supply below, all in front of the open case">
        {/* case outline (right) */}
        <path {...draw(0)} pathLength={1} d="M 486 66 H 842 V 470 H 486" fill="none" stroke={LINE} strokeWidth="1.4" />
        <path {...draw(0.15)} pathLength={1} d="M 506 92 H 822 V 444 H 506" fill="none" stroke={FAINT} strokeWidth="1" />
        {/* front intake fans inside the case front edge */}
        {[140, 240, 340].map((cy, i) => (
          <g key={cy} {...fade(0.5 + i * 0.15)}>
            <circle cx={782} cy={cy} r={27} fill="none" stroke={LINE} strokeWidth="1.2" />
            <circle cx={782} cy={cy} r={4} fill="none" stroke={LINE} />
            <g transform={`translate(782 ${cy})`}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <path key={deg} d="M 0 0 q 11 -3 9 -16 q -9 2 -9 16" transform={`rotate(${deg})`} fill="none" stroke={FAINT} strokeWidth="1.1" />
              ))}
            </g>
          </g>
        ))}
        {/* motherboard slab */}
        <path {...draw(0.25)} pathLength={1} d="M 148 336 H 470 V 472 H 148 Z" fill="none" stroke={LINE} strokeWidth="1.4" />
        <g {...fade(0.7)}>
          {[356, 380, 404, 428].map((y) => (
            <line key={y} x1={292} y1={y} x2={452} y2={y} stroke={FAINT} strokeWidth="1" />
          ))}
          <rect x={200} y={366} width={58} height={58} fill="none" stroke={LINE} />
          <rect x={212} y={378} width={34} height={34} fill="none" stroke={FAINT} />
          <rect x={200} y={440} width={110} height={16} fill="none" stroke={FAINT} />
        </g>
        {/* CPU chip, floating above its socket */}
        <g {...fade(0.55)}>
          <rect x={212} y={238} width={62} height={62} fill="none" stroke={LINE} strokeWidth="1.3" />
          <rect x={226} y={252} width={34} height={34} fill="none" stroke={FAINT} />
          {[246, 258, 270].map((x) => (
            <line key={x} x1={x} y1={300} x2={x} y2={312} stroke={FAINT} />
          ))}
        </g>
        {/* cooler tower: fin stack + fan, heat pipes down to the CPU */}
        <g {...fade(0.4)}>
          {[76, 90, 104, 118, 132, 146, 160].map((y) => (
            <line key={y} x1={104} y1={y} x2={196} y2={y} stroke={LINE} strokeWidth="1.1" />
          ))}
          <line x1={104} y1={66} x2={196} y2={66} stroke={LINE} strokeWidth="1.3" />
          <line x1={104} y1={170} x2={196} y2={170} stroke={LINE} strokeWidth="1.3" />
          <circle cx={268} cy={118} r={50} fill="none" stroke={LINE} strokeWidth="1.3" />
          <circle cx={268} cy={118} r={13} fill="none" stroke={LINE} />
          {[20, 92, 164, 236, 308].map((deg) => (
            <path key={deg} d="M 268 118 q 20 -6 16 -30 q -16 3 -16 30" transform={`rotate(${deg} 268 118)`} fill="none" stroke={FAINT} strokeWidth="1.1" />
          ))}
        </g>
        <path {...draw(0.8)} pathLength={1} d="M 128 170 C 128 214, 216 200, 224 238" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path {...draw(0.9)} pathLength={1} d="M 150 170 C 150 222, 238 206, 244 238" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path {...draw(1)} pathLength={1} d="M 172 170 C 172 228, 258 212, 262 238" fill="none" stroke={LINE} strokeWidth="1.2" />
        {/* RAM sticks */}
        <g {...fade(0.65)}>
          {[322, 356].map((x) => (
            <g key={x}>
              <rect x={x} y={212} width={24} height={112} fill="none" stroke={LINE} strokeWidth="1.2" />
              {[228, 248, 268, 288].map((y) => (
                <line key={y} x1={x + 4} y1={y} x2={x + 20} y2={y} stroke={FAINT} />
              ))}
            </g>
          ))}
        </g>
        {/* GPU, floating to the right */}
        <g {...fade(0.75)}>
          <rect x={428} y={238} width={212} height={40} fill="none" stroke={LINE} strokeWidth="1.3" />
          <circle cx={486} cy={258} r={14} fill="none" stroke={FAINT} />
          <circle cx={540} cy={258} r={14} fill="none" stroke={FAINT} />
          <line x1={592} y1={246} x2={628} y2={246} stroke={FAINT} />
          <line x1={592} y1={258} x2={628} y2={258} stroke={FAINT} />
        </g>
        {/* SSD stick above the GPU */}
        <g {...fade(0.85)}>
          <rect x={440} y={196} width={118} height={18} fill="none" stroke={LINE} strokeWidth="1.1" />
          <rect x={452} y={200} width={26} height={10} fill="none" stroke={FAINT} />
          <rect x={486} y={200} width={26} height={10} fill="none" stroke={FAINT} />
        </g>
        {/* PSU, bottom left */}
        <g {...fade(0.6)}>
          <rect x={52} y={386} width={118} height={72} fill="none" stroke={LINE} strokeWidth="1.3" />
          <circle cx={98} cy={422} r={21} fill="none" stroke={FAINT} />
          <circle cx={98} cy={422} r={4} fill="none" stroke={FAINT} />
          {[400, 410, 420, 430, 440].map((y) => (
            <line key={y} x1={136} y1={y} x2={156} y2={y} stroke={FAINT} />
          ))}
        </g>
        {/* annotations */}
        <g {...fade(1.15)}>
          <line x1={60} y1={52} x2={100} y2={70} stroke={FAINT} />
          <Annot x={58} y={46}>CPU COOLER</Annot>
          <line x1={120} y1={262} x2={206} y2={266} stroke={FAINT} />
          <Annot x={44} y={266}>PROCESSOR</Annot>
          <line x1={398} y1={204} x2={384} y2={214} stroke={FAINT} />
          <Annot x={398} y={198}>MEMORY + STORAGE</Annot>
          <line x1={660} y1={252} x2={644} y2={256} stroke={FAINT} />
          <Annot x={664} y={256}>GRAPHICS CARD</Annot>
          <line x1={330} y1={500} x2={330} y2={476} stroke={FAINT} />
          <Annot x={330} y={514} anchor="middle">MOTHERBOARD</Annot>
          <line x1={70} y1={420} x2={82} y2={420} stroke={FAINT} />
          <Annot x={8} y={424}>PSU</Annot>
        </g>
      </svg>
    </div>
  )
}
