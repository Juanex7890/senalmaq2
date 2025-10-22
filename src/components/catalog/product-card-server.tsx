import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { getImageUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { PriceOrConsult } from '@/components/PriceOrConsult'

interface ProductCardServerProps {
  product: Product
}

export function ProductCardServer({ product }: ProductCardServerProps) {
  const discount =
    !product.consultRequired && product.compareAtPrice
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
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

          <PriceOrConsult
            product={product}
            layout={product.consultRequired ? 'stack' : 'inline'}
            className="mt-3"
            priceClassName="text-lg font-bold text-gray-900"
            comparePriceClassName="text-sm text-gray-500 line-through"
            buttonClassName="w-full justify-center"
          />

          {/* Add to Cart Button - Static for server component */}
          {!product.consultRequired && (
            <div className="w-full mt-3 inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 px-3 py-2 text-sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al carrito
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
