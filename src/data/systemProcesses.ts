import type { ProcessId, SystemProcess } from '../types/systemProcess'

/**
 * The three Page 02 workflows. One source of truth: the selector, the
 * animated diagram highlights, the timeline, and the explanation all
 * derive from this data plus the current step index.
 */
export const SYSTEM_PROCESSES: SystemProcess[] = [
  {
    id: 'power',
    index: '01',
    label: 'Power Distribution',
    summary: 'How electricity from the wall becomes the regulated DC power every component runs on.',
    description:
      'Every part of the computer runs on carefully regulated direct current, but the wall socket supplies alternating current. Follow the conversion and distribution that bridge the two.',
    accent: 'amber',
    steps: [
      {
        id: 'entry',
        label: 'Power enters',
        explanation:
          'AC electricity from the wall socket enters the power supply unit (PSU). At this point the power is not yet in a form computer parts can use.',
        activeNodes: ['ac', 'psu'],
        activeEdges: ['ac-psu'],
      },
      {
        id: 'conversion',
        label: 'Conversion & regulation',
        explanation:
          'Inside the PSU, AC is converted to DC and regulated into stable voltage rails. Clean, steady power protects sensitive electronics from fluctuations.',
        activeNodes: ['psu'],
        activeEdges: [],
      },
      {
        id: 'distribution',
        label: 'Power is distributed',
        explanation:
          'Separate power connections carry DC power from the PSU to the motherboard, on to the CPU\u2019s power delivery, and directly to the graphics card and storage drives \u2014 each receiving the voltages it is designed for.',
        activeNodes: ['psu', 'motherboard', 'cpu', 'gpu', 'ssd'],
        activeEdges: ['psu-motherboard', 'motherboard-cpu', 'psu-gpu', 'psu-ssd'],
      },
      {
        id: 'operating',
        label: 'Components operate',
        explanation:
          'Powered components regulate power further on their own boards and begin operating under their own control. The system is powered and ready to work.',
        activeNodes: ['psu', 'motherboard', 'cpu', 'gpu', 'ssd'],
        activeEdges: ['psu-motherboard', 'motherboard-cpu', 'psu-gpu', 'psu-ssd'],
      },
    ],
    components: ['psu', 'motherboard', 'cpu', 'gpu', 'ssd'],
    note: 'Conceptual model \u2014 simplified for learning. Actual voltage rails and connectors vary by hardware.',
  },
  {
    id: 'loading',
    index: '02',
    label: 'Application Loading',
    summary: 'How an application travels from permanent storage into working memory and is processed by the CPU.',
    description:
      'An application begins as files on a storage drive, but programs do not run from storage. Follow the path that loads an application into memory and puts the processor to work.',
    accent: 'cyan',
    steps: [
      {
        id: 'read',
        label: 'Read from storage',
        explanation:
          'The application begins as code and data stored on the SSD. When you launch it, the system locates and requests those files from storage.',
        activeNodes: ['ssd'],
        activeEdges: [],
      },
      {
        id: 'load',
        label: 'Load into memory',
        explanation:
          'The requested code and data travel from the SSD into RAM. Working memory is far faster to access, so the program is staged there, ready for the processor.',
        activeNodes: ['ssd', 'ram'],
        activeEdges: ['ssd-ram'],
      },
      {
        id: 'process',
        label: 'Process instructions',
        explanation:
          'The CPU repeatedly fetches instructions from RAM, decodes them, and executes them \u2014 reading inputs and writing results back to memory as the program runs.',
        activeNodes: ['ram', 'cpu'],
        activeEdges: ['ram-cpu', 'cpu-ram'],
      },
      {
        id: 'respond',
        label: 'Produce a response',
        explanation:
          'The running program produces results: windows and text on screen, sound, or saved files. Depending on the application, output hardware such as the GPU helps present them.',
        activeNodes: ['cpu', 'gpu'],
        activeEdges: ['cpu-gpu'],
      },
    ],
    components: ['ssd', 'ram', 'cpu', 'gpu'],
    note: 'Conceptual model \u2014 simplified for learning. Real systems also involve caches and controllers not shown here.',
  },
  {
    id: 'graphics',
    index: '03',
    label: 'Graphics Processing',
    summary: 'How a frame is prepared by the CPU, rendered by the GPU, and shown on the display.',
    description:
      'Every image on the screen is produced by a continuous pipeline of work shared between the processor and the graphics hardware. Follow a single frame through it.',
    accent: 'violet',
    steps: [
      {
        id: 'prepare',
        label: 'Prepare the workload',
        explanation:
          'The CPU and the running software prepare graphics commands and data: what to draw, where it belongs, and which geometry and textures it needs.',
        activeNodes: ['cpu'],
        activeEdges: [],
      },
      {
        id: 'render',
        label: 'GPU processing',
        explanation:
          'The commands and data are sent to the GPU. Its many parallel cores compute the image \u2014 positioning geometry, shading surfaces, and applying effects \u2014 using fast graphics memory.',
        activeNodes: ['cpu', 'gpu'],
        activeEdges: ['cpu-gpu'],
      },
      {
        id: 'frame',
        label: 'Frame is assembled',
        explanation:
          'The finished image is assembled in the GPU\u2019s frame buffer: a complete frame, held ready to be sent out as an image signal.',
        activeNodes: ['gpu'],
        activeEdges: [],
      },
      {
        id: 'display',
        label: 'Display',
        explanation:
          'The image signal travels to the monitor, which displays the frame. The whole path repeats dozens of times per second, which is what makes motion on screen look smooth.',
        activeNodes: ['gpu', 'monitor'],
        activeEdges: ['gpu-monitor'],
      },
    ],
    components: ['cpu', 'gpu'],
    note: 'A representative workflow. A dedicated GPU is shown; many computers use integrated graphics in the CPU, which follow an analogous path.',
  },
]

export const processById = (id: ProcessId): SystemProcess =>
  SYSTEM_PROCESSES.find((p) => p.id === id) ?? SYSTEM_PROCESSES[1]
