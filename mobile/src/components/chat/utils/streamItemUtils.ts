import { StreamItem, TextStreamItem, ToolCallStreamItem } from '../../../models';

interface StoredTextItem {
  type: 'text';
  text: string;
}

interface StoredToolCallItem {
  type: 'toolCall';
  toolName: string;
  args?: Record<string, any>;
  isComplete?: boolean;
  result?: any;
}

type StoredItem = StoredTextItem | StoredToolCallItem;

export function parseStoredStreamItems(itemsData: StoredItem[] | undefined): StreamItem[] {
  if (!itemsData) return [];

  return itemsData
    .map((item, index) => {
      if (item.type === 'text') {
        return {
          type: 'text',
          id: `stored_text_${index}`,
          text: item.text || '',
          timestamp: new Date(),
        } as TextStreamItem;
      } else if (item.type === 'toolCall') {
        return {
          type: 'toolCall',
          id: `stored_tool_${index}`,
          toolCall: {
            id: `${item.toolName}_stored_${index}`,
            toolName: item.toolName || '',
            args: item.args,
            isComplete: true,
          },
          timestamp: new Date(),
        } as ToolCallStreamItem;
      }
      return null;
    })
    .filter(Boolean) as StreamItem[];
}
