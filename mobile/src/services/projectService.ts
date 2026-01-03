import { ApiConfig } from '../config/api';
import { Project, projectFromJson, Message, messageToJson, AgentEvent } from '../models';
import { apiService } from './apiService';
import { authService } from './authService';
import { sseService } from './sseService';

class ProjectService {
  private static instance: ProjectService;

  private constructor() {}

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  async getProjects(): Promise<Project[]> {
    const response = await apiService.get('/api/projects');
    const projects = response.projects as any[];
    return projects.map(projectFromJson);
  }

  async getProject(id: string): Promise<Project> {
    const response = await apiService.get(`/api/projects/${id}`);
    return projectFromJson(response);
  }

  async createProject(name: string): Promise<Project> {
    const response = await apiService.post('/api/projects/create', { name });
    return projectFromJson(response.project);
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiService.put(`/api/projects/${id}`, data);
    return projectFromJson(response);
  }

  async deleteProject(id: string): Promise<void> {
    await apiService.delete(`/api/projects/${id}`);
  }

  async generateCode(
    projectId: string,
    message: string,
    chatHistory: Message[]
  ): Promise<Record<string, any>> {
    return apiService.post('/api/chat/generate', {
      projectId,
      message,
      chatHistory: chatHistory.map(messageToJson),
    });
  }

  async generateCodeStream(
    projectId: string,
    message: string,
    chatHistory: Message[],
    onEvent: (event: AgentEvent) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    console.log('[ProjectService] generateCodeStream called');
    console.log('[ProjectService] projectId:', projectId);
    console.log('[ProjectService] message:', message);
    console.log('[ProjectService] chatHistory length:', chatHistory.length);
    
    const token = await authService.getIdToken();
    console.log('[ProjectService] Got token:', token ? 'yes (length: ' + token.length + ')' : 'no');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const url = `${ApiConfig.baseUrl}${ApiConfig.chatEndpoint}`;
    console.log('[ProjectService] SSE URL:', url);
    console.log('[ProjectService] Using Droid:', ApiConfig.useDroid);

    await sseService.connect({
      url,
      headers,
      body: {
        projectId,
        message,
        chatHistory: chatHistory.map(messageToJson),
        // Include preset for unified agent
        ...(ApiConfig.agentBackend === 'unified' 
          ? { preset: ApiConfig.agentPreset }
          : {}
        ),
      },
      onEvent,
      onError,
      onComplete,
    });
    console.log('[ProjectService] sseService.connect completed');
  }

  cancelGeneration(): void {
    sseService.abort();
  }
}

export const projectService = ProjectService.getInstance();
