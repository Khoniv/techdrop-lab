/** One step of the Slide 03 anatomy walkthrough. */
export type AnatomyPathTone = 'heat' | 'data' | 'power' | 'air'

export interface AnatomyStep {
  id: string
  /** Display title, e.g. "Memory and storage". */
  title: string
  /** Component names highlighted by this step. */
  components: string[]
  /** Where the highlighted parts sit in the drawing. */
  placement: string
  /** One or two sentences of beginner-friendly explanation. */
  explanation: string
  /** Legend for the animated pathway shown during this step, if any. */
  legend?: { label: string; tone: AnatomyPathTone }
}
