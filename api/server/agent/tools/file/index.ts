/**
 * File Tools Provider
 *
 * Tools for file system operations: Read, Create, Edit, LS, Grep
 */

import type { ToolContext, ToolProvider } from '../../core/types'
import { createReadTool } from './read'
import { createCreateTool } from './create'
import { createEditTool } from './edit'
import { createLSTool } from './ls'
import { createGrepTool } from './grep'

export const fileToolsProvider: ToolProvider = {
  name: 'file',
  description: 'File system operations (Read, Create, Edit, LS, Grep)',
  tools: (ctx) => {
    const toolCtx = ctx as ToolContext
    return {
      Read: createReadTool(toolCtx),
      Create: createCreateTool(toolCtx),
      Edit: createEditTool(toolCtx),
      LS: createLSTool(toolCtx),
      Grep: createGrepTool(toolCtx),
    }
  },
}

// Export individual tool creators for custom configurations
export { createReadTool } from './read'
export { createCreateTool } from './create'
export { createEditTool } from './edit'
export { createLSTool } from './ls'
export { createGrepTool } from './grep'
