import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IExecutionStoreToken } from './persistence/execution-store.interface';
import type { IExecutionStore } from './persistence/execution-store.interface';
import { Run, RunStatus, ExecutionNode, ExecutionNodeType, ExecutionNodeStatus, RunWithNodes } from './execution.types';
import * as crypto from 'crypto';
import { ExecutionStreamService } from './execution-stream.service';

@Injectable()
export class ExecutionTrackerService {
  constructor(
    @Inject(IExecutionStoreToken)
    private readonly store: IExecutionStore,
    private readonly stream: ExecutionStreamService,
  ) {}

  async createRun(runId: string, conversationId: string, metadata?: Record<string, any>): Promise<Run> {
    const run: Run = {
      id: runId,
      conversationId,
      status: RunStatus.QUEUED,
      createdAt: Date.now(),
      metadata,
      version: 1,
    };
    await this.store.createRun(run);

    this.stream.publish(runId, 'run.started', { conversationId });

    return run;
  }

  async updateRunStatus(runId: string, status: RunStatus, terminationReason?: string): Promise<void> {
    const updates: Partial<Run> = { status };
    if (status === RunStatus.COMPLETED || status === RunStatus.FAILED || status === RunStatus.CANCELLED) {
      updates.endedAt = Date.now();
      const run = await this.store.getRun(runId);
      if (run) {
        updates.durationMs = updates.endedAt - run.createdAt;
      }
    }
    if (terminationReason) {
      updates.terminationReason = terminationReason;
    }
    await this.store.updateRun(runId, updates);

    // Emit event
    if (status === RunStatus.COMPLETED) {
      this.stream.publish(runId, 'run.completed', {
        durationMs: updates.durationMs,
        terminationReason,
      });
    } else if (status === RunStatus.FAILED || status === RunStatus.CANCELLED) {
      this.stream.publish(runId, 'run.failed', {
        durationMs: updates.durationMs,
        error: terminationReason,
        terminationReason,
      });
    } else {
      const updatedRun = await this.store.getRun(runId);
      this.stream.publish(runId, 'run.updated', {
        status,
        toolCount: updatedRun?.toolCount,
        reasoningCount: updatedRun?.reasoningCount,
      });
    }
  }

  async getRunsForConversation(conversationId: string): Promise<Run[]> {
    return this.store.getRunsByConversationId(conversationId);
  }

  async getRunWithNodes(runId: string): Promise<RunWithNodes> {
    const run = await this.store.getRun(runId);
    if (!run) throw new NotFoundException(`Run ${runId} not found`);
    const nodes = await this.store.getNodesByRunId(runId);
    return { ...run, nodes };
  }

  async createNode(
    runId: string, 
    type: ExecutionNodeType, 
    title: string, 
    payload?: any, 
    parentId?: string,
    agentName?: string
  ): Promise<ExecutionNode> {
    const node: ExecutionNode = {
      id: crypto.randomUUID(),
      runId,
      parentId,
      type,
      status: ExecutionNodeStatus.PENDING,
      title,
      payload,
      startedAt: Date.now(),
      agentName
    };
    await this.store.createNode(node);

    // Update aggregate metrics on Run
    const run = await this.store.getRun(runId);
    if (run) {
      if (type === ExecutionNodeType.TOOL) {
        await this.store.updateRun(runId, { toolCount: (run.toolCount || 0) + 1 });
      } else if (type === ExecutionNodeType.REASONING) {
        await this.store.updateRun(runId, { reasoningCount: (run.reasoningCount || 0) + 1 });
      }
    }

    this.stream.publish(runId, 'node.created', {
      id: node.id,
      type: node.type,
      title: node.title,
      status: node.status,
      startedAt: node.startedAt,
      payload: node.payload,
      agentName: node.agentName,
      parentId: node.parentId,
    });

    return node;
  }

  async updateNodeStatus(nodeId: string, status: ExecutionNodeStatus, payload?: any): Promise<void> {
    const updates: Partial<ExecutionNode> = { status };
    if (status === ExecutionNodeStatus.COMPLETED || status === ExecutionNodeStatus.FAILED || status === ExecutionNodeStatus.CANCELLED) {
      const node = await this.store.getNode(nodeId);
      if (node) {
        updates.finishedAt = Date.now();
        updates.duration = updates.finishedAt - node.startedAt;
      }
    }
    if (payload !== undefined) {
      updates.payload = payload;
    }
    await this.store.updateNode(nodeId, updates);

    const node = await this.store.getNode(nodeId);
    if (node) {
      this.stream.publish(node.runId, 'node.updated', {
        id: node.id,
        status: node.status,
        finishedAt: node.finishedAt,
        duration: node.duration,
        payload: node.payload,
      });
    }
  }
}
