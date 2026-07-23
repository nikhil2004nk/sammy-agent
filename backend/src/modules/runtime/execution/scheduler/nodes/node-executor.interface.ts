import { Task } from '../../../../planner/models/task.model';
import { ExecutionContext } from '../../../../../common/execution-context';
import { DelegationContract } from '../../../models/delegation-contract.model';

export interface NodeExecutionResult {
  success: boolean;
  action: 'COMPLETE' | 'SKIP' | 'FAIL' | 'INJECT_TASKS';
  tasksToInject?: Task[]; // For loops dynamically generating tasks
  error?: string;
  output?: any;
}

export interface INodeExecutor {
  /**
   * Executes a specific node (Task) from the ExecutionPlan.
   * @param task The task to execute (could be type TASK, CONDITION, LOOP, etc.)
   * @param context The execution context
   */
  executeNode(task: Task, context: ExecutionContext): Promise<NodeExecutionResult>;
}
