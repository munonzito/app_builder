import { ref, readonly } from 'vue'
import type { AppUser } from '~/types/user'

const isAuthReady = ref(false)
const authUser = ref<AppUser | null>(null)

export const useAuthState = () => {
  const setAuthReady = (ready: boolean) => {
    isAuthReady.value = ready
  }

  const setAuthUser = (user: AppUser | null) => {
    authUser.value = user
  }

  const waitForAuthReady = (): Promise<void> => {
    return new Promise((resolve) => {
      if (isAuthReady.value) {
        resolve()
        return
      }
      const unwatch = watch(isAuthReady, (ready) => {
        if (ready) {
          unwatch()
          resolve()
        }
      })
    })
  }

  return {
    isAuthReady: readonly(isAuthReady),
    authUser: readonly(authUser),
    setAuthReady,
    setAuthUser,
    waitForAuthReady,
  }
}
