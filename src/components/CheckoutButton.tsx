'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuthState } from 'react-firebase-hooks/auth'

import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'
import { auth } from '@/lib/firebase'
import { MercadoPagoWallet } from '@/components/MercadoPagoWallet'

type CheckoutResponse = {
  init_point?: string
  sandbox_init_point?: string
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

const MP_WALLET_AVAILABLE =
  typeof process.env.NEXT_PUBLIC_MP_PUBLIC_KEY === 'string' &&
  process.env.NEXT_PUBLIC_MP_PUBLIC_KEY.length > 0

export function CheckoutButton({ className, label = 'Proceder al pago' }: CheckoutButtonProps) {
  const { items, cartId, total, refresh } = useCart()
  const [user] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const formattedTotal = useMemo(() => (total > 0 ? formatCOP(total) : null), [total])

  const hasItems = items.length > 0

  useEffect(() => {
    if (!hasItems) {
      setPreferenceId(null)
      setCheckoutUrl(null)
    }
  }, [hasItems])

  const handleCheckout = useCallback(async () => {
    setPreferenceId(null)
    setCheckoutUrl(null)

    const latestItems = refresh()
    const itemsToSubmit = (latestItems.length > 0 ? latestItems : items).map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description,
      picture_url: item.picture_url,
      category_id: item.category_id,
    }))

    if (itemsToSubmit.length === 0) {
      showToast('No se pudo iniciar el pago', 'error')
      return
    }

    if (!cartId) {
      showToast('No se pudo iniciar el pago', 'error')
      return
    }

    setIsLoading(true)

    try {
      const cartTotalAmount = itemsToSubmit.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      )

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsToSubmit,
          payer: {
            email: user?.email ?? undefined,
          },
          metadata: {
            cartId,
            itemsCount: itemsToSubmit.length,
            cartTotal: cartTotalAmount,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No se pudo iniciar el pago')
        throw new Error(errorText || 'No se pudo iniciar el pago')
      }

      const data = (await response.json()) as CheckoutResponse
      console.log('MP preference:', data)

      const redirectUrl =
        data?.init_point ??
        (process.env.NODE_ENV !== 'production' ? data?.sandbox_init_point : undefined)

      if (MP_WALLET_AVAILABLE && data?.id) {
        setPreferenceId(data.id)
        setCheckoutUrl(redirectUrl ?? null)
        showToast('Selecciona tu medio de pago preferido.', 'success')
        return
      }

      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      throw new Error('No init_point')
    } catch (error) {
      console.error('Checkout error', error)
      setPreferenceId(null)
      setCheckoutUrl(null)
      showToast('No se pudo iniciar el pago', 'error')
      if (typeof window !== 'undefined' && typeof window.dispatchEvent !== 'function') {
        alert('No se pudo iniciar el pago')
      }
    } finally {
      setIsLoading(false)
    }
  }, [cartId, items, refresh, user?.email])

  const handleOpenCheckout = useCallback(() => {
    if (!checkoutUrl) {
      return
    }
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
  }, [checkoutUrl])

  const handleCloseWallet = useCallback(() => {
    setPreferenceId(null)
    setCheckoutUrl(null)
  }, [])

  return (
    <>
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

      {preferenceId && (
        <div className="mt-4 space-y-3 rounded-lg border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Opciones de pago Mercado Pago
            </p>
            <p className="text-xs text-gray-500">
              Selecciona tu medio de pago preferido. Si la ventana no aparece, usa el botón de
              respaldo o vuelve a intentarlo.
            </p>
          </div>
          <MercadoPagoWallet preferenceId={preferenceId} className="w-full" />
          <div className="flex flex-col gap-2 sm:flex-row">
            {checkoutUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
                onClick={handleOpenCheckout}
              >
                Abrir checkout completo
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={handleCloseWallet}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default CheckoutButton
