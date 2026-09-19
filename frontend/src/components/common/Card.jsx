import { cn } from '../../utils/cn'

/**
 * Surface tones.
 *
 * A `tone` rather than letting callers pass `bg-brand-50`, because `cn` only
 * concatenates — it does not resolve conflicting utilities the way
 * tailwind-merge would. A caller's `bg-brand-50` and the base `bg-white` both
 * end up in the class list and the one later in the stylesheet wins, which is
 * `bg-white`. Six call sites were silently rendering white that way.
 */
const TONES = {
  white: 'bg-white',
  muted: 'bg-brand-50',
  subtle: 'bg-slate-50',
}

/**
 * Generic surface. `interactive` adds the hover lift used by anything that
 * links somewhere — vehicle cards, service cards, product cards — so the
 * affordance stays consistent across the whole site.
 */
export default function Card({
  children,
  as: Tag = 'div',
  tone = 'white',
  interactive = false,
  padded = true,
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 shadow-card',
        TONES[tone],
        padded && 'p-5',
        interactive &&
          'transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
