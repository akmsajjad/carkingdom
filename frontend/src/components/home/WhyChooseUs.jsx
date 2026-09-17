import { BadgeDollarSign, ShieldCheck, Wallet, Wrench } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import { VALUE_PROPS } from '../../data/company'

const ICONS = {
  inspection: ShieldCheck,
  pricing: BadgeDollarSign,
  financing: Wallet,
  service: Wrench,
}

/**
 * The "why buy here" section.
 *
 * These are the questions a used-car buyer actually asks — was it inspected,
 * is the price real, can I get financed, who fixes it afterwards — answered in
 * the order they come up. The copy lives in `data/company.js` so the About page
 * can make the same promises without retyping them.
 */
export default function WhyChooseUs() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why Car Kingdom"
          title="Four things we do differently"
          description="Buying a used car in Saskatchewan should not require a second opinion on the paperwork. Here is what we commit to instead."
          align="center"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon, title, description }) => {
            const Icon = ICONS[icon] ?? ShieldCheck

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
