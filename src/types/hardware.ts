export type ComponentId =
  | 'motherboard'
  | 'cpu'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'psu'
  | 'cooler'
  | 'fans'


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
}
