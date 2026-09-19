import { RotateCcw } from 'lucide-react'
import Button from '../common/Button'
import Drawer from '../common/Drawer'
import FacetList, { FacetErrorNotice, LoneCheckbox, RangeInputs } from '../common/Facets'
import FilterSection from '../common/FilterSection'
import Select from '../common/Select'
import { formatPrice } from '../../utils/format'

/**
 * The parts filter sidebar, and the same panel again as a mobile drawer.
 *
 * Mirrors `VehicleFilters` closely enough that it would be tempting to merge
 * them — but the two share no filter in common. A vehicle is filtered by make
 * and mileage, a part by brand and whether it is on the shelf. What they do
 * share is the machinery: the facet checkbox groups, the standalone flags and
 * the min/max ranges all come from `common/Facets`, so this file is a list of
 * which filters exist and nothing else.
 */
export default function PartFilters({
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

      <FilterSection title="Category" defaultOpen>
        <FacetList
          group="category"
          options={options?.categories}
          selected={filters.category}
          counts={facets?.category}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Brand" defaultOpen>
        <FacetList
          group="brand"
          options={options?.brands}
          selected={filters.brand}
          counts={facets?.brand}
          onToggle={onToggleArray}
        />
      </FilterSection>

      <FilterSection title="Price">
        <RangeInputs
          minKey="minPrice"
          maxKey="maxPrice"
          minLabel="Minimum price"
          maxLabel="Maximum price"
          filters={filters}
          onSetFilter={onSetFilter}
          bounds={options?.priceBounds}
          format={formatPrice}
          hint={(min, max) => `Prices run from ${min} to ${max}`}
        />
      </FilterSection>

      <FilterSection title="Rating">
        <Select
          aria-label="Minimum rating"
          value={filters.minRating ?? ''}
          onChange={(event) => onSetFilter('minRating', event.target.value)}
          placeholder="Any rating"
          options={(options?.ratings ?? []).map((value) => ({
            value: String(value),
            label: `${value} stars and up`,
          }))}
        />
      </FilterSection>

      <FilterSection title="Availability">
        <LoneCheckbox
          checked={filters.inStock}
          onChange={() => onSetFilter('inStock', !filters.inStock)}
          label="In stock only"
        />
        <LoneCheckbox
          checked={filters.onSale}
          onChange={() => onSetFilter('onSale', !filters.onSale)}
          label="On sale"
        />
        <LoneCheckbox
          checked={filters.universal}
          onChange={() => onSetFilter('universal', !filters.universal)}
          label="Universal fit"
        />
      </FilterSection>
    </div>
  )

  return (
    <>
      <aside aria-label="Parts filters" className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          {panel}
        </div>
      </aside>

      <Drawer
        id="part-filters"
        open={open}
        onClose={onClose}
        label="Parts filters"
        side="left"
        width="w-[min(22rem,88vw)]"
        title={<p className="text-base font-semibold text-brand-900">Filter parts</p>}
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
