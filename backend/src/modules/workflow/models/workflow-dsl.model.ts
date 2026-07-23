export interface WorkflowNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
