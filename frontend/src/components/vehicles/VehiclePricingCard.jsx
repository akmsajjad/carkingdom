import { Calendar, Mail, MessageSquare, Phone, Wallet } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import ShareButton from '../common/ShareButton'
import PaymentCalculator from './PaymentCalculator'
import VehicleActions from './VehicleActions'
import { cn } from '../../utils/cn'
import { estimateMonthlyPayment, formatPrice } from '../../utils/format'
import { MAILTO_HREF, SITE, TEL_HREF } from '../../data/site'

/**
 * The buying panel: price, payment estimate, and everything a customer can do
 * about this vehicle.
 *
 * Sticky on desktop so the price and the primary call to action stay in view
 * while the specification sheet is being read — the decision to enquire is
 * usually made halfway down that list, not at the top.
 *
 * The three contact buttons are ordered by how much commitment they ask for:
 * a test drive is a real appointment, a question is a message, financing is a
 * process. Someone not ready for any of them still gets the phone number and
 * the email link, which cost nothing to use.
 */
export default function VehiclePricingCard({ vehicle, onAction, className }) {
  const isSold = vehicle.status === 'sold'
  const isPending = vehicle.status === 'pending'
  const monthly = estimateMonthlyPayment(vehicle.effectivePrice)

  const savings =
    vehicle.salePrice && vehicle.price > vehicle.salePrice
      ? vehicle.price - vehicle.salePrice
      : 0

  return (
    <Card padded={false} className={className}>
      <div className="p-5">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Asking price
        </p>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-3xl font-bold text-brand-900">
            {formatPrice(vehicle.effectivePrice)}
          </p>

          {savings > 0 && (
            <>
              <p className="text-base text-slate-400 line-through">
                {formatPrice(vehicle.price)}
              </p>
              <p className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-800">
                Save {formatPrice(savings)}
              </p>
            </>
          )}
        </div>

        {monthly != null && (
          <p className="mt-1 text-sm text-slate-500">
            From {formatPrice(monthly)}/mo with 10% down
          </p>
        )}

        {(isSold || isPending) && (
          <p
            className={cn(
              'mt-3 rounded-lg px-3 py-2 text-sm font-medium',
              // Amber for the pending notice, so it reads as a state that can
              // still change rather than as another "sold" — the two panels
              // were only distinguishable while the accent was gold.
              isSold
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-900',
            )}
          >
            {isSold
              ? 'This vehicle has been sold. Ask us what else is coming in — or browse the current inventory.'
              : 'A sale is pending on this vehicle. You are welcome to get in touch in case it falls through.'}
          </p>
        )}

        <PaymentCalculator price={vehicle.effectivePrice} className="mt-5" />
      </div>

      <div className="space-y-2.5 border-t border-slate-100 p-5">
        {isSold ? (
          <Button to="/used-cars" variant="outline" className="w-full">
            Browse similar vehicles
          </Button>
        ) : (
          <Button
            variant="accent"
            icon={Calendar}
            className="w-full"
            onClick={() => onAction('test-drive')}
          >
            Book a test drive
          </Button>
        )}

        <Button
          variant="primary"
          icon={MessageSquare}
          className="w-full"
          onClick={() => onAction('enquiry')}
        >
          Ask about this vehicle
        </Button>

        <Button
          variant="outline"
          icon={Wallet}
          className="w-full"
          onClick={() => onAction('finance')}
        >
          Get pre-approved
        </Button>
      </div>

      <div className="space-y-3 border-t border-slate-100 p-5">
        <div className="flex flex-wrap gap-3">
          <Button
            href={TEL_HREF}
            variant="outline"
            size="sm"
            icon={Phone}
            className="flex-1"
            aria-label={`Call Car Kingdom on ${SITE.phoneDisplay}`}
          >
            Call us
          </Button>
          <Button
            href={MAILTO_HREF}
            variant="outline"
            size="sm"
            icon={Mail}
            className="flex-1"
            aria-label={`Email Car Kingdom at ${SITE.email}`}
          >
            Email
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">Save or compare</p>
          <div className="flex items-center gap-2">
            <VehicleActions vehicle={vehicle} />
            <ShareButton title={vehicle.title} />
          </div>
        </div>
      </div>
    </Card>
  )
}
