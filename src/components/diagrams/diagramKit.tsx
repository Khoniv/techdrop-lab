import type { CSSProperties, ReactNode } from 'react'

/** Shared palette + primitives for the SVG function diagrams. */
export const C = {
  accent: '#86D8FF',
  ink: '#EFF4FC',
  secondary: '#B2C3DB',
  muted: '#8197B5',
  line: '#41619B',
  nodeFill: '#16305A',
  heat: '#FF8A5C',
  heatDeep: '#FF5D3B',
  amber: '#F2B25C',
}

export const MONO = 'IBM Plex Mono, monospace'

/** Flowing-dash class for a path (empty string when motion is off). */
export const fl = (m: boolean, slow = false) => (m ? (slow ? 'flow-line-slow' : 'flow-line') : '')

/** Style-only sequenced highlight (merges with other animation classes). */
export const seqStyle = (m: boolean, delay: number, cycle = 6) =>
  m ? ({ '--delay': `${delay}s`, '--cycle': `${cycle}s` } as CSSProperties) : {}

/** Sequenced highlight props (repeating guided illumination). */
export const seqProps = (m: boolean, delay: number, cycle = 6) =>
  m
    ? {
        className: 'seq',
        style: { '--delay': `${delay}s`, '--cycle': `${cycle}s` } as CSSProperties,
      }
    : {}

export const heatProps = (m: boolean) => (m ? { className: 'heat-pulse' } : {})

export const dotProps = (m: boolean, tx: number, ty: number, dur = 2.4, delay = 0) =>
  m
    ? {
        className: 'pulse-dot',
        style: {
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--dur': `${dur}s`,
          '--delay': `${delay}s`,
        } as CSSProperties,
      }
    : {}

/** Arrowhead markers, namespaced per diagram via `id`. */
export function Defs({ id }: { id: string }) {
  const marker = (suffix: string, color: string) => (
    <marker
      id={`${id}-${suffix}`}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  )
  return (
    <defs>
      {marker('a', C.accent)}
      {marker('h', C.heat)}
      {marker('w', C.amber)}
    </defs>
  )
}

export function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  stroke = C.line,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  stroke?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.nodeFill} stroke={stroke} strokeWidth="1" />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 2 : y + h / 2 + 3}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        letterSpacing="0.08em"
        fill={C.ink}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="8"
          letterSpacing="0.06em"
          fill={C.muted}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

export function Label({
  x,
  y,
  children,
  anchor = 'middle',
  color = C.muted,
  size = 8.5,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'middle' | 'start' | 'end'
  color?: string
  size?: number
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={MONO}
      fontSize={size}
      letterSpacing="0.1em"
      fill={color}
    >
      {children}
    </text>
  )
}

/** A travelling pulse dot on a straight segment of a flow path. */
export function PulseDot({
  m,
  cx,
  cy,
  tx,
  ty,
  dur = 2.4,
  delay = 0,
  fill = C.accent,
  r = 3,
}: {
  m: boolean
  cx: number
  cy: number
  tx: number
  ty: number
  dur?: number
  delay?: number
  fill?: string
  r?: number
}) {
  if (!m) return null
  return <circle cx={cx} cy={cy} r={r} fill={fill} {...dotProps(m, tx, ty, dur, delay)} />
}
