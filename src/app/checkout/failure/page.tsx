import Link from 'next/link'

import { Button } from '@/components/ui/button'

import {
  buildWhatsAppLink,
  getSingleSearchParam,
  resolveCartId,
  type SearchParams,
} from '../utils'

interface CheckoutFailurePageProps {
  searchParams: Promise<SearchParams>
}

export default async function CheckoutFailurePage({ searchParams }: CheckoutFailurePageProps) {
  const resolvedSearchParams = await searchParams
  const cartId = resolveCartId(resolvedSearchParams)
  const paymentId =
    getSingleSearchParam(resolvedSearchParams, 'payment_id') ??
    getSingleSearchParam(resolvedSearchParams, 'paymentId')

  const resolveApiBaseUrl = () => {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
    if (configured && configured.length > 0) {
      return configured.endsWith('/') ? configured.slice(0, -1) : configured
    }

    const vercelUrl = process.env.VERCEL_URL?.trim()
    if (vercelUrl && vercelUrl.length > 0) {
      const normalized = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
      return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
    }

    return 'http://localhost:3000'
  }

  let paymentStatus: string | null = null
  let paymentStatusDetail: string | null = null
  let paymentExternalReference: string | null = null

  if (paymentId) {
    const baseUrl = resolveApiBaseUrl()
    try {
      const response = await fetch(`${baseUrl}/api/mp/payment/${paymentId}`, {
        cache: 'no-store',
      })

      if (response.ok) {
        const data = (await response.json()) as {
          status?: string | null
          status_detail?: string | null
          external_reference?: string | null
        }
        paymentStatus = data.status ?? null
        paymentStatusDetail = data.status_detail ?? null
        paymentExternalReference = data.external_reference ?? null
      } else {
        console.warn('Unable to load MP payment detail', {
          status: response.status,
          statusText: response.statusText,
        })
      }
    } catch (error) {
      console.error('Error fetching Mercado Pago payment detail', {
        paymentId,
        error,
      })
    }
  }

  const whatsappMessageLines = [
    'Hola, mi pago fue rechazado y necesito ayuda para finalizar la compra.',
  ]

  if (cartId) {
    whatsappMessageLines.push(`• Carrito: ${cartId}`)
  }

  if (paymentId) {
    whatsappMessageLines.push(`• Pago: ${paymentId}`)
  }

  if (paymentStatus) {
    whatsappMessageLines.push(`• Estado MP: ${paymentStatus}`)
  }

  if (paymentStatusDetail) {
    whatsappMessageLines.push(`• Detalle MP: ${paymentStatusDetail}`)
  }

  const whatsappLink = buildWhatsAppLink(whatsappMessageLines.join('\n'))

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">No pudimos completar tu pago</h1>
        <p className="text-lg text-gray-600">
          El intento de pago fue rechazado. Puedes intentarlo nuevamente o escribenos y te ayudaremos a finalizar la compra.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          {cartId && (
            <p>
              Referencia de carrito:{' '}
              <span className="font-mono font-semibold">{cartId}</span>
            </p>
          )}
          {paymentExternalReference && (
            <p>
              Referencia externa:{' '}
              <span className="font-mono font-semibold">{paymentExternalReference}</span>
            </p>
          )}
          {paymentId && (
            <p>
              ID de pago:{' '}
              <span className="font-mono font-semibold">{paymentId}</span>
            </p>
          )}
          {paymentStatusDetail && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              Detalle del rechazo: {paymentStatusDetail}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/carrito" className="sm:w-auto">
            <Button className="w-full sm:w-auto">Volver al carrito</Button>
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <Button className="w-full sm:w-auto" variant="outline">
              Necesito ayuda por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
