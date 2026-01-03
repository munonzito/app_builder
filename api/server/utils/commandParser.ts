/**
 * Command Parser
 * 
 * Parses and executes bash-like commands against the VirtualFS.
 * Supports common Unix commands for file operations, searching, and npm.
 * 
 * Features:
 * - Command chaining: &&, ||, ;
 * - Piping: |
 * - Glob expansion: *.tsx, screens/*.tsx
 * - Redirections: >, >>
 */

import type { VirtualFS } from './virtualFS'
import { validateTypeScript } from './codeValidator'

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
}

type CommandHandler = (args: string[], fs: VirtualFS, stdin?: string) => Promise<CommandResult> | CommandResult

const ok = (stdout: string): CommandResult => ({ stdout, stderr: '', exitCode: 0 })
const err = (stderr: string): CommandResult => ({ stdout: '', stderr, exitCode: 1 })

/**
 * Parse arguments respecting quotes
 */
function parseArgs(argsString: string): string[] {
  const args: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''

  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i]

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      quoteChar = char
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false
      quoteChar = ''
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        args.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current) {
    args.push(current)
  }

  return args
}

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
 * Expand glob patterns to actual file paths
 */
function expandGlobs(args: string[], fs: VirtualFS): string[] {
  const files = fs.listFiles()
  const expanded: string[] = []

  for (const arg of args) {
    if (arg.includes('*')) {
      const matches = files.filter(f => matchGlob(arg, f.path)).map(f => f.path)
      if (matches.length > 0) {
        expanded.push(...matches)
      } else {
        // No matches - keep original (will error on file not found)
        expanded.push(arg)
      }
    } else {
      expanded.push(arg)
    }
  }

  return expanded
}

/**
 * Get directory part of a path
 */
function getDirectory(path: string): string {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash === -1 ? '' : path.substring(0, lastSlash)
}

/**
 * Get filename part of a path
 */
function getFilename(path: string): string {
  const lastSlash = path.lastIndexOf('/')
  return lastSlash === -1 ? path : path.substring(lastSlash + 1)
}

// ============================================================================
// COMMANDS
// ============================================================================

