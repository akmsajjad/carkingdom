import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

/**
 * A header action icon (favorites, compare, cart) with its count.
 *
 * The count is folded into the accessible name rather than left as a bare
 * number beside the icon — a screen reader should hear "Favorites (3)", not an
 * unlabelled "3".
 *
 * Styled for the dark header bar, which is the only place it is used. The glyph
 * is `text-slate-200` rather than white so the icons sit a step below the nav
 * links' active state, and the hover is a translucent white wash: at these
 * sizes a solid hover fill on a near-black bar reads as a hole rather than a
 * highlight.
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
        'relative inline-flex size-10 items-center justify-center rounded-lg text-slate-200 transition-colors',
        'hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[0.625rem] leading-none font-bold text-white tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
