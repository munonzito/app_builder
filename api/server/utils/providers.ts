/**
 * AI Model Providers
 * 
 * Multi-provider support for AI model configuration.
 * Priority: OpenRouter > Anthropic > OpenAI > Mock
 */

/**
 * AI Model Providers
 * 
 * Multi-provider support for AI model configuration.
 * Priority: OpenRouter > Anthropic > OpenAI > Mock
 * Compatible with AI SDK v6.x
 */

import { createAnthropic } from '@ai-sdk/anthropic'
import { createAzure } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export type ProviderType = 'openrouter' | 'anthropic' | 'openai' | 'azure' | 'mock'

export interface ProviderConfig {
  provider: ProviderType
  model: string
  apiKey?: string
}

export function getProviderConfig(): ProviderConfig {
  const config = useRuntimeConfig()

  // Priority: OpenRouter > Anthropic > Azure > OpenAI
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      model: config.defaultAiModel || 'anthropic/claude-sonnet-4',
      apiKey: process.env.OPENROUTER_API_KEY,
    }
  }

  if (config.anthropicApiKey) {
    return {
      provider: 'anthropic',
      model: config.defaultAiModel || 'claude-sonnet-4-20250514',
      apiKey: config.anthropicApiKey,
    }
  }

  if (process.env.AZURE_API_KEY) {
    return {
      provider: 'azure',
      model: config.defaultAiModel || 'o3-mini',
      apiKey: process.env.AZURE_API_KEY,
    }
  }

  if (config.openaiApiKey) {
    return {
      provider: 'openai',
      model: config.defaultAiModel || 'gpt-4o',
      apiKey: config.openaiApiKey,
    }
  }

  return {
    provider: 'mock',
    model: 'mock',
  }
}

export function createModel() {
  const config = getProviderConfig()

  switch (config.provider) {
    case 'openrouter': {
      console.log('[AI] Using OpenRouter provider with model:', config.model)
      const openrouter = createOpenRouter({
        apiKey: config.apiKey,
      })
      return openrouter(config.model)
    }

    case 'anthropic': {
      console.log('[AI] Using Anthropic provider with model:', config.model)
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
      })
      return anthropic(config.model)
    }

    case 'openai': {
      console.log('[AI] Using OpenAI provider with model:', config.model)
      const openai = createOpenAI({
        apiKey: config.apiKey,
      })
      return openai(config.model)
    }

    case 'azure': {
      console.log('[AI] Using Azure provider with model:', config.model)
      // baseURL format: https://{resource}.cognitiveservices.azure.com/openai/
      // Remove trailing slash since AI SDK appends /v1{path}
      const baseURL = process.env.AZURE_BASE_URL?.replace(/\/$/, '')
      const azure = createAzure({
        baseURL,
        apiKey: config.apiKey,
      })
      const reasoningEffort = process.env.AZURE_REASONING_EFFORT || 'low'
      return azure(config.model, {
        reasoningEffort
      })
    }

    case 'mock':
    default: {
      console.log('[AI] No API key configured - agent requires a valid provider')
      throw new Error('No AI provider configured. Set OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.')
    }
  }
}

export function getProviderName(): string {
  const config = getProviderConfig()
  return `${config.provider}/${config.model}`
}
