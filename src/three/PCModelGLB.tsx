import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { ComponentId, Vec3 } from '../types/hardware'
import { componentById } from '../data/components'

export interface FocusEntry {
  target: Vec3
  camera: Vec3
  label: Vec3
}
export type FocusMap = Partial<Record<ComponentId, FocusEntry>>

const ACCENT = new THREE.Color('#86D8FF')
const MODEL_URL = '/models/pc.glb'

/** Ordered name rules: first match wins, so specific parts beat generic ones. */
const NAME_RULES: Array<[ComponentId, string[]]> = [
  ['cooler', ['cooler', 'tower_cool', 'cpu_fan', 'heatsink_cpu']],
  ['gpu', ['gpu', 'graphics', 'vga', 'video_card', 'videocard']],
  ['cpu', ['cpu', 'processor']],
  ['ram', ['ram', 'dimm', 'memory', 'ddr']],
  ['ssd', ['ssd', 'nvme', 'm2', 'm_2', 'storage']],
  ['psu', ['psu', 'power_supply', 'powersupply', 'power supply']],
  ['fans', ['case_fan', 'casefan', 'intake', 'exhaust', 'fan']],
  ['motherboard', ['motherboard', 'mainboard', 'mobo', 'board', 'pcb']],
]

function classify(name: string): ComponentId | null {
  const n = name.toLowerCase()
  for (const [id, keys] of NAME_RULES) {
    if (keys.some((k) => n.includes(k))) return id
  }
  return null
}

interface Props {
  selected: ComponentId | null
  hovered: ComponentId | null
  onSelect: (id: ComponentId) => void
  onHover: (id: ComponentId | null) => void
  onFocusMap: (map: FocusMap) => void
}

/**
 * Loads an external GLB PC model (public/models/pc.glb), normalizes its size,
 * tags meshes with component ids based on object names, and computes camera
 * focus presets from each component's real bounding box.
 */
export default function PCModelGLB({ selected, hovered, onSelect, onHover, onFocusMap }: Props) {
  const { scene } = useGLTF(MODEL_URL)
  const materials = useRef(new Map<ComponentId, Set<THREE.Material>>())
  const focusMap = useRef<FocusMap>({})

  const root = useMemo(() => {
    const obj = scene.clone(true)
    materials.current.clear()

    // Tag every mesh with the component id of its nearest named ancestor.
    obj.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        let cur: THREE.Object3D | null = node
        let cid: ComponentId | null = null
        while (cur && !cid) {
          cid = classify(cur.name)
          cur = cur.parent
        }
        if (cid) {
          node.userData.cid = cid
          const mesh = node as THREE.Mesh
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          const cloned = mats.map((m) => (m ? m.clone() : m))
          mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]
          if (!materials.current.has(cid)) materials.current.set(cid, new Set())
          cloned.forEach((m) => m && materials.current.get(cid)!.add(m))
        }
      }
    })

    // Normalize: scale so height ≈ 4.9 units, center X/Z, rest bottom at y=-2.45.
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    if (size.y > 0) obj.scale.setScalar(4.9 / size.y)
    const box2 = new THREE.Box3().setFromObject(obj)
    const center = box2.getCenter(new THREE.Vector3())
    obj.position.set(-center.x, -box2.min.y - 2.45, -center.z)
    obj.updateMatrixWorld(true)

    // Focus presets from the real bounds of each tagged component.
    const map: FocusMap = {}
    const byId = new Map<ComponentId, THREE.Box3>()
    obj.traverse((node) => {
      const cid = node.userData.cid as ComponentId | undefined
      if (cid && (node as THREE.Mesh).isMesh) {
        const b = new THREE.Box3().setFromObject(node)
        if (!byId.has(cid)) byId.set(cid, b)
        else byId.get(cid)!.union(b)
      }
    })
    const viewDir = new THREE.Vector3(0.55, 0.32, 1).normalize()
    byId.forEach((b, cid) => {
      const c = b.getCenter(new THREE.Vector3())
      const s = b.getSize(new THREE.Vector3())
      const radius = Math.max(s.x, s.y, s.z) / 2
      const dist = THREE.MathUtils.clamp(radius * 3.4, 2.2, 6)
      const cam = c.clone().add(viewDir.clone().multiplyScalar(dist))
      map[cid] = {
        target: [c.x, c.y, c.z],
        camera: [cam.x, cam.y, cam.z],
        label: [c.x, b.max.y + 0.35, c.z],
      }
    })
    focusMap.current = map
    return obj
  }, [scene])

  useEffect(() => {
    onFocusMap(focusMap.current)
  }, [onFocusMap])

  // Highlight by selection / hover state.
  useEffect(() => {
    materials.current.forEach((mats, cid) => {
      const level = cid === selected ? 0.38 : cid === hovered ? 0.18 : 0
      mats.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial
        if ('emissive' in std) {
          std.emissive.copy(ACCENT)
          std.emissiveIntensity = level
        }
      })
    })
  }, [selected, hovered])

  const cidOf = (e: ThreeEvent<MouseEvent | PointerEvent>): ComponentId | null => {
    let cur: THREE.Object3D | null = e.object
    while (cur) {
      if (cur.userData.cid) return cur.userData.cid as ComponentId
      cur = cur.parent
    }
    return null
  }

  const active = selected ?? hovered
  const activeEntry = active ? focusMap.current[active] : undefined

  return (
    <group>
      <primitive
        object={root}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 6) return
          const cid = cidOf(e)
          if (cid) {
            e.stopPropagation()
            onSelect(cid)
          }
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          const cid = cidOf(e)
          if (cid) {
            e.stopPropagation()
            onHover(cid)
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
      />
      {active && activeEntry && (
        <Html position={activeEntry.label} center zIndexRange={[20, 0]}>
          <div className="pc-label">
            {componentById(active).index} · {componentById(active).name}
          </div>
        </Html>
      )}
    </group>
  )
}
