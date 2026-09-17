import { Link, useParams } from 'react-router-dom'
import { CalendarCheck, Check, Clock, PhoneCall, Wrench } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import OpeningHours from '../components/common/OpeningHours'
import OptimizedImage from '../components/common/OptimizedImage'
import PageHeader from '../components/common/PageHeader'
import { LoadingBlock } from '../components/common/Spinner'
import ServiceCta from '../components/services/ServiceCta'
import ServiceGrid from '../components/services/ServiceGrid'
import ServiceIcon from '../components/services/serviceIcons'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getRelatedServices, getServiceBySlug } from '../services/services'
import { serviceImage } from '../utils/images'
import { formatPriceExact } from '../utils/format'
import { SITE, TEL_HREF } from '../data/site'

/**
 * One service.
 *
 * The two requests are separate for the same reason they are on a vehicle page:
 * the service itself renders as soon as it arrives, and the related strip fills
 * in below without holding anything up.
 */
export default function ServiceDetails() {
  const { slug } = useParams()

  const { data: service, loading, error, reload } = useAsync(
    () => getServiceBySlug(slug),
    slug,
  )

  const { data: related = [], loading: relatedLoading } = useAsync(
    () => getRelatedServices(slug, 3),
    slug,
  )

  useDocumentTitle(service?.name ?? 'Service')

  if (loading && !service) {
    return (
      <div className="container-page py-20">
        <LoadingBlock label="Loading this service…" />
      </div>
    )
  }

  if (error) {
    const notFound = error.status === 404

    return (
      <>
        {/* Both branches keep the dark header so the page still has exactly one
            h1 — what the route sweep checks, and what a screen-reader user
            navigates by. */}
        <PageHeader
          eyebrow={notFound ? 'Not found' : 'Unavailable'}
          title={notFound ? 'We couldn’t find that service' : 'We couldn’t load this service'}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Services', to: '/services' },
            { label: 'Service' },
          ]}
        />

        <div className="container-page py-12">
          {notFound ? (
            <EmptyState
              icon={Wrench}
              title="That service isn't on our list"
              description="It may have been renamed since the link was made. Our full catalogue is one click away — or call us and describe the problem, and we'll tell you whether it's a job for us."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/services">See all services</Button>
                  <Button href={TEL_HREF} variant="outline">
                    Call {SITE.phoneDisplay}
                  </Button>
                </div>
              }
            />
          ) : (
            <ErrorState
              description={
                error.message ||
                'Something went wrong fetching this service. Please try again.'
              }
              onRetry={reload}
            />
          )}
        </div>
      </>
    )
  }

  if (!service) return null

  return (
    <>
      <PageHeader
        eyebrow="Service department"
        title={service.name}
        description={service.tagline}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.name },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            to={`/appointments?service=${service.slug}`}
            variant="accent"
            icon={CalendarCheck}
          >
            Book this service
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

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-10">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div className="aspect-4/3 sm:aspect-video">
                <OptimizedImage
                  src={serviceImage(service.slug)}
                  alt={service.name}
                  category="services"
                  eager
                />
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                What this involves
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                {service.description}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                What&rsquo;s included
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            {service.symptoms?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-brand-900">
                  Signs you need this
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  None of these on their own mean the worst. They mean it is worth
                  having someone look — and the inspection is free on most jobs.
                </p>
                <ul className="mt-5 space-y-3">
                  {service.symptoms.map((symptom) => (
                    <li
                      key={symptom}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500"
                      />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* The buying panel, sticky on a wide screen so the price and the
              booking button stay in view while the detail is read. */}
          <Card className="lg:sticky lg:top-24">
            <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50">
              <ServiceIcon name={service.icon} className="size-5 text-brand-700" />
            </span>

            <p className="mt-4 text-sm text-slate-500">Starting from</p>
            <p className="text-3xl font-bold text-brand-900">
              {formatPriceExact(service.startingPrice)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="size-4" aria-hidden="true" />
              About {service.duration}
            </p>

            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              A starting price, not a quote. We inspect the vehicle first and
              tell you the full cost before any work begins.
            </p>

            <div className="mt-5 space-y-2">
              <Button
                to={`/appointments?service=${service.slug}`}
                variant="accent"
                icon={CalendarCheck}
                className="w-full"
              >
                Book this service
              </Button>
              <Button
                href={TEL_HREF}
                variant="outline"
                icon={PhoneCall}
                className="w-full"
                aria-label={`Call the service department on ${SITE.phoneDisplay}`}
              >
                Call the shop
              </Button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-semibold text-brand-900">
                When we&rsquo;re open
              </h2>
              <OpeningHours className="mt-3" />
            </div>
          </Card>
        </div>

        <Card className="mt-12 bg-slate-50">
          <h2 className="text-xl font-bold text-brand-900">
            Before you book
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>
              Prices are in Canadian dollars and exclude GST and PST. Parts are
              quoted separately on jobs where they are needed.
            </li>
            <li>
              The time you pick is when we start the job. If it runs long, we
              call you rather than leaving you waiting.
            </li>
            <li>
              Booked online and need to change it? Call{' '}
              <a
                href={TEL_HREF}
                className="font-medium text-brand-700 hover:text-brand-900"
              >
                {SITE.phoneDisplay}
              </a>{' '}
              and we&rsquo;ll move it.
            </li>
          </ul>
        </Card>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-brand-900">
                Other things we do
              </h2>
              <Link
                to="/services"
                className="text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                See all services
              </Link>
            </div>

            <ServiceGrid
              services={related}
              loading={relatedLoading}
              compact
              skeletonCount={3}
              className="mt-8"
            />
          </section>
        )}
      </div>

      <ServiceCta
        title="Want it looked at first?"
        description="Book an inspection and we'll tell you what actually needs doing. No upsell, and no work starts until you've approved the price."
      />
    </>
  )
}
