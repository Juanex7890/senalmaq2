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
(async () => {
  const snapshot = await getDocs(collection(db, 'products'));
  const product = snapshot.docs.find(doc => doc.data().name === 'Jack A2B');
  if (product) {
    console.log(product.id, product.data());
  } else {
    console.log('Product not found');
  }
})();
