export interface AgentPolicies {
  canUseInternet: boolean;
  canModifyFiles: boolean;
  canCallLlm: boolean;
  requiresApproval: boolean;
  memoryAccess: 'NONE' | 'READ_ONLY' | 'READ_WRITE';
  toolRestrictions: string[]; // List of tool keys or prefixes this agent is restricted to (or excluded from, depending on enforcement logic)
}
