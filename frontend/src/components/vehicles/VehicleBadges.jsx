import Badge from '../common/Badge'
import { cn } from '../../utils/cn'

/**
 * Condition, availability and featured markers for a vehicle.
 *
 * One component so the same car cannot be badged "Featured" on the homepage and
 * silently lose the marker in the marketplace grid. Availability is deliberately
 * limited to `pending` and `sold` — an "Available" chip on every other card
 * would be noise, since most inventory is available.
 */
export default function VehicleBadges({ vehicle, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {vehicle.status === 'sold' && <Badge variant="danger">Sold</Badge>}
      {vehicle.status === 'pending' && <Badge variant="accent">Sale pending</Badge>}
      {vehicle.featured && vehicle.status === 'available' && (
        <Badge variant="accent">Featured</Badge>
      )}
      <Badge variant="overlay">{vehicle.condition}</Badge>
    </div>
  )
}
