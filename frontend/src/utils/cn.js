/**
 * Joins class names, dropping anything falsy.
 *
 * Deliberately tiny — conditional class logic in this codebase is simple
 * enough that a dependency like clsx/tailwind-merge isn't justified.
 *
 * The rule that makes that safe: a component's own classes and the `className`
 * a caller passes must never both set the same CSS property at the same
 * breakpoint. When they do, the winner is decided by stylesheet order, not by
 * the order they appear in the class attribute, so an override like
 * `className="hidden lg:inline-flex"` on a Button that already sets
 * `inline-flex` silently does nothing. Put the responsive utility on a wrapper
 * element instead. (Pairing `hidden` with a *responsive* variant such as
 * `lg:block` is fine — media-query rules are emitted after base utilities.)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
