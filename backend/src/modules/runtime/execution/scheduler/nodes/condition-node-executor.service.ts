import { Injectable, Logger } from '@nestjs/common';
import { INodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { Task } from '../../../../planner/models/task.model';
import { ExecutionContext } from '../../../../../common/execution-context';
import { SimpleConditionEvaluator } from '../../../../workflow/evaluators/condition-evaluator.service';

@Injectable()
export class ConditionNodeExecutor implements INodeExecutor {
  private readonly logger = new Logger(ConditionNodeExecutor.name);

  constructor(private readonly conditionEvaluator: SimpleConditionEvaluator) {}

  async executeNode(task: Task, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.logger.log(`Executing CONDITION node ${task.id}`);
      
      const expression = task.config?.conditionExpression as string;
      if (!expression) {
        // Missing expression evaluates to truthy by default to unblock
        return { success: true, action: 'COMPLETE' }; 
      }

      const result = await this.conditionEvaluator.evaluate(expression, context);
      
      if (result) {
        return { success: true, action: 'COMPLETE' };
      } else {
        // Failing condition skips the node and unblocks downstream conditionally
        return { success: true, action: 'SKIP', output: 'Condition evaluated to false' };
      }
    } catch (error: any) {
      this.logger.error(`ConditionNodeExecutor failed: ${error.message}`);
      return { success: false, action: 'FAIL', error: error.message };
    }
  }
}
