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
 */
export default function useAsync(asyncFn, key = '') {
  const fnRef = useRef(asyncFn)
  useEffect(() => {
    fnRef.current = asyncFn
  })

  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    setState((previous) => ({ ...previous, loading: true, error: null }))

    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [key, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return { ...state, reload }
}
