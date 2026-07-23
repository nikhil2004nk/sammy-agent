export type TargetType = 'AGENT' | 'MCP_SERVER' | 'WORKFLOW' | 'HUMAN';

export interface ExecutionTarget {
  id: string;
  type: TargetType;
  name: string;
  capabilities: string[];
  metadata?: any;
}

export interface ICapabilityResolver {
  resolve(requiredCapabilities: string[]): Promise<ExecutionTarget[]>;
}
