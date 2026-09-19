import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async function and tracks its loading, success and error states.
 *
 * `key` is the refetch trigger: change it (a filter string, a slug) and the
 * request re-runs. `asyncFn` is read through a ref so an inline arrow function
 * does not restart the request on every render.
 *
 * Staleness is handled per effect run rather than with a shared counter: each
 * run closes over its own `cancelled` flag, so a slow first request that
 * resolves after a faster second one cannot overwrite the newer result.
 *
 * ## `data` survives a key change, and `stale` is how you tell
 *
 * A new `key` does not clear `data` — the previous result stays on screen
 * while the next one loads. That is deliberate: on a listing page where the
 * key is a filter string, blanking the results on every keystroke would make
 * the grid flash back to skeletons, and `VehicleGrid`/`PartGrid` are built to
 * refresh in place instead.
 *
 * On a detail page the key is the entity itself, and the same behaviour is a
 * bug — the previous vehicle renders under the new URL, with working "book a
 * test drive" buttons for a car the visitor is no longer looking at. `stale`
 * is true exactly when the data on screen belongs to an earlier key, so those
 * pages can hold the loading state instead of drawing the wrong thing.
 */
export default function useAsync(asyncFn, key = '') {
  const fnRef = useRef(asyncFn)
  useEffect(() => {
    fnRef.current = asyncFn
  })

  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState({
    data: null,
    // Which key `data` came back from. `null` until the first response.
    dataKey: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    setState((previous) => ({ ...previous, loading: true, error: null }))

    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, dataKey: key, loading: false, error: null })
      })
      .catch((error) => {
        // A failure clears `data` rather than leaving the last good result in
        // place. The alternative reads as "here is your data" when the request
        // for it just failed, and every detail page's not-found branch depends
        // on this being null so it can stop rendering the old entity.
        if (!cancelled) setState({ data: null, dataKey: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [key, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return {
    ...state,
    // Nothing on screen cannot be stale; there is nothing to be out of date.
    stale: state.data !== null && state.dataKey !== key,
    reload,
  }
}
