import type { ComponentId } from './hardware'

export type ProcessId = 'power' | 'loading' | 'graphics'

/** Role colour for a process: data (cyan), power (amber), graphics (violet). */
export type ProcessAccent = 'cyan' | 'amber' | 'violet'

export interface ProcessStep {
  id: string
  label: string
  explanation: string
  /** Diagram node ids highlighted during this step. */
  activeNodes: string[]
  /** Diagram edge ids carrying flow during this step. */
  activeEdges: string[]
}

export interface SystemProcess {
  id: ProcessId
  /** Display number in the selector: '01' | '02' | '03'. */
  index: string
  label: string
  /** One-line statement of what the diagram demonstrates. */
  summary: string
  description: string
  accent: ProcessAccent
  steps: ProcessStep[]
  /** Hardware that participates, linked back to the Page 01 explorer. */
  components: ComponentId[]
  /** Honesty note about simplifications, shown under the explanation. */
  note: string
}
