'use client'

import { SimpleSlider } from '@/components/ui/simple-slider'

interface HomeShortsSectionProps {
  youtubeShortIds: string[]
  youtubeUrl?: string
}

export function HomeShortsSection({ youtubeShortIds, youtubeUrl }: HomeShortsSectionProps) {
  if (!youtubeShortIds.length) {
    return null
  }

  return (
    <section className="py-6 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-end justify-between mb-2">
          <h3 className="text-lg font-extrabold text-green-800">Shorts</h3>
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-green-700 text-sm hover:underline"
            >
              Ver canal +
            </a>
          )}
        </div>

        <SimpleSlider
          itemWidth={260}
          gap={20}
          autoPlay={false}
          className="max-w-7xl mx-auto"
        >
          {youtubeShortIds.slice(0, 6).map((videoId) => (
            <div
              key={videoId}
              className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow border border-green-100 p-2"
            >
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl bg-black aspect-[9/16]">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&rel=0&playsinline=1`}
                    title={`Short ${videoId}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          ))}
        </SimpleSlider>
      </div>
    </section>
  )
}
