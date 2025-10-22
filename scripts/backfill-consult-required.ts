import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const requiredEnv = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
] as const

const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key]?.length === 0)

if (missing.length > 0) {
  console.error('Faltan variables de entorno requeridas para Firebase Admin:', missing.join(', '))
  process.exit(1)
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig)
const db = getFirestore(app)

async function backfillConsultFlag() {
  console.log('Iniciando backfill de consultRequired...')

  const snapshot = await db.collection('products').get()
  if (snapshot.empty) {
    console.log('No se encontraron productos.')
    return
  }

let processed = 0
let updated = 0
let batch = db.batch()
let pendingWrites = 0

  for (const doc of snapshot.docs) {
    processed += 1
    const data = doc.data()

    if (typeof data.consultRequired === 'boolean') {
      continue
    }

    batch.update(doc.ref, { consultRequired: false })
    updated += 1
    pendingWrites += 1

    if (pendingWrites >= 400) {
      await batch.commit()
      batch = db.batch()
      pendingWrites = 0
      console.log(`Se estableció consultRequired en ${updated} productos hasta ahora...`)
    }
  }

  if (pendingWrites > 0) {
    await batch.commit()
  }

  console.log(`Backfill completado. Procesados: ${processed}, actualizados: ${updated}.`)
}

backfillConsultFlag()
  .then(() => {
    console.log('Proceso finalizado correctamente.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error durante el backfill de consultRequired:', error)
    process.exit(1)
  })
