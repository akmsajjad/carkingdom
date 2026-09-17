import { PackageSearch } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { PartCardSkeleton, PartRowSkeleton } from '../common/Skeleton'
import PartCard from './PartCard'
import PartListItem from './PartListItem'

/**
 * Owns the result container for both views, so the grid columns and the list
 * stack are defined once and the skeletons line up with whatever replaces them.
 *
 * Deliberately the same four states, in the same order, as `VehicleGrid` — a
 * customer who has used one catalogue has used both, and the two should not
 * disagree about what "loading" or "nothing matched" looks like.
 */
const GRID_CLASSES = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
const LIST_CLASSES = 'space-y-4'

export default function PartGrid({
  parts = [],
  loading = false,
  error = null,
  onRetry,
  view = 'grid',
  skeletonCount = 6,
  emptyTitle = 'No parts match those filters',
  emptyDescription = 'Try removing a filter or widening the price range.',
  emptyAction,
}) {
  const isFirstLoad = loading && parts.length === 0

  if (isFirstLoad) {
    const SkeletonVariant = view === 'list' ? PartRowSkeleton : PartCardSkeleton
    const classes = view === 'list' ? LIST_CLASSES : GRID_CLASSES

    return (
      <div className={classes} aria-busy="true">
        <p role="status" className="sr-only">
          Loading parts…
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
        title="We couldn't load the parts catalogue"
        description={
          error.message ||
          'The parts list is unavailable right now. Please try again.'
        }
        onRetry={onRetry}
      />
    )
  }

  if (parts.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div
      className={view === 'list' ? LIST_CLASSES : GRID_CLASSES}
      aria-busy={loading || undefined}
    >
      {parts.map((part) =>
        view === 'list' ? (
          <PartListItem key={part.id} part={part} />
        ) : (
          <PartCard key={part.id} part={part} />
        ),
      )}
    </div>
  )
}
