import { C, Defs, Label, Node, PulseDot, fl, heatProps, seqProps, seqStyle } from './diagramKit'

const svgProps = {
  viewBox: '0 0 440 200',
  className: 'h-auto w-full',
  role: 'img' as const,
}

/** SSD — requests and data pass through the controller to persistent flash. */
export function SsdDiagram({ m }: { m: boolean }) {
  const d = 'ssd'
  return (
    <svg {...svgProps} aria-label="Diagram: read and write requests pass through the SSD controller to flash memory, which keeps data without power">
      <Defs id={d} />
      <Node x={12} y={66} w={104} h={62} title="SYSTEM" sub="READ / WRITE" />
      <Node x={168} y={66} w={104} h={62} title="CONTROLLER" sub="MAPS ADDRESSES" />
      {/* requests: system -> controller -> flash */}
      <path d="M 116 86 H 164" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <path d="M 272 86 H 316" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <Label x={220} y={58} color={C.secondary}>REQUESTS →</Label>
      <PulseDot m={m} cx={276} cy={86} tx={32} ty={0} dur={1.4} />
      {/* data returns: flash -> controller -> system */}
      <path d="M 316 112 H 272" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <path d="M 164 112 H 116" stroke={C.accent} strokeWidth="1.6" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <Label x={220} y={140} color={C.secondary}>← DATA</Label>
      <PulseDot m={m} cx={160} cy={112} tx={-32} ty={0} dur={1.4} delay={0.7} />
      {/* flash bank — cells stay lit: non-volatile */}
      <rect x={320} y={34} width={108} height={126} fill="#12294D" stroke={C.line} />
      <Label x={374} y={52} color={C.secondary}>FLASH MEMORY</Label>
      {[64, 92, 120].map((y) =>
        [332, 368].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={30} height={20} fill={C.nodeFill} stroke={C.accent} strokeOpacity="0.55" />
        )),
      )}
      <Label x={374} y={178} color={C.amber}>KEEPS DATA WITHOUT POWER</Label>
    </svg>
  )
}

/** PSU — AC in, conversion/regulation in the middle, DC out to the parts. */
export function PsuDiagram({ m }: { m: boolean }) {
  const d = 'psu'
  const out = (y: number, label: string, delay: number) => (
    <g key={label}>
      <path d={`M 292 100 C 320 100, 310 ${y + 15}, 336 ${y + 15}`} stroke={C.amber} strokeWidth="1.4" fill="none" className={fl(m, true)} markerEnd={`url(#${d}-w)`} />
      <Node x={340} y={y} w={88} h={30} title={label} stroke={C.amber} />
      {delay >= 0 && <PulseDot m={m} cx={298} cy={100} tx={30} ty={y + 15 - 100} dur={1.8} delay={delay} fill={C.amber} />}
    </g>
  )
  return (
    <svg {...svgProps} aria-label="Diagram: AC power from the wall is converted and regulated by the PSU into DC outputs for the motherboard, CPU, and graphics card">
      <Defs id={d} />
      {/* AC sine glyph */}
      <path d="M 18 40 q 8 -14 16 0 t 16 0 t 16 0 t 16 0" stroke={C.amber} strokeWidth="1.6" fill="none" {...heatProps(m)} />
      <Node x={12} y={66} w={96} h={62} title="AC INPUT" sub="WALL POWER" stroke={C.amber} />
      <path d="M 108 97 H 152" stroke={C.amber} strokeWidth="1.6" fill="none" className={fl(m, true)} markerEnd={`url(#${d}-w)`} />
      <PulseDot m={m} cx={112} cy={97} tx={32} ty={0} dur={1.5} fill={C.amber} />
      <Node x={156} y={58} w={132} h={78} title="CONVERSION" sub="+ REGULATION" stroke={C.amber} />
      <Label x={222} y={160} color={C.secondary}>STABLE DC VOLTAGES OUT</Label>
      {out(22, 'MOTHERBOARD', 0)}
      {out(84, 'CPU', 0.6)}
      {out(146, 'GPU + DRIVES', 1.2)}
    </svg>
  )
}

/**
 * CPU Cooler — the benchmark diagram. Heat (orange) rises from the CPU
 * through the base and heat pipes into the fins; cool air (blue) is pushed
 * through the fins and leaves as warm air.
 */
