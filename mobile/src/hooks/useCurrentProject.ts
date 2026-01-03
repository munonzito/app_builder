import { useState, useCallback, useRef } from 'react';
import { Project, Message } from '../models';
import { projectService } from '../services/projectService';

interface UseCurrentProjectResult {
  currentProject: Project | null;
  messages: Message[];
  isLoading: boolean;
  selectProject: (projectId: string) => Promise<void>;
  clearCurrentProject: () => void;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
}

export function useCurrentProject(): UseCurrentProjectResult {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentProjectIdRef = useRef<string | null>(null);

  const selectProject = useCallback(async (projectId: string) => {
    if (currentProjectIdRef.current === projectId) {
      return;
    }
    
    setIsLoading(true);
    currentProjectIdRef.current = projectId;

    try {
      const project = await projectService.getProject(projectId);
      setCurrentProject(project);
      setMessages([]);
    } catch {
      console.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null);
    setMessages([]);
    currentProjectIdRef.current = null;
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  return {
    currentProject,
    messages,
    isLoading,
    selectProject,
    clearCurrentProject,
    setCurrentProject,
    setMessages,
    addMessage,
  };
}
