import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import OptimizedImage from '../common/OptimizedImage'
import { QuantityStepper } from '../parts/AddToCart'
import { formatPrice } from '../../utils/format'

/**
 * One line of the cart.
 *
 * The line total is computed here from the price the cart stored when the item
 * was added, not from the current catalogue price. That is deliberate: a cart
 * is a record of what something cost when it was put in, and silently
 * re-pricing a line under the customer would be worse than showing a slightly
 * stale number they can see and question.
 *
 * Removing asks for nothing — no confirmation dialog. A cart line is one click
 * to put back, and an undo the customer did not ask for is a slower way to do
 * the same thing.
 */
export default function CartLineItem({ item, onQuantityChange, onRemove }) {
  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/parts/${item.slug}`}
        className="block size-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:size-24"
      >
        <OptimizedImage
          src={item.image}
          alt={item.name}
          category="parts"
          className="transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-accent-600 uppercase">
            {item.brand}
          </p>
          <h3 className="mt-0.5 text-sm leading-snug font-semibold text-brand-900">
            <Link
              to={`/parts/${item.slug}`}
              className="rounded-sm transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              {item.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Part number {item.sku}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {formatPrice(item.price)} each
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
          <p className="text-base font-bold text-brand-900 tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </p>

          <div className="flex items-center gap-2">
            <QuantityStepper
              value={item.quantity}
              onChange={(next) => onQuantityChange(item.id, next)}
              max={item.stock}
              label={`Quantity of ${item.name}`}
            />

            <button
              type="button"
              onClick={() => onRemove(item.id, item.name)}
              aria-label={`Remove ${item.name} from cart`}
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