const commands: Record<string, CommandHandler> = {
  ls: (args, fs) => {
    const files = fs.listFiles()
    
    // Parse flags and directories
    let showAll = false
    const targetDirs: string[] = []
    
    for (const arg of args) {
      if (arg === '-a' || arg === '-la' || arg === '-al') {
        showAll = true
      } else if (!arg.startsWith('-')) {
        targetDirs.push(arg)
      }
    }

    // If no dirs specified, list all
    if (targetDirs.length === 0) {
      if (files.length === 0) {
        return ok('No files in project')
      }
      return ok(files.map(f => f.path).join('\n'))
    }

    // List each directory
    const outputs: string[] = []
    for (const targetDir of targetDirs) {
      const filtered = files.filter(f => {
        const dir = getDirectory(f.path)
        return dir === targetDir || dir.startsWith(targetDir + '/') || f.path === targetDir
      })

      if (targetDirs.length > 1) {
        outputs.push(`${targetDir}:`)
      }
      
      if (filtered.length === 0) {
        outputs.push(`No files in ${targetDir}`)
      } else {
        outputs.push(filtered.map(f => f.path).join('\n'))
      }
    }

    return ok(outputs.join('\n'))
  },

  cat: (args, fs, stdin) => {
    // If we have stdin and no args, just return stdin
    if (stdin !== undefined && args.length === 0) {
      return ok(stdin)
    }
    
    if (args.length === 0) {
      return err('cat: missing file operand')
    }

    const expandedArgs = expandGlobs(args, fs)
    const outputs: string[] = []
    
    for (const path of expandedArgs) {
      const file = fs.readFile(path)
      if (!file.found) {
        return err(`cat: ${path}: No such file`)
      }
      outputs.push(file.content!)
    }
    return ok(outputs.join('\n'))
  },

  head: (args, fs, stdin) => {
    let lines = 10
    let filePath = ''

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        lines = parseInt(args[i + 1], 10)
        i++
      } else if (args[i].match(/^-\d+$/)) {
        lines = parseInt(args[i].substring(1), 10)
      } else if (!args[i].startsWith('-') && !filePath) {
        filePath = args[i]
      }
    }

    let content: string
    if (stdin !== undefined) {
      content = stdin
    } else {
      if (!filePath) {
        return err('head: missing file operand')
      }
      const file = fs.readFile(filePath)
      if (!file.found) {
        return err(`head: ${filePath}: No such file`)
      }
      content = file.content!
    }

    const contentLines = content.split('\n')
    return ok(contentLines.slice(0, lines).join('\n'))
  },

  tail: (args, fs, stdin) => {
    let lines = 10
    let filePath = ''

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        lines = parseInt(args[i + 1], 10)
        i++
      } else if (args[i].match(/^-\d+$/)) {
        lines = parseInt(args[i].substring(1), 10)
      } else if (!args[i].startsWith('-') && !filePath) {
        filePath = args[i]
      }
    }

    let content: string
    if (stdin !== undefined) {
      content = stdin
    } else {
      if (!filePath) {
        return err('tail: missing file operand')
      }
      const file = fs.readFile(filePath)
      if (!file.found) {
        return err(`tail: ${filePath}: No such file`)
      }
      content = file.content!
    }

    const contentLines = content.split('\n')
    return ok(contentLines.slice(-lines).join('\n'))
  },

  grep: (args, fs, stdin) => {
    if (args.length === 0) {
      return err('grep: missing pattern')
    }

    let pattern = ''
    let caseInsensitive = false
    let lineNumbers = false
    let invertMatch = false
    let countOnly = false
    const targetFiles: string[] = []

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (arg === '-i') {
        caseInsensitive = true
      } else if (arg === '-n') {
        lineNumbers = true
      } else if (arg === '-v') {
        invertMatch = true
      } else if (arg === '-c') {
        countOnly = true
      } else if (arg.startsWith('-') && arg.length > 1) {
        // Handle combined flags like -in, -ni
        if (arg.includes('i')) caseInsensitive = true
        if (arg.includes('n')) lineNumbers = true
        if (arg.includes('v')) invertMatch = true
        if (arg.includes('c')) countOnly = true
      } else if (!pattern) {
        pattern = arg
      } else {
        targetFiles.push(arg)
      }
    }

    if (!pattern) {
      return err('grep: missing pattern')
    }

    // Build regex
    const flags = caseInsensitive ? 'gi' : 'g'
    let regex: RegExp
    try {
      regex = new RegExp(pattern, flags)
    } catch {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      regex = new RegExp(escaped, flags)
    }

    // Determine what to search
    let linesToSearch: Array<{ path: string; line: number; content: string }> = []

    if (stdin !== undefined) {
      // Search stdin
      const lines = stdin.split('\n')
      linesToSearch = lines.map((content, i) => ({
        path: '',
        line: i + 1,
        content,
      }))
    } else {
      // Search files
      const files = fs.listFiles()
      const expandedFiles = expandGlobs(targetFiles, fs)
      const filesToSearch = expandedFiles.length > 0
        ? files.filter(f => expandedFiles.includes(f.path))
        : files

      for (const file of filesToSearch) {
        const fileContent = fs.readFile(file.path)
        if (fileContent.found && fileContent.content) {
          const lines = fileContent.content.split('\n')
          for (let i = 0; i < lines.length; i++) {
            linesToSearch.push({
              path: file.path,
              line: i + 1,
              content: lines[i],
            })
          }
        }
      }
    }

    // Filter lines
    const results = linesToSearch.filter(item => {
      const matches = regex.test(item.content)
      regex.lastIndex = 0 // Reset regex state
      return invertMatch ? !matches : matches
    })

    if (countOnly) {
      return ok(String(results.length))
    }

    if (results.length === 0) {
      return ok('')
    }

    const multipleFiles = new Set(results.map(r => r.path)).size > 1

    const output = results.map(r => {
      const parts: string[] = []
      if (r.path && multipleFiles) parts.push(`${r.path}:`)
      if (lineNumbers) parts.push(`${r.line}:`)
      parts.push(r.content)
      return parts.join('')
    }).join('\n')

    return ok(output)
  },

  find: (args, fs) => {
    let searchPath = '.'
    let namePattern = ''
    let typeFilter = '' // 'f' for files, 'd' for directories

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) {
        namePattern = args[i + 1]
        i++
      } else if (args[i] === '-type' && args[i + 1]) {
        typeFilter = args[i + 1]
        i++
      } else if (!args[i].startsWith('-')) {
        searchPath = args[i]
      }
    }

    const files = fs.listFiles()
    let filtered = files

    if (searchPath !== '.') {
      const normalizedPath = searchPath.replace(/^\.\//, '')
      filtered = filtered.filter(f => 
        f.path.startsWith(normalizedPath + '/') || f.path === normalizedPath
      )
    }

    if (namePattern) {
      filtered = filtered.filter(f => {
        const fileName = getFilename(f.path)
        return matchGlob(namePattern, fileName)
      })
    }

    // In VirtualFS, everything is a file
    if (typeFilter === 'd') {
      return ok('')
    }

    return ok(filtered.map(f => f.path).join('\n'))
  },

  wc: (args, fs, stdin) => {
    let countLines = false
    let countWords = false
    let countBytes = false
    const filePaths: string[] = []

    for (const arg of args) {
      if (arg === '-l') countLines = true
      else if (arg === '-w') countWords = true
      else if (arg === '-c') countBytes = true
      else if (!arg.startsWith('-')) filePaths.push(arg)
    }

    if (!countLines && !countWords && !countBytes) {
      countLines = countWords = countBytes = true
    }

    // Handle stdin
    if (stdin !== undefined) {
      const parts: number[] = []
      if (countLines) parts.push(stdin.split('\n').length)
      if (countWords) parts.push(stdin.split(/\s+/).filter(w => w).length)
      if (countBytes) parts.push(stdin.length)
      return ok(parts.join('\t'))
    }

    if (filePaths.length === 0) {
      return err('wc: missing file operand')
    }

    const expandedPaths = expandGlobs(filePaths, fs)
    const results: string[] = []
    
    for (const filePath of expandedPaths) {
      const file = fs.readFile(filePath)
      if (!file.found) {
        return err(`wc: ${filePath}: No such file`)
      }

      const content = file.content!
      const parts: number[] = []
      if (countLines) parts.push(content.split('\n').length)
      if (countWords) parts.push(content.split(/\s+/).filter(w => w).length)
      if (countBytes) parts.push(content.length)

      results.push(`${parts.join('\t')}\t${filePath}`)
    }

    return ok(results.join('\n'))
  },

  rm: (args, fs) => {
    let force = false
    let recursive = false
    const filePaths: string[] = []
    
    for (const arg of args) {
      if (arg === '-f') force = true
      else if (arg === '-r' || arg === '-R') recursive = true
      else if (arg === '-rf' || arg === '-fr') { force = true; recursive = true }
      else if (!arg.startsWith('-')) filePaths.push(arg)
    }

    if (filePaths.length === 0) {
      return err('rm: missing file operand')
    }

    const expandedPaths = expandGlobs(filePaths, fs)
    
    for (const filePath of expandedPaths) {
      const result = fs.deleteFile(filePath)
      if (!result.existed && !force) {
        return err(`rm: ${filePath}: No such file`)
      }
    }

    return ok('')
  },

  mv: (args, fs) => {
    const paths = args.filter(a => !a.startsWith('-'))

    if (paths.length < 2) {
      return err('mv: missing destination operand')
    }

    const [source, dest] = paths
    const result = fs.renameFile(source, dest)
    if (!result.success) {
      return err(`mv: ${result.error}`)
    }

    return ok('')
  },

  cp: (args, fs) => {
    const paths = args.filter(a => !a.startsWith('-'))

    if (paths.length < 2) {
      return err('cp: missing destination operand')
    }

    const [source, dest] = paths
    const file = fs.readFile(source)
    if (!file.found) {
      return err(`cp: ${source}: No such file`)
    }

    fs.writeFile(dest, file.content!)
    return ok('')
  },

  mkdir: () => {
    // In VirtualFS, directories are implicit
    return ok('')
  },

  pwd: () => {
    return ok('/')
  },

  echo: (args) => {
    return ok(args.join(' '))
  },

  true: () => ok(''),
  
  false: () => err(''),

  npm: (args, fs) => {
    if (args.length === 0) {
      return err('npm: missing command')
    }

    const subcommand = args[0]

    switch (subcommand) {
      case 'install':
      case 'i':
      case 'add': {
        const packages = args.slice(1).filter(a => !a.startsWith('-'))
        if (packages.length === 0) {
          return err('npm install: missing package name')
        }
        for (const pkg of packages) {
          // Parse package@version format
          const atIndex = pkg.lastIndexOf('@')
          if (atIndex > 0) {
            const name = pkg.substring(0, atIndex)
            const version = pkg.substring(atIndex + 1)
            fs.addDependency(name, version)
          } else {
            fs.addDependency(pkg)
          }
        }
        return ok(`added ${packages.length} package(s): ${packages.join(', ')}`)
      }

      case 'uninstall':
      case 'remove':
      case 'rm': {
        const packages = args.slice(1).filter(a => !a.startsWith('-'))
        if (packages.length === 0) {
          return err('npm uninstall: missing package name')
        }
        for (const pkg of packages) {
          fs.removeDependency(pkg)
        }
        return ok(`removed ${packages.length} package(s): ${packages.join(', ')}`)
      }

      case 'list':
      case 'ls': {
        const deps = fs.getDependencies()
        const depNames = Object.keys(deps)
        if (depNames.length === 0) {
          return ok('(no dependencies)')
        }
        return ok(depNames.map(name => `${name}@${deps[name]}`).join('\n'))
      }

      default:
        return err(`npm: unknown command '${subcommand}'`)
    }
  },

  tsc: async (args, fs) => {
    const files = fs.listFiles()
    const errors: string[] = []

    for (const file of files) {
      if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        const content = fs.readFile(file.path)
        if (content.found && content.content) {
          const validation = await validateTypeScript(content.content, file.path)
          if (!validation.valid) {
            errors.push(...validation.errors.map(e => `${file.path}: ${e}`))
          }
        }
      }
    }

    fs.setErrors(errors)

    if (errors.length === 0) {
      return ok('No errors found')
    }

    return { stdout: '', stderr: errors.join('\n'), exitCode: 1 }
  },

  touch: (args, fs) => {
    if (args.length === 0) {
      return err('touch: missing file operand')
    }

    for (const filePath of args) {
      const existing = fs.readFile(filePath)
      if (!existing.found) {
        fs.writeFile(filePath, '')
      }
    }

    return ok('')
  },

  // =========================================================================
  // NEW COMMANDS
  // =========================================================================

  tree: (args, fs) => {
    const targetDir = args[0] || ''
    const files = fs.listFiles()
    
    const filtered = files.filter(f => {
      if (!targetDir) return true
      return f.path.startsWith(targetDir + '/') || f.path === targetDir
    })

    if (filtered.length === 0) {
      return ok(targetDir ? `${targetDir} [empty]` : '[empty project]')
    }

    // Build tree structure
    const tree: Record<string, any> = {}
    for (const file of filtered) {
      const parts = file.path.split('/')
      let current = tree
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          current[part] = null // File
        } else {
          current[part] = current[part] || {}
          current = current[part]
        }
      }
    }

    // Render tree
    function renderTree(obj: Record<string, any>, prefix: string = ''): string[] {
      const lines: string[] = []
      const entries = Object.entries(obj).sort(([a], [b]) => {
        // Directories first
        const aIsDir = obj[a] !== null
        const bIsDir = obj[b] !== null
        if (aIsDir !== bIsDir) return aIsDir ? -1 : 1
        return a.localeCompare(b)
      })

      entries.forEach(([name, value], index) => {
        const isLast = index === entries.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPrefix = isLast ? '    ' : '│   '
        
        lines.push(prefix + connector + name)
        if (value !== null) {
          lines.push(...renderTree(value, prefix + childPrefix))
        }
      })

      return lines
    }

    const rootName = targetDir || '.'
    const output = [rootName, ...renderTree(tree)]
    return ok(output.join('\n'))
  },

  stat: (args, fs) => {
    if (args.length === 0) {
      return err('stat: missing file operand')
    }

    const filePath = args[0]
    const file = fs.readFile(filePath)
    
    if (!file.found) {
      return err(`stat: ${filePath}: No such file`)
    }

    const content = file.content!
    const lines = content.split('\n').length
    const words = content.split(/\s+/).filter(w => w).length
    const bytes = content.length

    const output = [
      `  File: ${filePath}`,
      `  Size: ${bytes} bytes`,
      ` Lines: ${lines}`,
      ` Words: ${words}`,
      `  Type: ${file.language}`,
    ].join('\n')

    return ok(output)
  },

  sed: (args, fs) => {
    if (args.length < 2) {
      return err('sed: usage: sed "s/old/new/g" file')
    }

    // Parse flags and find expression/file
    let inPlace = false
    let expr = ''
    let filePath = ''
    
    for (const arg of args) {
      if (arg === '-i') {
        inPlace = true
      } else if (!expr && arg.startsWith('s')) {
        expr = arg
      } else if (!arg.startsWith('-')) {
        filePath = arg
      }
    }

    if (!expr) {
      return err('sed: missing expression')
    }
    if (!filePath) {
      return err('sed: missing file operand')
    }

    // Parse sed expression: s/old/new/flags
    const sedMatch = expr.match(/^s(.)(.*?)\1(.*?)\1([gi]*)$/)
    if (!sedMatch) {
      return err(`sed: invalid expression: ${expr}`)
    }

    const [, , searchPattern, replacement, flags] = sedMatch
    const global = flags.includes('g')
    const caseInsensitive = flags.includes('i')

    const file = fs.readFile(filePath)
    if (!file.found) {
      return err(`sed: ${filePath}: No such file`)
    }

    let regex: RegExp
    try {
      const regexFlags = (global ? 'g' : '') + (caseInsensitive ? 'i' : '')
      regex = new RegExp(searchPattern, regexFlags)
    } catch {
      return err(`sed: invalid regex: ${searchPattern}`)
    }

    const newContent = file.content!.replace(regex, replacement)
    
    // In-place editing
    if (inPlace) {
      fs.writeFile(filePath, newContent)
      return ok('')
    }

    return ok(newContent)
  },

  // Agent helper: show project summary
  project: (args, fs) => {
    const summary = fs.getProjectSummary()
    const errors = fs.getErrors()
    const depEntries = Object.entries(summary.dependencies)

    const lines = [
      `Files: ${summary.fileCount}`,
      `Total lines: ${summary.totalLines}`,
      `Dependencies: ${depEntries.length}`,
      '',
      'Files:',
      ...summary.files.map(f => `  ${f.path} (${f.lines} lines)`),
      '',
      'Dependencies:',
      ...depEntries.map(([name, version]) => `  ${name}@${version}`),
    ]

    if (errors.length > 0) {
      lines.push('', 'Errors:', ...errors.map(e => `  ${e}`))
    }

    return ok(lines.join('\n'))
  },

  // Agent helper: show errors
  errors: (args, fs) => {
    const errors = fs.getErrors()
    if (errors.length === 0) {
      return ok('No errors')
    }
    return ok(errors.join('\n'))
  },

  // Alias for npm list
  deps: (args, fs) => {
    return commands.npm(['list'], fs)
  },

  // Sort command (useful for piping)
  sort: (args, fs, stdin) => {
    let reverse = false
    let unique = false
    
    for (const arg of args) {
      if (arg === '-r') reverse = true
      if (arg === '-u') unique = true
    }

    if (stdin === undefined) {
      return err('sort: no input')
    }

    let lines = stdin.split('\n')
    if (unique) {
      lines = [...new Set(lines)]
    }
    lines.sort()
    if (reverse) {
      lines.reverse()
    }

    return ok(lines.join('\n'))
  },

  // Unique filter
  uniq: (args, fs, stdin) => {
    if (stdin === undefined) {
      return err('uniq: no input')
    }
    const lines = stdin.split('\n')
    const unique = lines.filter((line, i) => i === 0 || line !== lines[i - 1])
    return ok(unique.join('\n'))
  },

  // Cut fields
  cut: (args, fs, stdin) => {
    let delimiter = '\t'
    let fields: number[] = []

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-d' && args[i + 1]) {
        delimiter = args[i + 1]
        i++
      } else if (args[i] === '-f' && args[i + 1]) {
        fields = args[i + 1].split(',').map(f => parseInt(f, 10) - 1)
        i++
      }
    }

    if (stdin === undefined) {
      return err('cut: no input')
    }

    const lines = stdin.split('\n').map(line => {
      const parts = line.split(delimiter)
      return fields.map(f => parts[f] || '').join(delimiter)
    })

    return ok(lines.join('\n'))
  },

  // Xargs - execute command with stdin as args
  xargs: async (args, fs, stdin) => {
    if (args.length === 0) {
      return err('xargs: missing command')
    }
    if (stdin === undefined || stdin.trim() === '') {
      return ok('')
    }

    const cmd = args[0]
    const cmdArgs = args.slice(1)
    const stdinArgs = stdin.trim().split(/\s+/)
    
    const fullCommand = [cmd, ...cmdArgs, ...stdinArgs].join(' ')
    return executeCommand(fullCommand, fs)
  },
}

