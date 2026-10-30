import { Suspense, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { ComponentId, Vec3 } from '../types/hardware'
import { componentById } from '../data/components'
import PCModel from './PCModel'

export interface ViewerApi {
  zoomIn: () => void
  zoomOut: () => void
}

const DEFAULT_CAM: Vec3 = [5.2, 2.0, 7.4]
const DEFAULT_TARGET: Vec3 = [0, -0.1, 0]

interface SceneProps {
  selected: ComponentId | null
  hovered: ComponentId | null
  onSelect: (id: ComponentId) => void
  onHover: (id: ComponentId | null) => void
  reducedMotion: boolean
  focusNonce: number
  apiRef: MutableRefObject<ViewerApi | null>
  scrollRef: MutableRefObject<number>
  onReady: () => void
}

/** Eased camera flights to the selected component; user drag cancels a flight. */
function CameraRig({
  selected,
  focusNonce,
  apiRef,
  controlsRef,
  defaultCam,
}: {
  selected: ComponentId | null
  focusNonce: number
  apiRef: MutableRefObject<ViewerApi | null>
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
  defaultCam: Vec3
}) {
  const anim = useRef({
    active: false,
    t: 0,
    duration: 0.75,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTg: new THREE.Vector3(),
    toTg: new THREE.Vector3(),
  })
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const controls = controlsRef.current
    if (!controls) return
    const preset = selected
      ? componentById(selected).focus
      : { camera: defaultCam, target: DEFAULT_TARGET }
    const a = anim.current
    a.fromPos.copy(controls.object.position)
    a.toPos.set(...preset.camera)
    a.fromTg.copy(controls.target)
    a.toTg.set(...preset.target)
    a.t = 0
    a.active = true
  }, [selected, focusNonce, controlsRef, defaultCam])

  useEffect(() => {
    const dolly = (factor: number) => {
      const controls = controlsRef.current
      if (!controls) return
      anim.current.active = false
      const cam = controls.object
      const offset = cam.position.clone().sub(controls.target)
      const len = THREE.MathUtils.clamp(offset.length() * factor, 3.4, 13)
      offset.setLength(len)
      cam.position.copy(controls.target).add(offset)
      controls.update()
    }
    apiRef.current = { zoomIn: () => dolly(0.78), zoomOut: () => dolly(1.28) }
  }, [apiRef, controlsRef])

  useFrame((_, dt) => {
    const controls = controlsRef.current
    const a = anim.current
    if (!controls || !a.active) return
    a.t += dt / a.duration
    const k = a.t >= 1 ? 1 : 1 - Math.pow(1 - a.t, 3)
    controls.object.position.lerpVectors(a.fromPos, a.toPos, k)
    controls.target.lerpVectors(a.fromTg, a.toTg, k)
    controls.update()
    if (a.t >= 1) a.active = false
  })

  return (
    <OrbitControls
      ref={controlsRef as never}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={3.4}
      maxDistance={13}
      minPolarAngle={0.3}
      maxPolarAngle={1.62}
      onStart={() => {
        anim.current.active = false
      }}
    />
  )
}

/** Pointer + scroll parallax on the whole PC group; suspended while inspecting a part. */
function ParallaxGroup({
  selected,
  reducedMotion,
  scrollRef,
  children,
}: {
  selected: ComponentId | null
  reducedMotion: boolean
  scrollRef: MutableRefObject<number>
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    const g = group.current
    if (!g) return
    const idle = !selected && !reducedMotion
    const px = idle ? state.pointer.x : 0
    const py = idle ? state.pointer.y : 0
    const scroll = reducedMotion ? 0 : scrollRef.current
    const rotY = -0.05 + px * 0.055 + scroll * 0.22
    const rotX = -py * 0.03
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, rotY, 0.045)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rotX, 0.045)
    g.position.y = THREE.MathUtils.lerp(g.position.y, scroll * -0.18, 0.05)
  })
  return <group ref={group}>{children}</group>
}

export default function PCScene(props: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  // Narrow (phone) viewports get a wider default framing so the whole case fits.
  const defaultCam: Vec3 =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      ? [7.0, 2.8, 9.9]
      : DEFAULT_CAM
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: defaultCam, fov: 38, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={props.onReady}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 6]} intensity={1.6} color="#eaf2ff" />
      <directionalLight position={[-6, 3, -2]} intensity={0.45} color="#86d8ff" />
      <pointLight position={[0, 0.5, 2.5]} intensity={9} distance={10} color="#bcd8ff" />
      <Suspense fallback={null}>
        <ParallaxGroup selected={props.selected} reducedMotion={props.reducedMotion} scrollRef={props.scrollRef}>
          <PCModel
            selected={props.selected}
            hovered={props.hovered}
            onSelect={props.onSelect}
            onHover={props.onHover}
            reducedMotion={props.reducedMotion}
          />
        </ParallaxGroup>
        <ContactShadows position={[0, -2.66, 0]} opacity={0.6} scale={15} blur={2.8} far={3.2} color="#020610" />
      </Suspense>
      <CameraRig selected={props.selected} focusNonce={props.focusNonce} apiRef={props.apiRef} controlsRef={controlsRef} defaultCam={defaultCam} />
    </Canvas>
  )
}
