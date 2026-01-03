<script setup lang="ts">
import type { Project } from '~/composables/useProjects'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  delete: []
}>()

const formattedDate = computed(() => {
  const date = new Date(props.project.updatedAt)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
})

const handleDelete = (event: MouseEvent) => {
  event.stopPropagation()
  emit('delete')
}
</script>

<template>
  <div class="project-card" @click="emit('click')">
    <div class="project-card__preview">
      <div class="project-card__icon">📱</div>
    </div>
    <div class="project-card__info">
      <h3 class="project-card__name">{{ project.name }}</h3>
      <p class="project-card__date">{{ formattedDate }}</p>
    </div>
    <button class="project-card__delete" @click="handleDelete" title="Delete project">
      🗑️
    </button>
  </div>
</template>

<style scoped>
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #242424;
  border: 1px solid rgba(204, 204, 204, 0.3);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: #D97757;
}

.project-card__preview {
  aspect-ratio: 1;
  background-color: #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card__icon {
  font-size: 48px;
  opacity: 0.5;
}

.project-card__info {
  padding: 12px;
}

.project-card__name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #FAF9F5;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card__date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #5E5D59;
  margin: 4px 0 0;
}

.project-card__delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card:hover .project-card__delete {
  opacity: 1;
}

.project-card__delete:hover {
  background-color: rgba(229, 115, 115, 0.3);
}
</style>
