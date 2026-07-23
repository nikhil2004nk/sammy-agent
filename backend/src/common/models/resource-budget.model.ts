export interface ResourceBudget {
  tokenBudget?: number;
  costBudget?: number; // In cents/credits
  executionTimeoutMs?: number;
  maxConcurrency?: number;
  maxDelegationDepth?: number;
  maxRetries?: number;
  
  // Extra protections
  maxToolCalls?: number;
  maxExecutionNodes?: number;
  
  // Workflow specifics
  workflowTimeoutMs?: number;
  branchConcurrency?: number;
}
