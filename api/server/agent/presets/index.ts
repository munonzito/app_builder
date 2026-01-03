/**
 * Agent Presets
 *
 * Pre-configured agent configurations for different use cases.
 */

import type { AgentConfig, AgentContext, ToolProvider, Middleware } from '../core/types'
import { fileToolsProvider } from '../tools/file'
import { planningToolsProvider } from '../tools/planning'
import { validationToolsProvider } from '../tools/validation'
import { loggingMiddleware } from '../middleware/logging'
import { fileTrackingMiddleware } from '../middleware/file-tracking'
import { rateLimitingMiddleware } from '../middleware/rate-limiting'
import { buildDefaultPrompt } from '../core/prompt-builder'

// =============================================================================
// PRESET TYPES
// =============================================================================

export type PresetName = 'default' | 'minimal' | 'full'

export interface PresetOptions {
  maxSteps?: number
  enableLogging?: boolean
  enableRateLimiting?: boolean
  additionalTools?: ToolProvider[]
  additionalMiddleware?: Middleware[]
  customPrompt?: string
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Default preset
 * Uses Factory-style tools: Read, Create, Edit, LS, Grep + Planning
 */
export function createDefaultPreset(
  context: AgentContext,
  options: PresetOptions = {}
): AgentConfig {
  const toolProviders: ToolProvider[] = [
    fileToolsProvider,
    planningToolsProvider,
    ...(options.additionalTools || []),
  ]

  const middleware: Middleware[] = [
    fileTrackingMiddleware,
    ...(options.enableLogging !== false ? [loggingMiddleware] : []),
    ...(options.enableRateLimiting !== false ? [rateLimitingMiddleware] : []),
    ...(options.additionalMiddleware || []),
  ]

  return {
    context,
    maxSteps: options.maxSteps ?? 50,
    toolProviders,
    middleware,
    systemPrompt: options.customPrompt ?? buildDefaultPrompt(),
  }
}

/**
 * Minimal preset
 * Only file tools, no planning or validation
 */
export function createMinimalPreset(
  context: AgentContext,
  options: PresetOptions = {}
): AgentConfig {
  const toolProviders: ToolProvider[] = [
    fileToolsProvider,
    ...(options.additionalTools || []),
  ]

  const middleware: Middleware[] = [
    ...(options.enableLogging ? [loggingMiddleware] : []),
    ...(options.enableRateLimiting !== false ? [rateLimitingMiddleware] : []),
    ...(options.additionalMiddleware || []),
  ]

  return {
    context,
    maxSteps: options.maxSteps ?? 30,
    toolProviders,
    middleware,
    systemPrompt: options.customPrompt ?? buildDefaultPrompt(),
  }
}

/**
 * Full preset
 * All tools including validation
 */
export function createFullPreset(
  context: AgentContext,
  options: PresetOptions = {}
): AgentConfig {
  const toolProviders: ToolProvider[] = [
    fileToolsProvider,
    planningToolsProvider,
    validationToolsProvider,
    ...(options.additionalTools || []),
  ]

  const middleware: Middleware[] = [
    fileTrackingMiddleware,
    ...(options.enableLogging !== false ? [loggingMiddleware] : []),
    ...(options.enableRateLimiting !== false ? [rateLimitingMiddleware] : []),
    ...(options.additionalMiddleware || []),
  ]

  return {
    context,
    maxSteps: options.maxSteps ?? 50,
    toolProviders,
    middleware,
    systemPrompt: options.customPrompt ?? buildDefaultPrompt(),
  }
}

/**
 * Get a preset by name
 */
export function getPreset(
  name: PresetName,
  context: AgentContext,
  options: PresetOptions = {}
): AgentConfig {
  switch (name) {
    case 'default':
      return createDefaultPreset(context, options)
    case 'minimal':
      return createMinimalPreset(context, options)
    case 'full':
      return createFullPreset(context, options)
    default:
      return createDefaultPreset(context, options)
  }
}

// =============================================================================
// CUSTOM PRESET BUILDER
// =============================================================================

export class PresetBuilder {
  private toolProviders: ToolProvider[] = []
  private middlewares: Middleware[] = []
  private maxSteps = 50
  private systemPrompt?: string

  addTools(...providers: ToolProvider[]): this {
    this.toolProviders.push(...providers)
    return this
  }

  addMiddleware(...middlewares: Middleware[]): this {
    this.middlewares.push(...middlewares)
    return this
  }

  setMaxSteps(steps: number): this {
    this.maxSteps = steps
    return this
  }

  setPrompt(prompt: string): this {
    this.systemPrompt = prompt
    return this
  }

  build(context: AgentContext): AgentConfig {
    return {
      context,
      maxSteps: this.maxSteps,
      toolProviders: this.toolProviders,
      middleware: this.middlewares,
      systemPrompt: this.systemPrompt ?? buildDefaultPrompt(),
    }
  }
}

/**
 * Create a custom preset builder
 */
export function createPresetBuilder(): PresetBuilder {
  return new PresetBuilder()
}
