import { Injectable, Logger } from '@nestjs/common';
import { ICapabilityResolver, ExecutionTarget, TargetType } from './interfaces/capability-resolver.interface';
import { AgentRegistryService } from '../registry/agent-registry.service';

@Injectable()
export class CapabilityResolverService implements ICapabilityResolver {
  private readonly logger = new Logger(CapabilityResolverService.name);

  constructor(private readonly agentRegistry: AgentRegistryService) {}

  async resolve(requiredCapabilities: string[]): Promise<ExecutionTarget[]> {
    this.logger.log(`Resolving execution targets for capabilities: ${requiredCapabilities.join(', ')}`);
    const resolvedTargets: ExecutionTarget[] = [];

    // Note: Future implementations will resolve MCP_SERVER, WORKFLOW, or HUMAN targets here as well.
    for (const capability of requiredCapabilities) {
      const matchingAgents = await this.agentRegistry.findMatchingAgents(capability);
      
      if (matchingAgents.length === 0) {
        this.logger.warn(`No target found with capability: ${capability}`);
        continue;
      }

      // We just pick the first matching agent for this milestone
      const bestAgent = matchingAgents[0];
      
      // Avoid duplicates
      if (!resolvedTargets.some(t => t.id === bestAgent.id)) {
        resolvedTargets.push({
          id: bestAgent.id,
          type: 'AGENT',
          name: bestAgent.name,
          capabilities: bestAgent.capabilities.map(c => c.capability.key),
        });
      }
    }

    return resolvedTargets;
  }
}
