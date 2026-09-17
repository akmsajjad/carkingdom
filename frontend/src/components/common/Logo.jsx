import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { SITE } from '../../data/site'

/**
 * The wordmark. The crown ties to the "Kingdom" name without resorting to a
 * literal crest graphic, and scales cleanly from the navbar to the footer.
 */
export default function Logo({ variant = 'dark', className, onClick }) {
  const isLight = variant === 'light'

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${SITE.name} — home`}
      className={cn('flex shrink-0 items-center gap-2.5', className)}
    >
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-lg',
          isLight ? 'bg-accent-500' : 'bg-brand-900',
        )}
      >
        <Crown
          className={cn('size-5', isLight ? 'text-brand-950' : 'text-accent-400')}
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-lg font-bold tracking-tight',
            isLight ? 'text-white' : 'text-brand-950',
          )}
        >
          {SITE.name}
        </span>
        <span
          className={cn(
            'mt-0.5 text-[0.625rem] font-semibold tracking-[0.15em] uppercase',
            isLight ? 'text-accent-400' : 'text-accent-600',
          )}
        >
          Saskatoon
        </span>
      </span>
    </Link>
  )
}
