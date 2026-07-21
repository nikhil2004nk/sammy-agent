// -------------------------------------------------------
// Workflow Types — graph-based model
// v1: linear execution only; model supports branching for future
// -------------------------------------------------------

export type WorkflowStepType = 'tool' | 'agent' | 'approval' | 'conditional';

export interface WorkflowNode {
  id: string;
  type: WorkflowStepType;
  label: string;
  config: ToolStepConfig | AgentStepConfig | ApprovalStepConfig | ConditionalStepConfig;
}

export interface WorkflowEdge {
  from: string;       // node ID
  to: string;         // node ID
  condition?: string; // expression evaluated against previous output (e.g., "output.status === 'success'")
}

export interface WorkflowGraph {
  startNodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// Step configs per type
export interface ToolStepConfig {
  toolName: string;
  args: Record<string, unknown>;
}

export interface AgentStepConfig {
  goal: string;
  agentId?: string;
}

export interface ApprovalStepConfig {
  message: string;
}

export interface ConditionalStepConfig {
  expression: string; // evaluated as JS expression against run context
}

// Runtime result for each step
export interface WorkflowStepResult {
  nodeId: string;
  success: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface WorkflowRunResult {
  workflowId: string;
  runId: string;
  success: boolean;
  steps: WorkflowStepResult[];
  error?: string;
}
