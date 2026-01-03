import { useState, useCallback } from 'react';
import { Message, MessageRole, StreamItem, PlanTask, PlanTaskStatus } from '../models';
import { useStreamingItems } from './useStreamingItems';
import { usePlanTasks } from './usePlanTasks';

interface UseMessageStreamResult {
  isGenerating: boolean;
  streamingMessage: Message | null;
  streamingItems: StreamItem[];
  planTasks: PlanTask[];
  streamingItemsRef: React.MutableRefObject<StreamItem[]>;
  startStreaming: () => string;
  stopStreaming: () => void;
  addTextDelta: (text: string) => void;
  addToolStart: (toolName: string, args?: Record<string, any>) => void;
  completeToolCall: (toolName: string, result?: any) => void;
  setPlanTasks: React.Dispatch<React.SetStateAction<PlanTask[]>>;
  updateTaskStatus: (taskId: string, status: PlanTaskStatus) => void;
  updateStreamingContent: (content: string) => void;
  clearStreaming: () => void;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useMessageStream(): UseMessageStreamResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);

  const {
    streamingItems,
    streamingItemsRef,
    addTextDelta: addTextDeltaToItems,
    addToolStart,
    completeToolCall,
    clearStreamingItems,
  } = useStreamingItems();

  const {
    planTasks,
    setPlanTasks,
    updateTaskStatus,
    clearPlanTasks,
  } = usePlanTasks();

  const startStreaming = useCallback(() => {
    const streamingMessageId = `streaming_${Date.now()}`;
    setStreamingMessage({
      id: streamingMessageId,
      role: MessageRole.Assistant,
      content: '',
      timestamp: new Date(),
      metadata: { isStreaming: true },
    });
    clearStreamingItems();
    clearPlanTasks();
    setIsGenerating(true);
    return streamingMessageId;
  }, [clearStreamingItems, clearPlanTasks]);

  const stopStreaming = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const addTextDelta = useCallback((text: string) => {
    setStreamingMessage((prev) =>
      prev ? { ...prev, content: prev.content + text } : prev
    );
    addTextDeltaToItems(text);
  }, [addTextDeltaToItems]);

  const updateStreamingContent = useCallback((content: string) => {
    setStreamingMessage((prev) =>
      prev ? { ...prev, content } : prev
    );
  }, []);

  const clearStreaming = useCallback(() => {
    setStreamingMessage(null);
    clearStreamingItems();
    clearPlanTasks();
  }, [clearStreamingItems, clearPlanTasks]);

  return {
    isGenerating,
    streamingMessage,
    streamingItems,
    planTasks,
    streamingItemsRef,
    startStreaming,
    stopStreaming,
    addTextDelta,
    addToolStart,
    completeToolCall,
    setPlanTasks,
    updateTaskStatus,
    updateStreamingContent,
    clearStreaming,
    setIsGenerating,
  };
}
