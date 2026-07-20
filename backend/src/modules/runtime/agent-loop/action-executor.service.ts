import { Injectable, Logger } from '@nestjs/common';
import { AgentAction, ToolCallAction } from './agent.types';
import { ExecutionContext } from '../../../common/execution-context';
import { ToolExecutorService } from '../../tools/tool-executor.service';
import { ToolMessage } from '../../conversation/conversation.types';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import * as crypto from 'crypto';

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
   * Returns a ToolMessage to be appended to the conversation, if applicable.
   */
  async executeAction(context: ExecutionContext, action: AgentAction): Promise<ToolMessage[]> {
    if (action.type === 'tool_call') {
      return this.executeToolCalls(context, action as ToolCallAction);
    }
    
    // Future actions (human_approval, spawn_agent, workflow) will be handled here
    this.logger.debug(`Action ${action.type} does not require execution by ActionExecutorService`);
    return [];
  }

  private async executeToolCalls(context: ExecutionContext, action: ToolCallAction): Promise<ToolMessage[]> {
    const results: ToolMessage[] = [];

    // Execute tools sequentially for now (could be parallelized)
    for (const toolCall of action.toolCalls) {
      this.logger.debug(`Executing tool call: ${toolCall.name}`);
      
      const node = await this.executionTracker.createNode(
        context.runId, 
        'tool', 
        `Use Tool: ${toolCall.name}`, 
        toolCall.arguments,
        undefined,
        context.agentId
      );

      const toolResult = await this.toolExecutor.executeTool(context, toolCall.name, toolCall.arguments);
      
      const message: ToolMessage = {
        id: crypto.randomUUID(),
        role: 'tool',
        createdAt: Date.now(),
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        result: toolResult.success && toolResult.data ? toolResult.data.map((d: any) => d.text).join('\n') : (toolResult.error || 'Unknown error'),
        success: toolResult.success,
      };

      await this.executionTracker.updateNodeStatus(
        node.id, 
        toolResult.success ? 'completed' : 'failed', 
        message.result
      );

      results.push(message);
    }

    return results;
  }
}
