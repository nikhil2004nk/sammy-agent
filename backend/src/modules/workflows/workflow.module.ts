import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolsModule } from '../tools/tools.module';
import { WorkflowCompilerService } from '../workflow/workflow-compiler.service';
import { RuntimeModule } from '../runtime/runtime.module';

@Module({
  imports: [PrismaModule, ToolsModule, RuntimeModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowService, 
    WorkflowCompilerService
  ],
  exports: [WorkflowService],
})
export class WorkflowsModule {}
