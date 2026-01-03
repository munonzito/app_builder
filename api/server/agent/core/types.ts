/**
 * Core Types for the Unified Agent Architecture
 *
 * Central type definitions used across the agent system.
 */

import type { Tool } from 'ai'
import type { VirtualFS } from '../../utils/virtualFS'

// =============================================================================
// CONTEXT & CONFIGURATION
// =============================================================================

export interface AgentContext {
  fs: VirtualFS
  projectName: string
  metadata?: Record<string, unknown>
}

export interface AgentConfig {
  context: AgentContext
  maxSteps?: number
  toolProviders: ToolProvider[]
  middleware?: Middleware[]
  systemPrompt?: string
}

export interface ToolCallPart {
  type: 'tool-call'
  toolCallId: string
  toolName: string
  args: Record<string, unknown>
}

export interface ToolResultPart {
  type: 'tool-result'
  toolCallId: string
  toolName: string
  result: unknown
}

export interface TextPart {
  type: 'text'
  text: string
}

export type MessageContent = string | (TextPart | ToolCallPart | ToolResultPart)[]

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: MessageContent
}

// =============================================================================
// TOOL SYSTEM
// =============================================================================

export interface ToolProvider {
  name: string
  description?: string
  tools: (ctx: AgentContext) => Record<string, Tool>
}

export type ToolFactory<T = unknown> = (ctx: AgentContext) => Tool<T>

export function defineToolProvider(provider: ToolProvider): ToolProvider {
  return provider
}

// =============================================================================
// MIDDLEWARE SYSTEM
// =============================================================================

export interface MiddlewareContext {
  agentContext: AgentContext
  step: number
  tools: Record<string, Tool>
}

export interface Middleware {
  name: string
  priority?: number // Lower runs first, default 100

  onAgentStart?: (ctx: MiddlewareContext) => void | Promise<void>
  onAgentEnd?: (ctx: MiddlewareContext, summary: AgentSummary) => void | Promise<void>
  onStepStart?: (ctx: MiddlewareContext) => void | Promise<void>
  onStepEnd?: (ctx: MiddlewareContext) => void | Promise<void>
  onToolStart?: (ctx: MiddlewareContext, tool: string, args: unknown) => void | Promise<void>
  onToolEnd?: (ctx: MiddlewareContext, tool: string, result: unknown) => void | Promise<void>
  onError?: (ctx: MiddlewareContext, error: Error) => void | Promise<void>
}

export function defineMiddleware(middleware: Middleware): Middleware {
  return { priority: 100, ...middleware }
}

// =============================================================================
// EVENTS
// =============================================================================

export interface PlanTask {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface AgentSummary {
  totalSteps: number
  toolCalls: number
  filesChanged: string[]
  errors: string[]
  durationMs: number
  /** Final conversation messages including tool calls and results (AI SDK format) */
  conversationMessages?: unknown[]
}

export type AgentEvent =
  | { type: 'status'; message: string }
  | { type: 'step_start'; step: number; maxSteps: number }
  | { type: 'step_end'; step: number }
  | { type: 'tool_start'; tool: string; args: Record<string, unknown> }
  | { type: 'tool_end'; tool: string; result: unknown }
  | { type: 'file_changed'; path: string; action: 'create' | 'update' | 'delete' }
  | { type: 'plan_created'; tasks: PlanTask[] }
  | { type: 'task_updated'; taskId: string; status: PlanTask['status'] }
  | { type: 'text_delta'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done'; summary: AgentSummary }

// =============================================================================
// CALLBACKS (for tool providers)
// =============================================================================

export interface AgentCallbacks {
  onFileChange?: (path: string, action: 'create' | 'update' | 'delete') => void
  onPlanCreated?: (tasks: PlanTask[]) => void
  onTaskStatusChanged?: (taskId: string, status: PlanTask['status']) => void
}

export interface ToolContext extends AgentContext {
  callbacks: AgentCallbacks
}
