import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

let app: App | null = null

const useEmulators = process.env.USE_FIREBASE_EMULATOR === 'true'

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  if (useEmulators) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199'

    app = initializeApp({ projectId: 'demo-project' })
  } else {
    const config = useRuntimeConfig()
    app = initializeApp({
      credential: cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n'),
      }),
    })
  }

  return app
}

export const firebaseApp = initializeFirebaseAdmin()
export const firebaseAuth: Auth = getAuth(firebaseApp)
export const firestoreDb = getFirestore(firebaseApp)
export const firebaseStorage = getStorage(firebaseApp)

// Backwards compatibility exports
export function getFirebaseFirestore() {
  return firestoreDb
}

export function getFirebaseStorage() {
  return firebaseStorage
}

export function getFirebaseAuth() {
  return firebaseAuth
}
