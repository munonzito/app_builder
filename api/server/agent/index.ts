/**
 * Unified Agent System
 *
 * Main exports for the agent architecture.
 *
 * @example Basic usage with preset
 * ```typescript
 * import { runAgent, createDefaultPreset } from '../agent'
 *
 * const config = createDefaultPreset({ fs, projectName: 'MyApp' })
 *
 * for await (const event of runAgent(messages, config)) {
 *   switch (event.type) {
 *     case 'text_delta':
 *       process.stdout.write(event.text)
 *       break
 *     case 'tool_start':
 *       console.log(`Tool: ${event.tool}`)
 *       break
 *     case 'done':
 *       console.log(`Completed in ${event.summary.durationMs}ms`)
 *       break
 *   }
 * }
 * ```
 *
 * @example Custom configuration
 * ```typescript
 * import { runAgent, createPresetBuilder, fileToolsProvider, loggingMiddleware } from '../agent'
 *
 * const config = createPresetBuilder()
 *   .addTools(fileToolsProvider, myCustomTools)
 *   .addMiddleware(loggingMiddleware)
 *   .setMaxSteps(30)
 *   .setPrompt(myCustomPrompt)
 *   .build({ fs, projectName: 'MyApp' })
 *
 * for await (const event of runAgent(messages, config)) {
 *   // handle events
 * }
 * ```
 *
 * @example Adding custom tools
 * ```typescript
 * import { defineToolProvider, z, tool } from '../agent'
 *
 * const myToolsProvider = defineToolProvider({
 *   name: 'my-tools',
 *   tools: (ctx) => ({
 *     MyTool: tool({
 *       description: 'Does something cool',
 *       inputSchema: z.object({ input: z.string() }),
 *       execute: async ({ input }) => ({ result: input.toUpperCase() })
 *     })
 *   })
 * })
 * ```
 */

// Core
export { runAgent, runAgentSync } from './core/agent'
export { defineToolProvider, defineMiddleware } from './core/types'
export type {
  AgentConfig,
  AgentContext,
  AgentEvent,
  AgentSummary,
  AgentCallbacks,
  Message,
  PlanTask,
  ToolProvider,
  ToolContext,
  Middleware,
  MiddlewareContext,
} from './core/types'

// Tools
export { ToolRegistry, createToolRegistry, z, tool } from './tools'
export { fileToolsProvider } from './tools/file'
export { planningToolsProvider } from './tools/planning'
export { validationToolsProvider } from './tools/validation'

// Middleware
export { MiddlewareManager, createMiddlewareManager } from './middleware'
export { loggingMiddleware } from './middleware/logging'
export { fileTrackingMiddleware } from './middleware/file-tracking'
export { rateLimitingMiddleware, createRateLimitingMiddleware } from './middleware/rate-limiting'

// Prompts
export {
  PromptBuilder,
  createPromptBuilder,
  buildDefaultPrompt,
  CORE_RULES,
  REACT_NATIVE_CONTEXT,
  WORKFLOW_GUIDELINES,
  PARALLEL_EXECUTION,
  ERROR_RECOVERY,
  CODE_PATTERNS,
  CODE_QUALITY,
  RESPONSE_GUIDELINES,
} from './core/prompt-builder'

// Presets
export {
  createDefaultPreset,
  createMinimalPreset,
  createFullPreset,
  getPreset,
  PresetBuilder,
  createPresetBuilder,
  type PresetName,
  type PresetOptions,
} from './presets'
