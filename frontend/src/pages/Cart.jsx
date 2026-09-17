import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2 } from 'lucide-react'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import PageHeader from '../components/common/PageHeader'
import CartLineItem from '../components/cart/CartLineItem'
import CheckoutForm from '../components/cart/CheckoutForm'
import OrderSummary from '../components/cart/OrderSummary'
import { useCart } from '../context/CartContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { TEL_HREF } from '../data/site'

/**
 * The parts cart.
 *
 * Two things are deliberately absent. There is no "you might also like" rail —
 * the related-parts logic belongs on a product page, where the customer is
 * already considering one specific part, and a cart is the wrong moment to
 * introduce another decision. And there is no confirmation dialog on Clear
 * cart: it is the one action here that loses work, so it is styled as danger
 * and separated from the rest, but a modal in front of it would be a second
 * thing to dismiss on a page the customer came to in order to leave.
 */
export default function Cart() {
  useDocumentTitle('Parts Cart')

  const { items, isEmpty, itemCount, removeItem, updateQuantity, clearCart } =
    useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [fulfilment, setFulfilment] = useState('pickup')

  const handleCheckout = (choice) => {
    setFulfilment(choice)
    setCheckoutOpen(true)
  }

  if (isEmpty) {
    return (
      <>
        <PageHeader
          eyebrow="Parts"
          title="Your cart"
          description="Parts you add from the catalogue are held here on this device until you send the order to our counter."
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Parts', to: '/parts' }, { label: 'Cart' }]}
        />

        <div className="container-page py-10 lg:py-14">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Browse the parts catalogue and add what you need. Nothing is charged online — we confirm stock, fitment and payment when you place the order."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button to="/parts">Browse parts</Button>
                <Button href={TEL_HREF} variant="outline">
                  Call the parts counter
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Parts"
        title="Your cart"
        description={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready to send to the parts counter. Nothing is charged online.`}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Parts', to: '/parts' }, { label: 'Cart' }]}
      />

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h2 className="text-base font-semibold text-brand-900">
                Cart items
              </h2>
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-red-600 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Clear cart
              </button>
            </div>

            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>

            <div className="mt-6">
              <Link
                to="/parts"
                className="text-sm font-medium text-accent-700 underline-offset-2 transition-colors hover:text-accent-800 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <OrderSummary
            className="lg:sticky lg:top-24 lg:self-start"
            onCheckout={handleCheckout}
            checkoutLabel="Continue to checkout"
          />
        </div>
      </div>

      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Send this order to the counter"
        description="We will call you to confirm stock, fitment and payment. Nothing is charged online."
        size="lg"
      >
        <CheckoutForm
          items={items}
          fulfilment={fulfilment}
          onCancel={() => setCheckoutOpen(false)}
          onPlaced={() => {
            setCheckoutOpen(false)
            clearCart()
          }}
        />
      </Modal>
    </>
  )
}
