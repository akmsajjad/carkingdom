import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Star rating. Renders a single row of stars rather than a value plus icons,
 * with an accessible text label so screen readers get the number, not five
 * unlabelled graphics.
 */
export default function Rating({
  value = 0,
  max = 5,
  size = 'md',
  showValue = false,
  className,
}) {
  const rounded = Math.round(value * 2) / 2
  const sizes = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${value} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              sizes[size],
              // Amber, not the brand accent: a gold star is a convention of its
              // own and reads as a rating. Painted in the brand red it would
              // look like a warning, which is the opposite of the message.
              i < rounded
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-slate-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
