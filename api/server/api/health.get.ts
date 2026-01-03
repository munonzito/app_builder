export default defineEventHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      firebase: process.env.USE_FIREBASE_EMULATOR === 'true' ? 'emulator' : 'production',
      ai: process.env.USE_MOCK_AI === 'true' ? 'mock' : 'live',
    },
  }
})
