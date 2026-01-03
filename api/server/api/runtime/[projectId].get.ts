/**
 * Runtime endpoint for the React Native mobile app's RuntimeScreen.
 * Returns project files and dependencies in the format expected by the native runtime.
 */
import { getFirebaseFirestore } from '~/server/lib/firebase'

interface RuntimeDependency {
  version: string
  resolved?: string
  handle?: string
}

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const projectId = getRouterParam(event, 'projectId')

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  const db = getFirebaseFirestore()
  const doc = await db.collection('projects').doc(projectId).get()

  if (!doc.exists) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const data = doc.data()

  // Verify ownership
  if (data?.userId !== user.uid) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  // Parse the code JSON into files object
  let files: Record<string, string> = {}
  if (data?.code) {
    try {
      files = JSON.parse(data.code)
    } catch {
      // Fallback: treat as single App.tsx file
      files = { 'App.tsx': data.code }
    }
  }

  // Convert dependencies array to the format expected by the runtime's Modules.tsx
  // The runtime expects: { [packageName]: { version, resolved?, handle? } }
  const dependenciesArray: string[] = data?.dependencies || []
  const dependencies: Record<string, RuntimeDependency> = {}
  
  for (const dep of dependenciesArray) {
    // Dependencies are stored as package names, use latest as version
    // The runtime will resolve the actual version from Snackager
    dependencies[dep] = {
      version: 'latest',
    }
  }

  return {
    id: doc.id,
    name: data?.name || 'Untitled',
    files,
    dependencies,
  }
})
