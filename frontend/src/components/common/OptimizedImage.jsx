import { useState } from 'react'
import { cn } from '../../utils/cn'
import { getFallback } from '../../utils/images'

/**
 * The only <img> in the application.
 *
 * Handles lazy loading, alt text, sensible sizing, and the fallback chain:
 * requested image -> category fallback -> nothing (alt text remains readable).
 * Without the intermediate step a single missing file would leave a broken
 * image icon on an otherwise finished-looking page.
 */
export default function OptimizedImage({
  src,
  alt = '',
  category = 'general',
  eager = false,
  className,
  ...props
}) {
  const fallback = getFallback(category)
  const requested = src || fallback
  const [failedSrc, setFailedSrc] = useState(null)

  // Derived during render rather than synced back in an effect. When `src`
  // changes — a gallery thumbnail, a different vehicle card — `requested` no
  // longer matches the path that failed, so the new image is tried on its own
  // without an extra render pass.
  const currentSrc = failedSrc === requested ? fallback : requested

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setFailedSrc(requested)}
      className={cn('h-full w-full object-cover', className)}
      {...props}
    />
  )
}
