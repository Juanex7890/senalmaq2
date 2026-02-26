'use client'

import dynamic from 'next/dynamic'

interface HomeShortsSectionLazyProps {
  youtubeShortIds: string[]
  youtubeUrl?: string
}

const HomeShortsSection = dynamic(
  () => import('@/components/home/home-shorts-section').then((module) => module.HomeShortsSection),
  {
    ssr: false,
  },
)

export function HomeShortsSectionLazy({ youtubeShortIds, youtubeUrl }: HomeShortsSectionLazyProps) {
  return <HomeShortsSection youtubeShortIds={youtubeShortIds} youtubeUrl={youtubeUrl} />
}
