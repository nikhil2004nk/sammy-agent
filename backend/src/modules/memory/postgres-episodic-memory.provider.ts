import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IMemoryProvider, MemoryEntry, MemoryQuery } from './memory.types';

/**
 * PostgresEpisodicMemoryProvider
 *
 * Stores and retrieves episodic memories from the EpisodicMemory Prisma table.
 * Episodic memories are short summaries of past runs/events stored per workspace.
 */
@Injectable()
export class PostgresEpisodicMemoryProvider implements IMemoryProvider {
  private readonly logger = new Logger(PostgresEpisodicMemoryProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async recall(query: MemoryQuery): Promise<MemoryEntry[]> {
    const limit = query.limit ?? 10;
    const records = await this.prisma.episodicMemory.findMany({
      where: {
        workspaceId: query.workspaceId,
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.agentId ? { agentId: query.agentId } : {}),
      },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return records.map(r => ({
      id: r.id,
      workspaceId: r.workspaceId,
      userId: r.userId ?? undefined,
      agentId: r.agentId ?? undefined,
      runId: r.runId ?? undefined,
      summary: r.summary,
      importance: r.importance,
      createdAt: r.createdAt,
    }));
  }

  async remember(entry: Omit<MemoryEntry, 'id' | 'createdAt'>): Promise<MemoryEntry> {
    const record = await this.prisma.episodicMemory.create({
      data: {
        workspaceId: entry.workspaceId,
        userId: entry.userId,
        agentId: entry.agentId,
        runId: entry.runId,
        summary: entry.summary,
        importance: entry.importance,
      }
    });

    this.logger.debug(`Stored episodic memory for workspace '${entry.workspaceId}'`);
    return {
      id: record.id,
      workspaceId: record.workspaceId,
      userId: record.userId ?? undefined,
      agentId: record.agentId ?? undefined,
      runId: record.runId ?? undefined,
      summary: record.summary,
      importance: record.importance,
      createdAt: record.createdAt,
    };
  }

  async forget(entryId: string): Promise<void> {
    await this.prisma.episodicMemory.delete({ where: { id: entryId } });
  }
}
