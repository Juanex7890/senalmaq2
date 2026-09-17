'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Package } from 'lucide-react'
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
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary-200">
          {category.heroImagePath ? (
            <div className="aspect-[4/3] relative">
              <Image
                src={getImageUrl(category.heroImagePath)}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>
          ) : (
            <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-primary-400 shadow-sm">
                <Package className="h-8 w-8" />
              </span>
            </div>
          )}

          {productCount !== undefined && (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm">
              {productCount} {productCount === 1 ? 'producto' : 'productos'}
            </span>
          )}

          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
              Ver productos
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
