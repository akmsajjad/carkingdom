import { Calendar, Phone } from 'lucide-react'
import Button from '../common/Button'
import { formatPrice } from '../../utils/format'
import { SITE, TEL_HREF } from '../../data/site'

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
 */
export default function VehicleActionBar({ vehicle, onAction }) {
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

        <Button
          variant="accent"
          size="sm"
          icon={Calendar}
          onClick={() => onAction('test-drive')}
        >
          Test drive
        </Button>
      </div>
    </div>
  )
}
