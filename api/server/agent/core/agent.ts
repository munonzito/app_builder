/**
 * Unified Agent Runner
 *
 * Core agent execution logic with streaming support.
 * Consolidates V1/V2/V3 agent implementations into a single, configurable runner.
 */

import { streamText, type ModelMessage } from 'ai'
import { createModel } from '../../utils/providers'
import { createToolRegistry } from '../tools'
import { createMiddlewareManager } from '../middleware'
import type {
  AgentConfig,
  AgentContext,
  AgentEvent,
  AgentCallbacks,
  Message,
  PlanTask,
} from './types'

const DEFAULT_MAX_STEPS = 50

/**
 * Run the agent with streaming events
 */
export async function* runAgent(
  messages: Message[],
  config: AgentConfig
): AsyncGenerator<AgentEvent> {
  const {
    context,
    maxSteps = DEFAULT_MAX_STEPS,
    toolProviders,
    middleware = [],
    systemPrompt,
  } = config

  // Event collectors for callbacks
  const fileChanges: Array<{ path: string; action: 'create' | 'update' | 'delete' }> = []
  const planTasks: PlanTask[] = []

  // Create callbacks that will be passed to tools
  const callbacks: AgentCallbacks = {
    onFileChange: (path, action) => {
      fileChanges.push({ path, action })
    },
    onPlanCreated: (tasks) => {
      planTasks.push(...tasks)
    },
    onTaskStatusChanged: (taskId, status) => {
      const task = planTasks.find((t) => t.id === taskId)
      if (task) task.status = status
    },
  }

  // Build tools from providers
  const registry = createToolRegistry(toolProviders)
  const tools = registry.build(context, callbacks)

  // Initialize middleware manager
  const middlewareManager = createMiddlewareManager(context, tools, maxSteps, middleware)

  // Get the AI model
  const model = createModel()

  // Initialize conversation messages (supports both simple strings and full AI SDK format)
  const conversationMessages: ModelMessage[] = messages.map((m) => {
    // Pass through messages as-is since they may contain tool calls/results
    return {
      role: m.role as 'user' | 'assistant' | 'tool',
      content: m.content,
    } as ModelMessage
  })

  // Start agent
  yield { type: 'status', message: 'Starting agent...' }
  await middlewareManager.onAgentStart()

  let step = 0

  try {
    while (step < maxSteps) {
      step++
      middlewareManager.setStep(step)

      yield { type: 'step_start', step, maxSteps }
      await middlewareManager.onStepStart()

      // Stream the model response
      const result = streamText({
        model: model as any,
        system: systemPrompt,
        messages: conversationMessages,
        tools: tools as any,
      })

      let stepText = ''
      let hasToolCalls = false

      // Process the stream
      for await (const part of result.fullStream) {
        switch (part.type) {
          case 'text-delta':
            stepText += part.text
            yield { type: 'text_delta', text: part.text }
            break

          case 'tool-call':
            hasToolCalls = true
            const toolArgs = (part as any).input as Record<string, unknown>
            yield { type: 'tool_start', tool: part.toolName, args: toolArgs }
            await middlewareManager.onToolStart(part.toolName, toolArgs)
            break

          case 'tool-result': {
            const toolResult = (part as any).output as Record<string, unknown> | undefined
            const toolInput = (part as any).input as Record<string, unknown> | undefined

            yield { type: 'tool_end', tool: part.toolName, result: toolResult }
            await middlewareManager.onToolEnd(part.toolName, toolResult)

            // Emit file change events
            if (isFileChangeTool(part.toolName) && toolResult?.success) {
              const filePath = extractFilePath(part.toolName, toolInput, toolResult)
              if (filePath) {
                const action = getFileAction(part.toolName, toolResult)
                yield { type: 'file_changed', path: filePath, action }
                middlewareManager.recordFileChange(filePath)
              }
            }

            // Emit plan events
            if (isPlanTool(part.toolName, toolResult)) {
              if (part.toolName === 'CreatePlan' || part.toolName === 'createPlan') {
                yield { type: 'plan_created', tasks: toolResult?.tasks as PlanTask[] }
              } else if (
                part.toolName === 'UpdateTaskStatus' ||
                part.toolName === 'updateTaskStatus'
              ) {
                yield {
                  type: 'task_updated',
                  taskId: toolInput?.taskId as string,
                  status: toolInput?.status as PlanTask['status'],
                }
              }
            }
            break
          }

          case 'error':
            const error = new Error(String(part.error))
            yield { type: 'error', message: error.message }
            await middlewareManager.onError(error)
            break
        }
      }

      // Get final result and update conversation
      const finalResult = await result.response
      conversationMessages.push(...finalResult.messages)

      yield { type: 'step_end', step }
      await middlewareManager.onStepEnd()

      // If no tool calls, we're done
      if (!hasToolCalls) {
        break
      }
    }

    // Agent completed
    await middlewareManager.onAgentEnd()
    const summary = middlewareManager.buildSummary()
    // Include conversation messages for multi-turn context preservation
    summary.conversationMessages = conversationMessages
    yield { type: 'done', summary }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    yield { type: 'error', message: err.message }
    await middlewareManager.onError(err)

    const summary = middlewareManager.buildSummary()
    // Include conversation messages even on error for context preservation
    summary.conversationMessages = conversationMessages
    yield { type: 'done', summary }
  }
}

/**
 * Run agent without streaming (returns final result)
 */
export async function runAgentSync(
  messages: Message[],
  config: AgentConfig
): Promise<{ text: string; toolCalls: Array<{ name: string; args: unknown; result: unknown }> }> {
  let fullText = ''
  const toolCalls: Array<{ name: string; args: unknown; result: unknown }> = []

  for await (const event of runAgent(messages, config)) {
    switch (event.type) {
      case 'text_delta':
        fullText += event.text
        break
      case 'tool_end':
        toolCalls.push({
          name: event.tool,
          args: {}, // Not tracked in events
          result: event.result,
        })
        break
    }
  }

  return { text: fullText, toolCalls }
}

// =============================================================================
// HELPERS
// =============================================================================

const FILE_CHANGE_TOOLS = new Set([
  'Create',
  'Edit',
  'writeFile',
  'patchFile',
  'deleteFile',
  'renameFile',
])

function isFileChangeTool(toolName: string): boolean {
  return FILE_CHANGE_TOOLS.has(toolName)
}

function extractFilePath(
  toolName: string,
  input?: Record<string, unknown>,
  result?: Record<string, unknown>
): string | undefined {
  if (result?.path) return result.path as string
  if (input?.path) return input.path as string
  if (input?.filePath) return input.filePath as string
  return undefined
}

function getFileAction(
  toolName: string,
  result?: Record<string, unknown>
): 'create' | 'update' | 'delete' {
  if (toolName === 'Create' || result?.created) return 'create'
  if (toolName === 'deleteFile') return 'delete'
  return 'update'
}

function isPlanTool(toolName: string, result?: Record<string, unknown>): boolean {
  if (!result?.success) return false
  return (
    toolName === 'CreatePlan' ||
    toolName === 'createPlan' ||
    toolName === 'UpdateTaskStatus' ||
    toolName === 'updateTaskStatus'
  )
}
