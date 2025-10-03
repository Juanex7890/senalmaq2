'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface CategoriesMegaProps {
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  headerRef: React.RefObject<HTMLElement | null>
  panelRef: React.RefObject<HTMLDivElement | null>
}

export function CategoriesMega({ categories, isOpen, onClose, triggerRef, headerRef, panelRef }: CategoriesMegaProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [topPosition, setTopPosition] = useState(0)

  const calculatePosition = useCallback(() => {
    const headerElement = headerRef.current

    if (!headerElement || typeof window === 'undefined') {
      return
    }

    const headerRect = headerElement.getBoundingClientRect()
    const headerBottom = headerRect.bottom
    setTopPosition(headerBottom)
  }, [headerRef])

  useEffect(() => {
    calculatePosition()
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('scroll', calculatePosition)
    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('scroll', calculatePosition)
    }
  }, [calculatePosition])

  useEffect(() => {
    if (isOpen) {
      calculatePosition()
    }
  }, [isOpen, calculatePosition])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef, panelRef])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [categories])

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      <div
        ref={panelRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-300 ease-out shadow-2xl"
        style={{ top: `${topPosition}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-mega-title"
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white shadow-2xl border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 id="categories-mega-title" className="text-lg font-semibold text-gray-900">
                  Categorías
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Explora nuestra amplia gama de productos
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Cerrar menú de categorías"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              {sortedCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sortedCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.slug}`}
                      className="group block rounded-md px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 border border-transparent hover:border-primary-200"
                      onClick={onClose}
                    >
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay categorias disponibles</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/productos"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={onClose}
                  >
                    Todos los Productos
                  </Link>
                  <Link
                    href="/categorias"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={onClose}
                  >
                    Ver todas las Categorías
                  </Link>
                  <Link
                    href="/busqueda"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    onClick={onClose}
                  >
                    Búsqueda Avanzada
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
