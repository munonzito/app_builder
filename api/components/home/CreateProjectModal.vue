<script setup lang="ts">

interface Props {
  visible: boolean
  projectName: string
  isCreating: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:projectName': [value: string]
  create: []
}>()

const localName = computed({
  get: () => props.projectName,
  set: (value: string) => emit('update:projectName', value),
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleCreate = () => {
  if (props.projectName.trim()) {
    emit('create')
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click="handleBackdropClick">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Create New App</h2>
          <button class="close-button" @click="handleClose">✕</button>
        </div>

        <div class="modal-body">
          <AppTextField
            v-model="localName"
            label="App Name"
            placeholder="My Awesome App"
            @keyup.enter="handleCreate"
          />
        </div>

        <div class="modal-footer">
          <AppButton variant="secondary" @click="handleClose">
            Cancel
          </AppButton>
          <AppButton
            :loading="isCreating"
            :disabled="!projectName.trim()"
            @click="handleCreate"
          >
            Create
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background-color: #242424;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(204, 204, 204, 0.2);
}

.modal-title {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  color: #5E5D59;
  cursor: pointer;
  padding: 4px;
}

.close-button:hover {
  color: #FAF9F5;
}

.modal-body {
  padding: 24px 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(204, 204, 204, 0.2);
}
</style>
