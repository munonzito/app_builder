/**
 * Tool Registry
 *
 * Central registry for managing tool providers.
 * Supports dynamic registration and provides tools to the agent.
 */

import type { Tool } from 'ai'
import type {
  AgentContext,
  ToolContext,
  ToolProvider,
  AgentCallbacks,
} from '../core/types'

export class ToolRegistry {
  private providers: Map<string, ToolProvider> = new Map()

  /**
   * Register a tool provider
   */
  register(provider: ToolProvider): this {
    if (this.providers.has(provider.name)) {
      console.warn(`Tool provider "${provider.name}" is being overwritten`)
    }
    this.providers.set(provider.name, provider)
    return this
  }

  /**
   * Register multiple providers at once
   */
  registerAll(providers: ToolProvider[]): this {
    for (const provider of providers) {
      this.register(provider)
    }
    return this
  }

  /**
   * Unregister a tool provider
   */
  unregister(name: string): this {
    this.providers.delete(name)
    return this
  }

  /**
   * Check if a provider is registered
   */
  has(name: string): boolean {
    return this.providers.has(name)
  }

  /**
   * Get registered provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Build all tools from registered providers
   */
  build(ctx: AgentContext, callbacks: AgentCallbacks = {}): Record<string, Tool> {
    const tools: Record<string, Tool> = {}

    // Create tool context with callbacks
    const toolCtx: ToolContext = {
      ...ctx,
      callbacks,
    }

    for (const provider of this.providers.values()) {
      // Call provider's tools function with context that includes callbacks
      const providerTools = provider.tools(toolCtx as AgentContext)
      Object.assign(tools, providerTools)
    }

    return tools
  }

  /**
   * Get tool count
   */
  getToolCount(ctx: AgentContext): number {
    const tools = this.build(ctx)
    return Object.keys(tools).length
  }

  /**
   * Clone the registry
   */
  clone(): ToolRegistry {
    const cloned = new ToolRegistry()
    for (const [name, provider] of this.providers) {
      cloned.providers.set(name, provider)
    }
    return cloned
  }
}

/**
 * Create a new tool registry with optional initial providers
 */
export function createToolRegistry(providers?: ToolProvider[]): ToolRegistry {
  const registry = new ToolRegistry()
  if (providers) {
    registry.registerAll(providers)
  }
  return registry
}

// Re-export types
export * from './types'
