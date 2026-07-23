import { Injectable, Logger } from '@nestjs/common';
import { ICapabilityResolver, AgentIdentity } from './interfaces/capability-resolver.interface';
import { AgentRegistryService } from '../registry/agent-registry.service';

@Injectable()
export class CapabilityResolverService implements ICapabilityResolver {
  private readonly logger = new Logger(CapabilityResolverService.name);

  constructor(private readonly agentRegistry: AgentRegistryService) {}

  async resolve(requiredCapabilities: string[]): Promise<AgentIdentity[]> {
    this.logger.log(`Resolving agents for capabilities: ${requiredCapabilities.join(', ')}`);
    const resolvedAgents: AgentIdentity[] = [];

    // Simple resolution logic: Find agents that have at least one required capability
    for (const capability of requiredCapabilities) {
      const matchingAgents = this.agentRegistry.findAgentsByCapability(capability);
      
      if (matchingAgents.length === 0) {
        this.logger.warn(`No agent found with capability: ${capability}`);
        continue;
      }

      // We just pick the first matching agent for this milestone
      const bestAgent = matchingAgents[0];
      
      // Avoid duplicates
      if (!resolvedAgents.some(a => a.id === bestAgent.id)) {
        resolvedAgents.push({
          id: bestAgent.id,
          name: bestAgent.name,
          capabilities: bestAgent.capabilities,
        });
      }
    }

    return resolvedAgents;
  }
}
