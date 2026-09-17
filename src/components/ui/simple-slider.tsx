'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { SliderArrowButton } from './slider-arrow-button'

interface SimpleSliderProps {
  children: ReactNode[]
  className?: string
  itemWidth?: number
  gap?: number
  autoPlay?: boolean
  autoPlaySpeed?: number
}

export function SimpleSlider({ 
  children, 
  className = '', 
  itemWidth = 200,
  gap = 12,
  autoPlay = false,
  autoPlaySpeed = 5
}: SimpleSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  const totalItems = children.length
  const itemWidthWithGap = itemWidth + gap
  const maxIndex = Math.max(0, totalItems - 1)

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const handleMouseEnter = () => {
    setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    if (autoPlay && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsPlaying(true)
    }
  }

  // Initialize playing state after mount to avoid hydration issues
  useEffect(() => {
    if (autoPlay && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsPlaying(true)
    }
  }, [autoPlay])

  // Handle window resize to stop/start auto-play based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile && isPlaying) {
        setIsPlaying(false)
      } else if (!isMobile && autoPlay && !isPlaying) {
        setIsPlaying(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isPlaying, autoPlay])

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

  // Calculate the translateX for the current position
  const getTranslateX = () => {
    const baseTranslateX = -currentIndex * itemWidthWithGap
    return baseTranslateX + translateX
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Navigation Arrows - Hidden on Mobile */}
      <SliderArrowButton
        direction="prev"
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      <SliderArrowButton
        direction="next"
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        onClick={goToNext}
        disabled={currentIndex >= maxIndex}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Slider Container */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-out md:transition-transform"
          style={{
            width: `${totalItems * itemWidthWithGap}px`,
            transform: `translateX(${getTranslateX()}px)`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `${itemWidth}px`,
                marginRight: index < totalItems - 1 ? `${gap}px` : '0'
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Hidden on Mobile */}
      {totalItems > 1 && (
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
      )}
    </div>
  )
}
