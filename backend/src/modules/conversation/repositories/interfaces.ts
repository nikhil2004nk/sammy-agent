import { Conversation, Message, Run, RunStatus } from '../conversation.types';

export interface IConversationRepository {
  createConversation(tenantId: string | undefined, userId: string, metadata?: Record<string, any>): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | null>;
  updateConversationMetadata(id: string, metadata: Record<string, any>): Promise<Conversation>;
  
  appendMessage(conversationId: string, runId: string | undefined, message: Message): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
}

export interface IRunRepository {
  createRun(conversationId: string, metadata?: Record<string, any>): Promise<Run>;
  getRun(id: string): Promise<Run | null>;
  updateRunStatus(id: string, status: RunStatus, terminationReason?: string, tokenUsage?: number, reasoningSteps?: number): Promise<Run>;
  getRunsForConversation(conversationId: string): Promise<Run[]>;

  recordToolExecution(
    runId: string, 
    toolName: string, 
    argumentsJson: any, 
    resultJson: any, 
    success: boolean, 
    durationMs?: number,
    error?: string
  ): Promise<void>;

  recordEvent(runId: string, eventType: string, payload?: any): Promise<void>;
}
