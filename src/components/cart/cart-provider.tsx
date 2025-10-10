'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { CART_UPDATED_EVENT, getCartItems } from '@/lib/cart'
import type { CartItem } from '@/lib/types'
import { toCOP } from '@/lib/currency'

const CART_ID_STORAGE_KEY = 'checkoutCartId'
const CART_CACHE_PREFIX = 'checkout:cart:'

export type CheckoutCartItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
}

type CartContextValue = {
  items: CheckoutCartItem[]
  cartId?: string
  refresh: () => CheckoutCartItem[]
  isEmpty: boolean
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const ensureCartId = () => {
  const storage = window.localStorage
  const existing = storage.getItem(CART_ID_STORAGE_KEY)

  if (existing && existing.length > 0) {
    return existing
  }

  const newCartId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  storage.setItem(CART_ID_STORAGE_KEY, newCartId)
  return newCartId
}

const serializeCartKey = (cartId: string) => `${CART_CACHE_PREFIX}${cartId}`

const mapCartItems = (cart: CartItem[]): CheckoutCartItem[] =>
  cart
    .map(item => {
      const product = item.product
      if (!product) {
        console.warn('Cart item missing product data', item)
        return null
      }

      const price = toCOP(product.price ?? 0)
      if (price <= 0) {
        console.warn('Skipping cart item with invalid price', product)
        return null
      }

      const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1

      return {
        id: product.id ?? item.productId,
        title: product.name,
        quantity,
        unit_price: price,
      }
    })
    .filter((value): value is CheckoutCartItem => value !== null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string>()
  const [items, setItems] = useState<CheckoutCartItem[]>([])

  const refresh = useCallback((): CheckoutCartItem[] => {
    try {
      const cart = getCartItems()
      const mapped = mapCartItems(cart)
      setItems(mapped)
      return mapped
    } catch (error) {
      console.error('Unable to refresh cart items', error)
      setItems([])
      return []
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let currentCartId = ensureCartId()
    setCartId(currentCartId)
    refresh()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') {
        refresh()
      }

      if (event.key === CART_ID_STORAGE_KEY && event.newValue) {
        currentCartId = event.newValue
        setCartId(currentCartId)
      }
    }

    const handleCartUpdated = () => {
      refresh()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated as EventListener)
    }
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined' || !cartId) {
      return
    }

    try {
      const payload = JSON.stringify(items)
      window.localStorage.setItem(serializeCartKey(cartId), payload)
    } catch (error) {
      console.error('Unable to persist cart summary', error)
    }
  }, [cartId, items])

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      cartId,
      refresh,
      isEmpty: items.length === 0,
    }),
    [cartId, items, refresh]
  )

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
