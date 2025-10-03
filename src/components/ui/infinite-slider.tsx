'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface InfiniteSliderProps {
  children: ReactNode[]
  className?: string
  itemWidth?: number
  gap?: number
  autoPlay?: boolean
  autoPlaySpeed?: number
}

export function InfiniteSlider({ 
  children, 
  className = '', 
  itemWidth = 320,
  gap = 12,
  autoPlay = true,
  autoPlaySpeed = 30
}: InfiniteSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const totalItems = children.length
  const itemWidthWithGap = itemWidth + gap

  // Auto-play functionality - Disabled on mobile
  useEffect(() => {
    if (!isPlaying || isDragging) return

    // Check if device is mobile
    if (typeof window === 'undefined') return
    const isMobile = window.innerWidth < 768
    if (isMobile) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems)
    }, autoPlaySpeed * 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isDragging, totalItems, autoPlaySpeed])

  // Handle window resize to stop/start auto-play based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const isMobile = window.innerWidth < 768
      if (isMobile && isPlaying) {
        setIsPlaying(false)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isPlaying])

  // Animation effect
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const animate = () => {
      if (sliderRef.current) {
        const targetTranslateX = -currentIndex * itemWidthWithGap
        sliderRef.current.style.transform = `translateX(${targetTranslateX}px)`
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [currentIndex, itemWidthWithGap])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
  }

  const handleMouseEnter = () => {
    setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    if (autoPlay) {
      setIsPlaying(true)
    }
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setIsPlaying(false)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentX = e.touches[0].clientX
    const diffX = startX - currentX
    setTranslateX(diffX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = itemWidthWithGap / 3
    
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
    
    setIsDragging(false)
    setTranslateX(0)
    
    if (autoPlay) {
      setIsPlaying(true)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Navigation Arrows - Hidden on Mobile */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
        onClick={goToPrevious}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block"
        onClick={goToNext}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Slider Container */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-out md:transition-transform"
          style={{
            width: `${totalItems * itemWidthWithGap}px`,
            transform: `translateX(${translateX}px)`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Render items twice for infinite effect */}
          {[...children, ...children].map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `${itemWidth}px`,
                marginRight: index < totalItems * 2 - 1 ? `${gap}px` : '0'
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Hidden on Mobile */}
      <div className="hidden md:flex justify-center mt-6 space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
