/**
 * File Tracking Middleware
 *
 * Tracks file changes made by tools for reporting.
 */

import { defineMiddleware } from '../core/types'

const FILE_TOOLS = new Set([
  'Create',
  'Edit',
  'writeFile',
  'patchFile',
  'deleteFile',
  'renameFile',
])

export const fileTrackingMiddleware = defineMiddleware({
  name: 'file-tracking',
  priority: 50,

  onToolEnd: async (ctx, tool, result) => {
    if (!FILE_TOOLS.has(tool)) return

    const res = result as Record<string, unknown> | undefined
    if (!res?.success) return

    // Extract file path based on tool type
    let filePath: string | undefined

    if (tool === 'Create' || tool === 'Edit' || tool === 'writeFile' || tool === 'patchFile') {
      filePath = res.path as string
    } else if (tool === 'deleteFile') {
      filePath = res.path as string
    } else if (tool === 'renameFile') {
      // Track both old and new paths
      const oldPath = res.oldPath as string
      const newPath = res.newPath as string
      if (oldPath) ctx.filesChanged.add(oldPath)
      if (newPath) ctx.filesChanged.add(newPath)
      return
    }

    if (filePath) {
      ctx.filesChanged.add(filePath)
    }
  },
})
