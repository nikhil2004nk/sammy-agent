import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';
import { AgentLoopService } from '../runtime/agent-loop/agent-loop.service';
import { ScheduledJobConfig } from './scheduler.types';
import { DEFAULT_MAX_DELEGATION_DEPTH } from '../../common/execution-context';
import * as crypto from 'crypto';

/**
 * SchedulerService
 *
 * Manages cron-based scheduled agent runs.
 *
 * Critical rule: Scheduler ALWAYS triggers AgentLoopService.runLoop().
 * It NEVER calls the Planner directly. This ensures scheduled executions
 * behave identically to user-triggered ones — same memory, same tools, same approvals.
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly agentLoop: AgentLoopService,
  ) {}

  async create(config: ScheduledJobConfig): Promise<string> {
    const job = await this.prisma.scheduledJob.create({
      data: {
        workspaceId: config.workspaceId,
        agentId: config.agentId,
        name: config.name,
        cronExpr: config.cronExpr,
        goal: config.goal,
        enabled: config.enabled ?? true,
      }
    });

    if (job.enabled) {
      this.registerCronJob(job.id, config);
    }

    this.logger.log(`Created scheduled job '${job.name}' [${job.id}] with cron '${config.cronExpr}'`);
    return job.id;
  }

  async disable(jobId: string): Promise<void> {
    await this.prisma.scheduledJob.update({ where: { id: jobId }, data: { enabled: false } });
    try {
      this.schedulerRegistry.deleteCronJob(jobId);
    } catch {
      // Job may not be registered if service restarted
    }
    this.logger.log(`Disabled scheduled job '${jobId}'`);
  }

  async enable(jobId: string): Promise<void> {
    const job = await this.prisma.scheduledJob.update({ where: { id: jobId }, data: { enabled: true } });
    try {
      // If it exists in registry already, do nothing or delete it first
      try {
        this.schedulerRegistry.deleteCronJob(jobId);
      } catch {}
      this.registerCronJob(job.id, {
        workspaceId: job.workspaceId,
        agentId: job.agentId || undefined,
        name: job.name,
        cronExpr: job.cronExpr,
        goal: job.goal,
        enabled: true
      });
    } catch (e) {
      this.logger.error(`Failed to register cron job upon enable for '${jobId}'`, e);
    }
    this.logger.log(`Enabled scheduled job '${jobId}'`);
  }

  async listForWorkspace(workspaceId: string) {
    return this.prisma.scheduledJob.findMany({ where: { workspaceId } });
  }

  private registerCronJob(jobId: string, config: ScheduledJobConfig): void {
    const job = new CronJob(config.cronExpr, async () => {
      this.logger.log(`[Scheduler] Firing job '${config.name}' [${jobId}]`);
      await this.fireJob(jobId, config);
    });

    this.schedulerRegistry.addCronJob(jobId, job);
    job.start();
    this.logger.debug(`Registered cron job '${config.name}' with expression '${config.cronExpr}'`);
  }

  private async fireJob(jobId: string, config: ScheduledJobConfig): Promise<void> {
    try {
      await this.prisma.scheduledJob.update({
        where: { id: jobId },
        data: { lastRunAt: new Date() }
      });

      // Build a synthetic conversationId for this scheduled run
      // In production, the scheduler could create a dedicated conversation in the DB
      const conversationId = `scheduled-${jobId}-${Date.now()}`;
      const runId = crypto.randomUUID();
      const traceId = crypto.randomUUID();

      // Scheduler → AgentLoopService (never directly to Planner)
      await this.agentLoop.runLoop(
        {
          runId,
          traceId,
          workspaceId: config.workspaceId,
          agentId: config.agentId || 'scheduler',
          delegationDepth: 0,
          maxDelegationDepth: DEFAULT_MAX_DELEGATION_DEPTH,
        },
        conversationId,
        config.goal,
      );
    } catch (err) {
      this.logger.error(`Scheduled job '${jobId}' failed`, err);
    }
  }
}
