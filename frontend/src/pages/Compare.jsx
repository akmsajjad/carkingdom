import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, Scale, Search, Trash2 } from 'lucide-react'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import PageHeader from '../components/common/PageHeader'
import { LoadingBlock } from '../components/common/Spinner'
import CompareTable from '../components/compare/CompareTable'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { MAX_COMPARE, useCompare } from '../context/CompareContext'
import { getVehiclesByIds } from '../services/vehicles'

/**
 * §26. Up to four vehicles, side by side.
 *
 * The table itself is in `CompareTable`; this page owns the fetch, the empty
 * states and the two controls above it.
 *
 * One vehicle is not a comparison, so the page refuses to render a table until
 * there are two. A single-column table looks like a bug and teaches nothing —
 * the empty state says what to do instead, which is a better answer than a
 * table with one column in it.
 */
export default function Compare() {
  useDocumentTitle('Compare vehicles')

  const { compareIds, count, removeCompare, clearCompare, pruneCompare } =
    useCompare()

  const {
    data,
    loading,
    error,
    stale,
    reload,
  } = useAsync(() => getVehiclesByIds(compareIds), compareIds.join(','))

  // `data` is `null` until the request resolves, and a destructuring default
  // only covers `undefined` — so the coercion has to happen here rather than in
  // the line above. Memoized so the identity is stable: the prune effect below
  // depends on it, and a fresh `[]` on every render would re-run the effect for
  // as long as the request is in flight.
  const vehicles = useMemo(() => data ?? [], [data])

  // Shared features are noise in a comparison — the differences are the point.
  // On by default, and switchable, because "do they both have a backup camera"
  // is a real question the filtered view cannot answer.
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(true)

  // Same reason as the saved list: a compared vehicle that has left the lot
  // comes back missing, and the header badge would keep counting it.
  //
  // `stale` is part of the guard, not just `loading`. There is one render
  // between the ids changing and the request starting where `loading` is still
  // false while `data` is the *previous* set — and pruning against that set
  // deletes the vehicle the visitor has just added, before the request that
  // would have confirmed it has even gone out.
  useEffect(() => {
    if (loading || stale || error) return
    pruneCompare(vehicles.map((vehicle) => vehicle.id))
  }, [loading, stale, error, vehicles, pruneCompare])

  const canCompare = vehicles.length >= 2

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Compare vehicles side by side"
        description={`Up to ${MAX_COMPARE} vehicles, with the specification that actually differs marked for you. Add a vehicle from anywhere on the site with the compare button on its card.`}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Compare' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to="/used-cars" variant="accent" icon={Search}>
            Add a vehicle
          </Button>
          {count > 0 && (
            <Button to="/favorites" variant="white">
              Your saved vehicles
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="container-page py-8 lg:py-12">
        {error ? (
          <ErrorState
            title="We couldn't load the comparison"
            description={
              error.message ||
              'Something went wrong fetching the vehicles you are comparing. Please try again.'
            }
            onRetry={reload}
          />
        ) : (loading && vehicles.length === 0) || stale ? (
          <LoadingBlock label="Loading your comparison…" />
        ) : !canCompare ? (
          <EmptyState
            icon={Scale}
            title={
              count === 0
                ? 'Nothing to compare yet'
                : 'One more and you can compare'
            }
            description={
              count === 0
                ? 'Add vehicles with the compare button on any card, and they will line up here. Two is the minimum, four is the most that stays readable.'
                : `You have saved ${vehicles[0]?.title ?? 'one vehicle'} for comparison. Add a second and the full specification table appears.`
            }
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button to="/used-cars" icon={Search}>
                  Browse the inventory
                </Button>
                {count > 0 && (
                  <Button variant="outline" onClick={clearCompare}>
                    Start over
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p aria-live="polite" className="text-sm font-medium text-slate-600">
                {vehicles.length} of {MAX_COMPARE} compared
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showOnlyDifferences}
                    onChange={(event) =>
                      setShowOnlyDifferences(event.target.checked)
                    }
                    className="size-4 rounded border-slate-300 text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                  />
                  Show only differences
                </label>

                <Button
                  variant="ghost"
                  icon={Trash2}
                  onClick={clearCompare}
                  className="text-sm"
                >
                  Clear all
                </Button>
              </div>
            </div>

            {/* Each column can be dropped without leaving the page — the usual
                reason to remove one is that you have just decided against it,
                and hunting for its card again to un-tick it would be absurd. */}
            <ul className="mt-4 flex flex-wrap gap-2">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <button
                    type="button"
                    onClick={() => removeCompare(vehicle.id, vehicle.title)}
                    aria-label={`Remove ${vehicle.title} from the comparison`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                  >
                    {vehicle.title}
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <CompareTable
                vehicles={vehicles}
                showOnlyDifferences={showOnlyDifferences}
              />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Scroll the table sideways to see every vehicle — the specification
              column stays put. Prices are before taxes and fees.
            </p>

            {vehicles.length < MAX_COMPARE && (
              <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-4">
                <ArrowLeftRight
                  className="size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <p className="text-sm text-slate-600">
                  Room for {MAX_COMPARE - vehicles.length} more.
                </p>
                <Button to="/used-cars" variant="outline" size="sm">
                  Add another vehicle
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
