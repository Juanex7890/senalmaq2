'use client'

import { useCallback, useMemo, useState } from 'react'

import { useAuthState } from 'react-firebase-hooks/auth'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { auth } from '@/lib/firebase'

type CheckoutResponse = {
  init_point?: string
  id?: string
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

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: {
        message,
        type,
        duration: 4000,
      },
    })
  )
}

export function CheckoutButton({ className, label = 'Proceder al pago' }: CheckoutButtonProps) {
  const { items, cartId, total } = useCart()
  const [user] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)

  const formattedTotal = useMemo(() => (total > 0 ? formatCOP(total) : null), [total])

  const mappedItems = useMemo(
    () =>
      items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    [items]
  )

  const hasItems = mappedItems.length > 0

  const handleCheckout = useCallback(async () => {
    if (!hasItems) {
      showToast('No se pudo iniciar el pago', 'error')
      return
    }

    if (!cartId) {
      showToast('No se pudo iniciar el pago', 'error')
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
          items: mappedItems,
          payer: {
            email: user?.email ?? undefined,
          },
          metadata: {
            cartId,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No se pudo iniciar el pago')
        throw new Error(errorText || 'No se pudo iniciar el pago')
      }

      const data = (await response.json()) as CheckoutResponse
      console.log('MP preference:', data)

      if (data?.init_point) {
        window.location.href = data.init_point
        return
      }

      throw new Error('No init_point')
    } catch (error) {
      console.error('Checkout error', error)
      showToast('No se pudo iniciar el pago', 'error')
      if (typeof window !== 'undefined' && typeof window.dispatchEvent !== 'function') {
        alert('No se pudo iniciar el pago')
      }
    } finally {
      setIsLoading(false)
    }
  }, [cartId, hasItems, mappedItems, user?.email])

  return (
    <Button
      className={className}
      onClick={handleCheckout}
      disabled={isLoading || !hasItems}
      loading={isLoading}
    >
      {isLoading ? 'Procesando...' : label}
      {!isLoading && formattedTotal && (
        <span className="ml-2 text-sm font-normal text-white/80">{formattedTotal}</span>
      )}
    </Button>
  )
}

export default CheckoutButton
