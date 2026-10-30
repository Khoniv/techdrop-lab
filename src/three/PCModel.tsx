import { useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ComponentId } from '../types/hardware'
import { componentById } from '../data/components'

const ACCENT = '#86D8FF'

interface ModelProps {
  selected: ComponentId | null
  hovered: ComponentId | null
  onSelect: (id: ComponentId) => void
  onHover: (id: ComponentId | null) => void
  reducedMotion: boolean
}

interface PartProps extends Omit<ModelProps, 'reducedMotion'> {
  id: ComponentId
  children: ReactNode
}

/** Wraps one hardware component so hover + click select it as a unit. */
function Part({ id, selected, hovered, onSelect, onHover, children }: PartProps) {
  const click = (e: ThreeEvent<MouseEvent>) => {
    // e.delta is the pointer travel since pointer-down; ignore orbit drags.
    if (e.delta > 6) return
    e.stopPropagation()
    onSelect(id)
  }
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover(null)
    document.body.style.cursor = 'auto'
  }
  void selected
  void hovered
  return (
    <group onClick={click} onPointerOver={over} onPointerOut={out}>
      {children}
    </group>
  )
}

function highlight(selected: boolean, hovered: boolean) {
  if (selected) return { emissive: ACCENT, emissiveIntensity: 0.38 }
  if (hovered) return { emissive: ACCENT, emissiveIntensity: 0.22 }
  return { emissive: '#000000', emissiveIntensity: 0 }
}

