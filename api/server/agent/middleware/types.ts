/**
 * Middleware Types
 *
 * Type definitions for the middleware system.
 */

import type { Tool } from 'ai'
import type { AgentContext, AgentSummary, Middleware } from '../core/types'

export interface MiddlewareContext {
  agentContext: AgentContext
  step: number
  maxSteps: number
  tools: Record<string, Tool>
  startTime: number
  toolCalls: number
  filesChanged: Set<string>
  errors: string[]
}

export interface MiddlewareChain {
  run<T extends keyof MiddlewareHooks>(
    hook: T,
    ...args: Parameters<NonNullable<Middleware[T]>>
  ): Promise<void>
}

export type MiddlewareHooks = Pick<
  Middleware,
  | 'onAgentStart'
  | 'onAgentEnd'
  | 'onStepStart'
  | 'onStepEnd'
  | 'onToolStart'
  | 'onToolEnd'
  | 'onError'
>
