// Script to fix the data structure in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBi34J-Y5FoNhR48xdwk0saCvsyNJ4TJRM",
  authDomain: "senalmaq-68ae5.firebaseapp.com",
  projectId: "senalmaq-68ae5",
  storageBucket: "senalmaq-68ae5.firebasestorage.app",
  messagingSenderId: "643534078633",
  appId: "1:643534078633:web:016ae37a6aee2aef9a1fb8",
  measurementId: "G-18YHT6B0RQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Function to map product names to category IDs
function getCategoryIdForProduct(productName) {
  const name = productName.toLowerCase();
  
  // Map product names to category IDs based on the debug output
  if (name.includes('fileteadora') || name.includes('overlock')) {
    return 'ZrLe8wtiqPJsLCGsz8Z2'; // FILETEADORAS ELECTRONICAS
  } else if (name.includes('singer')) {
    return 'RqQI260LPjnbi2brgr4z'; // MAQUINAS DE COSER SINGER
  } else if (name.includes('brother')) {
    return '26WopYCAvGfh2GArztMb'; // MAQUINAS DE COSER BROTHER
  } else if (name.includes('cortadora')) {
    return 'AJEpqRkg0uLPJGqceMBO'; // CORTADORA VERTICAL
  } else if (name.includes('plana') || name.includes('plancha')) {
    return 'IicLucOIRoswNNa53CKL'; // PLANCHAS PROFESIONALES
  } else if (name.includes('bordadora')) {
    return 'RtOAhAvGvpVIllE7oq3l'; // BORDADORAS
  } else if (name.includes('lámpara') || name.includes('lampara')) {
    return 'emkYTKu5JIFrYRE59ML3'; // LÁMPARAS
  } else if (name.includes('tijera')) {
    return 'MEsmuYG5L3JgDme7MfC9'; // TIJERAS
  } else if (name.includes('collarin')) {
    return 'CCnXnPKeoLbswILnZeBZ'; // COLLARIN INDUSTRIAL
  } else if (name.includes('motor')) {
    return 'UyLZHghkEKW551QsJIxs'; // MOTORES AHORRADORES
  } else {
    return '4cJIusMYgD9XVj8hi2xs'; // ACCESORIOS VARIOS (default)
  }
}

async function fixDataStructure() {
  try {
    console.log('🔧 Fixing data structure...\n');
    
    // Fix categories - add slugs
    console.log('📁 Fixing categories (adding slugs)...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoryUpdates = [];
    
    for (const docSnapshot of categoriesSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.slug) {
        const slug = generateSlug(data.name);
        categoryUpdates.push({
          id: docSnapshot.id,
          name: data.name,
          slug: slug
        });
        await updateDoc(doc(db, 'categories', docSnapshot.id), { slug });
        console.log(`  ✅ Added slug "${slug}" to category "${data.name}"`);
      }
    }
    
    // Fix products - add categoryId
    console.log('\n📦 Fixing products (adding categoryId)...');
    const productsSnapshot = await getDocs(collection(db, 'products'));
    let productCount = 0;
    
    for (const docSnapshot of productsSnapshot.docs) {
      const data = docSnapshot.data();
      if (!data.categoryId) {
        const categoryId = getCategoryIdForProduct(data.name);
        await updateDoc(doc(db, 'products', docSnapshot.id), { categoryId });
        console.log(`  ✅ Added categoryId "${categoryId}" to product "${data.name}"`);
        productCount++;
      }
    }
    
    console.log(`\n🎉 Data structure fixed!`);
    console.log(`  - Categories updated: ${categoryUpdates.length}`);
    console.log(`  - Products updated: ${productCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing data structure:', error);
  }
}

fixDataStructure();
