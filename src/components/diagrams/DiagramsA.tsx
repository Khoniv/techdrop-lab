import { C, Defs, Label, Node, PulseDot, fl, seqProps, seqStyle } from './diagramKit'

const svgProps = {
  viewBox: '0 0 440 200',
  className: 'h-auto w-full',
  role: 'img' as const,
}

/**
 * Motherboard — each device keeps its own pathway to the board; power is
 * distributed on separate (amber) routes. Nothing funnels through one point.
 */
export function MotherboardDiagram({ m }: { m: boolean }) {
  const d = 'mb'
  const dataPath = (x1: number, y: number, x2: number, delay: number) => (
    <g key={`${x1}-${y}`}>
      <path
        d={`M ${x1} ${y} H ${x2}`}
        stroke={C.accent}
        strokeWidth="1.4"
        fill="none"
        className={`${fl(m)} ${m ? 'seq' : ''}`}
        style={seqStyle(m, delay)}
        markerEnd={`url(#${d}-a)`}
      />
    </g>
  )
  return (
    <svg {...svgProps} aria-label="Diagram: components connect to the motherboard along their own data pathways, while power is distributed separately">
      <Defs id={d} />
      {/* component nodes, left */}
      <Node x={15} y={22} w={86} h={32} title="CPU" />
      <Node x={15} y={84} w={86} h={32} title="RAM" />
      <Node x={15} y={146} w={86} h={32} title="GPU" />
      {/* component nodes, right */}
      <Node x={339} y={22} w={86} h={32} title="SSD" />
      <Node x={339} y={146} w={86} h={32} title="PSU" stroke={C.amber} />
      {/* the board */}
      <rect x={196} y={14} width={48} height={164} fill="#12294D" stroke={C.line} />
      {[40, 70, 100, 130, 160].map((y) => (
        <line key={y} x1={202} y1={y} x2={238} y2={y} stroke={C.line} strokeWidth="1" opacity="0.6" />
      ))}
      <text
        x={220}
        y={96}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="9"
        letterSpacing="0.14em"
        fill={C.secondary}
        transform="rotate(-90 220 96)"
      >
        MOTHERBOARD
      </text>
      {/* dedicated data pathways */}
      {dataPath(101, 38, 192, 0)}
      {dataPath(101, 100, 192, 0.7)}
      {dataPath(101, 162, 192, 1.4)}
      <path d="M 339 38 H 248" stroke={C.accent} strokeWidth="1.4" fill="none" className={`${fl(m)} ${m ? 'seq' : ''}`} style={seqStyle(m, 2.1)} markerEnd={`url(#${d}-a)`} />
      {/* distributed power (amber, separate routes) */}
      <path d="M 339 162 H 300 V 186 H 232 V 182" stroke={C.amber} strokeWidth="1.4" fill="none" className={fl(m, true)} markerEnd={`url(#${d}-w)`} />
      <path d="M 352 178 V 190 H 58 V 182" stroke={C.amber} strokeWidth="1.4" fill="none" className={fl(m, true)} markerEnd={`url(#${d}-w)`} />
      <PulseDot m={m} cx={110} cy={38} tx={72} ty={0} dur={1.8} />
      <PulseDot m={m} cx={330} cy={38} tx={-72} ty={0} dur={1.8} delay={0.9} />
      {/* legend */}
      <line x1={120} y1={193} x2={142} y2={193} stroke={C.accent} strokeWidth="1.6" />
      <Label x={148} y={196} anchor="start" color={C.secondary}>DATA / CONTROL</Label>
      <line x1={262} y1={193} x2={284} y2={193} stroke={C.amber} strokeWidth="1.6" />
      <Label x={290} y={196} anchor="start" color={C.secondary}>POWER</Label>
    </svg>
  )
}

/** CPU — the fetch → decode → execute cycle, looping continuously. */
export function CpuDiagram({ m }: { m: boolean }) {
  const d = 'cpu'
  const stage = (x: number, title: string, delay: number) => (
    <g key={title}>
      <rect x={x} y={78} width={100} height={46} fill="#16305A" stroke={C.line} />
      <rect x={x} y={78} width={100} height={46} fill={C.accent} fillOpacity={0.38} {...seqProps(m, delay, 3.6)} />
      <text x={x + 50} y={105} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.1em" fill={C.ink}>
        {title}
      </text>
    </g>
  )
  return (
    <svg {...svgProps} aria-label="Diagram: the CPU repeatedly fetches an instruction from memory, decodes it, executes it, and sends the result back">
      <Defs id={d} />
      <Node x={20} y={16} w={110} h={32} title="MEMORY" sub="INSTRUCTIONS + DATA" />
      <path d="M 75 48 V 74" stroke={C.accent} strokeWidth="1.4" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      {stage(20, 'FETCH', 0)}
      {stage(170, 'DECODE', 1.2)}
      {stage(320, 'EXECUTE', 2.4)}
      <path d="M 120 101 H 166" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <path d="M 270 101 H 316" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <PulseDot m={m} cx={126} cy={101} tx={34} ty={0} dur={1.4} />
      <PulseDot m={m} cx={276} cy={101} tx={34} ty={0} dur={1.4} delay={0.7} />
      {/* result flows back */}
      <path d="M 370 124 V 158 H 75 V 128" stroke={C.amber} strokeWidth="1.4" fill="none" strokeDasharray="4 4" className={fl(m, true)} markerEnd={`url(#${d}-w)`} />
      <Label x={222} y={172} color={C.secondary}>RESULT FLOWS BACK — THEN THE CYCLE REPEATS</Label>
    </svg>
  )
}

