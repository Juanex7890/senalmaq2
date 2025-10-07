import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { getImageUrl, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart } from 'lucide-react'

interface ProductCardServerProps {
  product: Product
  isInWishlist?: boolean
}

export function ProductCardServer({ 
  product, 
  isInWishlist = false 
}: ProductCardServerProps) {
  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0
  const primaryImage = product.imagePaths?.[0] ?? product.images?.[0] ?? product.imageUrl
  const imageSrc = primaryImage ? getImageUrl(primaryImage) : '/placeholder-product.svg'


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

        {/* Wishlist Button - Static for server component */}
        <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm">
          <Heart 
            className={`h-4 w-4 ${
              isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`} 
          />
        </div>

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

          {/* Add to Cart Button - Static for server component */}
          <div className="w-full mt-3 inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 px-3 py-2 text-sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar al carrito
          </div>
        </div>
      </div>
    </div>
  )
}
