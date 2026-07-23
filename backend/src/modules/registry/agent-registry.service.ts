import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentStatus } from '@prisma/client';

export interface RegisterAgentDto {
  key: string;
  name: string;
  workspaceId?: string;
  description?: string;
  version?: string;
  capabilities?: string[]; // Array of capability keys
}

@Injectable()
export class AgentRegistryService {
  private readonly logger = new Logger(AgentRegistryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterAgentDto) {
    this.logger.log(`Registering agent: ${dto.name} [${dto.key}]`);
    
    // In a real implementation, we would also link capabilities
    const agent = await this.prisma.agent.create({
      data: {
        key: dto.key,
        name: dto.name,
        workspaceId: dto.workspaceId,
        description: dto.description,
        version: dto.version || '1.0.0',
        status: AgentStatus.ACTIVE,
      },
    });

    return agent;
  }

  async activate(id: string) {
    this.logger.log(`Activating agent: ${id}`);
    return this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.ACTIVE },
    });
  }

  async deactivate(id: string) {
    this.logger.log(`Deactivating agent: ${id}`);
    return this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.INACTIVE },
    });
  }

  async deprecate(id: string) {
    this.logger.log(`Deprecating agent: ${id}`);
    return this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.DEPRECATED },
    });
  }

  async archive(id: string) {
    this.logger.log(`Archiving agent: ${id}`);
    return this.prisma.agent.update({
      where: { id },
      data: { 
        status: AgentStatus.DISABLED,
        deletedAt: new Date()
      },
    });
  }

  async resolveVersion(key: string, version?: string) {
    if (version) {
      return this.prisma.agent.findFirst({
        where: { key, version, status: AgentStatus.ACTIVE }
      });
    }

    // Default to the latest version by parsing semantic versioning or just returning the newest createdAt
    // Simplified version: get the most recently created active agent for this key
    return this.prisma.agent.findFirst({
      where: { key, status: AgentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' }
    });
  }

  async listCapabilities() {
    return this.prisma.capability.findMany();
  }

  async findMatchingAgents(capabilityKey: string) {
    return this.prisma.agent.findMany({
      where: {
        status: AgentStatus.ACTIVE,
        capabilities: {
          some: {
            capability: {
              key: capabilityKey
            },
            status: AgentStatus.ACTIVE
          }
        }
      },
      include: {
        capabilities: {
          include: {
            capability: true
          }
        }
      }
    });
  }
}
