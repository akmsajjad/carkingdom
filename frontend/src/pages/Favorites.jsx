import { useEffect, useMemo } from 'react'
import { ArrowLeftRight, Heart, Trash2 } from 'lucide-react'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ErrorState from '../components/common/ErrorState'
import PageHeader from '../components/common/PageHeader'
import { VehicleRowSkeleton } from '../components/common/Skeleton'
import SavedVehicleRow from '../components/favorites/SavedVehicleRow'
import useAsync from '../hooks/useAsync'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useFavorites } from '../context/FavoritesContext'
import { getVehiclesByIds } from '../services/vehicles'

/**
 * §25. The saved shortlist.
 *
 * Rendered as rows rather than a card grid: this is a list somebody is working
 * through — keeping one, dropping another, sending a couple to the comparison —
 * and a row leaves room for the controls to be labelled instead of iconic.
 *
 * The ids in localStorage are the source of truth and the vehicles are fetched
 * from them, not the other way round. That is what keeps a saved price honest
 * when the price changes, and it is the shape the Django endpoint will have.
 */
export default function Favorites() {
  useDocumentTitle('Saved vehicles')

  const { favoriteIds, count, clearFavorites, pruneFavorites } = useFavorites()

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(() => getVehiclesByIds(favoriteIds), favoriteIds.join(','))

  // `data` is `null` until the request resolves, and a destructuring default
  // only covers `undefined` — so the coercion has to happen here rather than in
  // the line above. Memoized so the identity is stable: the prune effect below
  // depends on it, and a fresh `[]` on every render would re-run the effect for
  // as long as the request is in flight.
  const vehicles = useMemo(() => data ?? [], [data])

  /**
   * Drops saved ids the inventory no longer has.
   *
   * A vehicle that sells and leaves the lot comes back missing from the
   * response, and without this the header badge would go on counting it. The
   * context has no knowledge of inventory, so the page that does the fetching
   * is the right place to notice.
   */
  useEffect(() => {
    if (loading || error) return
    pruneFavorites(vehicles.map((vehicle) => vehicle.id))
  }, [loading, error, vehicles, pruneFavorites])

  const canCompare = vehicles.length >= 2

  const headerActions = useMemo(
    () => (
      <div className="flex flex-wrap gap-3">
        {canCompare && (
          <Button to="/compare" variant="accent" icon={ArrowLeftRight}>
            Compare these {vehicles.length}
          </Button>
        )}
        <Button to="/used-cars" variant="white">
          Browse inventory
        </Button>
      </div>
    ),
    [canCompare, vehicles.length],
  )

  if (!loading && count === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Saved"
          title="Your saved vehicles"
          description="Vehicles you have saved, all in one place — ready to compare side by side or come back to."
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Saved' }]}
        />

        <div className="container-page py-16 sm:py-20">
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any vehicle and it will wait for you here — on this device, without an account. Save two or more and you can put them side by side."
            action={
              <Button to="/used-cars" icon={ArrowLeftRight}>
                Browse the inventory
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Your saved vehicles"
        description="Vehicles you have saved, all in one place — ready to compare side by side or come back to."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Saved' }]}
      >
        {headerActions}
      </PageHeader>

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p
            aria-live="polite"
            className="text-sm font-medium text-slate-600"
          >
            {loading
              ? 'Loading your saved vehicles…'
              : `${count} ${count === 1 ? 'vehicle' : 'vehicles'} saved`}
          </p>

          {count > 0 && (
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={clearFavorites}
              className="text-sm"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="mt-6" aria-busy={loading || undefined}>
          {error ? (
            <ErrorState
              title="We couldn't load your saved vehicles"
              description={
                error.message ||
                'Something went wrong fetching the vehicles you saved. Please try again.'
              }
              onRetry={reload}
            />
          ) : loading && vehicles.length === 0 ? (
            <ul className="space-y-4" aria-busy="true">
              <p role="status" className="sr-only">
                Loading your saved vehicles…
              </p>
              {Array.from({ length: Math.max(count, 1) }, (_, index) => (
                <VehicleRowSkeleton key={index} />
              ))}
            </ul>
          ) : (
            <ul className="space-y-4">
              {vehicles.map((vehicle) => (
                <SavedVehicleRow key={vehicle.id} vehicle={vehicle} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
