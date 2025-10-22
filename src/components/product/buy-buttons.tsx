'use client'

import { useState } from 'react'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { PriceOrConsult } from '@/components/PriceOrConsult'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface BuyButtonsProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  whatsappUrl?: string | null
}

export function BuyButtons({ product, onAddToCart, whatsappUrl }: BuyButtonsProps) {
  const [quantity, setQuantity] = useState(1)

  const consultRequired = Boolean(product.consultRequired)
  const discount =
    !consultRequired && product.compareAtPrice
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!Number.isNaN(num) && num > 0) {
      setQuantity(num)
    }
  }

  const handleAddToCart = () => {
    if (consultRequired) {
      return
    }
    onAddToCart(product, quantity)
  }

  const whatsappLink = buildWhatsAppLink(product, { whatsappUrl })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <PriceOrConsult
          product={product}
          whatsappUrl={whatsappUrl}
          layout={consultRequired ? 'stack' : 'inline'}
          className="space-y-2"
          priceClassName="text-3xl font-bold text-gray-900"
          comparePriceClassName="text-xl text-gray-500 line-through"
          consultationLabelClassName="text-2xl font-semibold text-green-700"
          buttonClassName="w-full sm:w-auto justify-center"
        />
        {!consultRequired && discount > 0 && (
          <Badge variant="destructive" size="lg">
            -{discount}%
          </Badge>
        )}
        {product.sku && (
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        )}
      </div>

      {!consultRequired ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700"
              >
                Cantidad:
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => handleQuantityChange(event.target.value)}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 h-12 text-lg"
              disabled={!product.active}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.active ? 'Agregar al carrito' : 'No disponible'}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            onClick={() => {
              if (whatsappLink) {
                window.open(whatsappLink, '_blank')
                return
              }

              window.dispatchEvent(
                new CustomEvent('showToast', {
                  detail: {
                    message:
                      'Configura NEXT_PUBLIC_WHATSAPP_NUMBER para habilitar este botón.',
                    type: 'error',
                    duration: 3000,
                  },
                }),
              )
            }}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contactar con un asesor
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Truck className="h-5 w-5 text-primary-500" />
          <span>Envios a toda colombia</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-5 w-5 text-primary-500" />
          <span>Garantia</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <RotateCcw className="h-5 w-5 text-primary-500" />
          <span>Devoluciones</span>
        </div>
      </div>
    </div>
  )
}
