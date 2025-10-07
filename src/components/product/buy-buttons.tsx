'use client'

import { useState } from 'react'
import { Product } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, MessageCircle, Truck, Shield, RotateCcw } from 'lucide-react'

interface BuyButtonsProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  onToggleWishlist: (product: Product) => void
  isInWishlist?: boolean
}

export function BuyButtons({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist = false 
}: BuyButtonsProps) {
  const [quantity, setQuantity] = useState(1)

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value)
    if (num > 0) {
      setQuantity(num)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
  }

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <Badge variant="destructive" size="lg">
                -{discount}%
              </Badge>
            </>
          )}
        </div>
        {product.sku && (
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Cantidad:
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-20"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-12 text-lg"
            disabled={!product.active}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {product.active ? 'Agregar al carrito' : 'No disponible'}
          </Button>

          <Button
            variant="outline"
            onClick={() => onToggleWishlist(product)}
            className="h-12 px-6"
          >
            <Heart 
              className={`h-5 w-5 ${
                isInWishlist ? 'fill-red-500 text-red-500' : ''
              }`} 
            />
          </Button>
        </div>

        {/* WhatsApp Button */}
        <Button
          variant="outline"
          className="w-full h-12 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          onClick={() => {
            const message = `Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}`
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
          }}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Consultar por WhatsApp
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Truck className="h-5 w-5 text-primary-500" />
          <span>Envíos a toda colombia</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-5 w-5 text-primary-500" />
          <span>Garantía</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <RotateCcw className="h-5 w-5 text-primary-500" />
          <span>Devoluciones</span>
        </div>
      </div>
    </div>
  )
}
