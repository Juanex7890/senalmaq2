import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
})

const db = getFirestore(app)
const storage = getStorage(app)

const sampleCategories = [
  {
    name: 'Máquinas de Coser Singer',
    slug: 'maquinas-de-coser-singer',
    description: 'Máquinas de coser Singer para uso doméstico e industrial. Calidad y durabilidad garantizadas.',
    position: 1,
    active: true,
  },
  {
    name: 'Fileteadoras',
    slug: 'fileteadoras',
    description: 'Fileteadoras industriales para acabados profesionales en costura.',
    position: 2,
    active: true,
  },
  {
    name: 'Cortadoras RC-100',
    slug: 'cortadoras-rc-100',
    description: 'Cortadoras industriales RC-100 para corte preciso de telas.',
    position: 3,
    active: true,
  },
  {
    name: 'Planchas Industriales',
    slug: 'planchas-industriales',
    description: 'Planchas industriales de alta calidad para acabados profesionales.',
    position: 4,
    active: true,
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Accesorios y repuestos para máquinas de coser.',
    position: 5,
    active: true,
  },
]

const sampleProducts = [
  {
    name: 'Máquina de Coser Singer 4423',
    slug: 'maquina-coser-singer-4423',
    description: 'Máquina de coser Singer 4423 con 23 puntadas incorporadas. Ideal para principiantes y uso doméstico. Incluye pedal, bobinas y manual de instrucciones.',
    price: 299.99,
    compareAtPrice: 349.99,
    brand: 'Singer',
    sku: 'SING-4423',
    categoryId: '', // Will be set after categories are created
    imagePaths: ['product-images/singer-4423-1.jpg', 'product-images/singer-4423-2.jpg'],
    specs: [
      { key: 'Puntadas', value: '23' },
      { key: 'Velocidad máxima', value: '1100 puntadas/minuto' },
      { key: 'Peso', value: '6.2 kg' },
      { key: 'Garantía', value: '2 años' },
    ],
    active: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    name: 'Fileteadora Industrial Juki MO-6814',
    slug: 'fileteadora-industrial-juki-mo-6814',
    description: 'Fileteadora industrial Juki MO-6814 de alta velocidad. Perfecta para talleres de confección y uso profesional intensivo.',
    price: 1299.99,
    brand: 'Juki',
    sku: 'JUKI-MO-6814',
    categoryId: '', // Will be set after categories are created
    imagePaths: ['product-images/juki-mo-6814-1.jpg', 'product-images/juki-mo-6814-2.jpg'],
    specs: [
      { key: 'Velocidad máxima', value: '6000 puntadas/minuto' },
      { key: 'Peso', value: '28 kg' },
      { key: 'Motor', value: '1/2 HP' },
      { key: 'Garantía', value: '3 años' },
    ],
    active: true,
    isBestseller: true,
    isFeatured: false,
  },
  {
    name: 'Cortadora RC-100 Industrial',
    slug: 'cortadora-rc-100-industrial',
    description: 'Cortadora RC-100 industrial para corte preciso de telas. Ideal para talleres de confección y uso profesional.',
    price: 899.99,
    compareAtPrice: 1099.99,
    brand: 'RC-100',
    sku: 'RC-100-IND',
    categoryId: '', // Will be set after categories are created
    imagePaths: ['product-images/rc-100-1.jpg', 'product-images/rc-100-2.jpg'],
    specs: [
      { key: 'Ancho de corte', value: '100 cm' },
      { key: 'Peso', value: '45 kg' },
      { key: 'Motor', value: '1 HP' },
      { key: 'Garantía', value: '2 años' },
    ],
    active: true,
    isBestseller: false,
    isFeatured: true,
  },
  {
    name: 'Plancha Industrial Vapor 3000W',
    slug: 'plancha-industrial-vapor-3000w',
    description: 'Plancha industrial de vapor de 3000W. Perfecta para acabados profesionales en talleres de confección.',
    price: 199.99,
    brand: 'Industrial Pro',
    sku: 'IP-VAPOR-3000',
    categoryId: '', // Will be set after categories are created
    imagePaths: ['product-images/plancha-vapor-1.jpg', 'product-images/plancha-vapor-2.jpg'],
    specs: [
      { key: 'Potencia', value: '3000W' },
      { key: 'Peso', value: '2.5 kg' },
      { key: 'Temperatura máxima', value: '200°C' },
      { key: 'Garantía', value: '1 año' },
    ],
    active: true,
    isBestseller: false,
    isFeatured: false,
  },
  {
    name: 'Kit de Agujas Universal',
    slug: 'kit-agujas-universal',
    description: 'Kit de agujas universales para máquinas de coser. Incluye diferentes tamaños y tipos de agujas.',
    price: 24.99,
    brand: 'Universal',
    sku: 'UNI-AGUJAS-KIT',
    categoryId: '', // Will be set after categories are created
    imagePaths: ['product-images/kit-agujas-1.jpg'],
    specs: [
      { key: 'Cantidad', value: '50 agujas' },
      { key: 'Tamaños', value: '60/8, 70/10, 80/12, 90/14' },
      { key: 'Material', value: 'Acero inoxidable' },
      { key: 'Compatible', value: 'Todas las marcas' },
    ],
    active: true,
    isBestseller: false,
    isFeatured: false,
  },
]

const siteMedia = {
  heroHeadline: 'Máquinas de Coser de Calidad Profesional',
  heroSub: 'Descubre nuestra amplia gama de máquinas de coser industriales y para hogar. Calidad, garantía y servicio técnico especializado.',
  youtubeMainId: 'dQw4w9WgXcQ', // Replace with actual video ID
  youtubeShortIds: ['dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'dQw4w9WgXcQ'], // Replace with actual video IDs
  instagramUrl: 'https://instagram.com/senalmaq',
  youtubeUrl: 'https://youtube.com/@senalmaq',
  whatsappUrl: 'https://wa.me/34123456789',
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')

    // Create categories
    console.log('📁 Creating categories...')
    const categoryIds: { [key: string]: string } = {}
    
    for (const category of sampleCategories) {
      const docRef = await db.collection('categories').add({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      categoryIds[category.slug] = docRef.id
      console.log(`✅ Created category: ${category.name}`)
    }

    // Create products
    console.log('📦 Creating products...')
    for (const product of sampleProducts) {
      // Find the category ID for this product
      let categoryId = ''
      if (product.name.includes('Singer')) {
        categoryId = categoryIds['maquinas-de-coser-singer']
      } else if (product.name.includes('Fileteadora')) {
        categoryId = categoryIds['fileteadoras']
      } else if (product.name.includes('Cortadora')) {
        categoryId = categoryIds['cortadoras-rc-100']
      } else if (product.name.includes('Plancha')) {
        categoryId = categoryIds['planchas-industriales']
      } else {
        categoryId = categoryIds['accesorios']
      }

      const searchTokens = `${product.name} ${product.description}`.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      await db.collection('products').add({
        ...product,
        categoryId,
        search: searchTokens,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`✅ Created product: ${product.name}`)
    }

    // Create site media
    console.log('🎬 Creating site media...')
    await db.collection('site_media').doc('config').set(siteMedia)
    console.log('✅ Created site media configuration')

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Categories created: ${sampleCategories.length}`)
    console.log(`- Products created: ${sampleProducts.length}`)
    console.log('- Site media configured')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
