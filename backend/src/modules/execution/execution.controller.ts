import { Controller, Get, Post, Param, Body, Sse, MessageEvent, UseGuards, Headers, Req } from '@nestjs/common';
import { ExecutionTrackerService } from './execution-tracker.service';
import { ExecutionStreamService } from './execution-stream.service';
import { RunDto } from './dto/run.dto';
import { RunStatus } from './execution.types';
import * as crypto from 'crypto';
import { Observable, map } from 'rxjs';
import { ApprovalService } from '../tools/approval/approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { ConversationService } from '../conversation/conversation.service';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class ExecutionController {
  constructor(
    private readonly executionTracker: ExecutionTrackerService,
    private readonly streamService: ExecutionStreamService,
    private readonly approvalService: ApprovalService,
    private readonly conversationService: ConversationService,
  ) {}

  @Get('conversations/:conversationId/executions')
  async getRuns(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('conversationId') conversationId: string
  ): Promise<RunDto[]> {
    await this.conversationService.getConversation(workspaceId, conversationId);
    const runs = await this.executionTracker.getRunsForConversation(conversationId);
    return runs.map(run => ({
      id: run.id,
      status: run.status,
      startedAt: run.createdAt,
      finishedAt: run.endedAt,
      duration: run.endedAt ? run.endedAt - run.createdAt : undefined,
      nodes: [], // List endpoint does not include nodes
    }));
  }

  @Get('workspaces/:workspaceId/executions')
  async getWorkspaceRuns(@Param('workspaceId') workspaceId: string): Promise<RunDto[]> {
    const runs = await this.executionTracker.getRunsForWorkspace(workspaceId);
    return runs.map(run => ({
      id: run.id,
      status: run.status,
      startedAt: run.createdAt,
      finishedAt: run.endedAt,
      duration: run.endedAt ? run.endedAt - run.createdAt : undefined,
      nodes: [], 
    }));
  }

  @Get('executions/:executionId')
  async getRunDetails(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('executionId') executionId: string
  ): Promise<RunDto> {
    const run = await this.executionTracker.getRunWithNodes(executionId);
    await this.conversationService.getConversation(workspaceId, run.conversationId);
    return {
      id: run.id,
      status: run.status,
      startedAt: run.createdAt,
      finishedAt: run.endedAt,
      duration: run.endedAt ? run.endedAt - run.createdAt : undefined,
      nodes: run.nodes.map(node => ({
        id: node.id,
        type: node.type,
        status: node.status,
        title: node.title,
        summary: node.payload?.summary,
        startedAt: node.startedAt,
        finishedAt: node.finishedAt,
        duration: node.duration,
        payload: node.payload,
      })),
    };
  }

  @Post('conversations/:conversationId/executions')
  async createRun(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('conversationId') conversationId: string
  ): Promise<RunDto> {
    await this.conversationService.getConversation(workspaceId, conversationId);
    const runId = crypto.randomUUID();
    const run = await this.executionTracker.createRun(runId, conversationId);
    return {
      id: run.id,
      status: run.status,
      startedAt: run.createdAt,
      finishedAt: run.endedAt,
      duration: undefined,
      nodes: [],
    };
  }

  @Sse('executions/:executionId/stream')
  async streamRun(
    @Req() req: any,
    @Param('executionId') executionId: string
  ): Promise<Observable<MessageEvent>> {
    const workspaceId = req.workspaceId;
    const run = await this.executionTracker.getRunWithNodes(executionId);
    await this.conversationService.getConversation(workspaceId, run.conversationId);
    return this.streamService.subscribeToRun(executionId).pipe(
      map(event => ({
        data: event as any, // NestJS maps this to JSON string
      }))
    );
  }

  @Post('executions/:executionId/cancel')
  async cancelExecution(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('executionId') executionId: string
  ) {
    const run = await this.executionTracker.getRunWithNodes(executionId);
    await this.conversationService.getConversation(workspaceId, run.conversationId);
    await this.executionTracker.updateRunStatus(executionId, RunStatus.CANCELLED, 'Cancelled by user');
    return { success: true, message: 'Execution cancelled' };
  }

  @Post('executions/:executionId/retry')
  async retryExecution(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('executionId') executionId: string
  ) {
    const run = await this.executionTracker.getRunWithNodes(executionId);
    await this.conversationService.getConversation(workspaceId, run.conversationId);
    await this.executionTracker.updateRunStatus(executionId, RunStatus.QUEUED, 'Retried by user');
    return { success: true, message: 'Execution retry queued' };
  }
}
