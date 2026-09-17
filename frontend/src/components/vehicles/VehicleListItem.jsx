import { Link } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import VehicleActions from './VehicleActions'
import VehicleBadges from './VehicleBadges'
import VehicleSpecs from './VehicleSpecs'
import { cn } from '../../utils/cn'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'

/**
 * The same vehicle as `VehicleCard`, laid out as a horizontal row for list view.
 *
 * It shares the badge, spec and action components with the card, so the two
 * views cannot drift apart — and, like the card, it exposes a single stretched
 * link rather than a second one in the footer.
 */
export default function VehicleListItem({ vehicle, className }) {
  const href = `/used-cars/${vehicle.slug}`
  const monthly = estimateMonthlyPayment(vehicle.effectivePrice)
  const isSold = vehicle.status === 'sold'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        'sm:flex-row',
        className,
      )}
    >
      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-72">
        <OptimizedImage
          src={vehicle.images[0]}
          alt={vehicle.title}
          category="vehicles"
          className={cn(
            'transition-transform duration-500 group-hover:scale-105',
            isSold && 'opacity-60 saturate-50',
          )}
        />

        <VehicleBadges vehicle={vehicle} className="absolute top-3 left-3" />

        {vehicle.images.length > 1 && (
          <p className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-brand-950/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <Camera className="size-3.5" aria-hidden="true" />
            {vehicle.images.length}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">
              {vehicle.bodyType} &middot; {vehicle.drivetrain} &middot;{' '}
              {vehicle.exteriorColor}
            </p>

            <h3 className="mt-1 text-lg leading-snug font-semibold text-brand-900">
              <Link
                to={href}
                className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                {vehicle.title}
              </Link>
            </h3>

            <VehicleSpecs
              vehicle={vehicle}
              limit={5}
              className="mt-3 sm:grid-cols-2 lg:grid-cols-3"
            />
          </div>

          {/* `relative`, not just `z-10`: the stretched link's overlay is
              absolutely positioned, so a static sibling paints beneath it and
              the buttons would become unclickable. */}
          <VehicleActions vehicle={vehicle} className="relative z-10 shrink-0" />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-brand-900">
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
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-700 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            View details
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
