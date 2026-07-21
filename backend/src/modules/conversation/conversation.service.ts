import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, Message, Run, RunStatus } from './conversation.types';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(workspaceId: string, body?: { title?: string; metadata?: Record<string, any> }): Promise<Conversation> {
    const id = crypto.randomUUID();
    const conv = await this.prisma.conversation.create({
      data: {
        id,
        title: body?.title || 'New Conversation',
        workspaceId,
        metadata: body?.metadata || {},
      }
    });
    return this.mapConversation(conv);
  }

  async getAllConversations(workspaceId: string): Promise<Conversation[]> {
    const convs = await this.prisma.conversation.findMany({ 
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' } 
    });
    return convs.map(this.mapConversation);
  }

  async getConversation(workspaceId: string, id: string): Promise<Conversation> {
    let conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (conv && conv.workspaceId !== workspaceId) {
      throw new NotFoundException('Conversation not found in your workspace');
    }
    if (!conv) {
      conv = await this.prisma.conversation.create({
        data: { id, title: 'Recovered Conversation', workspaceId }
      });
    }
    return this.mapConversation(conv);
  }

  async updateConversation(workspaceId: string, id: string, updates: { title?: string }): Promise<Conversation> {
    // ensure it belongs to workspace
    await this.getConversation(workspaceId, id);
    const conv = await this.prisma.conversation.update({
      where: { id },
      data: { title: updates.title, version: { increment: 1 } },
    });
    return this.mapConversation(conv);
  }

  async getMessages(workspaceId: string, conversationId: string): Promise<Message[]> {
    await this.getConversation(workspaceId, conversationId); // ensures workspace isolation
    const msgs = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return msgs.map(this.mapMessage);
  }

  async appendMessage(workspaceId: string, conversationId: string, message: Message): Promise<Message> {
    await this.getConversation(workspaceId, conversationId); // ensures workspace isolation
    
    const msgId = message.id || crypto.randomUUID();
    const msg = await this.prisma.message.create({
      data: {
        id: msgId,
        conversationId,
        role: message.role,
        content: (message as any).content || '',
        structuredContent: (message as any).parts || (message as any).structuredContent || undefined,
        toolCalls: (message as any).toolCalls || undefined,
        toolCallId: (message as any).toolCallId || undefined,
        toolName: (message as any).toolName || undefined,
        createdAt: new Date(message.createdAt || Date.now()),
      }
    });
    
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { version: { increment: 1 } },
    });
    
    return this.mapMessage(msg);
  }

  async clearMessages(workspaceId: string, conversationId: string): Promise<void> {
    await this.getConversation(workspaceId, conversationId);
    await this.prisma.message.deleteMany({ where: { conversationId } });
  }

  async deleteConversation(workspaceId: string, id: string): Promise<void> {
    await this.getConversation(workspaceId, id); // ensure ownership
    await this.prisma.conversation.delete({ where: { id } }).catch(() => {});
  }

  private mapConversation = (conv: any): Conversation => ({
    id: conv.id,
    title: conv.title || 'Untitled',
    createdAt: conv.createdAt.getTime(),
    updatedAt: conv.updatedAt.getTime(),
    metadata: conv.metadata,
    version: conv.version,
  });

  private mapMessage = (msg: any): Message => {
    const message: any = {
      id: msg.id,
      role: msg.role as any,
      createdAt: msg.createdAt.getTime(),
    };
    if (msg.content) message.content = msg.content;
    if (msg.structuredContent) message.parts = msg.structuredContent; // map back to parts
    if (msg.toolCalls) message.toolCalls = msg.toolCalls;
    if (msg.toolCallId) message.toolCallId = msg.toolCallId;
    if (msg.toolName) message.toolName = msg.toolName;
    return message as Message;
  };

  createRun(conversationId: string, metadata?: Record<string, any>): Run {
    throw new Error('Use ExecutionTrackerService for Runs');
  }

  getRun(runId: string): Run {
    throw new Error('Use ExecutionTrackerService for Runs');
  }

  updateRunStatus(runId: string, status: RunStatus, terminationReason?: string): Run {
    throw new Error('Use ExecutionTrackerService for Runs');
  }
}
