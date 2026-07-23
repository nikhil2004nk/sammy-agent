import { ExecutionContext } from '../../../common/execution-context';

export interface DelegationContract {
  /**
   * The overarching goal that the delegating agent wants accomplished.
   */
  goal: string;

  /**
   * Complete execution context of the delegating agent.
   */
  executionContext: ExecutionContext;

  /**
   * A snapshot of the memory or relevant files provided to the delegate.
   */
  memorySnapshot?: string;

  /**
   * Strict rules the delegate must follow (e.g., 'Do not modify package.json').
   */
  constraints: string[];

  /**
   * Token or cost budget allocated for this delegation.
   */
  budget?: {
    maxTokens?: number;
    maxCostCents?: number;
  };

  /**
   * Specific permissions granted for this execution (e.g., 'read:files', 'write:files').
   */
  permissions: string[];

  /**
   * Specifies how much memory context the delegate is allowed to access.
   */
  memoryAccess: 'NONE' | 'READ_ONLY' | 'READ_WRITE';

  /**
   * A clear definition of what constitutes a successful completion of the goal.
   */
  expectedOutput: string;

  /**
   * Maximum time in milliseconds before the delegation is aborted.
   */
  timeoutMs?: number;

  /**
   * The execution priority for scheduling.
   */
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

  /**
   * Policy for handling failures.
   */
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}
