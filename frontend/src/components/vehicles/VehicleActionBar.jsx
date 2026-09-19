import { Calendar, Phone, Search } from 'lucide-react'
import Button from '../common/Button'
import { formatPrice } from '../../utils/format'
import { SITE, TEL_HREF } from '../../data/site'
import { useClaimMobileCtaSlot } from '../../context/MobileCtaContext'

/**
 * The persistent action bar on phones.
 *
 * On a vehicle page the two things anyone wants are the price and a way to
 * ask about it, and both scroll away immediately on a small screen. This keeps
 * them pinned without repeating the whole panel.
 *
 * `sticky` rather than `fixed`. A fixed bar is pinned to the viewport for the
 * whole document, so it sits on top of the footer's last row and there is no
 * way to scroll it off. Sticky is constrained to `main`, so it rides the bottom
 * of the screen while the vehicle is being read and then settles into the page
 * above the footer, which stays fully legible.
 *
 * `z-40` keeps it under the toast stack: a confirmation hidden behind a
 * permanently-visible bar would be worse than one that briefly covers it.
 *
 * Claiming the global mobile CTA slot here means the site-wide bar stands down
 * on this page: this one carries the price and a test drive, which is what
 * someone on a vehicle page actually wants, and stacking both would put two
 * bars on a small screen. The claim is released on unmount, so leaving the page
 * brings the global bar straight back.
 *
 * A **sold** vehicle does not offer a test drive here. The desktop header and
 * the pricing card both already withhold it, and this bar was the one place
 * that did not — so on a phone, the only actions a customer could reach for a
 * car that had already gone were a call and a test-drive booking that could
 * never be honoured. It offers the inventory instead, the same substitution the
 * pricing card makes.
 */
export default function VehicleActionBar({ vehicle, onAction }) {
  useClaimMobileCtaSlot()

  const isSold = vehicle.status === 'sold'

  return (
    <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="container-page flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-500">{vehicle.title}</p>
          <p className="text-base font-bold text-brand-900">
            {formatPrice(vehicle.effectivePrice)}
          </p>
        </div>

        <Button
          href={TEL_HREF}
          variant="outline"
          size="sm"
          icon={Phone}
          aria-label={`Call Car Kingdom on ${SITE.phoneDisplay}`}
        >
          Call
        </Button>

        {isSold ? (
          <Button to="/used-cars" variant="accent" size="sm" icon={Search}>
            Browse
          </Button>
        ) : (
          <Button
            variant="accent"
            size="sm"
            icon={Calendar}
            onClick={() => onAction('test-drive')}
          >
            Test drive
          </Button>
        )}
      </div>
    </div>
  )
}
