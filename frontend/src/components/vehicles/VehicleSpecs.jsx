import { CarFront, Cog, Fuel, Gauge, Zap } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatMileage } from '../../utils/format'

/**
 * The at-a-glance spec row, shared by the grid card and the list row.
 *
 * Each icon is paired with a visually hidden label rather than a `title`
 * attribute: an icon-only row reads to a screen reader as a list of loose
 * values ("41,200 km, Automatic") with no indication of what they describe,
 * and a tooltip is not available to touch or keyboard users.
 *
 * `limit` is the only difference between the two callers — the card has room
 * for three, the wider list row shows the whole set.
 */
export default function VehicleSpecs({ vehicle, limit, className }) {
  const items = [
    { key: 'mileage', icon: Gauge, label: 'Mileage', value: formatMileage(vehicle.mileage) },
    { key: 'transmission', icon: Cog, label: 'Transmission', value: vehicle.transmission },
    { key: 'fuel', icon: Fuel, label: 'Fuel type', value: vehicle.fuelType },
    { key: 'drivetrain', icon: Zap, label: 'Drivetrain', value: vehicle.drivetrain },
    { key: 'body', icon: CarFront, label: 'Body type', value: vehicle.bodyType },
  ].slice(0, limit)

  return (
    <ul className={cn('grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3', className)}>
      {items.map(({ key, icon: Icon, label, value }) => (
        <li
          key={key}
          className="flex items-center gap-2 text-sm text-slate-600"
        >
          <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="sr-only">{label}:</span>
          <span className="min-w-0 truncate">{value}</span>
        </li>
      ))}
    </ul>
  )
}