/** RAM — writes flow in, reads flow out; the store is volatile. */
export function RamDiagram({ m }: { m: boolean }) {
  const d = 'ram'
  return (
    <svg {...svgProps} aria-label="Diagram: the memory controller writes data into RAM and reads it back for the CPU; RAM loses its contents when power is removed">
      <Defs id={d} />
      <Node x={12} y={66} w={118} h={62} title="CPU" sub="+ CONTROLLER" />
      {/* write path (in) */}
      <path d="M 130 82 H 238" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <Label x={184} y={72} color={C.secondary}>WRITE</Label>
      <PulseDot m={m} cx={140} cy={82} tx={88} ty={0} dur={1.6} />
      {/* read path (out) */}
      <path d="M 238 112 H 130" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <Label x={184} y={130} color={C.secondary}>READ</Label>
      <PulseDot m={m} cx={228} cy={112} tx={-88} ty={0} dur={1.6} delay={0.8} />
      {/* RAM bank */}
      <rect x={242} y={30} width={186} height={118} fill="#12294D" stroke={C.line} />
      <Label x={335} y={48} color={C.secondary}>RAM — WORKING MEMORY</Label>
      {[58, 80, 102].map((y, i) => (
        <g key={y} {...seqProps(m, i * 0.5, 3)}>
          <rect x={256} y={y} width={158} height={15} fill={C.nodeFill} stroke={C.line} />
          {[282, 308, 334, 360, 386].map((x) => (
            <line key={x} x1={x} y1={y + 2} y2={y + 13} x2={x} stroke={C.line} opacity="0.7" />
          ))}
        </g>
      ))}
      <Label x={335} y={138} color={C.amber}>VOLATILE — EMPTY WHEN POWER IS OFF</Label>
    </svg>
  )
}

/** GPU — one input stream split across many parallel cores, then framed out. */
export function GpuDiagram({ m }: { m: boolean }) {
  const d = 'gpu'
  const cores = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: 168 + (i % 3) * 44,
    y: 52 + Math.floor(i / 3) * 48,
    delay: i * 0.3,
  }))
  return (
    <svg {...svgProps} aria-label="Diagram: scene data enters the GPU, is processed by many cores in parallel, and leaves as a rendered frame for the display">
      <Defs id={d} />
      <Node x={12} y={70} w={100} h={56} title="SCENE DATA" sub="DRAW COMMANDS" />
      <path d="M 112 98 H 158" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <PulseDot m={m} cx={118} cy={98} tx={32} ty={0} dur={1.3} />
      <Label x={226} y={38} color={C.secondary}>PARALLEL PROCESSING</Label>
      {cores.map((c) => (
        <g key={`${c.x}-${c.y}`}>
          <rect x={c.x} y={c.y} width={36} height={36} fill={C.nodeFill} stroke={C.line} />
          <rect x={c.x} y={c.y} width={36} height={36} fill={C.accent} fillOpacity={0.4} {...seqProps(m, c.delay, 3)} />
          <rect x={c.x + 11} y={c.y + 11} width={14} height={14} fill="none" stroke={C.accent} strokeWidth="1" opacity="0.8" />
        </g>
      ))}
      <path d="M 292 98 H 322" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <PulseDot m={m} cx={296} cy={98} tx={20} ty={0} dur={1.3} delay={0.6} />
      {/* rendered frame */}
      <rect x={326} y={52} width={102} height={92} fill="#12294D" stroke={C.line} />
      <polygon points="338,128 366,92 384,116 398,100 416,128" fill={C.line} opacity="0.85" />
      <circle cx={406} cy={70} r={6} fill={C.amber} opacity="0.9" />
      <Label x={377} y={160} color={C.secondary}>RENDERED FRAME</Label>
      <Label x={377} y={176} color={C.muted}>→ SENT TO DISPLAY</Label>
    </svg>
  )
}
