import { Link } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'
import { cn } from '../../utils/cn'
import { BRAND_IMAGES } from '../../utils/images'
import { SITE } from '../../data/site'

/**
 * The Car Kingdom logo — the full badge, everywhere it appears.
 *
 * ## One lockup
 *
 * This previously carried a second "mark" lockup: the top band of the badge,
 * cropped above the lettering and set beside the name as live text. That was
 * driven by legibility — the badge's own wordmark is 24px inside a 383px-tall
 * artwork (6.3%), so in a 72px header it is only a few pixels high.
 *
 * It has been removed. The real logo is used in the header, the footer and the
 * mobile drawer alike, and the name beside it is gone, so there is one lockup to
 * reason about and no cropped variant to drift out of step with it.
 *
 * Note the consequence, because it is inherent to the artwork rather than to
 * this component: at header height the badge's internal wordmark is below the
 * size at which it can be read. The header therefore shows the logo as a mark
 * rather than as a legible brand name. The footer renders it at 176-192px wide,
 * where the wordmark is clear.
 *
 * ## Sizing
 *
 * The box is sized against an explicit aspect ratio, so exactly one dimension is
 * written down and the other follows from the artwork — the box is fixed before
 * the image loads, so the header cannot reflow when it arrives. `header` is
 * height-driven (it has to fit the 72px bar); `footer` is width-driven (it has
 * the room, and the wordmark wants the width).
 */
const SIZES = {
  header: 'h-11 sm:h-12',
  footer: 'w-44 sm:w-48',
}

export default function Logo({ size = 'header', className, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${SITE.name} — home`}
      className={cn('block shrink-0', className)}
    >
      {/* The artwork carries its own wordmark, so the image is decorative and
          the link's label supplies the accessible name.

          Eager only in the header, which is above the fold on every page. The
          footer's copy is always below it, and at 143KB this is the heaviest
          asset in the project — there is no reason to make every page load
          fetch it before the reader has scrolled. */}
      <span className={cn('block aspect-[443/383]', SIZES[size])}>
        <OptimizedImage
          src={BRAND_IMAGES.badgeOnDark}
          alt=""
          fit="contain"
          eager={size === 'header'}
        />
      </span>
    </Link>
  )
}
