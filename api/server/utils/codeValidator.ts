/**
 * Code Validator
 * 
 * TypeScript/TSX validation using esbuild's transform API.
 * Provides accurate syntax validation without false positives.
 * Uses esbuild instead of TypeScript compiler for smaller bundle size
 * and better compatibility with serverless environments.
 */

import { transform, type Loader, type Message } from 'esbuild'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export async function validateTypeScript(content: string, filename: string): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Determine loader based on file extension
  let loader: Loader
  if (filename.endsWith('.tsx')) {
    loader = 'tsx'
  } else if (filename.endsWith('.ts')) {
    loader = 'ts'
  } else if (filename.endsWith('.jsx')) {
    loader = 'jsx'
  } else if (filename.endsWith('.js')) {
    loader = 'js'
  } else {
    loader = 'tsx' // Default to TSX for React Native
  }

  try {
    // Use esbuild's transform API to parse and validate the code
    const result = await transform(content, {
      loader,
      jsx: 'automatic',
      target: 'esnext',
      format: 'esm',
      logLevel: 'silent', // We handle errors ourselves
    })

    // Collect warnings from esbuild
    for (const warning of result.warnings) {
      warnings.push(formatMessage(warning))
    }
  } catch (error: any) {
    // esbuild throws on syntax errors - extract error messages
    if (error.errors && Array.isArray(error.errors)) {
      for (const err of error.errors as Message[]) {
        errors.push(formatMessage(err))
      }
    } else if (error.message) {
      errors.push(error.message)
    } else {
      errors.push('Unknown parsing error')
    }
  }

  // Add warnings for common React Native issues (non-blocking)
  const reactWarnings = checkReactNativePatterns(content, filename)
  warnings.push(...reactWarnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function formatMessage(msg: Message): string {
  const location = msg.location
  if (location) {
    const lineInfo = `Line ${location.line}`
    const colInfo = location.column !== undefined ? `, Col ${location.column}` : ''
    const nearText = location.lineText 
      ? ` (near: "${location.lineText.trim().substring(0, 50)}${location.lineText.length > 50 ? '...' : ''}")`
      : ''
    return `${lineInfo}${colInfo}: ${msg.text}${nearText}`
  }
  return msg.text
}

function checkReactNativePatterns(content: string, filename: string): string[] {
  const warnings: string[] = []

  // Only check TSX files for React patterns
  if (!filename.endsWith('.tsx')) {
    return warnings
  }

  // Check for missing default export in screen/component files
  if (
    (filename.includes('Screen') || filename.includes('Component')) &&
    !content.includes('export default')
  ) {
    warnings.push('No default export found - component may not be importable')
  }

  // Check for common typos (case-sensitive)
  const typoChecks = [
    { wrong: /\bStylesheet\b/g, correct: 'StyleSheet' },
    { wrong: /\busestate\b/g, correct: 'useState' },
    { wrong: /\buseeffect\b/g, correct: 'useEffect' },
  ]

  for (const { wrong, correct } of typoChecks) {
    if (wrong.test(content)) {
      warnings.push(`Possible typo: should be "${correct}"`)
    }
  }

  return warnings
}

export function validateImports(content: string, availableFiles: string[]): string[] {
  const errors: string[] = []
  const importRegex = /import\s+.*\s+from\s+['"]\.\/([^'"]+)['"]/g

  let match
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    // Normalize the import path
    const possiblePaths = [
      importPath,
      `${importPath}.ts`,
      `${importPath}.tsx`,
      `${importPath}/index.ts`,
      `${importPath}/index.tsx`,
    ]

    const found = possiblePaths.some((p) => availableFiles.includes(p))
    if (!found) {
      errors.push(`Import not found: ./${importPath}`)
    }
  }

  return errors
}
