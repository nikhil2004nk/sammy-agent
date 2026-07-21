import { Injectable, Logger } from '@nestjs/common';
import { AgentAction, ToolCallAction } from './agent.types';
import { ExecutionContext } from '../../../common/execution-context';
import { ToolExecutorService } from '../../tools/tool-executor.service';
import { Message } from '../../conversation/conversation.types';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import * as crypto from 'crypto';
import { MessageRole, MessagePartType, MessagePartStatus, ExecutionNodeType, ExecutionNodeStatus } from '@prisma/client';

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(
    private readonly toolExecutor: ToolExecutorService,
    private readonly executionTracker: ExecutionTrackerService,
  ) {}

  /**
   * Executes a given AgentAction.
   * If it's a tool_call, it invokes the ToolExecutorService.
   * Returns a Message[] to be appended to the conversation, if applicable.
   */
  async executeAction(context: ExecutionContext, action: AgentAction): Promise<Message[]> {
    if (action.type === 'tool_call') {
      return this.executeToolCalls(context, action as ToolCallAction);
    }
    
    // Future actions (human_approval, spawn_agent, workflow) will be handled here
    this.logger.debug(`Action ${action.type} does not require execution by ActionExecutorService`);
    return [];
  }

  private async executeToolCalls(context: ExecutionContext, action: ToolCallAction): Promise<Message[]> {
    const results: Message[] = [];

    // Execute tools sequentially for now (could be parallelized)
    for (const toolCall of action.toolCalls) {
      this.logger.log(`
[Tool Execution: ${toolCall.name}]
Permission     Granted (Auto)
Status         Executing...
Args           ${JSON.stringify(toolCall.arguments).substring(0, 100)}
      `);
      const startTime = Date.now();
      
      const node = await this.executionTracker.createNode(
        context.runId, 
        ExecutionNodeType.TOOL, 
        `Use Tool: ${toolCall.name}`, 
        toolCall.arguments,
        undefined,
        context.agentId
      );

      const toolResult = await this.toolExecutor.executeTool(context, toolCall.name, toolCall.arguments);
      
      const contentText = toolResult.success && toolResult.data ? toolResult.data.map((d: any) => d.text).join('\n') : (toolResult.error || 'Unknown error');
      
      const duration = Date.now() - startTime;
      this.logger.log(`
[Tool Result: ${toolCall.name}]
Status         ${toolResult.success ? 'Success' : 'Failed'}
Duration       ${duration} ms
Result         ${contentText.replace(/\n/g, ' ').substring(0, 150)}...
      `);

      const message: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.TOOL,
        createdAt: Date.now(),
        parts: [{
          id: crypto.randomUUID(),
          type: MessagePartType.TOOL_RESULT,
          status: toolResult.success ? MessagePartStatus.COMPLETE : MessagePartStatus.FAILED,
          order: 0,
          content: { result: contentText },
          toolCallId: toolCall.id,
          createdAt: Date.now()
        }]
      };

      await this.executionTracker.updateNodeStatus(
        node.id, 
        toolResult.success ? ExecutionNodeStatus.COMPLETED : ExecutionNodeStatus.FAILED, 
        contentText
      );

      results.push(message);
    }

    return results;
  }
}
