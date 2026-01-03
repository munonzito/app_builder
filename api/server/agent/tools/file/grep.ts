/**
 * Grep Tool
 *
 * Search for patterns across project files.
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

export function createGrepTool(ctx: ToolContext) {
  return tool({
    description: `Search for patterns across project files using regex. Returns matching lines with file paths and line numbers.

Supports:
- Regex patterns
- Case-insensitive search
- Context lines (before/after matches)
- File type filtering

Examples:
- Simple search: { "pattern": "useState" }
- Case-insensitive: { "pattern": "error", "case_insensitive": true }
- With context: { "pattern": "function.*render", "context": 2 }
- Filter by type: { "pattern": "import", "glob_pattern": "**/*.tsx" }`,

    inputSchema: z.object({
      pattern: z
        .string()
        .describe('Regex pattern to search for (e.g., "useState", "import.*react", "function\\\\s+\\\\w+")'),
      path: z
        .string()
        .optional()
        .describe('Directory or file to search in (defaults to entire project)'),
      glob_pattern: z
        .string()
        .optional()
        .describe('Glob pattern to filter files (e.g., "*.tsx", "screens/**")'),
      case_insensitive: z
        .boolean()
        .optional()
        .default(false)
        .describe('Perform case-insensitive matching (defaults to false)'),
      context: z
        .number()
        .optional()
        .describe('Number of lines to show before and after each match'),
      context_before: z
        .number()
        .optional()
        .describe('Number of lines to show before each match'),
      context_after: z
        .number()
        .optional()
        .describe('Number of lines to show after each match'),
      line_numbers: z
        .boolean()
        .optional()
        .default(true)
        .describe('Show line numbers in output (defaults to true)'),
      max_results: z
        .number()
        .optional()
        .default(50)
        .describe('Maximum number of matches to return (defaults to 50)'),
    }),

    execute: async ({
      pattern,
      path,
      glob_pattern,
      case_insensitive = false,
      context,
      context_before,
      context_after,
      line_numbers = true,
      max_results = 50,
    }) => {
      // Build regex
      const flags = case_insensitive ? 'gi' : 'g'
      let regex: RegExp
      try {
        regex = new RegExp(pattern, flags)
      } catch {
        // Escape special characters if regex is invalid
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        regex = new RegExp(escaped, flags)
      }

      // Get files to search
      let files = ctx.fs.listFiles()

      // Filter by path
      if (path) {
        const normalizedPath = path.replace(/\/$/, '')
        files = files.filter(
          (f) => f.path.startsWith(normalizedPath + '/') || f.path === normalizedPath
        )
      }

      // Filter by glob pattern
      if (glob_pattern) {
        files = files.filter((f) => matchGlob(glob_pattern, f.path))
      }

      // Calculate context lines
      const beforeLines = context_before ?? context ?? 0
      const afterLines = context_after ?? context ?? 0

      // Search files
      const results: Array<{
        path: string
        line: number
        content: string
        match: string
        context?: { before: string[]; after: string[] }
      }> = []

      for (const file of files) {
        const fileContent = ctx.fs.readFile(file.path)
        if (!fileContent.found || !fileContent.content) continue

        const lines = fileContent.content.split('\n')

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          regex.lastIndex = 0
          const match = regex.exec(line)

          if (match) {
            const result: (typeof results)[0] = {
              path: file.path,
              line: i + 1,
              content: line,
              match: match[0],
            }

            // Add context if requested
            if (beforeLines > 0 || afterLines > 0) {
              result.context = {
                before: lines.slice(Math.max(0, i - beforeLines), i),
                after: lines.slice(i + 1, i + 1 + afterLines),
              }
            }

            results.push(result)

            if (results.length >= max_results) {
              break
            }
          }
        }

        if (results.length >= max_results) {
          break
        }
      }

      // Format output
      const formattedResults = results.map((r) => {
        const parts: string[] = []

        if (r.context?.before.length) {
          r.context.before.forEach((l, idx) => {
            const lineNum = r.line - r.context!.before.length + idx
            parts.push(line_numbers ? `${r.path}:${lineNum}-${l}` : `${r.path}-${l}`)
          })
        }

        parts.push(line_numbers ? `${r.path}:${r.line}:${r.content}` : `${r.path}:${r.content}`)

        if (r.context?.after.length) {
          r.context.after.forEach((l, idx) => {
            const lineNum = r.line + 1 + idx
            parts.push(line_numbers ? `${r.path}:${lineNum}-${l}` : `${r.path}-${l}`)
          })
        }

        return parts.join('\n')
      })

      return {
        success: true,
        pattern,
        matchCount: results.length,
        truncated: results.length >= max_results,
        results: results.slice(0, max_results),
        formatted: formattedResults.join('\n---\n'),
      }
    },
  })
}
