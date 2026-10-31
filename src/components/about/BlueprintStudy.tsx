import type { CSSProperties, KeyboardEvent } from 'react'
import { COMPONENT_STEP } from '../../data/anatomySteps'

const LINE = 'rgba(134,216,255,0.75)'
const FAINT = 'rgba(134,216,255,0.4)'
const AMBER = '#F2B25C'
const AIR = '#BFE3FF'
const MONO = 'IBM Plex Mono, monospace'

/**
 * The Slide 03 line schematic as a pure SVG stage (original geometry,
 * redrawn for the walkthrough): every component is its own group so the
 * AnatomyStudy step machine can reveal, de-emphasize, and cue them
 * independently. Callouts use a fixed perimeter map with elbow leaders;
 * RAM and SSD / STORAGE own separate zones. On compact viewports only the
 * active step's callouts render, at a larger size, while the panel below
 * carries the full text.
 */

interface StageProps {
  stepIndex: number
  compact: boolean
  motion: boolean
  onJump: (step: number) => void
}

interface LabelDef {
  id: string
  text: string
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  leader: string
}

const LABELS: LabelDef[] = [
  { id: 'cooler', text: 'CPU COOLER', x: 58, y: 46, anchor: 'start', leader: 'M 62 52 L 100 68' },
  { id: 'cpu', text: 'CPU', x: 44, y: 266, anchor: 'start', leader: 'M 88 262 L 206 266' },
  { id: 'ram', text: 'RAM', x: 351, y: 188, anchor: 'middle', leader: 'M 351 194 L 351 208' },
  { id: 'ssd', text: 'SSD / STORAGE', x: 600, y: 166, anchor: 'middle', leader: 'M 578 172 L 578 190 L 560 196' },
  { id: 'gpu', text: 'GPU / GRAPHICS CARD', x: 534, y: 308, anchor: 'middle', leader: 'M 534 296 L 534 282' },
  { id: 'fans', text: 'CASE FANS', x: 826, y: 108, anchor: 'end', leader: 'M 788 114 L 784 134' },
  { id: 'psu', text: 'PSU / POWER SUPPLY', x: 52, y: 502, anchor: 'start', leader: 'M 110 492 L 110 462' },
  { id: 'motherboard', text: 'MOTHERBOARD', x: 330, y: 514, anchor: 'middle', leader: 'M 330 500 L 330 476' },
]

