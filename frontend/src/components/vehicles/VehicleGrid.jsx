import { CarFront } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { VehicleCardSkeleton, VehicleRowSkeleton } from '../common/Skeleton'
import VehicleCard from './VehicleCard'
import VehicleListItem from './VehicleListItem'

/**
 * Owns the result container for both views, so the grid columns and the list
 * stack are defined once and the skeletons line up with whatever replaces them.
 */
const GRID_CLASSES = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
const LIST_CLASSES = 'space-y-4'

/**
 * The vehicle results area, covering all four states a list can be in.
 *
 * `loading` with results already on screen is treated as a refresh rather than
 * a first load: the existing cards stay put under a dimmed, `aria-busy` grid
 * instead of being replaced by skeletons. Changing a filter should not make the
 * page flash, and it should not steal focus from the control being used.
 */
export default function VehicleGrid({
  vehicles = [],
  loading = false,
  error = null,
  onRetry,
  view = 'grid',
  skeletonCount = 6,
  emptyTitle = 'No vehicles match your filters',
  emptyDescription = 'Try removing a filter or widening your price range.',
  emptyAction,
}) {
  const isFirstLoad = loading && vehicles.length === 0

  if (isFirstLoad) {
    const SkeletonVariant = view === 'list' ? VehicleRowSkeleton : VehicleCardSkeleton
    const classes = view === 'list' ? LIST_CLASSES : GRID_CLASSES

    return (
      // `aria-busy` plus a live status, rather than `aria-hidden` on the
      // container: hiding it would leave a screen-reader user with silence
      // while the shimmer is on screen for everyone else. The shimmer blocks
      // hide themselves individually.
      <div className={classes} aria-busy="true">
        <p role="status" className="sr-only">
          Loading vehicles…
        </p>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <SkeletonVariant key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load the inventory"
        description={
          error.message ||
          'The vehicle list is unavailable right now. Please try again.'
        }
        onRetry={onRetry}
      />
    )
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={CarFront}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    // A refresh keeps the previous results on screen — deliberately without a
    // dimming overlay, which would flicker on every keystroke of a live search.
    // The toolbar's count carries the spinner instead.
    <div
      className={view === 'list' ? LIST_CLASSES : GRID_CLASSES}
      aria-busy={loading || undefined}
    >
      {vehicles.map((vehicle) =>
        view === 'list' ? (
          <VehicleListItem key={vehicle.id} vehicle={vehicle} />
        ) : (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ),
      )}
    </div>
  )
}
