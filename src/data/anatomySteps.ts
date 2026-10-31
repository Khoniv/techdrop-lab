import type { AnatomyStep } from '../types/anatomy'

/**
 * The six-step guided walkthrough for the Slide 03 system anatomy study.
 * Steps reveal all eight components in assembly order: foundation,
 * processing and cooling, memory and storage, graphics, power, airflow.
 * Copy follows the refinement spec verbatim where it prescribes text.
 */
export const ANATOMY_STEPS: AnatomyStep[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    components: ['Motherboard'],
    placement: 'Motherboard: the main board at the center of the case',
    explanation:
      'The motherboard connects major components and provides sockets, slots, and pathways for communication and power distribution.',
  },
  {
    id: 'processing',
    title: 'Processing and cooling',
    components: ['CPU', 'CPU Cooler'],
    placement: 'CPU: the processor socket on the motherboard | CPU Cooler: mounted directly above the CPU',
    explanation:
      'The CPU executes instructions. Its cooler transfers heat away so the processor can operate within safe temperatures.',
    legend: { label: 'Heat transfer', tone: 'heat' },
  },
  {
    id: 'memory-storage',
    title: 'Memory and storage',
    components: ['RAM', 'SSD'],
    placement: 'RAM: the memory slots beside the processor | SSD: the storage interface above the graphics card',
    explanation:
      'The SSD retains files and applications. RAM holds data that is actively needed while software runs.',
    legend: { label: 'Data flow (simplified)', tone: 'data' },
  },
  {
    id: 'graphics',
    title: 'Graphics',
    components: ['GPU'],
    placement: 'GPU: the long expansion slot on the motherboard',
    explanation:
      'The GPU accelerates graphics and parallel workloads and can prepare images for display.',
  },
  {
    id: 'power',
    title: 'Power',
    components: ['PSU'],
    placement: 'PSU: the lower corner of the case, beside the motherboard',
    explanation:
      "The PSU converts incoming electrical power into regulated outputs used by the computer's components.",
    legend: { label: 'Power path (schematic)', tone: 'power' },
  },
  {
    id: 'airflow',
    title: 'Airflow and the complete system',
    components: ['Case Fans'],
    placement: 'Case fans: the front of the case, drawing air across every component',
    explanation:
      'Case fans move air through the enclosure, helping remove heat from the system.',
    legend: { label: 'Airflow', tone: 'air' },
  },
]

/** Which walkthrough step introduces each component (label jump targets). */
export const COMPONENT_STEP: Record<string, number> = {
  motherboard: 0,
  cpu: 1,
  cooler: 1,
  ram: 2,
  ssd: 2,
  gpu: 3,
  psu: 4,
  fans: 5,
}
