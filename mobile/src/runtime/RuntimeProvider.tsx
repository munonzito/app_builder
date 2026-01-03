import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as Files from './Files';
import * as Logger from './Logger';

type RuntimeState = {
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  projectId: string | null;
};

type RuntimeContextType = {
  state: RuntimeState;
  loadProject: (projectId: string, files: Record<string, { type: 'CODE' | 'ASSET'; contents: string }>) => Promise<void>;
  startRuntime: () => void;
  stopRuntime: () => void;
  clearError: () => void;
};

const RuntimeContext = createContext<RuntimeContextType | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RuntimeState>({
    isLoading: false,
    isRunning: false,
    error: null,
    projectId: null,
  });

  const loadProject = useCallback(async (
    projectId: string,
    files: Record<string, { type: 'CODE' | 'ASSET'; contents: string }>
  ) => {
    Logger.info('Loading project:', projectId);
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear existing files and load new ones
      Files.clear();
      Files.updateProjectFiles(files);
      
      Logger.info('Files loaded:', Files.list());
      Logger.info('Entry point:', Files.entry());

      setState(prev => ({
        ...prev,
        isLoading: false,
        projectId,
      }));
    } catch (err: any) {
      Logger.error('Failed to load project:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to load project',
      }));
    }
  }, []);

  const startRuntime = useCallback(() => {
    Logger.info('Starting runtime');
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const stopRuntime = useCallback(() => {
    Logger.info('Stopping runtime');
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <RuntimeContext.Provider value={{ state, loadProject, startRuntime, stopRuntime, clearError }}>
      {children}
    </RuntimeContext.Provider>
  );
}

export function useRuntime() {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
}
