import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { ConversationService } from '../../conversation/conversation.service';
import { AgentStepService } from './agent-step.service';
import { ActionExecutorService } from './action-executor.service';
import { AssistantMessage, UserMessage } from '../../conversation/conversation.types';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import * as crypto from 'crypto';

@Injectable()
export class AgentLoopService {
  private readonly logger = new Logger(AgentLoopService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly agentStepService: AgentStepService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly executionTracker: ExecutionTrackerService,
  ) {}

  /**
   * Orchestrates the autonomous agent reasoning loop.
   */
  async runLoop(context: ExecutionContext, conversationId: string, userInput: string): Promise<string> {
    const run = await this.executionTracker.createRun(context.runId, conversationId, { traceId: context.traceId });
    await this.executionTracker.updateRunStatus(run.id, 'running');
    this.logger.log(`Starting run '${run.id}' for conversation '${conversationId}'`);

    try {
      // 1. Append user message to conversation
      const userMessage: UserMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        createdAt: Date.now(),
        parts: [{ type: 'text', content: userInput }]
      } as any;
      await this.conversationService.appendMessage(context.workspaceId, conversationId, userMessage);

      let stepCount = 0;
      const maxReasoningSteps = 10;

      // 2. The Agent Loop
      while (stepCount < maxReasoningSteps) {
        stepCount++;
        this.logger.debug(`[Run ${run.id}] Step ${stepCount}`);

        const messages = await this.conversationService.getMessages(context.workspaceId, conversationId);
        
        // 3. Evaluate state and get next action
        const reasoningNode = await this.executionTracker.createNode(
          context.runId,
          'reasoning',
          `Reasoning Step ${stepCount}`,
          undefined,
          undefined,
          context.agentId
        );

        const action = await this.agentStepService.executeStep(context, messages);

        await this.executionTracker.updateNodeStatus(
          reasoningNode.id,
          'completed',
          action
        );

        // 4. Handle LLM responses (Finish or Respond)
        if (action.type === 'finish' || action.type === 'respond') {
          const assistantMsg: AssistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            createdAt: Date.now(),
            status: 'completed',
            parts: [{ type: 'text', content: action.content }]
          } as any;
          await this.conversationService.appendMessage(context.workspaceId, conversationId, assistantMsg);
          await this.executionTracker.updateRunStatus(run.id, 'completed', 'Completed');
          return action.content;
        }

        // 5. Handle Cancellations
        if (action.type === 'cancel') {
          this.logger.warn(`Run ${run.id} cancelled: ${action.reason}`);
          await this.executionTracker.updateRunStatus(run.id, 'cancelled', action.reason);
          return `Cancelled: ${action.reason}`;
        }

        // 6. Handle Tool Calls
        if (action.type === 'tool_call') {
          // Append Assistant's intent to use tools
          const assistantMsg: AssistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            createdAt: Date.now(),
            content: '',
            toolCalls: action.toolCalls
          };
          await this.conversationService.appendMessage(context.workspaceId, conversationId, assistantMsg);

          // Execute actions and get ToolMessages
          const toolMessages = await this.actionExecutor.executeAction(context, action);

          // Append results back to conversation
          for (const msg of toolMessages) {
            await this.conversationService.appendMessage(context.workspaceId, conversationId, msg);
          }

          // Continue loop so LLM can observe tool results
          continue;
        }

        // Future support for human_approval
        if (action.type === 'human_approval') {
          await this.executionTracker.updateRunStatus(run.id, 'requires_action', 'HumanApprovalRequired');
          return `Human approval required: ${action.context}`;
        }
      }

      // Max steps reached
      this.logger.warn(`Run ${run.id} reached max reasoning steps (${maxReasoningSteps})`);
      await this.executionTracker.updateRunStatus(run.id, 'failed', 'MaxStepsReached');
      return "I've reached my internal reasoning limit and must stop.";

    } catch (error: any) {
      this.logger.error(`Run ${run.id} failed`, error);
      await this.executionTracker.updateRunStatus(run.id, 'failed', error.message || 'Unknown error');
      throw error;
    }
  }
}
