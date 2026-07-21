export interface ConversationDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: Array<{
    type: string;
    content: string;
  }>;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}
