import { Module, forwardRef } from '@nestjs/common';
import { ExecutionService } from './execution/execution.service';
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
  ],
  providers: [ExecutionService, AgentStepService, ActionExecutorService, AgentLoopService, AgentOrchestratorService],
  exports: [ExecutionService, AgentLoopService],
})
export class RuntimeModule {}
