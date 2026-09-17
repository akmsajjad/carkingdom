import { useCallback, useEffect, useState } from 'react'

/**
 * State mirrored into localStorage.
 *
 * Every read and write is wrapped in try/catch: localStorage throws in private
 * browsing and when the quota is exceeded, and a cart that crashes the app is
 * far worse than a cart that forgets. On failure the state still works for the
 * session, it just doesn't persist.
 *
 * Also listens for the `storage` event so two open tabs don't silently
 * disagree about what's in the cart.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable or full — keep going with in-memory state.
    }
  }, [key, value])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== key || event.storageArea !== window.localStorage) return
      try {
        setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue))
      } catch {
        // Ignore malformed values written by another tab.
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
    // `initialValue` is intentionally excluded: it is usually a fresh literal
    // each render and would re-subscribe on every one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return [value, setValue, reset]
}
