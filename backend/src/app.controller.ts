import { Controller, Post, Body } from '@nestjs/common';
import { ExecutionService } from './modules/runtime/execution/execution.service';
import { ExecutionContext } from './common/execution-context';
import * as crypto from 'crypto';

export class ChatDto {
  agentId: string;
  conversationId?: string;
  message: string;
}

@Controller('chat')
export class AppController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  async chat(@Body() body: ChatDto) {
    // 1. In a real system, we'd fetch the Agent & Conversation from the DB here.
    // For Phase 1, we stub the ExecutionContext.
    
    const context: ExecutionContext = {
      traceId: crypto.randomUUID(),
      conversationId: body.conversationId || crypto.randomUUID(),
      workspaceId: 'test-workspace-id', // Would come from Auth JWT
      agentId: body.agentId || crypto.randomUUID(),
      runId: crypto.randomUUID(),
      modelConfig: {
        provider: 'openai', // Extracted from Agent DB config
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000
      },
      metadata: {}
    };

    // 2. Invoke the Runtime Engine
    const response = await this.executionService.executeTurn(context, body.message);

    return {
      traceId: context.traceId,
      conversationId: context.conversationId,
      response: response
    };
  }
}
