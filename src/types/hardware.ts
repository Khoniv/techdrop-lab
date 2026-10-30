export type ComponentId =
  | 'motherboard'
  | 'cpu'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'psu'
  | 'cooler'
  | 'fans'

export type Vec3 = [number, number, number]

export interface HardwareComponent {
  id: ComponentId
  index: string
  name: string
  fullName: string
  category: string
  description: string
  primaryFunction: string
  howItWorks: string
  location: string
  facts: string[]
  related: ComponentId[]
  /** Camera preset used when this component is selected. */
  focus: { target: Vec3; camera: Vec3 }
  /** Anchor point for the floating name label in the 3D stage. */
  labelAnchor: Vec3
}
