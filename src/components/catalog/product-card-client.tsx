'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { getImageUrl, formatPrice } from '@/lib/utils'
import { addToCart } from '@/lib/cart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, CreditCard } from 'lucide-react'

interface ProductCardClientProps {
  product: Product
  isInWishlist?: boolean
}

export function ProductCardClient({ 
  product, 
  isInWishlist = false 
}: ProductCardClientProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0
  const primaryImage = product.imagePaths?.[0] ?? product.images?.[0] ?? product.imageUrl
  const imageSrc = primaryImage ? getImageUrl(primaryImage) : '/placeholder-product.svg'

  const handleAddToCart = async () => {
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    try {
      addToCart(product, 1)
    } finally {
      // Reset button state after a short delay
      setTimeout(() => setIsAddingToCart(false), 1000)
    }
  }

  const handleToggleWishlist = () => {
    // TODO: Implement wishlist functionality
    console.log('Toggle wishlist:', product)
  }

  const handleBuyNow = async () => {
    if (isAddingToCart) return
    
    if (!product.active) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Este producto no está disponible',
          type: 'error',
          duration: 3000
        }
      })
      window.dispatchEvent(event)
      return
    }

    setIsAddingToCart(true)
    try {
      addToCart(product, 1)
      // Redirect to cart page
      setTimeout(() => {
        window.location.href = '/carrito'
      }, 500)
    } finally {
      setTimeout(() => setIsAddingToCart(false), 1000)
    }
  }

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 group-hover:shadow-lg group-hover:ring-primary-200">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isBestseller && (
            <Badge variant="success" size="sm">
              Más vendido
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="default" size="sm">
              Destacado
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" size="sm">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart 
            className={`h-4 w-4 ${
              isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`} 
          />
        </button>

        {/* Product Image */}
        <Link href={`/producto/${product.slug}`}>
          <div className="aspect-square relative">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          {product.brand && (
            <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.active || isAddingToCart}
            className="w-full mt-3"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
          </Button>

          {/* Buy Now Button */}
          <Button
            onClick={handleBuyNow}
            disabled={!product.active || isAddingToCart}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isAddingToCart ? 'Procesando...' : 'Comprar ahora'}
          </Button>
        </div>
      </div>
    </div>
  )
}
