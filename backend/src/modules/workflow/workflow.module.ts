import { Module } from '@nestjs/common';
import { SimpleConditionEvaluator } from './evaluators/condition-evaluator.service';
import { WorkflowCompilerService } from './workflow-compiler.service';

@Module({
  providers: [
    SimpleConditionEvaluator,
    WorkflowCompilerService
  ],
  exports: [
    SimpleConditionEvaluator,
    WorkflowCompilerService
  ]
})
export class WorkflowModule {}
