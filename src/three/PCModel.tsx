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
  if (selected) return { emissive: ACCENT, emissiveIntensity: 0.10 }
  if (hovered) return { emissive: ACCENT, emissiveIntensity: 0.05 }
  return { emissive: '#000000', emissiveIntensity: 0 }
}

/** A fan drawn facing local +Z: ring, hub, and spinning blades. */
function FanUnit({
  radius,
  spin,
  casing = '#17191d',
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
        <torusGeometry args={[radius, radius * 0.15, 10, 36]} />
        <meshStandardMaterial color={casing} roughness={0.6} metalness={0.3} {...hi} />
      </mesh>
      {/* corner mounts */}
      {[45, 135, 225, 315].map((deg) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh key={deg} position={[Math.cos(a) * radius * 0.98, Math.sin(a) * radius * 0.98, 0]}>
            <boxGeometry args={[radius * 0.22, radius * 0.22, radius * 0.2]} />
            <meshStandardMaterial color={casing} roughness={0.6} metalness={0.3} />
          </mesh>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.3, radius * 0.3, radius * 0.22, 20]} />
        <meshStandardMaterial color="#1d2025" roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
            <mesh position={[radius * 0.58, 0, 0]} rotation={[0, 0.55, 0]}>
              <boxGeometry args={[radius * 0.72, radius * 0.36, 0.025]} />
              <meshStandardMaterial color="#26292f" roughness={0.55} metalness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/**
 * The case stays assembled as the anchor of the exploded view: black steel
 * frame, PSU shroud, a floating top mesh panel and a detached front panel.
 */
function CaseShell() {
  const frame = '#23262d'
  const panel = '#16181d'
  return (
    <group>
      {/* motherboard tray / back panel */}
      <mesh position={[0, 0, -1.16]}>
        <boxGeometry args={[4.8, 4.6, 0.08]} />
        <meshStandardMaterial color={panel} roughness={0.6} metalness={0.45} />
      </mesh>
      {/* cable-management cutouts in the tray */}
      {[
        [1.55, 1.1],
        [1.55, -0.4],
        [-0.6, -1.15],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -1.11]}>
          <boxGeometry args={[0.55, 0.9, 0.02]} />
          <meshStandardMaterial color="#05070a" roughness={0.9} />
        </mesh>
      ))}
      {/* rear panel (left) with exhaust grille hint */}
      <mesh position={[-2.4, 0, 0]}>
        <boxGeometry args={[0.08, 4.6, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.6} metalness={0.45} />
      </mesh>
      <mesh position={[-2.45, 1.45, -0.2]}>
        <boxGeometry args={[0.03, 1.0, 1.0]} />
        <meshStandardMaterial color="#05070a" roughness={0.9} />
      </mesh>
      {/* top + bottom */}
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[4.8, 0.08, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.6} metalness={0.45} />
      </mesh>
      <mesh position={[0, -2.3, 0]}>
        <boxGeometry args={[4.8, 0.08, 2.3]} />
        <meshStandardMaterial color={panel} roughness={0.6} metalness={0.45} />
      </mesh>
      {/* PSU shroud (part of the case; the PSU itself is pulled out) */}
      <mesh position={[0, -1.93, -0.05]}>
        <boxGeometry args={[4.35, 0.72, 1.95]} />
        <meshStandardMaterial color="#1d2026" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[-2.19, -1.93, -0.05]}>
        <boxGeometry args={[0.04, 0.52, 1.25]} />
        <meshStandardMaterial color="#05070a" roughness={0.95} />
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
      {/* open-side frame bars */}
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
      {/* detached top mesh panel, floating above the case */}
      <group position={[0.15, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[4.5, 0.05, 2.05]} />
          <meshStandardMaterial color="#121419" roughness={0.55} metalness={0.5} />
        </mesh>
        {[-0.7, -0.35, 0, 0.35, 0.7].map((z) => (
          <mesh key={z} position={[0, 0.035, z]}>
            <boxGeometry args={[4.3, 0.012, 0.09]} />
            <meshStandardMaterial color="#05070a" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* detached front mesh panel, floating to the right of the case */}
      <group position={[3.45, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 4.5, 2.05]} />
          <meshStandardMaterial color="#121419" roughness={0.55} metalness={0.5} />
        </mesh>
        {[-1.4, -0.7, 0, 0.7, 1.4].map((y) => (
          <mesh key={y} position={[-0.04, y, 0]}>
            <boxGeometry args={[0.012, 0.1, 1.85]} />
            <meshStandardMaterial color="#05070a" roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* feet */}
      {[
        [-2.0, -2.48, 0.85],
        [2.0, -2.48, 0.85],
        [-2.0, -2.48, -0.85],
        [2.0, -2.48, -0.85],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.5, 0.28, 0.5]} />
          <meshStandardMaterial color="#0b0d10" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Board pulled slightly out of the tray; local coords = assembled position. */
function Motherboard(p: ModelProps) {
  const hi = highlight(p.selected === 'motherboard', p.hovered === 'motherboard')
  return (
    <Part id="motherboard" {...p}>
      <group position={[-0.35, 0, 0.55]}>
        <mesh position={[-0.1, 0.42, -0.92]}>
          <boxGeometry args={[4.3, 3.6, 0.09]} />
          <meshStandardMaterial color="#1c1f26" roughness={0.6} metalness={0.3} {...hi} />
        </mesh>
        {/* VRM heatsinks around the socket */}
        <group position={[-1.92, 1.25, -0.84]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, i * 0.07]}>
              <boxGeometry args={[0.34, 1.0, 0.045]} />
              <meshStandardMaterial color="#2b2f36" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}
        </group>
        <group position={[-1.15, 2.02, -0.84]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, i * 0.07]}>
              <boxGeometry args={[0.9, 0.3, 0.045]} />
              <meshStandardMaterial color="#2b2f36" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}
        </group>
        {/* chipset heatsink */}
        <mesh position={[1.3, 0.1, -0.84]}>
          <boxGeometry args={[0.62, 0.62, 0.09]} />
          <meshStandardMaterial color="#23262c" roughness={0.45} metalness={0.6} />
        </mesh>
        {/* empty DIMM slot rails (the sticks float above them) */}
        {[0.02, 0.34, 0.66, 0.98].map((x) => (
          <mesh key={x} position={[x, 1.25, -0.86]}>
            <boxGeometry args={[0.2, 1.5, 0.06]} />
            <meshStandardMaterial color="#08090c" roughness={0.7} />
          </mesh>
        ))}
        {/* PCIe x16 slot rail */}
        <mesh position={[-0.55, -0.28, -0.86]}>
          <boxGeometry args={[2.6, 0.14, 0.06]} />
          <meshStandardMaterial color="#08090c" roughness={0.7} />
        </mesh>
        {/* M.2 slot */}
        <mesh position={[1.35, -0.15, -0.86]}>
          <boxGeometry args={[1.15, 0.3, 0.04]} />
          <meshStandardMaterial color="#08090c" roughness={0.7} />
        </mesh>
        {/* rear I/O block */}
        <group position={[-2.22, 1.55, -0.84]}>
          <mesh>
            <boxGeometry args={[0.28, 0.85, 0.14]} />
            <meshStandardMaterial color="#9aa1a8" roughness={0.35} metalness={0.85} />
          </mesh>
          {[-0.22, 0.08].map((y) => (
            <mesh key={y} position={[-0.02, y, 0.08]}>
              <boxGeometry args={[0.2, 0.2, 0.03]} />
              <meshStandardMaterial color="#0b0d10" roughness={0.6} />
            </mesh>
          ))}
        </group>
        {/* 24-pin power connector */}
        <mesh position={[2.02, 0.45, -0.83]}>
          <boxGeometry args={[0.22, 1.05, 0.12]} />
          <meshStandardMaterial color="#d8d5cc" roughness={0.6} />
        </mesh>
        {/* capacitors */}
        {[
          [-1.9, -0.95],
          [-1.62, -0.95],
          [-1.34, -0.95],
          [0.9, -1.05],
          [1.2, -1.05],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, -0.83]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
            <meshStandardMaterial color="#8f979f" roughness={0.35} metalness={0.8} />
          </mesh>
        ))}
      </group>
    </Part>
  )
}

