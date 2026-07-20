export type ExecutionStatus = 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';

export type ExecutionNodeType = 'reasoning' | 'tool' | 'planner' | 'approval' | 'workflow' | 'reflection' | 'agent' | 'event';

export interface ExecutionNode {
  id: string;
  runId: string;
  type: ExecutionNodeType;
  status: ExecutionStatus;
  
  // Optional name for identifying the specific tool, agent, etc.
  name?: string;
  
  // Future-proofing: which agent executed this node
  agentName?: string;
  
  // Core data payload
  content?: string; // For text/reasoning
  arguments?: unknown; // JSON args for tools
  result?: unknown; // JSON output from tools or planners
  
  // Timing
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;

  // Tree structuring (for future complex workflows)
  parentId?: string;
}

export interface Run {
  id: string;
  conversationId: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  totalTools: number;
  nodes: ExecutionNode[]; // Tree of execution nodes
}
