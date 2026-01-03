/**
 * RuntimeScreen - Full-screen native renderer for generated apps
 * 
 * This screen takes over the full app to render a generated React Native app natively.
 * It uses the ported Snack runtime for transpilation and execution.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import * as Modules from './Modules';
import * as Files from './Files';
import * as Logger from './Logger';
import * as Errors from './Errors';
import LoadingView from './LoadingView';
import { ApiConfig } from '../config/api';
import { AppColors } from '../utils/styles';
import { authService } from '../services/authService';

type RuntimeScreenProps = {
  projectId: string;
  onExit: () => void;
};

type RuntimeState = {
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  rootElement: React.ReactElement | null;
};

export function RuntimeScreen({ projectId, onExit }: RuntimeScreenProps) {
  const [state, setState] = useState<RuntimeState>({
    isLoading: true,
    isInitializing: true,
    error: null,
    rootElement: null,
  });

  const modulesInitialized = useRef(false);

  // Initialize modules on mount
  useEffect(() => {
    activateKeepAwake();
    
    const initModules = async () => {
      if (!modulesInitialized.current) {
        Logger.info('Initializing modules...');
        await Modules.initialize();
        modulesInitialized.current = true;
        Logger.info('Modules initialized');
      }
      setState(prev => ({ ...prev, isInitializing: false }));
    };

    initModules();

    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // Fetch and load project when initialization is complete
  useEffect(() => {
    if (state.isInitializing) return;

    const loadProject = async () => {
      Logger.info('Loading project:', projectId);
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Get auth token
        const token = await authService.getIdToken();
        
        // Fetch project files from runtime API endpoint
        const response = await fetch(`${ApiConfig.baseUrl}/api/runtime/${projectId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const project = await response.json();
        
        if (!project.files) {
          throw new Error('Project has no files');
        }

        // Convert files to the format expected by Files module
        const filesMap: Record<string, { type: 'CODE' | 'ASSET'; contents: string }> = {};
        for (const [path, content] of Object.entries(project.files)) {
          const isAsset = /\.(png|jpg|jpeg|gif|svg|webp|mp3|mp4|wav|ttf|otf)$/i.test(path);
          filesMap[path] = {
            type: isAsset ? 'ASSET' : 'CODE',
            contents: content as string,
          };
        }

        // Update dependencies if present
        if (project.dependencies) {
          await Modules.updateProjectDependencies(project.dependencies);
        }

        // Load files into the runtime
        Files.updateProjectFiles(filesMap);
        Logger.info('Files loaded:', Files.list());
        Logger.info('Entry point:', Files.entry());

        // Load and render the root module
        await reloadModules();

      } catch (err: any) {
        Logger.error('Failed to load project:', err);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err.message || 'Failed to load project',
        }));
      }
    };

    loadProject();
  }, [projectId, state.isInitializing]);

  const reloadModules = useCallback(async () => {
    Logger.info('Reloading modules...');
    
    try {
      const rootModuleUri = 'module://' + Files.entry();
      
      // Flush and reload
      await Modules.flush({ changedPaths: Files.list(), changedUris: [rootModuleUri] });
      
      const hasRootModule = await Modules.has(rootModuleUri);
      
      if (!hasRootModule) {
        const rootModule = await Modules.load(rootModuleUri);
        const rootDefaultExport = rootModule.default;
        
        if (!rootDefaultExport) {
          throw new Error(`No default export in '${Files.entry()}'`);
        }

        Logger.info('Creating root element');
        const rootElement = React.createElement(rootDefaultExport);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          rootElement,
        }));
      }
    } catch (err: any) {
      Logger.error('Failed to reload modules:', err);
      Errors.report(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to load app',
      }));
    }
  }, []);

  // Render loading state
  if (state.isInitializing || state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>
          {state.isInitializing ? 'Initializing runtime...' : 'Loading app...'}
        </Text>
      </View>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Failed to Load App</Text>
        <Text style={styles.errorMessage}>{state.error}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render the generated app with exit button overlay
  return (
    <View style={styles.container}>
      <Errors.ErrorBoundary>
        {state.rootElement}
      </Errors.ErrorBoundary>
      
      {/* Floating exit button */}
      <TouchableOpacity style={styles.floatingExitButton} onPress={onExit}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 16,
    color: '#888',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  exitButton: {
    marginTop: 24,
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  floatingExitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
