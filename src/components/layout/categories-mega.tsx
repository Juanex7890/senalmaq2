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
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div
        ref={panelRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 right-0 w-full max-w-sm z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-mega-title"
      >
        <div className="flex flex-col h-full bg-white shadow-2xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-primary-600 text-white">
            <div>
              <h2 id="categories-mega-title" className="text-lg font-semibold">
                Categorías
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Explora nuestros productos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-700 rounded-full transition-colors"
              aria-label="Cerrar menú de categorías"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              {sortedCategories.length > 0 ? (
                <div className="space-y-2">
                  {sortedCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.slug}`}
                      className="group flex items-center justify-between w-full px-4 py-4 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                      onClick={onClose}
                    >
                      <span className="font-medium text-gray-900 group-hover:text-primary-700">
                        {category.name}
                      </span>
                      <div className="w-2 h-2 bg-primary-200 rounded-full group-hover:bg-primary-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay categorías disponibles</p>
                </div>
              )}

              {/* Mobile Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <Link
                    href="/productos"
                    className="flex items-center justify-center w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={onClose}
                  >
                    Todos los Productos
                  </Link>
                  <Link
                    href="/categorias"
                    className="flex items-center justify-center w-full px-4 py-3 border border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={onClose}
                  >
                    Ver todas las Categorías
                  </Link>
                  <Link
                    href="/busqueda"
                    className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
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

      {/* Desktop Menu - Hidden on mobile */}
      <div
        ref={panelRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:block fixed left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-300 ease-out shadow-2xl"
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
