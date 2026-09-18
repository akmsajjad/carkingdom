import {
  BadgeCheck,
  Eye,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import { COMPANY_VALUES } from '../../data/company'

const ICONS = {
  trust: ShieldCheck,
  transparency: Eye,
  quality: BadgeCheck,
  integrity: Scale,
  customerFirst: HeartHandshake,
  professionalism: Users,
}

/**
 * §38's Our Values.
 *
 * Six words with a sentence each, which is the shape §38 asks for — but the
 * words alone would be a poster. The sentence is what makes each one a claim
 * somebody could hold the business to, so it is set as body copy rather than as
 * a caption under a badge.
 *
 * Distinct from the homepage's `WhyChooseUs`, which states four promises about
 * how the lot operates. This is what those promises are built on, and the About
 * page is where a reader who wants to check goes looking.
 */
export default function CompanyValues() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Our values"
          title="Six things we hold ourselves to"
          description="Every business claims these. What follows each one is what it means here, so you can tell whether we mean it."
          align="center"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMPANY_VALUES.map(({ icon, title, description }) => {
            const Icon = ICONS[icon] ?? ShieldCheck

            return (
              <li
                key={title}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent-50">
                  <Icon className="size-5 text-accent-700" aria-hidden="true" />
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
