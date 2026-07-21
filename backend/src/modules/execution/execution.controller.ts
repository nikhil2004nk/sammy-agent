import { Controller, Get, Post, Param, Body, Sse, MessageEvent } from '@nestjs/common';
import { ExecutionTrackerService } from './execution-tracker.service';
import { ExecutionStreamService } from './execution-stream.service';
import { RunDto } from './dto/run.dto';
import * as crypto from 'crypto';
import { Observable, map } from 'rxjs';
import { ApprovalService } from '../tools/approval/approval.service';

@Controller()
export class ExecutionController {
  constructor(
    private readonly executionTracker: ExecutionTrackerService,
    private readonly streamService: ExecutionStreamService,
    private readonly approvalService: ApprovalService,
  ) {}

  @Get('conversations/:conversationId/runs')
  async getRuns(@Param('conversationId') conversationId: string): Promise<RunDto[]> {
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

  @Get('runs/:runId')
  async getRunDetails(@Param('runId') runId: string): Promise<RunDto> {
    const run = await this.executionTracker.getRunWithNodes(runId);
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

  @Post('conversations/:conversationId/runs')
  async createRun(@Param('conversationId') conversationId: string): Promise<RunDto> {
    // For now, this just creates a tracking entry. In a real flow, this might also trigger the agent loop.
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

  @Sse('runs/:runId/stream')
  streamRun(@Param('runId') runId: string): Observable<MessageEvent> {
    return this.streamService.subscribeToRun(runId).pipe(
      map(event => ({
        data: event as any, // NestJS maps this to JSON string
      }))
    );
  }

  /**
   * Approve a pending tool execution for a run.
   * The agent loop is polling the DB — this update will unblock it.
   */
  @Post('runs/:runId/approve')
  async approveRun(
    @Param('runId') runId: string,
    @Body() body: { approvalId: string; note?: string }
  ) {
    await this.approvalService.approve(body.approvalId, body.note);
    return { success: true, message: 'Approved' };
  }

  /**
   * Reject a pending tool execution for a run.
   */
  @Post('runs/:runId/reject')
  async rejectRun(
    @Param('runId') runId: string,
    @Body() body: { approvalId: string; note?: string }
  ) {
    await this.approvalService.reject(body.approvalId, body.note);
    return { success: true, message: 'Rejected' };
  }

  /**
   * Get pending approvals for a run.
   */
  @Get('runs/:runId/pending-approvals')
  async getPendingApproval(@Param('runId') runId: string) {
    const pending = await this.approvalService.getPendingForRun(runId);
    return pending ?? { message: 'No pending approvals' };
  }
}
