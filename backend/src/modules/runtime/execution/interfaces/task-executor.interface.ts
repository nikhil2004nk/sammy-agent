import { DelegationContract } from '../../models/delegation-contract.model';
import { ExecutionTarget } from '../../../planner/interfaces/capability-resolver.interface';
import { Task } from '../../../planner/models/task.model';

export interface ITaskExecutor {
  /**
   * Executes a task against the given execution target based on the delegation contract.
   * @param target The target to execute against (Agent, MCP, Workflow, etc.)
   * @param task The task being executed
   * @param contract The delegation contract containing budgets and policies
   * @returns A promise resolving to the task result (success or failure payload)
   */
  execute(target: ExecutionTarget, task: Task, contract: DelegationContract): Promise<any>;
}
