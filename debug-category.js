// Simple debug script to check category data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function debugData() {
  try {
    console.log('🔍 Debugging Firebase data...\n');
    
    // Get categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log('📁 Categories:');
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id}) - slug: ${data.slug || 'NO SLUG'}`);
    });
    
    // Get products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.log('\n📦 Products:');
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} - categoryId: ${data.categoryId || 'NO CATEGORY ID'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugData();
