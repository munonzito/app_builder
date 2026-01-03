import { useState, useCallback } from 'react';
import { FileChange } from '../models';

export interface AgentStatus {
  message: string;
  fileChanges: FileChange[];
  accumulatedText: string;
  isComplete: boolean;
  currentTool?: string;
  toolArgs?: Record<string, any>;
  error?: string;
}

const defaultAgentStatus: AgentStatus = {
  message: '',
  fileChanges: [],
  accumulatedText: '',
  isComplete: false,
};

interface UseAgentStatusResult {
  agentStatus: AgentStatus;
  setAgentStatus: React.Dispatch<React.SetStateAction<AgentStatus>>;
  resetAgentStatus: () => void;
  updateStatusMessage: (message: string) => void;
  setCurrentTool: (toolName: string | undefined, args?: Record<string, any>) => void;
  addFileChange: (change: FileChange) => void;
  setError: (error: string) => void;
  setComplete: () => void;
}

export function useAgentStatus(): UseAgentStatusResult {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(defaultAgentStatus);

  const resetAgentStatus = useCallback(() => {
    setAgentStatus(defaultAgentStatus);
  }, []);

  const updateStatusMessage = useCallback((message: string) => {
    setAgentStatus((prev) => ({ ...prev, message }));
  }, []);

  const setCurrentTool = useCallback((toolName: string | undefined, args?: Record<string, any>) => {
    setAgentStatus((prev) => ({
      ...prev,
      currentTool: toolName,
      toolArgs: args,
    }));
  }, []);

  const addFileChange = useCallback((change: FileChange) => {
    setAgentStatus((prev) => ({
      ...prev,
      fileChanges: [...prev.fileChanges, change],
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setAgentStatus((prev) => ({ ...prev, error, isComplete: true }));
  }, []);

  const setComplete = useCallback(() => {
    setAgentStatus((prev) => ({ ...prev, isComplete: true, message: 'Complete!' }));
  }, []);

  return {
    agentStatus,
    setAgentStatus,
    resetAgentStatus,
    updateStatusMessage,
    setCurrentTool,
    addFileChange,
    setError,
    setComplete,
  };
}

export { defaultAgentStatus };
