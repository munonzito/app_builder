import { describe, it, expect, beforeAll } from 'vitest'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'

describe('AI Integration with OpenRouter', () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  beforeAll(() => {
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set, skipping AI tests')
    }
  })

  it('should have OpenRouter API key configured', () => {
    // Skip this test if API key is not set
    if (!apiKey) {
      console.log('Skipping: OPENROUTER_API_KEY not set')
      return
    }
    expect(apiKey).toBeDefined()
    expect(apiKey?.startsWith('sk-or-')).toBe(true)
  })

  it('should create OpenRouter provider', () => {
    if (!apiKey) return
    
    const openrouter = createOpenRouter({
      apiKey: apiKey,
    })
    
    expect(openrouter).toBeDefined()
    expect(typeof openrouter).toBe('function')
  })

  it('should generate text with free model', async () => {
    if (!apiKey) return
    
    const openrouter = createOpenRouter({
      apiKey: apiKey,
    })
    
    const model = openrouter('xiaomi/mimo-v2-flash:free')
    
    const { text } = await generateText({
      model,
      prompt: 'Say "Hello, test!" and nothing else.',
    })
    
    expect(text).toBeDefined()
    expect(text.length).toBeGreaterThan(0)
    console.log('AI Response:', text)
  }, 30000)

  it('should generate code-like response', async () => {
    if (!apiKey) return
    
    const openrouter = createOpenRouter({
      apiKey: apiKey,
    })
    
    const model = openrouter('xiaomi/mimo-v2-flash:free')
    
    const { text } = await generateText({
      model,
      prompt: 'Write a simple JavaScript function that adds two numbers. Only output the code, no explanation.',
    })
    
    expect(text).toBeDefined()
    expect(text.toLowerCase()).toMatch(/function|const|let|=>/i)
    console.log('Generated code:', text)
  }, 30000)
})
