export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function messageFromJson(json: Record<string, any>): Message {
  return {
    id: json.id,
    role: json.role as MessageRole,
    content: json.content,
    timestamp: new Date(json.timestamp),
    metadata: json.metadata,
  };
}

export function messageToJson(message: Message): Record<string, any> {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.toISOString(),
    metadata: message.metadata,
  };
}
