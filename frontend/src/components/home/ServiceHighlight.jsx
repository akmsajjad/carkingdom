import { ArrowRight, CalendarCheck, Clock } from 'lucide-react'
import Button from '../common/Button'
import SectionHeading from '../common/SectionHeading'
import { serviceIcon } from '../services/serviceIcons'
import { FEATURED_SERVICE_SLUGS, SERVICES } from '../../data/services'
import { formatPriceExact } from '../../utils/format'

const HIGHLIGHTED = FEATURED_SERVICE_SLUGS.map((slug) =>
  SERVICES.find((service) => service.slug === slug),
).filter(Boolean)

/**
 * The homepage's service-department section.
 *
 * The cards are not links: the service-detail pages arrive in Phase 4, and four
 * separate links all landing on the same not-yet-built page is worse than a
 * section that simply states what the shop does. The two CTAs below are real
 * destinations today.
 */
export default function ServiceHighlight() {
  return (
    <section className="bg-brand-950 text-white">
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Service department"
            title="We fix them too"
            description="Our own shop on Dudley Street handles everything from an oil change to a provincial safety inspection. Booked online, done the same week."
            tone="dark"
            className="max-w-2xl"
          />

          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button to="/services" variant="white" iconRight={ArrowRight}>
              All services
            </Button>
            <Button
              to="/contact?intent=appointment"
              variant="accent"
              icon={CalendarCheck}
            >
              Book appointment
            </Button>
          </div>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTED.map((service) => {
            const Icon = serviceIcon(service.icon)

            return (
              <li
                key={service.slug}
                className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent-500/15">
                  <Icon className="size-5 text-accent-400" aria-hidden="true" />
                </span>

                <h3 className="mt-4 text-base font-semibold">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-100">
                  {service.tagline}
                </p>

                <p className="mt-5 flex items-center justify-between gap-2 border-t border-white/10 pt-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-brand-200">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {service.duration}
                  </span>
                  <span className="font-semibold text-accent-400">
                    From {formatPriceExact(service.startingPrice)}
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
