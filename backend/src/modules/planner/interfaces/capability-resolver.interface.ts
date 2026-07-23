export interface AgentIdentity {
  id: string;
  name: string;
  capabilities: string[];
}

export interface ICapabilityResolver {
  resolve(requiredCapabilities: string[]): Promise<AgentIdentity[]>;
}
