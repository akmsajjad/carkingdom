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
 * A part in the catalogue grid.
 *
 * Unlike `VehicleCard` the title is not stretched over the whole tile. A part
 * card carries its own controls — a quantity stepper and an add-to-cart button —
 * and an `inset-0` overlay would sit on top of them, so every click on "add to
 * cart" would navigate to the product page instead. The title link is therefore
 * an ordinary link, and the buttons are ordinary buttons.
 */
export default function PartCard({ part, className }) {
  const href = `/parts/${part.slug}`
  const discounted = part.salePrice != null

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
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
          {part.brand} &middot; {part.category}
        </p>

        <h3 className="mt-1 text-base leading-snug font-semibold text-brand-900">
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
            {part.rating.toFixed(1)} ({part.reviewCount})
          </span>
        </div>

        <PartSpecs part={part} className="mt-3" />

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xl font-bold text-brand-900">
                {formatPrice(part.effectivePrice)}
              </p>
              {discounted && (
                <p className="text-sm text-slate-400 line-through">
                  {formatPrice(part.price)}
                </p>
              )}
            </div>

            <Link
              to={href}
              className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-sm font-semibold text-accent-700 transition-transform duration-200 group-hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              Details
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <AddToCart part={part} showQuantity={false} size="sm" className="mt-3" />
        </div>
      </div>
    </article>
  )
}
