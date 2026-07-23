import { Injectable, Logger } from '@nestjs/common';
import { IReflectionEngine, ReflectionResult } from './interfaces/reflection-engine.interface';
import { ExecutionPlan } from './models/execution-plan.model';
import { Intent } from './interfaces/intent.interface';
import { TaskStatus } from './models/task.model';

@Injectable()
export class ReflectionEngineService implements IReflectionEngine {
  private readonly logger = new Logger(ReflectionEngineService.name);

  /**
   * For Milestone 3.8, this is a mock deterministic implementation.
   * It simply checks if all tasks in the execution plan are COMPLETED.
   */
  async reflect(plan: ExecutionPlan, intent: Intent): Promise<ReflectionResult> {
    this.logger.log(`Reflecting on ExecutionPlan: ${plan.id} for intent: ${intent.goal}`);

    if (!plan.tasks || plan.tasks.length === 0) {
      return {
        isComplete: false,
        feedback: 'Plan has no tasks. Re-planning required.',
        confidence: 1.0,
      };
    }

    const failedTasks = plan.tasks.filter(t => t.status === TaskStatus.FAILED);
    if (failedTasks.length > 0) {
      return {
        isComplete: false,
        feedback: `${failedTasks.length} tasks failed. Re-planning required to address failures.`,
        confidence: 0.9,
      };
    }

    const pendingTasks = plan.tasks.filter(t => t.status === TaskStatus.PENDING || t.status === TaskStatus.BLOCKED || t.status === TaskStatus.RUNNING);
    if (pendingTasks.length > 0) {
      return {
        isComplete: false,
        feedback: `Plan is incomplete. ${pendingTasks.length} tasks are still pending/blocked/running.`,
        confidence: 0.9,
      };
    }

    return {
      isComplete: true,
      feedback: 'All tasks in the plan are completed successfully.',
      confidence: 1.0,
    };
  }
}
