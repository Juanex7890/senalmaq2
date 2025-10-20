'use client'

import { useCallback, useMemo, useState, type FormEvent } from 'react'

import { BoldPayButton } from '@/components/BoldPayButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BoldEventRecord } from '@/lib/orders'

type BoldTesterProps = {
  initialEvents: BoldEventRecord[]
}

type SignatureLogEntry = {
  orderId: string
  amount: string
  currency: string
  signature: string
  generatedAt: string
}

const DEFAULT_ORDER_ID = 'TEST-ORDER-001'
const DEFAULT_AMOUNT = '10000'
const CURRENCY = 'COP'

const resolveSiteBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && configured.length > 0) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured
  }
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  return ''
}

export function BoldTester({ initialEvents }: BoldTesterProps) {
  const [orderId, setOrderId] = useState(DEFAULT_ORDER_ID)
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [signature, setSignature] = useState<string | null>(null)
  const [isLoadingSignature, setIsLoadingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<BoldEventRecord[]>(initialEvents)
  const [logs, setLogs] = useState<SignatureLogEntry[]>([])

  const siteBase = useMemo(resolveSiteBaseUrl, [])
  const redirectionUrl = `${siteBase}/checkout/success?orderId=${encodeURIComponent(orderId)}`

  const handleGenerateSignature = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!orderId || !amount) {
        setError('orderId y amount son obligatorios')
        return
      }

      setIsLoadingSignature(true)
      setError(null)
      setSignature(null)

      try {
        const response = await fetch('/api/bold/signature', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount,
            currency: CURRENCY,
          }),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => undefined)
          throw new Error(text || 'Error generando la firma')
        }

        const json = (await response.json()) as { signature?: string }
        if (!json.signature) {
          throw new Error('La respuesta no incluye la firma')
        }

        setSignature(json.signature)
        setLogs(prev => [
          {
            orderId,
            amount,
            currency: CURRENCY,
            signature: json.signature,
            generatedAt: new Date().toISOString(),
          },
          ...prev,
        ])
      } catch (generateError) {
        console.error('[bold-check] signature error', generateError)
        setError(
          generateError instanceof Error
            ? generateError.message
            : 'No se pudo generar la firma'
        )
      } finally {
        setIsLoadingSignature(false)
      }
    },
    [orderId, amount]
  )

  const refreshEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/bold/events', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('No se pudieron cargar los eventos')
      }
      const data = (await response.json()) as { events?: BoldEventRecord[] }
      if (Array.isArray(data.events)) {
        setEvents(data.events)
      }
    } catch (refreshError) {
      console.error('[bold-check] events error', refreshError)
    }
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_minmax(260px,1fr)]">
      <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4" onSubmit={handleGenerateSignature}>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="orderId">
              Order ID
            </label>
            <Input
              id="orderId"
              value={orderId}
              onChange={event => setOrderId(event.target.value)}
              placeholder="Referencia única de la orden"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="amount">
              Monto (sin separadores)
            </label>
            <Input
              id="amount"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              placeholder="10000"
              pattern="^\\d+(\\.\\d{1,2})?$"
              title="Sólo números, con hasta dos decimales"
              required
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isLoadingSignature} loading={isLoadingSignature}>
              Generar firma
            </Button>
            <span className="text-sm text-gray-500">Divisa: {CURRENCY}</span>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-sm font-medium text-emerald-700">
            Previsualización del botón Bold
          </p>
          {signature ? (
            <BoldPayButton
              mode="defined"
              orderId={orderId}
              amount={amount}
              currency={CURRENCY}
              description={`Prueba admin ${orderId}`}
              integritySignature={signature}
              redirectionUrl={redirectionUrl}
              className="min-h-[64px]"
            />
          ) : (
            <p className="text-sm text-emerald-800">
              Genera una firma para renderizar el botón de pagos.
            </p>
          )}
        </div>

        {logs.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Logs de firmas generadas</h2>
            <ul className="space-y-2 text-xs text-gray-600">
              {logs.map(log => (
                <li
                  key={`${log.orderId}-${log.generatedAt}`}
                  className="rounded border border-gray-200 bg-gray-50 p-3"
                >
                  <p>
                    <span className="font-semibold text-gray-800">Orden:</span> {log.orderId}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Monto:</span> {log.amount}{' '}
                    {log.currency}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold text-gray-800">Firma:</span> {log.signature}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Generada:</span>{' '}
                    {new Date(log.generatedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Últimos eventos (webhook)</h2>
          <Button size="sm" variant="outline" onClick={() => void refreshEvents()}>
            Refrescar
          </Button>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no se registran eventos de Bold.</p>
        ) : (
          <ul className="space-y-2">
            {events.map(event => (
              <li
                key={event.id}
                className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700"
              >
                <p className="font-semibold text-gray-900">{event.type ?? 'SIN_TIPO'}</p>
                {event.reference && <p>Referencia: {event.reference}</p>}
                <p>Recibido: {new Date(event.receivedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}
