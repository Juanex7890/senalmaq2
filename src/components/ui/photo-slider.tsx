'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoSliderProps {
  images: string[]
  className?: string
  autoPlay?: boolean
  autoPlaySpeed?: number
  showDots?: boolean
  showArrows?: boolean
}

export function PhotoSlider({ 
  images, 
  className = '',
  autoPlay = true,
  autoPlaySpeed = 4,
  showDots = true,
  showArrows = true
}: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlaySpeed * 1000)

    return () => clearInterval(interval)
  }, [isPlaying, images.length, autoPlaySpeed])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      } else if (event.key === ' ') {
        event.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener('keydown', handleKeyDown)
      return () => slider.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlaying])

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    } else if (isRightSwipe) {
      goToPrevious()
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl bg-white/40 backdrop-blur-sm h-[36vh] sm:h-[40vh] md:h-[46vh] lg:h-[54vh] xl:h-[60vh] 2xl:h-[64vh] ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-center">
            <div className="text-6xl mb-2">📷</div>
            <p className="text-sm">No hay imágenes disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl bg-white/40 backdrop-blur-sm h-[36vh] sm:h-[40vh] md:h-[46vh] lg:h-[54vh] xl:h-[60vh] 2xl:h-[64vh] ${className}`}>
        <Image
          src={images[0]}
          alt="Hero image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          priority
        />
      </div>
    )
  }

  return (
    <div 
      ref={sliderRef}
      className={`relative group w-full rounded-2xl overflow-hidden shadow-xl bg-white/40 backdrop-blur-sm h-[36vh] sm:h-[40vh] md:h-[46vh] lg:h-[54vh] xl:h-[60vh] 2xl:h-[64vh] ${className}`}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
      aria-live="polite"
    >
      {/* Main Image */}
      <Image
        src={images[currentIndex]}
        alt={`Hero image ${currentIndex + 1}`}
        fill
        className="object-cover transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
        priority={currentIndex === 0}
      />
      
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? (
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        ) : (
          <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
        )}
      </button>

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
