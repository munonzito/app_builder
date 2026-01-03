/**
 * Validation Tools Provider
 *
 * Tools for project validation: ValidateProject, GetErrors, GetProjectSummary
 */

import { z, tool } from '../types'
import type { ToolContext, ToolProvider } from '../../core/types'
import { validateTypeScript } from '../../../utils/codeValidator'

export const validationToolsProvider: ToolProvider = {
  name: 'validation',
  description: 'Project validation and error checking',
  tools: (ctx) => {
    const toolCtx = ctx as ToolContext

    return {
      ValidateProject: tool({
        description:
          'Validate all TypeScript/TSX files in the project for syntax errors. Use after making changes to ensure the code is valid.',

        inputSchema: z.object({
          strict: z.boolean().optional().describe('Strict validation mode'),
        }),

        execute: async () => {
          const files = toolCtx.fs.listFiles()
          const errors: Array<{ file: string; errors: string[] }> = []

          for (const file of files) {
            if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
              const content = toolCtx.fs.readFile(file.path)
              if (content.found && content.content) {
                const validation = await validateTypeScript(content.content, file.path)
                if (!validation.valid) {
                  errors.push({
                    file: file.path,
                    errors: validation.errors,
                  })
                }
              }
            }
          }

          toolCtx.fs.setErrors(errors.flatMap((e) => e.errors.map((err) => `${e.file}: ${err}`)))

          return {
            valid: errors.length === 0,
            errorCount: errors.reduce((sum, e) => sum + e.errors.length, 0),
            errors,
          }
        },
      }),

      GetErrors: tool({
        description: 'Get the list of current validation errors in the project.',

        inputSchema: z.object({
          filter: z.string().optional().describe('Optional filter'),
        }),

        execute: async () => {
          const errors = toolCtx.fs.getErrors()
          return {
            errors,
            hasErrors: errors.length > 0,
            count: errors.length,
          }
        },
      }),

      GetProjectSummary: tool({
        description:
          'Get an overview of the project structure including file count, total lines, and dependencies. Use to understand the project scope.',

        inputSchema: z.object({
          detailed: z.boolean().optional().describe('Include detailed breakdown'),
        }),

        execute: async () => {
          return toolCtx.fs.getProjectSummary()
        },
      }),
    }
  },
}