/** The processor floats above its socket along the install axis. */
function Cpu(p: ModelProps) {
  const hi = highlight(p.selected === 'cpu', p.hovered === 'cpu')
  return (
    <Part id="cpu" {...p}>
      <group position={[-1.5, 1.32, 0.95]} rotation={[0.12, -0.25, 0]}>
        <mesh>
          <boxGeometry args={[0.66, 0.66, 0.05]} />
          <meshStandardMaterial color="#1d5c33" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.52, 0.52, 0.045]} />
          <meshStandardMaterial color="#c3c9cf" roughness={0.22} metalness={0.95} {...hi} />
        </mesh>
        <mesh position={[-0.2, -0.2, 0.075]}>
          <boxGeometry args={[0.09, 0.09, 0.012]} />
          <meshStandardMaterial color="#c8a24a" roughness={0.35} metalness={0.85} />
        </mesh>
      </group>
    </Part>
  )
}

/** The tower cooler hovers furthest along the CPU install axis. */
function Cooler(p: ModelProps) {
  const hi = highlight(p.selected === 'cooler', p.hovered === 'cooler')
  return (
    <Part id="cooler" {...p}>
      <group position={[-2.8, 2.4, 1.5]} rotation={[0, 0.35, 0]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0, 0, -0.33 + i * 0.1]}>
            <boxGeometry args={[1.04, 1.2, 0.05]} />
            <meshStandardMaterial color="#a7aeb6" roughness={0.35} metalness={0.85} {...hi} />
          </mesh>
        ))}
        {[-0.32, 0, 0.32].map((x) => (
          <mesh key={x} position={[x, -0.68, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 10]} />
            <meshStandardMaterial color="#b87333" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, -0.62, -0.02]}>
          <boxGeometry args={[0.7, 0.08, 0.6]} />
          <meshStandardMaterial color="#8a929a" roughness={0.3} metalness={0.9} />
        </mesh>
        <group position={[0, 0, 0.45]}>
          <FanUnit radius={0.47} spin={!p.reducedMotion} selected={p.selected === 'cooler'} hovered={p.hovered === 'cooler'} />
        </group>
      </group>
    </Part>
  )
}

