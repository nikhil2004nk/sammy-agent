export interface AgentIdentity {
  id: string;
  key: string;
  version: string;
  workspaceId?: string;
  ownerWorkspaceId?: string;
  permissions: string[];
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
}
