<script setup lang="ts">
import { Snack } from 'snack-sdk'

const route = useRoute()
const projectId = route.params.projectId as string

interface ProjectData {
  name: string
  files: Record<string, string>
  dependencies: Record<string, string>
}

const { data: project, error } = await useFetch<ProjectData>(`/api/preview/${projectId}`)

const webPreviewRef = { current: null as Window | null }
const iframeRef = ref<HTMLIFrameElement | null>(null)
const webPreviewURL = ref<string | null>(null)
const isLoading = ref(true)
const snackError = ref<string | null>(null)

let snack: Snack | null = null

function getSnackFiles() {
  if (!project.value?.files) return {}
  const snackFiles: Record<string, { type: 'CODE'; contents: string }> = {}
  for (const [filename, contents] of Object.entries(project.value.files)) {
    snackFiles[filename] = { type: 'CODE', contents }
  }
  return snackFiles
}

function getSnackDependencies() {
  const snackDependencies: Record<string, { version: string }> = {}
  const deps = project.value?.dependencies || {}
  for (const [packageName, version] of Object.entries(deps)) {
    snackDependencies[packageName] = { version }
  }
  return snackDependencies
}

function initSnack() {
  if (snack) return
  
  if (!project.value?.files || Object.keys(project.value.files).length === 0) {
    isLoading.value = false
    return
  }

  try {
    console.log('[Snack] Initializing with files:', Object.keys(project.value.files))
    console.log('[Snack] webPreviewRef.current:', webPreviewRef.current)
    
    snack = new Snack({
      name: project.value.name,
      files: getSnackFiles(),
      dependencies: getSnackDependencies(),
      sdkVersion: '52.0.0',
      webPreviewRef: webPreviewRef,
      online: true,
      verbose: true,
    })

    snack.addStateListener((state) => {
      console.log('[Snack] State update - webPreviewURL:', state.webPreviewURL, 'online:', state.online)
      if (state.webPreviewURL && !webPreviewURL.value) {
        console.log('[Snack] Setting webPreviewURL:', state.webPreviewURL)
        webPreviewURL.value = state.webPreviewURL
        isLoading.value = false
      }
    })

    const stateTimeout = setTimeout(() => {
      if (isLoading.value) {
        const currentState = snack?.getState()
        console.log('[Snack] Timeout! Current state:', JSON.stringify({
          webPreviewURL: currentState?.webPreviewURL,
          online: currentState?.online,
          url: currentState?.url,
        }))
        isLoading.value = false
        snackError.value = 'Preview timed out. The Snack service may be unavailable.'
      }
    }, 10000)

    snack.getStateAsync().then((state) => {
      clearTimeout(stateTimeout)
      console.log('[Snack] getStateAsync resolved - webPreviewURL:', state.webPreviewURL)
      if (state.webPreviewURL) {
        webPreviewURL.value = state.webPreviewURL
      }
      isLoading.value = false
    }).catch((err) => {
      console.log('[Snack] getStateAsync error:', err)
      clearTimeout(stateTimeout)
      isLoading.value = false
    })
  } catch (err) {
    console.log('[Snack] Init error:', err)
    snackError.value = err instanceof Error ? err.message : 'Failed to load preview'
    isLoading.value = false
  }
}

onMounted(() => {
  // Debug: Listen for all postMessage events
  window.addEventListener('message', (event) => {
    console.log('[PostMessage] Received from:', event.origin, 'data:', typeof event.data === 'string' ? event.data.substring(0, 200) : event.data)
  })
  
  nextTick(() => {
    if (iframeRef.value?.contentWindow) {
      webPreviewRef.current = iframeRef.value.contentWindow
    }
    initSnack()
  })
})

function onIframeLoad() {
  if (iframeRef.value?.contentWindow) {
    webPreviewRef.current = iframeRef.value.contentWindow
  }
}

onUnmounted(() => {
  snack = null
})
</script>

<template>
  <div class="preview-container">
    <!-- Error from API -->
    <div v-if="error" class="error">
      <h2>Error loading preview</h2>
      <p>{{ error.message }}</p>
    </div>

    <!-- No files generated yet -->
    <div v-else-if="!project?.files || Object.keys(project.files).length === 0" class="empty">
      <div class="icon">📱</div>
      <h2>No Preview Available</h2>
      <p>Start chatting to generate your app</p>
    </div>

    <!-- Snack error -->
    <div v-else-if="snackError" class="error">
      <h2>Preview Error</h2>
      <p>{{ snackError }}</p>
    </div>

    <!-- Preview -->
    <div v-else class="preview-wrapper">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading preview...</p>
      </div>

      <!-- Iframe for web preview -->
      <iframe
        ref="iframeRef"
        :src="webPreviewURL || undefined"
        class="preview-iframe"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking; screen-wake-lock"
        @load="onIframeLoad"
      />
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

.error, .empty {
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

.empty h2 {
  margin-bottom: 8px;
}

.empty p, .error p {
  color: #888;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0f0f1e;
  z-index: 10;
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

.loading p {
  color: #888;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>
