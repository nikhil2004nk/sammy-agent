import { ExecutionContext } from '../../../common/execution-context';
import { Injectable } from '@nestjs/common';

export interface IConditionEvaluator {
  evaluate(expression: string, context: ExecutionContext): Promise<boolean>;
}

@Injectable()
export class SimpleConditionEvaluator implements IConditionEvaluator {
  async evaluate(expression: string, context: ExecutionContext): Promise<boolean> {
    // Very simple mock evaluator for Phase 6A.
    // In a real system, this could parse simple operators like 'state.status === "done"'
    // For now, if expression is strictly "true" or "false" (string), evaluate it.
    if (expression.toLowerCase() === 'false') {
      return false;
    }
    return true; // Default to true for now
  }
}