/** A fan drawn facing local +Z: ring, hub, and spinning blades. */
function FanUnit({
  radius,
  spin,
  casing = '#22262c',
  selected,
  hovered,
}: {
  radius: number
  spin: boolean
  casing?: string
  selected?: boolean
  hovered?: boolean
}) {
  const blades = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (spin && blades.current) blades.current.rotation.z -= dt * 3.2
  })
  const hi = highlight(!!selected, !!hovered)
  return (
    <group>
      <mesh>
        <torusGeometry args={[radius, radius * 0.14, 10, 36]} />
        <meshStandardMaterial color={casing} roughness={0.6} metalness={0.3} {...hi} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.3, radius * 0.3, radius * 0.22, 20]} />
        <meshStandardMaterial color="#2c3138" roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
            <mesh position={[radius * 0.58, 0, 0]} rotation={[0, 0.55, 0]}>
              <boxGeometry args={[radius * 0.72, radius * 0.36, 0.025]} />
              <meshStandardMaterial color="#3a4048" roughness={0.55} metalness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function CaseShell() {
  const frame = '#31435f'
  const panel = '#141a21'
  return (
    <group>
      {/* back panel */}
      <mesh position={[0, 0, -1.16]}>
        <boxGeometry args={[4.8, 4.6, 0.08]} />
        <meshStandardMaterial color={panel} roughness={0.7} metalness={0.35} />
      </mesh>
      {/* rear panel (left) */}
      <mesh position={[-2.4, 0, 0]}>
        <boxGeometry args={[0.08, 4.6, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.7} metalness={0.35} />
      </mesh>
      {/* top + bottom */}
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[4.8, 0.08, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.7} metalness={0.35} />
      </mesh>
      <mesh position={[0, -2.3, 0]}>
        <boxGeometry args={[4.8, 0.08, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.7} metalness={0.35} />
      </mesh>
      {/* front frame bars (right side) so the intake fans stay visible */}
      {[
        [2.4, 2.3, 0],
        [2.4, -2.3, 0],
        [2.4, 0, 1.15],
        [2.4, 0, -1.15],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={y !== 0 ? [0.09, 0.12, 2.38] : [0.09, 4.7, 0.12]} />
          <meshStandardMaterial color={frame} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {/* open-side frame + faint glass, pushed out so parts stay clickable */}
      {[
        [0, 2.3],
        [0, -2.3],
      ].map(([x, y], i) => (
        <mesh key={`h${i}`} position={[x, y, 1.16]}>
          <boxGeometry args={[4.85, 0.1, 0.08]} />
          <meshStandardMaterial color={frame} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      {[
        [-2.4, 0],
        [2.4, 0],
      ].map(([x, y], i) => (
        <mesh key={`v${i}`} position={[x, y, 1.16]}>
          <boxGeometry args={[0.1, 4.7, 0.08]} />
          <meshStandardMaterial color={frame} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, 1.17]}>
        <planeGeometry args={[4.8, 4.6]} />
        <meshStandardMaterial color="#9fc6ee" transparent opacity={0.05} roughness={0.15} metalness={0.1} depthWrite={false} />
      </mesh>
      {/* feet */}
      {[
        [-2.0, -2.48, 0.85],
        [2.0, -2.48, 0.85],
        [-2.0, -2.48, -0.85],
        [2.0, -2.48, -0.85],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.5, 0.28, 0.5]} />
          <meshStandardMaterial color="#10141a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Motherboard(p: ModelProps) {
  const hi = highlight(p.selected === 'motherboard', p.hovered === 'motherboard')
  return (
    <Part id="motherboard" {...p}>
      <mesh position={[-0.1, 0.42, -0.92]}>
        <boxGeometry args={[4.3, 3.6, 0.09]} />
        <meshStandardMaterial color="#1d4a33" roughness={0.65} metalness={0.2} {...hi} />
      </mesh>
      {/* chipset + capacitors + slots: surface detail that belongs to the board */}
      <mesh position={[1.55, 0.95, -0.85]}>
        <boxGeometry args={[0.55, 0.55, 0.07]} />
        <meshStandardMaterial color="#23272d" roughness={0.45} metalness={0.5} />
      </mesh>
      {[-1.9, -1.62, -1.34].map((x) => (
        <mesh key={x} position={[x, -0.95, -0.83]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
          <meshStandardMaterial color="#8f979f" roughness={0.35} metalness={0.8} />
        </mesh>
      ))}
      {[0.15, -0.55].map((y) => (
        <mesh key={y} position={[-0.4, y - 0.62, -0.86]}>
          <boxGeometry args={[3.1, 0.09, 0.05]} />
          <meshStandardMaterial color="#10151c" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[1.9, 1.9, -0.86]}>
        <boxGeometry args={[0.34, 0.5, 0.06]} />
        <meshStandardMaterial color="#c8a24a" roughness={0.4} metalness={0.7} />
      </mesh>
    </Part>
  )
}

function Cpu(p: ModelProps) {
  const hi = highlight(p.selected === 'cpu', p.hovered === 'cpu')
  return (
    <Part id="cpu" {...p}>
      <mesh position={[-1.15, 1.25, -0.84]}>
        <boxGeometry args={[0.78, 0.78, 0.06]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-1.15, 1.25, -0.79]}>
        <boxGeometry args={[0.56, 0.56, 0.05]} />
        <meshStandardMaterial color="#b9c0c7" roughness={0.25} metalness={0.9} {...hi} />
      </mesh>
    </Part>
  )
}

function Cooler(p: ModelProps) {
  const faded = p.selected === 'cpu'
  const hi = highlight(p.selected === 'cooler', p.hovered === 'cooler')
  const opacity = faded ? 0.14 : 1
  return (
    <Part id="cooler" {...p}>
      <group position={[-1.15, 1.25, -0.38]}>
        {/* fin stack */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -0.3 + i * 0.11]}>
            <boxGeometry args={[1.02, 1.18, 0.055]} />
            <meshStandardMaterial
              color="#aeb6bd"
              roughness={0.35}
              metalness={0.85}
              transparent={faded}
              opacity={opacity}
              depthWrite={!faded}
              {...hi}
            />
          </mesh>
        ))}
        {/* heat pipes */}
        {[-0.3, 0, 0.3].map((x) => (
          <mesh key={x} position={[x, -0.62, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.85, 10]} />
            <meshStandardMaterial color="#b87333" roughness={0.3} metalness={0.9} transparent={faded} opacity={opacity} depthWrite={!faded} />
          </mesh>
        ))}
        {/* front fan */}
        <group position={[0, 0, 0.42]}>
          <FanUnit radius={0.46} spin={!p.reducedMotion} selected={p.selected === 'cooler'} hovered={p.hovered === 'cooler'} />
        </group>
      </group>
    </Part>
  )
}

function Ram(p: ModelProps) {
  const hi = highlight(p.selected === 'ram', p.hovered === 'ram')
  return (
    <Part id="ram" {...p}>
      <group position={[0, 0, 0]}>
        {[0.02, 0.34, 0.66, 0.98].map((x, i) => (
          <group key={i} position={[x, 1.25, -0.74]}>
            <mesh>
              <boxGeometry args={[0.17, 1.45, 0.3]} />
              <meshStandardMaterial color={i % 2 ? '#1c2733' : '#232a33'} roughness={0.5} metalness={0.35} {...hi} />
            </mesh>
            <mesh position={[0, 0.76, 0]}>
              <boxGeometry args={[0.19, 0.07, 0.32]} />
              <meshStandardMaterial color="#86d8ff" roughness={0.4} metalness={0.3} emissive="#86d8ff" emissiveIntensity={p.selected === 'ram' ? 0.7 : 0.15} />
            </mesh>
            {[-0.35, 0.05, 0.45].map((y) => (
              <mesh key={y} position={[0, y, 0.16]}>
                <boxGeometry args={[0.11, 0.26, 0.03]} />
                <meshStandardMaterial color="#0d1116" roughness={0.45} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </Part>
  )
}

function Gpu(p: ModelProps) {
  const hi = highlight(p.selected === 'gpu', p.hovered === 'gpu')
  return (
    <Part id="gpu" {...p}>
      <group position={[-0.55, -0.28, -0.55]}>
        <mesh>
          <boxGeometry args={[2.9, 0.72, 0.42]} />
          <meshStandardMaterial color="#22262c" roughness={0.5} metalness={0.45} {...hi} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[2.9, 0.1, 0.3]} />
          <meshStandardMaterial color="#15181d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-1.52, 0.05, 0]}>
          <boxGeometry args={[0.12, 0.85, 0.44]} />
          <meshStandardMaterial color="#9aa3ab" roughness={0.35} metalness={0.8} />
        </mesh>
        {[-0.8, 0.35].map((x) => (
          <group key={x} position={[x, 0, 0.23]}>
            <FanUnit radius={0.27} spin={!p.reducedMotion} casing="#171a1f" selected={p.selected === 'gpu'} hovered={p.hovered === 'gpu'} />
          </group>
        ))}
      </group>
    </Part>
  )
}

function Ssd(p: ModelProps) {
  const hi = highlight(p.selected === 'ssd', p.hovered === 'ssd')
  return (
    <Part id="ssd" {...p}>
      <group position={[1.35, -0.15, -0.8]}>
        <mesh>
          <boxGeometry args={[1.2, 0.36, 0.07]} />
          <meshStandardMaterial color="#191d23" roughness={0.45} metalness={0.4} {...hi} />
        </mesh>
        {[ -0.36, -0.12, 0.12, 0.36 ].map((x) => (
          <mesh key={x} position={[x, 0, 0.05]}>
            <boxGeometry args={[0.16, 0.28, 0.03]} />
            <meshStandardMaterial color="#2e6f4e" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0.52, 0, 0.02]}>
          <cylinderGeometry args={[0.045, 0.045, 0.05, 10]} />
          <meshStandardMaterial color="#c8a24a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </Part>
  )
}

function Psu(p: ModelProps) {
  const hi = highlight(p.selected === 'psu', p.hovered === 'psu')
  return (
    <Part id="psu" {...p}>
      <group position={[0, -1.93, -0.05]}>
        <mesh>
          <boxGeometry args={[4.35, 0.72, 1.95]} />
          <meshStandardMaterial color="#262c34" roughness={0.6} metalness={0.4} {...hi} />
        </mesh>
        {/* fan grill on top face */}
        <mesh position={[-1.5, 0.37, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 24]} />
          <meshStandardMaterial color="#0c0f13" roughness={0.7} />
        </mesh>
        {/* power cables leaving the PSU toward the board */}
        {[-0.2, 0.05, 0.3].map((x, i) => (
          <mesh key={i} position={[x + 1.4, 0.55, -0.5]}>
            <boxGeometry args={[0.09, 0.45, 0.09]} />
            <meshStandardMaterial color={i === 1 ? '#8c2f2f' : '#20242a'} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </Part>
  )
}

function CaseFans(p: ModelProps) {
  return (
    <Part id="fans" {...p}>
      <group>
        {[1.35, 0.25, -0.85].map((y) => (
          <group key={y} position={[2.08, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <FanUnit radius={0.44} spin={!p.reducedMotion} selected={p.selected === 'fans'} hovered={p.hovered === 'fans'} />
          </group>
        ))}
      </group>
    </Part>
  )
}

export default function PCModel(props: ModelProps) {
  const active = props.selected ?? props.hovered
  return (
    <group>
      <CaseShell />
      <Motherboard {...props} />
      <Cpu {...props} />
      <Cooler {...props} />
      <Ram {...props} />
      <Gpu {...props} />
      <Ssd {...props} />
      <Psu {...props} />
      <CaseFans {...props} />
      {active && (
        <Html position={componentById(active).labelAnchor} center zIndexRange={[20, 0]}>
          <div className="pc-label">
            {componentById(active).index} · {componentById(active).name}
          </div>
        </Html>
      )}
    </group>
  )
}
