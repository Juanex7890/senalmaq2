'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, ShoppingCart, AlertCircle } from 'lucide-react'

interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export function SmoothToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail
      const id = Math.random().toString(36).substr(2, 9)
      
      setToasts(prev => [...prev, { id, message, type, duration }])
    }

    window.addEventListener('showToast', handleShowToast as EventListener)
    
    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'info':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-green-50 border-green-200 text-green-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          getIcon={getIcon}
          getStyles={getStyles}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
  getIcon: (type: string) => React.ReactNode
  getStyles: (type: string) => string
}

function ToastItem({ toast, onRemove, getIcon, getStyles }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto remove
    const removeTimer = setTimeout(() => {
      handleClose()
    }, toast.duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onRemove(toast.id)
    }, 300)
  }

  return (
    <div
      className={`
        max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${getStyles(toast.type)}
        border rounded-lg shadow-lg p-4
        flex items-center space-x-3
        backdrop-blur-sm
      `}
    >
      <div className="flex-shrink-0">
        {getIcon(toast.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
