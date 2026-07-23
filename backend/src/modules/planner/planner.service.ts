import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { Intent } from './interfaces/intent.interface';
import { PlanningResult } from './dto/planning-result.dto';
import { TaskStatus } from './models/task.model';
import * as crypto from 'crypto';

/**
 * Temporary interface to maintain backward compatibility 
 * while transitioning to full ExecutionPlans.
 */
export interface PlanStep {
  action: 'react_loop' | 'call_llm' | 'respond';
  toolName?: string;
  args?: Record<string, any>;
}

@Injectable()
export class PlannerService {
  /**
   * For Phase 1, the planner instructs the runtime to enter a ReAct (Reasoning and Acting) loop.
   * We wrap it in a PlanningResult to begin the transition to structured results.
   */
  async createPlan(context: ExecutionContext, intent: Intent): Promise<PlanningResult> {
    const task1Id = crypto.randomUUID();
    const task2Id = crypto.randomUUID();
    const task3Id = crypto.randomUUID();

    const plan = {
      id: crypto.randomUUID(),
      originalIntent: intent,
      metadata: {
        estimatedComplexity: 3,
        generatedAt: new Date(),
        version: 1,
      },
      tasks: [
        {
          id: task1Id,
          goal: `Analyze preconditions for: ${intent.goal}`,
          dependsOn: [],
          requiredCapabilities: ['analysis'],
          status: TaskStatus.PENDING,
        },
        {
          id: task2Id,
          goal: `Execute core actions for: ${intent.goal}`,
          dependsOn: [task1Id],
          requiredCapabilities: ['execution'],
          status: TaskStatus.PENDING,
        },
        {
          id: task3Id,
          goal: `Verify results for: ${intent.goal}`,
          dependsOn: [task2Id],
          requiredCapabilities: ['verification'],
          status: TaskStatus.PENDING,
        }
      ]
    };

    return {
      success: true,
      reasoning: `Successfully generated a 3-step DAG execution plan for intent: ${intent.goal}`,
      confidence: 1.0,
      plan: plan
    };
  }

  /**
   * Legacy method for the runtime until it fully supports PlanningResult.
   */
  async createLegacyPlan(context: ExecutionContext): Promise<PlanStep[]> {
    return [
      { action: 'react_loop' }
    ];
  }
}
