<script setup lang="ts">

const emit = defineEmits<{
  settingsClick: []
}>()
</script>

<template>
  <header class="home-header">
    <div class="header-left">
      <div class="logo-container">
        <span class="logo-icon">✨</span>
      </div>
      <span class="header-title">AI App Builder</span>
    </div>
    <button class="settings-button" @click="emit('settingsClick')">
      ⚙️
    </button>
  </header>
</template>

<style scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #242424;
  padding: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(217, 119, 87, 0.1);
  border-radius: 8px;
}

.logo-icon {
  font-size: 16px;
}

.header-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #FAF9F5;
}

.settings-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.settings-button:hover {
  opacity: 1;
}
</style>
