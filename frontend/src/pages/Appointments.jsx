import { useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, PhoneCall } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import OpeningHours from '../components/common/OpeningHours'
import PageHeader from '../components/common/PageHeader'
import AppointmentForm from '../components/appointments/AppointmentForm'
import BookingSteps from '../components/appointments/BookingSteps'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { SERVICES } from '../data/services'
import { FULL_ADDRESS, SITE, TEL_HREF } from '../data/site'

/**
 * Booking a service appointment.
 *
 * `?service=oil-change` preselects the service, which is how every "Book this
 * service" button on the site arrives here. An unknown slug falls back to an
 * empty select rather than to a wrong prefill — reading the parameter is not
 * the same as trusting it.
 *
 * The form has no Cancel: it owns the page, so there is nothing to cancel back
 * to. That is the one structural difference from the same form inside a dialog.
 */
export default function Appointments() {
  useDocumentTitle('Book a service appointment')

  const [searchParams] = useSearchParams()
  const requested = searchParams.get('service') ?? ''
  const preselected = SERVICES.some((service) => service.slug === requested)
    ? requested
    : ''

  return (
    <>
      <PageHeader
        eyebrow="Service department"
        title="Book an appointment"
        description="Tell us what the vehicle needs and when suits you. We'll confirm the time by phone or email within one business day."
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: 'Book an appointment' },
        ]}
      />

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-900">
              Appointment details
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Everything marked with an asterisk is needed to hold the slot.
            </p>

            <div className="mt-6">
              <AppointmentForm defaultService={preselected} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card tone="subtle">
              <h2 className="text-sm font-semibold text-brand-900">
                What happens next
              </h2>
              <BookingSteps className="mt-5" />
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-brand-900">
                Find us
              </h2>
              <address className="mt-4 space-y-3 text-sm not-italic">
                <p className="flex items-start gap-3 text-slate-600">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-accent-600"
                    aria-hidden="true"
                  />
                  {FULL_ADDRESS}
                </p>
                <p className="flex items-start gap-3 text-slate-600">
                  <PhoneCall
                    className="mt-0.5 size-4 shrink-0 text-accent-600"
                    aria-hidden="true"
                  />
                  <a href={TEL_HREF} className="hover:text-brand-900">
                    {SITE.phoneDisplay}
                  </a>
                </p>
              </address>

              <OpeningHours className="mt-5 border-t border-slate-100 pt-5" />

              <Button
                href={SITE.googleMapsUrl}
                variant="outline"
                icon={Navigation}
                className="mt-5 w-full"
                rel="noreferrer noopener"
                target="_blank"
              >
                Get directions
              </Button>
            </Card>

            <Card tone="muted">
              <h2 className="text-sm font-semibold text-brand-900">
                Something urgent?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Don&rsquo;t wait on a booking form. Call the shop and we&rsquo;ll
                tell you whether it is safe to drive in or whether it needs a tow.
              </p>
              <Button
                href={TEL_HREF}
                variant="primary"
                icon={PhoneCall}
                className="mt-4 w-full"
              >
                {SITE.phoneDisplay}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
