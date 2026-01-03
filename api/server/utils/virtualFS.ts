/**
 * Virtual File System
 *
 * In-memory file system for managing project files during agent sessions.
 * Provides atomic operations and easy rollback capabilities.
 *
 * Dependencies are managed through package.json as the single source of truth.
 */

import { executeCommand as execCmd, type CommandResult } from './commandParser'

export interface VirtualFile {
  path: string
  content: string
  language: 'tsx' | 'ts' | 'json' | 'css' | 'md'
  lastModified: number
}

export interface PlanTask {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Plan {
  tasks: PlanTask[]
  createdAt: number
}

export interface ProjectState {
  files: Map<string, VirtualFile>
  errors: string[]
}

export class VirtualFS {
  private files: Map<string, VirtualFile> = new Map()
  private errors: string[] = []
  private history: Array<{ files: Map<string, VirtualFile> }> = []
  private plan: Plan | null = null

  constructor(initialFiles?: Record<string, string>) {
    if (initialFiles) {
      for (const [path, content] of Object.entries(initialFiles)) {
        this.files.set(path, {
          path,
          content,
          language: this.detectLanguage(path),
          lastModified: Date.now(),
        })
      }
    }
  }

  private detectLanguage(path: string): VirtualFile['language'] {
    if (path.endsWith('.tsx')) return 'tsx'
    if (path.endsWith('.ts')) return 'ts'
    if (path.endsWith('.json')) return 'json'
    if (path.endsWith('.css')) return 'css'
    if (path.endsWith('.md')) return 'md'
    return 'tsx' // Default for React Native
  }

  private saveSnapshot(): void {
    this.history.push({
      files: new Map(this.files),
    })
    // Keep only last 10 snapshots
    if (this.history.length > 10) {
      this.history.shift()
    }
  }

  listFiles(): Array<{ path: string; language: string; size: number }> {
    return Array.from(this.files.values()).map((f) => ({
      path: f.path,
      language: f.language,
      size: f.content.length,
    }))
  }

  readFile(path: string): { found: boolean; content?: string; language?: string } {
    const file = this.files.get(path)
    if (!file) {
      return { found: false }
    }
    return {
      found: true,
      content: file.content,
      language: file.language,
    }
  }

  writeFile(path: string, content: string): { success: boolean; created: boolean } {
    this.saveSnapshot()
    const existing = this.files.has(path)
    this.files.set(path, {
      path,
      content,
      language: this.detectLanguage(path),
      lastModified: Date.now(),
    })
    return { success: true, created: !existing }
  }

  deleteFile(path: string): { success: boolean; existed: boolean } {
    this.saveSnapshot()
    const existed = this.files.has(path)
    this.files.delete(path)
    return { success: true, existed }
  }

  patchFile(
    path: string,
    oldContent: string,
    newContent: string
  ): { success: boolean; error?: string } {
    const file = this.files.get(path)
    if (!file) {
      return { success: false, error: `File not found: ${path}` }
    }

    if (!file.content.includes(oldContent)) {
      return {
        success: false,
        error: `Could not find the specified content to replace in ${path}`,
      }
    }

    this.saveSnapshot()
    const updatedContent = file.content.replace(oldContent, newContent)
    this.files.set(path, {
      ...file,
      content: updatedContent,
      lastModified: Date.now(),
    })

    return { success: true }
  }

  /**
   * Get dependencies from package.json (single source of truth)
   * Returns a Record of package name to version string
   */
  getDependencies(): Record<string, string> {
    const pkgFile = this.files.get('package.json')
    if (!pkgFile) {
      return {}
    }
    try {
      const pkg = JSON.parse(pkgFile.content)
      return pkg.dependencies || {}
    } catch {
      return {}
    }
  }

  /**
   * Get dependencies as a simple array of package names (for backward compatibility)
   */
  getDependencyNames(): string[] {
    return Object.keys(this.getDependencies())
  }

  /**
   * Add a dependency to package.json
   * Creates package.json if it doesn't exist
   */
  addDependency(name: string, version: string = '*'): { success: boolean; alreadyExists: boolean } {
    let pkg: Record<string, unknown> = {
      name: 'my-app',
      version: '1.0.0',
      main: 'node_modules/expo/AppEntry.js',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
      },
      dependencies: {},
      devDependencies: {
        '@babel/core': '^7.20.0',
        '@types/react': '~18.2.45',
        typescript: '^5.1.3',
      },
      private: true,
    }

    const pkgFile = this.files.get('package.json')
    if (pkgFile) {
      try {
        pkg = JSON.parse(pkgFile.content)
      } catch {
        // Keep default package structure if parse fails
      }
    }

