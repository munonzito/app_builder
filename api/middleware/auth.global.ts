import { useAuthState } from '~/composables/useAuthState'
import useUser from '~/composables/useUser'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useUser()
  const { isAuthReady, waitForAuthReady } = useAuthState()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/preview/')

  // On server, use the user from context
  if (import.meta.server) {
    if (!user.value && !isPublicRoute) {
      return navigateTo('/login')
    }
    if (user.value && to.path === '/login') {
      return navigateTo('/home')
    }
    return
  }

  // On client, wait for auth to be ready
  if (!isAuthReady.value) {
    await waitForAuthReady()
  }

  if (!user.value && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (user.value && to.path === '/login') {
    return navigateTo('/home')
  }
})
