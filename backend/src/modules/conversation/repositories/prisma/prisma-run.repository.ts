import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IRunRepository } from '../interfaces';
import { Run } from '../../conversation.types';
import { RunStatus } from '@prisma/client';

@Injectable()
export class PrismaRunRepository implements IRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async startRun(conversationId: string, metadata?: Record<string, any>): Promise<Run> {
    const run = await this.prisma.run.create({
      data: {
        conversationId,
        status: RunStatus.RUNNING,
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
