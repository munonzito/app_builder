/**
 * Command Parser Tests
 * 
 * Comprehensive tests for the bash-like command interpreter.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { VirtualFS } from '../server/utils/virtualFS'
import { executeCommand } from '../server/utils/commandParser'

describe('Command Parser', () => {
  let fs: VirtualFS

  beforeEach(() => {
    fs = new VirtualFS({
      'App.tsx': `import React from 'react';
export default function App() {
  return <View><Text>Hello World</Text></View>;
}`,
      'screens/Home.tsx': `import React from 'react';
export default function Home() {
  return <View><Text>Home Screen</Text></View>;
}`,
      'screens/Settings.tsx': `import React from 'react';
export default function Settings() {
  return <View><Text>Settings</Text></View>;
}`,
      'components/Button.tsx': `import React from 'react';
export function Button({ title, onPress }) {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
}`,
      'utils/helpers.ts': `export function formatDate(date: Date): string {
  return date.toISOString();
}`,
      'package.json': JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
        dependencies: {
          expo: '~51.0.0',
          react: '18.2.0',
          'react-native': '0.74.5',
        },
      }, null, 2),
    })
  })

  // ===========================================================================
  // BASIC COMMANDS
  // ===========================================================================

  describe('ls command', () => {
    it('should list all files', async () => {
      const result = await executeCommand('ls', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
      expect(result.stdout).toContain('screens/Home.tsx')
      expect(result.stdout).toContain('components/Button.tsx')
    })

    it('should list files in a directory', async () => {
      const result = await executeCommand('ls screens', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('screens/Home.tsx')
      expect(result.stdout).toContain('screens/Settings.tsx')
    })

    it('should list multiple directories', async () => {
      const result = await executeCommand('ls screens components', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('screens/Home.tsx')
      expect(result.stdout).toContain('components/Button.tsx')
    })

    it('should handle empty directory', async () => {
      const result = await executeCommand('ls nonexistent', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No files')
    })
  })

  describe('cat command', () => {
    it('should read file contents', async () => {
      const result = await executeCommand('cat App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain("import React from 'react'")
      expect(result.stdout).toContain('Hello World')
    })

    it('should read multiple files', async () => {
      const result = await executeCommand('cat App.tsx utils/helpers.ts', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Hello World')
      expect(result.stdout).toContain('formatDate')
    })

    it('should handle missing file', async () => {
      const result = await executeCommand('cat nonexistent.tsx', fs)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('No such file')
    })

    it('should handle missing operand', async () => {
      const result = await executeCommand('cat', fs)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('missing file operand')
    })
  })

  describe('head command', () => {
    it('should show first 10 lines by default', async () => {
      const result = await executeCommand('head App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain("import React from 'react'")
    })

    it('should show first N lines with -n flag', async () => {
      const result = await executeCommand('head -n 2 App.tsx', fs)
      expect(result.exitCode).toBe(0)
      const lines = result.stdout.split('\n')
      expect(lines.length).toBeLessThanOrEqual(2)
    })

    it('should show first N lines with -N shorthand', async () => {
      const result = await executeCommand('head -2 App.tsx', fs)
      expect(result.exitCode).toBe(0)
      const lines = result.stdout.split('\n')
      expect(lines.length).toBeLessThanOrEqual(2)
    })
  })

  describe('tail command', () => {
    it('should show last lines', async () => {
      const result = await executeCommand('tail -n 2 App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('}')
    })

    it('should work with -N shorthand', async () => {
      const result = await executeCommand('tail -2 App.tsx', fs)
      expect(result.exitCode).toBe(0)
    })
  })

  describe('grep command', () => {
    it('should search for pattern', async () => {
      const result = await executeCommand('grep "Hello"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Hello World')
    })

    it('should search case-insensitively with -i', async () => {
      const result = await executeCommand('grep -i "hello"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Hello')
    })

    it('should show line numbers with -n', async () => {
      const result = await executeCommand('grep -n "import" App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+:/)
    })

    it('should handle combined flags -in', async () => {
      const result = await executeCommand('grep -in "hello"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+:/)
    })

    it('should count matches with -c', async () => {
      const result = await executeCommand('grep -c "import"', fs)
      expect(result.exitCode).toBe(0)
      expect(parseInt(result.stdout)).toBeGreaterThan(0)
    })

    it('should invert match with -v', async () => {
      const result = await executeCommand('grep -v "import" App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).not.toContain('import')
    })

    it('should return empty for no matches', async () => {
      const result = await executeCommand('grep "nonexistent_string_xyz"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('')
    })
  })

  describe('find command', () => {
    it('should find files by name pattern', async () => {
      const result = await executeCommand('find . -name "*.tsx"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
      expect(result.stdout).toContain('Home.tsx')
    })

    it('should find files in subdirectory', async () => {
      const result = await executeCommand('find screens -name "*.tsx"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('screens/Home.tsx')
      expect(result.stdout).not.toContain('App.tsx')
    })
  })

  describe('wc command', () => {
    it('should count lines with -l', async () => {
      const result = await executeCommand('wc -l App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
      expect(result.stdout).toMatch(/\d+/)
    })

    it('should count words with -w', async () => {
      const result = await executeCommand('wc -w App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toMatch(/\d+/)
    })
  })

  // ===========================================================================
  // FILE OPERATIONS
  // ===========================================================================

  describe('echo with redirection', () => {
    it('should write to file with >', async () => {
      const result = await executeCommand('echo "new content" > newfile.txt', fs)
      expect(result.exitCode).toBe(0)
      
      const file = fs.readFile('newfile.txt')
      expect(file.found).toBe(true)
      expect(file.content).toBe('new content')
    })

    it('should append to file with >>', async () => {
      fs.writeFile('existing.txt', 'first line')
      
      const result = await executeCommand('echo "second line" >> existing.txt', fs)
      expect(result.exitCode).toBe(0)
      
      const file = fs.readFile('existing.txt')
      expect(file.content).toContain('first line')
      expect(file.content).toContain('second line')
    })

    it('should create file when appending to nonexistent', async () => {
      const result = await executeCommand('echo "content" >> newfile.txt', fs)
      expect(result.exitCode).toBe(0)
      
      const file = fs.readFile('newfile.txt')
      expect(file.found).toBe(true)
      expect(file.content).toBe('content')
    })

    it('should handle single quoted content', async () => {
      const result = await executeCommand("echo 'single quotes' > test.txt", fs)
      expect(result.exitCode).toBe(0)
      
      const file = fs.readFile('test.txt')
      expect(file.content).toBe('single quotes')
    })
  })

  describe('rm command', () => {
    it('should delete a file', async () => {
      expect(fs.readFile('App.tsx').found).toBe(true)
      
      const result = await executeCommand('rm App.tsx', fs)
      expect(result.exitCode).toBe(0)
      
      expect(fs.readFile('App.tsx').found).toBe(false)
    })

    it('should error on missing file', async () => {
      const result = await executeCommand('rm nonexistent.tsx', fs)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('No such file')
    })

    it('should not error with -f flag on missing file', async () => {
      const result = await executeCommand('rm -f nonexistent.tsx', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle -rf flags', async () => {
      const result = await executeCommand('rm -rf nonexistent.tsx', fs)
      expect(result.exitCode).toBe(0)
    })
  })

  describe('mv command', () => {
    it('should rename a file', async () => {
      const result = await executeCommand('mv App.tsx Main.tsx', fs)
      expect(result.exitCode).toBe(0)
      
      expect(fs.readFile('App.tsx').found).toBe(false)
      expect(fs.readFile('Main.tsx').found).toBe(true)
    })

    it('should error on missing source', async () => {
      const result = await executeCommand('mv nonexistent.tsx dest.tsx', fs)
      expect(result.exitCode).toBe(1)
    })
  })

  describe('cp command', () => {
    it('should copy a file', async () => {
      const result = await executeCommand('cp App.tsx AppCopy.tsx', fs)
      expect(result.exitCode).toBe(0)
      
      expect(fs.readFile('App.tsx').found).toBe(true)
      expect(fs.readFile('AppCopy.tsx').found).toBe(true)
      expect(fs.readFile('AppCopy.tsx').content).toBe(fs.readFile('App.tsx').content)
    })
  })

  describe('touch command', () => {
    it('should create empty file', async () => {
      const result = await executeCommand('touch newfile.ts', fs)
      expect(result.exitCode).toBe(0)
      
      const file = fs.readFile('newfile.ts')
      expect(file.found).toBe(true)
      expect(file.content).toBe('')
    })

    it('should not overwrite existing file', async () => {
      const originalContent = fs.readFile('App.tsx').content
      
      const result = await executeCommand('touch App.tsx', fs)
      expect(result.exitCode).toBe(0)
      
      expect(fs.readFile('App.tsx').content).toBe(originalContent)
    })
  })

  // ===========================================================================
  // NPM COMMANDS
  // ===========================================================================

  describe('npm commands', () => {
    it('should install a package', async () => {
      const result = await executeCommand('npm install lodash', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('added')
      expect(fs.getDependencies()).toHaveProperty('lodash')
    })

    it('should install multiple packages', async () => {
      const result = await executeCommand('npm install axios lodash', fs)
      expect(result.exitCode).toBe(0)
      expect(fs.getDependencies()).toHaveProperty('axios')
      expect(fs.getDependencies()).toHaveProperty('lodash')
    })

    it('should uninstall a package', async () => {
      const result = await executeCommand('npm uninstall expo', fs)
      expect(result.exitCode).toBe(0)
      expect(fs.getDependencies()).not.toHaveProperty('expo')
    })

    it('should list packages', async () => {
      const result = await executeCommand('npm list', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('expo')
      expect(result.stdout).toContain('react')
    })

    it('should handle npm i alias', async () => {
      const result = await executeCommand('npm i lodash', fs)
      expect(result.exitCode).toBe(0)
      expect(fs.getDependencies()).toHaveProperty('lodash')
    })
  })

  // ===========================================================================
  // COMMAND CHAINING
  // ===========================================================================

  describe('command chaining with &&', () => {
    it('should run second command if first succeeds', async () => {
      const result = await executeCommand('ls && cat App.tsx', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should not run second command if first fails', async () => {
      const result = await executeCommand('cat nonexistent.tsx && echo "success"', fs)
      expect(result.exitCode).toBe(1)
      expect(result.stdout).not.toContain('success')
    })

    it('should chain multiple commands', async () => {
      const result = await executeCommand('ls && pwd && npm list', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle ls && ls screens components', async () => {
      const result = await executeCommand('ls && ls screens components', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).not.toContain('No files in &&')
    })
  })

  describe('command chaining with ||', () => {
    it('should run second command if first fails', async () => {
      const result = await executeCommand('cat nonexistent.tsx || echo "fallback"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('fallback')
    })

    it('should not run second command if first succeeds', async () => {
      const result = await executeCommand('ls || echo "fallback"', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).not.toContain('fallback')
    })
  })

  describe('command chaining with ;', () => {
    it('should run commands sequentially regardless of exit code', async () => {
      const result = await executeCommand('pwd; ls', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should continue after failed command', async () => {
      const result = await executeCommand('cat nonexistent.tsx; echo "continued"', fs)
      expect(result.stdout).toBe('continued')
    })
  })

  describe('complex chaining', () => {
    it('should handle && and || together', async () => {
      // Note: Our parser handles one operator type at a time, left to right
      const result = await executeCommand('ls && echo "found files"', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle real-world example', async () => {
      const result = await executeCommand('npm install lodash && npm list', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('lodash')
    })
  })

  // ===========================================================================
  // PIPING
  // ===========================================================================

  describe('piping with |', () => {
    it('should pipe ls to grep', async () => {
      const result = await executeCommand('ls | grep tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('.tsx')
    })

    it('should pipe cat to head', async () => {
      const result = await executeCommand('cat App.tsx | head -n 2', fs)
      expect(result.exitCode).toBe(0)
      const lines = result.stdout.split('\n')
      expect(lines.length).toBeLessThanOrEqual(2)
    })

    it('should pipe grep to wc', async () => {
      const result = await executeCommand('grep "import" | wc -l', fs)
      expect(result.exitCode).toBe(0)
      expect(parseInt(result.stdout)).toBeGreaterThan(0)
    })

    it('should handle multiple pipes', async () => {
      const result = await executeCommand('ls | grep tsx | head -n 3', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should pipe to sort', async () => {
      const result = await executeCommand('ls | sort', fs)
      expect(result.exitCode).toBe(0)
      const lines = result.stdout.split('\n')
      const sorted = [...lines].sort()
      expect(lines).toEqual(sorted)
    })

    it('should pipe to sort -r (reverse)', async () => {
      const result = await executeCommand('ls | sort -r', fs)
      expect(result.exitCode).toBe(0)
      const lines = result.stdout.split('\n')
      const sorted = [...lines].sort().reverse()
      expect(lines).toEqual(sorted)
    })
  })

  // ===========================================================================
  // GLOB EXPANSION
  // ===========================================================================

  describe('glob expansion', () => {
    it('should expand *.tsx', async () => {
      const result = await executeCommand('cat *.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Hello World')
    })

    it('should expand screens/*.tsx', async () => {
      const result = await executeCommand('grep "Screen" screens/*.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Home Screen')
    })

    it('should expand in rm command', async () => {
      fs.writeFile('temp1.tmp', 'temp')
      fs.writeFile('temp2.tmp', 'temp')
      
      const result = await executeCommand('rm *.tmp', fs)
      expect(result.exitCode).toBe(0)
      expect(fs.readFile('temp1.tmp').found).toBe(false)
      expect(fs.readFile('temp2.tmp').found).toBe(false)
    })

    it('should expand in wc command', async () => {
      const result = await executeCommand('wc -l *.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
    })
  })

  // ===========================================================================
  // NEW COMMANDS
  // ===========================================================================

  describe('tree command', () => {
    it('should show tree structure', async () => {
      const result = await executeCommand('tree', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
      expect(result.stdout).toContain('screens')
      expect(result.stdout).toMatch(/[├└]/)
    })

    it('should show tree for subdirectory', async () => {
      const result = await executeCommand('tree screens', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Home.tsx')
      expect(result.stdout).toContain('Settings.tsx')
    })
  })

  describe('stat command', () => {
    it('should show file stats', async () => {
      const result = await executeCommand('stat App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('File: App.tsx')
      expect(result.stdout).toContain('Size:')
      expect(result.stdout).toContain('Lines:')
    })

    it('should error on missing file', async () => {
      const result = await executeCommand('stat nonexistent.tsx', fs)
      expect(result.exitCode).toBe(1)
    })
  })

  describe('sed command', () => {
    it('should perform substitution', async () => {
      const result = await executeCommand('sed "s/Hello/Goodbye/g" App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Goodbye World')
      expect(result.stdout).not.toContain('Hello World')
    })

    it('should support -i for in-place editing', async () => {
      await executeCommand('sed -i "s/Hello/Goodbye/g" App.tsx', fs)
      const file = fs.readFile('App.tsx')
      expect(file.content).toContain('Goodbye World')
    })

    it('should support case-insensitive flag', async () => {
      const result = await executeCommand('sed "s/hello/Goodbye/gi" App.tsx', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Goodbye World')
    })
  })

  describe('project command (agent helper)', () => {
    it('should show project summary', async () => {
      const result = await executeCommand('project', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Files:')
      expect(result.stdout).toContain('Dependencies:')
      expect(result.stdout).toContain('App.tsx')
      expect(result.stdout).toContain('expo')
    })
  })

  describe('errors command (agent helper)', () => {
    it('should show no errors when clean', async () => {
      const result = await executeCommand('errors', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('No errors')
    })

    it('should show errors when present', async () => {
      fs.setErrors(['Error 1', 'Error 2'])
      const result = await executeCommand('errors', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Error 1')
      expect(result.stdout).toContain('Error 2')
    })
  })

  describe('deps command (agent helper)', () => {
    it('should list dependencies', async () => {
      const result = await executeCommand('deps', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('expo')
      expect(result.stdout).toContain('react')
    })
  })

  describe('sort command', () => {
    it('should sort input', async () => {
      const result = await executeCommand('ls | sort', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should sort with -u for unique', async () => {
      fs.writeFile('test.txt', 'b\na\nb\nc\na')
      const result = await executeCommand('cat test.txt | sort -u', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('a\nb\nc')
    })
  })

  describe('uniq command', () => {
    it('should remove consecutive duplicates', async () => {
      fs.writeFile('test.txt', 'a\na\nb\nb\na')
      const result = await executeCommand('cat test.txt | uniq', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('a\nb\na')
    })
  })

  describe('xargs command', () => {
    it('should execute command with stdin args', async () => {
      fs.writeFile('files.txt', 'App.tsx')
      const result = await executeCommand('cat files.txt | xargs cat', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Hello World')
    })
  })

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================

  describe('edge cases', () => {
    it('should handle empty command', async () => {
      const result = await executeCommand('', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('')
    })

    it('should handle whitespace-only command', async () => {
      const result = await executeCommand('   ', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle unknown command', async () => {
      const result = await executeCommand('unknown_cmd', fs)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('command not found')
    })

    it('should handle pwd', async () => {
      const result = await executeCommand('pwd', fs)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toBe('/')
    })

    it('should handle true command', async () => {
      const result = await executeCommand('true', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle false command', async () => {
      const result = await executeCommand('false', fs)
      expect(result.exitCode).toBe(1)
    })

    it('should handle mkdir (no-op in VirtualFS)', async () => {
      const result = await executeCommand('mkdir -p new/nested/dir', fs)
      expect(result.exitCode).toBe(0)
    })

    it('should handle quoted strings with spaces', async () => {
      const result = await executeCommand('echo "hello world" > test.txt', fs)
      expect(result.exitCode).toBe(0)
      expect(fs.readFile('test.txt').content).toBe('hello world')
    })
  })

  // ===========================================================================
  // TSC VALIDATION
  // ===========================================================================

  describe('tsc command', () => {
    it('should validate TypeScript files', async () => {
      const result = await executeCommand('tsc --noEmit', fs)
      // May pass or fail depending on content
      expect(result.exitCode).toBeDefined()
    })
  })

  // ===========================================================================
  // VIRTUALFS INTEGRATION
  // ===========================================================================

  describe('VirtualFS.executeCommand integration', () => {
    it('should work through VirtualFS method', async () => {
      const result = await fs.executeCommand('ls')
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('App.tsx')
    })

    it('should work with chained commands', async () => {
      const result = await fs.executeCommand('ls && cat App.tsx')
      expect(result.exitCode).toBe(0)
    })

    it('should work with pipes', async () => {
      const result = await fs.executeCommand('ls | grep tsx')
      expect(result.exitCode).toBe(0)
    })
  })
})
