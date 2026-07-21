import { Run, ExecutionNode } from '../execution.types';

export interface IExecutionStore {
  createRun(run: Run): Promise<void>;
  updateRun(runId: string, updates: Partial<Run>): Promise<void>;
  getRun(runId: string): Promise<Run | null>;
  getRunsByConversationId(conversationId: string): Promise<Run[]>;
  getRunsByWorkspaceId(workspaceId: string): Promise<Run[]>;

  createNode(node: ExecutionNode): Promise<void>;
  updateNode(nodeId: string, updates: Partial<ExecutionNode>): Promise<void>;
  getNode(nodeId: string): Promise<ExecutionNode | null>;
  getNodesByRunId(runId: string): Promise<ExecutionNode[]>;
}

export const IExecutionStoreToken = Symbol('IExecutionStore');
