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
  motherboard: { x: 33.5, y: 48, zoom: 1.5 },
  cpu: { x: 29.4, y: 28.1, zoom: 2.6 },
  cooler: { x: 27.8, y: 13.8, zoom: 2.1 },
  ram: { x: 42.6, y: 31.5, zoom: 2.4 },
  gpu: { x: 16.7, y: 61, zoom: 2.0 },
  ssd: { x: 30.9, y: 70.8, zoom: 2.8 },
  psu: { x: 16.8, y: 84.8, zoom: 2.0 },
  fans: { x: 83.2, y: 54.7, zoom: 1.9 },
}