export function CoolerDiagram({ m }: { m: boolean }) {
  const d = 'cool'
  return (
    <svg {...svgProps} aria-label="Diagram: heat travels from the CPU into the cooler base and heat pipes, spreads into the fins, and is carried away by air flowing through them">
      <Defs id={d} />
      {/* fin stack */}
      <g {...seqProps(m, 1.2, 6)}>
        {[30, 40, 50, 60, 70].map((y) => (
          <rect key={y} x={64} y={y} width={118} height={5} fill={C.line} />
        ))}
      </g>
      <Label x={123} y={20} color={C.secondary}>FIN STACK</Label>
      {/* heat pipes: heat rises from base to fins */}
      {[86, 106, 126, 146].map((x, i) => (
        <path key={x} d={`M ${x} 148 V 78`} stroke={C.heat} strokeWidth="2.4" fill="none" className={`${fl(m, true)} ${m ? 'seq' : ''}`} style={seqStyle(m, 0.5 + i * 0.15, 6)} />
      ))}
      <PulseDot m={m} cx={106} cy={142} tx={0} ty={-56} dur={2} fill={C.heat} />
      <PulseDot m={m} cx={126} cy={142} tx={0} ty={-56} dur={2} delay={1} fill={C.heat} />
      {/* base + CPU heat source */}
      <rect x={70} y={148} width={104} height={9} fill={C.muted} />
      <rect x={82} y={160} width={80} height={26} fill="#5A2E1E" stroke={C.heatDeep} {...heatProps(m)} />
      <text x={122} y={177} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="0.1em" fill="#FFD9C7">
        CPU
      </text>
      <Label x={122} y={198} color={C.heat}>HEAT SOURCE</Label>
      {/* cool air in (left, through the fins) */}
      <path d="M 6 100 H 56" stroke={C.accent} strokeWidth="1.8" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <PulseDot m={m} cx={12} cy={100} tx={36} ty={0} dur={1.5} />
      <Label x={32} y={88} color={C.accent}>COOL AIR IN</Label>
      <path d="M 30 108 H 178" stroke={C.accent} strokeWidth="1" fill="none" opacity="0.45" className={fl(m, true)} />
      {/* fan (right of fins) — subtle slow rotation drives the air */}
      <g>
        <circle cx={228} cy={100} r={27} fill="none" stroke={C.line} strokeWidth="1.4" />
        <g className={m ? 'spin-slow' : undefined}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M 228 100 q 12 -4 10 -18 q -10 2 -10 18"
              fill={C.secondary}
              opacity="0.85"
              transform={`rotate(${deg} 228 100)`}
            />
          ))}
        </g>
        <circle cx={228} cy={100} r={4.5} fill={C.muted} />
      </g>
      <Label x={228} y={142} color={C.secondary}>FAN</Label>
      {/* warm air out (right) */}
      <path d="M 262 100 H 348" stroke={C.heat} strokeWidth="1.8" fill="none" className={fl(m)} markerEnd={`url(#${d}-h)`} />
      <PulseDot m={m} cx={268} cy={100} tx={64} ty={0} dur={1.7} fill={C.heat} />
      <Label x={306} y={88} color={C.heat}>WARM AIR OUT</Label>
      <path d="M 268 112 H 340" stroke={C.heat} strokeWidth="1" fill="none" opacity="0.45" className={fl(m, true)} />
      <Label x={436} y={122} anchor="end" color={C.muted}>HEAT CARRIED AWAY</Label>
    </svg>
  )
}

/** Case Fans — front intake, flow across the case, rear exhaust. */
export function FansDiagram({ m }: { m: boolean }) {
  const d = 'fans'
  const fanSquare = (x: number, y: number, color: string) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={32} height={32} fill="#12294D" stroke={color} />
      <circle cx={x + 16} cy={y + 16} r={10} fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx={x + 16} cy={y + 16} r={2.6} fill={color} />
    </g>
  )
  return (
    <svg {...svgProps} aria-label="Diagram: front fans draw cool air into the case, air flows across the components, and the rear fan pushes warm air out">
      <Defs id={d} />
      {/* case outline */}
      <rect x={92} y={22} width={248} height={152} fill="none" stroke={C.line} strokeDasharray="5 4" />
      <Label x={104} y={38} anchor="start" color={C.muted}>CASE</Label>
      {/* interior components */}
      <rect x={120} y={52} width={16} height={110} fill={C.nodeFill} stroke={C.line} />
      <rect x={150} y={118} width={86} height={20} fill={C.nodeFill} stroke={C.line} />
      <Label x={193} y={131} color={C.muted} size={8}>COMPONENTS</Label>
      {/* streamlines: right (intake) -> left (exhaust) */}
      {[64, 100, 136].map((y) => (
        <path key={y} d={`M 336 ${y} H 132`} stroke={C.accent} strokeWidth="1.1" fill="none" opacity="0.55" className={fl(m, true)} />
      ))}
      <PulseDot m={m} cx={320} cy={64} tx={-150} ty={0} dur={2.6} />
      <PulseDot m={m} cx={320} cy={136} tx={-150} ty={0} dur={2.6} delay={1.3} />
      {/* intake fans on the front (right edge of the case) */}
      {fanSquare(342, 42, C.accent)}
      {fanSquare(342, 84, C.accent)}
      {fanSquare(342, 126, C.accent)}
      <path d="M 424 58 H 380" stroke={C.accent} strokeWidth="1.8" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <path d="M 424 142 H 380" stroke={C.accent} strokeWidth="1.8" fill="none" className={fl(m)} markerEnd={`url(#${d}-a)`} />
      <Label x={398} y={30} color={C.accent}>INTAKE · COOL AIR IN</Label>
      {/* exhaust fan on the rear (left) */}
      {fanSquare(58, 84, C.heat)}
      <path d="M 52 100 H 12" stroke={C.heat} strokeWidth="1.8" fill="none" className={fl(m)} markerEnd={`url(#${d}-h)`} />
      <PulseDot m={m} cx={48} cy={100} tx={-30} ty={0} dur={1.4} fill={C.heat} />
      <Label x={58} y={140} color={C.heat}>EXHAUST</Label>
      <Label x={58} y={154} color={C.heat}>WARM AIR OUT</Label>
    </svg>
  )
}
