import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';

export interface PlanStep {
  action: 'react_loop' | 'call_llm' | 'respond';
  toolName?: string;
  args?: Record<string, any>;
}

@Injectable()
export class PlannerService {
  /**
   * For Phase 1, the planner instructs the runtime to enter a ReAct (Reasoning and Acting) loop.
   */
  async createPlan(context: ExecutionContext): Promise<PlanStep[]> {
    return [
      { action: 'react_loop' }
    ];
  }
}