    const deps = (pkg.dependencies as Record<string, string>) || {}
    const alreadyExists = name in deps
    deps[name] = version
    pkg.dependencies = deps

    this.writeFile('package.json', JSON.stringify(pkg, null, 2))
    return { success: true, alreadyExists }
  }

  /**
   * Remove a dependency from package.json
   */
  removeDependency(name: string): { success: boolean; existed: boolean } {
    const pkgFile = this.files.get('package.json')
    if (!pkgFile) {
      return { success: true, existed: false }
    }

    try {
      const pkg = JSON.parse(pkgFile.content)
      const deps = pkg.dependencies || {}
      const existed = name in deps
      delete deps[name]
      pkg.dependencies = deps
      this.writeFile('package.json', JSON.stringify(pkg, null, 2))
      return { success: true, existed }
    } catch {
      return { success: false, existed: false }
    }
  }

  renameFile(oldPath: string, newPath: string): { success: boolean; error?: string } {
    const file = this.files.get(oldPath)
    if (!file) {
      return { success: false, error: `File not found: ${oldPath}` }
    }
    if (this.files.has(newPath)) {
      return { success: false, error: `File already exists: ${newPath}` }
    }

    this.saveSnapshot()
    this.files.delete(oldPath)
    this.files.set(newPath, {
      ...file,
      path: newPath,
      language: this.detectLanguage(newPath),
      lastModified: Date.now(),
    })
    return { success: true }
  }

  searchFiles(
    query: string,
    options?: { includePattern?: string; caseSensitive?: boolean }
  ): Array<{ path: string; line: number; content: string; match: string }> {
    const results: Array<{ path: string; line: number; content: string; match: string }> = []
    const flags = options?.caseSensitive ? 'g' : 'gi'

    let regex: RegExp
    try {
      regex = new RegExp(query, flags)
    } catch {
      // If invalid regex, escape special chars and treat as literal string
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      regex = new RegExp(escaped, flags)
    }

    for (const [path, file] of this.files) {
      // Filter by include pattern if provided
      if (options?.includePattern) {
        const pattern = options.includePattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\//g, '\\/')
        const includeRegex = new RegExp(`^${pattern}$`)
        if (!includeRegex.test(path)) {
          continue
        }
      }

      const lines = file.content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const matches = line.match(regex)
        if (matches) {
          results.push({
            path,
            line: i + 1,
            content: line.trim(),
            match: matches[0],
          })
        }
      }
    }

    return results
  }

  getErrors(): string[] {
    return [...this.errors]
  }

  setErrors(errors: string[]): void {
    this.errors = errors
  }

  addError(error: string): void {
    this.errors.push(error)
  }

  clearErrors(): void {
    this.errors = []
  }

  rollback(): boolean {
    const snapshot = this.history.pop()
    if (!snapshot) {
      return false
    }
    this.files = snapshot.files
    return true
  }

  getProjectSummary(): {
    fileCount: number
    files: Array<{ path: string; language: string; lines: number }>
    dependencies: Record<string, string>
    totalLines: number
    hasErrors: boolean
    errorCount: number
  } {
    const fileList = Array.from(this.files.values()).map((f) => ({
      path: f.path,
      language: f.language,
      lines: f.content.split('\n').length,
    }))

    const totalLines = fileList.reduce((sum, f) => sum + f.lines, 0)

    return {
      fileCount: this.files.size,
      files: fileList,
      dependencies: this.getDependencies(),
      totalLines,
      hasErrors: this.errors.length > 0,
      errorCount: this.errors.length,
    }
  }

  // Plan management methods
  setPlan(tasks: PlanTask[]): void {
    this.plan = {
      tasks,
      createdAt: Date.now(),
    }
  }

  getPlan(): Plan | null {
    return this.plan
  }

  updateTaskStatus(
    taskId: string,
    status: PlanTask['status']
  ): { success: boolean; error?: string } {
    if (!this.plan) {
      return { success: false, error: 'No plan exists' }
    }
    const task = this.plan.tasks.find((t) => t.id === taskId)
    if (!task) {
      return { success: false, error: `Task not found: ${taskId}` }
    }
    task.status = status
    return { success: true }
  }

  clearPlan(): void {
    this.plan = null
  }

  toJSON(): { files: Record<string, string> } {
    const files: Record<string, string> = {}
    for (const [path, file] of this.files) {
      files[path] = file.content
    }
    return { files }
  }

  static fromJSON(data: { files: Record<string, string> }): VirtualFS {
    return new VirtualFS(data.files)
  }

  /**
   * Execute a bash-like command against this file system
   */
  async executeCommand(command: string): Promise<CommandResult> {
    return execCmd(command, this)
  }
}
