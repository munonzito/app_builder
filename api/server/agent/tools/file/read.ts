/**
 * Read Tool
 *
 * Read file contents with pagination support.
 */

import { z, tool } from '../types'
import type { ToolContext } from '../../core/types'

export function createReadTool(ctx: ToolContext) {
  return tool({
    description: `Read the contents of a file. For large files, results can be paginated using offset and limit parameters.

Returns the file content, language, and metadata. Use this to understand existing code before modifying it.

Examples:
- Read entire file: { "path": "App.tsx" }
- Read first 50 lines: { "path": "App.tsx", "limit": 50 }
- Read lines 100-150: { "path": "App.tsx", "offset": 100, "limit": 50 }`,

    inputSchema: z.object({
      path: z
        .string()
        .describe('File path relative to project root (e.g., "App.tsx", "screens/HomeScreen.tsx")'),
      offset: z
        .number()
        .optional()
        .default(0)
        .describe('Line number to start reading from (0-based, defaults to 0)'),
      limit: z
        .number()
        .optional()
        .default(2400)
        .describe('Maximum number of lines to read (defaults to 2400)'),
    }),

    execute: async ({ path, offset = 0, limit = 2400 }) => {
      const file = ctx.fs.readFile(path)

      if (!file.found) {
        return {
          success: false,
          error: `File not found: ${path}`,
        }
      }

      const lines = file.content!.split('\n')
      const totalLines = lines.length
      const slicedLines = lines.slice(offset, offset + limit)
      const truncated = offset + limit < totalLines

      return {
        success: true,
        path,
        content: slicedLines.join('\n'),
        language: file.language,
        totalLines,
        linesReturned: slicedLines.length,
        offset,
        truncated,
        ...(truncated && {
          hint: `File has ${totalLines} lines. Use offset=${offset + limit} to read more.`,
        }),
      }
    },
  })
}
