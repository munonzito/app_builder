<script setup lang="ts">

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  isGenerating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Describe your app...',
  disabled: false,
  isGenerating: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  cancel: []
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const hasText = computed(() => props.modelValue.trim().length > 0)
const canSubmit = computed(() => !props.disabled && !props.isGenerating && hasText.value)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSubmit.value) {
      emit('submit')
    }
  }
}
</script>

<template>
  <div class="chat-input">
    <span class="prefix">&gt; </span>
    <textarea
      v-model="inputValue"
      :placeholder="isGenerating ? 'Generating...' : placeholder"
      :disabled="disabled || isGenerating"
      class="input"
      rows="1"
      @keydown="handleKeydown"
    />
    <button
      v-if="isGenerating"
      class="cancel-button"
      @click="emit('cancel')"
    >
      ⏹️
    </button>
    <button
      v-else
      class="send-button"
      :disabled="!canSubmit"
      @click="emit('submit')"
    >
      📤
    </button>
  </div>
</template>

<style scoped>
.chat-input {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #242424;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  padding: 8px 16px;
}

.prefix {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #D97757;
}

.input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #FAF9F5;
  resize: none;
  max-height: 100px;
  line-height: 1.5;
}

.input::placeholder {
  color: #5E5D59;
}

.input:disabled {
  opacity: 0.5;
}

.send-button,
.cancel-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.send-button:hover:not(:disabled),
.cancel-button:hover {
  opacity: 1;
}

.send-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cancel-button {
  width: 28px;
  height: 28px;
  background-color: rgba(239, 83, 80, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
