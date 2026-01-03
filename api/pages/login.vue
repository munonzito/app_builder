<script setup lang="ts">
import { useAuthState } from '~/composables/useAuthState'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { $signIn } = useNuxtApp()
const { authUser } = useAuthState()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

watch(authUser, (user) => {
  if (user) {
    router.push('/home')
  }
})

const validate = (): boolean => {
  let valid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    valid = false
  } else if (!email.value.includes('@')) {
    emailError.value = 'Enter a valid email'
    valid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    valid = false
  }

  return valid
}

const handleLogin = async () => {
  if (!validate()) return

  error.value = null
  isLoading.value = true

  try {
    await $signIn(email.value.trim(), password.value)
    router.push('/home')
  } catch (e: any) {
    error.value = getErrorMessage(e.code)
  } finally {
    isLoading.value = false
  }
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    default:
      return 'An error occurred. Please try again'
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-container">
          <span class="logo-icon">✨</span>
        </div>
        <h1 class="title">AI App Builder</h1>
        <p class="subtitle">Build mobile apps with AI</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <AppTextField
          v-model="email"
          label="Email"
          placeholder="your@email.com"
          type="email"
          :error="emailError"
        />

        <div class="spacer" />

        <AppTextField
          v-model="password"
          label="Password"
          placeholder="Enter your password"
          :type="showPassword ? 'text' : 'password'"
          :error="passwordError"
        >
          <template #suffix>
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
            >
              {{ showPassword ? '👁️‍🗨️' : '👁️' }}
            </button>
          </template>
        </AppTextField>

        <NuxtLink to="/forgot-password" class="forgot-password">
          Forgot password?
        </NuxtLink>

        <div v-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
        </div>

        <AppButton
          type="submit"
          :loading="isLoading"
          width="100%"
          @click="handleLogin"
        >
          Sign In
        </AppButton>

        <div class="register-container">
          <span class="register-text">Don't have an account? </span>
          <NuxtLink to="/register" class="register-link">Sign Up</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: #1A1A1A;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: rgba(217, 119, 87, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 32px;
}

.title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 0;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
  margin: 8px 0 0;
}

.login-form {
  width: 100%;
}

.spacer {
  height: 16px;
}

.password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

.forgot-password {
  display: block;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  text-decoration: none;
  margin: 8px 0 16px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.error-container {
  background-color: rgba(229, 115, 115, 0.1);
  border: 1px solid rgba(229, 115, 115, 0.3);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.error-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #E57373;
  text-align: center;
  margin: 0;
}

.register-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.register-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
}

.register-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
