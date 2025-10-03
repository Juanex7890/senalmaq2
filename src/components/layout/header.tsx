'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { SearchBar } from '@/components/catalog/search-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoriesMega } from '@/components/layout/categories-mega'
import {
  Menu,
  X,
  ShoppingCart,
  Phone,
  Mail,
  MoreHorizontal,
} from 'lucide-react'

interface HeaderProps {
  categories?: Array<{ id: string; name: string; slug: string; icon?: string }>
}

export function Header({ categories }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const categoriesButtonRef = useRef<HTMLButtonElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

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
                <span>+34 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@senalmaq.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Envío gratis en pedidos superiores a 50€</span>
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
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
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
              <SearchBar placeholder="Buscar productos..." className="w-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <button
                type="button"
                ref={categoriesButtonRef}
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onFocus={() => setIsCategoriesOpen(true)}
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

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú de navegación"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="container mx-auto px-4 py-4">
                {/* Mobile Search */}
                <div className="mb-4">
                  <SearchBar placeholder="Buscar productos..." />
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  <Link
                    href="/"
                    className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                      isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/categorias"
                    className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                      isActive('/categorias') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Categorías
                  </Link>
                  <Link
                    href="/productos"
                    className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                      isActive('/productos') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Todos los productos
                  </Link>
                  <Link
                    href="/carrito"
                    className={`block py-2 px-3 rounded-md font-medium transition-colors ${
                      isActive('/carrito') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Carrito ({cartCount})
                  </Link>
                </nav>

                {/* Mobile Categories */}
                {categories && categories.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Categorías</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categoria/${category.slug}`}
                          className="text-sm text-gray-700 hover:text-primary-600 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
