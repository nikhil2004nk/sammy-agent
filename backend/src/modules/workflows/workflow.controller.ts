import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowGraph } from './workflow.types';
import { ExecutionContext } from '../../common/execution-context';
import * as crypto from 'crypto';

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
  async getOne(@Param('workflowId') workflowId: string) {
    return this.workflowService.findOne(workflowId);
  }

  @Patch(':workflowId/activate')
  async activate(@Param('workflowId') workflowId: string) {
    return this.workflowService.activate(workflowId);
  }

  @Patch(':workflowId/archive')
  async archive(@Param('workflowId') workflowId: string) {
    return this.workflowService.archive(workflowId);
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
