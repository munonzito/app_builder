export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Configure components to not use path prefix
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Transpile ESM-only packages (e2b uses chalk v5 which is ESM-only)
  build: {
    transpile: ['e2b', 'chalk'],
  },

  runtimeConfig: {
    // Server-side Firebase Admin
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    // AI keys
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    defaultAiModel: process.env.DEFAULT_AI_MODEL || 'claude-3-5-sonnet-20241022',
    // Public runtime config (client-side)
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
  },

  nitro: {
    preset: 'vercel',
    // Externalize e2b and its ESM dependencies to avoid bundling issues
    externals: {
      inline: [],
      external: ['e2b', 'chalk', '@connectrpc/connect', '@connectrpc/connect-web'],
    },
    // Rollup external config for e2b and chalk
    rollupConfig: {
      external: ['e2b', 'chalk'],
    },
  },

  // Polyfills for snack-sdk (uses Node.js modules)
  vite: {
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        assert: 'assert',
        buffer: 'buffer',
        process: 'process/browser',
        stream: 'stream-browserify',
      },
    },
    optimizeDeps: {
      include: ['assert', 'buffer', 'process', 'stream-browserify'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
  },
})