/** Two DIMM modules hover just above their slots on the board. */
function Ram(p: ModelProps) {
  const hi = highlight(p.selected === 'ram', p.hovered === 'ram')
  return (
    <Part id="ram" {...p}>
      <group>
        {[0.0, 0.52].map((x, i) => (
          <group key={i} position={[x - 0.28, 1.45, 0.85]} rotation={[0, -0.12, 0]}>
            <mesh>
              <boxGeometry args={[0.34, 1.42, 0.14]} />
              <meshStandardMaterial color="#262a33" roughness={0.45} metalness={0.5} {...hi} />
            </mesh>
            <mesh position={[0, 0.35, 0.085]}>
              <boxGeometry args={[0.26, 0.6, 0.02]} />
              <meshStandardMaterial color="#121419" roughness={0.5} metalness={0.4} />
            </mesh>
            <mesh position={[0, -0.76, 0]}>
              <boxGeometry args={[0.32, 0.07, 0.1]} />
              <meshStandardMaterial color="#c8a24a" roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.74, 0]}>
              <boxGeometry args={[0.36, 0.06, 0.16]} />
              <meshStandardMaterial color="#26292f" roughness={0.45} metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </Part>
  )
}

/** The graphics card floats out from its PCIe slot, bracket first. */
function Gpu(p: ModelProps) {
  const hi = highlight(p.selected === 'gpu', p.hovered === 'gpu')
  return (
    <Part id="gpu" {...p}>
      <group position={[-1.35, -0.55, 0.95]} rotation={[0, 0.14, 0]}>
        <mesh>
          <boxGeometry args={[2.9, 0.78, 0.46]} />
          <meshStandardMaterial color="#1e2129" roughness={0.45} metalness={0.5} {...hi} />
        </mesh>
        {/* backplate */}
        <mesh position={[0, 0, -0.26]}>
          <boxGeometry args={[2.85, 0.72, 0.05]} />
          <meshStandardMaterial color="#1d2025" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* angular shroud accent */}
        <mesh position={[0.95, 0.1, 0.24]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.7, 0.16, 0.02]} />
          <meshStandardMaterial color="#2b2f36" roughness={0.4} metalness={0.6} />
        </mesh>
        {[-0.8, 0.35].map((x) => (
          <group key={x} position={[x, 0, 0.25]}>
            <FanUnit radius={0.28} spin={!p.reducedMotion} selected={p.selected === 'gpu'} hovered={p.hovered === 'gpu'} />
          </group>
        ))}
        {/* PCIe bracket with display outputs */}
        <group position={[-1.56, 0.02, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.92, 0.48]} />
            <meshStandardMaterial color="#9aa1a8" roughness={0.35} metalness={0.85} />
          </mesh>
          {[-0.22, 0.05, 0.3].map((y) => (
            <mesh key={y} position={[-0.06, y, 0]}>
              <boxGeometry args={[0.03, 0.16, 0.3]} />
              <meshStandardMaterial color="#0b0d10" roughness={0.6} />
            </mesh>
          ))}
        </group>
        {/* gold PCIe edge connector */}
        <mesh position={[-0.7, -0.47, -0.05]}>
          <boxGeometry args={[1.15, 0.14, 0.06]} />
          <meshStandardMaterial color="#c8a24a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* top power connector */}
        <mesh position={[0.9, 0.45, -0.05]}>
          <boxGeometry args={[0.5, 0.12, 0.2]} />
          <meshStandardMaterial color="#0d0f12" roughness={0.6} />
        </mesh>
      </group>
    </Part>
  )
}

