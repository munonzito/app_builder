import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onIdTokenChanged,
  type Auth,
  type User,
} from 'firebase/auth'
import { useAuthState } from '~/composables/useAuthState'
import useUser from '~/composables/useUser'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let isFirebaseInitialized = false
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const { setAuthReady, setAuthUser } = useAuthState()
  const firebaseUser = useUser()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
  }

  // Check if using emulator (no API key means emulator mode)
  const useEmulator = !firebaseConfig.apiKey

  if (!getApps().length) {
    if (useEmulator) {
      app = initializeApp({ projectId: 'demo-project' })
    } else {
      app = initializeApp(firebaseConfig)
    }
  } else {
    app = getApps()[0]
  }

  auth = getAuth(app)

  if (useEmulator) {
    const { connectAuthEmulator } = await import('firebase/auth')
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    } catch {
      // Already connected
    }
  }

  // Wait for Firebase Auth to be ready before processing
  auth.authStateReady().then(() => {
    console.log('Firebase Auth ready')
    setAuthReady(true)
  })

  // Listen to auth state changes and sync with session cookie
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      try {
        const idToken = await user.getIdToken()
        await $fetch('/api/auth/sessionLogin', {
          method: 'POST',
          body: { idToken },
        })

        // Don't overwrite user data if we already have it from server
        if (!firebaseUser.value) {
          const appUser = {
            uid: user.uid,
            email: user.email ?? undefined,
            name: user.displayName ?? undefined,
          }
          firebaseUser.value = appUser
          setAuthUser(appUser)
        }

        // Auto-refresh token every 5 minutes
        if (tokenRefreshInterval) clearInterval(tokenRefreshInterval)
        tokenRefreshInterval = setInterval(async () => {
          if (auth?.currentUser) {
            const newToken = await auth.currentUser.getIdToken(true)
            await $fetch('/api/auth/sessionLogin', {
              method: 'POST',
              body: { idToken: newToken },
            })
          }
        }, 5 * 60 * 1000)
      } catch (error) {
        console.error('Failed to create session:', error)
        setAuthUser(null)
      }
    } else {
      if (isFirebaseInitialized) {
        try {
          await $fetch('/api/auth/sessionLogout', { method: 'POST' })
        } catch {
          // Ignore logout errors
        }
      }
      firebaseUser.value = null
      setAuthUser(null)
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval)
        tokenRefreshInterval = null
      }
    }

    isFirebaseInitialized = true
  })

  return {
    provide: {
      auth,
      signIn: async (email: string, password: string): Promise<User> => {
        if (!auth) throw new Error('Firebase not initialized')
        const result = await signInWithEmailAndPassword(auth, email, password)
        return result.user
      },
      signUp: async (email: string, password: string, displayName?: string): Promise<User> => {
        if (!auth) throw new Error('Firebase not initialized')
        const result = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName && result.user) {
          await updateProfile(result.user, { displayName })
        }
        return result.user
      },
      signOut: async (): Promise<void> => {
        if (!auth) throw new Error('Firebase not initialized')
        await firebaseSignOut(auth)
      },
      resetPassword: async (email: string): Promise<void> => {
        if (!auth) throw new Error('Firebase not initialized')
        await sendPasswordResetEmail(auth, email)
      },
    },
  }
})
