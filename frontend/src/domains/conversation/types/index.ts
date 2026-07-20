export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  summary?: string | null;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'failed';

export type MessagePartType = 'text' | 'code' | 'tool' | 'thinking' | 'image';

export interface MessagePart {
  type: MessagePartType;
  content: unknown;
}

export interface Message {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  status: MessageStatus;
  createdAt: string;
}

export interface CreateConversationDto {
  title?: string;
}

export interface SendMessageDto {
  content: string;
}
