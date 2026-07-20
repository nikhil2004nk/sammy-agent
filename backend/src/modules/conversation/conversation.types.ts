export type Role = 'user' | 'assistant' | 'tool' | 'system';

export interface BaseMessage {
  id: string;
  role: Role;
  createdAt: number;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolMessage extends BaseMessage {
  role: 'tool';
  toolCallId: string; // The ID of the tool call this result belongs to
  toolName: string;
  result: any;
  success: boolean;
}

export interface SystemMessage extends BaseMessage {
  role: 'system';
  content: string;
}

export type Message = UserMessage | AssistantMessage | ToolMessage | SystemMessage;

export type RunStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'requires_action';

export interface Run {
  id: string;
  conversationId: string;
  status: RunStatus;
  createdAt: number;
  endedAt?: number;
  terminationReason?: string;
  metadata?: Record<string, any>;
  version: number;
}

export interface Conversation {
  id: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
  version: number;
}
