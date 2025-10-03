'use client'

import { Product } from '@/lib/types'

interface SpecsTableProps {
  product: Product
}

export function SpecsTable({ product }: SpecsTableProps) {
  if (!product.specs || product.specs.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Especificaciones técnicas
      </h3>
      <div className="overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {product.specs.map((spec, index) => (
              <tr key={index} className="hover:bg-gray-100/50">
                <td className="py-3 pr-4 font-medium text-gray-700 w-1/3">
                  {spec.key}
                </td>
                <td className="py-3 pl-4 text-gray-600">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
