/**
 * Create Tool
 *
 * Create new files (will not overwrite existing).
 */

import { z, tool } from '../types'
import type { ToolContext } from '../../core/types'

export function createCreateTool(ctx: ToolContext) {
  return tool({
    description: `Create a new file with the specified content. Use this for creating new files only.

For modifying existing files, prefer the Edit tool instead.

Examples:
- Create component: { "path": "components/Button.tsx", "content": "import React from 'react';\\n..." }
- Create config: { "path": "config.ts", "content": "export default { apiUrl: '...' }" }`,

    inputSchema: z.object({
      path: z
        .string()
        .describe('File path for the new file (e.g., "components/Button.tsx", "utils/helpers.ts")'),
      content: z.string().describe('The content to write to the file'),
    }),

    execute: async ({ path, content }) => {
      // Check if file already exists
      const existing = ctx.fs.readFile(path)
      if (existing.found) {
        return {
          success: false,
          error: `File already exists: ${path}. Use Edit tool to modify existing files.`,
        }
      }

      const result = ctx.fs.writeFile(path, content)

      if (result.success) {
        ctx.callbacks.onFileChange?.(path, 'create')
      }

      return {
        success: true,
        path,
        created: true,
        size: content.length,
        lines: content.split('\n').length,
      }
    },
  })
}
