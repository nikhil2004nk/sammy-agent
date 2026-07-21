import { Controller, Get, Post, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../workspaces/guards/workspace.guard';

@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller()
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('workspaces/:workspaceId/approvals')
  async getWorkspaceApprovals(@Headers('x-workspace-id') workspaceId: string) {
    const approvals = await this.approvalService.getForWorkspace(workspaceId);
    return approvals.map(a => ({
      id: a.id,
      runId: a.runId,
      tool: a.toolName,
      arguments: a.args,
      status: a.status === 'PENDING' ? 'Pending' : a.status === 'APPROVED' ? 'Approved' : 'Rejected',
      createdAt: a.createdAt.getTime(),
      decidedAt: a.decidedAt?.getTime(),
      deciderNote: a.deciderNote,
    }));
  }

  @Post('approvals/:approvalId/approve')
  async approve(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('approvalId') approvalId: string, 
    @Body() body: { reason?: string }
  ) {
    await this.approvalService.verifyWorkspace(workspaceId, approvalId);
    await this.approvalService.approve(approvalId, body.reason);
    return { success: true };
  }

  @Post('approvals/:approvalId/reject')
  async reject(
    @Headers('x-workspace-id') workspaceId: string,
    @Param('approvalId') approvalId: string, 
    @Body() body: { reason?: string }
  ) {
    await this.approvalService.verifyWorkspace(workspaceId, approvalId);
    await this.approvalService.reject(approvalId, body.reason);
    return { success: true };
  }
}
