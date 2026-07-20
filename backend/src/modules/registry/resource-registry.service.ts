import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ResourceDiscoveredEvent, ServerDisconnectedEvent } from '../events/event-bus.service';
import { McpResource } from '../mcp/types/mcp.types';

@Injectable()
export class ResourceRegistryService {
  private readonly logger = new Logger(ResourceRegistryService.name);
  private resources = new Map<string, McpResource>();

  @OnEvent('mcp.resource.discovered')
  handleResourceDiscovered(event: ResourceDiscoveredEvent) {
    const resource = event.payload.resource as McpResource;
    // Resources often have globally unique URIs (e.g., file://...)
    // If not, we should namespace them like tools.
    this.resources.set(resource.uri, resource);
    this.logger.debug(`Registered resource: ${resource.name} (${resource.uri})`);
  }

  @OnEvent('mcp.server.disconnected')
  handleServerDisconnected(event: ServerDisconnectedEvent) {
    // For now we don't clear resources as we don't track serverId on the resource model directly
    // but in a production implementation we would track origin and clear them.
  }

  getResource(uri: string): McpResource | undefined {
    return this.resources.get(uri);
  }

  getAllResources(): McpResource[] {
    return Array.from(this.resources.values());
  }
}
