import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { McpManagerService } from '../manager/mcp-manager.service';
import { EventBusService } from '../../events/event-bus.service';
import { AdapterState } from '../types/mcp.types';
import * as crypto from 'crypto';

@Injectable()
export class McpHealthMonitor {
  private readonly logger = new Logger(McpHealthMonitor.name);

  constructor(
    private readonly mcpManager: McpManagerService,
    private readonly eventBus: EventBusService,
  ) {}

  private healthyServers = new Set<string>();

  // Run every 10 seconds. In production, this would be tied to the healthInterval config per server.
  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkHealth() {
    const adapters = this.mcpManager.getAllAdapters();
    
    for (const [serverId, adapter] of adapters.entries()) {
      const state = adapter.getState();
      const traceId = crypto.randomUUID();

      if (state === AdapterState.Failed || state === AdapterState.Closed) {
        if (this.healthyServers.has(serverId) || this.healthyServers.size === 0) {
          this.logger.warn(`Health Check: Server '${serverId}' is Unhealthy (State: ${state})`);
          this.healthyServers.delete(serverId);
          this.eventBus.emitServerUnhealthy(traceId, serverId, `State is ${state}`);
        }
      } else if (state === AdapterState.Connected || state === AdapterState.Ready) {
        if (!this.healthyServers.has(serverId)) {
          this.logger.debug(`Health Check: Server '${serverId}' is Healthy`);
          this.healthyServers.add(serverId);
          this.eventBus.emitServerHealthy(traceId, serverId);
        }
      }
    }
  }
}
