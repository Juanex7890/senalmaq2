'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type CartSummaryItem = {
  id: string
  title: string
  quantity: number
  unit_price: number
}

interface WhatsAppButtonProps {
  uniqueCode: string
  orderId: string
  paymentId: string
  status: string
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

export function WhatsAppButton({ 
  uniqueCode, 
  orderId, 
  paymentId, 
  status, 
  cartId 
}: WhatsAppButtonProps) {
  const [items, setItems] = useState<CartSummaryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !cartId) {
      setIsLoading(false)
      return
    }

    const storageKey = `${CART_CACHE_PREFIX}${cartId}`

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setItems([])
        setIsLoading(false)
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setItems([])
        setIsLoading(false)
        return
      }

      const filtered = parsed.filter(isValidItem)
      setItems(filtered)
    } catch (error) {
      console.error('Failed to load cart items for WhatsApp', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [cartId])

  const generateWhatsAppMessage = () => {
    const productsText = items.length > 0 
      ? items.map(item => `• ${item.title} x${item.quantity} - ${toCOP(item.unit_price * item.quantity)}`).join('\n')
      : '• Productos del carrito (detalles en el resumen)'

    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    const totalText = items.length > 0 ? `\n💰 Total: ${toCOP(total)}` : ''

    return `Hola! Mi código de compra es: ${uniqueCode}

📋 Detalles de la compra:
Orden: ${orderId}
Pago: ${paymentId}
Estado: ${status}

📦 Productos comprados:
${productsText}${totalText}

¿Podemos coordinar el envío?`
  }

  const whatsappMessage = generateWhatsAppMessage()
  const whatsappLink = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="sm:w-auto"
    >
      <Button className="w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-600">
        {isLoading ? 'Cargando...' : 'Contactar por WhatsApp'}
      </Button>
    </a>
  )
}
