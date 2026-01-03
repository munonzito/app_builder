/**
 * LS Tool
 *
 * List directory contents with filtering.
 */

import { z, tool } from '../types'
import type { ToolContext } from '../../core/types'

/**
 * Match a glob pattern against a path
 */
function matchGlob(pattern: string, path: string): boolean {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{GLOBSTAR}}/g, '.*')
  return new RegExp(`^${regexPattern}$`).test(path)
}

/**
 * Get directory from path
 */
function getDirectory(path: string): string {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash === -1 ? '' : path.substring(0, lastSlash)
}

export function createLSTool(ctx: ToolContext) {
  return tool({
    description: `List the contents of a directory with optional pattern-based filtering.

Returns file paths, languages, and sizes. Use this to understand project structure.

Examples:
- List all files: { }
- List specific directory: { "directory": "screens" }
- Exclude patterns: { "ignorePatterns": ["node_modules/**", "*.test.tsx"] }`,

    inputSchema: z.object({
      directory: z
        .string()
        .optional()
        .describe('Directory path to list (defaults to project root)'),
      ignorePatterns: z
        .array(z.string())
        .optional()
        .describe('Glob patterns to exclude (e.g., ["node_modules/**", "*.log", ".git/**"])'),
    }),

    execute: async ({ directory, ignorePatterns }) => {
      let files = ctx.fs.listFiles()

      // Filter by directory
      if (directory && directory !== '.' && directory !== './') {
        const normalizedDir = directory.replace(/^\.\//, '').replace(/\/$/, '')
        files = files.filter(
          (f) => f.path.startsWith(normalizedDir + '/') || f.path === normalizedDir
        )
      }

      // Apply ignore patterns
      if (ignorePatterns && ignorePatterns.length > 0) {
        files = files.filter((f) => {
          for (const pattern of ignorePatterns) {
            if (matchGlob(pattern, f.path)) {
              return false
            }
          }
          return true
        })
      }

      // Group by directory for better readability
      const byDirectory: Record<string, typeof files> = {}
      for (const file of files) {
        const dir = getDirectory(file.path) || '.'
        if (!byDirectory[dir]) {
          byDirectory[dir] = []
        }
        byDirectory[dir].push(file)
      }

      return {
        success: true,
        directory: directory || '.',
        fileCount: files.length,
        files: files.map((f) => ({
          path: f.path,
          language: f.language,
          size: f.size,
        })),
        byDirectory,
      }
    },
  })
}
