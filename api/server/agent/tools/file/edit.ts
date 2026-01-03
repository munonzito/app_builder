/**
 * Edit Tool
 *
 * Find-and-replace editing for existing files.
 */

import { z, tool } from '../types'
import type { ToolContext } from '../../core/types'

export function createEditTool(ctx: ToolContext) {
  return tool({
    description: `Edit a file by finding and replacing text. The old_str must match exactly (including whitespace and indentation).

For creating new files, use the Create tool instead.

Tips:
- Include enough context in old_str to make it unique
- Preserve exact indentation
- Set change_all=true to replace all occurrences (useful for renaming)

Examples:
- Single edit: { "path": "App.tsx", "old_str": "const x = 1", "new_str": "const x = 2" }
- Rename all: { "path": "utils.ts", "old_str": "oldName", "new_str": "newName", "change_all": true }`,

    inputSchema: z.object({
      path: z.string().describe('File path to edit'),
      old_str: z
        .string()
        .describe('The exact text to find and replace (must match exactly, including whitespace)'),
      new_str: z.string().describe('The text to replace old_str with'),
      change_all: z
        .boolean()
        .optional()
        .default(false)
        .describe('Replace all occurrences (true) or just the first one (false). Defaults to false.'),
    }),

    execute: async ({ path, old_str, new_str, change_all = false }) => {
      const file = ctx.fs.readFile(path)

      if (!file.found) {
        return {
          success: false,
          error: `File not found: ${path}`,
        }
      }

      const content = file.content!

      if (!content.includes(old_str)) {
        const lines = content.split('\n')
        const preview = lines.slice(0, 10).join('\n')
        return {
          success: false,
          error: `Could not find the specified text in ${path}`,
          hint: 'Make sure old_str matches exactly, including whitespace and indentation.',
          filePreview: preview + (lines.length > 10 ? '\n...' : ''),
        }
      }

      // Count occurrences
      const occurrences = content.split(old_str).length - 1

      // Perform replacement
      let newContent: string
      let replacements: number

      if (change_all) {
        newContent = content.split(old_str).join(new_str)
        replacements = occurrences
      } else {
        newContent = content.replace(old_str, new_str)
        replacements = 1
      }

      ctx.fs.writeFile(path, newContent)
      ctx.callbacks.onFileChange?.(path, 'update')

      return {
        success: true,
        path,
        replacements,
        totalOccurrences: occurrences,
        ...(occurrences > 1 &&
          !change_all && {
            hint: `Found ${occurrences} occurrences but only replaced the first one. Use change_all=true to replace all.`,
          }),
      }
    },
  })
}
