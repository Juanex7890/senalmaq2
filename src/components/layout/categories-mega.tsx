'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Home, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface DisplayCategory {
  id: string
  name: string
  href: string
  helperText?: string
  isSpecial?: boolean
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
  const mobilePanelRef = useRef<HTMLDivElement | null>(null)
  const desktopPanelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const historyPoppedRef = useRef(false)

  const isDesktopViewport = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(min-width: 768px)').matches
  }, [])

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
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const panels = [panelRef.current, mobilePanelRef.current, desktopPanelRef.current]
      const clickedInsidePanel = panels.some((panel) => panel && panel.contains(target))
      const clickedTrigger = triggerRef.current?.contains(target)

      if (!clickedInsidePanel && !clickedTrigger) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, panelRef, triggerRef])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const desktopView = isDesktopViewport()

    if (!isOpen) {
      if (wasOpenRef.current && !desktopView) {
        const focusTarget = triggerRef.current ?? previouslyFocusedElementRef.current

        if (focusTarget) {
          requestAnimationFrame(() => focusTarget.focus())
        }
      }

      wasOpenRef.current = false
      previouslyFocusedElementRef.current = null
      return
    }

    wasOpenRef.current = true

    if (desktopView) {
      return
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null

    const body = document.body
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    let pushedHistoryEntry = false

    const handlePopState = () => {
      historyPoppedRef.current = true
      onClose()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState)
      window.history.pushState({ __categoriesSheet: true }, '', window.location.href)
      pushedHistoryEntry = true
    }

    const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const panel = mobilePanelRef.current
    const focusableElements = panel?.querySelectorAll<HTMLElement>(focusableSelectors)

    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus()
    } else {
      panel?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const currentPanel = mobilePanelRef.current
        if (!currentPanel) {
          return
        }

        const focusable = currentPanel.querySelectorAll<HTMLElement>(focusableSelectors)

        if (focusable.length === 0) {
          event.preventDefault()
          currentPanel.focus()
          return
        }

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]
        const activeElement = document.activeElement as HTMLElement | null

        if (event.shiftKey) {
          if (activeElement === firstElement || !currentPanel.contains(activeElement)) {
            event.preventDefault()
            lastElement.focus()
          }
        } else if (activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      if (typeof window !== 'undefined' && pushedHistoryEntry) {
        window.removeEventListener('popstate', handlePopState)

        if (!historyPoppedRef.current) {
          window.history.back()
        } else {
          historyPoppedRef.current = false
        }

        historyPoppedRef.current = false
      }

      body.style.overflow = previousOverflow
    }
  }, [isDesktopViewport, isOpen, onClose, triggerRef])

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [categories])

  const displayCategories = useMemo<DisplayCategory[]>(() => {
    const baseCategories = sortedCategories.map<DisplayCategory>((category) => ({
      id: category.id,
      name: category.name,
      href: `/categoria/${category.slug}`,
      helperText: 'Ver productos',
    }))

    return [
      {
        id: 'home',
        name: 'Inicio',
        href: '/',
        helperText: 'Volver al inicio',
        isSpecial: true,
      },
      {
        id: 'all-products',
        name: 'Todos los productos',
        href: '/productos',
        helperText: 'Explora todo el catálogo',
        isSpecial: true,
      },
      ...baseCategories,
    ]
  }, [sortedCategories])

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
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Sheet */}
      <div
        ref={(node) => {
          mobilePanelRef.current = node

          if (!isDesktopViewport()) {
            panelRef.current = node
          }
        }}
        className={`fixed inset-0 z-[60] flex flex-col bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:hidden transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-mega-title-mobile"
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between h-12 px-3 border-b bg-white">
          <h2 id="categories-mega-title-mobile" className="text-base font-semibold text-neutral-900">
            Categorías
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="p-2 -mr-2 rounded-lg hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-3rem)] pb-4 pb-safe pb-[env(safe-area-inset-bottom)]">
          {displayCategories.length > 0 ? (
            <nav className="px-4 pt-4 pb-2">
              <div className="space-y-3">
                {displayCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className={`group relative block rounded-2xl border px-5 py-4 text-center shadow-sm transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${category.isSpecial ? 'border-primary-400 bg-primary-50 text-primary-800' : 'border-neutral-200 bg-white text-primary-700 hover:border-primary-200 hover:bg-primary-50'}`}
                    onClick={onClose}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        {category.id === 'home' && <Home className="h-4 w-4 text-primary-600" aria-hidden="true" />}
                        <span className={`text-base font-semibold leading-5 ${category.isSpecial ? 'text-primary-800' : 'text-primary-700'}`}>
                          {category.name}
                        </span>
                      </div>
                      {category.helperText && (
                        <span className={`text-xs ${category.isSpecial ? 'text-primary-600' : 'text-neutral-500'}`}>
                          {category.helperText}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </nav>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-neutral-500">No hay categorías disponibles</p>
            </div>
          )}

          <div className="mt-6 border-t border-neutral-200">
            <div className="space-y-2 px-4 pt-4 pb-6">
              <Link
                href="/categorias"
                className="block rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-primary-600 transition-all duration-150 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={onClose}
              >
                Ver todas las Categorías
              </Link>
              <Link
                href="/busqueda"
                className="block rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-center text-sm font-semibold text-primary-600 transition-all duration-150 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                onClick={onClose}
              >
                Búsqueda Avanzada
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* Desktop Menu - Hidden on mobile */}
      <div
        ref={(node) => {
          desktopPanelRef.current = node

          if (isDesktopViewport()) {
            panelRef.current = node
          }
        }}
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
              {displayCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {displayCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.href}
                      className="group block rounded-md px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 border border-transparent hover:border-primary-200"
                      onClick={onClose}
                    >
                      <span className="font-medium">{category.name}</span>
                      {category.helperText && (
                        <span className="block text-xs text-gray-500 mt-1">{category.helperText}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay categorías disponibles</p>
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
