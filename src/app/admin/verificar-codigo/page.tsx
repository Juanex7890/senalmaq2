'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Search, Copy, ExternalLink } from 'lucide-react'

interface VerificationResult {
  code: string
  isValid: boolean
  orderId?: string
  paymentId?: string
  status?: string
  products?: Array<{
    name: string
    quantity: number
    price: number
  }>
  total?: number
  timestamp?: string
}

export default function VerificarCodigoPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulación de base de datos de códigos (en producción esto vendría de una API)
  const mockCodes = [
    {
      code: 'SENAL-ABC123-XYZ789',
      orderId: 'a4ef0371-235e-42fd-a889-f3f74858373c',
      paymentId: '129347413077',
      status: 'Approved',
      products: [
        { name: 'Brother BM 3850', quantity: 1, price: 1210000 }
      ],
      total: 1210000,
      timestamp: '2024-01-15 14:30:00'
    },
    {
      code: 'SENAL-DEF456-UVW123',
      orderId: 'b5fg1482-346f-53ge-b990-g4f85969484d',
      paymentId: '129347413078',
      status: 'Approved',
      products: [
        { name: 'Singer 4432', quantity: 1, price: 850000 },
        { name: 'Repuestos varios', quantity: 3, price: 150000 }
      ],
      total: 1000000,
      timestamp: '2024-01-15 16:45:00'
    }
  ]

  const verifyCode = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const foundCode = mockCodes.find(c => c.code === code.toUpperCase())
    
    if (foundCode) {
      setResult({
        code: foundCode.code,
        isValid: true,
        orderId: foundCode.orderId,
        paymentId: foundCode.paymentId,
        status: foundCode.status,
        products: foundCode.products,
        total: foundCode.total,
        timestamp: foundCode.timestamp
      })
    } else {
      setResult({
        code: code.toUpperCase(),
        isValid: false
      })
    }

    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verificar Código de Compra
        </h1>
        <p className="text-gray-600">
          Ingresa el código que te compartió el cliente para verificar la compra
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Código
          </CardTitle>
          <CardDescription>
            Ingresa el código de compra (ej: SENAL-ABC123-XYZ789)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="SENAL-ABC123-XYZ789"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && verifyCode()}
              className="flex-1"
            />
            <Button 
              onClick={verifyCode} 
              disabled={isLoading || !code.trim()}
              className="px-8"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.isValid ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {result.code}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.code)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Orden</p>
                    <p className="font-mono text-sm font-medium">{result.orderId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pago</p>
                    <p className="font-mono text-sm font-medium">{result.paymentId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge 
                      variant={result.status === 'Approved' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>

                {result.products && result.products.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Productos Comprados</h3>
                    <div className="space-y-2">
                      {result.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <span className="font-medium">{product.name}</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-600">x{product.quantity}</span>
                            <span className="ml-2 font-medium">{formatPrice(product.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(result.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.timestamp && (
                  <div className="text-sm text-gray-500">
                    Fecha de compra: {result.timestamp}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => window.open(`https://wa.me/573001234567?text=Hola! Verifico el código ${result.code} - Orden: ${result.orderId}`, '_blank')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contactar Cliente
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => copyToClipboard(`Código verificado: ${result.code}\nOrden: ${result.orderId}\nPago: ${result.paymentId}\nEstado: ${result.status}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Resumen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Código No Encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  El código <strong>{result.code}</strong> no existe en nuestro sistema.
                </p>
                <p className="text-sm text-gray-500">
                  Verifica que el código esté escrito correctamente o contacta al cliente para confirmar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Instrucciones para la Vendedora</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Pide al cliente que te comparta su código de compra</li>
          <li>• Ingresa el código en el campo de búsqueda</li>
          <li>• Verifica que los datos coincidan con la compra</li>
          <li>• Usa el botón "Contactar Cliente" para coordinar el envío</li>
          <li>• Guarda el resumen para tu control interno</li>
        </ul>
      </div>
    </div>
  )
}
