import { useId, useState } from 'react'
import { Info, Store, Truck } from 'lucide-react'
import Button from '../common/Button'
import { useCart } from '../../context/CartContext'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/format'
import { FULL_ADDRESS, TAX_RATE } from '../../data/site'

/** Pickup or delivery, as one fieldset. */
function FulfilmentChoice({ value, onChange }) {
  const uid = useId()

  const options = [
    {
      key: 'pickup',
      icon: Store,
      label: 'Pick up at the counter',
      hint: `Ready in about an hour at ${FULL_ADDRESS}. We will call you when it is bagged.`,
    },
    {
      key: 'delivery',
      icon: Truck,
      label: 'Local delivery',
      hint: 'Saskatoon and area, next business day. The counter will confirm the cost before anything ships.',
    },
  ]

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-brand-900">
        How would you like it?
      </legend>

      <div className="mt-3 space-y-2">
        {options.map(({ key, icon: Icon, label, hint }) => (
          <label
            key={key}
            htmlFor={`${uid}-${key}`}
            className={cn(
              'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
              value === key
                ? 'border-brand-900 bg-brand-50/50'
                : 'border-slate-200 hover:bg-slate-50',
            )}
          >
            <input
              type="radio"
              id={`${uid}-${key}`}
              name={`${uid}-fulfilment`}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              className="mt-0.5 size-4 shrink-0 accent-brand-900"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand-900">
                <Icon className="size-4 text-slate-400" aria-hidden="true" />
                {label}
              </span>
              <span className="mt-1 block text-xs text-slate-500">{hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * The order summary.
 *
 * Totals come from `useCart` rather than being passed in, so the arithmetic
 * lives in exactly one place — the context that also owns the line items. A
 * second copy here is how a cart page and a checkout page end up disagreeing
 * about the tax.
 *
 * The tax line is labelled with the rate it used, because "Tax" alone invites
 * the question every customer asks at a parts counter, and the answer is one
 * constant away.
 */
export default function OrderSummary({ onCheckout, checkoutLabel = 'Continue to checkout', className }) {
  const { subtotal, tax, total, itemCount } = useCart()
  const [fulfilment, setFulfilment] = useState('pickup')

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-card',
        className,
      )}
    >
      <h2 className="text-base font-semibold text-brand-900">Order summary</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-600">
            Subtotal
            <span className="ml-1 text-slate-400">
              ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
          </dt>
          <dd className="font-semibold text-brand-900 tabular-nums">
            {formatPrice(subtotal)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-slate-600">
            GST/PST
            <span className="ml-1 text-slate-400">
              ({Math.round(TAX_RATE * 100)}%)
            </span>
          </dt>
          <dd className="font-semibold text-brand-900 tabular-nums">
            {formatPrice(tax)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-3">
          <dt className="text-base font-semibold text-brand-900">Total</dt>
          <dd className="text-xl font-bold text-brand-900 tabular-nums">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <FulfilmentChoice value={fulfilment} onChange={setFulfilment} />
      </div>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={() => onCheckout?.(fulfilment)}
      >
        {checkoutLabel}
      </Button>

      <p className="mt-3 flex gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          This demo does not take payment. Placing the order sends it to the
          parts counter, who will call to confirm stock, fitment and payment.
        </span>
      </p>
    </div>
  )
}
