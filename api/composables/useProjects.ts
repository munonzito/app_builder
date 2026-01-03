import { ref, readonly } from 'vue'
import { useApi } from './useApi'

export interface Project {
  id: string
  name: string
  userId: string
  code?: string
  previewUrl?: string
  dependencies?: string[]
  createdAt: string
  updatedAt: string
}

const projects = ref<Project[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useProjects() {
  const api = useApi()

  const loadProjects = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/projects')
      projects.value = response.projects || []
    } catch (e: any) {
      error.value = e.message
      projects.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (name: string): Promise<Project | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/projects/create', { name })
      const newProject = response.project
      projects.value = [newProject, ...projects.value]
      return newProject
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  const getProject = async (id: string): Promise<Project | null> => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response as Project
    } catch (e: any) {
      error.value = e.message
      return null
    }
  }

  const updateProject = async (id: string, data: Partial<Project>): Promise<Project | null> => {
    try {
      const response = await api.put(`/projects/${id}`, data)
      const updatedProject = response.project

      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      return updatedProject
    } catch (e: any) {
      error.value = e.message
      return null
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/projects/${id}`)
      projects.value = projects.value.filter((p) => p.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    }
  }

  return {
    projects: readonly(projects),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
  }
}
