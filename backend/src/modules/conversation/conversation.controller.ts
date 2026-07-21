import { Controller, Get, Post, Patch, Param, Body, Delete, UseGuards, Headers } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ExecutionService } from '../runtime/execution/execution.service';
import { ExecutionContext } from '../../common/execution-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import * as crypto from 'crypto';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('conversations')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly executionService: ExecutionService,
  ) {}

  @Get()
  async getAllConversations(@Headers('x-workspace-id') workspaceId: string) {
    const convs = await this.conversationService.getAllConversations(workspaceId);
    return convs.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }));
  }

  @Post()
  async createConversation(@Headers('x-workspace-id') workspaceId: string, @Body() body: any) {
    const conv = await this.conversationService.createConversation(workspaceId, body);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Get(':id')
  async getConversation(@Headers('x-workspace-id') workspaceId: string, @Param('id') id: string) {
    const conv = await this.conversationService.getConversation(workspaceId, id);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Patch(':id')
  async updateConversation(@Headers('x-workspace-id') workspaceId: string, @Param('id') id: string, @Body() body: { title?: string }) {
    const conv = await this.conversationService.updateConversation(workspaceId, id, body);
    return {
      ...conv,
      createdAt: new Date(conv.createdAt).toISOString(),
      updatedAt: new Date(conv.updatedAt).toISOString(),
    };
  }

  @Delete(':id')
  async deleteConversation(@Headers('x-workspace-id') workspaceId: string, @Param('id') id: string) {
    await this.conversationService.deleteConversation(workspaceId, id);
    return { success: true };
  }

  @Get(':id/messages')
  async getMessages(@Headers('x-workspace-id') workspaceId: string, @Param('id') id: string) {
    return await this.conversationService.getMessages(workspaceId, id);
  }

  @Post(':id/messages')
  async sendMessage(@Headers('x-workspace-id') workspaceId: string, @Param('id') id: string, @Body() body: { content: string }) {
    // 1. Create Context
    const context: ExecutionContext = {
      traceId: crypto.randomUUID(),
      conversationId: id,
      runId: crypto.randomUUID(),
      workspaceId,
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
