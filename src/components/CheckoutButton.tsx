'use client'

import { useState } from 'react'

import { useAuthState } from 'react-firebase-hooks/auth'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { auth } from '@/lib/firebase'

type CheckoutResponse = {
  init_point?: string
}

type CheckoutButtonProps = {
  className?: string
  label?: string
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const toCOP = (value: number): string => formatCOP(value)

export function CheckoutButton({ className, label = 'Pagar con Mercado Pago' }: CheckoutButtonProps) {
  const { items, cartId, refresh, isEmpty } = useCart()
  const [user] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentTotal = items.reduce(
    (total, item) => total + item.unit_price * (item.quantity > 0 ? item.quantity : 1),
    0
  )

  const handleCheckout = async () => {
    setError(null)

    const latestItems = refresh()

    if (latestItems.length === 0) {
      setError('Tu carrito esta vacio.')
      return
    }

    if (!cartId) {
      setError('No pudimos identificar tu carrito. Intenta nuevamente.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: latestItems,
          payer: {
            email: user?.email ?? undefined,
          },
          metadata: {
            cartId,
          },
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message: string =
          (errorPayload?.error && String(errorPayload.error)) ||
          'No pudimos iniciar el pago. Intenta nuevamente.'
        throw new Error(message)
      }

      const payload = (await response.json()) as CheckoutResponse

      if (!payload?.init_point) {
        throw new Error('Mercado Pago no entrego la URL del pago.')
      }

      window.location.href = payload.init_point
    } catch (checkoutError) {
      console.error('Checkout error', checkoutError)
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Ocurrio un error inesperado al iniciar el pago.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button onClick={handleCheckout} loading={isLoading} disabled={isEmpty || isLoading}>
        {label}
        {currentTotal > 0 && (
          <span className="ml-2 text-sm font-normal text-white/80">{toCOP(currentTotal)}</span>
        )}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default CheckoutButton
