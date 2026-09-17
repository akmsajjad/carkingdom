import { useId } from 'react'
import { X } from 'lucide-react'
import { FILTER_FIELDS } from '../../hooks/useVehicleFilters'
import { cn } from '../../utils/cn'
import { formatMileage, formatPrice } from '../../utils/format'

const FORMATTERS = {
  price: formatPrice,
  mileage: formatMileage,
}

/**
 * The active filters, as removable chips above the results.
 *
 * The sidebar says what you could filter by; this says what you already are.
 * On mobile it matters more, because the filters themselves are behind a
 * drawer — without chips, an empty result set looks like a broken page rather
 * than the consequence of a filter set three screens ago.
 *
 * The chip list is derived from `FILTER_FIELDS`, so a new filter appears here
 * automatically.
 */
export default function ActiveFilterChips({
  filters,
  onToggleArray,
  onSetFilter,
  onClearAll,
  className,
}) {
  const labelId = useId()
  const chips = []

  for (const { key, type, label, format } of FILTER_FIELDS) {
    const value = filters[key]

    if (type === 'array') {
      for (const entry of value) {
        chips.push({
          id: `${key}:${entry}`,
          label: `${label}: ${entry}`,
          remove: () => onToggleArray(key, entry),
        })
      }
      continue
    }

    if (type === 'flag') {
      if (value) {
        chips.push({ id: key, label, remove: () => onSetFilter(key, false) })
      }
      continue
    }

    if (type === 'number') {
      if (value != null) {
        const formatter = FORMATTERS[format]
        chips.push({
          id: key,
          label: `${label}: ${formatter ? formatter(value) : value}`,
          remove: () => onSetFilter(key, null),
        })
      }
      continue
    }

    if (value) {
      chips.push({
        id: key,
        label: `${label}: “${value}”`,
        remove: () => onSetFilter(key, ''),
      })
    }
  }

  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="sr-only" id={labelId}>
        Active filters
      </span>

      <ul
        aria-labelledby={labelId}
        className="flex flex-wrap items-center gap-2"
      >
        {chips.map((chip) => (
          <li key={chip.id}>
            <button
              type="button"
              onClick={chip.remove}
              // The visible text already names the value and its group, so the
              // label only has to say what clicking does.
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-3 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              {chip.label}
              <X className="size-3.5 text-slate-400" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-sm px-1 text-sm font-medium text-accent-700 underline-offset-2 transition-colors hover:text-accent-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      >
        Clear all
      </button>
    </div>
  )
}