/** The M.2 drive floats flat just below its motherboard slot. */
function Ssd(p: ModelProps) {
  const hi = highlight(p.selected === 'ssd', p.hovered === 'ssd')
  return (
    <Part id="ssd" {...p}>
      <group position={[0.85, -1.3, 0.8]} rotation={[-0.45, 0.15, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.05, 0.36]} />
          <meshStandardMaterial color="#101216" roughness={0.45} metalness={0.4} {...hi} />
        </mesh>
        {[-0.32, 0.05, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0.045, 0]}>
            <boxGeometry args={[i === 1 ? 0.24 : 0.28, 0.04, 0.28]} />
            <meshStandardMaterial color="#1b1e24" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        {/* gold edge connector */}
        <mesh position={[-0.66, 0, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.3]} />
          <meshStandardMaterial color="#c8a24a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* mounting screw */}
        <mesh position={[0.55, 0.04, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 10]} />
          <meshStandardMaterial color="#9aa1a8" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>
    </Part>
  )
}

/** The PSU is pulled out of the bottom compartment along its slide path. */
function Psu(p: ModelProps) {
  const hi = highlight(p.selected === 'psu', p.hovered === 'psu')
  return (
    <Part id="psu" {...p}>
      <group position={[-3.7, -1.9, 0.05]}>
        <mesh>
          <boxGeometry args={[1.85, 0.88, 1.65]} />
          <meshStandardMaterial color="#1e2129" roughness={0.55} metalness={0.45} {...hi} />
        </mesh>
        {/* top intake fan grille */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.02, 24]} />
          <meshStandardMaterial color="#08090c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
          <meshStandardMaterial color="#23262c" roughness={0.6} />
        </mesh>
        {/* modular cable ports on the inner face */}
        {[-0.45, 0, 0.45].map((z) =>
          [-0.18, 0.18].map((y) => (
            <mesh key={`${z}-${y}`} position={[0.94, y, z]}>
              <boxGeometry args={[0.03, 0.24, 0.32]} />
              <meshStandardMaterial color="#08090c" roughness={0.7} />
            </mesh>
          )),
        )}
        {/* power socket + switch on the outer face */}
        <mesh position={[-0.94, 0.15, 0.3]}>
          <boxGeometry args={[0.03, 0.3, 0.4]} />
          <meshStandardMaterial color="#08090c" roughness={0.7} />
        </mesh>
        <mesh position={[-0.94, -0.2, 0.3]}>
          <boxGeometry args={[0.03, 0.16, 0.24]} />
          <meshStandardMaterial color="#23262c" roughness={0.6} />
        </mesh>
      </group>
    </Part>
  )
}

/** Three intake fans stay in the case; one exhaust fan floats free. */
function CaseFans(p: ModelProps) {
  return (
    <Part id="fans" {...p}>
      <group>
        {[1.35, 0.25, -0.85].map((y) => (
          <group key={y} position={[2.08, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <FanUnit radius={0.44} spin={!p.reducedMotion} selected={p.selected === 'fans'} hovered={p.hovered === 'fans'} />
          </group>
        ))}
        <group position={[-3.45, 1.0, 0.55]} rotation={[0, 0.4, 0]}>
          <FanUnit radius={0.46} spin={!p.reducedMotion} selected={p.selected === 'fans'} hovered={p.hovered === 'fans'} />
        </group>
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
