import Badge from '../common/Badge'
import { cn } from '../../utils/cn'

/**
 * Condition, availability and featured markers for a vehicle.
 *
 * One component so the same car cannot be badged "Featured" on the homepage and
 * silently lose the marker in the marketplace grid. Availability is deliberately
 * limited to `pending` and `sold` — an "Available" chip on every other card
 * would be noise, since most inventory is available.
 *
 * The variants are doing semantic work, so they are not interchangeable: the
 * brand red is the colour of the call to action, and spending it on a status
 * chip would blunt it. "Sold" is a negative (danger), "sale pending" is a state
 * in progress (warning), and "featured" is the dealership's own curation
 * (brand) — none of them compete with the red for attention.
 */
export default function VehicleBadges({ vehicle, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {vehicle.status === 'sold' && <Badge variant="danger">Sold</Badge>}
      {vehicle.status === 'pending' && (
        <Badge variant="warning">Sale pending</Badge>
      )}
      {vehicle.featured && vehicle.status === 'available' && (
        <Badge variant="brand">Featured</Badge>
      )}
      <Badge variant="overlay">{vehicle.condition}</Badge>
    </div>
  )
}
