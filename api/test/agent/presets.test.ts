/**
 * Tests for Agent Presets
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { VirtualFS } from '../../server/utils/virtualFS'
import {
  createDefaultPreset,
  createMinimalPreset,
  createFullPreset,
  getPreset,
  createPresetBuilder,
  fileToolsProvider,
  planningToolsProvider,
  loggingMiddleware,
} from '../../server/agent'

describe('Presets', () => {
  let fs: VirtualFS
  const context = { fs: null as any, projectName: 'test' }

  beforeEach(() => {
    fs = new VirtualFS()
    context.fs = fs
  })

  describe('createDefaultPreset', () => {
    it('should include file and planning tools', () => {
      const config = createDefaultPreset(context)

      expect(config.toolProviders.length).toBeGreaterThanOrEqual(2)
      expect(config.toolProviders.some((p) => p.name === 'file')).toBe(true)
      expect(config.toolProviders.some((p) => p.name === 'planning')).toBe(true)
    })

    it('should include default middleware', () => {
      const config = createDefaultPreset(context)

      expect(config.middleware?.some((m) => m.name === 'file-tracking')).toBe(true)
      expect(config.middleware?.some((m) => m.name === 'logging')).toBe(true)
    })

    it('should allow disabling logging', () => {
      const config = createDefaultPreset(context, { enableLogging: false })

      expect(config.middleware?.some((m) => m.name === 'logging')).toBe(false)
    })

    it('should allow custom max steps', () => {
      const config = createDefaultPreset(context, { maxSteps: 100 })

      expect(config.maxSteps).toBe(100)
    })
  })

  describe('createMinimalPreset', () => {
    it('should only include file tools', () => {
      const config = createMinimalPreset(context)

      expect(config.toolProviders.some((p) => p.name === 'file')).toBe(true)
      expect(config.toolProviders.some((p) => p.name === 'planning')).toBe(false)
    })

    it('should have lower default max steps', () => {
      const config = createMinimalPreset(context)

      expect(config.maxSteps).toBe(30)
    })
  })

  describe('createFullPreset', () => {
    it('should include all tool providers', () => {
      const config = createFullPreset(context)

      expect(config.toolProviders.some((p) => p.name === 'file')).toBe(true)
      expect(config.toolProviders.some((p) => p.name === 'planning')).toBe(true)
      expect(config.toolProviders.some((p) => p.name === 'validation')).toBe(true)
    })
  })

  describe('getPreset', () => {
    it('should return correct preset by name', () => {
      const defaultConfig = getPreset('default', context)
      const fullConfig = getPreset('full', context)

      expect(defaultConfig.toolProviders.some((p) => p.name === 'file')).toBe(true)
      expect(fullConfig.toolProviders.some((p) => p.name === 'validation')).toBe(true)
    })
  })
})

describe('PresetBuilder', () => {
  let fs: VirtualFS

  beforeEach(() => {
    fs = new VirtualFS()
  })

  it('should build custom configuration', () => {
    const config = createPresetBuilder()
      .addTools(fileToolsProvider, planningToolsProvider)
      .addMiddleware(loggingMiddleware)
      .setMaxSteps(25)
      .build({ fs, projectName: 'test' })

    expect(config.toolProviders.length).toBe(2)
    expect(config.middleware?.length).toBe(1)
    expect(config.maxSteps).toBe(25)
  })

  it('should allow setting custom prompt', () => {
    const customPrompt = 'You are a custom agent.'

    const config = createPresetBuilder()
      .addTools(fileToolsProvider)
      .setPrompt(customPrompt)
      .build({ fs, projectName: 'test' })

    expect(config.systemPrompt).toBe(customPrompt)
  })
})
