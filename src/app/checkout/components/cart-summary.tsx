'use client'

import { useEffect, useState } from 'react'

type CartSummaryItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
}

interface CartSummaryProps {
  cartId?: string
}

const CART_CACHE_PREFIX = 'checkout:cart:'

const toCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const isValidItem = (value: unknown): value is CartSummaryItem => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CartSummaryItem>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.quantity === 'number' &&
    Number.isFinite(candidate.quantity) &&
    typeof candidate.unit_price === 'number' &&
    Number.isFinite(candidate.unit_price)
  )
}

export function CartSummary({ cartId }: CartSummaryProps) {
  const [items, setItems] = useState<CartSummaryItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!cartId) {
      setItems([])
      return
    }

    const storageKey = `${CART_CACHE_PREFIX}${cartId}`

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setItems([])
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setItems([])
        return
      }

      const filtered = parsed.filter(isValidItem)
      setItems(filtered)
    } catch (error) {
      console.error('Failed to load cart summary from storage', error)
      setItems([])
    }
  }, [cartId])

  if (!cartId || items.length === 0) {
    return null
  }

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Resumen del carrito</h2>
      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={`${item.id}-${item.unit_price}`} className="flex items-center justify-between text-sm text-gray-700">
            <span className="font-medium">
              {item.title}{' '}
              <span className="font-normal text-gray-500">x {item.quantity}</span>
            </span>
            <span>{toCOP(item.unit_price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
        <span>Total</span>
        <span>{toCOP(total)}</span>
      </div>
    </section>
  )
}
