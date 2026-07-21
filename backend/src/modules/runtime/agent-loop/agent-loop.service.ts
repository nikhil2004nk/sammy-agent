import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { ConversationService } from '../../conversation/conversation.service';
import { AgentStepService } from './agent-step.service';
import { ActionExecutorService } from './action-executor.service';
import { Message } from '../../conversation/conversation.types';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import { MemoryService } from '../../memory/memory.service';
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
    private readonly memoryService: MemoryService,
  ) {}

  /**
   * Orchestrates the autonomous agent reasoning loop.
   */
  async runLoop(context: ExecutionContext, conversationId: string, userInput: string): Promise<string> {
    const run = await this.executionTracker.createRun(context.runId, conversationId, { traceId: context.traceId });
    await this.executionTracker.updateRunStatus(run.id, RunStatus.RUNNING);
    this.logger.log(`Starting run '${run.id}' for conversation '${conversationId}'`);

    try {
      // 1. Append user message
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

      // 2. Retrieve memory context and attach to ExecutionContext for AgentStepService (system prompt injection)
      const memoryContext = await this.memoryService.buildContext(
        context.workspaceId,
        context.userId,
        context.agentId,
      ).catch(() => '');

      if (memoryContext) {
        this.logger.debug(`[Run ${run.id}] Injecting memory context into system prompt`);
        context = { ...context, memoryContext };
      }

      let stepCount = 0;
      const maxReasoningSteps = 10;

      // 3. The Agent Loop
      while (stepCount < maxReasoningSteps) {
        stepCount++;
        this.logger.debug(`[Run ${run.id}] Step ${stepCount}`);

        const messages = await this.conversationService.getMessages(context.workspaceId, conversationId);

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

        // 4. Finish / Respond
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

          // Save episodic memory so future runs have context about what happened
          await this.memoryService.saveRunSummary(
            context.workspaceId,
            run.id,
            `User asked: "${userInput.slice(0, 120)}". Agent responded: "${action.content.slice(0, 200)}"`,
            context.agentId,
            context.userId,
          );

          return action.content;
        }

        // 5. Cancellation
        if (action.type === 'cancel') {
          this.logger.warn(`Run ${run.id} cancelled: ${action.reason}`);
          await this.executionTracker.updateRunStatus(run.id, RunStatus.CANCELLED, action.reason);
          return `Cancelled: ${action.reason}`;
        }

        // 6. Tool Calls
        if (action.type === 'tool_call') {
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

          const toolMessages = await this.actionExecutor.executeAction(context, action);
          for (const msg of toolMessages) {
            await this.conversationService.appendMessage(context.workspaceId, conversationId, msg);
          }
          continue;
        }

        // 7. Human Approval — ToolExecutorService handles pause/wait internally.
        // This branch handles if the LLM itself signals it wants a human decision.
        if (action.type === 'human_approval') {
          await this.executionTracker.updateRunStatus(run.id, RunStatus.REQUIRES_ACTION, 'HumanApprovalRequired');
          return `Approval requested. Check pending approvals for run '${run.id}'.`;
        }
      }

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
