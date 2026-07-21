import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowController } from './workflow.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowRunnerService],
  exports: [WorkflowService, WorkflowRunnerService],
})
export class WorkflowsModule {}
