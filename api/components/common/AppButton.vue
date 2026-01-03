<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'text'

interface Props {
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  disabled: false,
  width: 'auto',
  height: '48px',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  { 'app-button--disabled': isDisabled.value },
])

const buttonStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :style="buttonStyle"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <span v-if="loading" class="app-button__loader"></span>
    <slot v-else />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-button--primary {
  background-color: #D97757;
  color: #FAF9F5;
}

.app-button--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.app-button--secondary {
  background-color: transparent;
  color: #D97757;
  border: 1px solid #D97757;
}

.app-button--secondary:hover:not(:disabled) {
  background-color: rgba(217, 119, 87, 0.1);
}

.app-button--text {
  background-color: transparent;
  color: #D97757;
}

.app-button--text:hover:not(:disabled) {
  opacity: 0.8;
}

.app-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-button__loader {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
