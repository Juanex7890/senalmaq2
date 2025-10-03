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

    const headerHeight = headerElement.offsetHeight
    const headerDocumentTop = headerElement.offsetTop
    const scrollY = window.scrollY
    const visibleOffset = Math.max(headerDocumentTop - scrollY, 0)

    setTopPosition(headerHeight + visibleOffset)
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
      <div
        ref={panelRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-300 ease-out"
        style={{ top: `${topPosition}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-mega-title"
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-white shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <h2 id="categories-mega-title" className="text-xl font-bold text-black">
                  Categorias
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Explora nuestra amplia gama de productos organizados por categorias
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menu de categorias"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-6">
              {sortedCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.slug}`}
                      className="group block rounded-lg border border-gray-100 px-4 py-3 text-sm text-black transition-colors hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-700"
                      onClick={onClose}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="mt-1 block text-xs text-gray-500 group-hover:text-primary-600">Ver productos</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay categorias disponibles</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-6">
                  <Link
                    href="/productos"
                    className="text-sm font-bold text-black hover:text-gray-600"
                    onClick={onClose}
                  >
                    Todos los Productos
                  </Link>
                  <Link
                    href="/categorias"
                    className="text-sm font-bold text-black hover:text-gray-600"
                    onClick={onClose}
                  >
                    Ver todas las Categorias
                  </Link>
                  <Link
                    href="/busqueda"
                    className="text-sm font-bold text-black hover:text-gray-600"
                    onClick={onClose}
                  >
                    Busqueda Avanzada
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
