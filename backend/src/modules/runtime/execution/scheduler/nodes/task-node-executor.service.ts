import { Injectable, Logger } from '@nestjs/common';
import { INodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { Task } from '../../../../planner/models/task.model';
import { ExecutionContext } from '../../../../../common/execution-context';
import { CapabilityResolverService } from '../../../../planner/capability-resolver.service';
import { AgentTaskExecutorService } from '../../executors/agent-task-executor.service';
import { DelegationContract } from '../../../models/delegation-contract.model';

@Injectable()
export class TaskNodeExecutor implements INodeExecutor {
  private readonly logger = new Logger(TaskNodeExecutor.name);

  constructor(
    private readonly capabilityResolver: CapabilityResolverService,
    private readonly agentExecutor: AgentTaskExecutorService
  ) {}

  async executeNode(task: Task, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.logger.log(`Executing TASK node ${task.id}`);
      
      const targets = await this.capabilityResolver.resolve(task.requiredCapabilities || []);
      if (targets.length === 0) {
        return { success: false, action: 'FAIL', error: `No available target for capabilities: ${task.requiredCapabilities?.join(', ')}` };
      }
      const target = targets[0]; // Pick best match

      const contract: DelegationContract = {
        goal: task.goal,
        executionContext: context,
        constraints: [],
        permissions: [],
        memoryAccess: 'READ_WRITE',
        expectedOutput: `Completion of task: ${task.goal}`,
        budget: context.budget
      };

      const result = await this.agentExecutor.execute(target, task, contract);
      
      if (result && result.success) {
        return { success: true, action: 'COMPLETE', output: result };
      } else {
        return { success: false, action: 'FAIL', error: result?.errors?.join(', ') || 'Task execution failed' };
      }
    } catch (error: any) {
      this.logger.error(`TaskNodeExecutor failed: ${error.message}`);
      return { success: false, action: 'FAIL', error: error.message };
    }
  }
}
