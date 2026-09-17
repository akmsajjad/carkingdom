import { LayoutGrid, List, LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import { cn } from '../../utils/cn'
import { SORT_OPTIONS } from '../../data/vehicles'

/** Grid / list switch. Two pressed-state buttons rather than a single toggle,
 *  because "which view am I in" is a question about the current state, and
 *  `aria-pressed` answers it directly. */
function ViewToggle({ view, onChange }) {
  const options = [
    { value: 'grid', icon: LayoutGrid, label: 'Grid view' },
    { value: 'list', icon: List, label: 'List view' },
  ]

  return (
    <div
      role="group"
      aria-label="Result layout"
      className="inline-flex shrink-0 rounded-lg border border-slate-300 bg-white p-0.5"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-label={label}
          title={label}
          onClick={() => onChange(value)}
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-md transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
            view === value
              ? 'bg-brand-900 text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-brand-900',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/**
 * The bar above the results: how many cars matched, the keyword search, sort
 * order, layout, and — on small screens only — the button that opens the
 * filter drawer.
 *
 * The search writes to the URL on every keystroke rather than debouncing into
 * local state. Keeping one source of truth means "Clear all", a removed chip
 * and the back button all update this field for free, with no effect syncing
 * the two; the results narrowing as you type is the behaviour, not a side
 * effect. Progress is reported by the spinner beside the count instead of by
 * dimming the grid, which would flicker on every character.
 */
export default function VehicleToolbar({
  total = 0,
  page = 1,
  pageSize = 0,
  loading = false,
  hasResults = false,
  filters,
  onSetFilter,
  onOpenFilters,
  activeCount = 0,
  className,
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          type="search"
          value={filters.q}
          onChange={(event) => onSetFilter('q', event.target.value)}
          placeholder="Search by make, model, colour, or stock number"
          aria-label="Search inventory"
          className={cn('pl-10', filters.q && 'pr-10')}
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => onSetFilter('q', '')}
            aria-label="Clear search"
            className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite" className="mr-auto text-sm text-slate-600">
          {total === 0 ? (
            'No vehicles'
          ) : (
            <>
              Showing{' '}
              <span className="font-semibold text-brand-900 tabular-nums">
                {first}–{last}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-brand-900 tabular-nums">
                {total}
              </span>{' '}
              {total === 1 ? 'vehicle' : 'vehicles'}
            </>
          )}
          {loading && hasResults && (
            <LoaderCircle
              className="ml-2 inline size-3.5 animate-spin text-slate-400"
              aria-label="Updating results"
            />
          )}
        </p>

        {/* Wrapped rather than given `hidden lg:hidden` directly: Button already
            sets a display utility, and two of them on one element resolve by
            stylesheet order, not by the order in the class attribute. */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            icon={SlidersHorizontal}
            onClick={onOpenFilters}
          >
            Filters
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-brand-900 px-1.5 text-xs font-bold text-white tabular-nums">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        <div className="w-44 shrink-0">
          <Select
            aria-label="Sort vehicles"
            value={filters.sort}
            onChange={(event) => onSetFilter('sort', event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        <ViewToggle
          view={filters.view}
          onChange={(value) => onSetFilter('view', value)}
        />
      </div>
    </div>
  )
}
