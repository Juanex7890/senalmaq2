'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SliderArrowButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  disabled?: boolean
  className?: string
}

export function SliderArrowButton({
  direction,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  className = '',
}: SliderArrowButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Anterior' : 'Siguiente'}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-700 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-105 hover:bg-primary-50 hover:text-primary-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-white ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} />
    </button>
  )
}
