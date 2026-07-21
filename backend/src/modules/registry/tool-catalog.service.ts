import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ToolDiscoveredEvent, ServerDisconnectedEvent } from '../events/event-bus.service';
import { ToolMetadata } from '../mcp/types/mcp.types';

@Injectable()
export class ToolCatalogService {
  private readonly logger = new Logger(ToolCatalogService.name);

  // Map of ToolName -> ToolMetadata
  // In a real system, you'd handle duplicate names across different servers.
  // We'll namespace them as 'serverId.toolName' to avoid collisions.
  private tools = new Map<string, ToolMetadata>();

  @OnEvent('mcp.tool.discovered')
  handleToolDiscovered(event: ToolDiscoveredEvent) {
    const tool = event.payload.tool as ToolMetadata;
    const namespacedName = tool.name;

    // We only update if it's new or has a higher priority
    const existing = this.tools.get(namespacedName);
    if (!existing || (existing.priority || 0) <= (tool.priority || 0)) {
      this.tools.set(namespacedName, tool);
      this.logger.debug(`Registered tool in catalog: ${namespacedName}`);
    }
  }

  @OnEvent('mcp.server.disconnected')
  handleServerDisconnected(event: ServerDisconnectedEvent) {
    const serverId = event.payload.serverId;
    let count = 0;
    for (const [key, tool] of this.tools.entries()) {
      if (tool.serverId === serverId) {
        this.tools.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.debug(`Removed ${count} tools from catalog for disconnected server '${serverId}'`);
    }
  }

  getTool(namespacedName: string): ToolMetadata | undefined {
    return this.tools.get(namespacedName);
  }

  getAllTools(): ToolMetadata[] {
    return Array.from(this.tools.values());
  }
}
