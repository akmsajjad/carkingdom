/**
 * Scroll behaviour that respects the user's motion preference.
 *
 * `src/index.css` already flips `html { scroll-behavior }` to `auto` under
 * `prefers-reduced-motion: reduce`, which covers fragment navigation and any
 * `scrollIntoView()` that does not pass a behaviour. It does **not** cover a
 * call that passes `behavior: 'smooth'` explicitly — an explicit behaviour
 * overrides the CSS value, so every one of those was animating the scroll for
 * users who had asked the system not to. This is the one place that decides,
 * so the JS and the CSS cannot drift apart again.
 *
 * `'instant'` rather than `'auto'` on purpose: `'auto'` means "use the CSS
 * value", which is `smooth` again for everyone who has not opted out — and
 * under the reduced-motion block the CSS is `auto`, which resolves back to
 * `smooth` by the same rule. Only `'instant'` is unambiguous.
 */
export function scrollBehavior() {
  // Guarded so this is safe to call anywhere. In the browser `matchMedia` is
  // always present; if the app is ever rendered outside one, "no stated
  // preference" is the right default rather than a crash.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'smooth'
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth'
}
