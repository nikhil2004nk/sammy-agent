import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

export class ApprovalTimeoutError extends Error {
  constructor(runId: string, toolName: string) {
    super(`Approval for tool '${toolName}' in run '${runId}' timed out.`);
    this.name = 'ApprovalTimeoutError';
  }
}

export class ApprovalRejectedError extends Error {
  constructor(toolName: string, note?: string) {
    super(`Approval rejected for tool '${toolName}'${note ? ': ' + note : ''}`);
    this.name = 'ApprovalRejectedError';
  }
}

/**
 * ApprovalService
 *
 * Replaces ApprovalMiddleware with a persistent, resumable approval mechanism.
 *
 * When a tool requires human approval:
 * 1. An ApprovalRequest is saved to the DB with status=PENDING.
 * 2. The caller awaits waitForDecision() — polling the DB with backoff.
 * 3. A user calls approve() or reject() via the REST API.
 * 4. waitForDecision() resolves or throws accordingly.
 *
 * This survives server restarts because state lives in the DB, not in-memory.
 */
@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);
  private readonly POLL_INTERVAL_MS = 3000;
  private readonly TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes default

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(runId: string, toolName: string, args: Record<string, unknown>): Promise<string> {
    const request = await this.prisma.approvalRequest.create({
      data: { runId, toolName, args: args as any, status: ApprovalStatus.PENDING }
    });
    this.logger.log(`Approval request created [${request.id}] for tool '${toolName}' in run '${runId}'`);
    return request.id;
  }

  async approve(approvalId: string, note?: string): Promise<void> {
    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: { status: ApprovalStatus.APPROVED, decidedAt: new Date(), deciderNote: note }
    });
    this.logger.log(`Approval [${approvalId}] APPROVED`);
  }

  async reject(approvalId: string, note?: string): Promise<void> {
    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: { status: ApprovalStatus.REJECTED, decidedAt: new Date(), deciderNote: note }
    });
    this.logger.log(`Approval [${approvalId}] REJECTED`);
  }

  async getPendingForRun(runId: string) {
    return this.prisma.approvalRequest.findFirst({
      where: { runId, status: ApprovalStatus.PENDING },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Poll the DB until the approval is decided or we time out.
   * The calling code (agent loop) awaits this — the run is effectively paused.
   */
  async waitForDecision(approvalId: string, timeoutMs = this.TIMEOUT_MS): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    this.logger.debug(`Waiting for approval decision [${approvalId}]...`);

    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, this.POLL_INTERVAL_MS));

      const request = await this.prisma.approvalRequest.findUnique({ where: { id: approvalId } });
      if (!request) throw new Error(`Approval request [${approvalId}] not found`);

      if (request.status === ApprovalStatus.APPROVED) {
        this.logger.log(`Approval [${approvalId}] resolved — APPROVED`);
        return;
      }

      if (request.status === ApprovalStatus.REJECTED) {
        throw new ApprovalRejectedError(request.toolName, request.deciderNote ?? undefined);
      }
    }

    throw new ApprovalTimeoutError(approvalId, 'unknown');
  }
}
