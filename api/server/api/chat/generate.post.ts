/**
 * Chat Generate API V2 - Unified Agent Architecture
 *
 * Uses the new unified agent system with configurable presets.
 * Supports SSE streaming for real-time progress updates.
 *
 * Preset options:
 * - default: Factory-style tools (Read, Create, Edit, LS, Grep)
 * - command: Bash-like executeCommand tool
 * - minimal: Only file tools
 * - full: All tools including validation
 */

import { getFirebaseFirestore } from '~/server/lib/firebase'
import { VirtualFS } from '../../utils/virtualFS'
import { runAgent, getPreset, type PresetName } from '../../agent'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  if (!body.projectId || !body.message) {
    throw createError({ statusCode: 400, message: 'projectId and message are required' })
  }

  const db = getFirebaseFirestore()
  const projectDoc = await db.collection('projects').doc(body.projectId).get()

  if (!projectDoc.exists) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const projectData = projectDoc.data()
  if (projectData?.userId !== user.uid) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  // Check if client wants SSE streaming
  const acceptHeader = getHeader(event, 'accept') || ''
  const wantsSSE = acceptHeader.includes('text/event-stream')

  // Load existing project files into VirtualFS
  let existingFiles: Record<string, string> = {}
  if (projectData?.code) {
    try {
      existingFiles = JSON.parse(projectData.code)
    } catch {
      existingFiles = { 'App.tsx': projectData.code }
    }
  }

  // Initialize VirtualFS with existing files (dependencies come from package.json)
  const fs = new VirtualFS(existingFiles)

  // Build conversation history (supports both simple and full AI SDK format with tool calls)
  const chatHistory = body.chatHistory || []
  const conversationHistory = body.conversationHistory || [] // Full AI SDK format messages

  // If conversationHistory is provided, use it (includes tool calls/results)
  // Otherwise fall back to simple chatHistory format
  const messages =
    conversationHistory.length > 0
      ? [...conversationHistory, { role: 'user' as const, content: body.message }]
      : [
          ...chatHistory.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: body.message },
        ]

  // Determine preset (default is 'default', supports legacy flags)
  let presetName: PresetName = 'default'
  if (body.preset) {
    presetName = body.preset as PresetName
  } else if (body.useAgentV2 === true || getQuery(event).v2 === 'true') {
    presetName = 'command'
  } else if (getQuery(event).minimal === 'true') {
    presetName = 'minimal'
  } else if (getQuery(event).full === 'true') {
    presetName = 'full'
  }

  // Create agent configuration
  const agentConfig = getPreset(
    presetName,
    {
      fs,
      projectName: projectData?.name || 'Untitled',
    },
    {
      maxSteps: body.maxSteps,
      enableLogging: body.enableLogging ?? true,
      enableRateLimiting: true,
    }
  )

  if (wantsSSE) {
    // SSE Streaming Response
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    const sendEvent = (eventType: string, data: unknown) => {
      const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
      if (!event.node.res.writableEnded) {
        event.node.res.write(message)
      }
    }

    try {
      let agentResponse = ''

      for await (const agentEvent of runAgent(messages, agentConfig)) {
        switch (agentEvent.type) {
          case 'status':
            sendEvent('status', { message: agentEvent.message })
            break

          case 'step_start':
            sendEvent('status', { message: `Step ${agentEvent.step}/${agentEvent.maxSteps}` })
            break

          case 'tool_start':
            sendEvent('tool_start', { tool: agentEvent.tool, args: agentEvent.args })
            break

          case 'tool_end':
            sendEvent('tool_end', { tool: agentEvent.tool, result: agentEvent.result })
            break

          case 'file_changed':
            sendEvent('file_changed', {
              path: agentEvent.path,
              action: agentEvent.action,
            })
            break

          case 'plan_created':
            sendEvent('plan_created', { tasks: agentEvent.tasks })
            break

          case 'task_updated':
            sendEvent('task_updated', {
              taskId: agentEvent.taskId,
              status: agentEvent.status,
            })
            break

          case 'text_delta':
            agentResponse += agentEvent.text
            sendEvent('text_delta', { text: agentEvent.text })
            break

          case 'error':
            sendEvent('error', { message: agentEvent.message })
            break

          case 'done':
            // Persist the final state to Firestore
            const finalState = fs.toJSON()
            const codeString = JSON.stringify(finalState.files, null, 2)
            const previewUrl = `/preview/${body.projectId}`

            await db.collection('projects').doc(body.projectId).update({
              code: codeString,
              previewUrl,
              snackId: null,
              snackHash: null,
              updatedAt: new Date(),
            })

            sendEvent('complete', {
              response: agentResponse || 'Done! Check the preview to see your app.',
              files: finalState.files,
              previewUrl,
              summary: agentEvent.summary,
              // Include conversation messages for multi-turn context (excluding initial user messages)
              conversationMessages:
                agentEvent.summary.conversationMessages?.slice(messages.length) || [],
            })
            break
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Agent] Error:', errorMessage)
      sendEvent('error', { message: errorMessage })
    } finally {
      event.node.res.end()
    }

    return
  }

  // Non-streaming response (fallback for clients that don't support SSE)
  try {
    let agentResponse = ''

    for await (const agentEvent of runAgent(messages, agentConfig)) {
      if (agentEvent.type === 'text_delta') {
        agentResponse += agentEvent.text
      }
    }

    // Persist the final state to Firestore
    const finalState = fs.toJSON()
    const codeString = JSON.stringify(finalState.files, null, 2)
    const previewUrl = `/preview/${body.projectId}`

    await db.collection('projects').doc(body.projectId).update({
      code: codeString,
      previewUrl,
      snackId: null,
      snackHash: null,
      updatedAt: new Date(),
    })

    return {
      response: agentResponse || 'Done! Check the preview to see your app.',
      code: codeString,
      previewUrl,
      files: finalState.files,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Agent] Error:', errorMessage)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate code: ' + errorMessage,
    })
  }
})
