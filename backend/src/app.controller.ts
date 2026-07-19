import { Controller, Post, Body, Req } from '@nestjs/common';
import { ExecutionService } from './modules/runtime/execution/execution.service';
import { ExecutionContext } from './common/execution-context';
import { v4 as uuidv4 } from 'uuid';

export class ChatDto {
  agentId: string;
  conversationId: string;
  message: string;
}

@Controller()
export class AppController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    // 1. In a real system, we'd fetch the Agent & Conversation from the DB here.
    // For Phase 1, we stub the ExecutionContext.
    
    const context: ExecutionContext = {
      traceId: uuidv4(),
      conversationId: body.conversationId || uuidv4(),
      userId: 'test-user-id', // Would come from Auth JWT
      agentId: body.agentId || uuidv4(),
      toolCalls: [],
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
