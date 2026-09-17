import { useId } from 'react'
import { RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import Checkbox from '../common/Checkbox'
import Drawer from '../common/Drawer'
import Input from '../common/Input'
import FilterSection from './FilterSection'
import { formatPrice } from '../../utils/format'

/**
 * One group of facet checkboxes, shared by every facet section below.
 *
 * The ids come from `useId` rather than from the facet value, because this
 * panel is rendered twice — once in the desktop column, once in the mobile
 * drawer — and a literal id like `filter-make-Toyota` would exist twice in the
 * document. `htmlFor` resolves to the first match, so the drawer's label would
 * silently operate the hidden desktop input.
 */
function FacetList({ group, options, selected, counts, onToggle }) {
  const uid = useId()

  if (!options?.length) return null

  return (
    <>
      {options.map((value) => (
        <Checkbox
          key={value}
          id={`${uid}-${group}-${value}`}
          checked={selected.includes(value)}
          onChange={() => onToggle(group, value)}
          label={
            <span className="flex flex-1 items-center justify-between gap-2">
              <span>{value}</span>
              {counts?.[value] != null && (
                <span className="text-xs text-slate-400 tabular-nums">
                  {counts[value]}
                </span>
              )}
            </span>
          }
        />
      ))}
    </>
  )
}

/** Its own component for the same reason `FacetList` generates its ids — the
 *  panel below is rendered twice. */
function FeaturedCheckbox({ checked, onChange }) {
  const id = useId()

  return (
    <Checkbox
      id={id}
      checked={checked}
      onChange={onChange}
      label="Featured vehicles only"
    />
  )
}

/** A paired min/max numeric range. Controlled straight from the URL — the mock
 *  service answers instantly, and `useAsync` discards a superseded response, so
 *  typing "15000" costs a few abandoned timers rather than a stale render. */
function RangeInputs({ minKey, maxKey, minLabel, maxLabel, filters, onSetFilter, bounds, format = (v) => v }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={bounds?.min}
          max={bounds?.max}
          placeholder="Min"
          aria-label={minLabel}
          value={filters[minKey] ?? ''}
          onChange={(event) => onSetFilter(minKey, event.target.value)}
        />
        <span aria-hidden="true" className="text-slate-400">
          –
        </span>
        <Input
          type="number"
          inputMode="numeric"
          min={bounds?.min}
          max={bounds?.max}
          placeholder="Max"
          aria-label={maxLabel}
          value={filters[maxKey] ?? ''}
          onChange={(event) => onSetFilter(maxKey, event.target.value)}
        />
      </div>
      {bounds && (
        <p className="text-xs text-slate-400">
          Inventory ranges from {format(bounds.min)} to {format(bounds.max)}
        </p>
      )}
    </>
  )
}

/**
 * The filter sidebar, and the same panel again as a mobile drawer.
 *
 * The panel markup is written once and rendered into both containers — a
 * desktop sticky column and a left slide-over — so the two can never disagree
 * about which filters exist.
 */
export default function VehicleFilters({
  filters,
  options,
  facets,
  activeCount = 0,
  onToggleArray,
  onSetFilter,
  onClearAll,
  open = false,
  onClose,
}) {
  const panel = (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 pb-4">
        <h2 className="text-base font-semibold text-brand-900">
          Filters
          {activeCount > 0 && (
            <span className="ml-1.5 text-sm font-normal text-slate-500">
              ({activeCount})
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-accent-700 transition-colors hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Price" defaultOpen>
        <RangeInputs
          minKey="minPrice"
          maxKey="maxPrice"
          minLabel="Minimum price"
          maxLabel="Maximum price"
          filters={filters}
          onSetFilter={onSetFilter}
          bounds={options?.priceBounds}
          format={formatPrice}
        />
      </FilterSection>

      <FilterSection title="Make" defaultOpen>
        <FacetList
          group="make"
          options={options?.makes}
          selected={filters.make}
          counts={facets?.make}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Body type">
        <FacetList
          group="bodyType"
          options={options?.bodyTypes}
          selected={filters.bodyType}
          counts={facets?.bodyType}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Condition">
        <FacetList
          group="condition"
          options={options?.conditions}
          selected={filters.condition}
          counts={facets?.condition}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Year">
        <RangeInputs
          minKey="minYear"
          maxKey="maxYear"
          minLabel="Earliest year"
          maxLabel="Latest year"
          filters={filters}
          onSetFilter={onSetFilter}
          bounds={options?.yearBounds}
        />
      </FilterSection>

      <FilterSection title="Mileage">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          step={5000}
          placeholder="Maximum mileage (km)"
          aria-label="Maximum mileage in kilometres"
          value={filters.maxMileage ?? ''}
          onChange={(event) => onSetFilter('maxMileage', event.target.value)}
        />
        <p className="text-xs text-slate-400">
          Lower mileage usually means a higher price — set a ceiling to see
          what fits your budget.
        </p>
      </FilterSection>

      <FilterSection title="Transmission">
        <FacetList
          group="transmission"
          options={options?.transmissions}
          selected={filters.transmission}
          counts={facets?.transmission}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Fuel type">
        <FacetList
          group="fuelType"
          options={options?.fuelTypes}
          selected={filters.fuelType}
          counts={facets?.fuelType}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Drivetrain">
        <FacetList
          group="drivetrain"
          options={options?.drivetrains}
          selected={filters.drivetrain}
          counts={facets?.drivetrain}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Highlights">
        <FeaturedCheckbox
          checked={filters.featured}
          onChange={() => onSetFilter('featured', !filters.featured)}
        />
      </FilterSection>
    </div>
  )

  return (
    <>
      <aside
        aria-label="Vehicle filters"
        className="hidden lg:block lg:w-72 lg:shrink-0"
      >
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          {panel}
        </div>
      </aside>

      <Drawer
        open={open}
        onClose={onClose}
        label="Vehicle filters"
        side="left"
        width="w-[min(22rem,88vw)]"
        title={<p className="text-base font-semibold text-brand-900">Filter inventory</p>}
        footer={
          <Button className="w-full" onClick={onClose}>
            Show results
          </Button>
        }
      >
        <div className="px-5 py-4">{panel}</div>
      </Drawer>
    </>
  )
}
