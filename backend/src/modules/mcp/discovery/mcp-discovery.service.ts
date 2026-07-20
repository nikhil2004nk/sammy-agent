import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventBusService, ServerHealthyEvent } from '../../events/event-bus.service';
import { McpManagerService } from '../manager/mcp-manager.service';
import * as crypto from 'crypto';

@Injectable()
export class McpDiscoveryService {
  private readonly logger = new Logger(McpDiscoveryService.name);

  // We keep a simple hash map to prevent duplicating discoveries if server hasn't changed.
  // In a real system, we'd hash the actual capabilities.
  private discoveryCache = new Map<string, string>();

  constructor(
    private readonly mcpManager: McpManagerService,
    private readonly eventBus: EventBusService,
  ) {}

  // Trigger discovery automatically when a server becomes healthy or connected
  @OnEvent('mcp.server.healthy')
  @OnEvent('mcp.server.connected')
  async handleServerHealthy(event: ServerHealthyEvent | any) {
    const serverId = event.payload.serverId;
    await this.discoverServer(serverId);
  }

  async discoverServer(serverId: string): Promise<void> {
    const adapter = this.mcpManager.getAdapter(serverId);
    if (!adapter) {
      this.logger.warn(`Cannot discover server '${serverId}' because it has no adapter.`);
      return;
    }

    const traceId = crypto.randomUUID();
    
    // In future: check cache hash before triggering full discovery
    const currentHash = `hash-${Date.now()}`; // Simulated hash
    if (this.discoveryCache.get(serverId) === currentHash) {
      this.logger.log(`Skipping discovery for '${serverId}' (Unchanged)`);
      return;
    }

    this.logger.log(`Starting discovery for server '${serverId}'`);
    this.eventBus.emitDiscoveryStarted(traceId, serverId);

    let toolCount = 0;
    let resourceCount = 0;
    let promptCount = 0;

    try {
      const capabilities = await adapter.discoverCapabilities();
      
      if (capabilities.includes('tools')) {
        const tools = await adapter.discoverTools();
        toolCount = tools.length;
        for (const tool of tools) {
          this.eventBus.emitToolDiscovered(traceId, tool);
        }
      }

      if (capabilities.includes('resources')) {
        const resources = await adapter.discoverResources();
        resourceCount = resources.length;
        for (const resource of resources) {
          this.eventBus.emitResourceDiscovered(traceId, resource);
        }
      }

      if (capabilities.includes('prompts')) {
        const prompts = await adapter.discoverPrompts();
        promptCount = prompts.length;
        for (const prompt of prompts) {
          this.eventBus.emitPromptDiscovered(traceId, prompt);
        }
      }

      this.discoveryCache.set(serverId, currentHash);
      
      this.logger.log(`Discovery finished for '${serverId}'. Tools: ${toolCount}, Resources: ${resourceCount}, Prompts: ${promptCount}`);
      this.eventBus.emitDiscoveryFinished(traceId, serverId, { tools: toolCount, resources: resourceCount, prompts: promptCount });

    } catch (error) {
      this.logger.error(`Discovery failed for server '${serverId}'`, error);
      // Depending on severity, we might emit a failure event or server unhealthy event.
    }
  }
}
