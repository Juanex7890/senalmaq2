'use client'

import { InputHTMLAttributes, forwardRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    // Generate a stable ID based on the label or use provided id
    const inputId = useMemo(() => {
      if (id) return id
      if (label) return `input-${label.toLowerCase().replace(/\s+/g, '-')}`
      return `input-${type || 'text'}`
    }, [id, label, type])

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 transition-all duration-200 ease-in-out',
            'hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
