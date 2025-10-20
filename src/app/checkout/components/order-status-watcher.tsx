'use client'

import { useEffect, useRef } from 'react'

import { CART_UPDATED_EVENT, resetCart } from '@/lib/cart'

const CART_CACHE_PREFIX = 'checkout:cart:'

type OrderStatusWatcherProps = {
  orderId: string
  cartId?: string
}

export function OrderStatusWatcher({ orderId, cartId }: OrderStatusWatcherProps) {
  const hasClearedRef = useRef(false)

  useEffect(() => {
    if (!orderId || hasClearedRef.current) {
      return
    }

    let aborted = false

    const verifyOrderStatus = async () => {
      try {
        const response = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as {
          status?: string
        }

        if (aborted || data?.status !== 'paid') {
          return
        }

        resetCart()

        if (cartId) {
          try {
            localStorage.removeItem(`${CART_CACHE_PREFIX}${cartId}`)
          } catch (storageError) {
            console.error('Failed to clear cached cart', storageError)
          }
        }

        hasClearedRef.current = true

        window.dispatchEvent(
          new CustomEvent(CART_UPDATED_EVENT, {
            detail: { cart: [] },
          })
        )

        if (cleanupTimer) {
          window.clearInterval(cleanupTimer)
        }
      } catch (error) {
        console.error('Unable to verify order status', error)
      }
    }

    const cleanupTimer = window.setInterval(() => {
      if (!hasClearedRef.current && !aborted) {
        void verifyOrderStatus()
      }
    }, 5000)

    void verifyOrderStatus()

    return () => {
      aborted = true
      window.clearInterval(cleanupTimer)
    }
  }, [orderId, cartId])

  return null
}
