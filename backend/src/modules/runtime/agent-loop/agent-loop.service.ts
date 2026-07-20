import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { ConversationService } from '../../conversation/conversation.service';
import { AgentStepService } from './agent-step.service';
import { ActionExecutorService } from './action-executor.service';
import { AssistantMessage, UserMessage, RunStatus } from '../../conversation/conversation.types';
import * as crypto from 'crypto';

@Injectable()
export class AgentLoopService {
  private readonly logger = new Logger(AgentLoopService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly agentStepService: AgentStepService,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  /**
   * Orchestrates the autonomous agent reasoning loop.
   */
  async runLoop(context: ExecutionContext, conversationId: string, userInput: string): Promise<string> {
    const run = this.conversationService.createRun(conversationId, { traceId: context.traceId });
    this.logger.log(`Starting run '${run.id}' for conversation '${conversationId}'`);

    try {
      // 1. Append user message to conversation
      const userMessage: UserMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        createdAt: Date.now(),
        content: userInput
      };
      this.conversationService.appendMessage(conversationId, userMessage);

      let stepCount = 0;
      const maxReasoningSteps = 10;

      // 2. The Agent Loop
      while (stepCount < maxReasoningSteps) {
        stepCount++;
        this.logger.debug(`[Run ${run.id}] Step ${stepCount}`);

        const messages = this.conversationService.getMessages(conversationId);
        
        // 3. Evaluate state and get next action
        const action = await this.agentStepService.executeStep(context, messages);

        // 4. Handle LLM responses (Finish or Respond)
        if (action.type === 'finish' || action.type === 'respond') {
          const assistantMsg: AssistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            createdAt: Date.now(),
            content: action.content
          };
          this.conversationService.appendMessage(conversationId, assistantMsg);
          this.conversationService.updateRunStatus(run.id, 'completed', 'Completed');
          return action.content;
        }

        // 5. Handle Cancellations
        if (action.type === 'cancel') {
          this.logger.warn(`Run ${run.id} cancelled: ${action.reason}`);
          this.conversationService.updateRunStatus(run.id, 'cancelled', action.reason);
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
          this.conversationService.appendMessage(conversationId, assistantMsg);

          // Execute actions and get ToolMessages
          const toolMessages = await this.actionExecutor.executeAction(context, action);

          // Append results back to conversation
          for (const msg of toolMessages) {
            this.conversationService.appendMessage(conversationId, msg);
          }

          // Continue loop so LLM can observe tool results
          continue;
        }

        // Future support for human_approval
        if (action.type === 'human_approval') {
          this.conversationService.updateRunStatus(run.id, 'requires_action', 'HumanApprovalRequired');
          return `Human approval required: ${action.context}`;
        }
      }

      // Max steps reached
      this.logger.warn(`Run ${run.id} reached max reasoning steps (${maxReasoningSteps})`);
      this.conversationService.updateRunStatus(run.id, 'failed', 'MaxStepsReached');
      return "I've reached my internal reasoning limit and must stop.";

    } catch (error: any) {
      this.logger.error(`Run ${run.id} failed`, error);
      this.conversationService.updateRunStatus(run.id, 'failed', error.message || 'Unknown error');
      throw error;
    }
  }
}
