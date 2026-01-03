<script setup lang="ts">
const route = useRoute()
const projectId = route.params.projectId as string

interface SnackData {
  webPreviewURL: string
  playerURL: string
  snackId: string
  name: string
  cached: boolean
}

const { data: snackData, error, status } = await useFetch<SnackData>(`/api/preview/snack/${projectId}`)

const isLoading = computed(() => status.value === 'pending')

onMounted(() => {
  console.log('[Embedded] Snack data:', snackData.value)
  console.log('[Embedded] Player URL:', snackData.value?.playerURL)
})
</script>

<template>
  <div class="preview-container">
    <!-- Error -->
    <div v-if="error" class="error">
      <h2>Error loading preview</h2>
      <p>{{ error.message }}</p>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Saving preview...</p>
    </div>

    <!-- Preview iframe - loads the saved Snack directly via our self-hosted player -->
    <iframe
      v-else-if="snackData?.playerURL"
      :src="snackData.playerURL"
      class="preview-iframe"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
    />

    <!-- No data -->
    <div v-else class="empty">
      <div class="icon">📱</div>
      <h2>No Preview Available</h2>
      <p>Start chatting to generate your app</p>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  width: 100%;
  height: 100vh;
  background: #0f0f1e;
  color: #faf9f5;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
}

.error, .empty, .loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}

.error h2 {
  color: #e57373;
  margin-bottom: 10px;
}

.empty .icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty h2, .loading h2 {
  margin-bottom: 8px;
}

.empty p, .error p, .loading p {
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #d97757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>
