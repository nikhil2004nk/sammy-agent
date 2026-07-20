import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IRunRepository } from '../interfaces';
import { Run, RunStatus } from '../../conversation.types';
import { ExecutionContext } from '../../../../common/execution-context';
// Removed EventType import

@Injectable()
export class PrismaRunRepository implements IRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async startRun(conversationId: string, metadata?: Record<string, any>): Promise<Run> {
    const run = await this.prisma.run.create({
      data: {
        conversationId,
        status: 'running',
        metadata: metadata || {},
      },
    });

    return this.mapToDomain(run);
  }

  async getRun(id: string): Promise<Run | null> {
    const run = await this.prisma.run.findUnique({
      where: { id },
    });
    return run ? this.mapToDomain(run) : null;
  }

  async finishRun(id: string, status: RunStatus, terminationReason?: string, tokenUsage?: number, expectedVersion?: number): Promise<Run> {
    const data: any = {
      status,
      endedAt: new Date(),
    };

    if (terminationReason) data.terminationReason = terminationReason;
    if (tokenUsage !== undefined) data.tokenUsage = tokenUsage;
    data.version = { increment: 1 };

    // Optimistic locking
    const run = await this.prisma.run.update({
      where: { 
        id,
        ...(expectedVersion ? { version: expectedVersion } : {}) 
      },
      data,
    });

    return this.mapToDomain(run);
  }

  async recordReasoningStep(
    runId: string,
    stepIndex: number,
    toolExecutions: Array<{
      toolName: string;
      argumentsJson: any;
      resultJson: any;
      success: boolean;
      durationMs?: number;
      error?: string;
    }>
  ): Promise<void> {
    // Atomic unit of work
    await this.prisma.$transaction(async (tx) => {
      const step = await tx.reasoningStep.create({
        data: {
          runId,
          stepIndex,
          status: 'completed',
          completedAt: new Date(),
        }
      });

      if (toolExecutions.length > 0) {
        await tx.toolExecution.createMany({
          data: toolExecutions.map(te => ({
            reasoningStepId: step.id,
            toolName: te.toolName,
            arguments: te.argumentsJson,
            result: te.resultJson,
            success: te.success,
            durationMs: te.durationMs,
            error: te.error,
            completedAt: new Date(),
          }))
        });
      }
      
      // Bump run version for optimistic locking
      await tx.run.update({
        where: { id: runId },
        data: { version: { increment: 1 } },
      });
    });
  }

  async recordEvent(
    eventType: string, 
    context: ExecutionContext,
    reasoningStepId?: string,
    payload?: any
  ): Promise<void> {
    await this.prisma.event.create({
      data: {
        eventType: eventType as any,
        conversationId: context.conversationId,
        runId: context.runId,
        reasoningStepId,
        payload: payload || {},
      },
    });
  }

  private mapToDomain(prismaModel: any): Run {
    return {
      id: prismaModel.id,
      conversationId: prismaModel.conversationId,
      status: prismaModel.status as RunStatus,
      terminationReason: prismaModel.terminationReason,
      createdAt: prismaModel.createdAt.getTime(),
      endedAt: prismaModel.endedAt ? prismaModel.endedAt.getTime() : undefined,
      metadata: prismaModel.metadata,
      version: prismaModel.version,
    };
  }
}
