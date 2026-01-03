// Clear cached snack data for a project (forces re-generation)
import { getFirebaseFirestore } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId')

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  const db = getFirebaseFirestore()
  
  try {
    await db.collection('projects').doc(projectId).update({
      snackId: null,
      snackHash: null,
    })
    
    console.log('[Snack] Cleared cache for project:', projectId)
    
    return { success: true, message: 'Snack cache cleared' }
  } catch (error: any) {
    console.error('[Snack] Error clearing cache:', error.message)
    throw createError({ 
      statusCode: 500, 
      message: `Failed to clear cache: ${error.message}` 
    })
  }
})
