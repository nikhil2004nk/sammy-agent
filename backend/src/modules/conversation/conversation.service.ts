import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, Message, Run, RunStatus } from './conversation.types';
import * as crypto from 'crypto';

@Injectable()
export class ConversationService {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private runs = new Map<string, Run>();

  createConversation(metadata?: Record<string, any>): Conversation {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };
    
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  getConversation(id: string): Conversation {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }
    return conversation;
  }

  getMessages(conversationId: string): Message[] {
    const msgs = this.messages.get(conversationId);
    if (!msgs) {
      throw new NotFoundException(`Messages for conversation ${conversationId} not found`);
    }
    // Return a shallow copy so callers don't mutate the array
    return [...msgs];
  }

  appendMessage(conversationId: string, message: Message): Message {
    const msgs = this.messages.get(conversationId);
    if (!msgs) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    const newMsg = { ...message, id: message.id || crypto.randomUUID(), createdAt: message.createdAt || Date.now() };
    msgs.push(newMsg as Message);
    
    const conv = this.conversations.get(conversationId)!;
    conv.updatedAt = Date.now();

    return newMsg as Message;
  }

  clearMessages(conversationId: string): void {
    if (!this.messages.has(conversationId)) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }
    this.messages.set(conversationId, []);
  }

  // --- Runs ---

  createRun(conversationId: string, metadata?: Record<string, any>): Run {
    const id = crypto.randomUUID();
    const run: Run = {
      id,
      conversationId,
      status: 'running',
      createdAt: Date.now(),
      metadata,
    };
    this.runs.set(id, run);
    return run;
  }

  getRun(runId: string): Run {
    const run = this.runs.get(runId);
    if (!run) {
      throw new NotFoundException(`Run ${runId} not found`);
    }
    return run;
  }

  updateRunStatus(runId: string, status: RunStatus, terminationReason?: string): Run {
    const run = this.getRun(runId);
    run.status = status;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      run.endedAt = Date.now();
    }
    if (terminationReason) {
      run.terminationReason = terminationReason;
    }
    return run;
  }
}
