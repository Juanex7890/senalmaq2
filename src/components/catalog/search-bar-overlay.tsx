'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'
import { debounce } from '@/lib/utils'
import { Product } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

interface SearchBarOverlayProps {
  placeholder?: string
  className?: string
}

interface SearchResult {
  products: Product[]
}

export function SearchBarOverlay({ placeholder = 'Buscar productos...', className }: SearchBarOverlayProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const searchProducts = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`)
        const data: SearchResult = await response.json()
        setResults(data.products || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching products:', error)
        setResults([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    searchProducts(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/busqueda?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const product = results[selectedIndex]
          setIsOpen(false)
          router.push(`/producto/${product.slug}`)
        } else if (query.trim()) {
          setIsOpen(false)
          router.push(`/busqueda?q=${encodeURIComponent(query.trim())}`)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = (product: Product) => {
    setIsOpen(false)
    setSelectedIndex(-1)
    router.push(`/producto/${product.slug}`)
  }

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true)
              }
            }}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" className="sr-only">
          Buscar
        </Button>
      </form>

      {/* Search Results Overlay */}
      {isOpen && (results.length > 0 || isLoading) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p>Buscando productos...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === selectedIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {product.categoryName || product.category}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          €{product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {query.trim() && (
                <div className="p-3 border-t border-gray-100">
                  <Link
                    href={`/busqueda?q=${encodeURIComponent(query.trim())}`}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Search className="h-4 w-4" />
                    <span>Ver todos los resultados para "{query}"</span>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
