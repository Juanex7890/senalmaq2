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
import type { CartItem, Product } from '@/lib/types'
import { toCOP } from '@/lib/currency'

const CART_ID_STORAGE_KEY = 'checkoutCartId'
const CART_CACHE_PREFIX = 'checkout:cart:'

export type CheckoutCartItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
  description?: string
  picture_url?: string
  category_id?: string
}

type CartContextValue = {
  items: CheckoutCartItem[]
  cartId?: string
  total: number
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

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

const resolveProductImageUrl = (product: Product): string | undefined => {
  const candidate =
    product.imageUrl ??
    product.images?.[0] ??
    product.image ??
    product.imagePaths?.[0]

  if (!candidate || typeof candidate !== 'string') {
    return undefined
  }

  if (isAbsoluteUrl(candidate)) {
    return candidate
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : undefined)

  if (!base) {
    return undefined
  }

  try {
    const normalizedPath = candidate.startsWith('/') ? candidate : `/${candidate}`
    return new URL(normalizedPath, base).toString()
  } catch (error) {
    console.warn('Unable to resolve product image URL for checkout item', {
      candidate,
      productId: product.id ?? 'unknown',
      error,
    })
    return undefined
  }
}

const mapCartItems = (cart: CartItem[]): CheckoutCartItem[] => {
  const mapped: CheckoutCartItem[] = []

  for (const item of cart) {
    const product = item.product
    if (!product) {
      console.warn('Cart item missing product data', item)
      continue
    }

    if (product.consultRequired) {
      console.warn('Skipping consult-only product for checkout summary', {
        productId: product.id ?? item.productId,
      })
      continue
    }

    const price = toCOP(product.price ?? 0)
    if (price <= 0) {
      console.warn('Skipping cart item with invalid price', product)
      continue
    }

    const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1

    mapped.push({
      id: product.id ?? item.productId,
      title: product.name,
      quantity,
      unit_price: price,
      category_id: product.category ?? product.categorySlug,
      description: product.description,
      picture_url: resolveProductImageUrl(product),
    })
  }

  return mapped
}

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

    // Use setTimeout to defer initialization and prevent chunk loading issues
    const initCart = () => {
      try {
        let currentCartId = ensureCartId()
        setCartId(currentCartId)
        refresh()
      } catch (error) {
        console.error('Error initializing cart:', error)
      }
    }

    const timeoutId = setTimeout(initCart, 0)

    const handleStorage = (event: StorageEvent) => {
      try {
        if (event.key === 'cart') {
          refresh()
        }

        if (event.key === CART_ID_STORAGE_KEY && event.newValue) {
          setCartId(event.newValue)
        }
      } catch (error) {
        console.error('Error handling storage event:', error)
      }
    }

    const handleCartUpdated = () => {
      try {
        refresh()
      } catch (error) {
        console.error('Error handling cart update:', error)
      }
    }

    // Add event listeners with error handling
    try {
      window.addEventListener('storage', handleStorage)
      window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated as EventListener)
    } catch (error) {
      console.error('Error adding event listeners:', error)
    }

    return () => {
      clearTimeout(timeoutId)
      try {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated as EventListener)
      } catch (error) {
        console.error('Error removing event listeners:', error)
      }
    }
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined' || !cartId) {
      return
    }

    // Use setTimeout to defer localStorage operations and prevent chunk loading issues
    const timeoutId = setTimeout(() => {
      try {
        const payload = JSON.stringify(items)
        window.localStorage.setItem(serializeCartKey(cartId), payload)
      } catch (error) {
        console.error('Unable to persist cart summary', error)
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [cartId, items])

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      cartId,
      total: items.reduce(
        (sum, item) => sum + item.unit_price * (item.quantity > 0 ? item.quantity : 0),
        0
      ),
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
