import { Injectable, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';
import { EventBusService } from '../../events/event-bus.service';
import { AgentLoopService } from '../agent-loop/agent-loop.service';
import { AgentOrchestratorService } from '../agent-loop/agent-orchestrator.service';
import { PlannerService } from '../../planner/planner.service';
import { IntentAnalyzerService } from '../../planner/intent-analyzer.service';
import { ReflectionEngineService } from '../../planner/reflection-engine.service';
import { ExecutionPlan } from '../../planner/models/execution-plan.model';
import { TaskStatus } from '../../planner/models/task.model';
import { DelegationContract } from '../models/delegation-contract.model';
import { ExecutionSchedulerService } from './scheduler/execution-scheduler.service';
import { ExecutionTrackerService } from '../../execution/execution-tracker.service';
import { ExecutionStreamService } from '../../execution/execution-stream.service';
import { RunStatus } from '../../execution/execution.types';
import { formatLog } from '../../../common/logger-utils';
import { ConversationService } from '../../conversation/conversation.service';
import { Message } from '../../conversation/conversation.types';
import { MessageRole, MessagePartType, MessagePartStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly agentLoop: AgentLoopService,
    private readonly orchestrator: AgentOrchestratorService,
    private readonly planner: PlannerService,
    private readonly intentAnalyzer: IntentAnalyzerService,
    private readonly reflectionEngine: ReflectionEngineService,
    private readonly scheduler: ExecutionSchedulerService,
    private readonly executionTracker: ExecutionTrackerService,
    private readonly conversationService: ConversationService,
    private readonly stream: ExecutionStreamService,
  ) {}

  /**
   * The entry point for execution. Delegates to the Agent Loop.
   */
  async executeTurn(context: ExecutionContext, userInput: string): Promise<string> {
    this.eventBus.emitExecutionStarted(context.traceId, context.agentId, context.conversationId || 'unknown');
    this.logger.log(formatLog(context, `Starting execution turn for traceId: ${context.traceId}`));

    try {
      if (context.featureFlags?.useNewPlanner) {
        await this.executionTracker.createRun(context.runId, context.conversationId || 'unknown', { traceId: context.traceId });
        
        // Save user message to DB so it appears in chat history
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: MessageRole.USER,
          createdAt: Date.now(),
          parts: [{
            id: crypto.randomUUID(),
            type: MessagePartType.TEXT,
            status: MessagePartStatus.COMPLETE,
            order: 0,
            content: { text: userInput },
            createdAt: Date.now(),
          }],
        };
        await this.conversationService.appendMessage(context.workspaceId, context.conversationId || 'unknown', userMsg);
        this.stream.publish(context.runId, 'message.created', { message: userMsg });

        const finalResponse = await this.executeIterativePlan(context, userInput);
        
        // Save the final assistant response to DB
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: MessageRole.ASSISTANT,
          createdAt: Date.now(),
          parts: [{
            id: crypto.randomUUID(),
            type: MessagePartType.TEXT,
            status: MessagePartStatus.COMPLETE,
            order: 0,
            content: { text: finalResponse },
            createdAt: Date.now(),
          }],
        };
        await this.conversationService.appendMessage(context.workspaceId, context.conversationId || 'unknown', assistantMsg);
        this.stream.publish(context.runId, 'message.created', { message: assistantMsg });

        await this.executionTracker.updateRunStatus(context.runId, RunStatus.COMPLETED);
        this.logger.log(formatLog(context, `Finished iterative DAG execution for traceId: ${context.traceId}`));
        this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId || 'unknown', finalResponse);
        return finalResponse;
      } else {
        const finalResponse = await this.agentLoop.runLoop(context, context.conversationId || 'unknown', userInput);
        this.logger.log(formatLog(context, `Finished legacy execution turn for traceId: ${context.traceId}`));
        this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId || 'unknown', finalResponse);
        return finalResponse;
      }
    } catch (error: any) {
      this.logger.error(formatLog(context, `Execution failed for traceId: ${context.traceId}`), error);
      if (context.featureFlags?.useNewPlanner) {
        await this.executionTracker.updateRunStatus(context.runId, RunStatus.FAILED, error.message);
      }
      throw error;
    }
  }

  private async executeIterativePlan(context: ExecutionContext, userInput: string): Promise<string> {
    let isComplete = false;
    let iteration = 0;
    const maxIterations = 3;
    let currentInput = userInput;
    let lastFeedback = '';
    let finalOutput = '';

    while (!isComplete && iteration < maxIterations) {
      iteration++;
      this.logger.log(formatLog(context, `Planning Iteration ${iteration} for: ${currentInput}`));

      const intent = await this.intentAnalyzer.analyze(currentInput);
      const planningResult = await this.planner.createPlan(context, intent);

      if (!planningResult.plan) {
        return `Failed to generate a valid plan for: ${currentInput}`;
      }

      const taskOutputs = await this.runDag(context, planningResult.plan, currentInput);
      if (taskOutputs && taskOutputs.length > 0) {
        finalOutput = taskOutputs.map(o => typeof o === 'object' ? o.output || JSON.stringify(o) : o).join('\n');
      }

      const reflection = await this.reflectionEngine.reflect(planningResult.plan, intent);
      isComplete = reflection.isComplete;
      lastFeedback = reflection.feedback;

      if (!isComplete) {
        this.logger.warn(formatLog(context, `Reflection indicated incomplete plan: ${reflection.feedback}. Replanning...`));
        currentInput = `Previous plan was incomplete. Goal: ${userInput}. Feedback to address: ${reflection.feedback}`;
      }
    }

    if (finalOutput) {
      return finalOutput;
    }
    return `Iterative execution completed. Final status: ${isComplete ? 'Success' : 'Incomplete'}. Feedback: ${lastFeedback}`;
  }

  private async runDag(context: ExecutionContext, plan: ExecutionPlan, goal: string): Promise<any[]> {
    this.logger.log(formatLog(context, `Delegating DAG execution to ExecutionSchedulerService for plan: ${plan.id}`));
    return await this.scheduler.schedule(plan, context);
  }
}
