import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { ExecutionService } from './execution/execution.service';
import { ExecutionSchedulerService } from './execution/scheduler/execution-scheduler.service';
import { AgentTaskExecutorService } from './execution/executors/agent-task-executor.service';
import { NodeExecutorRegistry } from './execution/scheduler/nodes/node-executor.registry';
import { TaskNodeExecutor } from './execution/scheduler/nodes/task-node-executor.service';
import { ConditionNodeExecutor } from './execution/scheduler/nodes/condition-node-executor.service';
import { LoopNodeExecutor } from './execution/scheduler/nodes/loop-node-executor.service';
import { WorkflowModule } from '../workflow/workflow.module';
import { PlannerModule } from '../planner/planner.module';
import { PromptsModule } from '../prompts/prompts.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { EventsModule } from '../events/events.module';
import { ConversationModule } from '../conversation/conversation.module';
import { AgentStepService } from './agent-loop/agent-step.service';
import { ActionExecutorService } from './agent-loop/action-executor.service';
import { AgentLoopService } from './agent-loop/agent-loop.service';
import { AgentOrchestratorService } from './agent-loop/agent-orchestrator.service';
import { ExecutionModule } from '../execution/execution.module';
import { RegistryModule } from '../registry/registry.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    PromptsModule,
    LlmModule,
    ToolsModule,
    EventsModule,
    forwardRef(() => ConversationModule),
    ExecutionModule,
    RegistryModule,
    MemoryModule,
    PlannerModule,
    WorkflowModule,
  ],
  providers: [
    ExecutionService, 
    AgentStepService, 
    ActionExecutorService, 
    AgentLoopService, 
    AgentOrchestratorService, 
    ExecutionSchedulerService, 
    AgentTaskExecutorService,
    NodeExecutorRegistry,
    TaskNodeExecutor,
    ConditionNodeExecutor,
    LoopNodeExecutor
  ],
  exports: [ExecutionService, AgentLoopService, ExecutionSchedulerService],
})
export class RuntimeModule implements OnModuleInit {
  constructor(
    private readonly nodeRegistry: NodeExecutorRegistry,
    private readonly taskExecutor: TaskNodeExecutor,
    private readonly conditionExecutor: ConditionNodeExecutor,
    private readonly loopExecutor: LoopNodeExecutor
  ) {}

  onModuleInit() {
    this.nodeRegistry.register('TASK', this.taskExecutor);
    this.nodeRegistry.register('CONDITION', this.conditionExecutor);
    this.nodeRegistry.register('LOOP', this.loopExecutor);
  }
}
