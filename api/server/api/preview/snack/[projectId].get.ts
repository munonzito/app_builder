import { createHash } from 'crypto'
import { Snack } from 'snack-sdk'
import { getFirebaseFirestore } from '~/server/lib/firebase'

/**
 * Extract dependencies from package.json in project files
 * Returns Record<string, string> of package name to version
 */
function extractDependenciesFromFiles(files: Record<string, string>): Record<string, string> {
  const packageJsonContent = files['package.json']
  if (!packageJsonContent) {
    return {}
  }
  try {
    const pkg = JSON.parse(packageJsonContent)
    return pkg.dependencies || {}
  } catch {
    return {}
  }
}

function computeCodeHash(code: string): string {
  return createHash('sha256').update(code).digest('hex').substring(0, 16)
}

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  const db = getFirebaseFirestore()
  const doc = await db.collection('projects').doc(projectId).get()

  if (!doc.exists) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const data = doc.data()

  // Parse the code JSON into files object
  let files: Record<string, string> = {}
  if (data?.code) {
    try {
      files = JSON.parse(data.code)
    } catch {
      files = { 'App.tsx': data.code }
    }
  }

  if (Object.keys(files).length === 0) {
    throw createError({ statusCode: 400, message: 'No files to preview' })
  }

  // Extract dependencies from package.json (single source of truth)
  const dependencies = extractDependenciesFromFiles(files)
  const dependencyNames = Object.keys(dependencies)

  // Compute hash of current code to check if we need to re-save
  const currentHash = computeCodeHash(data?.code || '')

  // Check if we have a cached snack that matches current code
  if (data?.snackId && data?.snackHash === currentHash) {
    console.log('[Snack] Using cached snack:', data.snackId)

    // Build the player URL using our self-hosted player (read-only mode - only snack param, no snack-channel)
    // Player is served from same origin to avoid CORS issues with Snack API
    const initialUrl = `exp://u.expo.dev/933fd9c0-1666-11e7-afca-d980795c5824?runtime-version=exposdk%3A54.0.0&channel-name=production&snack=${data.snackId}`
    const playerURL = `/v2/54/index.html?initialUrl=${encodeURIComponent(initialUrl)}&verbose=false`

    return {
      webPreviewURL: `https://snack.expo.dev/embedded/${data.snackId}`,
      playerURL,
      snackId: data.snackId,
      name: data?.name || 'Untitled',
      files,
      dependencies: dependencyNames,
      cached: true,
    }
  }

  // Transform files to Snack format (exclude package.json - Snack manages its own)
  const snackFiles: Record<string, { type: 'CODE'; contents: string }> = {}
  for (const [filename, contents] of Object.entries(files)) {
    if (filename !== 'package.json') {
      snackFiles[filename] = { type: 'CODE', contents }
    }
  }

  // Debug: Log what files we're sending to Snack
  console.log('[Snack] Files being sent:', Object.keys(snackFiles))
  console.log('[Snack] Has App.tsx:', 'App.tsx' in snackFiles)
  console.log('[Snack] Has App.js:', 'App.js' in snackFiles)

  // Transform dependencies to Snack format
  const snackDependencies: Record<string, { version: string }> = {}
  for (const [packageName, version] of Object.entries(dependencies)) {
    snackDependencies[packageName] = { version }
  }

  // Create Snack instance server-side
  const snack = new Snack({
    name: data?.name || 'Untitled',
    files: snackFiles,
    dependencies: snackDependencies,
    sdkVersion: '54.0.0',
  })

  // Save the Snack to get a permanent URL
  try {
    // First, wait for dependencies to be resolved (this bundles them on Snackager)
    console.log('[Snack] Resolving dependencies...')
    const state = await Promise.race([
      snack.getStateAsync(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Dependency resolution timeout')), 60000)
      ),
    ])
    console.log('[Snack] Dependencies resolved:', Object.keys(state.dependencies))

    // Now save with resolved dependencies
    console.log('[Snack] Saving snack to Expo servers...')
    const saveResult = await Promise.race([
      snack.saveAsync(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Snack save timeout')), 30000)
      ),
    ])

    console.log('[Snack] Save result:', JSON.stringify(saveResult, null, 2))

    if (saveResult.id) {
      // Cache the snack ID and hash in Firestore
      await db.collection('projects').doc(projectId).update({
        snackId: saveResult.id,
        snackHash: currentHash,
      })
      console.log('[Snack] Cached snack ID:', saveResult.id)

      const webPreviewURL = `https://snack.expo.dev/embedded/${saveResult.id}`

      // Build the player URL using our self-hosted player (read-only mode - only snack param, no snack-channel)
      // Player is served from same origin to avoid CORS issues with Snack API
      const initialUrl = `exp://u.expo.dev/933fd9c0-1666-11e7-afca-d980795c5824?runtime-version=exposdk%3A54.0.0&channel-name=production&snack=${saveResult.id}`
      const playerURL = `/v2/54/index.html?initialUrl=${encodeURIComponent(initialUrl)}&verbose=false`

      console.log('[Snack] Permanent URL:', webPreviewURL)
      console.log('[Snack] Player URL:', playerURL)

      return {
        webPreviewURL,
        playerURL,
        snackId: saveResult.id,
        name: data?.name || 'Untitled',
        files,
        dependencies: dependencyNames,
        cached: false,
      }
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to save Snack - no ID returned',
    })
  } catch (error: any) {
    console.error('[Snack] Error saving snack:', error.message)
    throw createError({
      statusCode: 500,
      message: `Failed to save preview: ${error.message}`,
    })
  }
})
