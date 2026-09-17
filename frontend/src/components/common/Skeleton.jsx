import { cn } from '../../utils/cn'

/** A single shimmering placeholder block. */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded-md', className)}
      {...props}
    />
  )
}

/**
 * Placeholders matching the real vehicle layouts, so the page doesn't jump
 * when data arrives. Both variants deliberately mirror the markup of their
 * component — `VehicleCard` and `VehicleListItem` — rather than approximating
 * it, which is the only way the swap is invisible.
 *
 * The image block is `rounded-none!` rather than `rounded-none`: `Skeleton`
 * already sets `rounded-md`, and two border-radius utilities on one element are
 * resolved by stylesheet order, where `rounded-md` is emitted after
 * `rounded-none` and therefore wins. The `!` is what actually makes the corners
 * square, which matters for the bottom edge sitting against the card body.
 */

export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <Skeleton className="aspect-4/3 w-full rounded-none!" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function VehicleRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card sm:flex">
      <Skeleton className="aspect-4/3 w-full rounded-none! sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-72" />
      <div className="flex-1 space-y-3 p-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

/**
 * The parts equivalents. Taller than the vehicle skeletons by one row, because
 * a part card carries a rating line and its own add-to-cart button below the
 * price — approximating the vehicle shape here would let the grid jump when the
 * real cards arrive, which is the one thing a skeleton exists to prevent.
 */

export function PartCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <Skeleton className="aspect-4/3 w-full rounded-none!" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export function PartRowSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card sm:flex">
      <Skeleton className="aspect-4/3 w-full rounded-none! sm:aspect-auto sm:min-h-52 sm:w-64 lg:w-72" />
      <div className="flex-1 space-y-3 p-5">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}