export default function BlueprintStudy({ stepIndex, compact, motion, onJump }: StageProps) {
  /** Group emphasis: future parts ghost, past parts rest, active parts full. */
  const state = (intro: number, enterTransform?: string): CSSProperties => {
    const base: CSSProperties = {
      opacity: stepIndex === intro ? 1 : stepIndex > intro ? 0.5 : 0.1,
      transition: motion ? 'opacity 500ms ease, transform 600ms ease' : undefined,
    }
    if (enterTransform && stepIndex < intro) base.transform = enterTransform
    return base
  }
  const caseStyle: CSSProperties = {
    opacity: stepIndex === 5 ? 0.9 : 0.5,
    transition: motion ? 'opacity 500ms ease' : undefined,
  }

  const fanBlades = (r: number) =>
    [0, 72, 144, 216, 288].map((deg) => (
      <path
        key={deg}
        d={`M 0 0 q ${r * 0.62} ${-r * 0.17} ${r * 0.5} ${-r * 0.92} q ${-r * 0.55} ${r * 0.17} ${-r * 0.5} ${r * 0.92}`}
        transform={`rotate(${deg})`}
        fill="none"
        stroke={FAINT}
        strokeWidth="1.1"
      />
    ))

  const jump = (step: number) => onJump(step)
  const labelKey = (e: KeyboardEvent, step: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onJump(step)
    }
  }

  const visibleLabels = compact
    ? LABELS.filter((l) => COMPONENT_STEP[l.id] === stepIndex)
    : LABELS

  return (
    <svg
      viewBox="0 0 880 520"
      className="h-auto w-full"
      role="img"
      aria-label="Line blueprint of the exploded desktop computer, revealed step by step: motherboard first, then processor and cooler, memory and storage, graphics card, power supply, and case fans in front of the open case"
    >
      {/* case outline (right) */}
      <g style={caseStyle}>
        <path d="M 486 66 H 842 V 470 H 486" fill="none" stroke={LINE} strokeWidth="1.4" />
        <path d="M 506 92 H 822 V 444 H 506" fill="none" stroke={FAINT} strokeWidth="1" />
      </g>

      {/* motherboard slab + features */}
      <g data-component="motherboard" style={state(0)}>
        <path d="M 148 336 H 470 V 472 H 148 Z" fill="none" stroke={LINE} strokeWidth="1.4" />
        {[356, 380, 404, 428].map((y) => (
          <line key={y} x1={292} y1={y} x2={452} y2={y} stroke={FAINT} strokeWidth="1" />
        ))}
        <rect x={200} y={366} width={58} height={58} fill="none" stroke={LINE} />
        <rect x={212} y={378} width={34} height={34} fill="none" stroke={FAINT} />
        <rect x={200} y={440} width={110} height={16} fill="none" stroke={FAINT} />
      </g>

      {/* PSU, bottom left (revealed at the power step) */}
      <g data-component="psu" style={state(4, 'translate(-18px, 0)')}>
        <rect x={52} y={386} width={118} height={72} fill="none" stroke={LINE} strokeWidth="1.3" />
        <circle cx={98} cy={422} r={21} fill="none" stroke={FAINT} />
        <circle cx={98} cy={422} r={4} fill="none" stroke={FAINT} />
        {[400, 410, 420, 430, 440].map((y) => (
          <line key={y} x1={136} y1={y} x2={156} y2={y} stroke={FAINT} />
        ))}
      </g>

      {/* CPU chip, floats down onto its socket at the processing step */}
      <g data-component="cpu" style={state(1, 'translate(0, -30px)')}>
        <rect x={212} y={238} width={62} height={62} fill="none" stroke={LINE} strokeWidth="1.3" />
        <rect x={226} y={252} width={34} height={34} fill="none" stroke={FAINT} />
        {[246, 258, 270].map((x) => (
          <line key={x} x1={x} y1={300} x2={x} y2={312} stroke={FAINT} />
        ))}
      </g>

      {/* cooler tower: fin stack + fan, heat pipes down to the CPU */}
      <g data-component="cooler" style={state(1, 'translate(0, -16px)')}>
        {[76, 90, 104, 118, 132, 146, 160].map((y) => (
          <line key={y} x1={104} y1={y} x2={196} y2={y} stroke={LINE} strokeWidth="1.1" />
        ))}
        <line x1={104} y1={66} x2={196} y2={66} stroke={LINE} strokeWidth="1.3" />
        <line x1={104} y1={170} x2={196} y2={170} stroke={LINE} strokeWidth="1.3" />
        <circle cx={268} cy={118} r={50} fill="none" stroke={LINE} strokeWidth="1.3" />
        <circle cx={268} cy={118} r={13} fill="none" stroke={LINE} />
        <g transform="translate(268 118)">
          <g
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            className={motion && stepIndex === 1 ? 'spin-slow' : undefined}
          >
            {fanBlades(30)}
          </g>
        </g>
        <path d="M 128 170 C 128 214, 216 200, 224 238" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path d="M 150 170 C 150 222, 238 206, 244 238" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path d="M 172 170 C 172 228, 258 212, 262 238" fill="none" stroke={LINE} strokeWidth="1.2" />
      </g>

      {/* heat-transfer cue: the pipes glow amber while the cooling step runs */}
      {stepIndex === 1 && (
        <g className={motion ? 'heat-pulse' : undefined} aria-hidden="true">
          <path d="M 128 170 C 128 214, 216 200, 224 238" fill="none" stroke={AMBER} strokeWidth="1.6" />
          <path d="M 150 170 C 150 222, 238 206, 244 238" fill="none" stroke={AMBER} strokeWidth="1.6" />
          <path d="M 172 170 C 172 228, 258 212, 262 238" fill="none" stroke={AMBER} strokeWidth="1.6" />
        </g>
      )}

      {/* RAM sticks */}
      <g data-component="ram" style={state(2, 'translate(0, -16px)')}>
        {[322, 356].map((x) => (
          <g key={x}>
            <rect x={x} y={212} width={24} height={112} fill="none" stroke={LINE} strokeWidth="1.2" />
            {[228, 248, 268, 288].map((y) => (
              <line key={y} x1={x + 4} y1={y} x2={x + 20} y2={y} stroke={FAINT} />
            ))}
          </g>
        ))}
      </g>

      {/* SSD stick above the GPU */}
      <g data-component="ssd" style={state(2, 'translate(0, -12px)')}>
        <rect x={440} y={196} width={118} height={18} fill="none" stroke={LINE} strokeWidth="1.1" />
        <rect x={452} y={200} width={26} height={10} fill="none" stroke={FAINT} />
        <rect x={486} y={200} width={26} height={10} fill="none" stroke={FAINT} />
      </g>

      {/* conceptual data flow, storage to working memory (memory step only) */}
      {stepIndex === 2 && (
        <path
          d="M 452 218 C 438 240, 404 228, 384 242"
          fill="none"
          stroke={LINE}
          strokeWidth="1.4"
          className={motion ? 'flow-line' : undefined}
          strokeDasharray={motion ? undefined : '5 6'}
          aria-hidden="true"
        />
      )}

      {/* GPU, slides in from the left at the graphics step */}
      <g data-component="gpu" style={state(3, 'translate(-24px, 0)')}>
        <rect x={428} y={238} width={212} height={40} fill="none" stroke={LINE} strokeWidth="1.3" />
        <circle cx={486} cy={258} r={14} fill="none" stroke={FAINT} />
        <circle cx={540} cy={258} r={14} fill="none" stroke={FAINT} />
        <line x1={592} y1={246} x2={628} y2={246} stroke={FAINT} />
        <line x1={592} y1={258} x2={628} y2={258} stroke={FAINT} />
      </g>

      {/* conceptual power distribution (power step only, schematic) */}
      {stepIndex === 4 && (
        <g aria-hidden="true">
          <path
            d="M 140 384 C 146 362, 152 350, 160 340"
            fill="none"
            stroke={AMBER}
            strokeWidth="1.4"
            className={motion ? 'flow-line' : undefined}
            strokeDasharray={motion ? undefined : '5 6'}
          />
          <path
            d="M 168 392 C 260 340, 380 300, 424 268"
            fill="none"
            stroke={AMBER}
            strokeWidth="1.4"
            className={motion ? 'flow-line-slow' : undefined}
            strokeDasharray={motion ? undefined : '5 6'}
          />
        </g>
      )}

      {/* case fans, front edge of the case */}
      <g data-component="fans" style={state(5)}>
        {[140, 240, 340].map((cy) => (
          <g key={cy}>
            <circle cx={782} cy={cy} r={27} fill="none" stroke={LINE} strokeWidth="1.2" />
            <circle cx={782} cy={cy} r={4} fill="none" stroke={LINE} />
            <g transform={`translate(782 ${cy})`}>
              <g
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                className={motion && stepIndex === 5 ? 'spin-slow' : undefined}
              >
                {fanBlades(16)}
              </g>
            </g>
          </g>
        ))}
      </g>

      {/* directional airflow (airflow step only): in at the front fans, across the case */}
      {stepIndex === 5 && (
        <g aria-hidden="true" stroke={AIR} strokeWidth="1.4" fill="none">
          {[140, 240, 340].map((cy) => (
            <g key={cy} className={motion ? 'flow-line' : undefined} strokeDasharray={motion ? undefined : '5 6'}>
              <line x1={742} y1={cy} x2={706} y2={cy} />
              <path d={`M 716 ${cy - 4} L 706 ${cy} L 716 ${cy + 4}`} />
            </g>
          ))}
          <path
            d="M 690 240 C 620 232, 560 244, 492 236"
            className={motion ? 'flow-line-slow' : undefined}
            strokeDasharray={motion ? undefined : '5 6'}
          />
          <path d="M 502 232 L 492 236 L 502 240" />
        </g>
      )}

      {/* callouts: fixed perimeter map, elbow leaders, clickable to jump */}
      <g fontFamily={MONO} letterSpacing="0.14em">
        {visibleLabels.map((l) => {
          const step = COMPONENT_STEP[l.id]
          const isActive = step === stepIndex
          return (
            <g
              key={l.id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${l.text}`}
              className="cursor-pointer"
              opacity={compact || isActive ? 1 : 0.5}
              onClick={() => jump(step)}
              onKeyDown={(e) => labelKey(e, step)}
            >
              <path
                d={l.leader}
                fill="none"
                stroke={isActive ? LINE : FAINT}
                strokeWidth={compact ? 2 : 1}
              />
              <text
                x={l.x}
                y={l.y}
                textAnchor={l.anchor}
                fontSize={compact ? 25 : 10.5}
                fill={isActive ? 'rgba(220,240,255,0.98)' : 'rgba(178,195,219,0.9)'}
              >
                {l.text}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
