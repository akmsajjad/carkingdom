import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import ActiveFilterChips from '../components/common/ActiveFilterChips'
import Button from '../components/common/Button'
import PageHeader from '../components/common/PageHeader'
import Pagination from '../components/common/Pagination'
import ResultsToolbar from '../components/common/ResultsToolbar'
import VehicleFilters from '../components/vehicles/VehicleFilters'
import VehicleGrid from '../components/vehicles/VehicleGrid'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useVehicleFilters, { FILTER_FIELDS } from '../hooks/useVehicleFilters'
import { getVehicleFilterOptions, getVehicles } from '../services/vehicles'
import { SORT_OPTIONS } from '../data/vehicles'
import { scrollBehavior } from '../utils/scroll'

export default function UsedCars() {
  useDocumentTitle('Used Cars for Sale')

  const {
    filters,
    requestKey,
    activeCount,
    hasFilters,
    setFilter,
    toggleArrayFilter,
    setPage,
    clearAll,
  } = useVehicleFilters()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const resultsRef = useRef(null)

  /**
   * `filters` is already the shape `getVehicles` expects — the same parameter
   * names the REST endpoint will take — so it is passed straight through rather
   * than re-mapped field by field. `view` rides along and is ignored by the
   * service, which is cheaper than maintaining a second list of field names
   * here that could fall out of step with the first.
   */
  const { data, loading, error, reload } = useAsync(
    () => getVehicles(filters),
    requestKey,
  )

  // Options and facet counts load once; only the results depend on the filters.
  // Its failure is handled rather than ignored: the panel would otherwise
  // render headings over empty lists, which looks like a dealership with no
  // Toyotas rather than a request that did not come back.
  const {
    data: options,
    error: optionsError,
    reload: reloadOptions,
  } = useAsync(getVehicleFilterOptions, 'filter-options')

  const vehicles = data?.results ?? []
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? filters.page

  const handlePageChange = (next) => {
    setPage(next)
    // Jumping to page 6 from the bottom of the page otherwise leaves the user
    // looking at the footer of a list they have not seen the top of.
    resultsRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Used cars for sale in Saskatoon"
        description="Every vehicle on this lot has been inspected, comes with its full history, and is priced to sell — no haggling required. Filter the list to narrow it down, or call us and we'll do it for you."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Used Cars' }]}
      />

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <VehicleFilters
            filters={filters}
            options={options}
            optionsError={optionsError}
            onReloadOptions={reloadOptions}
            facets={data?.facets}
            activeCount={activeCount}
            onToggleArray={toggleArrayFilter}
            onSetFilter={setFilter}
            onClearAll={clearAll}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <ResultsToolbar
              total={total}
              page={currentPage}
              pageSize={pageSize}
              loading={loading}
              hasResults={vehicles.length > 0}
              filters={filters}
              sortOptions={SORT_OPTIONS}
              noun={{ singular: 'vehicle', plural: 'vehicles' }}
              searchPlaceholder="Search by make, model, colour, or stock number"
              searchLabel="Search inventory"
              resultsLabel="Vehicle layout"
              sortLabel="Sort vehicles"
              onSetFilter={setFilter}
              onOpenFilters={() => setDrawerOpen(true)}
              filtersPanelId="vehicle-filters"
              filtersOpen={drawerOpen}
              activeCount={activeCount}
            />

            <ActiveFilterChips
              fields={FILTER_FIELDS}
              filters={filters}
              onToggleArray={toggleArrayFilter}
              onSetFilter={setFilter}
              onClearAll={clearAll}
              className="mt-4"
            />

            <div ref={resultsRef} className="mt-6 scroll-mt-24">
              <VehicleGrid
                vehicles={vehicles}
                loading={loading}
                error={error}
                onRetry={reload}
                view={filters.view}
                emptyTitle={
                  hasFilters
                    ? 'No vehicles match those filters'
                    : 'No vehicles are listed right now'
                }
                emptyDescription={
                  hasFilters
                    ? 'Try removing a filter or widening the price range — or tell us what you are after and we will call you when it arrives.'
                    : 'Our inventory changes weekly. Get in touch and we will let you know what is coming in.'
                }
                emptyAction={
                  hasFilters ? (
                    <Button variant="outline" icon={RotateCcw} onClick={clearAll}>
                      Clear all filters
                    </Button>
                  ) : (
                    <Button to="/contact" variant="outline">
                      Contact us
                    </Button>
                  )
                }
              />
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
              className="mt-10"
            />
          </div>
        </div>
      </div>
    </>
  )
}
