import { useEffect, useRef } from 'react'

/**
 * Shared behaviour for the slide-over panels — the mobile nav and the mobile
 * filter drawer: lock page scroll behind the panel, and close it on Escape.
 *
 * Extracted the second time it was needed. The two drawers hold different
 * content, but they must not differ in how they hold the page.
 *
 * `onClose` is read through a ref so an inline arrow at the call site does not
 * tear down and re-add the key listener on every render.
 */
export default function useOverlay(active, onClose) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!active) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeRef.current()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])
}
