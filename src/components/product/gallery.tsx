'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface GalleryProps {
  images?: string[]
  productName: string
}

export function Gallery({ images, productName }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Safety check for undefined or null images
  const safeImages = images || []

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-6xl text-gray-300">📦</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <div className="relative w-full h-full">
          <Image
            src={getImageUrl(safeImages[currentIndex])}
            alt={`${productName} - Imagen ${currentIndex + 1}`}
            fill
            className="object-cover cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            {currentIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ring-2 transition-all ${
                index === currentIndex
                  ? 'ring-primary-500'
                  : 'ring-transparent hover:ring-gray-300'
              }`}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={getImageUrl(safeImages[currentIndex])}
                alt={`${productName} - Zoom`}
                width={800}
                height={800}
                className="object-contain max-h-[80vh] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
    </div>
  )
}
