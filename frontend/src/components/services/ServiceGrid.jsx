import { Wrench } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import ServiceCard from './ServiceCard'
import { cn } from '../../utils/cn'

/**
 * The service results area.
 *
 * `columns` exists because the same grid is used at two densities: the full
 * catalogue on `/services`, which wants three across on a wide screen, and the
 * related strip on a detail page, where three narrower cards read better beside
 * a heading. Everything else about the two is identical, which is why they are
 * one component.
 *
 * `emptyAction` is supplied by the page rather than built here: the escape
 * route out of an empty list is the page's business, and the two call sites
 * want different ones. It has no default, because a default would be an
 * invented business action. See the note on `EmptyState` about dead ends.
 */
const COLUMNS = {
  2: 'grid gap-6 sm:grid-cols-2',
  3: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
}

export default function ServiceGrid({
  services = [],
  loading = false,
  compact = false,
  columns = 3,
  skeletonCount = 3,
  emptyAction,
  className,
}) {
  const classes = cn(COLUMNS[columns] ?? COLUMNS[3], className)

  if (loading && services.length === 0) {
    return (
      <div className={classes} aria-busy="true">
        <p role="status" className="sr-only">
          Loading services…
        </p>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Nothing to show here yet"
        description="Our service list is being updated. Call us and we'll tell you whether we can help."
        action={emptyAction}
      />
    )
  }

  return (
    <div className={classes}>
      {services.map((service) => (
        <ServiceCard key={service.slug} service={service} compact={compact} />
      ))}
    </div>
  )
}
