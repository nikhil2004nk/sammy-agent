import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '../../../common/execution-context';

export interface PlanStep {
  action: 'execute_tool' | 'call_llm' | 'respond';
  toolName?: string;
  args?: Record<string, any>;
}

@Injectable()
export class PlannerService {
  /**
   * For Phase 1, the planner just instructs the runtime to directly call the LLM
   * and then respond. In future phases, this will use LangGraph or an LLM
   * to determine a multi-step execution plan.
   */
  async createPlan(context: ExecutionContext): Promise<PlanStep[]> {
    return [
      { action: 'call_llm' },
      { action: 'respond' }
    ];
  }
}
