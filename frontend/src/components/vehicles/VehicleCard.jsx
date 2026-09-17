import { Link } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import VehicleActions from './VehicleActions'
import VehicleBadges from './VehicleBadges'
import VehicleSpecs from './VehicleSpecs'
import { cn } from '../../utils/cn'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'

/**
 * A vehicle in the marketplace grid.
 *
 * The card carries exactly one link. The title is stretched over the whole card
 * with an `::after` overlay, so the entire tile is clickable without adding a
 * second "View details" link to the tab order — two links to the same URL make a
 * screen-reader user hear the same destination twice per card. "View details" is
 * therefore a visual affordance, not a control, and is hidden from assistive
 * tech. The favourite and compare buttons sit above the overlay with `z-10` so
 * they remain clickable.
 */
export default function VehicleCard({ vehicle, className }) {
  const href = `/used-cars/${vehicle.slug}`
  const monthly = estimateMonthlyPayment(vehicle.effectivePrice)
  const isSold = vehicle.status === 'sold'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <OptimizedImage
          src={vehicle.images[0]}
          alt={vehicle.title}
          category="vehicles"
          className={cn(
            'transition-transform duration-500 group-hover:scale-105',
            // A sold vehicle keeps its page — it is still useful for comparing
            // against what is on the lot now — but should not read as buyable.
            isSold && 'opacity-60 saturate-50',
          )}
        />

        <VehicleBadges vehicle={vehicle} className="absolute top-3 left-3" />

        <VehicleActions
          vehicle={vehicle}
          variant="overlay"
          className="absolute top-3 right-3 z-10"
        />

        {vehicle.images.length > 1 && (
          <p className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-brand-950/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <Camera className="size-3.5" aria-hidden="true" />
            {vehicle.images.length}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">
          {vehicle.bodyType} &middot; {vehicle.drivetrain}
        </p>

        <h3 className="mt-1 text-base leading-snug font-semibold text-brand-900">
          <Link
            to={href}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            {vehicle.title}
          </Link>
        </h3>

        <VehicleSpecs vehicle={vehicle} limit={3} className="mt-3" />

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xl font-bold text-brand-900">
              {formatPrice(vehicle.effectivePrice)}
            </p>
            {vehicle.salePrice && (
              <p className="text-sm text-slate-400 line-through">
                {formatPrice(vehicle.price)}
              </p>
            )}
            {monthly && (
              <p className="text-xs text-slate-500">
                Est. {formatPrice(monthly)}/mo
              </p>
            )}
          </div>

          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-sm font-semibold text-accent-700 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            View details
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
