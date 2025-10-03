'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/lib/types'
import { getImageUrl } from '@/lib/utils'

interface CategoryCardProps {
  category: Category
  productCount?: number
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  return (
    <div className="group">
      <Link href={`/categoria/${category.slug}`}>
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 group-hover:shadow-lg group-hover:ring-primary-200">
          {category.heroImagePath ? (
            <div className="aspect-[4/3] relative">
              <Image
                src={getImageUrl(category.heroImagePath)}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <div className="text-6xl text-primary-300">📦</div>
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            )}
            {productCount !== undefined && (
              <p className="mt-3 text-sm font-medium text-primary-600">
                {productCount} {productCount === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
