'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/catalog/product-card'
import { CartItem, Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { getCategories } from '@/lib/actions/categories'
import { CART_UPDATED_EVENT } from '@/lib/cart'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  MessageCircle
} from 'lucide-react'

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
    
    // Load categories for header
    getCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))

    window.dispatchEvent(
      new CustomEvent(CART_UPDATED_EVENT, {
        detail: { cart: newCart },
      })
    )
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
    updateCart(newCart)
  }

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.productId !== productId)
    updateCart(newCart)
  }

  const clearCart = () => {
    updateCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  const shipping = subtotal >= 50 ? 0 : 9.99
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Continuar comprando</span>
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Carrito de compras
              </h1>
            </div>
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar carrito
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-500 mb-8">
                Agrega algunos productos para comenzar tu compra
              </p>
              <Button onClick={() => router.push('/categorias')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver productos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                  >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {(() => {
                            // Try different image sources in order of preference
                            const imageSrc = 
                              item.product?.imagePaths?.[0] ||
                              item.product?.images?.[0] ||
                              item.product?.imageUrl ||
                              item.product?.image ||
                              null;
                            
                            return imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={item.product?.name || 'Producto'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null;
                          })()}
                          <div className="w-full h-full flex items-center justify-center text-gray-400 hidden">
                            📦
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.product?.name || 'Producto no disponible'}
                          </h3>
                          {item.product?.brand && (
                            <p className="text-sm text-gray-500">{item.product.brand}</p>
                          )}
                          <p className="text-lg font-bold text-primary-600">
                            {formatPrice(item.product?.price || 0)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Resumen del pedido
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                      </span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envíos </span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">a toda colombia</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    {shipping > 0 && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        Agrega {formatPrice(50 - subtotal)} más para envío gratis
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full h-12 text-lg">
                      Proceder al pago
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => {
                        const message = `Hola! Me interesa realizar una compra. Tengo ${totalItems} productos en el carrito por un total de ${formatPrice(total)}.`
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Consultar por WhatsApp
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
                      <div>
                        <div className="text-2xl mb-1">🛡️</div>
                        <div>Garantía</div>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">🚚</div>
                        <div>Envío seguro</div>
                      </div>
                      <div>
                        <div className="text-2xl mb-1">↩️</div>
                        <div>Devoluciones</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
