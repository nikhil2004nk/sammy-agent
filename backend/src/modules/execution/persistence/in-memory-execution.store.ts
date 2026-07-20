import { Injectable } from '@nestjs/common';
import { IExecutionStore } from './execution-store.interface';
import { Run, ExecutionNode } from '../execution.types';

@Injectable()
export class InMemoryExecutionStore implements IExecutionStore {
  private runs = new Map<string, Run>();
  private nodes = new Map<string, ExecutionNode>();

  async createRun(run: Run): Promise<void> {
    this.runs.set(run.id, run);
  }

  async updateRun(runId: string, updates: Partial<Run>): Promise<void> {
    const existing = this.runs.get(runId);
    if (existing) {
      this.runs.set(runId, { ...existing, ...updates, version: existing.version + 1 });
    }
  }

  async getRun(runId: string): Promise<Run | null> {
    return this.runs.get(runId) || null;
  }

  async getRunsByConversationId(conversationId: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter(r => r.conversationId === conversationId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createNode(node: ExecutionNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  async updateNode(nodeId: string, updates: Partial<ExecutionNode>): Promise<void> {
    const existing = this.nodes.get(nodeId);
    if (existing) {
      this.nodes.set(nodeId, { ...existing, ...updates });
    }
  }

  async getNode(nodeId: string): Promise<ExecutionNode | null> {
    return this.nodes.get(nodeId) || null;
  }

  async getNodesByRunId(runId: string): Promise<ExecutionNode[]> {
    return Array.from(this.nodes.values()).filter(n => n.runId === runId).sort((a, b) => a.startedAt - b.startedAt);
  }
}
