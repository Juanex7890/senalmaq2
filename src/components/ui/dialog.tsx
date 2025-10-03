'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DialogContentProps {
  className?: string
  children: ReactNode
}

interface DialogHeaderProps {
  children: ReactNode
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogDescriptionProps {
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <>{children}</>
}

export function DialogContent({ className, children }: DialogContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => {/* Close dialog */}}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg',
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  )
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return (
    <p className="text-sm text-gray-500">
      {children}
    </p>
  )
}

export function DialogClose({ children, ...props }: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </button>
  )
}
