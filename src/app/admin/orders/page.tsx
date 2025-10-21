'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface OrderLookupResult {
  orderId: string
  verificationCode: string
  status: string
  updatedAt: string | null
  items: string[]
}

const statusLabels: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  voided: 'Anulado',
}

const formatTimestamp = (iso?: string | null) => {
  if (!iso) {
    return 'N/A'
  }

  try {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function OrdersAdminPage() {
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<OrderLookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setOrder(null)

    const trimmed = code.trim()
    if (!trimmed) {
      setError('Ingresa el codigo de verificacion')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders/by-code?code=${encodeURIComponent(trimmed)}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'No encontramos la orden')
        throw new Error(text)
      }

      const data = (await response.json()) as OrderLookupResult
      setOrder(data)
    } catch (lookupError) {
      console.error('Lookup error', lookupError)
      setError('No encontramos una orden con ese codigo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Verificar orden Bold</h1>
        <p className="text-sm text-gray-600">
          Ingresa el codigo de verificacion que el cliente comparte para confirmar el estado del pago.
        </p>
      </header>

      <form onSubmit={handleLookup} className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="SEN-XXXXXX"
          value={code}
          onChange={event => setCode(event.target.value.toUpperCase())}
          className="sm:flex-1"
        />
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          Consultar
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {order && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Codigo de verificacion
              </h2>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-700">
                {order.verificationCode}
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </h2>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {statusLabels[order.status] ?? 'Desconocido'}
              </p>
              <p className="text-xs text-gray-500">
                Actualizado: {formatTimestamp(order.updatedAt)}
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Orden</h2>
              <p className="mt-1 break-all font-mono text-sm text-gray-800">{order.orderId}</p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Productos
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {order.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
