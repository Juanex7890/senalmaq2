'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  BoldPayButton,
  type BoldPaymentMode,
  type BoldRenderMode,
} from '@/components/BoldPayButton'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart/cart-provider'

const DEFAULT_DESCRIPTION = 'Compra en Senalmaq'
const CURRENCY = 'COP' as const

const resolveConfiguredSite = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && configured.length > 0) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured
  }
  return ''
}

type CheckoutButtonProps = {
  className?: string
  label?: string
  mode?: BoldPaymentMode
  renderMode?: BoldRenderMode
}

type SignatureResponse = {
  signature: string
  amount?: string
  currency?: string
}

export function CheckoutButton({
  className,
  label = 'Proceder al pago',
  mode = 'defined',
  renderMode = 'redirect',
}: CheckoutButtonProps) {
  const { items, cartId, total, isEmpty } = useCart()
  const [integritySignature, setIntegritySignature] = useState<string | null>(null)
  const [isLoadingSignature, setIsLoadingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configuredSite = useMemo(resolveConfiguredSite, [])

  const amountValue = useMemo(() => {
    if (!Number.isFinite(total) || total <= 0) {
      return 0
    }

    const rounded = Math.round(total * 100) / 100
    return rounded % 1 === 0 ? rounded : Number(rounded.toFixed(2))
  }, [total])

  const amountString = useMemo(() => {
    if (amountValue <= 0) {
      return undefined
    }

    return Number.isInteger(amountValue)
      ? String(Math.trunc(amountValue))
      : amountValue.toFixed(2)
  }, [amountValue])

  const itemNames = useMemo(
    () =>
      items
        .map(item => item.title)
        .filter((title): title is string => Boolean(title && title.length > 0)),
    [items]
  )

  const description = useMemo(() => {
    if (items.length === 0) {
      return DEFAULT_DESCRIPTION
    }

    if (items.length === 1) {
      return `Compra: ${items[0]?.title ?? DEFAULT_DESCRIPTION}`
    }

    if (items.length === 2) {
      return `Compra: ${items[0]?.title ?? 'Producto'} y ${items.length - 1} artículo`
    }

    return `Compra con ${items.length} productos`
  }, [items])

  const redirectionUrl = useMemo(() => {
    const fallbackOrigin =
      typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : ''
    const base = (configuredSite || fallbackOrigin).replace(/\/$/, '')
    const successBase = base ? `${base}/checkout/success` : '/checkout/success'

    if (!cartId) {
      return successBase
    }

    return `${successBase}?orderId=${encodeURIComponent(cartId)}`
  }, [cartId, configuredSite])

  const fetchSignature = useCallback(async () => {
    if (mode !== 'defined') {
      setIntegritySignature(null)
      return
    }

    if (!cartId || !amountString) {
      setIntegritySignature(null)
      return
    }

    try {
      setIsLoadingSignature(true)
      setError(null)

      const response = await fetch('/api/bold/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cartId,
          amount: amountString,
          currency: CURRENCY,
          items: itemNames,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => undefined)
        throw new Error(text || 'No se pudo generar la firma de integridad.')
      }

      const json = (await response.json()) as SignatureResponse

      if (!json?.signature) {
        throw new Error('La firma de integridad no está disponible.')
      }

      setIntegritySignature(json.signature)
    } catch (signatureError) {
      console.error('Error al generar la firma de integridad para Bold', signatureError)
      setIntegritySignature(null)
      setError(
        'No pudimos preparar el botón de pago. Verifica tu conexión e intenta nuevamente.'
      )
    } finally {
      setIsLoadingSignature(false)
    }
  }, [amountString, cartId, itemNames, mode])

  useEffect(() => {
    void fetchSignature()
  }, [fetchSignature])

  if (isEmpty || !cartId) {
    return (
      <Button className={className} disabled>
        Agrega productos al carrito para pagar
      </Button>
    )
  }

  const isDefinedModeReady = mode !== 'defined' || Boolean(integritySignature)

  if (!isDefinedModeReady) {
    return (
      <div className="space-y-2">
        <Button className={className} disabled={isLoadingSignature} loading>
          {label}
        </Button>
        {error && (
          <div className="text-sm text-red-600">
            {error}{' '}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => {
                void fetchSignature()
              }}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <BoldPayButton
        className={className}
        mode={mode}
        orderId={cartId}
        amount={mode === 'defined' ? amountString : undefined}
        currency={CURRENCY}
        description={description}
        integritySignature={mode === 'defined' ? integritySignature ?? undefined : undefined}
        redirectionUrl={redirectionUrl}
        renderMode={renderMode}
      />
      {error && (
        <div className="text-sm text-red-600">
          {error}{' '}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              void fetchSignature()
            }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

export default CheckoutButton
