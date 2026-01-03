/**
 * Rate Limiting Middleware
 *
 * Prevents runaway agent loops by limiting tool calls.
 */

import { defineMiddleware } from '../core/types'

export interface RateLimitConfig {
  maxToolCallsPerStep?: number
  maxTotalToolCalls?: number
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  maxToolCallsPerStep: 50,
  maxTotalToolCalls: 500,
}

export function createRateLimitingMiddleware(config?: RateLimitConfig) {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  
  let toolCallsThisStep = 0

  return defineMiddleware({
    name: 'rate-limiting',
    priority: 5, // Run very early

    onStepStart: async () => {
      toolCallsThisStep = 0
    },

    onToolStart: async (ctx, tool) => {
      toolCallsThisStep++

      // Check per-step limit
      if (toolCallsThisStep > cfg.maxToolCallsPerStep) {
        throw new Error(
          `Rate limit exceeded: ${toolCallsThisStep} tool calls in step ${ctx.step} (max: ${cfg.maxToolCallsPerStep})`
        )
      }

      // Check total limit
      if (ctx.toolCalls > cfg.maxTotalToolCalls) {
        throw new Error(
          `Rate limit exceeded: ${ctx.toolCalls} total tool calls (max: ${cfg.maxTotalToolCalls})`
        )
      }
    },
  })
}

export const rateLimitingMiddleware = createRateLimitingMiddleware()
