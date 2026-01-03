/**
 * E2B Template Definition for Droid App Builder
 * 
 * This template creates a sandbox environment with:
 * - Ubuntu 22.04 base
 * - Node.js 20.x
 * - Factory AI Droid CLI
 * - Git for version control operations
 * 
 * The template is built using E2B's programmatic SDK.
 */

import { Template } from 'e2b'

export const template = Template()
  // Start with Ubuntu 22.04 base image
  .fromUbuntuImage('22.04')
  
  // Switch to root for installation
  .setUser('root')
  
  // Install system dependencies
  .aptInstall([
    'curl',
    'git',
    'wget',
    'unzip',
    'ca-certificates',
    'gnupg',
  ])
  
  // Install Node.js 20.x via NodeSource
  .runCmd('mkdir -p /etc/apt/keyrings')
  .runCmd('curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg')
  .runCmd('echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list')
  .runCmd('apt-get update && apt-get install -y nodejs')
  
  // Verify Node.js installation
  .runCmd('node --version && npm --version')
  
  // Install Factory AI Droid CLI
  .runCmd('curl -fsSL https://app.factory.ai/cli | sh')
  
  // Create workspace directory
  .makeDir('/workspace')
  
  // Create .factory directory for settings
  .makeDir('/root/.factory')
  
  // Set environment variables
  .setEnvs({
    PATH: '/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    HOME: '/root',
  })
  
  // Set working directory
  .setWorkdir('/workspace')

// Template configuration for building
export const templateConfig = {
  alias: 'droid-app-builder',
  cpuCount: 2,
  memoryMB: 4096, // 4GB RAM for comfortable droid operation
}
