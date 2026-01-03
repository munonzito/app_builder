import { getFirebaseFirestore } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'Project ID is required' })
  }

  const db = getFirebaseFirestore()
  const doc = await db.collection('projects').doc(id).get()

  if (!doc.exists) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const data = doc.data()

  if (data?.userId !== user.uid) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
})
