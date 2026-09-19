import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const MobileCtaContext = createContext(null)

/**
 * Whether the global mobile call-to-action bar has been superseded.
 *
 * The vehicle page already pins its own bar to the bottom of the screen, and
 * there it carries the price and a test-drive button — strictly more useful
 * than the generic Call / Message / Appointment row. Two bars stacked on a
 * phone would be worse than either one alone, so a page that provides its own
 * claims the slot and the global bar stands down.
 *
 * A count rather than a boolean, because the claim is released on unmount: if
 * two claimants were ever mounted at once, the first to leave must not clear a
 * claim the second still holds.
 */
export function MobileCtaProvider({ children }) {
  const [claims, setClaims] = useState(0)

  // Stable identity matters: callers register from an effect, and a callback
  // that was rebuilt on every render would re-run that effect on every render.
  const claim = useCallback(() => {
    setClaims((current) => current + 1)
    return () => setClaims((current) => current - 1)
  }, [])

  const value = useMemo(
    () => ({ superseded: claims > 0, claim }),
    [claims, claim],
  )

  return (
    <MobileCtaContext.Provider value={value}>
      {children}
    </MobileCtaContext.Provider>
  )
}

/** Read the bar's state. Used by the shell that renders it. */
export function useMobileCta() {
  const context = useContext(MobileCtaContext)
  if (!context) {
    throw new Error('useMobileCta must be used within a MobileCtaProvider')
  }
  return context
}

/**
 * Claim the bottom slot for as long as the calling component is mounted.
 *
 * Declared by the component that provides its own bar, so every page that
 * renders one is handled without the page itself having to say anything.
 */
export function useClaimMobileCtaSlot() {
  const { claim } = useMobileCta()
  // `claim` returns its own release function, so the effect cleans up by
  // returning it directly.
  useEffect(() => claim(), [claim])
}
