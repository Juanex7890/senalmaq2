'use client'

import { useEffect, useMemo, useRef } from 'react'

import { cn } from '@/lib/utils'

export type BoldPaymentMode = 'defined' | 'open'
export type BoldCurrency = 'COP' | 'USD'
export type BoldTaxCode = 'vat-5' | 'vat-19' | 'consumption'
export type BoldRenderMode = 'embedded' | 'redirect'

type BaseProps = {
  mode: BoldPaymentMode
  orderId: string
  amount?: string
  currency: BoldCurrency
  description: string
  tax?: BoldTaxCode
  customerData?: string
  billingAddress?: string
  renderMode?: BoldRenderMode
  integritySignature?: string
  redirectionUrl: string
  buttonStyle?: string
  className?: string
}

const DEFAULT_BUTTON_STYLE = 'dark-L'
const BOLD_BUTTON_SRC = 'https://checkout.bold.co/library/boldPaymentButton.js'

const resolveApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_BOLD_API_KEY?.trim()
  return apiKey && apiKey.length > 0 ? apiKey : undefined
}

export function BoldPayButton({
  mode,
  orderId,
  amount,
  currency,
  description,
  tax,
  customerData,
  billingAddress,
  renderMode = 'redirect',
  integritySignature,
  redirectionUrl,
  buttonStyle = DEFAULT_BUTTON_STYLE,
  className,
}: BaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const apiKey = resolveApiKey()

  const attributeMap = useMemo(() => {
    const attributes = new Map<string, string>()

    if (!apiKey) {
      return attributes
    }

    attributes.set('data-bold-button', buttonStyle)
    attributes.set('data-api-key', apiKey)
    attributes.set('data-currency', currency)
    attributes.set('data-description', description)
    attributes.set('data-render-mode', renderMode)
    attributes.set('data-redirection-url', redirectionUrl)

    if (mode === 'defined') {
      attributes.set('data-mode', 'defined')
      if (amount) {
        attributes.set('data-amount', amount)
      }
      if (integritySignature) {
        attributes.set('data-integrity-signature', integritySignature)
      }
    } else {
      attributes.set('data-mode', 'open')
    }

    if (orderId) {
      attributes.set('data-order-id', orderId)
    }

    if (tax) {
      attributes.set('data-tax', tax)
    }

    if (customerData) {
      attributes.set('data-customer-data', customerData)
    }

    if (billingAddress) {
      attributes.set('data-billing-address', billingAddress)
    }

    return attributes
  }, [
    apiKey,
    billingAddress,
    buttonStyle,
    customerData,
    integritySignature,
    mode,
    orderId,
    redirectionUrl,
    renderMode,
    amount,
    tax,
    description,
    currency,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    if (!apiKey) {
      container.innerHTML = ''
      console.error('NEXT_PUBLIC_BOLD_API_KEY is not configured.')
      return
    }

    container.innerHTML = ''

    const buttonScript = document.createElement('script')
    buttonScript.type = 'text/javascript'
    buttonScript.src = BOLD_BUTTON_SRC
    buttonScript.async = true

    attributeMap.forEach((value, key) => {
      if (value) {
        buttonScript.setAttribute(key, value)
      }
    })

    container.appendChild(buttonScript)

    return () => {
      container.innerHTML = ''
    }
  }, [apiKey, attributeMap])

  if (!apiKey) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700',
          className
        )}
      >
        Configura la variable <code>NEXT_PUBLIC_BOLD_API_KEY</code> para habilitar el botón de pago.
      </div>
    )
  }

  return <div ref={containerRef} className={cn(className)} />
}

export default BoldPayButton
