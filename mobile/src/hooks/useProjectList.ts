import { useState, useCallback } from 'react';
import { Project } from '../models';
import { projectService } from '../services/projectService';

interface UseProjectListResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export function useProjectList(): UseProjectListResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedProjects = await projectService.getProjects();
      setProjects(loadedProjects);
    } catch {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const project = await projectService.createProject(name);
      setProjects((prev) => [project, ...prev]);
      return project;
    } catch (e: any) {
      setError(`Failed to create project: ${e.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {
      setError('Failed to delete project');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    deleteProject,
    clearError,
  };
}
