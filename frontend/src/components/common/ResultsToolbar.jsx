import { LayoutGrid, List, LoaderCircle, Search, SlidersHorizontal, X } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import { cn } from '../../utils/cn'

/** Grid / list switch. Two pressed-state buttons rather than a single toggle,
 *  because "which view am I in" is a question about the current state, and
 *  `aria-pressed` answers it directly. */
function ViewToggle({ view, onChange, label }) {
  const options = [
    { value: 'grid', icon: LayoutGrid, label: 'Grid view' },
    { value: 'list', icon: List, label: 'List view' },
  ]

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex shrink-0 rounded-lg border border-slate-300 bg-white p-0.5"
    >
      {options.map(({ value, icon: Icon, label: optionLabel }) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-label={optionLabel}
          title={optionLabel}
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
 * The bar above any catalogue's results: how many matched, the keyword search,
 * sort order, layout, and — on small screens only — the button that opens the
 * filter drawer.
 *
 * Shared by the vehicle marketplace and the parts catalogue. Everything that
 * differs between them is a prop: the noun in the count, the search
 * placeholder, and the sort options. That is the whole difference, and it is
 * data rather than behaviour.
 *
 * The search writes to the URL on every keystroke rather than debouncing into
 * local state. Keeping one source of truth means "Clear all", a removed chip
 * and the back button all update this field for free, with no effect syncing
 * the two; the results narrowing as you type is the behaviour, not a side
 * effect. Progress is reported by the spinner beside the count instead of by
 * dimming the grid, which would flicker on every character.
 */
export default function ResultsToolbar({
  total = 0,
  page = 1,
  pageSize = 0,
  loading = false,
  hasResults = false,
  filters,
  sortOptions = [],
  noun = { singular: 'result', plural: 'results' },
  searchPlaceholder = 'Search',
  searchLabel = 'Search',
  resultsLabel = 'Result layout',
  sortLabel = 'Sort results',
  onSetFilter,
  onOpenFilters,
  filtersPanelId,
  filtersOpen = false,
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
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
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
            <>No {noun.plural}</>
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
              {total === 1 ? noun.singular : noun.plural}
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
            // The button opens a `role="dialog"` drawer, so it says so, and it
            // reports whether that drawer is currently open — without
            // `aria-expanded` a screen-reader user gets no confirmation that
            // the press did anything, because the panel that appeared is
            // outside their reading position.
            aria-haspopup="dialog"
            aria-controls={filtersPanelId}
            aria-expanded={filtersOpen}
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
            aria-label={sortLabel}
            value={filters.sort}
            onChange={(event) => onSetFilter('sort', event.target.value)}
            options={sortOptions}
          />
        </div>

        <ViewToggle
          view={filters.view}
          onChange={(value) => onSetFilter('view', value)}
          label={resultsLabel}
        />
      </div>
    </div>
  )
}
