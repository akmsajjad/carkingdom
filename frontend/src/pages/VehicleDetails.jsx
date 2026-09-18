import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CarFront, Calendar, MessageSquare } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import PageHeader from '../components/common/PageHeader'
import { LoadingBlock } from '../components/common/Spinner'
import VehicleActionBar from '../components/vehicles/VehicleActionBar'
import VehicleFeatures from '../components/vehicles/VehicleFeatures'
import VehicleGallery from '../components/vehicles/VehicleGallery'
import VehicleLeadModals from '../components/vehicles/VehicleLeadModals'
import VehiclePricingCard from '../components/vehicles/VehiclePricingCard'
import VehicleSpecsTable from '../components/vehicles/VehicleSpecsTable'
import SimilarVehicles from '../components/vehicles/SimilarVehicles'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getSimilarVehicles, getVehicleBySlug } from '../services/vehicles'
import { formatRelativeDate } from '../utils/format'

/**
 * A single vehicle.
 *
 * The two requests are separate so the page is not held up by the one nobody
 * came for: the vehicle itself renders as soon as it arrives, and the similar
 * vehicles fill in below it. Its failure is silent by design — a broken
 * "you might also like" strip must not take down the page a customer is
 * actually reading.
 */
export default function VehicleDetails() {
  const { slug } = useParams()
  const [intent, setIntent] = useState(null)

  const { data: vehicle, loading, error, reload } = useAsync(
    () => getVehicleBySlug(slug),
    slug,
  )

  const { data: similarData, loading: similarLoading } = useAsync(
    () => getSimilarVehicles(slug, 3),
    slug,
  )

  // `data` is `null` until the request resolves and a destructuring default
  // only covers `undefined`, so reading `.length` off it below would throw on
  // the render that follows the vehicle arriving.
  const similar = similarData ?? []

  useDocumentTitle(vehicle?.title ?? 'Vehicle details')

  if (loading && !vehicle) {
    return (
      <div className="container-page py-20">
        <LoadingBlock label="Loading this vehicle…" />
      </div>
    )
  }

  if (error) {
    // A missing slug is a dead link, not a fault. Offering "try again" for a
    // vehicle that does not exist would just fail again.
    const notFound = error.status === 404

    return (
      <>
        {/* Both branches keep the dark header, because both still need an h1:
            "every page has exactly one" is what the route sweep checks, and it
            is what a screen-reader user navigates by. */}
        <PageHeader
          eyebrow={notFound ? 'Not found' : 'Unavailable'}
          title={notFound ? 'We couldn’t find that vehicle' : 'We couldn’t load this vehicle'}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Used Cars', to: '/used-cars' },
            { label: 'Vehicle' },
          ]}
        />

        <div className="container-page py-12">
          {notFound ? (
            <EmptyState
              icon={CarFront}
              title="This listing is no longer on the site"
              description="It may have sold and been removed. Our current inventory is a click away — or call us and we'll tell you what's coming in."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/used-cars">Browse inventory</Button>
                  <Button to="/contact" variant="outline">
                    Contact us
                  </Button>
                </div>
              }
            />
          ) : (
            <ErrorState
              description={
                error.message ||
                'Something went wrong fetching the listing. Please try again.'
              }
              onRetry={reload}
            />
          )}
        </div>
      </>
    )
  }

  if (!vehicle) return null

  return (
    <>
      <PageHeader
        eyebrow={`${vehicle.bodyType} · ${vehicle.condition}`}
        title={vehicle.title}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Used Cars', to: '/used-cars' },
          { label: vehicle.title },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          {vehicle.status !== 'sold' && (
            <Button
              variant="accent"
              icon={Calendar}
              onClick={() => setIntent('test-drive')}
            >
              Book a test drive
            </Button>
          )}
          <Button
            variant="white"
            icon={MessageSquare}
            onClick={() => setIntent('enquiry')}
          >
            Ask a question
          </Button>
        </div>
      </PageHeader>

      {/* No bottom padding for the action bar: it is `sticky`, so it occupies
          real space at the end of `main` rather than floating over it. */}
      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-10">
            <VehicleGallery vehicle={vehicle} />

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                About this {vehicle.make} {vehicle.model}
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                {vehicle.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span>
                  Stock <strong className="font-medium text-slate-700">{vehicle.stockNumber}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>Listed {formatRelativeDate(vehicle.dateAdded)}</span>
                <span aria-hidden="true">·</span>
                <Link
                  to="/used-cars"
                  className="font-medium text-brand-700 hover:text-brand-900"
                >
                  See everything on the lot
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">Specifications</h2>
              <VehicleSpecsTable vehicle={vehicle} className="mt-5" />
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                Features &amp; equipment
              </h2>
              <VehicleFeatures features={vehicle.features} className="mt-5" />
            </section>
          </div>

          <VehiclePricingCard
            vehicle={vehicle}
            onAction={setIntent}
            className="lg:sticky lg:top-24"
          />
        </div>

        {/* Prices, taxes and the estimate above are all indicative. Saying so
            once, plainly, is cheaper than a disclaimer per figure — and it is
            the kind of thing a buyer is entitled to know before they call. */}
        <Card className="mt-12 bg-slate-50">
          <h2 className="text-xl font-bold text-brand-900">
            Before you buy
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>
              Prices are in Canadian dollars and exclude GST and PST, licensing,
              insurance and any applicable fees.
            </li>
            <li>
              Payment figures are estimates based on the rate and term shown,
              and are not an offer of credit. Your rate depends on the lender&rsquo;s
              approval.
            </li>
            <li>
              Every vehicle is sold with its full history report. Ask us for the
              details on any listing.
            </li>
          </ul>
        </Card>

        <SimilarVehicles
          vehicles={similar}
          loading={similarLoading}
          className="mt-16"
        />
      </div>

      <VehicleActionBar vehicle={vehicle} onAction={setIntent} />

      <VehicleLeadModals
        vehicle={vehicle}
        intent={intent}
        onClose={() => setIntent(null)}
      />
    </>
  )
}
