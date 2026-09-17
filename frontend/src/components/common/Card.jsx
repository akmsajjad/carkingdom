import { cn } from '../../utils/cn'

/**
 * Generic surface. `interactive` adds the hover lift used by anything that
 * links somewhere — vehicle cards, service cards, product cards — so the
 * affordance stays consistent across the whole site.
 */
export default function Card({
  children,
  as: Tag = 'div',
  interactive = false,
  padded = true,
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
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
