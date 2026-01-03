export enum AgentEventType {
  Status = 'status',
  ToolStart = 'tool_start',
  ToolEnd = 'tool_end',
  FileChanged = 'file_changed',
  PlanCreated = 'plan_created',
  TaskUpdated = 'task_updated',
  TextDelta = 'text_delta',
  Error = 'error',
  Complete = 'complete',
}

export enum PlanTaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export interface PlanTask {
  id: string;
  description: string;
  status: PlanTaskStatus;
}

export interface AgentEvent {
  type: AgentEventType;
  data: Record<string, any>;
}

export function parseAgentEvent(eventType: string, data: Record<string, any>): AgentEvent {
  const type = {
    status: AgentEventType.Status,
    tool_start: AgentEventType.ToolStart,
    tool_end: AgentEventType.ToolEnd,
    file_changed: AgentEventType.FileChanged,
    plan_created: AgentEventType.PlanCreated,
    task_updated: AgentEventType.TaskUpdated,
    text_delta: AgentEventType.TextDelta,
    error: AgentEventType.Error,
    complete: AgentEventType.Complete,
  }[eventType] || AgentEventType.Status;

  return { type, data };
}

export enum FileChangeAction {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export interface FileChange {
  path: string;
  action: FileChangeAction;
  timestamp: Date;
}

export interface AgentStatus {
  message: string;
  currentTool?: string;
  toolArgs?: Record<string, any>;
  fileChanges: FileChange[];
  accumulatedText: string;
  isComplete: boolean;
  error?: string;
}

export type StreamItem = TextStreamItem | ToolCallStreamItem;

export interface TextStreamItem {
  type: 'text';
  id: string;
  text: string;
  timestamp: Date;
}

export interface ToolCallStreamItem {
  type: 'toolCall';
  id: string;
  toolCall: ToolCall;
  timestamp: Date;
}

export interface ToolCall {
  id: string;
  toolName: string;
  args?: Record<string, any>;
  isComplete: boolean;
  result?: any;
}

export function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    writeFile: 'CREATE',
    patchFile: 'EDIT',
    readFile: 'READ',
    listFiles: 'LIST',
    deleteFile: 'DELETE',
    renameFile: 'RENAME',
    searchFiles: 'SEARCH',
    validateProject: 'VALIDATE',
    addDependency: 'ADD DEP',
    removeDependency: 'REMOVE DEP',
    getDependencies: 'GET DEPS',
    setDependencies: 'SET DEPS',
    getErrors: 'GET ERRORS',
    getProjectSummary: 'SUMMARY',
    createPlan: 'PLAN',
    updateTaskStatus: 'TASK',
    updateProjectContext: 'CONTEXT',
  };
  return labels[toolName] || toolName.toUpperCase();
}

export function getToolContextText(toolName: string, args?: Record<string, any>): string | undefined {
  if (!args) return undefined;

  switch (toolName) {
    case 'writeFile':
    case 'patchFile':
    case 'readFile':
    case 'deleteFile':
      return args.path;
    case 'renameFile':
      return `${args.oldPath} → ${args.newPath}`;
    case 'searchFiles':
      return args.query;
    case 'addDependency':
    case 'removeDependency':
      return args.name;
    default:
      return undefined;
  }
}
