<script setup lang="ts">
import { useAuthState } from '~/composables/useAuthState'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { $signUp } = useNuxtApp()
const { authUser } = useAuthState()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

watch(authUser, (user) => {
  if (user) {
    router.push('/home')
  }
})

const validate = (): boolean => {
  let valid = true
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    valid = false
  }

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
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    valid = false
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleRegister = async () => {
  if (!validate()) return

  error.value = null
  isLoading.value = true

  try {
    await $signUp(email.value.trim(), password.value, name.value.trim())
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
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    default:
      return 'An error occurred. Please try again'
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <div class="logo-container">
          <span class="logo-icon">✨</span>
        </div>
        <h1 class="title">Create Account</h1>
        <p class="subtitle">Start building apps with AI</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <AppTextField
          v-model="name"
          label="Name"
          placeholder="Your name"
          :error="nameError"
        />

        <div class="spacer" />

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
          placeholder="At least 6 characters"
          :type="showPassword ? 'text' : 'password'"
          :error="passwordError"
        >
          <template #suffix>
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️‍🗨️' : '👁️' }}
            </button>
          </template>
        </AppTextField>

        <div class="spacer" />

        <AppTextField
          v-model="confirmPassword"
          label="Confirm Password"
          placeholder="Repeat your password"
          :type="showPassword ? 'text' : 'password'"
          :error="confirmPasswordError"
        />

        <div class="spacer-lg" />

        <div v-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
        </div>

        <AppButton
          type="submit"
          :loading="isLoading"
          width="100%"
          @click="handleRegister"
        >
          Create Account
        </AppButton>

        <div class="login-container">
          <span class="login-text">Already have an account? </span>
          <NuxtLink to="/login" class="login-link">Sign In</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: #1A1A1A;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-header {
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

.register-form {
  width: 100%;
}

.spacer {
  height: 16px;
}

.spacer-lg {
  height: 24px;
}

.password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
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

.login-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.login-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
}

.login-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
