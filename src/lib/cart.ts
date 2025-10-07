import { CartItem, Product } from './types'

export const addToCart = (product: Product, quantity: number = 1): void => {
  try {
    // Get existing cart from localStorage with proper error handling
    let existingCart: CartItem[] = []
    try {
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        const parsed = JSON.parse(cartData)
        // Ensure it's an array
        existingCart = Array.isArray(parsed) ? parsed : []
      }
    } catch (parseError) {
      console.warn('Invalid cart data in localStorage, starting fresh:', parseError)
      existingCart = []
    }
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item.productId === product.id)
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      existingCart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const newCartItem: CartItem = {
        productId: product.id,
        quantity: quantity,
        product: product
      }
      existingCart.push(newCartItem)
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart))
    
    // Show success feedback via custom event
    const event = new CustomEvent('showToast', {
      detail: {
        message: `¡${product.name} agregado al carrito!`,
        type: 'success',
        duration: 3000
      }
    })
    window.dispatchEvent(event)
    
    console.log('Added to cart:', product.name, 'Quantity:', quantity)
  } catch (error) {
    console.error('Error adding to cart:', error)
    const event = new CustomEvent('showToast', {
      detail: {
        message: 'Error al agregar al carrito. Inténtalo de nuevo.',
        type: 'error',
        duration: 4000
      }
    })
    window.dispatchEvent(event)
  }
}

export const getCartItems = (): CartItem[] => {
  try {
    const cartData = localStorage.getItem('cart')
    if (!cartData) return []
    
    const parsed = JSON.parse(cartData)
    // Ensure it's an array
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error getting cart items:', error)
    return []
  }
}

export const getCartItemCount = (): number => {
  const cart = getCartItems()
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

export const removeFromCart = (productId: string): void => {
  try {
    const cart = getCartItems()
    const newCart = cart.filter(item => item.productId !== productId)
    localStorage.setItem('cart', JSON.stringify(newCart))
  } catch (error) {
    console.error('Error removing from cart:', error)
  }
}

export const updateCartQuantity = (productId: string, quantity: number): void => {
  try {
    const cart = getCartItems()
    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0)
    localStorage.setItem('cart', JSON.stringify(newCart))
  } catch (error) {
    console.error('Error updating cart quantity:', error)
  }
}

export const clearCart = (): void => {
  try {
    localStorage.setItem('cart', '[]')
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

export const resetCart = (): void => {
  try {
    localStorage.removeItem('cart')
  } catch (error) {
    console.error('Error resetting cart:', error)
  }
}
