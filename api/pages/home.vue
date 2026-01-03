<script setup lang="ts">
import { useAuthState } from '~/composables/useAuthState'
import { useProjects } from '~/composables/useProjects'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { $signOut } = useNuxtApp()
const { authUser } = useAuthState()
const { projects, isLoading, loadProjects, createProject, deleteProject } = useProjects()

const showCreateModal = ref(false)
const projectName = ref('')
const isCreating = ref(false)

onMounted(async () => {
  await loadProjects()
})

const userName = computed(() => {
  return authUser.value?.name || authUser.value?.email?.split('@')[0] || 'User'
})

const recentProjects = computed(() => {
  return projects.value.slice(0, 4)
})

const handleCreateProject = async () => {
  if (!projectName.value.trim()) return

  isCreating.value = true
  const project = await createProject(projectName.value.trim())
  isCreating.value = false
  showCreateModal.value = false
  projectName.value = ''

  if (project) {
    router.push(`/chat?projectId=${project.id}`)
  }
}

const handleDeleteProject = async (id: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    await deleteProject(id)
  }
}

const handleSignOut = async () => {
  await $signOut()
  router.push('/login')
}
</script>

<template>
  <div class="home-page">
    <HomeHeader @settings-click="handleSignOut" />

    <main class="home-content">
      <section class="welcome-section">
        <div class="welcome-row">
          <span class="welcome-prefix">&gt;</span>
          <span class="welcome-back">Welcome back,</span>
        </div>
        <h1 class="user-name">{{ userName }}</h1>
        <p class="welcome-question">What are we building today?</p>
      </section>

      <QuickActions
        @new-app="showCreateModal = true"
        @templates="() => {}"
        @my-apps="() => {}"
      />

      <section class="recent-section">
        <div class="section-header">
          <h2 class="section-title">Recent Projects</h2>
          <button v-if="projects.length > 0" class="view-all">View all</button>
        </div>

        <div v-if="isLoading" class="loading-container">
          <span class="loading-text">Loading...</span>
        </div>

        <div v-else-if="recentProjects.length === 0" class="empty-state">
          <span class="empty-icon">📱</span>
          <h3 class="empty-title">No projects yet</h3>
          <p class="empty-subtitle">Create your first app to get started</p>
          <AppButton
            variant="secondary"
            @click="showCreateModal = true"
          >
            ➕ Create App
          </AppButton>
        </div>

        <div v-else class="projects-grid">
          <ProjectCard
            v-for="project in recentProjects"
            :key="project.id"
            :project="project"
            @click="router.push(`/chat?projectId=${project.id}`)"
            @delete="handleDeleteProject(project.id)"
          />
        </div>
      </section>
    </main>

    <button class="fab" @click="showCreateModal = true">
      <span class="fab-icon">➕</span>
      <span class="fab-text">New App</span>
    </button>

    <CreateProjectModal
      v-model:visible="showCreateModal"
      v-model:project-name="projectName"
      :is-creating="isCreating"
      @create="handleCreateProject"
    />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #1A1A1A;
}

.home-content {
  padding: 16px;
  padding-bottom: 100px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background-color: #242424;
  border-radius: 4px;
  border: 1px solid rgba(204, 204, 204, 0.3);
  padding: 24px;
}

.welcome-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-prefix {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #D97757;
}

.welcome-back {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 4px 0 16px;
}

.welcome-question {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #5E5D59;
  margin: 0;
}

.recent-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #FAF9F5;
  margin: 0;
}

.view-all {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #D97757;
  background: none;
  border: none;
  cursor: pointer;
}

.view-all:hover {
  text-decoration: underline;
}

.loading-container {
  padding: 32px;
  text-align: center;
}

.loading-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #5E5D59;
}

.empty-state {
  background-color: #242424;
  border-radius: 4px;
  border: 1px solid rgba(204, 204, 204, 0.3);
  padding: 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #FAF9F5;
  margin: 16px 0 0;
}

.empty-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #5E5D59;
  margin: 8px 0 24px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #D97757;
  color: #FAF9F5;
  border: none;
  border-radius: 28px;
  padding: 12px 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.fab-icon {
  font-size: 16px;
}

.fab-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
}
</style>
