import { C, PulseDot } from '../diagrams/diagramKit'
import type { ProcessAccent, ProcessStep, SystemProcess } from '../../types/systemProcess'

export const ACCENTS: Record<ProcessAccent, string> = {
  cyan: '#86D8FF',
  amber: '#F2B25C',
  violet: '#C4A6FF',
}

const MONO = 'IBM Plex Mono, monospace'

interface DiagramProps {
  process: SystemProcess
  step: ProcessStep
  stepIndex: number
  playing: boolean
  motion: boolean
}

function PNode({
  x,
  y,
  w,
  h,
  title,
  sub,
  active,
  color,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  active: boolean
  color: string
  dashed?: boolean
}) {
  return (
    <g opacity={active ? 1 : 0.42} style={{ transition: 'opacity 300ms ease' }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={active ? '#1B3A66' : C.nodeFill}
        stroke={active ? color : C.line}
        strokeWidth={active ? 1.6 : 1}
        strokeDasharray={dashed ? '5 4' : undefined}
        style={{ transition: 'stroke 300ms ease, fill 300ms ease' }}
      />
      {active && <rect x={x} y={y} width={w} height={3} fill={color} />}
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 3 : y + h / 2 + 4}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="13"
        letterSpacing="0.1em"
        fill={C.ink}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 14}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="9"
          letterSpacing="0.08em"
          fill={C.muted}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

function PEdge({
  d,
  active,
  color,
  motion,
  dashed = false,
  markerId,
}: {
  d: string
  active: boolean
  color: string
  motion: boolean
  dashed?: boolean
  markerId: string
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={active ? color : C.line}
        strokeWidth={active ? 1.8 : 1.2}
        strokeDasharray={dashed && !active ? '4 5' : undefined}
        opacity={active ? 1 : 0.4}
        className={active && motion ? 'flow-line' : undefined}
        markerEnd={active ? `url(#${markerId})` : undefined}
        style={{ transition: 'opacity 300ms ease, stroke 300ms ease' }}
      />
    </g>
  )
}

function MarkerDefs({ color }: { color: string }) {
  return (
    <defs>
      <marker id="pd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
  )
}

const isOn = (list: string[], id: string) => list.includes(id)

function LoadingDiagram({ step, playing, motion }: Omit<DiagramProps, 'process' | 'stepIndex'>) {
  const color = ACCENTS.cyan
  const n = step.activeNodes
  const e = step.activeEdges
  return (
    <g>
      <MarkerDefs color={color} />
      <PEdge d="M 210 195 H 326" active={isOn(e, 'ssd-ram')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 490 180 H 606" active={isOn(e, 'ram-cpu')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 610 216 H 494" active={isOn(e, 'cpu-ram')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 690 240 V 286" active={isOn(e, 'cpu-gpu')} color={color} motion={motion} dashed markerId="pd-arrow" />
      {playing && isOn(e, 'ssd-ram') && <PulseDot m={motion} cx={222} cy={195} tx={92} ty={0} dur={1.5} />}
      {playing && isOn(e, 'ram-cpu') && <PulseDot m={motion} cx={502} cy={180} tx={92} ty={0} dur={1.5} />}
      {playing && isOn(e, 'cpu-ram') && <PulseDot m={motion} cx={598} cy={216} tx={-92} ty={0} dur={1.5} delay={0.7} />}
      <PNode x={50} y={150} w={160} h={90} title="SSD" sub="PERMANENT STORAGE" active={isOn(n, 'ssd')} color={color} />
      <PNode x={330} y={150} w={160} h={90} title="RAM" sub="WORKING MEMORY" active={isOn(n, 'ram')} color={color} />
      <PNode x={610} y={150} w={160} h={90} title="CPU" sub="PROCESSOR" active={isOn(n, 'cpu')} color={color} />
      <PNode x={610} y={290} w={160} h={64} title="GPU" sub="OUTPUT — WHEN NEEDED" active={isOn(n, 'gpu')} color={color} dashed />
      <text x={50} y={392} fontFamily={MONO} fontSize="10" letterSpacing="0.12em" fill={C.muted}>
        STORAGE → WORKING MEMORY ⇄ PROCESSOR
      </text>
    </g>
  )
}

function PowerDiagram({ step, playing, motion }: Omit<DiagramProps, 'process' | 'stepIndex'>) {
  const color = ACCENTS.amber
  const n = step.activeNodes
  const e = step.activeEdges
  return (
    <g>
      <MarkerDefs color={color} />
      <path d="M 48 118 q 9 -16 18 0 t 18 0 t 18 0 t 18 0" stroke={color} strokeWidth="1.6" fill="none" opacity={isOn(n, 'ac') ? 1 : 0.4} />
      <PEdge d="M 180 200 H 256" active={isOn(e, 'ac-psu')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 440 172 C 505 172, 500 62, 556 62" active={isOn(e, 'psu-motherboard')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 714 62 H 756" active={isOn(e, 'motherboard-cpu')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 440 205 C 505 205, 500 202, 556 202" active={isOn(e, 'psu-gpu')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 440 238 C 505 238, 500 322, 556 322" active={isOn(e, 'psu-ssd')} color={color} motion={motion} markerId="pd-arrow" />
      {playing && isOn(e, 'ac-psu') && <PulseDot m={motion} cx={188} cy={200} tx={56} ty={0} dur={1.3} fill={color} />}
      {playing && isOn(e, 'psu-gpu') && <PulseDot m={motion} cx={452} cy={206} tx={64} ty={-3} dur={1.6} fill={color} />}
      {playing && isOn(e, 'psu-ssd') && <PulseDot m={motion} cx={452} cy={240} tx={64} ty={64} dur={1.8} fill={color} />}
      <PNode x={40} y={160} w={140} h={80} title="AC SOURCE" sub="WALL POWER" active={isOn(n, 'ac')} color={color} />
      <PNode x={260} y={145} w={180} h={110} title="PSU" sub="CONVERSION + REGULATION" active={isOn(n, 'psu')} color={color} />
      <PNode x={560} y={32} w={150} h={60} title="MOTHERBOARD" active={isOn(n, 'motherboard')} color={color} />
      <PNode x={760} y={32} w={100} h={60} title="CPU" sub="VIA BOARD" active={isOn(n, 'cpu')} color={color} />
      <PNode x={560} y={172} w={190} h={60} title="GPU" sub="GRAPHICS CARD" active={isOn(n, 'gpu')} color={color} />
      <PNode x={560} y={292} w={190} h={60} title="SSD" sub="STORAGE DRIVES" active={isOn(n, 'ssd')} color={color} />
      <text x={40} y={392} fontFamily={MONO} fontSize="10" letterSpacing="0.12em" fill={C.muted}>
        AC IN → REGULATED DC → DISTRIBUTED BRANCHES
      </text>
    </g>
  )
}

function GraphicsDiagram({ step, playing, motion }: Omit<DiagramProps, 'process' | 'stepIndex'>) {
  const color = ACCENTS.violet
  const n = step.activeNodes
  const e = step.activeEdges
  const gpuOn = isOn(n, 'gpu')
  return (
    <g>
      <MarkerDefs color={color} />
      <PEdge d="M 220 195 H 316" active={isOn(e, 'cpu-gpu')} color={color} motion={motion} markerId="pd-arrow" />
      <PEdge d="M 560 190 H 656" active={isOn(e, 'gpu-monitor')} color={color} motion={motion} markerId="pd-arrow" />
      {playing && isOn(e, 'cpu-gpu') && <PulseDot m={motion} cx={230} cy={195} tx={74} ty={0} dur={1.4} fill={color} />}
      {playing && isOn(e, 'gpu-monitor') && <PulseDot m={motion} cx={570} cy={190} tx={74} ty={0} dur={1.4} fill={color} />}
      <PNode x={50} y={150} w={170} h={90} title="CPU" sub="+ SOFTWARE" active={isOn(n, 'cpu')} color={color} />
      {/* GPU with frame buffer inset */}
      <g opacity={gpuOn ? 1 : 0.42} style={{ transition: 'opacity 300ms ease' }}>
        <rect x={320} y={105} width={118} height={24} fill={C.nodeFill} stroke={C.line} />
        <text x={379} y={121} textAnchor="middle" fontFamily={MONO} fontSize="9" letterSpacing="0.08em" fill={C.muted}>
          GRAPHICS MEMORY
        </text>
        <rect
          x={320}
          y={140}
          width={240}
          height={150}
          fill={gpuOn ? '#2A2350' : C.nodeFill}
          stroke={gpuOn ? color : C.line}
          strokeWidth={gpuOn ? 1.6 : 1}
          style={{ transition: 'stroke 300ms ease, fill 300ms ease' }}
        />
        {gpuOn && <rect x={320} y={140} width={240} height={3} fill={color} />}
        <text x={440} y={182} textAnchor="middle" fontFamily={MONO} fontSize="14" letterSpacing="0.1em" fill={C.ink}>
          GPU
        </text>
        <text x={440} y={200} textAnchor="middle" fontFamily={MONO} fontSize="9" letterSpacing="0.08em" fill={C.muted}>
          PARALLEL RENDERING
        </text>
        <rect
          x={348}
          y={222}
          width={184}
          height={44}
          fill="none"
          stroke={step.id === 'frame' || step.id === 'display' ? color : C.line}
          strokeWidth={step.id === 'frame' ? 1.8 : 1}
          strokeDasharray="4 4"
        />
        <text x={440} y={249} textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="0.1em" fill={step.id === 'frame' || step.id === 'display' ? C.ink : C.muted}>
          FRAME BUFFER
        </text>
      </g>
      {/* Monitor */}
      <g opacity={isOn(n, 'monitor') ? 1 : 0.42} style={{ transition: 'opacity 300ms ease' }}>
        <rect x={660} y={130} width={180} height={118} fill={C.nodeFill} stroke={isOn(n, 'monitor') ? color : C.line} strokeWidth={isOn(n, 'monitor') ? 1.6 : 1} />
        <rect x={672} y={142} width={156} height={82} fill={isOn(n, 'monitor') ? '#241D45' : '#12294D'} stroke={C.line} />
        <polygon points="684,210 716,172 736,196 754,182 816,210" fill={C.line} opacity="0.9" />
        <line x1={750} y1={248} x2={750} y2={268} stroke={C.line} strokeWidth="3" />
        <line x1={716} y1={270} x2={784} y2={270} stroke={C.line} strokeWidth="3" />
        <text x={750} y={292} textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="0.1em" fill={C.muted}>
          MONITOR
        </text>
      </g>
      <text x={50} y={392} fontFamily={MONO} fontSize="10" letterSpacing="0.12em" fill={C.muted}>
        COMMANDS → RENDER → FRAME → DISPLAY
      </text>
    </g>
  )
}

export default function ProcessDiagram({ process, step, stepIndex, playing, motion }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 880 400"
      className="h-auto w-full"
      role="img"
      aria-label={`${process.label} diagram. Step ${stepIndex + 1} of ${process.steps.length}: ${step.label}. ${step.explanation}`}
    >
      {process.id === 'loading' && <LoadingDiagram step={step} playing={playing} motion={motion} />}
      {process.id === 'power' && <PowerDiagram step={step} playing={playing} motion={motion} />}
      {process.id === 'graphics' && <GraphicsDiagram step={step} playing={playing} motion={motion} />}
    </svg>
  )
}
