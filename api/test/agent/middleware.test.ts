/**
 * Tests for the Middleware System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VirtualFS } from '../../server/utils/virtualFS'
import {
  createMiddlewareManager,
  loggingMiddleware,
  fileTrackingMiddleware,
  createRateLimitingMiddleware,
  defineMiddleware,
} from '../../server/agent'

describe('Middleware Manager', () => {
  let fs: VirtualFS
  let manager: ReturnType<typeof createMiddlewareManager>

  beforeEach(() => {
    fs = new VirtualFS()
    manager = createMiddlewareManager({ fs, projectName: 'test' }, {}, 50)
  })

  it('should track steps', () => {
    manager.setStep(5)
    const ctx = manager.getContext()
    expect(ctx.step).toBe(5)
  })

  it('should track tool calls', () => {
    manager.recordToolCall()
    manager.recordToolCall()
    const ctx = manager.getContext()
    expect(ctx.toolCalls).toBe(2)
  })

  it('should track file changes', () => {
    manager.recordFileChange('App.tsx')
    manager.recordFileChange('utils/helpers.ts')
    const ctx = manager.getContext()
    expect(ctx.filesChanged.size).toBe(2)
  })

  it('should track errors', () => {
    manager.recordError('Error 1')
    manager.recordError('Error 2')
    const ctx = manager.getContext()
    expect(ctx.errors.length).toBe(2)
  })

  it('should build summary', () => {
    manager.setStep(10)
    manager.recordToolCall()
    manager.recordToolCall()
    manager.recordFileChange('test.ts')
    manager.recordError('test error')

    const summary = manager.buildSummary()
    expect(summary.totalSteps).toBe(10)
    expect(summary.toolCalls).toBe(2)
    expect(summary.filesChanged).toContain('test.ts')
    expect(summary.errors).toContain('test error')
    expect(summary.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('should execute middleware hooks in order', async () => {
    const order: string[] = []

    const mw1 = defineMiddleware({
      name: 'mw1',
      priority: 10,
      onStepStart: async () => {
        order.push('mw1')
      },
    })

    const mw2 = defineMiddleware({
      name: 'mw2',
      priority: 5,
      onStepStart: async () => {
        order.push('mw2')
      },
    })

    manager.use(mw1).use(mw2)
    await manager.onStepStart()

    expect(order).toEqual(['mw2', 'mw1']) // Lower priority runs first
  })
})

describe('Logging Middleware', () => {
  it('should have all required hooks', () => {
    expect(loggingMiddleware.name).toBe('logging')
    expect(loggingMiddleware.onAgentStart).toBeDefined()
    expect(loggingMiddleware.onAgentEnd).toBeDefined()
    expect(loggingMiddleware.onToolStart).toBeDefined()
    expect(loggingMiddleware.onToolEnd).toBeDefined()
    expect(loggingMiddleware.onError).toBeDefined()
  })
})

describe('File Tracking Middleware', () => {
  it('should have onToolEnd hook', () => {
    expect(fileTrackingMiddleware.name).toBe('file-tracking')
    expect(fileTrackingMiddleware.onToolEnd).toBeDefined()
  })
})

describe('Rate Limiting Middleware', () => {
  it('should throw when exceeding per-step limit', async () => {
    const mw = createRateLimitingMiddleware({ maxToolCallsPerStep: 2 })

    const ctx = {
      agentContext: { fs: new VirtualFS(), projectName: 'test' },
      step: 1,
      maxSteps: 50,
      tools: {},
      startTime: Date.now(),
      toolCalls: 0,
      filesChanged: new Set<string>(),
      errors: [],
    }

    // First two calls should succeed
    await mw.onStepStart?.(ctx)
    await mw.onToolStart?.(ctx, 'Read', {})
    await mw.onToolStart?.(ctx, 'Read', {})

    // Third call should throw
    await expect(mw.onToolStart?.(ctx, 'Read', {})).rejects.toThrow('Rate limit exceeded')
  })

  it('should throw when exceeding consecutive same-tool limit', async () => {
    const mw = createRateLimitingMiddleware({ maxSameToolConsecutive: 2 })

    const ctx = {
      agentContext: { fs: new VirtualFS(), projectName: 'test' },
      step: 1,
      maxSteps: 50,
      tools: {},
      startTime: Date.now(),
      toolCalls: 0,
      filesChanged: new Set<string>(),
      errors: [],
    }

    await mw.onToolStart?.(ctx, 'Read', {})
    await mw.onToolStart?.(ctx, 'Read', {})

    // Third consecutive Read should throw
    await expect(mw.onToolStart?.(ctx, 'Read', {})).rejects.toThrow('Rate limit exceeded')
  })

  it('should reset consecutive count for different tools', async () => {
    const mw = createRateLimitingMiddleware({ maxSameToolConsecutive: 2 })

    const ctx = {
      agentContext: { fs: new VirtualFS(), projectName: 'test' },
      step: 1,
      maxSteps: 50,
      tools: {},
      startTime: Date.now(),
      toolCalls: 0,
      filesChanged: new Set<string>(),
      errors: [],
    }

    await mw.onToolStart?.(ctx, 'Read', {})
    await mw.onToolStart?.(ctx, 'Read', {})
    await mw.onToolStart?.(ctx, 'Edit', {}) // Different tool, resets count
    await mw.onToolStart?.(ctx, 'Read', {}) // Should succeed
  })
})
