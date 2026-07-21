import { Controller, Get, Post, Patch, Param, Body, Delete } from '@nestjs/common';
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
  async getAllConversations() {
    const convs = await this.conversationService.getAllConversations();
    return convs.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }));
  }

  @Post()
  async createConversation(@Body() body: any) {
    const conv = await this.conversationService.createConversation(body);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Get(':id')
  async getConversation(@Param('id') id: string) {
    const conv = await this.conversationService.getConversation(id);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Patch(':id')
  async updateConversation(@Param('id') id: string, @Body() body: { title?: string }) {
    const conv = await this.conversationService.updateConversation(id, body);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Delete(':id')
  async deleteConversation(@Param('id') id: string) {
    await this.conversationService.deleteConversation(id);
    return { success: true };
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return await this.conversationService.getMessages(id);
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Body() body: { content: string }) {
    // 1. Create Context
    const context: ExecutionContext = {
      traceId: crypto.randomUUID(),
      conversationId: id,
      runId: crypto.randomUUID(),
      workspaceId: 'test-workspace-id',
      agentId: crypto.randomUUID(),
      modelConfig: {
        provider: 'openai',
        model: 'openai/gpt-4o', // OpenRouter compatible model string
        temperature: 0.7,
        maxTokens: 2000
      },
    };

    // 2. Execute (AgentLoopService will save both the user message and assistant message)
    const response = await this.executionService.executeTurn(context, body.content);

    // 3. Construct and return new assistant message for the UI
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      status: 'completed',
      createdAt: Date.now(), 
      parts: [{ type: 'text', content: response }]
    };

    // 5. Return new assistant message (ensure ISO string for frontend format)
    return {
      ...assistantMsg,
      createdAt: new Date(assistantMsg.createdAt).toISOString()
    };
  }
}
