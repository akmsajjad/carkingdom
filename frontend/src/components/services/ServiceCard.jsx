import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import ServiceIcon from './serviceIcons'
import { cn } from '../../utils/cn'
import { serviceImage } from '../../utils/images'
import { formatPriceExact } from '../../utils/format'

/**
 * A service in the catalogue.
 *
 * Same one-link rule as `VehicleCard`: the title is stretched over the tile so
 * the whole card is clickable, and "Learn more" is a visual affordance hidden
 * from assistive tech rather than a second link to the same URL.
 *
 * `compact` drops the photograph and keeps the icon, for the related-services
 * strip on a detail page, where three more landscape images would compete with
 * the one the customer is actually looking at.
 */
export default function ServiceCard({ service, compact = false, className }) {
  const href = `/services/${service.slug}`

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        className,
      )}
    >
      {!compact && (
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <OptimizedImage
            src={serviceImage(service.slug)}
            alt={service.name}
            category="services"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50">
          <ServiceIcon name={service.icon} className="size-5 text-brand-700" />
        </span>

        <h3 className="mt-4 text-base leading-snug font-semibold text-brand-900">
          <Link
            to={href}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            {service.name}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
          {service.tagline}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-lg font-bold text-brand-900">
              From {formatPriceExact(service.startingPrice)}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="size-3.5" aria-hidden="true" />
              {service.duration}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-sm font-semibold text-accent-700 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            Learn more
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
