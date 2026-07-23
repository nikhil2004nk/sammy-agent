export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  tools: string[];
  permissions: string[];
  systemPrompt: string;
}
