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
 *
 * `fit` exists for the logo, which is the one image whose box does not match
 * its artwork's proportions — `object-cover` would crop a wordmark in half. It
 * is a prop rather than something callers pass through `className` because
 * `cn` is a plain join, not tailwind-merge: `object-cover` and `object-contain`
 * on the same element would both be present and the winner would be decided by
 * stylesheet order, not by which one the caller wrote last.
 */
export default function OptimizedImage({
  src,
  alt = '',
  category = 'general',
  eager = false,
  fit = 'cover',
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
      className={cn(
        'h-full w-full',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
      {...props}
    />
  )
}
