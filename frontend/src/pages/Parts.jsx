import { useRef, useState } from 'react'
import { RotateCcw, Wrench } from 'lucide-react'
import ActiveFilterChips from '../components/common/ActiveFilterChips'
import Button from '../components/common/Button'
import PageHeader from '../components/common/PageHeader'
import Pagination from '../components/common/Pagination'
import ResultsToolbar from '../components/common/ResultsToolbar'
import PartFilters from '../components/parts/PartFilters'
import PartGrid from '../components/parts/PartGrid'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import usePartFilters, { FILTER_FIELDS } from '../hooks/usePartFilters'
import { getPartFilterOptions, getParts } from '../services/parts'
import { SORT_OPTIONS } from '../data/parts'
import { scrollBehavior } from '../utils/scroll'

export default function Parts() {
  useDocumentTitle('Parts & Accessories')

  const {
    filters,
    requestKey,
    activeCount,
    hasFilters,
    setFilter,
    toggleArrayFilter,
    setPage,
    clearAll,
  } = usePartFilters()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const resultsRef = useRef(null)

  /**
   * `filters` is already the shape `getParts` expects — the same parameter
   * names the REST endpoint will take — so it is passed straight through rather
   * than re-mapped field by field. `view` rides along and is ignored by the
   * service.
   */
  const { data, loading, error, reload } = useAsync(
    () => getParts(filters),
    requestKey,
  )

  // Options and facet counts load once; only the results depend on the filters.
  // Its failure is handled rather than ignored: the panel would otherwise
  // render headings over empty lists, which looks like a catalogue with no
  // brake parts rather than a request that did not come back.
  const {
    data: options,
    error: optionsError,
    reload: reloadOptions,
  } = useAsync(getPartFilterOptions, 'part-filter-options')

  const parts = data?.results ?? []
  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? filters.page

  const handlePageChange = (next) => {
    setPage(next)
    // Jumping to page 3 from the bottom of the page otherwise leaves the user
    // looking at the footer of a list they have not seen the top of.
    resultsRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  }

  return (
    <>
      <PageHeader
        eyebrow="Parts & accessories"
        title="Parts for every make and model"
        description="Batteries, brakes, filters and everything in between — stocked at our Dudley Street counter, with fitment checked before you buy. Order online and we will confirm stock and fitment before you pay a cent."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Parts' }]}
      />

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <PartFilters
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
              hasResults={parts.length > 0}
              filters={filters}
              sortOptions={SORT_OPTIONS}
              noun={{ singular: 'part', plural: 'parts' }}
              searchPlaceholder="Search by name, brand, or part number"
              searchLabel="Search parts"
              resultsLabel="Parts layout"
              sortLabel="Sort parts"
              onSetFilter={setFilter}
              onOpenFilters={() => setDrawerOpen(true)}
              filtersPanelId="part-filters"
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
              <PartGrid
                parts={parts}
                loading={loading}
                error={error}
                onRetry={reload}
                view={filters.view}
                emptyTitle={
                  hasFilters
                    ? 'No parts match those filters'
                    : 'No parts are listed right now'
                }
                emptyDescription={
                  hasFilters
                    ? 'Try removing a filter or widening the price range — or call the counter and we will check the shelf for you.'
                    : 'Our stock changes daily. Call the parts counter and we will tell you what is in.'
                }
                emptyAction={
                  hasFilters ? (
                    <Button variant="outline" icon={RotateCcw} onClick={clearAll}>
                      Clear all filters
                    </Button>
                  ) : (
                    <Button to="/contact" variant="outline" icon={Wrench}>
                      Ask the parts counter
                    </Button>
                  )
                }
              />
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
              label="Parts catalogue pages"
              className="mt-10"
            />
          </div>
        </div>
      </div>
    </>
  )
}
