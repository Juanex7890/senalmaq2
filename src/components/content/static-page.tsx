import type { ReactNode } from 'react'

import { getCategories } from '@/lib/actions/categories'
import { getSiteMedia } from '@/lib/actions/media'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface StaticPageProps {
  title: string
  description?: string
  children: ReactNode
}

export async function StaticPage({ title, description, children }: StaticPageProps) {
  const [categoriesResult, siteMediaResult] = await Promise.allSettled([
    getCategories(),
    getSiteMedia(),
  ])
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  const siteMedia = siteMediaResult.status === 'fulfilled' ? siteMediaResult.value : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />

      <main className="py-10 md:py-14">
        <article className="container mx-auto max-w-4xl px-4">
          <header className="mb-10 border-b border-gray-200 pb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-600">
              Senalmaq SAS
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-lg leading-8 text-gray-600">
                {description}
              </p>
            )}
          </header>

          <div className="space-y-8 text-gray-700">{children}</div>
        </article>
      </main>

      <Footer siteMedia={siteMedia ?? undefined} />
    </div>
  )
}

export function ContentSection({ children }: { children: ReactNode }) {
  return <section className="space-y-4">{children}</section>
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{children}</h2>
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-xl font-semibold text-gray-900">{children}</h3>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="leading-8 text-gray-700">{children}</p>
}

export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 leading-8 text-gray-700">{children}</ul>
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-6 leading-8 text-gray-700">{children}</ol>
}

export function ContactBlock() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="font-semibold text-gray-900">Senalmaq SAS</p>
      <p className="mt-2 text-gray-700">Cra 108a #139-05, Bogota, Colombia</p>
      <p className="text-gray-700">+57 317 669 1335</p>
      <p className="text-gray-700">cosersenalmaq@gmail.com</p>
    </div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50 p-5 text-primary-900">
      {children}
    </div>
  )
}
