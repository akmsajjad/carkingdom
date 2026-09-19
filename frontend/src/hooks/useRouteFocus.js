import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Moves focus into the page on navigation.
 *
 * Without this a client-side route change is invisible to anyone not looking
 * at the screen: the URL and the whole of `main` are replaced, but focus stays
 * on whatever the user last touched — a nav link, usually — so a screen reader
 * carries on reading the *old* page's surroundings, and the next Tab starts
 * from the header again as if nothing happened. Sending focus to the top of
 * `main` is what makes a new page announce itself.
 *
 * Three cases are deliberately excluded:
 *  - The first mount. The browser already has a sensible starting point, and
 *    stealing it would interrupt the initial read of the page.
 *  - POP (browser back/forward). The user is returning to somewhere they have
 *    already been; `ScrollToTop` leaves the position alone for the same reason,
 *    and focus should go back with it.
 *  - A navigation carrying a `#fragment`. The link's own target is the
 *    destination, and `ScrollToTop`/`useHashScroll` are already taking the user
 *    there — focusing `main` would contradict them and announce the top of the
 *    page instead of the section that was asked for.
 *
 * The target carries `tabIndex={-1}` so it can receive focus at all; it is not
 * added to the tab order, so nothing new becomes reachable by Tab. See the
 * comment on `<main>` in `RootLayout` for why the focus ring is suppressed
 * there.
 */
export default function useRouteFocus() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (hash) return
    if (navigationType === 'POP') return

    const main = document.getElementById('main-content')
    // `preventScroll` because the scroll position is not this hook's business:
    // it would jump the viewport to wherever `main` happens to start before
    // `ScrollToTop` has decided where the user should actually land.
    main?.focus({ preventScroll: true })
  }, [pathname, hash, navigationType])
}
