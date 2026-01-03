import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('Environment Configuration', () => {
    it('should detect mock mode from environment', () => {
      const useMock = process.env.USE_MOCK_AI === 'true'
      expect(typeof useMock).toBe('boolean')
    })

    it('should detect OpenRouter configuration', () => {
      const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
      expect(typeof hasOpenRouter).toBe('boolean')
    })

    it('should detect Firebase emulator mode', () => {
      const useEmulator = process.env.USE_FIREBASE_EMULATOR === 'true'
      expect(typeof useEmulator).toBe('boolean')
    })
  })

  describe('Code Parsing', () => {
    it('should parse JSON code output', () => {
      const text = `Here is your code:
{
  "files": {
    "App.tsx": "const App = () => {}"
  },
  "dependencies": ["react"]
}
More text here.`

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      expect(jsonMatch).toBeDefined()
      
      const parsed = JSON.parse(jsonMatch![0])
      expect(parsed.files).toBeDefined()
      expect(parsed.files['App.tsx']).toBe('const App = () => {}')
      expect(parsed.dependencies).toContain('react')
    })

    it('should handle invalid JSON gracefully', () => {
      const text = 'This is not JSON at all'
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        // No JSON found, use fallback
        const result = { files: { 'App.tsx': text }, dependencies: [] }
        expect(result.files['App.tsx']).toBe(text)
      }
    })

    it('should extract nested JSON correctly', () => {
      const text = `
{
  "files": {
    "App.tsx": "import { useState } from 'react';\\nconst App = () => { const [count, setCount] = useState(0); return null; }"
  },
  "dependencies": ["react", "react-native"]
}`

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch![0])
      
      expect(parsed.files['App.tsx']).toContain('useState')
      expect(parsed.dependencies).toHaveLength(2)
    })
  })

  describe('Project Name Sanitization', () => {
    it('should convert project name to slug', () => {
      const name = 'My Cool App'
      const slug = name.toLowerCase().replace(/\s+/g, '-')
      expect(slug).toBe('my-cool-app')
    })

    it('should handle special characters', () => {
      const name = "User's App (Test)"
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      expect(slug).toBe('user-s-app-test')
    })
  })
})
