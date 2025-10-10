'use client'

import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string }
    ) => {
      bricks: () => {
        create: (
          brickType: 'wallet',
          containerId: string,
          settings: {
            initialization: { preferenceId: string }
            customization?: Record<string, unknown>
          }
        ) => Promise<void>
      }
    }
  }
}

const SDK_URL = 'https://sdk.mercadopago.com/js/v2'
const SCRIPT_ID = 'mercado-pago-sdk'

interface MercadoPagoWalletProps {
  preferenceId?: string
  className?: string
  customization?: Record<string, unknown>
  locale?: string
}

const ensureScriptLoaded = async () => {
  if (typeof window === 'undefined') {
    return
  }

  if (document.getElementById(SCRIPT_ID)) {
    if (window.MercadoPago) {
      return
    }

    await new Promise((resolve, reject) => {
      const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement
      script.addEventListener('load', resolve, { once: true })
      script.addEventListener('error', reject, { once: true })
    })

    return
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SDK_URL
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Mercado Pago SDK'))
    document.body.appendChild(script)
  })
}

export function MercadoPagoWallet({
  preferenceId,
  className,
  customization,
  locale = 'es-CO',
}: MercadoPagoWalletProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const containerId = useMemo(
    () => `mp-wallet-${Math.random().toString(36).slice(2, 10)}`,
    []
  )

  useEffect(() => {
    let isMounted = true

    const renderWallet = async () => {
      if (!preferenceId) {
        return
      }

      const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY

      if (!publicKey) {
        setError('Mercado Pago public key is not configured.')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        await ensureScriptLoaded()

        if (!isMounted) {
          return
        }

        if (!window.MercadoPago) {
          throw new Error('Mercado Pago SDK not available on window.')
        }

        const mp = new window.MercadoPago(publicKey, { locale })
        const bricksBuilder = mp.bricks()

        const container = document.getElementById(containerId)
        if (container) {
          container.innerHTML = ''
        }

        await bricksBuilder.create('wallet', containerId, {
          initialization: {
            preferenceId,
          },
          customization,
        })
      } catch (sdkError) {
        console.error('Failed to initialize Mercado Pago wallet', sdkError)
        if (isMounted) {
          setError('No pudimos cargar Mercado Pago Wallet.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void renderWallet()

    return () => {
      isMounted = false
    }
  }, [containerId, customization, locale, preferenceId])

  if (!preferenceId) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      <div id={containerId} />
      {isLoading && (
        <p className="mt-2 text-sm text-gray-500">
          Cargando opciones de pago de Mercado Pago...
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default MercadoPagoWallet
