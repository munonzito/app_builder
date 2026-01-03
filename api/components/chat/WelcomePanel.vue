<script setup lang="ts">

const emit = defineEmits<{
  suggestion: [value: string]
}>()

const suggestions = [
  'A simple todo list app',
  'A weather app with animations',
  'A recipe book with categories',
  'A habit tracker',
  'A note-taking app',
  'A countdown timer',
]
</script>

<template>
  <div class="welcome-panel">
    <div class="welcome-icon">
      <span>✨</span>
    </div>
    <h2 class="welcome-title">Start Building</h2>
    <p class="welcome-subtitle">
      Describe the app you want to create.<br>
      Be as detailed as possible for best results.
    </p>
    <div class="suggestions">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="suggestion-chip"
        @click="emit('suggestion', suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background-color: rgba(217, 119, 87, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.welcome-icon span {
  font-size: 40px;
}

.welcome-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 0;
}

.welcome-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
  margin: 8px 0 0;
  line-height: 1.6;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  max-width: 500px;
}

.suggestion-chip {
  background-color: #242424;
  border: 1px solid rgba(204, 204, 204, 0.3);
  border-radius: 16px;
  padding: 8px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #5E5D59;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: #D97757;
  color: #FAF9F5;
}
</style>
