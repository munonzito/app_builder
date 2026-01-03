/**
 * Planning Tools Provider
 *
 * Tools for task planning and tracking: CreatePlan, UpdateTaskStatus, UpdateProjectContext
 */

import { z, tool } from '../types'
import type { ToolContext, ToolProvider, PlanTask } from '../../core/types'

export const planningToolsProvider: ToolProvider = {
  name: 'planning',
  description: 'Task planning and progress tracking',
  tools: (ctx) => {
    const toolCtx = ctx as ToolContext

    return {
      CreatePlan: tool({
        description: `Create a structured plan to break down the current task into subtasks. Call this first before making changes.

Each subtask should be a single, focused action that can be completed independently.`,

        inputSchema: z.object({
          tasks: z
            .array(
              z.object({
                id: z.string().describe('Unique identifier for the task (e.g., "task-1", "task-2")'),
                description: z.string().describe('Clear description of what this subtask accomplishes'),
              })
            )
            .describe('List of subtasks to complete the user request'),
        }),

        execute: async ({ tasks }) => {
          const planTasks: PlanTask[] = tasks.map((t) => ({
            ...t,
            status: 'pending' as const,
          }))

          toolCtx.fs.setPlan(planTasks)
          toolCtx.callbacks.onPlanCreated?.(planTasks)

          return {
            success: true,
            taskCount: tasks.length,
            tasks: planTasks,
          }
        },
      }),

      UpdateTaskStatus: tool({
        description: `Update the status of a task in the current plan. Call with "in_progress" when starting a task, "completed" when done.`,

        inputSchema: z.object({
          taskId: z.string().describe('The ID of the task to update'),
          status: z
            .enum(['pending', 'in_progress', 'completed'])
            .describe('The new status for the task'),
        }),

        execute: async ({ taskId, status }) => {
          const result = toolCtx.fs.updateTaskStatus(taskId, status)
          if (result.success) {
            toolCtx.callbacks.onTaskStatusChanged?.(taskId, status)
          }
          return result
        },
      }),

      UpdateProjectContext: tool({
        description: `Update the project context file with learned preferences or patterns. Use this when the user expresses a preference (e.g., "always use Tailwind", "I prefer dark mode"). This helps maintain consistency across sessions.`,

        inputSchema: z.object({
          entry: z
            .string()
            .describe(
              'A single line entry to add to the project context (e.g., "Styling: Use NativeWind for all styles")'
            ),
        }),

        execute: async ({ entry }) => {
          const contextPath = '.appbuilder/context.md'
          const existing = toolCtx.fs.readFile(contextPath)

          let content: string
          if (existing.found && existing.content) {
            if (existing.content.includes(entry)) {
              return { success: true, alreadyExists: true }
            }
            content = existing.content.trim() + '\n- ' + entry + '\n'
          } else {
            content = `# Project Context\n\n- ${entry}\n`
          }

          toolCtx.fs.writeFile(contextPath, content)
          return { success: true, added: entry }
        },
      }),
    }
  },
}
