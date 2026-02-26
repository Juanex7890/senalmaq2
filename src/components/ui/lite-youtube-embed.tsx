'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiteYouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
  aspectRatio?: string
  playLabel?: string
  loadOnVisible?: boolean
  priority?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
  thumbnailSizes?: string
}

function buildEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: '1',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
  })

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

function getThumbnailUrl(videoId: string, quality: 'hqdefault' | 'mqdefault') {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`
}

export function LiteYouTubeEmbed({
  videoId,
  title,
  className,
  aspectRatio = 'aspect-video',
  playLabel = 'Reproducir video',
  loadOnVisible = false,
  priority = false,
  fetchPriority,
  thumbnailSizes = '(max-width: 768px) 100vw, 50vw',
}: LiteYouTubeEmbedProps) {
  const [mountIframe, setMountIframe] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const [thumbnailSrc, setThumbnailSrc] = useState(() => getThumbnailUrl(videoId, 'hqdefault'))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMountIframe(false)
    setAutoplay(false)
    setThumbnailSrc(getThumbnailUrl(videoId, 'hqdefault'))
  }, [videoId])

  useEffect(() => {
    if (!loadOnVisible || mountIframe || !containerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMountIframe(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [loadOnVisible, mountIframe])

  const activate = () => {
    setAutoplay(true)
    setMountIframe(true)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className={cn('relative overflow-hidden rounded-xl bg-black', aspectRatio)}>
        {mountIframe ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={buildEmbedUrl(videoId, autoplay)}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              className="object-cover"
              sizes={thumbnailSizes}
              priority={priority}
              fetchPriority={fetchPriority}
              onError={() => {
                if (thumbnailSrc.includes('hqdefault')) {
                  setThumbnailSrc(getThumbnailUrl(videoId, 'mqdefault'))
                }
              }}
            />
            <button
              type="button"
              onClick={activate}
              className="absolute inset-0 grid place-items-center bg-black/30 text-white transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
              aria-label={playLabel}
            >
              <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold">
                <Play className="h-4 w-4 fill-current" />
                {playLabel}
              </span>
            </button>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 to-white/5" />
          </>
        )}
      </div>
    </div>
  )
}
