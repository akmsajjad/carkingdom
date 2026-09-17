import { useState } from 'react'
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import Button from '../common/Button'
import { useCart } from '../../context/CartContext'
import { cn } from '../../utils/cn'

const MAX_QUANTITY = 99

/** Quantity stepper, used by the product page and by the cart line. */
export function QuantityStepper({
  value,
  onChange,
  max = MAX_QUANTITY,
  label = 'Quantity',
  className,
}) {
  const clamp = (next) => Math.max(1, Math.min(Number(next) || 1, max))

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-slate-300 bg-white',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="inline-flex size-10 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:text-slate-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>

      {/* `type="text"` with `inputMode="numeric"` rather than `type="number"`:
          a spinner on a quantity of two is noise, and the number input's own
          wheel behaviour silently changes values while scrolling the page. */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        aria-label={label}
        onChange={(event) => {
          const raw = event.target.value.replace(/\D/g, '')
          onChange(raw === '' ? 1 : clamp(raw))
        }}
        className="h-10 w-12 border-x border-slate-300 bg-transparent text-center text-sm font-semibold text-brand-900 tabular-nums focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="inline-flex size-10 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:text-slate-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/**
 * Add to cart, with the quantity in front of it.
 *
 * The confirmation is local state rather than only the toast: a toast is gone
 * in three seconds and sits in a corner, while the button the customer is
 * looking at should say what happened to it. It reverts after a moment so the
 * same control can be used again without a page reload.
 *
 * An out-of-stock part renders a disabled button instead of a hidden one. The
 * page is still worth reading — the specs and fitment notes are how you decide
 * to order it in — and a missing control would leave the customer wondering
 * whether the site was broken.
 */
export default function AddToCart({
  part,
  showQuantity = true,
  size = 'md',
  className,
}) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(part, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  if (!part.inStock) {
    return (
      <div className={cn('flex flex-wrap items-center gap-3', className)}>
        <Button size={size} icon={ShoppingCart} disabled>
          Out of stock
        </Button>
        <p className="text-sm text-slate-500">
          Call us at the parts counter and we will order it in.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {showQuantity && (
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          // Capped at what is on the shelf: letting a customer ask for six of a
          // part we have two of produces a cart that cannot be fulfilled, and
          // the correction would land at checkout rather than here.
          max={Math.min(part.stock, MAX_QUANTITY)}
          label={`Quantity of ${part.name}`}
        />
      )}

      <Button
        size={size}
        variant={added ? 'accent' : 'primary'}
        icon={added ? Check : ShoppingCart}
        onClick={handleAdd}
      >
        {added ? 'Added to cart' : 'Add to cart'}
      </Button>
    </div>
  )
}
