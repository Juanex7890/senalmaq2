const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

async function setupAdminUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Por favor proporciona un email: node scripts/setup-admin.js admin@example.com');
      process.exit(1);
    }

    console.log(`🔍 Buscando usuario: ${email}`);

    // Get user by email
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`✅ Usuario encontrado: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Usuario no encontrado. Por favor crea el usuario primero en Firebase Console.');
        process.exit(1);
      }
      throw error;
    }

    // Set custom claims
    await auth.setCustomUserClaims(user.uid, { role: 'admin' });
    
    console.log('✅ Rol de administrador asignado correctamente');
    console.log('🎉 El usuario ahora puede acceder al panel de administración');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminUser();
