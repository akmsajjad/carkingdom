import { CalendarCheck, PhoneCall } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ErrorState from '../components/common/ErrorState'
import OpeningHours from '../components/common/OpeningHours'
import PageHeader from '../components/common/PageHeader'
import SectionHeading from '../components/common/SectionHeading'
import { LoadingBlock } from '../components/common/Spinner'
import BookingSteps from '../components/appointments/BookingSteps'
import ServiceCta from '../components/services/ServiceCta'
import ServiceGrid from '../components/services/ServiceGrid'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getServices } from '../services/services'
import { FULL_ADDRESS, SITE, TEL_HREF } from '../data/site'

/**
 * The service catalogue.
 *
 * Everything the shop does, in one list, each with a price, a duration and a
 * way to book it. The prices are "from" figures and say so — a brake job
 * quoted at a flat rate before anyone has looked at the car is a number that
 * changes on the invoice.
 */
export default function Services() {
  useDocumentTitle('Services')

  const { data: services, loading, error, reload } = useAsync(() => getServices())

  return (
    <>
      <PageHeader
        eyebrow="Service department"
        title="Services"
        description="Our own shop on Dudley Street, run by licensed technicians. Book online, and we'll confirm the time with you before you bring the vehicle in."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      >
        <div className="flex flex-wrap gap-3">
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
      </PageHeader>

      <div className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="What we do"
          title="Everything under one roof"
          description="Mechanical repair, maintenance, tires, inspections and detailing. If it is not on this list, call us — we will tell you honestly whether it is a job for us."
        />

        {loading && !services ? (
          <LoadingBlock className="mt-10" label="Loading services…" />
        ) : error ? (
          <ErrorState
            className="mt-10"
            title="We couldn't load the service list"
            description={
              error.message || 'The catalogue is unavailable right now.'
            }
            onRetry={reload}
          />
        ) : (
          <ServiceGrid
            services={services ?? []}
            skeletonCount={6}
            className="mt-10"
          />
        )}

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-bold text-brand-900">
              How booking works
            </h2>
            <BookingSteps className="mt-6" />
          </Card>

          <Card className="bg-slate-50">
            <h2 className="text-xl font-bold text-brand-900">When we&rsquo;re open</h2>
            <OpeningHours className="mt-5" />
            <p className="mt-5 border-t border-slate-200 pt-5 text-sm leading-relaxed text-slate-600">
              {FULL_ADDRESS}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Saturdays fill up first. If you need a specific time, book a few
              days ahead or call us.
            </p>
          </Card>
        </div>
      </div>

      <ServiceCta />
    </>
  )
}
