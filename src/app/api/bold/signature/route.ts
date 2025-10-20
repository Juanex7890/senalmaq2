import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const signatureSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1, 'orderId is required'),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'amount must be a number without separators'),
  currency: z
    .string()
    .trim()
    .transform(value => value.toUpperCase())
    .refine(value => value === 'COP' || value === 'USD', {
      message: 'currency must be COP or USD',
    }),
})

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secretKey = process.env.BOLD_SECRET_KEY

  if (!secretKey) {
    console.error('BOLD_SECRET_KEY is not configured')
    return NextResponse.json(
      { error: 'Bold configuration is missing' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  let payload: z.infer<typeof signatureSchema>

  try {
    const json = await request.json()
    payload = signatureSchema.parse(json)
  } catch (error) {
    console.error('Invalid signature payload', error)
    return NextResponse.json(
      { error: 'Solicitud inválida' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  const amountNumber = Number.parseFloat(payload.amount)
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return NextResponse.json(
      { error: 'amount must be greater than zero' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  const amountString =
    Number.isInteger(amountNumber) && !payload.amount.includes('.')
      ? String(Math.trunc(amountNumber))
      : payload.amount

  const signatureBase = `${payload.orderId}${amountString}${payload.currency}${secretKey}`
  const signature = createHash('sha256').update(signatureBase).digest('hex')

  return NextResponse.json(
    { signature, amount: amountString, currency: payload.currency },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
