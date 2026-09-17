import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

/**
 * A header action icon (favorites, compare, cart) with its count.
 *
 * The count is folded into the accessible name rather than left as a bare
 * number beside the icon — a screen reader should hear "Favorites (3)", not an
 * unlabelled "3".
 */
export default function IconLink({
  to,
  icon: Icon,
  label,
  count = 0,
  className,
}) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-lg text-brand-900 transition-colors',
        'hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[0.625rem] leading-none font-bold text-brand-950 tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
