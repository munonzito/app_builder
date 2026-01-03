/**
 * Tool Types and Utilities
 *
 * Helper types and functions for creating tools.
 */

import { z } from 'zod'
import { tool, type Tool } from 'ai'
import type { AgentContext, ToolContext, ToolProvider } from '../core/types'

export { z, tool }
export type { Tool }

/**
 * Helper to create a tool with proper typing
 */
export function createTool<TInput extends z.ZodType>(options: {
  description: string
  inputSchema: TInput
  execute: (
    input: z.infer<TInput>,
    context: { toolCallId: string; messages: unknown[] }
  ) => Promise<unknown>
}): Tool {
  return tool(options)
}

/**
 * Helper to create a tool factory that receives context
 */
export function createToolFactory<TInput extends z.ZodType>(
  factory: (ctx: ToolContext) => {
    description: string
    inputSchema: TInput
    execute: (
      input: z.infer<TInput>,
      context: { toolCallId: string; messages: unknown[] }
    ) => Promise<unknown>
  }
): (ctx: ToolContext) => Tool {
  return (ctx) => {
    const config = factory(ctx)
    return tool(config)
  }
}

/**
 * Type-safe tool provider definition
 */
export function defineToolProvider(config: {
  name: string
  description?: string
  createTools: (ctx: ToolContext) => Record<string, Tool>
}): ToolProvider {
  return {
    name: config.name,
    description: config.description,
    tools: (agentCtx: AgentContext) => {
      // Create a ToolContext with empty callbacks (will be populated by registry)
      const toolCtx: ToolContext = {
        ...agentCtx,
        callbacks: {},
      }
      return config.createTools(toolCtx)
    },
  }
}
