/**
 * Middleware System
 *
 * Manages middleware execution for the agent lifecycle.
 */

import type { Tool } from 'ai'
import type { AgentContext, AgentSummary, Middleware } from '../core/types'
import type { MiddlewareContext } from './types'

export class MiddlewareManager {
  private middlewares: Middleware[] = []
  private context: MiddlewareContext

  constructor(
    agentContext: AgentContext,
    tools: Record<string, Tool>,
    maxSteps: number
  ) {
    this.context = {
      agentContext,
      step: 0,
      maxSteps,
      tools,
      startTime: Date.now(),
      toolCalls: 0,
      filesChanged: new Set(),
      errors: [],
    }
  }

  /**
   * Add middleware to the chain
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware)
    // Sort by priority (lower first)
    this.middlewares.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    return this
  }

  /**
   * Add multiple middlewares
   */
  useAll(middlewares: Middleware[]): this {
    for (const mw of middlewares) {
      this.use(mw)
    }
    return this
  }

  /**
   * Update step counter
   */
  setStep(step: number): void {
    this.context.step = step
  }

  /**
   * Record a tool call
   */
  recordToolCall(): void {
    this.context.toolCalls++
  }

  /**
   * Record a file change
   */
  recordFileChange(path: string): void {
    this.context.filesChanged.add(path)
  }

  /**
   * Record an error
   */
  recordError(error: string): void {
    this.context.errors.push(error)
  }

  /**
   * Get current context
   */
  getContext(): MiddlewareContext {
    return this.context
  }

  /**
   * Build agent summary
   */
  buildSummary(): AgentSummary {
    return {
      totalSteps: this.context.step,
      toolCalls: this.context.toolCalls,
      filesChanged: Array.from(this.context.filesChanged),
      errors: this.context.errors,
      durationMs: Date.now() - this.context.startTime,
    }
  }

  /**
   * Run onAgentStart hooks
   */
  async onAgentStart(): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onAgentStart) {
        await mw.onAgentStart(this.context)
      }
    }
  }

  /**
   * Run onAgentEnd hooks
   */
  async onAgentEnd(): Promise<void> {
    const summary = this.buildSummary()
    for (const mw of this.middlewares) {
      if (mw.onAgentEnd) {
        await mw.onAgentEnd(this.context, summary)
      }
    }
  }

  /**
   * Run onStepStart hooks
   */
  async onStepStart(): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onStepStart) {
        await mw.onStepStart(this.context)
      }
    }
  }

  /**
   * Run onStepEnd hooks
   */
  async onStepEnd(): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onStepEnd) {
        await mw.onStepEnd(this.context)
      }
    }
  }

  /**
   * Run onToolStart hooks
   */
  async onToolStart(tool: string, args: unknown): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onToolStart) {
        await mw.onToolStart(this.context, tool, args)
      }
    }
  }

  /**
   * Run onToolEnd hooks
   */
  async onToolEnd(tool: string, result: unknown): Promise<void> {
    this.recordToolCall()
    for (const mw of this.middlewares) {
      if (mw.onToolEnd) {
        await mw.onToolEnd(this.context, tool, result)
      }
    }
  }

  /**
   * Run onError hooks
   */
  async onError(error: Error): Promise<void> {
    this.recordError(error.message)
    for (const mw of this.middlewares) {
      if (mw.onError) {
        await mw.onError(this.context, error)
      }
    }
  }
}

/**
 * Create a middleware manager
 */
export function createMiddlewareManager(
  agentContext: AgentContext,
  tools: Record<string, Tool>,
  maxSteps: number,
  middlewares?: Middleware[]
): MiddlewareManager {
  const manager = new MiddlewareManager(agentContext, tools, maxSteps)
  if (middlewares) {
    manager.useAll(middlewares)
  }
  return manager
}

// Re-export types
export * from './types'
