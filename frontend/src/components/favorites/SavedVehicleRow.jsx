import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, HeartOff } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import VehicleBadges from '../vehicles/VehicleBadges'
import VehicleSpecs from '../vehicles/VehicleSpecs'
import { cn } from '../../utils/cn'
import { useCompare } from '../../context/CompareContext'
import { useFavorites } from '../../context/FavoritesContext'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'

/**
 * One saved vehicle.
 *
 * Deliberately not `VehicleCard`. On the marketplace the card's job is to sell
 * a car at a glance, and its heart is a quick aside. Here the job is managing a
 * shortlist, so §25's three needs — view it, remove it, and the vehicle itself —
 * are all spelled out as labelled controls rather than left to an icon. The
 * one thing that does carry over is the single link: the title is plain text
 * and "View details" is the only link in the card, so a screen reader hears the
 * destination once.
 *
 * Shares the badge and spec components with both marketplace card variants, so
 * a change to how a mileage or a condition reads lands everywhere at once.
 */
export default function SavedVehicleRow({ vehicle, className }) {
  const { removeFavorite } = useFavorites()
  const { isComparing, toggleCompare } = useCompare()
  const comparing = isComparing(vehicle.id)
  const monthly = estimateMonthlyPayment(vehicle.effectivePrice)
  const isSold = vehicle.status === 'sold'

  return (
    <li
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card sm:flex-row',
        className,
      )}
    >
      <div className="relative aspect-4/3 shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-44 sm:w-56">
        <OptimizedImage
          src={vehicle.images[0]}
          alt={vehicle.title}
          category="vehicles"
          className={cn(isSold && 'opacity-60 saturate-50')}
        />
        <VehicleBadges vehicle={vehicle} className="absolute top-3 left-3" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">
          {vehicle.bodyType} &middot; {vehicle.drivetrain} &middot;{' '}
          {vehicle.exteriorColor}
        </p>

        <h3 className="mt-1 text-lg leading-snug font-semibold text-brand-900">
          {vehicle.title}
        </h3>

        <VehicleSpecs
          vehicle={vehicle}
          limit={4}
          className="mt-3 sm:grid-cols-2"
        />

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={comparing}
              onClick={() => toggleCompare(vehicle.id, vehicle.title)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
                comparing
                  ? 'border-brand-700 bg-brand-50 text-brand-800'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-brand-900',
              )}
            >
              <ArrowLeftRight className="size-4" aria-hidden="true" />
              {comparing ? 'Comparing' : 'Compare'}
            </button>

            {/* The remove control is a sibling of the link, never inside it.
                The heart on the marketplace card would have done this job, but
                an icon-only control on the page whose entire purpose is
                removing things is the wrong amount of emphasis. */}
            <button
              type="button"
              onClick={() => removeFavorite(vehicle.id, vehicle.title)}
              aria-label={`Remove ${vehicle.title} from favorites`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <HeartOff className="size-4" aria-hidden="true" />
              Remove
            </button>

            <Link
              to={`/used-cars/${vehicle.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              View details
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}
