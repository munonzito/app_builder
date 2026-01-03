import { getFirebaseFirestore } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = getFirebaseFirestore()
  const snapshot = await db
    .collection('projects')
    .where('userId', '==', user.uid)
    .orderBy('updatedAt', 'desc')
    .get()

  const projects = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }))

  return { projects }
})
