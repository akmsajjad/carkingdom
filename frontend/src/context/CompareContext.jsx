import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useToast } from './ToastContext'

const CompareContext = createContext(null)

const STORAGE_KEY = 'carkingdom:compare'

/** Four is the practical limit — beyond that a comparison table is unreadable
 *  on any screen, and the decision it supports is already lost. */
export const MAX_COMPARE = 4

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds, reset] = useLocalStorage(STORAGE_KEY, [])
  const toast = useToast()

  const isComparing = useCallback(
    (id) => compareIds.includes(id),
    [compareIds],
  )

  const toggleCompare = useCallback(
    (id, label = 'Vehicle') => {
      // As in FavoritesContext: the toast is fired after the state update rather
      // than inside the updater function, which runs during the render pass and
      // must stay free of side effects.
      const comparing = compareIds.includes(id)

      if (comparing) {
        setCompareIds(compareIds.filter((item) => item !== id))
        toast.info(`${label} removed from comparison`)
        return
      }

      if (compareIds.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} vehicles at a time`)
        return
      }

      setCompareIds([...compareIds, id])
      toast.success(`${label} added to comparison`)
    },
    [compareIds, setCompareIds, toast],
  )

  const removeCompare = useCallback(
    (id, label = 'Vehicle') => {
      setCompareIds((current) => current.filter((item) => item !== id))
      toast.info(`${label} removed from comparison`)
    },
    [setCompareIds, toast],
  )

  const clearCompare = useCallback(() => {
    reset()
    toast.info('Comparison cleared')
  }, [reset, toast])

  /** Drops compared ids whose vehicle is no longer in the inventory. Silent,
   *  for the same reason `pruneFavorites` is — see the note there. */
  const pruneCompare = useCallback(
    (validIds) => {
      const valid = new Set(validIds)
      const missing = compareIds.filter((id) => !valid.has(id))
      if (missing.length === 0) return
      setCompareIds(compareIds.filter((id) => valid.has(id)))
    },
    [compareIds, setCompareIds],
  )

  const value = useMemo(
    () => ({
      compareIds,
      count: compareIds.length,
      isFull: compareIds.length >= MAX_COMPARE,
      isComparing,
      toggleCompare,
      removeCompare,
      clearCompare,
      pruneCompare,
    }),
    [
      compareIds,
      isComparing,
      toggleCompare,
      removeCompare,
      clearCompare,
      pruneCompare,
    ],
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
