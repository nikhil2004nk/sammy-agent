import { Conversation, Message, Run } from '../conversation.types';
import { ExecutionContext } from '../../../common/execution-context';
import { RunStatus } from '@prisma/client';

export interface IConversationRepository {
  /**
   * Starts a new conversation.
   */
  startConversation(workspaceId: string, metadata?: Record<string, any>): Promise<Conversation>;

  /**
   * Retrieves a conversation by its ID.
   */
  getConversation(id: string): Promise<Conversation | null>;

  /**
   * Appends a message to the conversation.
   */
  appendMessage(conversationId: string, runId: string | undefined, message: Message): Promise<Message>;

  /**
   * Gets all messages for a conversation.
   */
  getMessages(conversationId: string): Promise<Message[]>;
}

export interface IRunRepository {
  /**
   * Starts a new run for a conversation.
   */
  startRun(conversationId: string, metadata?: Record<string, any>): Promise<Run>;

  /**
   * Retrieves a run by its ID.
   */
  getRun(id: string): Promise<Run | null>;

  /**
   * Finishes a run, atomically updating its status, termination reason, and token usage.
   * Leverages optimistic locking (versioning) to prevent race conditions.
   */
  finishRun(id: string, status: RunStatus, terminationReason?: string, tokenUsage?: number, expectedVersion?: number): Promise<Run>;

}
