import { useCallback, useEffect, useState } from 'react'

/** How long each slide is held. Long enough to read a price, short enough to feel alive. */
const DEFAULT_INTERVAL_MS = 4500

/**
 * One-at-a-time carousel state: which slide is showing, and when to move on.
 *
 * Returns `handlers` to spread onto the element wrapping the whole carousel,
 * rather than three separate callbacks, because the pause only works if they
 * all land on the same node — hover, focus and the arrow keys are three views
 * of one interaction.
 *
 * Three things here are load-bearing:
 *
 * 1. `prefers-reduced-motion` stops the timer outright, not just the animation.
 *    `index.css` already zeroes transition durations globally, so a running
 *    timer would still swap the slides on schedule — content changing by itself
 *    is the thing the preference is actually about.
 * 2. Hover and focus are tracked separately. A single flag would restart the
 *    carousel when the pointer leaves while the keyboard is still inside it.
 * 3. The index is clamped during render rather than corrected in an effect, so
 *    a list that arrives shorter than the last one never paints a frame parked
 *    on a slide that no longer exists.
 */
export default function useCarousel(count, { intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const [rawIndex, setRawIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Read once, then keep current, so changing the preference mid-visit is
  // respected without a reload.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const index = count > 0 ? Math.min(rawIndex, count - 1) : 0

  const goTo = useCallback(
    (next) => {
      if (count === 0) return
      setRawIndex(((next % count) + count) % count)
    },
    [count],
  )

  const paused = hovered || focused
  const autoPlaying = count > 1 && !paused && !reducedMotion

  // Re-armed whenever the index changes, so stepping manually also earns a full
  // interval instead of firing again the moment the user lets go.
  useEffect(() => {
    if (!autoPlaying) return undefined

    const id = setInterval(() => goTo(index + 1), intervalMs)
    return () => clearInterval(id)
  }, [autoPlaying, goTo, index, intervalMs])

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: () => setFocused(false),
    onKeyDown: (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(index - 1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goTo(index + 1)
      }
    },
  }

  return { index, goTo, paused, autoPlaying, handlers }
}
