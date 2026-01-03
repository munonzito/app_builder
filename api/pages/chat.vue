<script setup lang="ts">
import { useBuilder, MessageRole } from '~/composables/useBuilder'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.query.projectId as string)

const {
  currentProject,
  messages,
  isLoading,
  isGenerating,
  streamingMessage,
  streamingItems,
  planTasks,
  previewUrl,
  previewVersion,
  loadProject,
  sendMessage,
  cancelGeneration,
} = useBuilder(projectId.value)

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!projectId.value) {
    router.push('/home')
    return
  }

  await loadProject()
})

const displayMessages = computed(() => {
  if (streamingMessage.value) {
    return [...messages.value, streamingMessage.value]
  }
  return messages.value
})

const handleSubmit = async (text?: string) => {
  const messageText = text || inputText.value
  if (!messageText.trim()) return

  inputText.value = ''
  await sendMessage(messageText)
}

const handleSuggestion = (suggestion: string) => {
  handleSubmit(suggestion)
}

const handleBack = () => {
  router.push('/home')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(displayMessages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<template>
  <div class="chat-page">
    <header class="chat-header">
      <button class="back-button" @click="handleBack">
        ← Back
      </button>
      <h1 class="project-name">{{ currentProject?.name || 'Loading...' }}</h1>
      <div class="header-actions">
        <span v-if="isGenerating" class="generating-badge">
          ⟳ Generating...
        </span>
      </div>
    </header>

    <div v-if="isLoading" class="loading-container">
      <span class="loading-text">Loading project...</span>
    </div>

    <div v-else class="chat-layout">
      <div class="chat-panel">
        <div v-if="displayMessages.length === 0" class="welcome-container">
          <WelcomePanel @suggestion="handleSuggestion" />
        </div>

        <div v-else ref="messagesContainer" class="messages-container">
          <ChatMessage
            v-for="(message, index) in displayMessages"
            :key="message.id"
            :message="message"
            :is-streaming="!!streamingMessage && index === displayMessages.length - 1"
            :stream-items="!!streamingMessage && index === displayMessages.length - 1 ? streamingItems : []"
            :plan-tasks="!!streamingMessage && index === displayMessages.length - 1 ? planTasks : []"
          />
        </div>

        <div class="input-container">
          <ChatInput
            v-model="inputText"
            placeholder="Describe what you want to build..."
            :disabled="false"
            :is-generating="isGenerating"
            @submit="handleSubmit()"
            @cancel="cancelGeneration"
          />
        </div>
      </div>

      <div class="divider" />

      <div class="preview-container">
        <PreviewPanel :preview-url="previewUrl" :preview-version="previewVersion" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1A1A1A;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: #242424;
  border-bottom: 1px solid rgba(204, 204, 204, 0.2);
}

.back-button {
  background: none;
  border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(217, 119, 87, 0.1);
}

.project-name {
  flex: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: normal;
  color: #FAF9F5;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.generating-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #D97757;
  background-color: rgba(217, 119, 87, 0.1);
  padding: 6px 12px;
  border-radius: 4px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #5E5D59;
}

.chat-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.welcome-container {
  flex: 1;
  display: flex;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.input-container {
  padding: 16px;
  border-top: 1px solid rgba(204, 204, 204, 0.2);
}

.divider {
  width: 1px;
  background-color: #242424;
}

.preview-container {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }

  .divider {
    width: 100%;
    height: 1px;
  }

  .preview-container {
    height: 50%;
  }
}
</style>
