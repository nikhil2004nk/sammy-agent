import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IConversationRepository } from '../interfaces';
import { Conversation, Message } from '../../conversation.types';

@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async startConversation(tenantId: string | undefined, userId: string, metadata?: Record<string, any>): Promise<Conversation> {
    const conv = await this.prisma.conversation.create({
      data: {
        tenantId,
        userId,
        metadata: metadata || {},
      },
    });

    return this.mapToDomain(conv);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
    });
    return conv ? this.mapToDomain(conv) : null;
  }

  async appendMessage(conversationId: string, runId: string | undefined, message: Message): Promise<Message> {
    // Atomic message append.
    const msg = await this.prisma.message.create({
      data: {
        id: message.id, // preserve domain ID if provided
        conversationId,
        runId,
        role: message.role,
        content: (message as any).content,
        structuredContent: (message as any).structuredContent,
        toolCalls: (message as any).toolCalls,
        toolCallId: (message as any).toolCallId,
        toolName: (message as any).toolName,
        metadata: { createdAt: message.createdAt }, // store explicit timestamps in metadata if needed
      },
    });

    // Optionally bump conversation version if we want optimistic locking to bubble up to the conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { version: { increment: 1 } },
    });

    return {
      id: msg.id,
      role: msg.role as any,
      content: msg.content || '',
      createdAt: msg.createdAt.getTime(),
      ...((msg.toolCalls) && { toolCalls: msg.toolCalls }),
      ...((msg.toolCallId) && { toolCallId: msg.toolCallId }),
      ...((msg.toolName) && { toolName: msg.toolName }),
      ...((msg.structuredContent) && { structuredContent: msg.structuredContent }),
    } as Message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const msgs = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return msgs.map((msg) => ({
      id: msg.id,
      role: msg.role as any,
      content: msg.content || '',
      createdAt: msg.createdAt.getTime(),
      ...((msg.toolCalls) && { toolCalls: msg.toolCalls }),
      ...((msg.toolCallId) && { toolCallId: msg.toolCallId }),
      ...((msg.toolName) && { toolName: msg.toolName }),
      ...((msg.structuredContent) && { structuredContent: msg.structuredContent }),
    })) as Message[];
  }

  private mapToDomain(prismaModel: any): Conversation {
    return {
      id: prismaModel.id,
      title: prismaModel.title ?? 'Untitled Conversation',
      createdAt: prismaModel.createdAt.getTime(),
      updatedAt: prismaModel.updatedAt.getTime(),
      metadata: prismaModel.metadata,
      version: prismaModel.version,
    };
  }
}
