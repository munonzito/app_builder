import React, { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';
import {
  Project,
  Message,
  MessageRole,
  AgentEvent,
  AgentEventType,
  StreamItem,
  TextStreamItem,
  ToolCallStreamItem,
  FileChange,
  FileChangeAction,
  PlanTask,
  PlanTaskStatus,
} from '../models';
import { projectService } from '../services/projectService';
import { useProjectList } from '../hooks/useProjectList';
import { useCurrentProject } from '../hooks/useCurrentProject';
import { useAgentStatus, AgentStatus, defaultAgentStatus } from '../hooks/useAgentStatus';
import { useMessageStream } from '../hooks/useMessageStream';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  agentStatus: AgentStatus;
  streamingMessage: Message | null;
  streamingItems: StreamItem[];
  planTasks: PlanTask[];
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  selectProject: (projectId: string) => Promise<void>;
  clearCurrentProject: () => void;
  deleteProject: (projectId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  cancelGeneration: () => void;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjects(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

interface ProjectProviderProps {
  children: ReactNode;
}

function getToolMessage(toolName: string | undefined, args?: Record<string, any>): string {
  if (!toolName) return 'Processing...';

  switch (toolName) {
    case 'listFiles':
      return 'Listing project files...';
    case 'readFile':
      return `Reading ${args?.path || 'file'}...`;
    case 'writeFile':
      return `Writing ${args?.path || 'file'}...`;
    case 'patchFile':
      return `Updating ${args?.path || 'file'}...`;
    case 'deleteFile':
      return `Deleting ${args?.path || 'file'}...`;
    case 'getDependencies':
      return 'Checking dependencies...';
    case 'addDependency':
      return `Adding ${args?.packageName || 'dependency'}...`;
    case 'setDependencies':
      return 'Updating dependencies...';
    case 'validateProject':
      return 'Validating project...';
    case 'getErrors':
      return 'Checking for errors...';
    case 'getProjectSummary':
      return 'Analyzing project...';
    default:
      return `Running ${toolName}...`;
  }
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const projectList = useProjectList();
  const currentProjectState = useCurrentProject();
  const agentStatusState = useAgentStatus();
  const messageStream = useMessageStream();
  
  const [error, setError] = useState<string | null>(null);
  const pendingAssistantMessageRef = useRef<Message | null>(null);
  const fileChangesRef = useRef<FileChange[]>([]);
  const accumulatedTextRef = useRef<string>('');

  useEffect(() => {
    if (!messageStream.isGenerating && pendingAssistantMessageRef.current) {
      const messageToAdd = pendingAssistantMessageRef.current;
      pendingAssistantMessageRef.current = null;
      currentProjectState.addMessage(messageToAdd);
    }
  }, [messageStream.isGenerating, currentProjectState.addMessage]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await projectList.deleteProject(projectId);
    if (currentProjectState.currentProject?.id === projectId) {
      currentProjectState.clearCurrentProject();
    }
  }, [projectList, currentProjectState]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentProjectState.currentProject) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content,
      timestamp: new Date(),
    };
    currentProjectState.addMessage(userMessage);
    
    agentStatusState.setAgentStatus({ ...defaultAgentStatus, message: 'Starting...' });
    fileChangesRef.current = [];
    accumulatedTextRef.current = '';

    messageStream.startStreaming();

    const currentMessages = [...currentProjectState.messages, userMessage];

    const handleEvent = (event: AgentEvent) => {
      switch (event.type) {
        case AgentEventType.Status:
          agentStatusState.updateStatusMessage(event.data.message || '');
          break;

        case AgentEventType.ToolStart: {
          messageStream.addToolStart(event.data.tool || '', event.data.args);
          agentStatusState.setCurrentTool(event.data.tool, event.data.args);
          agentStatusState.updateStatusMessage(getToolMessage(event.data.tool, event.data.args));
          break;
        }

        case AgentEventType.ToolEnd:
          messageStream.completeToolCall(event.data.tool || '', event.data.result);
          agentStatusState.setCurrentTool(undefined);
          break;

        case AgentEventType.FileChanged: {
          const action =
            event.data.action === 'create'
              ? FileChangeAction.Create
              : event.data.action === 'delete'
              ? FileChangeAction.Delete
              : FileChangeAction.Update;
          const change: FileChange = {
            path: event.data.path || 'unknown',
            action,
            timestamp: new Date(),
          };
          fileChangesRef.current.push(change);
          agentStatusState.addFileChange(change);
          agentStatusState.updateStatusMessage(
            `${action.charAt(0).toUpperCase() + action.slice(1)}d ${event.data.path}`
          );
          break;
        }

        case AgentEventType.PlanCreated: {
          const tasks = (event.data.tasks as any[])?.map((t) => ({
            id: t.id || '',
            description: t.description || '',
            status:
              t.status === 'in_progress'
                ? PlanTaskStatus.InProgress
                : t.status === 'completed'
                ? PlanTaskStatus.Completed
                : PlanTaskStatus.Pending,
          })) || [];
          messageStream.setPlanTasks(tasks);
          agentStatusState.updateStatusMessage(`Planning ${tasks.length} tasks...`);
          break;
        }

        case AgentEventType.TaskUpdated: {
          const newStatus =
            event.data.status === 'in_progress'
              ? PlanTaskStatus.InProgress
              : event.data.status === 'completed'
              ? PlanTaskStatus.Completed
              : PlanTaskStatus.Pending;
          messageStream.updateTaskStatus(event.data.taskId, newStatus);
          break;
        }

        case AgentEventType.TextDelta: {
          const deltaText = event.data.text || '';
          accumulatedTextRef.current += deltaText;
          agentStatusState.setAgentStatus((prev) => ({
            ...prev,
            accumulatedText: accumulatedTextRef.current,
          }));
          messageStream.addTextDelta(deltaText);
          break;
        }

        case AgentEventType.Error:
          agentStatusState.setError(event.data.message || 'An error occurred');
          messageStream.stopStreaming();
          messageStream.clearStreaming();
          currentProjectState.addMessage({
            id: Date.now().toString(),
            role: MessageRole.System,
            content: event.data.message || 'An error occurred',
            timestamp: new Date(),
          });
          break;

        case AgentEventType.Complete: {
          agentStatusState.setComplete();
          const finalContent = event.data.response || accumulatedTextRef.current;
          
          const serializedStreamItems = messageStream.streamingItemsRef.current.map((item) => {
            if (item.type === 'text') {
              return { type: 'text', text: (item as TextStreamItem).text };
            } else {
              const toolItem = item as ToolCallStreamItem;
              return {
                type: 'toolCall',
                toolName: toolItem.toolCall.toolName,
                args: toolItem.toolCall.args,
                isComplete: toolItem.toolCall.isComplete,
                result: toolItem.toolCall.result,
              };
            }
          });
          
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: MessageRole.Assistant,
            content: finalContent,
            timestamp: new Date(),
            metadata: {
              previewUrl: event.data.previewUrl,
              filesChanged: fileChangesRef.current.map((f) => ({ path: f.path, action: f.action })),
              streamItems: serializedStreamItems,
            },
          };
          
          pendingAssistantMessageRef.current = assistantMessage;
          messageStream.clearStreaming();

          if (event.data.previewUrl) {
            currentProjectState.setCurrentProject((prev) =>
              prev ? { ...prev, previewUrl: event.data.previewUrl } : prev
            );
          }
          messageStream.stopStreaming();
          break;
        }
      }
    };

    try {
      await projectService.generateCodeStream(
        currentProjectState.currentProject.id,
        content,
        currentMessages,
        handleEvent,
        (err) => {
          setError(err.message);
          messageStream.stopStreaming();
        },
        () => {}
      );
    } catch (e: any) {
      setError(e.message);
      messageStream.stopStreaming();
    }
  }, [currentProjectState, agentStatusState, messageStream]);

  const cancelGeneration = useCallback(() => {
    projectService.cancelGeneration();
    messageStream.stopStreaming();
    messageStream.clearStreaming();
    agentStatusState.resetAgentStatus();
  }, [messageStream, agentStatusState]);

  const clearError = useCallback(() => {
    setError(null);
    projectList.clearError();
  }, [projectList]);

  const isLoading = projectList.isLoading || currentProjectState.isLoading;
  const combinedError = error || projectList.error;

  return (
    <ProjectContext.Provider
      value={{
        projects: projectList.projects,
        currentProject: currentProjectState.currentProject,
        messages: currentProjectState.messages,
        isLoading,
        isGenerating: messageStream.isGenerating,
        error: combinedError,
        agentStatus: agentStatusState.agentStatus,
        streamingMessage: messageStream.streamingMessage,
        streamingItems: messageStream.streamingItems,
        planTasks: messageStream.planTasks,
        loadProjects: projectList.loadProjects,
        createProject: projectList.createProject,
        selectProject: currentProjectState.selectProject,
        clearCurrentProject: currentProjectState.clearCurrentProject,
        deleteProject: handleDeleteProject,
        sendMessage,
        cancelGeneration,
        clearError,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
