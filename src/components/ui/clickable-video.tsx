'use client'

import { useState } from 'react'

interface ClickableVideoProps {
  videoId: string
  title: string
  className?: string
  aspectRatio?: string
}

export function ClickableVideo({ 
  videoId, 
  title, 
  className = '',
  aspectRatio = 'aspect-[9/16]'
}: ClickableVideoProps) {
  const [isInteractive, setIsInteractive] = useState(false)

  const handleClick = () => {
    setIsInteractive(true)
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`${aspectRatio} bg-black rounded-xl overflow-hidden`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
          className={`absolute inset-0 w-full h-full ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {!isInteractive && (
          <button
            onClick={handleClick}
            className="absolute inset-0 grid place-content-center text-white/95 text-sm font-semibold bg-black/30"
          >
            Toca para reproducir
          </button>
        )}
      </div>
    </div>
  )
}
