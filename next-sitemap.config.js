/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://senalmaq.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    const result = []

    // Add category pages
    try {
      const { getCategories } = await import('./src/lib/actions/categories')
      const categories = await getCategories()
      
      categories.forEach((category) => {
        result.push({
          loc: `/categoria/${category.slug}`,
          lastmod: category.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
        })
      })
    } catch (error) {
      console.warn('Could not fetch categories for sitemap:', error.message)
    }

    // Add product pages
    try {
      const { getProducts } = await import('./src/lib/actions/products')
      const { products } = await getProducts({}, { page: 1, limit: 1000 })
      
      products.forEach((product) => {
        result.push({
          loc: `/producto/${product.slug}`,
          lastmod: product.updatedAt.toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
        })
      })
    } catch (error) {
      console.warn('Could not fetch products for sitemap:', error.message)
    }

    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://senalmaq.com'}/sitemap.xml`,
    ],
  },
}
