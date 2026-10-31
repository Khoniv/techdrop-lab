import { ArrowRight, ArrowUpRight } from 'lucide-react'
import AnatomyStudy from './AnatomyStudy'

const PHILOSOPHY: Array<{ index: string; title: string; text: string }> = [
  {
    index: '01',
    title: 'Observe',
    text: 'See how the major components fit within an actual desktop computer system.',
  },
  {
    index: '02',
    title: 'Explore',
    text: 'Select hardware markers and inspect the role of each component through interactive explanations.',
  },
  {
    index: '03',
    title: 'Understand',
    text: 'Follow animated system workflows to learn how components cooperate.',
  },
]

const GOALS: Array<{ term: string; text: string }> = [
  { term: 'Educational', text: 'Make basic computer architecture easier to understand.' },
  { term: 'Interactive', text: 'Let visitors inspect hardware instead of only reading about it.' },
  { term: 'Accessible', text: 'Provide clear navigation, understandable explanations, and responsive layouts.' },
  { term: 'Focused', text: 'No shopping, scoring, or unrelated systems. Only the machine and how it works.' },
]

/** FIG. 03 — Behind the Project: a concise visual case study. */
export default function AboutSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section id="about" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-20 md:px-10 lg:px-14" aria-labelledby="behind-project-title">
      <div className="border-t border-[rgba(188,211,245,0.18)] pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Fig. 03 <span className="text-accent">/</span> Behind the project
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h2 id="behind-project-title" className="max-w-xl text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-[1.05]">
            Built to make technology understandable.
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-secondary">
            TechDrop Lab turns the internal structure and behavior of a desktop computer into a
            clear, interactive learning experience.
          </p>
        </div>
      </div>

      {/* Observe → Explore → Understand */}
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {PHILOSOPHY.map((stage, i) => (
          <li key={stage.index} className="relative border-t-2 border-[rgba(188,211,245,0.25)] pt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{stage.index}</p>
              {i < PHILOSOPHY.length - 1 && (
                <ArrowRight size={15} aria-hidden className="hidden text-muted md:block" />
              )}
            </div>
            <h3 className="mt-2 text-lg font-bold uppercase tracking-wide text-ink">{stage.title}</h3>
            <p className="mt-2 max-w-xs leading-relaxed text-secondary">{stage.text}</p>
          </li>
        ))}
      </ol>

      {/* Technical blueprint study: animated anatomy walkthrough */}
      <div className="mt-10">
        <AnatomyStudy reducedMotion={reducedMotion} />
      </div>

      {/* Goals and attribution */}
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Project goals</h3>
          <dl className="mt-3 space-y-4">
            {GOALS.map((g) => (
              <div key={g.term} className="flex gap-4">
                <dt className="w-28 shrink-0 font-medium text-ink">{g.term}</dt>
                <dd className="leading-relaxed text-secondary">{g.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Created by</h3>
          <p className="mt-3 leading-relaxed text-secondary">
            Built by <span className="text-ink">Khonif Zakaria</span>, software engineer, as a
            learning and portfolio project.
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <a
              href="https://nivdev.ai.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between gap-2 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
            >
              Portfolio: nivdev.ai.id
              <ArrowUpRight size={15} aria-hidden />
            </a>
            <a
              href="https://github.com/Khoniv"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between gap-2 border border-[rgba(188,211,245,0.25)] px-4 py-2.5 text-sm text-secondary transition-colors hover:border-accent hover:text-ink"
            >
              GitHub: Khoniv
              <ArrowUpRight size={15} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
