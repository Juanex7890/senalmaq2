'use client'

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
  return (
    <div className={`relative ${className}`}>
      <div className={`relative overflow-hidden rounded-xl bg-black ${aspectRatio}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0&playsinline=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  )
}
