/**
 * Tests for the Unified Agent Tool System
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { VirtualFS } from '../../server/utils/virtualFS'
import {
  createToolRegistry,
  fileToolsProvider,
  planningToolsProvider,
} from '../../server/agent'
import type { ToolContext } from '../../server/agent'

describe('Tool Registry', () => {
  let fs: VirtualFS
  let fileChanges: Array<{ path: string; action: string }>

  beforeEach(() => {
    fileChanges = []
    fs = new VirtualFS({
      'App.tsx': 'export default function App() { return null }',
      'screens/Home.tsx': 'export default function Home() { return null }',
      'package.json': JSON.stringify({
        name: 'test-app',
        dependencies: { react: '18.2.0', 'react-native': '0.74.5' },
      }),
    })
  })

  it('should register and build tools from providers', () => {
    const registry = createToolRegistry([fileToolsProvider])
    const tools = registry.build({ fs, projectName: 'test' })

    expect(tools).toHaveProperty('Read')
    expect(tools).toHaveProperty('Create')
    expect(tools).toHaveProperty('Edit')
    expect(tools).toHaveProperty('LS')
    expect(tools).toHaveProperty('Grep')
  })

  it('should register multiple providers', () => {
    const registry = createToolRegistry([
      fileToolsProvider,
      planningToolsProvider,
    ])
    const tools = registry.build({ fs, projectName: 'test' })

    // File tools
    expect(tools).toHaveProperty('Read')
    expect(tools).toHaveProperty('Create')

    // Planning tools
    expect(tools).toHaveProperty('CreatePlan')
    expect(tools).toHaveProperty('UpdateTaskStatus')
  })

  it('should support method chaining for registration', () => {
    const registry = createToolRegistry()
      .register(fileToolsProvider)
      .register(planningToolsProvider)

    expect(registry.has('file')).toBe(true)
    expect(registry.has('planning')).toBe(true)
    expect(registry.getProviderNames()).toContain('file')
    expect(registry.getProviderNames()).toContain('planning')
  })

  it('should allow unregistering providers', () => {
    const registry = createToolRegistry([fileToolsProvider, planningToolsProvider])
    expect(registry.has('file')).toBe(true)

    registry.unregister('file')
    expect(registry.has('file')).toBe(false)

    const tools = registry.build({ fs, projectName: 'test' })
    expect(tools).not.toHaveProperty('Read')
    expect(tools).toHaveProperty('CreatePlan')
  })

  it('should clone the registry', () => {
    const registry = createToolRegistry([fileToolsProvider])
    const cloned = registry.clone()

    cloned.register(planningToolsProvider)

    expect(registry.has('planning')).toBe(false)
    expect(cloned.has('planning')).toBe(true)
  })
})

describe('File Tools', () => {
  let fs: VirtualFS
  let tools: Record<string, any>
  let fileChanges: Array<{ path: string; action: string }>

  beforeEach(() => {
    fileChanges = []
    fs = new VirtualFS({
      'App.tsx': `import React from 'react';
export default function App() {
  return <div>Hello World</div>;
}`,
      'screens/Home.tsx': `import React, { useState } from 'react';
export default function Home() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}`,
      'package.json': JSON.stringify({
        name: 'test-app',
        dependencies: { react: '18.2.0', 'react-native': '0.74.5' },
      }),
    })

    const registry = createToolRegistry([fileToolsProvider])
    tools = registry.build(
      { fs, projectName: 'test' },
      { onFileChange: (path, action) => fileChanges.push({ path, action }) }
    )
  })

  describe('Read', () => {
    it('should read file contents', async () => {
      const result = await tools.Read.execute({ path: 'App.tsx' }, { toolCallId: '1', messages: [] })

      expect(result.success).toBe(true)
      expect(result.content).toContain('Hello World')
      expect(result.language).toBe('tsx')
    })

    it('should support pagination', async () => {
      const result = await tools.Read.execute(
        { path: 'App.tsx', offset: 1, limit: 2 },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(true)
      expect(result.linesReturned).toBe(2)
      expect(result.offset).toBe(1)
    })

    it('should return error for non-existent file', async () => {
      const result = await tools.Read.execute(
        { path: 'nonexistent.tsx' },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('File not found')
    })
  })

  describe('Create', () => {
    it('should create new file', async () => {
      const result = await tools.Create.execute(
        { path: 'utils/helpers.ts', content: 'export const add = (a: number, b: number) => a + b' },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(true)
      expect(result.created).toBe(true)
      expect(fileChanges).toContainEqual({ path: 'utils/helpers.ts', action: 'create' })
    })

    it('should fail if file exists', async () => {
      const result = await tools.Create.execute(
        { path: 'App.tsx', content: 'new content' },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })
  })

  describe('Edit', () => {
    it('should replace text in file', async () => {
      const result = await tools.Edit.execute(
        { path: 'App.tsx', old_str: 'Hello World', new_str: 'Hello Universe' },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(true)
      expect(result.replacements).toBe(1)
      expect(fileChanges).toContainEqual({ path: 'App.tsx', action: 'update' })

      const content = fs.readFile('App.tsx')
      expect(content.content).toContain('Hello Universe')
    })

    it('should replace all occurrences with change_all', async () => {
      fs.writeFile('test.ts', 'const x = foo; const y = foo; const z = foo;')

      const result = await tools.Edit.execute(
        { path: 'test.ts', old_str: 'foo', new_str: 'bar', change_all: true },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(true)
      expect(result.replacements).toBe(3)
    })

    it('should fail if text not found', async () => {
      const result = await tools.Edit.execute(
        { path: 'App.tsx', old_str: 'nonexistent', new_str: 'replacement' },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(false)
      expect(result.hint).toContain('exactly')
    })
  })

  describe('LS', () => {
    it('should list all files', async () => {
      const result = await tools.LS.execute({}, { toolCallId: '1', messages: [] })

      expect(result.success).toBe(true)
      expect(result.fileCount).toBe(3) // App.tsx, screens/Home.tsx, package.json
    })

    it('should filter by directory', async () => {
      const result = await tools.LS.execute({ directory: 'screens' }, { toolCallId: '1', messages: [] })

      expect(result.success).toBe(true)
      expect(result.files.every((f: any) => f.path.startsWith('screens/'))).toBe(true)
    })
  })

  describe('Grep', () => {
    it('should find pattern in files', async () => {
      const result = await tools.Grep.execute({ pattern: 'useState' }, { toolCallId: '1', messages: [] })

      expect(result.success).toBe(true)
      expect(result.matchCount).toBeGreaterThan(0)
    })

    it('should support case-insensitive search', async () => {
      const result = await tools.Grep.execute(
        { pattern: 'USESTATE', case_insensitive: true },
        { toolCallId: '1', messages: [] }
      )

      expect(result.success).toBe(true)
      expect(result.matchCount).toBeGreaterThan(0)
    })
  })
})

describe('Planning Tools', () => {
  let fs: VirtualFS
  let tools: Record<string, any>
  let planTasks: any[] = []

  beforeEach(() => {
    planTasks = []
    fs = new VirtualFS()

    const registry = createToolRegistry([planningToolsProvider])
    tools = registry.build(
      { fs, projectName: 'test' },
      { onPlanCreated: (tasks) => planTasks.push(...tasks) }
    )
  })

  it('should create a plan', async () => {
    const result = await tools.CreatePlan.execute(
      {
        tasks: [
          { id: 'task-1', description: 'Create component' },
          { id: 'task-2', description: 'Add styles' },
        ],
      },
      { toolCallId: '1', messages: [] }
    )

    expect(result.success).toBe(true)
    expect(result.taskCount).toBe(2)
    expect(planTasks.length).toBe(2)
    expect(planTasks[0].status).toBe('pending')
  })

  it('should update task status', async () => {
    // Create plan first
    await tools.CreatePlan.execute(
      { tasks: [{ id: 'task-1', description: 'Test' }] },
      { toolCallId: '1', messages: [] }
    )

    const result = await tools.UpdateTaskStatus.execute(
      { taskId: 'task-1', status: 'completed' },
      { toolCallId: '1', messages: [] }
    )

    expect(result.success).toBe(true)
  })
})


