import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { generateSlug, createSearchTokens } from '../src/lib/utils'

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
})

const db = getFirestore(app)

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...')

    // 1. Migrate Categories
    console.log('📁 Migrating categories...')
    const categoriesSnapshot = await db.collection('categories').get()
    
    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data()
      const updates: any = {
        slug: generateSlug(data.name),
        description: data.description || '',
        heroImagePath: data.heroImagePath || data.icon || '', // Use icon as fallback
        position: data.position || 0,
        active: data.active !== false, // Default to true
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date(),
      }

      // Only update if needed
      const needsUpdate = !data.slug || !data.active !== undefined
      if (needsUpdate) {
        await doc.ref.update(updates)
        console.log(`✅ Updated category: ${data.name}`)
      }
    }

    // 2. Migrate Products
    console.log('📦 Migrating products...')
    const productsSnapshot = await db.collection('products').get()
    
    for (const doc of productsSnapshot.docs) {
      const data = doc.data()
      
      // Find category by name to get categoryId
      let categoryId = ''
      if (data.category) {
        const categoryQuery = await db
          .collection('categories')
          .where('name', '==', data.category)
          .get()
        
        if (!categoryQuery.empty) {
          categoryId = categoryQuery.docs[0].id
        }
      }

      const updates: any = {
        slug: data.slug || generateSlug(data.name),
        description: data.description || '',
        price: data.price || 0,
        compareAtPrice: data.compareAtPrice || null,
        brand: data.brand || '',
        sku: data.sku || '',
        categoryId: categoryId,
        imagePaths: Array.isArray(data.images) ? data.images : (data.imagePaths || []),
        specs: data.specs || [],
        active: data.active !== false, // Default to true
        isBestseller: data.bestSeller || data.isBestseller || false,
        isFeatured: data.isFeatured || false,
        search: createSearchTokens(`${data.name} ${data.description || ''}`),
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date(),
      }

      // Only update if needed
      const needsUpdate = !data.slug || !data.categoryId || !data.search
      if (needsUpdate) {
        await doc.ref.update(updates)
        console.log(`✅ Updated product: ${data.name}`)
      }
    }

    // 3. Migrate Settings
    console.log('⚙️ Migrating settings...')
    const settingsDoc = await db.collection('settings').doc('social').get()
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data()
      const siteMedia = {
        heroHeadline: 'Máquinas de Coser de Calidad Profesional',
        heroSub: 'Descubre nuestra amplia gama de máquinas de coser industriales y para hogar. Calidad, garantía y servicio técnico especializado.',
        youtubeMainId: data?.videoId || '',
        youtubeShortIds: data?.shorts || [],
        instagramUrl: data?.instagram || '',
        youtubeUrl: data?.youtube || '',
        whatsappUrl: data?.whatsapp || '',
      }

      await db.collection('site_media').doc('config').set(siteMedia)
      console.log('✅ Updated site media configuration')
    }

    console.log('🎉 Data migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Categories processed: ${categoriesSnapshot.size}`)
    console.log(`- Products processed: ${productsSnapshot.size}`)
    console.log('- Settings migrated to site_media')

  } catch (error) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  }
}

// Run the migration
migrateData()
