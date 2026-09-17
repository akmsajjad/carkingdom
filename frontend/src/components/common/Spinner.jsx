import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const SIZES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-9',
}

export default function Spinner({ size = 'md', className, label = 'Loading' }) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex', className)}>
      <LoaderCircle className={cn('animate-spin text-brand-600', SIZES[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Centred spinner for whole-panel or whole-page loading. */
export function LoadingBlock({ label = 'Loading…', className }) {
  return (
    <div
      className={cn(
        'flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500',
        className,
      )}
    >
      <Spinner size="lg" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
