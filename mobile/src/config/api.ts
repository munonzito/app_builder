import { Platform } from 'react-native';

export type AgentPreset = 'default' | 'minimal' | 'full';
export type AgentBackend = 'unified' | 'droid';

export const ApiConfig = {
  useLocalBackend: true,  // Set to true for local development
  
  /**
   * Which agent backend to use:
   * - unified: Unified agent architecture with presets (default)
   * - droid: Factory AI Droid in E2B sandbox
   */
  agentBackend: 'unified' as AgentBackend,
  
  /**
   * Preset for unified agent (only when agentBackend is 'unified'):
   * - default: File tools + Planning (Read, Create, Edit, LS, Grep)
   * - minimal: Only file tools
   * - full: File + Planning + Validation
   */
  agentPreset: 'default' as AgentPreset,
  
  productionBackendUrl: 'https://app-builder-api.vercel.app',

  get localBackendUrl(): string {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // iOS simulator uses localhost directly
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  },

  get baseUrl(): string {
    return this.useLocalBackend ? this.localBackendUrl : this.productionBackendUrl;
  },
  
  get chatEndpoint(): string {
    switch (this.agentBackend) {
      case 'droid':
        return '/api/chat/generate-droid';
      case 'unified':
      default:
        return '/api/chat/generate';
    }
  },
};
