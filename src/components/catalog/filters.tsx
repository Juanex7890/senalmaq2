'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchFilters } from '@/lib/types'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Filter } from 'lucide-react'

interface FiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  brands: string[]
  categories: Array<{ slug: string; name: string }>
}

export function Filters({ filters, onFiltersChange, brands, categories }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [minPrice, setMinPrice] = useState(filters?.minPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(filters?.maxPrice?.toString() || '')
  const minPriceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxPriceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const minPriceFilterValue = typeof filters?.minPrice === 'number' ? filters.minPrice : undefined
  const maxPriceFilterValue = typeof filters?.maxPrice === 'number' ? filters.maxPrice : undefined

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...(filters || {}),
      [key]: value,
    })
  }

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
    
    // Clear existing timeout
    if (minPriceTimeoutRef.current) {
      clearTimeout(minPriceTimeoutRef.current)
    }
    
    // Set new timeout
    minPriceTimeoutRef.current = setTimeout(() => {
      const numValue = value ? Number(value) : undefined
      handleFilterChange('minPrice', numValue)
    }, 1000) // Wait 1 second after user stops typing
  }

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value)
    
    // Clear existing timeout
    if (maxPriceTimeoutRef.current) {
      clearTimeout(maxPriceTimeoutRef.current)
    }
    
    // Set new timeout
    maxPriceTimeoutRef.current = setTimeout(() => {
      const numValue = value ? Number(value) : undefined
      handleFilterChange('maxPrice', numValue)
    }, 1000) // Wait 1 second after user stops typing
  }

  // Update local state when filters change from outside
  useEffect(() => {
    setMinPrice(filters?.minPrice?.toString() || '')
    setMaxPrice(filters?.maxPrice?.toString() || '')
  }, [filters?.minPrice, filters?.maxPrice])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (minPriceTimeoutRef.current) clearTimeout(minPriceTimeoutRef.current)
      if (maxPriceTimeoutRef.current) clearTimeout(maxPriceTimeoutRef.current)
    }
  }, [])

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'relevance',
    })
  }

  const ignoredFilterKeys = new Set(['sortBy', 'categoryName', 'categorySlug'])
  const hasActiveFilters = filters ? Object.entries(filters).some(([key, value]) => (
    !ignoredFilterKeys.has(key) && value !== undefined && value !== ''
  )) : false

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between transition-all duration-200 hover:bg-gray-50"
        >
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2 transition-transform duration-200" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            )}
          </span>
          <span className="transition-transform duration-200">
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </span>
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`space-y-4 transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'block opacity-100 max-h-screen' 
          : 'hidden lg:block opacity-100 max-h-screen'
      }`}>
        {/* Category Filter */}
        <Select
          label="CategorÃ­a"
          placeholder="Todas las categorÃ­as"
          value={filters?.categorySlug || ''}
          onChange={(e) => handleFilterChange('categorySlug', e.target.value || undefined)}
          options={[
            { value: '', label: 'Todas las categorÃ­as' },
            ...categories.map(cat => ({ value: cat.slug, label: cat.name }))
          ]}
        />

        {/* Brand Filter */}
        <Select
          label="Marca"
          placeholder="Todas las marcas"
          value={filters?.brand || ''}
          onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
          options={[
            { value: '', label: 'Todas las marcas' },
            ...brands.map(brand => ({ value: brand, label: brand }))
          ]}
        />

        {/* Price Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Rango de precio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="MÃ­nimo"
                value={minPrice}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                COP
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="MÃ¡ximo"
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                COP
              </span>
            </div>
          </div>
          {(filters?.minPrice !== undefined || filters?.maxPrice !== undefined) && (
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              {filters?.minPrice !== undefined && filters?.maxPrice !== undefined
                ? `$${filters.minPrice!.toLocaleString()} - $${filters.maxPrice!.toLocaleString()}`
                : filters?.minPrice !== undefined
                  ? `Desde $${filters.minPrice!.toLocaleString()}`
                  : filters?.maxPrice !== undefined
                    ? `Hasta $${filters.maxPrice!.toLocaleString()}`
                    : null}
            </div>
          )}
        </div>

        {/* Sort By */}
        <Select
          label="Ordenar por"
          value={filters?.sortBy || 'relevance'}
          onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
          options={[
            { value: 'relevance', label: 'Relevancia' },
            { value: 'price-asc', label: 'Precio: menor a mayor' },
            { value: 'price-desc', label: 'Precio: mayor a menor' },
            { value: 'newest', label: 'MÃ¡s recientes' },
          ]}
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-2 transition-transform duration-200" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}

