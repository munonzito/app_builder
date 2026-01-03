import { firebaseAuth } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Public API routes that don't require authentication
  const publicApiPaths = [
    '/api/auth/sessionLogin',
    '/api/auth/sessionLogout',
    '/api/health',
  ]
  const publicApiPrefixes = [
    '/api/preview/',
    '/api/expo/',
    '/api/snackager/',
  ]

  const isPublicApiRoute = publicApiPaths.includes(path) || 
    publicApiPrefixes.some(prefix => path.startsWith(prefix))

  let user = null

  // Try Bearer token first (for mobile apps and API clients)
  const authHeader = getHeader(event, 'Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7)
    try {
      const decoded = await firebaseAuth.verifyIdToken(idToken)
      user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
      }
    } catch {
      // Invalid token - continue to try session cookie
    }
  }

  // Fall back to session cookie (for web SSR)
  if (!user) {
    const sessionCookie = getCookie(event, 'session')
    if (sessionCookie) {
      try {
        const decoded = await firebaseAuth.verifySessionCookie(sessionCookie, true)
        user = {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
        }
      } catch {
        // Invalid session - clear the cookie
        deleteCookie(event, 'session', { path: '/' })
      }
    }
  }

  event.context.user = user

  // For API routes (except public ones), require authentication
  if (path.startsWith('/api/') && !isPublicApiRoute) {
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Not authenticated',
      })
    }
  }
})
