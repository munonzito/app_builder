<script setup lang="ts">
const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToHome = () => {
  router.push('/home')
}
</script>

<template>
  <div class="landing">
    <div class="hero">
      <div class="logo">
        <span class="icon">✨</span>
        <h1>AI App Builder</h1>
      </div>
      <p class="tagline">Build mobile apps with the power of AI</p>
      <p class="description">
        Describe what you want, and watch your React Native app come to life.
        No coding required.
      </p>
      <div class="cta">
        <button class="button primary" @click="goToLogin">Get Started</button>
        <button class="button secondary" @click="goToHome">Dashboard</button>
      </div>
    </div>
    
    <div class="features">
      <div class="feature">
        <span class="feature-icon">💬</span>
        <h3>Chat to Create</h3>
        <p>Simply describe your app idea in plain language</p>
      </div>
      <div class="feature">
        <span class="feature-icon">⚡</span>
        <h3>Instant Preview</h3>
        <p>See your changes in real-time as you iterate</p>
      </div>
      <div class="feature">
        <span class="feature-icon">📦</span>
        <h3>Export & Deploy</h3>
        <p>Download your complete React Native project</p>
      </div>
    </div>
    
    <footer>
      <p>Powered by AI App Builder</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: #1A1A1A;
  color: #FAF9F5;
  font-family: 'Inter', -apple-system, sans-serif;
}

.hero {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo .icon {
  font-size: 48px;
}

.logo h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.tagline {
  font-size: 24px;
  color: #D97757;
  margin-bottom: 16px;
}

.description {
  font-size: 18px;
  color: #5E5D59;
  max-width: 500px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.button {
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button.primary {
  background: #D97757;
  color: #1A1A1A;
}

.button.primary:hover {
  opacity: 0.9;
}

.button.secondary {
  background: transparent;
  color: #D97757;
  border: 2px solid #D97757;
}

.button.secondary:hover {
  background: rgba(217, 119, 87, 0.1);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.feature {
  background: #242424;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
  display: block;
}

.feature h3 {
  font-size: 20px;
  margin: 0 0 12px;
}

.feature p {
  color: #5E5D59;
  margin: 0;
  line-height: 1.5;
}

footer {
  text-align: center;
  padding: 40px 20px;
  color: #5E5D59;
  font-size: 14px;
}
</style>
