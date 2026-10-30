import type { ComponentId } from '../types/hardware'

/**
 * Marker position and zoom focus for each component on the exploded-view
 * illustration. x/y are percentages of the image (0–100, origin top-left),
 * measured on the illustration itself; zoom is the magnification applied
 * when the component is selected.
 */
export interface Hotspot {
  x: number
  y: number
  zoom: number
}

export const hotspots: Record<ComponentId, Hotspot> = {
  motherboard: { x: 32.5, y: 42.4, zoom: 1.5 },
  cpu: { x: 27.8, y: 24.1, zoom: 2.6 },
  cooler: { x: 27.5, y: 12.1, zoom: 2.1 },
  ram: { x: 42.2, y: 27.3, zoom: 2.4 },
  gpu: { x: 15.9, y: 54.4, zoom: 2.0 },
  ssd: { x: 33.6, y: 62, zoom: 2.8 },
  psu: { x: 15.8, y: 76.1, zoom: 2.0 },
  fans: { x: 80.8, y: 48.4, zoom: 1.9 },
}
