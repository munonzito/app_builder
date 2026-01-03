import { getFirebaseFirestore } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  if (!body.name) {
    throw createError({ statusCode: 400, message: 'Project name is required' })
  }

  const db = getFirebaseFirestore()
  const now = new Date()

  const projectData = {
    userId: user.uid,
    name: body.name,
    createdAt: now,
    updatedAt: now,
    code: null,
    previewUrl: null,
    dependencies: [],
    chatHistory: [],
  }

  const docRef = await db.collection('projects').add(projectData)

  return {
    project: {
      id: docRef.id,
      ...projectData,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  }
})
