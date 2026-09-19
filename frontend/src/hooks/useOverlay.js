import { useEffect, useRef } from 'react'

/**
 * Anything the browser will hand focus to with Tab. `[tabindex="-1"]` is
 * excluded deliberately: those elements are focus targets for scripts, not for
 * the keyboard, and the drawer's own panel is one of them.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Shared behaviour for the slide-over panels — the mobile nav and the mobile
 * filter drawer: lock page scroll behind the panel, close it on Escape, and
 * hold focus inside it while it is open.
 *
 * Extracted the second time it was needed. The two drawers hold different
 * content, but they must not differ in how they hold the page.
 *
 * `onClose` is read through a ref so an inline arrow at the call site does not
 * tear down and re-add the key listener on every render.
 *
 * ## Why the focus handling lives here
 *
 * A `role="dialog" aria-modal="true"` panel is a promise to the user that
 * nothing outside it is reachable. Without a trap that promise is false: Tab
 * walks out of the panel and onto the page behind the backdrop, which is
 * dimmed, scroll-locked, and impossible to see where the focus went. The
 * backdrop is the first thing in the DOM, so Tab from the top of the panel
 * went straight to it.
 *
 * Focus is returned to whatever opened the panel on close. That is the half
 * everyone forgets, and its absence strands a keyboard user at the top of the
 * document every time they close a menu.
 *
 * Returns the ref to attach to the panel element. It must be on the dialog
 * itself, not on a wrapper — the trap is bounded by it.
 */
export default function useOverlay(active, onClose) {
  const closeRef = useRef(onClose)
  const panelRef = useRef(null)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!active) return

    const panel = panelRef.current
    const previouslyFocused = document.activeElement

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeRef.current()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const focusable = panel.querySelectorAll(FOCUSABLE_SELECTOR)

      // Nothing to cycle through. Holding focus on the panel beats letting it
      // escape to the page behind, which is what would otherwise happen.
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      // `document.activeElement` can also be the panel itself, which is where
      // focus starts — see below.
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    // Focus the panel rather than its first control. On the nav drawer that
    // control is the close button, so landing on it would announce "Close main
    // menu" before saying what the menu is; the panel carries the `aria-label`,
    // so starting here reads the dialog's own name first.
    panel?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)

      // Only if focus is still ours to give back. If the user has since moved
      // on — clicked a nav link that navigated, focused something else — the
      // page's own focus is the newer, better answer and is left alone.
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused) &&
        (panel === null || panel.contains(document.activeElement) || document.activeElement === document.body)
      ) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [active])

  return panelRef
}
