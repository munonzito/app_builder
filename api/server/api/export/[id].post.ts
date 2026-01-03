import archiver from 'archiver'
import { getFirebaseFirestore } from '~/server/lib/firebase'

/**
 * Extract dependencies from package.json in project files
 * Returns Record<string, string> of package name to version
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

  if (!data?.code) {
    throw createError({ statusCode: 400, message: 'No code to export' })
  }

  let files: Record<string, string>
  try {
    files = JSON.parse(data.code)
  } catch {
    files = { 'App.tsx': data.code }
  }

  // Extract dependencies from package.json in files (single source of truth)
  const projectDependencies = extractDependenciesFromFiles(files)

  // Build package.json for export, merging project dependencies with base Expo deps
  const packageJson = {
    name: data.name?.toLowerCase().replace(/\s+/g, '-') || 'my-app',
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
    },
    dependencies: {
      expo: '~51.0.0',
      'expo-status-bar': '~1.12.1',
      react: '18.2.0',
      'react-native': '0.74.5',
      ...projectDependencies,
    },
    devDependencies: {
      '@babel/core': '^7.20.0',
      '@types/react': '~18.2.45',
      typescript: '^5.1.3',
    },
    private: true,
  }

  const readme = `# ${data.name || 'My App'}

This app was generated with AI App Builder.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Run on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press 'a' for Android emulator, 'i' for iOS simulator

## Project Structure

- \`App.tsx\` - Main application entry point
- \`screens/\` - Screen components
- \`components/\` - Reusable components

## Built with

- React Native
- Expo
- TypeScript
`

  const archive = archiver('zip', { zlib: { level: 9 } })
  const chunks: Buffer[] = []

  archive.on('data', (chunk) => chunks.push(chunk))

  // Always use our generated package.json (overrides any in files)
  archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' })
  archive.append(readme, { name: 'README.md' })

  // Add all project files except package.json (we use our generated one)
  for (const [filename, content] of Object.entries(files)) {
    if (filename !== 'package.json') {
      archive.append(content, { name: filename })
    }
  }

  archive.append(
    JSON.stringify(
      {
        compilerOptions: {
          target: 'esnext',
          module: 'commonjs',
          lib: ['esnext'],
          jsx: 'react-native',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
        },
        exclude: ['node_modules', 'babel.config.js', 'metro.config.js'],
      },
      null,
      2
    ),
    { name: 'tsconfig.json' }
  )

  archive.append(
    `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};`,
    { name: 'babel.config.js' }
  )

  await archive.finalize()

  const buffer = Buffer.concat(chunks)

  setResponseHeaders(event, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${data.name || 'project'}.zip"`,
    'Content-Length': buffer.length.toString(),
  })

  return buffer
})
