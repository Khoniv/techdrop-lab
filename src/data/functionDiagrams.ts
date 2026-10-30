import type { ComponentId } from '../types/hardware'

/**
 * Concise "how it works" content for the floating Function Diagram
 * inspector: a short summary plus the labelled steps its animated SVG
 * diagram walks through. Kept separate from the long study copy in
 * components.ts so the popup stays compact.
 */
export interface FunctionStudy {
  summary: string
  steps: string[]
}

export const functionStudies: Record<ComponentId, FunctionStudy> = {
  motherboard: {
    summary:
      'Every component plugs into the motherboard, but signals do not all pass through one central point. Each device follows its own traces and controller paths across the board, while power from the PSU is distributed along separate routes.',
    steps: ['Components connect to slots & sockets', 'Data travels along dedicated pathways', 'Power is distributed separately'],
  },
  cpu: {
    summary:
      'The CPU works in a repeating cycle: it fetches an instruction from memory, decodes what the instruction means, and executes it. The result flows back to memory and devices, and the cycle immediately continues with the next instruction.',
    steps: ['Fetch instruction', 'Decode it', 'Execute it', 'Result flows out'],
  },
  ram: {
    summary:
      'When the CPU needs data, the memory controller transfers it into RAM, where it sits ready for near-instant access, and writes results back the same way. RAM is volatile: it only holds data while the computer is powered.',
    steps: ['CPU requests data', 'Controller transfers it', 'RAM holds working data', 'Power off — data is lost'],
  },
  gpu: {
    summary:
      'The GPU receives scene and drawing data and splits the work across many small cores running in parallel — a good match for graphics, where millions of pixels need the same operations. The finished frame is then sent on to the display.',
    steps: ['Scene data arrives', 'Cores process in parallel', 'Frame is rendered', 'Frame sent to display'],
  },
  ssd: {
    summary:
      "Read and write requests reach the SSD's controller, which translates them into addresses inside the flash memory chips and moves the data. Flash is non-volatile, so stored data stays put even when the power is off.",
    steps: ['Request arrives', 'Controller maps the address', 'Flash is read or written', 'Data persists without power'],
  },
  psu: {
    summary:
      'The PSU takes AC power from the wall and converts and regulates it into the stable DC voltages computer parts need. Those DC outputs are then routed to the motherboard, processor, graphics card, and drives.',
    steps: ['AC power comes in', 'Converted & regulated', 'DC outputs are routed', 'Components are powered'],
  },
  cooler: {
    summary:
      "Heat from the CPU spreads into the cooler's base and travels up the heat pipes into the fin stack. The fan pushes cool air through the fins; the air absorbs the heat and leaves as warm air, carrying the heat away from the processor.",
    steps: ['Heat generated', 'Heat transfer', 'Air moves through fins', 'Heat leaves with air'],
  },
  fans: {
    summary:
      'Case fans move air in one planned direction: cool air is drawn in, flows across the warm components, and is pushed out as warm air. In this build the front fans are the intake and the rear fan is the exhaust.',
    steps: ['Cool air drawn in at the front', 'Air flows over the components', 'Warm air pushed out at the rear'],
  },
}
