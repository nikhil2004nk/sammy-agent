import { Module } from '@nestjs/common';
import { ExecutionService } from './execution/execution.service';
import { PlannerService } from './planner/planner.service';
import { PromptsModule } from '../prompts/prompts.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [PromptsModule, LlmModule],
  providers: [ExecutionService, PlannerService],
  exports: [ExecutionService],
})
export class RuntimeModule {}
