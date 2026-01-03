/**
 * Build script for E2B Droid Template
 * 
 * Run this to build and deploy the template to E2B:
 *   cd e2b-template && npm install && npm run build
 * 
 * Prerequisites:
 *   - E2B_API_KEY environment variable set
 *   - E2B account with API access
 */

import 'dotenv/config'
import { Template } from 'e2b'
import { template, templateConfig } from './template.js'

async function main() {
  console.log('🚀 Building E2B template: droid-app-builder')
  console.log('   CPU:', templateConfig.cpuCount, 'cores')
  console.log('   RAM:', templateConfig.memoryMB, 'MB')
  console.log('')

  if (!process.env.E2B_API_KEY) {
    console.error('❌ E2B_API_KEY environment variable is required')
    console.error('   Get your API key from: https://e2b.dev/dashboard?tab=keys')
    process.exit(1)
  }

  try {
    console.log('📦 Building template (this may take a few minutes)...')
    
    const result = await Template.build(template, {
      alias: templateConfig.alias,
      cpuCount: templateConfig.cpuCount,
      memoryMB: templateConfig.memoryMB,
      onBuildLogs: (log: { message?: string; level?: string }) => {
        // Print build logs in real-time
        if (log.message) {
          const prefix = log.level === 'error' ? '❌' : '  '
          console.log(`${prefix} ${log.message}`)
        }
      },
    })

    console.log('')
    console.log('✅ Template built successfully!')
    console.log('   Template ID:', result.templateId)
    console.log('   Alias:', templateConfig.alias)
    console.log('')
    console.log('📝 Add this to your .env:')
    console.log(`   E2B_TEMPLATE_ID=${result.templateId}`)
    console.log('')
    console.log('   Or use the alias: E2B_TEMPLATE_ID=droid-app-builder')
    
  } catch (error) {
    console.error('')
    console.error('❌ Failed to build template:', error)
    process.exit(1)
  }
}

main()
