<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { $resetPassword } = useNuxtApp()

const email = ref('')
const emailError = ref('')
const success = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const validate = (): boolean => {
  emailError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  } else if (!email.value.includes('@')) {
    emailError.value = 'Enter a valid email'
    return false
  }

  return true
}

const handleReset = async () => {
  if (!validate()) return

  error.value = null
  isLoading.value = true

  try {
    await $resetPassword(email.value.trim())
    success.value = true
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
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    default:
      return 'An error occurred. Please try again'
  }
}
</script>

<template>
  <div class="forgot-page">
    <div class="forgot-container">
      <div class="forgot-header">
        <div class="logo-container">
          <span class="logo-icon">🔑</span>
        </div>
        <h1 class="title">Reset Password</h1>
        <p class="subtitle">We'll send you a reset link</p>
      </div>

      <div v-if="success" class="success-container">
        <p class="success-text">
          Check your email for password reset instructions.
        </p>
        <NuxtLink to="/login" class="back-link">Back to Sign In</NuxtLink>
      </div>

      <form v-else class="forgot-form" @submit.prevent="handleReset">
        <AppTextField
          v-model="email"
          label="Email"
          placeholder="your@email.com"
          type="email"
          :error="emailError"
        />

        <div class="spacer-lg" />

        <div v-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
        </div>

        <AppButton
          type="submit"
          :loading="isLoading"
          width="100%"
          @click="handleReset"
        >
          Send Reset Link
        </AppButton>

        <div class="login-container">
          <NuxtLink to="/login" class="login-link">Back to Sign In</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: #1A1A1A;
}

.forgot-container {
  width: 100%;
  max-width: 400px;
}

.forgot-header {
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

.forgot-form {
  width: 100%;
}

.spacer-lg {
  height: 24px;
}

.success-container {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 4px;
  padding: 24px;
  text-align: center;
}

.success-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #4CAF50;
  margin: 0 0 16px;
}

.back-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  text-decoration: none;
}

.back-link:hover {
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

.login-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
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
