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
  ) {}

  /**
   * The entry point for execution. Delegates to the Agent Loop.
   */
  async executeTurn(context: ExecutionContext, userInput: string): Promise<string> {
    this.eventBus.emitExecutionStarted(context.traceId, context.agentId, context.conversationId || 'unknown');
    this.logger.log(`Starting execution turn for traceId: ${context.traceId}`);

    try {
      if (context.featureFlags?.useNewPlanner) {
        const finalResponse = await this.executeIterativePlan(context, userInput);
        this.logger.log(`Finished iterative DAG execution for traceId: ${context.traceId}`);
        this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId || 'unknown', finalResponse);
        return finalResponse;
      } else {
        const finalResponse = await this.agentLoop.runLoop(context, context.conversationId || 'unknown', userInput);
        this.logger.log(`Finished legacy execution turn for traceId: ${context.traceId}`);
        this.eventBus.emitExecutionFinished(context.traceId, context.agentId, context.conversationId || 'unknown', finalResponse);
        return finalResponse;
      }
    } catch (error) {
      this.logger.error(`Execution failed for traceId: ${context.traceId}`, error);
      throw error;
    }
  }

  private async executeIterativePlan(context: ExecutionContext, userInput: string): Promise<string> {
    let isComplete = false;
    let iteration = 0;
    const maxIterations = 3;
    let currentInput = userInput;
    let lastFeedback = '';

    while (!isComplete && iteration < maxIterations) {
      iteration++;
      this.logger.log(`Planning Iteration ${iteration} for: ${currentInput}`);

      const intent = await this.intentAnalyzer.analyze(currentInput);
      const planningResult = await this.planner.createPlan(context, intent);

      if (!planningResult.plan) {
        return `Failed to generate a valid plan for: ${currentInput}`;
      }

      await this.runDag(context, planningResult.plan, currentInput);

      const reflection = await this.reflectionEngine.reflect(planningResult.plan, intent);
      isComplete = reflection.isComplete;
      lastFeedback = reflection.feedback;

      if (!isComplete) {
        this.logger.warn(`Reflection indicated incomplete plan: ${reflection.feedback}. Replanning...`);
        currentInput = `Previous plan was incomplete. Goal: ${userInput}. Feedback to address: ${reflection.feedback}`;
      }
    }

    return `Iterative execution completed. Final status: ${isComplete ? 'Success' : 'Incomplete'}. Feedback: ${lastFeedback}`;
  }

  private async runDag(context: ExecutionContext, plan: ExecutionPlan, goal: string): Promise<void> {
    this.logger.log(`Executing DAG for plan: ${plan.id}`);
    const tasks = plan.tasks;

    let allDone = false;
    while (!allDone) {
      const readyTasks = tasks.filter(t => 
        t.status === TaskStatus.PENDING && 
        (t.dependsOn.length === 0 || t.dependsOn.every(depId => tasks.find(x => x.id === depId)?.status === TaskStatus.COMPLETED))
      );

      if (readyTasks.length === 0) {
        const pending = tasks.filter(t => t.status === TaskStatus.PENDING);
        if (pending.length > 0) {
          this.logger.error(`Deadlock detected in plan DAG. ${pending.length} tasks remain pending but none are unblocked.`);
          pending.forEach(t => t.status = TaskStatus.FAILED);
        }
        allDone = true;
        continue;
      }

      this.logger.log(`Executing ${readyTasks.length} parallel tasks...`);

      // Execute ready tasks in parallel
      await Promise.all(readyTasks.map(async (task) => {
        task.status = TaskStatus.RUNNING;
        
        // Use Orchestrator to delegate to a sub-agent
        const delegationResult = await this.orchestrator.delegate(
          context,
          task.goal,
          context.conversationId || 'unknown'
        );

        if (delegationResult.success) {
          task.status = TaskStatus.COMPLETED;
        } else {
          task.status = TaskStatus.FAILED;
        }
      }));

      // Check if any tasks are left
      allDone = tasks.every(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.FAILED);
    }
  }
}
