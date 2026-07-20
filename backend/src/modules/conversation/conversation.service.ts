import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, Message, Run, RunStatus } from './conversation.types';
import * as crypto from 'crypto';

@Injectable()
export class ConversationService {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private runs = new Map<string, Run>();

  createConversation(body?: { title?: string; metadata?: Record<string, any> }): Conversation {
    const id = crypto.randomUUID();
    const conversation: Conversation = {
      id,
      title: body?.title || 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: body?.metadata,
      version: 1,
    };
    
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getConversation(id: string): Conversation {
    // Auto-recover after server restart so deep links still work
    this.ensureConversationExists(id);
    return this.conversations.get(id)!;
  }

  updateConversation(id: string, updates: { title?: string }): Conversation {
    this.ensureConversationExists(id);
    const conv = this.conversations.get(id)!;
    if (updates.title !== undefined) conv.title = updates.title;
    conv.updatedAt = Date.now();
    conv.version += 1;
    return conv;
  }

  getMessages(conversationId: string): Message[] {
    // Auto-recover if the in-memory store was wiped (e.g. server restart)
    this.ensureConversationExists(conversationId);
    const msgs = this.messages.get(conversationId)!;
    // Return a shallow copy so callers don't mutate the array
    return [...msgs];
  }

  /**
   * Ensure a conversation slot exists. If the conversation was created before
   * a backend restart (in-memory wipe), recreate it transparently.
   */
  ensureConversationExists(id: string): void {
    if (!this.conversations.has(id)) {
      const conversation: Conversation = {
        id,
        title: 'Recovered Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      this.conversations.set(id, conversation);
      this.messages.set(id, []);
    }
  }

  appendMessage(conversationId: string, message: Message): Message {
    // Auto-recover if the in-memory store was wiped (e.g. server restart)
    this.ensureConversationExists(conversationId);
    const msgs = this.messages.get(conversationId)!;

    const newMsg = { ...message, id: message.id || crypto.randomUUID(), createdAt: message.createdAt || Date.now() };
    msgs.push(newMsg as Message);
    
    const conv = this.conversations.get(conversationId)!;
    conv.updatedAt = Date.now();
    conv.version += 1;

    return newMsg as Message;
  }

  clearMessages(conversationId: string): void {
    if (!this.messages.has(conversationId)) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }
    this.messages.set(conversationId, []);
  }

  deleteConversation(id: string): void {
    this.conversations.delete(id);
    this.messages.delete(id);
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
      version: 1,
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
