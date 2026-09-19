import { cn } from '../../utils/cn'

const VARIANTS = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-800',
  // `accent` is the brand red and means "this is the brand's highlight" — a
  // promotion, a featured line. `danger` is also red, so the two must never
  // label the same thing: see the note below on why "Sale pending" is amber.
  accent: 'bg-accent-100 text-accent-800',
  warning: 'bg-amber-100 text-amber-900',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  // For use over photography, where a solid chip would be too heavy.
  overlay: 'bg-brand-950/80 text-white backdrop-blur-sm',
}

export default function Badge({
  children,
  variant = 'neutral',
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide uppercase',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
