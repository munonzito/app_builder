<script setup lang="ts">

const emit = defineEmits<{
  newApp: []
  templates: []
  myApps: []
}>()
</script>

<template>
  <section class="quick-actions">
    <h2 class="section-title">Quick Actions</h2>
    <div class="actions-grid">
      <button class="action-card" @click="emit('newApp')">
        <span class="action-icon">➕</span>
        <h3 class="action-title">New App</h3>
        <p class="action-subtitle">Start from scratch</p>
      </button>
      <button class="action-card" @click="emit('templates')">
        <span class="action-icon">📦</span>
        <h3 class="action-title">Templates</h3>
        <p class="action-subtitle">Start with a template</p>
      </button>
    </div>
    <button class="action-card action-card--full" @click="emit('myApps')">
      <span class="action-icon">📁</span>
      <div class="action-content">
        <h3 class="action-title">My Apps</h3>
        <p class="action-subtitle">View all your projects</p>
      </div>
    </button>
  </section>
</template>

<style scoped>
.quick-actions {
  margin-top: 32px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 0 0 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #242424;
  border: 1px solid rgba(204, 204, 204, 0.3);
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: left;
}

.action-card:hover {
  border-color: #D97757;
}

.action-card--full {
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
}

.action-icon {
  font-size: 28px;
  margin-bottom: 16px;
}

.action-card--full .action-icon {
  margin-bottom: 0;
  margin-right: 16px;
}

.action-content {
  flex: 1;
}

.action-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #FAF9F5;
  margin: 0;
}

.action-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #5E5D59;
  margin: 4px 0 0;
}
</style>
