import { firebaseAuth } from '~/server/lib/firebase'

export default defineEventHandler(async (event) => {
  const { idToken } = await readBody(event)

  if (!idToken) {
    throw createError({
      statusCode: 400,
      message: 'Missing idToken',
    })
  }

  try {
    const expiresInMs = 14 * 24 * 60 * 60 * 1000 // 14 days
    const sessionCookie = await firebaseAuth.createSessionCookie(idToken, {
      expiresIn: expiresInMs,
    })

    setCookie(event, 'session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresInMs / 1000,
    })

    return { success: true }
  } catch (error) {
    console.error('Session login error:', error)
    throw createError({
      statusCode: 401,
      message: 'Failed to create session',
    })
  }
})
