'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { SearchBarOverlay } from '@/components/catalog/search-bar-overlay'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoriesMega } from '@/components/layout/categories-mega'
import {
  ShoppingCart,
  Phone,
  Mail,
  MoreHorizontal,
} from 'lucide-react'

interface HeaderProps {
  categories?: Array<{ id: string; name: string; slug: string; icon?: string }>
}

export function Header({ categories }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const categoriesButtonRef = useRef<HTMLButtonElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const isDesktopViewport = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

  const openCategoriesIfDesktop = () => {
    if (isDesktopViewport()) {
      setIsCategoriesOpen(true)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.length)
  }, [])

  // Set CSS custom property for nav height
  useEffect(() => {
    const setNavHeight = () => {
      const topBarHeight = topBarRef.current?.offsetHeight ?? 0
      const headerHeight = headerRef.current?.offsetHeight ?? 0
      document.documentElement.style.setProperty(
        '--nav-height',
        `${topBarHeight + headerHeight}px`
      )
    }

    const timeoutId = window.setTimeout(setNavHeight, 100)
    setNavHeight()
    window.addEventListener('resize', setNavHeight)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('resize', setNavHeight)
    }
  }, [])

  const isActive = (path: string) => pathname === path
  const isCategoriesRoute = pathname.startsWith('/categorias') || pathname.startsWith('/categoria/')

  return (
    <>
      {/* Top Bar */}
      <div ref={topBarRef} className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+601 6976689</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>cosersenalmaq@gmail.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span> Reclama un obsequio por compras superiores a 700.000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 bg-white shadow-sm transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img 
                    src="/images/logosenalmaq.png" 
                    alt="Senalmaq Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900">Senalmaq</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                <Link
                  href="/"
                  className={`transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  Inicio
                </Link>
                <Link
                  href="/productos"
                  className={`transition-colors ${isActive('/productos') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
                >
                  Productos
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 items-center max-w-xl mx-6">
              <SearchBarOverlay placeholder="Buscar productos..." className="w-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <button
                type="button"
                ref={categoriesButtonRef}
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                onMouseEnter={openCategoriesIfDesktop}
                onFocus={openCategoriesIfDesktop}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  isCategoriesOpen || isCategoriesRoute
                    ? 'bg-primary-700 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                aria-expanded={isCategoriesOpen}
                aria-controls="categories-mega-menu"
                aria-haspopup="true"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="whitespace-nowrap">Categorías</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => router.push('/carrito')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>


            </div>
          </div>
        </div>

      </header>

      {/* Categories Mega Menu */}
      <CategoriesMega
        categories={categories || []}
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        triggerRef={categoriesButtonRef}
        headerRef={headerRef}
        panelRef={panelRef}
      />
    </>
  )
}
