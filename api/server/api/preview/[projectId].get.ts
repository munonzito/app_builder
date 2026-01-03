import { getFirebaseFirestore } from '~/server/lib/firebase'

/**
 * Extract dependencies from package.json in project files
 * Returns a Record of package name to version string
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

  // Extract dependencies from package.json (single source of truth)
  const dependencies = extractDependenciesFromFiles(files)

  return {
    name: data?.name || 'Untitled',
    files,
    dependencies,
  }
})
