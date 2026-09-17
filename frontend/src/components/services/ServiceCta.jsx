import { CalendarCheck, PhoneCall } from 'lucide-react'
import Button from '../common/Button'
import { FULL_ADDRESS, SITE, TEL_HREF } from '../../data/site'

/**
 * The closing call to action on the service pages.
 *
 * Two real destinations: the booking page and the phone. Deliberately not
 * reusing the homepage's `CtaBanner`, whose copy is about waiting for a vehicle
 * to land on the lot — true for a buyer, wrong for someone whose brakes are
 * grinding.
 */
export default function ServiceCta({
  title = 'Ready to book it in?',
  description = "Pick a service and a time that suits you, and we'll confirm it by phone or email. If the job turns out to be bigger than expected, we call you before we touch anything.",
}) {
  return (
    <section className="bg-brand-950">
      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 leading-relaxed text-brand-100">{description}</p>
            <p className="mt-4 text-sm text-brand-200">{FULL_ADDRESS}</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Button to="/appointments" variant="accent" icon={CalendarCheck}>
              Book an appointment
            </Button>
            <Button
              href={TEL_HREF}
              variant="white"
              icon={PhoneCall}
              aria-label={`Call the service department on ${SITE.phoneDisplay}`}
            >
              {SITE.phoneDisplay}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
