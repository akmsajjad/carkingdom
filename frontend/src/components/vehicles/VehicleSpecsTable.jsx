import { CarFront, Fuel, Gauge, Palette } from 'lucide-react'
import { cn } from '../../utils/cn'
import {
  formatCode,
  formatFuelEconomy,
  formatMileage,
  formatNumber,
} from '../../utils/format'

/**
 * Builds the specification groups for one vehicle.
 *
 * A function rather than a static table because several values need formatting
 * and several are optional — an electric vehicle has no cylinder count, and a
 * group whose every value is missing should not render an empty heading.
 */
function buildGroups(vehicle) {
  const groups = [
    {
      title: 'Overview',
      icon: CarFront,
      items: [
        { label: 'Stock number', value: formatCode(vehicle.stockNumber) },
        { label: 'VIN', value: formatCode(vehicle.vin) },
        { label: 'Body type', value: vehicle.bodyType },
        { label: 'Condition', value: vehicle.condition },
        { label: 'Odometer', value: formatMileage(vehicle.mileage) },
        {
          label: 'Previous owners',
          value:
            vehicle.previousOwners == null
              ? null
              : formatNumber(vehicle.previousOwners),
        },
      ],
    },
    {
      title: 'Performance',
      icon: Gauge,
      items: [
        { label: 'Engine', value: vehicle.engine },
        { label: 'Cylinders', value: vehicle.cylinders },
        {
          label: 'Horsepower',
          value: vehicle.horsepower == null ? null : `${vehicle.horsepower} hp`,
        },
        {
          label: 'Torque',
          value: vehicle.torque == null ? null : `${vehicle.torque} lb-ft`,
        },
        { label: 'Transmission', value: vehicle.transmission },
        { label: 'Drivetrain', value: vehicle.drivetrain },
        { label: 'Fuel type', value: vehicle.fuelType },
      ],
    },
    {
      title: 'Fuel economy',
      icon: Fuel,
      items: [
        { label: 'City', value: fuelValue(vehicle, 'city') },
        { label: 'Highway', value: fuelValue(vehicle, 'highway') },
        { label: 'Combined', value: fuelValue(vehicle, 'combined') },
      ],
    },
    {
      title: 'Interior & exterior',
      icon: Palette,
      items: [
        { label: 'Exterior colour', value: vehicle.exteriorColor },
        { label: 'Interior colour', value: vehicle.interiorColor },
        { label: 'Seats', value: vehicle.seats },
        { label: 'Doors', value: vehicle.doors },
      ],
    },
  ]

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.value != null && item.value !== '' && item.value !== '—',
      ),
    }))
    .filter((group) => group.items.length > 0)
}

function fuelValue(vehicle, key) {
  const value = vehicle.fuelEconomy?.[key]
  return value == null ? null : formatFuelEconomy(value)
}

/**
 * The full specification sheet.
 *
 * A description list rather than a table: these are label/value pairs, not
 * tabular data with meaningful rows and columns, and a `<dl>` is what a screen
 * reader announces as such. Grouped under headings so twenty rows are scannable
 * instead of one undifferentiated block.
 */
export default function VehicleSpecsTable({ vehicle, className }) {
  const groups = buildGroups(vehicle)

  return (
    <div className={cn('grid gap-x-10 gap-y-8 sm:grid-cols-2', className)}>
      {groups.map((group) => {
        const Icon = group.icon

        return (
          <section key={group.title}>
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-900 uppercase">
              <Icon className="size-4 text-accent-600" aria-hidden="true" />
              {group.title}
            </h3>

            <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 py-2"
                >
                  <dt className="text-sm text-slate-500">{item.label}</dt>
                  <dd className="text-right text-sm font-medium text-slate-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </div>
  )
}
