import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentHealthStatus } from '@prisma/client';

@Injectable()
export class AgentLifecycleService {
  private readonly logger = new Logger(AgentLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async reportHeartbeat(agentId: string) {
    this.logger.debug(`Heartbeat received for agent: ${agentId}`);
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        // We could add a 'lastSeenAt' field to the model if we wanted exact tracking,
        // but for now we update healthStatus to HEALTHY if it was UNHEALTHY.
        healthStatus: AgentHealthStatus.HEALTHY,
        updatedAt: new Date()
      }
    });
  }

  async reportFailure(agentId: string) {
    this.logger.warn(`Failure reported for agent: ${agentId}`);
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        healthStatus: AgentHealthStatus.UNHEALTHY,
      }
    });
  }

  async enterMaintenance(agentId: string) {
    this.logger.log(`Agent ${agentId} entering maintenance mode`);
    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        healthStatus: AgentHealthStatus.MAINTENANCE,
      }
    });
  }
}
