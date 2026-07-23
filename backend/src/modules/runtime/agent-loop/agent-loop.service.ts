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

import { ExecutionStreamService } from '../../execution/execution-stream.service';

@Injectable()
export class AgentLoopService {
  private readonly logger = new Logger(AgentLoopService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly agentStepService: AgentStepService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly executionTracker: ExecutionTrackerService,
    private readonly memoryService: MemoryService,
    private readonly stream: ExecutionStreamService,
  ) {}

  /**
   * Orchestrates the autonomous agent reasoning loop.
   */
  async runLoop(context: ExecutionContext, conversationId: string, userInput: string): Promise<string> {
    const isSubAgent = (context.delegationDepth ?? 0) > 0;
    
    if (!isSubAgent) {
      const run = await this.executionTracker.createRun(context.runId, conversationId, { traceId: context.traceId });
      await this.executionTracker.updateRunStatus(context.runId, RunStatus.RUNNING);
    }
    
    const runId = context.runId;

    this.logger.log(`\n==================================================`);
    this.logger.log(`[Run ${runId}] Starting execution turn (Sub-agent: ${isSubAgent})`);
    this.logger.log(`==================================================`);
    this.logger.log(`[Run ${runId}] [Step 1] Initializing run for conversation '${conversationId}'`);
    
    // Aggregation Tracking Variables
    const runStartTime = Date.now();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let providerName = 'Unknown';
    let modelName = 'Unknown';
    let memoryItemsCount = 0;
    let totalToolCalls = 0;

    try {
      // 1. Append user message — only for top-level runs, not sub-agent delegations
      // Sub-agent goals are internal task descriptions, NOT real user messages.
      if (!isSubAgent) {
        this.logger.log(`[Run ${runId}] [Step 2] Appending user message: "${userInput}"`);
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
        this.stream.publish(runId, 'message.created', { message: userMessage });
      }

      // 2. Retrieve memory context and attach to ExecutionContext for AgentStepService (system prompt injection)
      this.logger.log(`[Run ${runId}] [Step 3] Retrieving memory context for workspace '${context.workspaceId}'`);
      
      const memoryNode = await this.executionTracker.createNode(
        context.runId,
        ExecutionNodeType.EVENT,
        `Context & Memory Setup`,
        undefined,
        undefined,
        context.agentId
      );
      
      const memoryContext = await this.memoryService.buildContext(
        context.workspaceId,
        context.userId,
        context.agentId,
      ).catch(() => '');

      if (memoryContext) {
        this.logger.log(`[Run ${runId}] [Step 3a] Injecting memory context into system prompt: ${memoryContext.replace(/\n/g, ' ').substring(0, 100)}...`);
        context = { ...context, memoryContext };
        memoryItemsCount = memoryContext.split('\n').filter(l => l.trim().startsWith('-')).length;
      }
      
      await this.executionTracker.updateNodeStatus(memoryNode.id, ExecutionNodeStatus.COMPLETED, { summary: `Loaded ${memoryItemsCount} context items` });

      let stepCount = 0;
      const maxReasoningSteps = 10;

      // 3. The Agent Loop
      while (stepCount < maxReasoningSteps) {
        stepCount++;
        this.logger.log(`\n[Run ${runId}] --- Loop Iteration ${stepCount} ---`);
        const messages = await this.conversationService.getMessages(context.workspaceId, conversationId);
        
        const totalParts = messages.reduce((acc, msg) => acc + (msg.parts?.length || 0), 0);
        const lastUpdated = messages.length > 0 ? new Date(messages[messages.length - 1].createdAt).toISOString() : 'N/A';

        this.logger.log(`
[Conversation History]
Messages       ${messages.length}
Parts          ${totalParts}
Last Updated   ${lastUpdated}
        `);

        const reasoningNode = await this.executionTracker.createNode(
          context.runId,
          ExecutionNodeType.REASONING,
          `Reasoning Step ${stepCount}`,
          undefined,
          undefined,
          context.agentId
        );

        this.logger.log(`[Run ${runId}] [Step 5.${stepCount}] Requesting reasoning step from LLM`);
        const action = await this.agentStepService.executeStep(context, messages);
        this.logger.log(`[Run ${runId}] [Step 6.${stepCount}] LLM responded with action type: '${action.type}'`);

        await this.executionTracker.updateNodeStatus(
          reasoningNode.id,
          ExecutionNodeStatus.COMPLETED,
          action
        );

        // 4. Finish / Respond
        if (action.type === 'finish' || action.type === 'respond') {
          const respondNode = await this.executionTracker.createNode(
            context.runId,
            ExecutionNodeType.EVENT,
            `Decision: Final Response`,
            { summary: `Agent decided to respond to the user and end the turn.` },
            undefined,
            context.agentId
          );
          await this.executionTracker.updateNodeStatus(respondNode.id, ExecutionNodeStatus.COMPLETED);
          if ((action as any).usage) {
             totalInputTokens += (action as any).usage.prompt || 0;
             totalOutputTokens += (action as any).usage.completion || 0;
             providerName = (action as any).usage.provider || providerName;
             modelName = (action as any).usage.model || modelName;
          }
          this.logger.log(`[Run ${runId}] [Step 7] LLM chose to respond to user. Appending assistant message.`);
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
          this.stream.publish(runId, 'message.created', { message: assistantMsg });
          if (!isSubAgent) {
            await this.executionTracker.updateRunStatus(runId, RunStatus.COMPLETED, 'Completed');
          }
          this.logger.log(`[Run ${runId}] [Step 8] Run completed successfully.`);

          // Save episodic memory so future runs have context about what happened
          await this.memoryService.saveRunSummary(
            context.workspaceId,
            runId,
            `User asked: "${userInput.slice(0, 120)}". Agent responded: "${action.content.slice(0, 200)}"`,
            context.agentId,
            context.userId,
          );
          
          if ((action as any).usage) {
             totalInputTokens += (action as any).usage.prompt;
             totalOutputTokens += (action as any).usage.completion;
             providerName = (action as any).usage.provider;
             modelName = (action as any).usage.model;
          }
          
          const runDuration = (Date.now() - runStartTime) / 1000;

          this.logger.log(`
═══════════════════════════════════════
Execution Summary
═══════════════════════════════════════
Run                  ${runId}
Workspace            ${context.workspaceId}
Conversation         ${conversationId}
Agent                ${context.agentId}
Status               Completed
Duration             ${runDuration.toFixed(2)} s
Provider             ${providerName}
Model                ${modelName}
Input Tokens         ${totalInputTokens}
Output Tokens        ${totalOutputTokens}
Memory               ${memoryItemsCount} Episodic, 0 Semantic
Tool Calls           ${totalToolCalls}
Planner Iterations   ${stepCount}
Approvals            0
Delegations          0
Cost                 $0.0000
═══════════════════════════════════════
          `);

          return action.content;
        }

        // 5. Cancellation
        if (action.type === 'cancel') {
          this.logger.warn(`[Run ${runId}] [Step 7] Run cancelled by agent: ${action.reason}`);
          if (!isSubAgent) {
            await this.executionTracker.updateRunStatus(runId, RunStatus.CANCELLED, action.reason);
          }
          return `Cancelled: ${action.reason}`;
        }

        // 6. Tool Calls
        if (action.type === 'tool_call') {
          totalToolCalls += action.toolCalls.length;
          
          if ((action as any).usage) {
             totalInputTokens += (action as any).usage.prompt || 0;
             totalOutputTokens += (action as any).usage.completion || 0;
             providerName = (action as any).usage.provider || providerName;
             modelName = (action as any).usage.model || modelName;
          }

          const decisionNode = await this.executionTracker.createNode(
            context.runId,
            ExecutionNodeType.EVENT,
            `Decision: Execute Tools`,
            { summary: `Agent decided to execute ${action.toolCalls.length} tool(s).` },
            undefined,
            context.agentId
          );
          await this.executionTracker.updateNodeStatus(decisionNode.id, ExecutionNodeStatus.COMPLETED);

          this.logger.log(`[Run ${runId}] [Step 7.${stepCount}] LLM invoked ${action.toolCalls.length} tool(s). Appending tool calls to conversation.`);
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
          this.stream.publish(runId, 'message.created', { message: assistantMsg });

          this.logger.log(`[Run ${runId}] [Step 8.${stepCount}] Executing tools via ActionExecutorService...`);
          const toolMessages = await this.actionExecutor.executeAction(context, action);
          
          this.logger.log(`[Run ${runId}] [Step 9.${stepCount}] Appending tool execution results back to conversation.`);
          for (const msg of toolMessages) {
            await this.conversationService.appendMessage(context.workspaceId, conversationId, msg);
            this.stream.publish(runId, 'message.created', { message: msg });
          }
          continue;
        }

        // 7. Human Approval — ToolExecutorService handles pause/wait internally.
        // This branch handles if the LLM itself signals it wants a human decision.
        if (action.type === 'human_approval') {
          this.logger.log(`[Run ${runId}] [Step 7] Agent requested human approval. Pausing execution.`);
          if (!isSubAgent) {
            await this.executionTracker.updateRunStatus(runId, RunStatus.REQUIRES_ACTION, 'HumanApprovalRequired');
          }
          return `Approval requested. Check pending approvals for run '${runId}'.`;
        }
      }

      const errorNode = await this.executionTracker.createNode(
        context.runId,
        ExecutionNodeType.EVENT,
        `Loop Terminated`,
        { summary: `Max reasoning steps reached (${maxReasoningSteps}).` },
        undefined,
        context.agentId
      );
      await this.executionTracker.updateNodeStatus(errorNode.id, ExecutionNodeStatus.FAILED);
      
      this.logger.warn(`Run ${runId} reached max reasoning steps (${maxReasoningSteps})`);
      if (!isSubAgent) {
        await this.executionTracker.updateRunStatus(runId, RunStatus.FAILED, 'MaxStepsReached');
      }
      return "I've reached my internal reasoning limit and must stop.";

    } catch (error: any) {
      this.logger.error(`Run ${runId} failed`, error);
      if (!isSubAgent) {
        await this.executionTracker.updateRunStatus(runId, RunStatus.FAILED, error.message || 'Unknown error');
      }
      throw error;
    }
  }
}
