import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getBestsellerProducts } from '@/lib/actions/products'
import { getSiteMedia } from '@/lib/actions/media'
import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchBarOverlay } from '@/components/catalog/search-bar-overlay'
import { ProductCardClient } from '@/components/catalog/product-card-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { SimpleSlider } from '@/components/ui/simple-slider'
import { ClickableVideo } from '@/components/ui/clickable-video'
import { 
  Shield, 
  Truck, 
  MessageCircle, 
  Star,
  Play,
  Instagram,
  Youtube
} from 'lucide-react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/utils'
export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Descubre maquinas de coser industriales, repuestos y soporte integral con Senalmaq.',
  openGraph: {
    title: 'Inicio',
    description:
      'Descubre maquinas de coser industriales, repuestos y soporte integral con Senalmaq.',
    images: ['/og-default.jpg'],
  },
  twitter: {
    title: 'Inicio',
    description:
      'Descubre maquinas de coser industriales, repuestos y soporte integral con Senalmaq.',
    images: ['/og-default.jpg'],
  },
}

export const revalidate = 60

async function HomePageContent() {
  let bestsellers: any[] = []
  let siteMedia: any = null
  let categories: any[] = []

  try {
    const [bestsellersResult, siteMediaResult, categoriesResult] = await Promise.allSettled([
      getBestsellerProducts(8),
      getSiteMedia(),
      getCategories(),
    ])

    bestsellers = bestsellersResult.status === 'fulfilled' ? bestsellersResult.value : []
    siteMedia = siteMediaResult.status === 'fulfilled' ? siteMediaResult.value : null
    categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  } catch (error) {
    console.error('Error loading page data:', error)
    // Continue with empty data - the page will still render
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-8 md:py-16">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            {/* Mobile Search Bar - Above Video */}
            <div className="md:hidden mb-4">
              <div className="rounded-2xl bg-white/95 border border-green-100 shadow-lg p-3">
                <SearchBarOverlay placeholder="Buscar productos..." className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* YouTube Video - Left Side */}
              {siteMedia?.youtubeMainId && (
                <div className="relative w-full z-0">
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-transparent hover:border-neutral-200 transition-shadow">
                    <div className="relative w-full aspect-[16/9] md:aspect-[2/1]">
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={getYouTubeEmbedUrl(siteMedia.youtubeMainId)}
                        loading="lazy"
                        title="Senalmaq - Maquinas de Coser"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
              />
            </div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 to-white/5" />
                  </div>
                </div>
              )}

              {/* Follow Us Section - Right Side */}
              <div className="relative z-10 space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
                    Si­guenos
                  </h2>
                  
                  {/* Social Media Buttons */}
                  <div className="space-y-3">
                    <a
                      href={siteMedia?.instagramUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-white border border-pink-200 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors duration-200 outline outline-0 focus-visible:outline-2 focus-visible:outline-pink-600"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="font-medium">Instagram</span>
                    </a>

                    <a
                      href={siteMedia?.youtubeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 outline outline-0 focus-visible:outline-2 focus-visible:outline-red-600"
                    >
                      <Youtube className="h-5 w-5" />
                      <span className="font-medium">YouTube</span>
                    </a>

                    <a
                      href={siteMedia?.tiktokUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 outline outline-0 focus-visible:outline-2 focus-visible:outline-gray-600"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="font-medium">TikTok</span>
                    </a>
              </div>

                  {/* WhatsApp Button */}
                  <div className="pt-2">
                    <a
                      href="https://wa.me/573176693030"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 outline outline-0 focus-visible:outline-2 focus-visible:outline-green-600"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Escri­benos por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Bestsellers Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Las mas vendidas!
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Los productos mas populares entre nuestros clientes
              </p>
            </div>

            {/* Interactive Slider with Navigation */}
            <InfiniteSlider
              itemWidth={320}
              gap={16}
              autoPlay={true}
              autoPlaySpeed={4}
              className="max-w-7xl mx-auto"
            >
              {bestsellers.map((product) => (
                <ProductCardClient key={product.id} product={product} whatsappUrl={siteMedia?.whatsappUrl} />
              ))}
            </InfiniteSlider>
          </div>
        </section>


        {/* YouTube Shorts Section */}
        {siteMedia?.youtubeShortIds && siteMedia.youtubeShortIds.length > 0 && (
          <section className="py-6 bg-white">
            <div className="max-w-screen-xl mx-auto px-4">
              <div className="flex items-end justify-between mb-2">
                <h3 className="text-lg font-extrabold text-green-800">Shorts</h3>
                {siteMedia.youtubeUrl && (
                  <a
                    href={siteMedia.youtubeUrl}
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
                {siteMedia.youtubeShortIds.slice(0, 6).map((videoId: string, index: number) => (
                  <div
                    key={videoId}
                    className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow border border-green-100 p-2"
                  >
                    <ClickableVideo
                      videoId={videoId}
                      title={`Short ${videoId}`}
                    />
                  </div>
                ))}
              </SimpleSlider>
            </div>
          </section>
        )}


        {/* SEO Content */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
              Justo Pastor Calderón empezó en el mundo de las máquinas de coser a los 16 años, cuando ingresó a una ensambladora. Al principio hacía tareas básicas como contar tornillos —y no le iba muy bien—, pero una importación desde Brasil le abrió la puerta a trabajar en bodega. Desde allí recorrió distintas áreas de la empresa y aprendió a fondo el funcionamiento de las máquinas, acumulando una experiencia que, para 2015, ya sumaba 41 años.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
              Con el impulso de la mujer que luego sería su esposa, decidió independizarse y fundó en Suba el taller SenalMaq (Servicio Nacional de Máquinas de Coser), que llevaba 25 años en funcionamiento. Empezaron vendiendo una máquina guardada y, poco a poco, añadieron repuestos, hilos, cremalleras y otros insumos de costura, convirtiéndose en un negocio integral de venta y reparación para todas las marcas y modelos.
              </p>
              <p className="text-gray-600 leading-relaxed">
              Su familia también creció dentro del oficio: cuatro de sus cinco hijos trabajan con él, además de su esposa. A los 57 años, Calderón afirma que su amor por estas máquinas es “para siempre”; con ellas sacó adelante a su hogar y quiere que el negocio sea herencia para hijos y nietos. La ironía: aunque ha dedicado medio siglo a repararlas, nunca ha tenido una máquina de coser en su casa.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer 
        siteMedia={siteMedia ?? undefined} 
        contactInfo={{
          phone: '+601 6976689',
          whatsapp1: '+57 317 669 3030',
          whatsapp2: '+57 318 296 9963',
          email: 'cosersenalmaq@gmail.com',
          address: 'Cra 108a # 139-05 / Calle 139 # 103f 13, Suba, Bogota, Colombia.'
        }}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-20">
            <div className="h-96 bg-gray-200 rounded-2xl mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
