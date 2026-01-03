import { ref, readonly, computed } from 'vue'
import { useApi } from './useApi'
import { useProjects, type Project } from './useProjects'

export type AgentMode = 'default' | 'mini'

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
  Tool = 'tool',
}

/** AI SDK format message for conversation history preservation */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'tool'
  content: unknown // Can be string or array with tool calls/results
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  /** AI SDK format messages from this turn (for multi-turn context) */
  conversationMessages?: ConversationMessage[]
  metadata?: {
    previewUrl?: string
    streamItems?: StreamItem[]
  }
}

export interface StreamItem {
  type: 'text' | 'tool_start' | 'tool_end' | 'file_changed' | 'status'
  content?: string
  tool?: string
  args?: any
  result?: any
  path?: string
  action?: string
  message?: string
}

export interface PlanTask {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export function useBuilder(projectId: string) {
  const { getProject } = useProjects()
  const { getHeaders } = useApi()

  const currentProject = ref<Project | null>(null)
  const messages = ref<Message[]>([])
  const isLoading = ref(true)
  const isGenerating = ref(false)
  const streamingMessage = ref<Message | null>(null)
  const streamingItems = ref<StreamItem[]>([])
  const planTasks = ref<PlanTask[]>([])
  const error = ref<string | null>(null)
  // Stores conversation messages from the complete event for multi-turn context
  const pendingConversationMessages = ref<ConversationMessage[]>([])
  // Incremented when generation completes with file changes - used to trigger preview refresh
  const previewVersion = ref(0)
  // Agent mode: 'default' uses multi-tool agent, 'mini' uses mini-swe-agent style bash-only agent
  const agentMode = ref<AgentMode>('default')

  let abortController: AbortController | null = null

  const loadProject = async (): Promise<void> => {
    isLoading.value = true
    try {
      const project = await getProject(projectId)
      currentProject.value = project
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || isGenerating.value) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: MessageRole.User,
      content: content.trim(),
      timestamp: new Date(),
    }

    messages.value = [...messages.value, userMessage]

    streamingMessage.value = {
      id: `assistant-${Date.now()}`,
      role: MessageRole.Assistant,
      content: '',
      timestamp: new Date(),
    }
    streamingItems.value = []
    planTasks.value = []
    pendingConversationMessages.value = []
    isGenerating.value = true

    abortController = new AbortController()

    try {
      const headers = await getHeaders()
      headers['Accept'] = 'text/event-stream'

      // Build full conversation history with tool calls/results for multi-turn context
      const conversationHistory: ConversationMessage[] = []
      for (const m of messages.value.slice(0, -1)) {
        // Add the user message
        if (m.role === MessageRole.User) {
          conversationHistory.push({ role: 'user', content: m.content })
        }
        // For assistant messages, include the full AI SDK format messages if available
        else if (m.role === MessageRole.Assistant && m.conversationMessages?.length) {
          conversationHistory.push(...m.conversationMessages)
        }
        // Fallback to simple text content
        else if (m.role === MessageRole.Assistant) {
          conversationHistory.push({ role: 'assistant', content: m.content })
        }
      }

      // Select endpoint based on agent mode
      const endpoint = agentMode.value === 'mini' ? '/api/chat/generate-mini' : '/api/chat/generate'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          message: content.trim(),
          // Only send conversation history for default agent (mini-agent manages its own context)
          ...(agentMode.value === 'default' && { conversationHistory }),
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7)
            continue
          }

          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              handleSSEEvent(parsed)
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Finalize the streaming message
      if (streamingMessage.value) {
        const finalMessage: Message = {
          ...streamingMessage.value,
          // Include conversation messages for multi-turn context preservation
          conversationMessages: pendingConversationMessages.value.length > 0
            ? [...pendingConversationMessages.value]
            : undefined,
          metadata: {
            streamItems: [...streamingItems.value],
            previewUrl: currentProject.value?.previewUrl,
          },
        }
        messages.value = [...messages.value, finalMessage]
        streamingMessage.value = null
        pendingConversationMessages.value = []
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        error.value = e.message
        // Add error message
        if (streamingMessage.value) {
          streamingMessage.value.content = `Error: ${e.message}`
          messages.value = [...messages.value, streamingMessage.value]
          streamingMessage.value = null
        }
      }
    } finally {
      isGenerating.value = false
      abortController = null
    }
  }

  const handleSSEEvent = (data: any) => {
    if (data.text) {
      // text_delta event
      if (streamingMessage.value) {
        streamingMessage.value.content += data.text
      }
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'text', content: data.text },
      ]
    } else if (data.tool && !data.result) {
      // tool_start event
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'tool_start', tool: data.tool, args: data.args },
      ]
    } else if (data.tool && data.result !== undefined) {
      // tool_end event
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'tool_end', tool: data.tool, result: data.result },
      ]
    } else if (data.path) {
      // file_changed event
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'file_changed', path: data.path, action: data.action },
      ]
    } else if (data.tasks) {
      // plan_created event
      planTasks.value = data.tasks.map((t: any, i: number) => ({
        id: `task-${i}`,
        description: t,
        status: 'pending',
      }))
    } else if (data.taskId !== undefined && data.status) {
      // task_updated event
      const task = planTasks.value.find((t) => t.id === data.taskId || t.id === `task-${data.taskId}`)
      if (task) {
        task.status = data.status
      }
    } else if (data.step !== undefined && data.maxSteps !== undefined) {
      // step_start event (mini-agent)
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'status', message: `Step ${data.step}/${data.maxSteps}` },
      ]
    } else if (data.message) {
      // status event
      streamingItems.value = [
        ...streamingItems.value,
        { type: 'status', message: data.message },
      ]
    } else if (data.response && data.previewUrl) {
      // complete event
      if (currentProject.value) {
        currentProject.value.previewUrl = data.previewUrl
      }
      // Store conversation messages for multi-turn context preservation
      if (data.conversationMessages?.length) {
        pendingConversationMessages.value = data.conversationMessages
      }
      // Increment preview version to trigger refresh in PreviewPanel
      previewVersion.value++
    } else if (data.files && data.previewUrl) {
      // complete event from mini-agent (has files instead of conversationMessages)
      if (currentProject.value) {
        currentProject.value.previewUrl = data.previewUrl
      }
      // Increment preview version to trigger refresh in PreviewPanel
      previewVersion.value++
    }
  }

  const cancelGeneration = (): void => {
    if (abortController) {
      abortController.abort()
      isGenerating.value = false
      streamingMessage.value = null
    }
  }

  const clearMessages = (): void => {
    messages.value = []
    streamingItems.value = []
    planTasks.value = []
  }

  const setAgentMode = (mode: AgentMode): void => {
    agentMode.value = mode
  }

  const hasPreview = computed(() => !!currentProject.value?.previewUrl)
  const previewUrl = computed(() => currentProject.value?.previewUrl || null)

  return {
    currentProject: readonly(currentProject),
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    isGenerating: readonly(isGenerating),
    streamingMessage: readonly(streamingMessage),
    streamingItems: readonly(streamingItems),
    planTasks: readonly(planTasks),
    error: readonly(error),
    agentMode: readonly(agentMode),
    hasPreview,
    previewUrl,
    previewVersion: readonly(previewVersion),
    loadProject,
    sendMessage,
    cancelGeneration,
    clearMessages,
    setAgentMode,
  }
}
