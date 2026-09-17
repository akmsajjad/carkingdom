import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Resets scroll position on navigation.
 *
 * Two cases are deliberately excluded:
 *  - POP (browser back/forward) keeps the position the browser restored, which
 *    is what a user expects when they hit back into a long listing.
 *  - A hash target scrolls to that element instead of the top, so footer and
 *    in-page anchor links like /about#team land where they point.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    if (navigationType === 'POP') return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])

  return null
}
