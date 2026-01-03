import { useState, useCallback, useRef } from 'react';
import { StreamItem, TextStreamItem, ToolCallStreamItem, ToolCall } from '../models';

interface UseStreamingItemsResult {
  streamingItems: StreamItem[];
  streamingItemsRef: React.MutableRefObject<StreamItem[]>;
  addTextDelta: (text: string) => void;
  addToolStart: (toolName: string, args?: Record<string, any>) => void;
  completeToolCall: (toolName: string, result?: any) => void;
  clearStreamingItems: () => void;
}

export function useStreamingItems(): UseStreamingItemsResult {
  const [streamingItems, setStreamingItems] = useState<StreamItem[]>([]);
  const streamingItemsRef = useRef<StreamItem[]>([]);

  const addTextDelta = useCallback((text: string) => {
    setStreamingItems((prev) => {
      let newItems: StreamItem[];
      if (prev.length > 0 && prev[prev.length - 1].type === 'text') {
        const lastItem = prev[prev.length - 1] as TextStreamItem;
        newItems = [
          ...prev.slice(0, -1),
          { ...lastItem, text: lastItem.text + text } as TextStreamItem,
        ];
      } else {
        newItems = [
          ...prev,
          { type: 'text', id: `text_${Date.now()}`, text, timestamp: new Date() } as TextStreamItem,
        ];
      }
      streamingItemsRef.current = newItems;
      return newItems;
    });
  }, []);

  const addToolStart = useCallback((toolName: string, args?: Record<string, any>) => {
    const toolCallId = `${toolName}_${Date.now()}`;
    const toolCall: ToolCall = {
      id: toolCallId,
      toolName,
      args,
      isComplete: false,
    };
    setStreamingItems((prev) => {
      const newItems = [
        ...prev,
        { type: 'toolCall', id: toolCallId, toolCall, timestamp: new Date() } as ToolCallStreamItem,
      ];
      streamingItemsRef.current = newItems;
      return newItems;
    });
  }, []);

  const completeToolCall = useCallback((toolName: string, result?: any) => {
    setStreamingItems((prev) => {
      const lastIndex = prev.findLastIndex(
        (item) =>
          item.type === 'toolCall' &&
          (item as ToolCallStreamItem).toolCall.toolName === toolName &&
          !(item as ToolCallStreamItem).toolCall.isComplete
      );
      if (lastIndex === -1) return prev;
      const item = prev[lastIndex] as ToolCallStreamItem;
      const newItems = [
        ...prev.slice(0, lastIndex),
        {
          ...item,
          toolCall: { ...item.toolCall, isComplete: true, result },
        } as ToolCallStreamItem,
        ...prev.slice(lastIndex + 1),
      ];
      streamingItemsRef.current = newItems;
      return newItems;
    });
  }, []);

  const clearStreamingItems = useCallback(() => {
    setStreamingItems([]);
    streamingItemsRef.current = [];
  }, []);

  return {
    streamingItems,
    streamingItemsRef,
    addTextDelta,
    addToolStart,
    completeToolCall,
    clearStreamingItems,
  };
}
