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

  const body = await readBody(event)
  const db = getFirebaseFirestore()
  
  const doc = await db.collection('projects').doc(id).get()

  if (!doc.exists) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  if (doc.data()?.userId !== user.uid) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.name) updateData.name = body.name
  if (body.code !== undefined) updateData.code = body.code
  if (body.previewUrl !== undefined) updateData.previewUrl = body.previewUrl
  if (body.dependencies) updateData.dependencies = body.dependencies

  await db.collection('projects').doc(id).update(updateData)

  const updatedDoc = await db.collection('projects').doc(id).get()
  const data = updatedDoc.data()

  return {
    id: updatedDoc.id,
    ...data,
    createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
})
