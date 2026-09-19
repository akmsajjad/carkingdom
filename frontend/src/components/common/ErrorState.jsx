import { RotateCw, TriangleAlert } from 'lucide-react'
import Button from './Button'
import { cn } from '../../utils/cn'

/**
 * Shown when a request fails. Keeps the message human and always offers a
 * retry, since most failures here are transient.
 *
 * `as` defaults to `h2`, matching `EmptyState`: these replace a page's main
 * content and sit directly under its `h1`, so a hard-coded `h3` skipped a
 * heading level.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
  retryLabel = 'Try again',
  as: Heading = 'h2',
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-16 text-center',
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100">
        <TriangleAlert className="size-7 text-red-600" aria-hidden="true" />
      </span>
      <Heading className="text-lg font-semibold text-slate-900">{title}</Heading>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-6"
          icon={RotateCw}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
