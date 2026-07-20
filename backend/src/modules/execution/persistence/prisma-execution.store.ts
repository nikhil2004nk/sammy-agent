import { Injectable } from '@nestjs/common';
import { IExecutionStore } from './execution-store.interface';
import { PrismaService } from '../../database/prisma.service';
import { Run, ExecutionNode } from '../execution.types';

@Injectable()
export class PrismaExecutionStore implements IExecutionStore {
  constructor(private readonly prisma: PrismaService) {}

  async createRun(run: Run): Promise<void> {
    await this.prisma.run.create({
      data: {
        id: run.id,
        conversationId: run.conversationId,
        status: run.status,
        createdAt: new Date(run.createdAt),
        endedAt: run.endedAt ? new Date(run.endedAt) : null,
        terminationReason: run.terminationReason,
        metadata: run.metadata || {},
        version: run.version,
      },
    });
  }

  async updateRun(runId: string, updates: Partial<Run>): Promise<void> {
    const data: any = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.endedAt !== undefined) data.endedAt = updates.endedAt ? new Date(updates.endedAt) : null;
    if (updates.terminationReason !== undefined) data.terminationReason = updates.terminationReason;
    if (updates.metadata !== undefined) data.metadata = updates.metadata;
    if (updates.version !== undefined) data.version = updates.version;

    await this.prisma.run.update({
      where: { id: runId },
      data,
    });
  }

  async getRun(runId: string): Promise<Run | null> {
    const run = await this.prisma.run.findUnique({ where: { id: runId } });
    if (!run) return null;
    return {
      id: run.id,
      conversationId: run.conversationId,
      status: run.status as any,
      createdAt: run.createdAt.getTime(),
      endedAt: run.endedAt ? run.endedAt.getTime() : undefined,
      terminationReason: run.terminationReason || undefined,
      metadata: (run.metadata as Record<string, any>) || undefined,
      version: run.version,
    };
  }

  async getRunsByConversationId(conversationId: string): Promise<Run[]> {
    const runs = await this.prisma.run.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
    return runs.map((run: any) => ({
      id: run.id,
      conversationId: run.conversationId,
      status: run.status as any,
      createdAt: run.createdAt.getTime(),
      endedAt: run.endedAt ? run.endedAt.getTime() : undefined,
      terminationReason: run.terminationReason || undefined,
      metadata: (run.metadata as Record<string, any>) || undefined,
      version: run.version,
    }));
  }

  async createNode(node: ExecutionNode): Promise<void> {
    await this.prisma.executionNode.create({
      data: {
        id: node.id,
        runId: node.runId,
        parentNodeId: node.parentId,
        sequence: 0, // In future, pass this from node
        type: node.type,
        status: node.status,
        title: node.title,
        summary: node.payload?.summary || null,
        referenceType: node.referenceType || null,
        referenceId: node.referenceId || null,
        startedAt: new Date(node.startedAt),
        finishedAt: node.finishedAt ? new Date(node.finishedAt) : null,
        durationMs: node.duration,
      }
    });
  }

  async updateNode(nodeId: string, updates: Partial<ExecutionNode>): Promise<void> {
    const data: any = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.finishedAt !== undefined) data.finishedAt = updates.finishedAt ? new Date(updates.finishedAt) : null;
    if (updates.duration !== undefined) data.durationMs = updates.duration;
    if (updates.payload?.summary) data.summary = updates.payload.summary;

    await this.prisma.executionNode.update({
      where: { id: nodeId },
      data,
    });
  }

  async getNode(nodeId: string): Promise<ExecutionNode | null> {
    const n = await this.prisma.executionNode.findUnique({ where: { id: nodeId } });
    if (!n) return null;
    return {
      id: n.id,
      runId: n.runId,
      parentId: n.parentNodeId || undefined,
      type: n.type as any,
      status: n.status as any,
      title: n.title || '',
      payload: { summary: n.summary },
      startedAt: n.startedAt ? n.startedAt.getTime() : 0,
      finishedAt: n.finishedAt ? n.finishedAt.getTime() : undefined,
      duration: n.durationMs || undefined,
    };
  }

  async getNodesByRunId(runId: string): Promise<ExecutionNode[]> {
    const nodes = await this.prisma.executionNode.findMany({
      where: { runId },
      orderBy: { startedAt: 'asc' },
    });
    return nodes.map((n: any) => ({
      id: n.id,
      runId: n.runId,
      parentId: n.parentNodeId || undefined,
      type: n.type as any,
      status: n.status as any,
      title: n.title || '',
      payload: { summary: n.summary },
      startedAt: n.startedAt ? n.startedAt.getTime() : 0,
      finishedAt: n.finishedAt ? n.finishedAt.getTime() : undefined,
      duration: n.durationMs || undefined,
    }));
  }
}