// ============================================================================
// COMMAND EXECUTION ENGINE
// ============================================================================

/**
 * Split command string by operators while respecting quotes
 */
function splitByOperator(command: string, operator: string): string[] {
  const parts: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''
  let i = 0

  while (i < command.length) {
    const char = command[i]

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      quoteChar = char
      current += char
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false
      quoteChar = ''
      current += char
    } else if (!inQuotes && command.substring(i, i + operator.length) === operator) {
      parts.push(current.trim())
      current = ''
      i += operator.length
      continue
    } else {
      current += char
    }
    i++
  }

  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

/**
 * Execute a single command (no chaining)
 */
async function executeSingleCommand(
  command: string, 
  fs: VirtualFS, 
  stdin?: string
): Promise<CommandResult> {
  const trimmed = command.trim()
  
  if (!trimmed) {
    return ok(stdin || '')
  }

  // Handle echo with redirection: >> (append) first, then > (overwrite)
  const appendMatch = trimmed.match(/^echo\s+(["']?)(.+?)\1\s*>>\s*(.+)$/)
  if (appendMatch) {
    const content = appendMatch[2]
    const filePath = appendMatch[3].trim()
    const existing = fs.readFile(filePath)
    const newContent = existing.found ? existing.content + '\n' + content : content
    fs.writeFile(filePath, newContent)
    return ok('')
  }

  const writeMatch = trimmed.match(/^echo\s+(["']?)(.+?)\1\s*>\s*(.+)$/)
  if (writeMatch) {
    const content = writeMatch[2]
    const filePath = writeMatch[3].trim()
    fs.writeFile(filePath, content)
    return ok('')
  }

  // Handle heredoc: cat > file <<EOF ... EOF
  const heredocMatch = trimmed.match(/^cat\s*>\s*(.+?)\s*<<\s*['"]?(\w+)['"]?\n([\s\S]*?)\n\2$/)
  if (heredocMatch) {
    const filePath = heredocMatch[1].trim()
    const content = heredocMatch[3]
    fs.writeFile(filePath, content)
    return ok('')
  }

  const heredocAltMatch = trimmed.match(/^cat\s*<<\s*['"]?(\w+)['"]?\s*>\s*(.+?)\n([\s\S]*?)\n\1$/)
  if (heredocAltMatch) {
    const filePath = heredocAltMatch[2].trim()
    const content = heredocAltMatch[3]
    fs.writeFile(filePath, content)
    return ok('')
  }

  // Parse command and arguments
  const parts = parseArgs(trimmed)
  if (parts.length === 0) {
    return ok(stdin || '')
  }

  const cmd = parts[0]
  const args = parts.slice(1)

  const handler = commands[cmd]
  if (!handler) {
    return err(`${cmd}: command not found`)
  }

  return handler(args, fs, stdin)
}

/**
 * Execute a pipeline of commands
 */
async function executePipeline(commands: string[], fs: VirtualFS): Promise<CommandResult> {
  let stdin: string | undefined = undefined
  let lastResult: CommandResult = ok('')

  for (const cmd of commands) {
    lastResult = await executeSingleCommand(cmd, fs, stdin)
    if (lastResult.exitCode !== 0) {
      return lastResult
    }
    stdin = lastResult.stdout
  }

  return lastResult
}

/**
 * Main entry point - execute a command string with full support for chaining
 */
export async function executeCommand(command: string, fs: VirtualFS): Promise<CommandResult> {
  const trimmed = command.trim()
  
  if (!trimmed) {
    return ok('')
  }

  // Handle semicolon chaining first (sequential execution)
  if (trimmed.includes(';')) {
    const commands = splitByOperator(trimmed, ';')
    let lastResult: CommandResult = ok('')
    
    for (const cmd of commands) {
      lastResult = await executeCommand(cmd, fs)
    }
    
    return lastResult
  }

  // Handle && (AND) chaining
  if (trimmed.includes('&&')) {
    const commands = splitByOperator(trimmed, '&&')
    let lastResult: CommandResult = ok('')
    
    for (const cmd of commands) {
      lastResult = await executeCommand(cmd.trim(), fs)
      if (lastResult.exitCode !== 0) {
        return lastResult
      }
    }
    
    return lastResult
  }

  // Handle || (OR) chaining  
  if (trimmed.includes('||')) {
    const commands = splitByOperator(trimmed, '||')
    
    for (const cmd of commands) {
      const result = await executeCommand(cmd.trim(), fs)
      if (result.exitCode === 0) {
        return result
      }
    }
    
    return err('all commands failed')
  }

  // Handle piping
  if (trimmed.includes('|')) {
    const pipeCommands = splitByOperator(trimmed, '|')
    return executePipeline(pipeCommands, fs)
  }

  // Single command
  return executeSingleCommand(trimmed, fs)
}

// Helper export for multi-line file writes
export async function writeFileContent(
  fs: VirtualFS, 
  filePath: string, 
  content: string
): Promise<CommandResult> {
  fs.writeFile(filePath, content)
  return ok('')
}
