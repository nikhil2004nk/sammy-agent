import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentDefinition } from './models/agent-definition.model';

@Injectable()
export class AgentRegistryService {
  private readonly logger = new Logger(AgentRegistryService.name);
  
  // In-memory mock registry for early milestones
  private agents: Map<string, AgentDefinition> = new Map();

  constructor() {
    this.seedMockAgents();
  }

  private seedMockAgents() {
    this.registerAgent({
      id: 'agent-analyzer',
      name: 'Analysis Agent',
      description: 'Specializes in analyzing code and preconditions.',
      capabilities: ['analysis'],
      tools: ['read_file', 'grep_search'],
      permissions: ['read:files'],
      systemPrompt: 'You are an Analysis Agent...',
    });

    this.registerAgent({
      id: 'agent-executor',
      name: 'Execution Agent',
      description: 'Executes core actions and writes code.',
      capabilities: ['execution'],
      tools: ['write_file', 'run_command'],
      permissions: ['write:files', 'execute:commands'],
      systemPrompt: 'You are an Execution Agent...',
    });

    this.registerAgent({
      id: 'agent-verifier',
      name: 'Verification Agent',
      description: 'Verifies results and runs tests.',
      capabilities: ['verification'],
      tools: ['run_command'],
      permissions: ['execute:commands'],
      systemPrompt: 'You are a Verification Agent...',
    });
  }

  registerAgent(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);
    this.logger.log(`Registered agent: ${agent.name} [${agent.id}]`);
  }

  getAgent(id: string): AgentDefinition {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new NotFoundException(`Agent with id ${id} not found`);
    }
    return agent;
  }

  getAllAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  findAgentsByCapability(capability: string): AgentDefinition[] {
    return this.getAllAgents().filter(agent => 
      agent.capabilities.includes(capability)
    );
  }
}
