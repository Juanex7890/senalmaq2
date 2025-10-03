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

async function checkData() {
  try {
    console.log('🔍 Checking Firebase data...\n')

    // Check categories
    console.log('📁 Categories:')
    const categoriesSnapshot = await db.collection('categories').get()
    const categories: any[] = []
    
    if (categoriesSnapshot.empty) {
      console.log('  ❌ No categories found')
    } else {
      categoriesSnapshot.forEach(doc => {
        const data = doc.data()
        categories.push({ id: doc.id, ...data })
        console.log(`  ✅ ${data.name} (${doc.id}) - Active: ${data.active}`)
      })
    }

    console.log(`\n📦 Products:`)

    // Check products
    const productsSnapshot = await db.collection('products').get()
    const products: any[] = []
    
    if (productsSnapshot.empty) {
      console.log('  ❌ No products found')
    } else {
      productsSnapshot.forEach(doc => {
        const data = doc.data()
        products.push({ id: doc.id, ...data })
        const categoryName = categories.find(c => c.id === data.categoryId)?.name || 'UNKNOWN CATEGORY'
        console.log(`  ✅ ${data.name} - Category: ${categoryName} (${data.categoryId || 'NO CATEGORY ID'})`)
      })
    }

    // Check for products without categories
    const productsWithoutCategory = products.filter(p => !p.categoryId)
    if (productsWithoutCategory.length > 0) {
      console.log(`\n⚠️  Found ${productsWithoutCategory.length} products without categoryId:`)
      productsWithoutCategory.forEach(p => {
        console.log(`  - ${p.name} (${p.id})`)
      })
    }

    // Check for products with invalid categoryId
    const productsWithInvalidCategory = products.filter(p => 
      p.categoryId && !categories.find(c => c.id === p.categoryId)
    )
    if (productsWithInvalidCategory.length > 0) {
      console.log(`\n⚠️  Found ${productsWithInvalidCategory.length} products with invalid categoryId:`)
      productsWithInvalidCategory.forEach(p => {
        console.log(`  - ${p.name} (${p.id}) - categoryId: ${p.categoryId}`)
      })
    }

    console.log(`\n📊 Summary:`)
    console.log(`  Categories: ${categories.length}`)
    console.log(`  Products: ${products.length}`)
    console.log(`  Products without category: ${productsWithoutCategory.length}`)
    console.log(`  Products with invalid category: ${productsWithInvalidCategory.length}`)

  } catch (error) {
    console.error('❌ Error checking data:', error)
  }
}

checkData()
