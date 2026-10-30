import type { HardwareComponent } from '../types/hardware'

export const COMPONENTS: HardwareComponent[] = [
  {
    id: 'motherboard',
    index: '01',
    name: 'Motherboard',
    fullName: 'Mainboard / System Board',
    category: 'Foundation',
    description:
      'The motherboard is the main circuit board of the computer. Every other component connects to it, directly or through cables, so data and power can move between them.',
    primaryFunction:
      'Connects all hardware together and provides the pathways — buses and controllers — that let the CPU, memory, storage, and expansion cards communicate.',
    howItWorks:
      'Printed copper traces on the board carry electrical signals between sockets and slots. A chipset and firmware (BIOS/UEFI) coordinate the parts when the computer starts, before the operating system loads.',
    location: 'Mounted flat against the back wall of the case, behind every other component.',
    facts: [
      'The small battery on the board keeps the real-time clock running while the PC is off.',
      'Its size standard, such as ATX, decides which cases it fits into.',
    ],
    related: ['cpu', 'ram', 'gpu'],
    focus: { target: [-0.45, 0.4, -0.35], camera: [0.2, 0.9, 5.8] },
    labelAnchor: [-2.2, 2.45, -0.3],
  },
  {
    id: 'cpu',
    index: '02',
    name: 'CPU',
    fullName: 'Central Processing Unit',
    category: 'Processing',
    description:
      'The CPU is the processor — the part that carries out the instructions of every program you run, from the operating system to a game.',
    primaryFunction:
      'Executes instructions and performs calculations, coordinating the work of the rest of the system.',
    howItWorks:
      'It repeatedly fetches an instruction from memory, decodes what it means, and executes it — billions of times per second. Modern CPUs contain several cores, so they can work on many instructions at once. In this exploded view the processor floats above its socket; in an assembled computer it sits clamped beneath the cooler.',
    location: 'In the CPU socket near the top of the motherboard, directly beneath the CPU cooler once assembled.',
    facts: [
      'A modern desktop CPU contains billions of transistors.',
      'Its speed is partly described by clock rate, measured in gigahertz (GHz).',
    ],
    related: ['cooler', 'ram', 'motherboard'],
    focus: { target: [-1.5, 1.32, 0.95], camera: [-0.85, 1.85, 4.1] },
    labelAnchor: [-1.5, 1.95, 1.0],
  },
  {
    id: 'ram',
    index: '03',
    name: 'RAM',
    fullName: 'Random Access Memory',
    category: 'Memory',
    description:
      'RAM temporarily stores the data and instructions the computer is actively using, so the CPU can reach them almost instantly.',
    primaryFunction:
      'Provides fast working memory for open applications and operating-system processes.',
    howItWorks:
      'The CPU reads and writes working data through the memory controller. RAM is volatile: its contents are lost when power is removed, which is why files must be saved to storage.',
    location: 'In the long memory slots on the motherboard, to the right of the CPU socket.',
    facts: [
      'More RAM lets more applications stay open at the same time without slowing down.',
      'RAM is far faster to access than even the quickest SSD — but it forgets everything when the power goes off.',
    ],
    related: ['cpu', 'motherboard', 'ssd'],
    focus: { target: [-0.02, 1.45, 0.85], camera: [0.6, 1.95, 4.1] },
    labelAnchor: [-0.02, 2.45, 0.9],
  },
  {
    id: 'gpu',
    index: '04',
    name: 'GPU',
    fullName: 'Graphics Processing Unit (Graphics Card)',
    category: 'Graphics',
    description:
      'The GPU renders everything you see on the monitor. Its graphics card carries its own processor and its own fast memory, dedicated to images and video.',
    primaryFunction:
      'Calculates and draws images, video, and 3D scenes, and sends the finished picture to the display.',
    howItWorks:
      'Unlike a CPU, a GPU has thousands of smaller cores that perform many similar calculations in parallel — exactly what drawing millions of pixels requires. Its fans move heat away from the card while it works.',
    location: 'In the longest expansion slot on the motherboard, mounted horizontally below the CPU.',
    facts: [
      'The same parallel design that draws games also accelerates AI and scientific computing.',
      'Graphics cards carry their own memory, called VRAM, separate from system RAM.',
    ],
    related: ['motherboard', 'psu', 'cpu'],
    focus: { target: [-1.35, -0.55, 0.95], camera: [-0.3, 0.3, 6.1] },
    labelAnchor: [-1.35, 0.2, 1.0],
  },
  {
    id: 'ssd',
    index: '05',
    name: 'SSD',
    fullName: 'Solid-State Drive',
    category: 'Storage',
    description:
      'The SSD is the computer’s long-term storage. The operating system, applications, and your files live here permanently, even with the power off.',
    primaryFunction:
      'Stores data persistently and loads it quickly when the computer starts or a program opens.',
    howItWorks:
      'An SSD keeps data in flash memory chips. It has no moving parts — nothing spins — so it reads and writes far faster and more quietly than an older mechanical hard disk.',
    location: 'Lies flat in a short M.2 slot on the motherboard, below the graphics card; here it floats just off that slot.',
    facts: [
      'Because an SSD has no moving parts, it also survives bumps and drops better than a hard disk.',
      'Storage capacity is measured in gigabytes (GB) and terabytes (TB).',
    ],
    related: ['motherboard', 'ram', 'psu'],
    focus: { target: [0.85, -1.3, 0.8], camera: [1.5, -0.55, 3.7] },
    labelAnchor: [0.85, -0.8, 0.85],
  },
  {
    id: 'psu',
    index: '06',
    name: 'PSU',
    fullName: 'Power Supply Unit',
    category: 'Power',
    description:
      'The PSU takes electricity from the wall outlet and converts it into the precise, lower voltages that computer components can safely use.',
    primaryFunction:
      'Converts AC power from the wall into regulated DC power and distributes it to every component.',
    howItWorks:
      'Inside, a transformer and control circuits convert alternating current into direct current at several voltages. Cables carry that power to the motherboard, graphics card, and drives.',
    location: 'Slides into the bottom of the case under the metal shroud; in this view it is pulled out along its mounting path.',
    facts: [
      'Every other component depends on the PSU — without it, nothing in the case receives power.',
      'Its capacity is rated in watts (W), which must cover the whole system’s demand.',
    ],
    related: ['motherboard', 'gpu', 'ssd'],
    focus: { target: [-3.7, -1.9, 0.05], camera: [-5.6, -0.9, 3.6] },
    labelAnchor: [-3.7, -1.25, 0.1],
  },
  {
    id: 'cooler',
    index: '07',
    name: 'CPU Cooler',
    fullName: 'CPU Cooling System (Air Tower Cooler)',
    category: 'Cooling',
    description:
      'The CPU cooler removes the heat the processor generates. In this tower design, a stack of metal fins spreads the heat out and a fan pushes air through them.',
    primaryFunction:
      'Keeps the CPU within a safe operating temperature so it can work at full speed without damage.',
    howItWorks:
      'A copper base plate touches the CPU and conducts heat into heat pipes and aluminium fins. The fan blows air across the fins, carrying the heat away. A thin layer of thermal paste fills the microscopic gaps between CPU and cooler.',
    location: 'Bolted directly on top of the CPU, near the top of the motherboard.',
    facts: [
      'If a CPU overheats, it automatically slows itself down to stay safe — this is called thermal throttling.',
      'In this exploded view the cooler hovers along the exact axis it mounts on — moved straight toward the board, it would land on the CPU.',
    ],
    related: ['cpu', 'fans', 'motherboard'],
    focus: { target: [-2.8, 2.4, 1.5], camera: [-1.9, 2.9, 5.4] },
    labelAnchor: [-2.8, 3.3, 1.55],
  },
  {
    id: 'fans',
    index: '08',
    name: 'Case Fans',
    fullName: 'Case Cooling Fans',
    category: 'Cooling',
    description:
      'Case fans move air through the whole enclosure. The three front fans in this case pull cool air in, so it can flow over the components and carry heat out.',
    primaryFunction:
      'Maintain steady airflow through the case, bringing cool air in and pushing warm air out.',
    howItWorks:
      'Angled blades spin to push air in one direction. A typical layout uses front fans as intake and rear or top fans as exhaust, creating one continuous path for air to travel.',
    location: 'Mounted behind the front panel of the case, stacked vertically.',
    facts: [
      'Airflow works best as a path: cool air in at the front, warm air out at the back and top.',
      'Dust filters in front of intake fans slow down dust build-up inside the case.',
    ],
    related: ['cooler', 'psu', 'gpu'],
    focus: { target: [2.0, 0.25, 0], camera: [6.1, 1.0, 3.9] },
    labelAnchor: [2.0, 1.95, 0],
  },
]

export const componentById = (id: string): HardwareComponent =>
  COMPONENTS.find((c) => c.id === id) ?? COMPONENTS[0]
