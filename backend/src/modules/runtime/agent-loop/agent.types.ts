export type AgentActionType = 'tool_call' | 'respond' | 'finish' | 'human_approval' | 'cancel';

export interface BaseAgentAction {
  type: AgentActionType;
}

export interface ToolCallAction extends BaseAgentAction {
  type: 'tool_call';
  toolCalls: {
    id: string;
    name: string;
    arguments: Record<string, any>;
  }[];
}

export interface RespondAction extends BaseAgentAction {
  type: 'respond';
  content: string;
}

export interface FinishAction extends BaseAgentAction {
  type: 'finish';
  content: string;
}

export interface HumanApprovalAction extends BaseAgentAction {
  type: 'human_approval';
  context: string;
}

export interface CancelAction extends BaseAgentAction {
  type: 'cancel';
  reason: string;
}

export type AgentAction = ToolCallAction | RespondAction | FinishAction | HumanApprovalAction | CancelAction;

export type LoopTerminationReason = 'Completed' | 'MaxStepsReached' | 'ToolFailure' | 'Cancelled' | 'HumanApprovalRequired' | 'PlannerRequired';

export interface DelegationResult {
  success: boolean;
  agentId: string;
  runId: string;
  status: 'COMPLETED' | 'FAILED' | 'REQUIRES_APPROVAL';
  output?: string;
  errors?: string[];
}
