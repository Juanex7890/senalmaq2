import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query, where } from 'firebase/firestore'

// Firebase config - you'll need to add your actual config here
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample categories to create if they don't exist
const sampleCategories = [
  {
    name: 'Bordadoras',
    slug: 'bordadoras',
    description: 'Máquinas bordadoras para diseños profesionales',
    position: 1,
    active: true,
  },
  {
    name: 'Máquinas de Coser Singer',
    slug: 'maquinas-de-coser-singer',
    description: 'Máquinas de coser industriales y domésticas de la marca Singer',
    position: 2,
    active: true,
  },
  {
    name: 'Fileteadoras',
    slug: 'fileteadoras',
    description: 'Máquinas fileteadoras para acabados profesionales',
    position: 3,
    active: true,
  },
  {
    name: 'Cortadoras RC-100',
    slug: 'cortadoras-rc-100',
    description: 'Cortadoras industriales RC-100 para corte preciso',
    position: 4,
    active: true,
  },
  {
    name: 'Planchas Industriales',
    slug: 'planchas-industriales',
    description: 'Planchas industriales para acabados profesionales',
    position: 5,
    active: true,
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Accesorios y repuestos para máquinas de coser',
    position: 6,
    active: true,
  },
]

async function fixCategoriesClient() {
  try {
    console.log('🔧 Fixing product-category relationships using client SDK...\n')

    // First, ensure categories exist
    console.log('📁 Creating/updating categories...')
    const categoryIds: { [key: string]: string } = {}
    
    for (const category of sampleCategories) {
      // Check if category exists by slug
      const categoriesRef = collection(db, 'categories')
      const q = query(categoriesRef, where('slug', '==', category.slug))
      const existingCategory = await getDocs(q)

      let categoryId: string

      if (existingCategory.empty) {
        // Create new category
        const docRef = await addDoc(categoriesRef, {
          ...category,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        categoryId = docRef.id
        console.log(`  ✅ Created category: ${category.name}`)
      } else {
        // Update existing category
        categoryId = existingCategory.docs[0].id
        const categoryDoc = doc(db, 'categories', categoryId)
        await updateDoc(categoryDoc, {
          ...category,
          updatedAt: new Date(),
        })
        console.log(`  ✅ Updated category: ${category.name}`)
      }
      
      categoryIds[category.slug] = categoryId
    }

    // Now fix products
    console.log('\n📦 Fixing products...')
    const productsRef = collection(db, 'products')
    const productsSnapshot = await getDocs(productsRef)
    
    if (productsSnapshot.empty) {
      console.log('  ❌ No products found to fix')
      return
    }

    let fixedCount = 0

    for (const docSnapshot of productsSnapshot.docs) {
      const data = docSnapshot.data()
      let categoryId = data.categoryId

      // If no categoryId, try to determine from product name or existing category field
      if (!categoryId) {
        const productName = data.name || ''
        const existingCategory = data.category || ''
        
        // Map based on existing category name or product name
        if (existingCategory.includes('Bordadora') || productName.includes('Bordadora')) {
          categoryId = categoryIds['bordadoras']
        } else if (productName.includes('Singer')) {
          categoryId = categoryIds['maquinas-de-coser-singer']
        } else if (productName.includes('Fileteadora')) {
          categoryId = categoryIds['fileteadoras']
        } else if (productName.includes('Cortadora')) {
          categoryId = categoryIds['cortadoras-rc-100']
        } else if (productName.includes('Plancha')) {
          categoryId = categoryIds['planchas-industriales']
        } else {
          categoryId = categoryIds['accesorios']
        }
      }

      // Update the product with the correct categoryId
      const productDoc = doc(db, 'products', docSnapshot.id)
      await updateDoc(productDoc, {
        categoryId,
        updatedAt: new Date(),
      })

      const categoryName = sampleCategories.find(c => categoryIds[c.slug] === categoryId)?.name || 'Unknown'
      console.log(`  ✅ ${data.name} → ${categoryName}`)
      fixedCount++
    }

    console.log(`\n🎉 Fixed ${fixedCount} products`)

    // Verify the fix
    console.log('\n🔍 Verifying fix...')
    const verifySnapshot = await getDocs(productsRef)
    const productsWithoutCategory = verifySnapshot.docs.filter(doc => !doc.data().categoryId)
    
    if (productsWithoutCategory.length === 0) {
      console.log('  ✅ All products now have valid categoryId')
    } else {
      console.log(`  ⚠️  ${productsWithoutCategory.length} products still without categoryId`)
    }

  } catch (error) {
    console.error('❌ Error fixing categories:', error)
    console.error('Make sure your Firebase config is correct in .env.local')
  }
}

fixCategoriesClient()
