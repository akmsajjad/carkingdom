import { RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import Drawer from '../common/Drawer'
import FacetList, { FacetErrorNotice, LoneCheckbox, RangeInputs } from '../common/Facets'
import FilterSection from '../common/FilterSection'
import Input from '../common/Input'
import { formatPrice } from '../../utils/format'

/**
 * The filter sidebar, and the same panel again as a mobile drawer.
 *
 * The panel markup is written once and rendered into both containers — a
 * desktop sticky column and a left slide-over — so the two can never disagree
 * about which filters exist.
 *
 * The individual controls — the facet checkbox groups, the standalone flags,
 * the min/max ranges — live in `common/Facets`, because the parts catalogue
 * needs the same three things and was otherwise a copy of this file.
 */
export default function VehicleFilters({
  filters,
  options,
  optionsError = null,
  onReloadOptions,
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

      {optionsError && (
        <div className="pb-1">
          <FacetErrorNotice onRetry={onReloadOptions} />
        </div>
      )}

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
          hint={(min, max) => `Inventory ranges from ${min} to ${max}`}
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
        <LoneCheckbox
          checked={filters.featured}
          onChange={() => onSetFilter('featured', !filters.featured)}
          label="Featured vehicles only"
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
        id="vehicle-filters"
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
