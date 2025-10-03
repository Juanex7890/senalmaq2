import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
}

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error('❌ Missing Firebase Admin credentials')
  console.error('Please set up your .env.local file with Firebase credentials')
  process.exit(1)
}

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

const db = getFirestore(app)

// Sample categories to create if they don't exist
const sampleCategories = [
  {
    name: 'Máquinas de Coser Singer',
    slug: 'maquinas-de-coser-singer',
    description: 'Máquinas de coser industriales y domésticas de la marca Singer',
    position: 1,
    active: true,
  },
  {
    name: 'Fileteadoras',
    slug: 'fileteadoras',
    description: 'Máquinas fileteadoras para acabados profesionales',
    position: 2,
    active: true,
  },
  {
    name: 'Cortadoras RC-100',
    slug: 'cortadoras-rc-100',
    description: 'Cortadoras industriales RC-100 para corte preciso',
    position: 3,
    active: true,
  },
  {
    name: 'Planchas Industriales',
    slug: 'planchas-industriales',
    description: 'Planchas industriales para acabados profesionales',
    position: 4,
    active: true,
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Accesorios y repuestos para máquinas de coser',
    position: 5,
    active: true,
  },
]

async function fixCategories() {
  try {
    console.log('🔧 Fixing product-category relationships...\n')

    // First, ensure categories exist
    console.log('📁 Creating/updating categories...')
    const categoryIds: { [key: string]: string } = {}
    
    for (const category of sampleCategories) {
      // Check if category exists by slug
      const existingCategory = await db
        .collection('categories')
        .where('slug', '==', category.slug)
        .get()

      let categoryId: string

      if (existingCategory.empty) {
        // Create new category
        const docRef = await db.collection('categories').add({
          ...category,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        categoryId = docRef.id
        console.log(`  ✅ Created category: ${category.name}`)
      } else {
        // Update existing category
        categoryId = existingCategory.docs[0].id
        await db.collection('categories').doc(categoryId).update({
          ...category,
          updatedAt: new Date(),
        })
        console.log(`  ✅ Updated category: ${category.name}`)
      }
      
      categoryIds[category.slug] = categoryId
    }

    // Now fix products
    console.log('\n📦 Fixing products...')
    const productsSnapshot = await db.collection('products').get()
    
    if (productsSnapshot.empty) {
      console.log('  ❌ No products found to fix')
      return
    }

    let fixedCount = 0
    const batch = db.batch()

    productsSnapshot.forEach((doc) => {
      const data = doc.data()
      let categoryId = data.categoryId

      // If no categoryId, try to determine from product name
      if (!categoryId) {
        if (data.name.includes('Singer')) {
          categoryId = categoryIds['maquinas-de-coser-singer']
        } else if (data.name.includes('Fileteadora')) {
          categoryId = categoryIds['fileteadoras']
        } else if (data.name.includes('Cortadora')) {
          categoryId = categoryIds['cortadoras-rc-100']
        } else if (data.name.includes('Plancha')) {
          categoryId = categoryIds['planchas-industriales']
        } else {
          categoryId = categoryIds['accesorios']
        }
      }

      // Update the product with the correct categoryId
      batch.update(doc.ref, {
        categoryId,
        updatedAt: new Date(),
      })

      const categoryName = sampleCategories.find(c => categoryIds[c.slug] === categoryId)?.name || 'Unknown'
      console.log(`  ✅ ${data.name} → ${categoryName}`)
      fixedCount++
    })

    // Commit all updates
    await batch.commit()
    console.log(`\n🎉 Fixed ${fixedCount} products`)

    // Verify the fix
    console.log('\n🔍 Verifying fix...')
    const verifySnapshot = await db.collection('products').get()
    const productsWithoutCategory = verifySnapshot.docs.filter(doc => !doc.data().categoryId)
    
    if (productsWithoutCategory.length === 0) {
      console.log('  ✅ All products now have valid categoryId')
    } else {
      console.log(`  ⚠️  ${productsWithoutCategory.length} products still without categoryId`)
    }

  } catch (error) {
    console.error('❌ Error fixing categories:', error)
  }
}

fixCategories()
