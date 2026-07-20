import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PromptDiscoveredEvent, ServerDisconnectedEvent } from '../events/event-bus.service';
import { McpPrompt } from '../mcp/types/mcp.types';

@Injectable()
export class PromptRegistryService {
  private readonly logger = new Logger(PromptRegistryService.name);
  private prompts = new Map<string, McpPrompt>();

  @OnEvent('mcp.prompt.discovered')
  handlePromptDiscovered(event: PromptDiscoveredEvent) {
    const prompt = event.payload.prompt as McpPrompt;
    this.prompts.set(prompt.name, prompt);
    this.logger.debug(`Registered prompt: ${prompt.name}`);
  }

  getPrompt(name: string): McpPrompt | undefined {
    return this.prompts.get(name);
  }

  getAllPrompts(): McpPrompt[] {
    return Array.from(this.prompts.values());
  }
}
