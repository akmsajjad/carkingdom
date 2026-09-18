import { Clock, GraduationCap, HeartHandshake, TrendingUp } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import { WHY_WORK_WITH_US } from '../../data/careers'

const ICONS = {
  schedule: Clock,
  training: GraduationCap,
  growth: TrendingUp,
  benefits: HeartHandshake,
}

/**
 * The "why work here" band.
 *
 * Sits on the slate background so it reads as a break between the two halves of
 * the careers page — what the shop is like, and what is actually open. The copy
 * lives in `data/careers.js` so it can be rewritten without touching a
 * component, and so the icon names stay data rather than imports in a data file.
 */
export default function WhyWorkWithUs() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why work here"
          title="What we offer that other shops don't"
          description="None of this is unusual on its own. All of it at once, in a shop with fourteen people in it, is."
          align="center"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_WORK_WITH_US.map(({ icon, title, description }) => {
            const Icon = ICONS[icon] ?? HeartHandshake

            return (
              <li
                key={title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="size-5 text-brand-700" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-brand-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
