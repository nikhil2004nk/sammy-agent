import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { ConversationService } from '../../conversation/conversation.service';
import { AgentStepService } from './agent-step.service';
import { ActionExecutorService } from './action-executor.service';
import { Message, MessagePart } from '../../conversation/conversation.types';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import * as crypto from 'crypto';
import { MessageRole, MessagePartType, MessagePartStatus, RunStatus, ExecutionNodeType, ExecutionNodeStatus } from '@prisma/client';

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
    await this.executionTracker.updateRunStatus(run.id, RunStatus.RUNNING);
    this.logger.log(`Starting run '${run.id}' for conversation '${conversationId}'`);

    try {
      // 1. Append user message to conversation
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.USER,
        createdAt: Date.now(),
        parts: [{ 
          id: crypto.randomUUID(), 
          type: MessagePartType.TEXT, 
          status: MessagePartStatus.COMPLETE, 
          order: 0, 
          content: { text: userInput },
          createdAt: Date.now() 
        }]
      };
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
          ExecutionNodeType.REASONING,
          `Reasoning Step ${stepCount}`,
          undefined,
          undefined,
          context.agentId
        );

        const action = await this.agentStepService.executeStep(context, messages);

        await this.executionTracker.updateNodeStatus(
          reasoningNode.id,
          ExecutionNodeStatus.COMPLETED,
          action
        );

        // 4. Handle LLM responses (Finish or Respond)
        if (action.type === 'finish' || action.type === 'respond') {
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: MessageRole.ASSISTANT,
            createdAt: Date.now(),
            parts: [{ 
              id: crypto.randomUUID(), 
              type: MessagePartType.TEXT, 
              status: MessagePartStatus.COMPLETE, 
              order: 0, 
              content: { text: action.content },
              createdAt: Date.now() 
            }]
          };
          await this.conversationService.appendMessage(context.workspaceId, conversationId, assistantMsg);
          await this.executionTracker.updateRunStatus(run.id, RunStatus.COMPLETED, 'Completed');
          return action.content;
        }

        // 5. Handle Cancellations
        if (action.type === 'cancel') {
          this.logger.warn(`Run ${run.id} cancelled: ${action.reason}`);
          await this.executionTracker.updateRunStatus(run.id, RunStatus.CANCELLED, action.reason);
          return `Cancelled: ${action.reason}`;
        }

        // 6. Handle Tool Calls
        if (action.type === 'tool_call') {
          // Append Assistant's intent to use tools
          const assistantMsg: Message = {
            id: crypto.randomUUID(),
            role: MessageRole.ASSISTANT,
            createdAt: Date.now(),
            parts: action.toolCalls.map((tc: any, i: number) => ({
              id: crypto.randomUUID(),
              type: MessagePartType.TOOL_CALL,
              status: MessagePartStatus.COMPLETE,
              order: i,
              content: { name: tc.name, arguments: tc.arguments },
              toolCallId: tc.id,
              createdAt: Date.now()
            }))
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
          await this.executionTracker.updateRunStatus(run.id, RunStatus.REQUIRES_ACTION, 'HumanApprovalRequired');
          return `Human approval required: ${action.context}`;
        }
      }

      // Max steps reached
      this.logger.warn(`Run ${run.id} reached max reasoning steps (${maxReasoningSteps})`);
      await this.executionTracker.updateRunStatus(run.id, RunStatus.FAILED, 'MaxStepsReached');
      return "I've reached my internal reasoning limit and must stop.";

    } catch (error: any) {
      this.logger.error(`Run ${run.id} failed`, error);
      await this.executionTracker.updateRunStatus(run.id, RunStatus.FAILED, error.message || 'Unknown error');
      throw error;
    }
  }
}
