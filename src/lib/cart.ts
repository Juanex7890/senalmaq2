import { CartItem, Product } from './types'

const CART_STORAGE_KEY = 'cart'
export const CART_UPDATED_EVENT = 'cart-updated' as const

type ToastDetail = {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const dispatchToast = (detail: ToastDetail) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail,
    })
  )
}

const emitCartUpdated = (cart: CartItem[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { cart },
    })
  )
}

const persistCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  emitCartUpdated(cart)
}

const readCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    if (!cartData) {
      return []
    }

    const parsed = JSON.parse(cartData)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error getting cart items:', error)
    return []
  }
}

export const addToCart = (product: Product, quantity: number = 1): void => {
  try {
    if (product.consultRequired) {
      dispatchToast({
        message: 'Este producto requiere hablar con un asesor antes de comprar.',
        type: 'info',
        duration: 4000,
      })
      return
    }

    const cart = readCart()

    const existingItemIndex = cart.findIndex(item => item.productId === product.id)

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity
    } else {
      const newCartItem: CartItem = {
        productId: product.id,
        quantity,
        product,
      }
      cart.push(newCartItem)
    }

    persistCart(cart)

    dispatchToast({
      message: `Producto ${product.name} agregado al carrito!`,
      type: 'success',
      duration: 3000,
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    dispatchToast({
      message: 'Error al agregar al carrito. Intentalo de nuevo.',
      type: 'error',
      duration: 4000,
    })
  }
}

export const getCartItems = (): CartItem[] => readCart()

export const getCartItemCount = (): number => {
  const cart = readCart()
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

export const removeFromCart = (productId: string): void => {
  try {
    const cart = readCart()
    const newCart = cart.filter(item => item.productId !== productId)
    persistCart(newCart)
  } catch (error) {
    console.error('Error removing from cart:', error)
  }
}

export const updateCartQuantity = (productId: string, quantity: number): void => {
  try {
    const cart = readCart()
    const newCart = cart
      .map(item => (item.productId === productId ? { ...item, quantity } : item))
      .filter(item => item.quantity > 0)
    persistCart(newCart)
  } catch (error) {
    console.error('Error updating cart quantity:', error)
  }
}

export const clearCart = (): void => {
  try {
    persistCart([])
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

export const resetCart = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY)
    emitCartUpdated([])
  } catch (error) {
    console.error('Error resetting cart:', error)
  }
}
