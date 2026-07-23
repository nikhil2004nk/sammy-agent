import { Injectable, Logger } from '@nestjs/common';
import { ITaskExecutor } from '../interfaces/task-executor.interface';
import { DelegationContract } from '../../models/delegation-contract.model';
import { ExecutionTarget } from '../../../planner/interfaces/capability-resolver.interface';
import { Task } from '../../../planner/models/task.model';
import { AgentOrchestratorService } from '../../agent-loop/agent-orchestrator.service';

@Injectable()
export class AgentTaskExecutorService implements ITaskExecutor {
  private readonly logger = new Logger(AgentTaskExecutorService.name);

  constructor(private readonly agentOrchestrator: AgentOrchestratorService) {}

  async execute(target: ExecutionTarget, task: Task, contract: DelegationContract): Promise<any> {
    this.logger.log(`Executing task ${task.id} via agent ${target.id}`);
    
    // We delegate the execution to the existing AgentOrchestratorService
    // We pass down the execution context embedded in the contract
    const result = await this.agentOrchestrator.delegate(
      contract.executionContext,
      contract.goal,
      contract.executionContext.conversationId || 'scheduler-session',
      target.id
    );

    return result;
  }
}
