import { Module } from '@nestjs/common';
import { ExecutionService } from './execution/execution.service';
import { PlannerService } from './planner/planner.service';
import { PromptsModule } from '../prompts/prompts.module';
import { LlmModule } from '../llm/llm.module';
import { ToolsModule } from '../tools/tools.module';
import { EventsModule } from '../events/events.module';
import { ConversationModule } from '../conversation/conversation.module';
import { ResolverModule } from '../resolver/resolver.module';
import { AgentStepService } from './agent-loop/agent-step.service';
import { ActionExecutorService } from './agent-loop/action-executor.service';
import { AgentLoopService } from './agent-loop/agent-loop.service';

@Module({
  imports: [PromptsModule, LlmModule, ToolsModule, EventsModule, ConversationModule, ResolverModule],
  providers: [ExecutionService, PlannerService, AgentStepService, ActionExecutorService, AgentLoopService],
  exports: [ExecutionService, AgentLoopService],
})
export class RuntimeModule {}
