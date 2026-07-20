import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ExecutionService } from '../runtime/execution/execution.service';
import { ExecutionContext } from '../../common/execution-context';
import * as crypto from 'crypto';

@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly executionService: ExecutionService,
  ) {}

  @Get()
  getAllConversations() {
    // Basic array return for now (in memory map hack)
    // @ts-ignore
    return Array.from(this.conversationService.conversations.values());
  }

  @Post()
  createConversation(@Body() body: any) {
    return this.conversationService.createConversation(body);
  }

  @Get(':id')
  getConversation(@Param('id') id: string) {
    return this.conversationService.getConversation(id);
  }

  @Delete(':id')
  deleteConversation(@Param('id') id: string) {
    // Hacky delete for in-memory
    // @ts-ignore
    this.conversationService.conversations.delete(id);
    return { success: true };
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    try {
      return this.conversationService.getMessages(id);
    } catch {
      return [];
    }
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Body() body: { content: string }) {
    // 1. Save user message
    this.conversationService.appendMessage(id, {
      id: crypto.randomUUID(),
      role: 'user',
      content: body.content,
      createdAt: Date.now(),
    } as any);

    // 2. Create Context
    const context: ExecutionContext = {
      traceId: crypto.randomUUID(),
      conversationId: id,
      runId: crypto.randomUUID(),
      userId: 'test-user-id',
      agentId: crypto.randomUUID(),
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000
      },
    };

    // 3. Execute
    const response = await this.executionService.executeTurn(context, body.content);

    // 4. Return new assistant message
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      status: 'completed',
      createdAt: new Date().toISOString(),
      parts: [{ type: 'text', content: response }]
    };
  }
}
