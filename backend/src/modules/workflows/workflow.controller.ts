import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowGraph } from './workflow.types';
import { ExecutionContext } from '../../common/execution-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import * as crypto from 'crypto';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowRunner: WorkflowRunnerService,
  ) {}

  @Get()
  async list(@Param('workspaceId') workspaceId: string) {
    return this.workflowService.findAll(workspaceId);
  }

  @Post()
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { name: string; description?: string; graph: WorkflowGraph }
  ) {
    return this.workflowService.create(workspaceId, body.name, body.description, body.graph);
  }

  @Get(':workflowId')
  async getOne(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string
  ) {
    return this.workflowService.findOne(workspaceId, workflowId);
  }

  @Patch(':workflowId/activate')
  async activate(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string
  ) {
    return this.workflowService.activate(workspaceId, workflowId);
  }

  @Patch(':workflowId/archive')
  async archive(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string
  ) {
    return this.workflowService.archive(workspaceId, workflowId);
  }

  @Post(':workflowId/run')
  async run(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string,
    @Body() body?: { agentId?: string }
  ) {
    const context: ExecutionContext = {
      runId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      workspaceId,
      agentId: body?.agentId || 'workflow-runner',
    };
    return this.workflowRunner.run(workflowId, context);
  }
}
