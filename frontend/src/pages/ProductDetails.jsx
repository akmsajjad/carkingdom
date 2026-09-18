import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Check,
  PackageSearch,
  ShieldCheck,
  Truck,
  Undo2,
} from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import OptimizedImage from '../components/common/OptimizedImage'
import PageHeader from '../components/common/PageHeader'
import Rating from '../components/common/Rating'
import { LoadingBlock } from '../components/common/Spinner'
import AddToCart from '../components/parts/AddToCart'
import FitmentChecker from '../components/parts/FitmentChecker'
import PartBadges from '../components/parts/PartBadges'
import RelatedParts from '../components/parts/RelatedParts'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getPartBySlug, getRelatedParts } from '../services/parts'
import { SITE, TEL_HREF } from '../data/site'
import { formatPrice, formatRelativeDate } from '../utils/format'

/** The buying panel: price, availability, and the add-to-cart control. */
function BuyBox({ part }) {
  const discounted = part.salePrice != null
  const saving = discounted ? part.price - part.salePrice : 0

  return (
    <Card className="lg:sticky lg:top-24">
      <PartBadges part={part} />

      <div className="mt-3 flex items-baseline gap-3">
        <p className="text-3xl font-bold text-brand-900">
          {formatPrice(part.effectivePrice)}
        </p>
        {discounted && (
          <>
            <p className="text-base text-slate-400 line-through">
              {formatPrice(part.price)}
            </p>
            <p className="text-sm font-semibold text-red-600">
              Save {formatPrice(saving)}
            </p>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Rating value={part.rating} size="sm" showValue />
        <span className="text-sm text-slate-500">
          {part.reviewCount} {part.reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {part.inStock ? (
          part.stock <= 4 ? (
            <span className="font-medium text-amber-700">
              Only {part.stock} left at the Dudley Street counter
            </span>
          ) : (
            <span className="font-medium text-emerald-700">
              In stock — ready for pickup today
            </span>
          )
        ) : (
          <span className="font-medium text-slate-500">
            Out of stock — we can order it in
          </span>
        )}
      </p>

      <AddToCart part={part} className="mt-5" />

      <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-500">Part number</dt>
          <dd className="font-medium text-slate-900">{part.sku}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-500">Brand</dt>
          <dd className="font-medium text-slate-900">{part.brand}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-500">Category</dt>
          <dd className="font-medium text-slate-900">{part.category}</dd>
        </div>
        {part.warranty && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-500">Warranty</dt>
            <dd className="text-right font-medium text-slate-900">
              {part.warranty}
            </dd>
          </div>
        )}
      </dl>

      <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-600">
        <li className="flex items-start gap-2.5">
          <PackageSearch className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          Free pickup at {SITE.address.street}, {SITE.address.city}
        </li>
        <li className="flex items-start gap-2.5">
          <Truck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          Local delivery next business day
        </li>
        <li className="flex items-start gap-2.5">
          <Undo2 className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          Unused parts returnable within 30 days, in original packaging
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          Fitment confirmed before you pay — call{' '}
          <a href={TEL_HREF} className="font-medium text-accent-700 underline underline-offset-2">
            {SITE.phoneDisplay}
          </a>
        </li>
      </ul>
    </Card>
  )
}

/**
 * A single part.
 *
 * `part.applications` is a list of make/model/year windows, which is exactly
 * the shape of a fitment catalogue — so rather than printing it, the page shows
 * the first few and lets the checker do the matching. A wall of every vehicle a
 * brake pad fits is not a feature list; it is a haystack, and the customer's
 * question is only ever about the one car in their driveway.
 *
 * The related-parts request is separate so the page is not held up by the strip
 * nobody came for, and its failure is silent by design: a broken "related
 * parts" rail must not take down the page the customer is reading.
 */
export default function ProductDetails() {
  const { slug } = useParams()

  const { data: part, loading, error, reload } = useAsync(
    () => getPartBySlug(slug),
    slug,
  )

  const { data: relatedData, loading: relatedLoading } = useAsync(
    () => getRelatedParts(slug, 3),
    slug,
  )

  // `data` is `null` until the request resolves and a destructuring default
  // only covers `undefined`, so `related.length` below would read off null on
  // the render that follows the part arriving.
  const related = relatedData ?? []

  useDocumentTitle(part?.name ?? 'Part details')

  if (loading && !part) {
    return (
      <div className="container-page py-20">
        <LoadingBlock label="Loading this part…" />
      </div>
    )
  }

  if (error) {
    // A missing slug is a dead link, not a fault. Offering "try again" for a
    // part that does not exist would just fail again.
    const notFound = error.status === 404

    return (
      <>
        <PageHeader
          eyebrow={notFound ? 'Not found' : 'Unavailable'}
          title={notFound ? 'We couldn’t find that part' : 'We couldn’t load this part'}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Parts', to: '/parts' },
            { label: 'Part' },
          ]}
        />

        <div className="container-page py-12">
          {notFound ? (
            <EmptyState
              icon={PackageSearch}
              title="This part is no longer listed"
              description="Our stock changes daily. Browse the catalogue for what is in now, or call the counter with your vehicle details and we will match the part for you."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/parts">Browse parts</Button>
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
                'Something went wrong fetching this part. Please try again.'
              }
              onRetry={reload}
            />
          )}
        </div>
      </>
    )
  }

  if (!part) return null

  const applications = part.applications ?? []

  return (
    <>
      <PageHeader
        eyebrow={`${part.brand} · ${part.category}`}
        title={part.name}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Parts', to: '/parts' },
          { label: part.name },
        ]}
      />

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-10">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div className="aspect-4/3">
                <OptimizedImage
                  src={part.image}
                  alt={part.name}
                  category="parts"
                  eager
                />
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold text-brand-900">
                About this {part.category.toLowerCase()} part
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                {part.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-slate-400" aria-hidden="true" />
                  <strong className="font-medium text-slate-700">
                    {part.sku}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>Listed {formatRelativeDate(part.dateAdded)}</span>
                <span aria-hidden="true">·</span>
                <Link
                  to={`/parts?category=${encodeURIComponent(part.category)}`}
                  className="font-medium text-brand-700 hover:text-brand-900"
                >
                  See all {part.category.toLowerCase()}
                </Link>
              </div>
            </section>

            {part.features?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-brand-900">
                  What you get
                </h2>
                <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {part.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {part.specs?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-brand-900">
                  Specifications
                </h2>
                <dl className="mt-5 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                  {part.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5"
                    >
                      <dt className="text-sm text-slate-500">{spec.label}</dt>
                      <dd className="text-right text-sm font-medium text-slate-900">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <FitmentChecker part={part} />

            {applications.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-brand-900">
                  In the fitment list
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {applications.length}{' '}
                  {applications.length === 1 ? 'application' : 'applications'} on
                  file. This is not the whole list of vehicles this part will
                  fit — call us with your VIN and we will confirm it exactly.
                </p>

                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {applications.map((application) => (
                    <li
                      key={`${application.make}-${application.model}-${application.yearFrom}`}
                      className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm"
                    >
                      <p className="font-medium text-brand-900">
                        {application.make} {application.model}
                      </p>
                      <p className="mt-0.5 text-slate-500">
                        {application.yearFrom === application.yearTo
                          ? application.yearFrom
                          : `${application.yearFrom}–${application.yearTo}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <BuyBox part={part} />
        </div>

        <RelatedParts
          parts={related}
          loading={relatedLoading}
          className="mt-16"
        />
      </div>
    </>
  )
}
