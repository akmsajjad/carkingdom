import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the element a `#fragment` names, once the page can honour it.
 *
 * `ScrollToTop` already handles the hash, but it runs on the navigation itself —
 * before a lazy route chunk has resolved, so on the pages that need this most
 * the element it is looking for does not exist yet and the fragment is silently
 * dropped. The footer's "Our Team" link and a job card's "Apply now" button both
 * arrive that way.
 *
 * `ready` is what the caller knows and this does not: a page whose content comes
 * from a request has to wait for it, and passing `false` holds the scroll until
 * it can land somewhere real. A page with static content is ready immediately.
 *
 * Scrolling to whatever fragment is present, rather than to one hardcoded id,
 * means a link to any heading on the page works — and a fragment that matches
 * nothing does nothing, which is the correct outcome for a stale link.
 */
export default function useHashScroll(ready = true) {
  const { hash } = useLocation()

  useEffect(() => {
    if (!ready || !hash || hash.length < 2) return

    const target = document.getElementById(hash.slice(1))
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, ready])
}
