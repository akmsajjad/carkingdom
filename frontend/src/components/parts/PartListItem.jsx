import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import Rating from '../common/Rating'
import AddToCart from './AddToCart'
import PartBadges from './PartBadges'
import PartSpecs from './PartSpecs'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/format'

/**
 * The same part as `PartCard`, laid out as a horizontal row for list view.
 *
 * It shares the badge, spec and add-to-cart components with the card, so the
 * two views cannot drift apart. The one thing that changes is how much of the
 * description fits: the row has the width for a sentence of it, and that
 * sentence is usually what decides between two similar parts.
 */
export default function PartListItem({ part, className }) {
  const href = `/parts/${part.slug}`
  const discounted = part.salePrice != null

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        'sm:flex-row',
        className,
      )}
    >
      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-72">
        <Link to={href} className="block h-full w-full">
          <OptimizedImage
            src={part.image}
            alt={part.name}
            category="parts"
            className={cn(
              'transition-transform duration-500 group-hover:scale-105',
              !part.inStock && 'opacity-60 saturate-50',
            )}
          />
        </Link>

        <PartBadges part={part} className="absolute top-3 left-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">
          {part.brand} &middot; {part.category} &middot; {part.sku}
        </p>

        <h3 className="mt-1 text-lg leading-snug font-semibold text-brand-900">
          <Link
            to={href}
            className="rounded-sm transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            {part.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <Rating value={part.rating} size="sm" />
          <span className="text-xs text-slate-500">
            {part.rating.toFixed(1)} ({part.reviewCount} reviews)
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {part.description}
        </p>

        <PartSpecs part={part} className="mt-3 sm:grid-cols-2 lg:grid-cols-4" />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-brand-900">
              {formatPrice(part.effectivePrice)}
            </p>
            {discounted && (
              <p className="text-sm text-slate-400 line-through">
                {formatPrice(part.price)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AddToCart part={part} showQuantity={false} size="sm" />
            <Link
              to={href}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-700 transition-transform duration-200 group-hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              Details
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
