<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const inputClasses = computed(() => [
  'app-textfield__input-container',
  { 'app-textfield__input-container--error': !!props.error },
])
</script>

<template>
  <div class="app-textfield">
    <label v-if="label" class="app-textfield__label">{{ label }}</label>
    <div :class="inputClasses">
      <slot name="prefix" />
      <input
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="app-textfield__input"
      />
      <slot name="suffix" />
    </div>
    <span v-if="error" class="app-textfield__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.app-textfield {
  width: 100%;
}

.app-textfield__label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  margin-bottom: 4px;
}

.app-textfield__input-container {
  display: flex;
  align-items: center;
  background-color: #242424;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  padding: 0 16px;
}

.app-textfield__input-container--error {
  border-color: #E57373;
}

.app-textfield__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #FAF9F5;
  padding: 16px 0;
}

.app-textfield__input::placeholder {
  color: #5E5D59;
}

.app-textfield__input:disabled {
  opacity: 0.5;
}

.app-textfield__error {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #E57373;
  margin-top: 4px;
}
</style>
