'use client'

import { SelectHTMLAttributes, forwardRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  label?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, placeholder, options, id, ...props }, ref) => {
    // Generate a stable ID based on the label or use provided id
    const selectId = useMemo(() => {
      if (id) return id
      if (label) return `select-${label.toLowerCase().replace(/\s+/g, '-')}`
      // Use a hash of the options to create a deterministic ID
      const optionsHash = options.map(o => o.value).join('-').slice(0, 8)
      return `select-${optionsHash || 'default'}`
    }, [id, label, options])

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm transition-all duration-200 ease-in-out',
              'hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            id={selectId}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 group-hover:text-gray-600 group-focus-within:text-primary-500" />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
