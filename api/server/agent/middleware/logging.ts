/**
 * Logging Middleware
 *
 * Logs agent activity for debugging and monitoring.
 */

import { defineMiddleware } from '../core/types'

export const loggingMiddleware = defineMiddleware({
  name: 'logging',
  priority: 10, // Run early

  onAgentStart: async (ctx) => {
    console.log(`[Agent] Starting - Project: ${ctx.agentContext.projectName}`)
  },

  onAgentEnd: async (ctx, summary) => {
    console.log(`[Agent] Completed in ${summary.durationMs}ms`)
    console.log(`[Agent] Steps: ${summary.totalSteps}, Tool calls: ${summary.toolCalls}`)
    if (summary.filesChanged.length > 0) {
      console.log(`[Agent] Files changed: ${summary.filesChanged.join(', ')}`)
    }
    if (summary.errors.length > 0) {
      console.log(`[Agent] Errors: ${summary.errors.length}`)
    }
  },

  onToolStart: async (ctx, tool, args) => {
    console.log(`[Agent] Tool start: ${tool}`, JSON.stringify(args).slice(0, 100))
  },

  onToolEnd: async (ctx, tool, result) => {
    const resultStr = JSON.stringify(result)
    console.log(`[Agent] Tool end: ${tool}`, resultStr.slice(0, 100))
  },

  onError: async (ctx, error) => {
    console.error(`[Agent] Error at step ${ctx.step}:`, error.message)
  },
})
