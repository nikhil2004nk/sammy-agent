export const queryKeys = {
  // Workflows
  workflows: (workspaceId: string | null) => ['workflows', workspaceId] as const,
  workflow: (id: string) => ['workflow', id] as const,
  workflowRuns: (id: string) => ['workflow-runs', id] as const,

  // Executions
  executions: (workspaceId: string | null) => ['executions', workspaceId] as const,
  execution: (id: string) => ['execution', id] as const,
  executionLogs: (id: string) => ['execution-logs', id] as const,

  // Approvals
  approvals: (workspaceId: string | null) => ['approvals', workspaceId] as const,
  approval: (id: string) => ['approval', id] as const,

  // Conversations
  conversations: (workspaceId: string | null) => ['conversations', workspaceId] as const,
  conversation: (id: string) => ['conversation', id] as const,
  conversationMessages: (id: string) => ['conversation-messages', id] as const,

  // Scheduler
  schedules: (workspaceId: string | null) => ['schedules', workspaceId] as const,
  schedule: (id: string) => ['schedule', id] as const,

  // Workspaces
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspace', id] as const,

  // Integrations / Connections
  connections: (workspaceId: string | null) => ['connections', workspaceId] as const,
  connection: (id: string) => ['connection', id] as const,
};
