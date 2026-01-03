<script setup lang="ts">
import IPhoneFrame from './IPhoneFrame.vue'

interface Props {
  previewUrl: string | null
  previewVersion?: number
}

const props = defineProps<Props>()

const iframeKey = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const refresh = () => {
  iframeKey.value++
}

// Auto-refresh when previewVersion changes (after generation completes)
watch(
  () => props.previewVersion,
  (newVersion, oldVersion) => {
    // Only refresh if version actually increased (not on initial mount)
    if (oldVersion !== undefined && newVersion !== undefined && newVersion > oldVersion) {
      refresh()
    }
  }
)

const fullUrl = computed(() => {
  if (!props.previewUrl) return null
  if (props.previewUrl.startsWith('http')) return props.previewUrl
  return props.previewUrl
})

const calculateScale = () => {
  if (!containerRef.value) return
  const containerHeight = containerRef.value.clientHeight - 32
  const containerWidth = containerRef.value.clientWidth - 32
  const phoneHeight = 882
  const phoneWidth = 433
  const scaleH = containerHeight / phoneHeight
  const scaleW = containerWidth / phoneWidth
  scale.value = Math.min(scaleH, scaleW, 1)
}

onMounted(() => {
  calculateScale()
  window.addEventListener('resize', calculateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateScale)
})

watch(() => containerRef.value, () => {
  calculateScale()
})
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <span class="preview-title">Preview</span>
      <button class="refresh-button" @click="refresh" title="Refresh preview">
        🔄
      </button>
    </div>

    <div ref="containerRef" class="preview-content">
      <IPhoneFrame :scale="scale">
        <div v-if="!fullUrl" class="preview-empty">
          <span class="empty-icon">📱</span>
          <p class="empty-text">Preview will appear here</p>
        </div>

        <iframe
          v-else
          :key="iframeKey"
          :src="fullUrl"
          class="preview-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
      </IPhoneFrame>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1A1A1A;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #242424;
  border-bottom: 1px solid rgba(204, 204, 204, 0.2);
}

.preview-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #5E5D59;
}

.refresh-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.refresh-button:hover {
  opacity: 1;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px 16px;
  overflow: hidden;
}

.preview-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0f0f1e;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.empty-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #5E5D59;
  margin: 16px 0 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
}
</style>
