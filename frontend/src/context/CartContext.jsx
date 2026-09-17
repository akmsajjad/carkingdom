import { createContext, useCallback, useContext, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useToast } from './ToastContext'
import { TAX_RATE } from '../data/site'

const CartContext = createContext(null)

const STORAGE_KEY = 'carkingdom:cart'
const MAX_QUANTITY = 99

/**
 * Parts cart, persisted to localStorage.
 *
 * Stores a small snapshot of each product (name, price, image) rather than
 * just an id. A cart is a record of what something cost when it was added, so
 * a snapshot is both correct and what avoids re-fetching every product to
 * render the cart page. The id remains the identity, so the cart still
 * survives a switch to real API data.
 */
export function CartProvider({ children }) {
  const [items, setItems, reset] = useLocalStorage(STORAGE_KEY, [])
  const toast = useToast()

  const addItem = useCallback(
    (product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id)
        const unitPrice = product.salePrice ?? product.price

        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, MAX_QUANTITY),
                }
              : item,
          )
        }

        return [
          ...current,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            brand: product.brand,
            price: unitPrice,
            image: product.image,
            stock: product.stock,
            quantity: Math.min(quantity, MAX_QUANTITY),
          },
        ]
      })

      toast.success(`${product.name} added to cart`)
    },
    [setItems, toast],
  )

  const removeItem = useCallback(
    (id, label = 'Item') => {
      setItems((current) => current.filter((item) => item.id !== id))
      toast.info(`${label} removed from cart`)
    },
    [setItems, toast],
  )

  const updateQuantity = useCallback(
    (id, quantity) => {
      const next = Math.max(1, Math.min(Number(quantity) || 1, MAX_QUANTITY))
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, quantity: next } : item,
        ),
      )
    },
    [setItems],
  )

  const clearCart = useCallback(() => {
    reset()
    toast.info('Cart cleared')
  }, [reset, toast])

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )
    const tax = subtotal * TAX_RATE
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      ...totals,
      isEmpty: items.length === 0,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, totals, addItem, removeItem, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
