<script setup lang="ts">
import { MessageRole, type Message, type StreamItem, type PlanTask } from '~/composables/useBuilder'

interface Props {
  message: Message
  isStreaming?: boolean
  streamItems?: StreamItem[]
  planTasks?: PlanTask[]
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  streamItems: () => [],
  planTasks: () => [],
})

// Use streaming items while streaming, otherwise use stored items from metadata
const effectiveStreamItems = computed(() => {
  if (props.isStreaming && props.streamItems.length > 0) {
    return props.streamItems
  }
  return props.message.metadata?.streamItems || []
})

const roleLabel = computed(() => {
  switch (props.message.role) {
    case MessageRole.User:
      return 'You'
    case MessageRole.Assistant:
      return 'AI'
    case MessageRole.System:
      return 'System'
    default:
      return ''
  }
})

const roleClass = computed(() => `message--${props.message.role}`)

const activeTools = computed(() => {
  // Only show active (spinning) tools while streaming
  if (!props.isStreaming) return []
  return effectiveStreamItems.value
    .filter((item) => item.type === 'tool_start')
    .map((item) => item.tool)
})

const completedTools = computed(() => {
  return effectiveStreamItems.value
    .filter((item) => item.type === 'tool_end')
    .map((item) => item.tool)
})

const changedFiles = computed(() => {
  return effectiveStreamItems.value
    .filter((item) => item.type === 'file_changed')
    .map((item) => ({ path: item.path, action: item.action }))
})
</script>

<template>
  <div class="message" :class="roleClass">
    <div class="message-header">
      <span class="role-prefix">&gt;</span>
      <span class="role-label">{{ roleLabel }}</span>
      <span v-if="isStreaming && message.role === MessageRole.Assistant" class="streaming-indicator">
        ●
      </span>
    </div>

    <div v-if="message.role === MessageRole.User" class="message-content user-content">
      {{ message.content }}
    </div>

    <div v-else-if="message.role === MessageRole.Assistant" class="message-content assistant-content">
      <div v-if="planTasks.length > 0" class="plan-section">
        <div class="plan-header">📋 Plan</div>
        <div
          v-for="task in planTasks"
          :key="task.id"
          class="plan-task"
          :class="`plan-task--${task.status}`"
        >
          <span class="task-status">
            {{ task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '⟳' : '○' }}
          </span>
          <span class="task-description">{{ task.description }}</span>
        </div>
      </div>

      <div v-if="activeTools.length > 0 || completedTools.length > 0" class="tools-section">
        <span
          v-for="tool in activeTools"
          :key="`active-${tool}`"
          class="tool-badge tool-badge--active"
        >
          ⟳ {{ tool }}
        </span>
        <span
          v-for="tool in completedTools"
          :key="`done-${tool}`"
          class="tool-badge tool-badge--completed"
        >
          ✓ {{ tool }}
        </span>
      </div>

      <div v-if="changedFiles.length > 0" class="files-section">
        <div
          v-for="file in changedFiles"
          :key="file.path"
          class="file-change"
        >
          <span class="file-action">{{ file.action === 'create' ? '+' : file.action === 'edit' ? '~' : '-' }}</span>
          <span class="file-path">{{ file.path }}</span>
        </div>
      </div>

      <div v-if="message.content" class="text-content" v-html="formatContent(message.content)" />
    </div>

    <div v-else class="message-content system-content">
      {{ message.content }}
    </div>
  </div>
</template>

<script lang="ts">
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatContent(content: string): string {
  // First escape HTML to prevent JSX/HTML tags from being interpreted
  const escaped = escapeHtml(content)
  
  return escaped
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}
</script>

<style scoped>
.message {
  padding: 8px 16px;
}

.message--user {
  background-color: transparent;
}

.message--assistant {
  background-color: #242424;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.role-prefix {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #D97757;
}

.role-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #5E5D59;
  text-transform: uppercase;
}

.streaming-indicator {
  color: #D97757;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.message-content {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.user-content {
  color: #FAF9F5;
}

.assistant-content {
  color: #FAF9F5;
}

.system-content {
  color: #5E5D59;
}

.plan-section {
  background-color: rgba(217, 119, 87, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.plan-header {
  font-weight: bold;
  margin-bottom: 8px;
  color: #D97757;
}

.plan-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.plan-task--completed .task-description {
  text-decoration: line-through;
  opacity: 0.7;
}

.plan-task--in_progress .task-status {
  color: #D97757;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.task-status {
  font-size: 12px;
}

.task-description {
  font-size: 13px;
}

.tools-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tool-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tool-badge--active {
  background-color: rgba(217, 119, 87, 0.2);
  color: #D97757;
}

.tool-badge--completed {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.files-section {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
}

.file-change {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.file-action {
  font-weight: bold;
  width: 12px;
}

.file-change:has(.file-action:contains('+')) .file-action {
  color: #4CAF50;
}

.file-path {
  color: #5E5D59;
}

.text-content {
  white-space: pre-wrap;
}

.text-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}
</style>
