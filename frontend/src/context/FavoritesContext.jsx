import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useToast } from './ToastContext'

const FavoritesContext = createContext(null)

const STORAGE_KEY = 'carkingdom:favorites'

/**
 * Saved vehicles, persisted to localStorage.
 *
 * Stores vehicle ids rather than whole vehicle objects: if a price or photo
 * changes on the server, a stored copy would silently go stale. Replacing mock
 * data with the Django API later therefore needs no migration.
 */
export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds, reset] = useLocalStorage(STORAGE_KEY, [])
  const toast = useToast()

  const isFavorite = useCallback(
    (id) => favoriteIds.includes(id),
    [favoriteIds],
  )

  const toggleFavorite = useCallback(
    (id, label = 'Vehicle') => {
      // The toast fires outside the state updater deliberately. An updater runs
      // during React's render pass, so calling another component's setState from
      // inside one is a render-phase update — React logs "Cannot update a
      // component while rendering a different component", and under StrictMode
      // the updater runs twice so the toast would appear twice.
      const saved = favoriteIds.includes(id)

      setFavoriteIds(
        saved
          ? favoriteIds.filter((item) => item !== id)
          : [...favoriteIds, id],
      )

      if (saved) toast.info(`${label} removed from favorites`)
      else toast.success(`${label} added to favorites`)
    },
    [favoriteIds, setFavoriteIds, toast],
  )

  const removeFavorite = useCallback(
    (id, label = 'Vehicle') => {
      setFavoriteIds((current) => current.filter((item) => item !== id))
      toast.info(`${label} removed from favorites`)
    },
    [setFavoriteIds, toast],
  )

  const clearFavorites = useCallback(() => {
    reset()
    toast.info('Favorites cleared')
  }, [reset, toast])

  const value = useMemo(
    () => ({
      favoriteIds,
      count: favoriteIds.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favoriteIds, isFavorite, toggleFavorite, removeFavorite, clearFavorites],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
