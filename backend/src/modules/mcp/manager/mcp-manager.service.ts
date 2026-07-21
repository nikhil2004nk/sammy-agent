import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { IMcpAdapter } from '../interfaces/mcp-adapter.interface';
import { McpAdapterService } from '../adapter/mcp-adapter.service';
import { ProviderAdapterRegistry } from '../provider-adapter.registry';
import { McpConfig, McpServerConfig } from '../config/mcp.config';
import { AdapterState } from '../types/mcp.types';
import { ServerUnhealthyEvent, EventBusService } from '../../events/event-bus.service';

@Injectable()
export class McpManagerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(McpManagerService.name);
  private adapters: Map<string, IMcpAdapter> = new Map();
  private config: McpConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBusService,
    private readonly adapterRegistry: ProviderAdapterRegistry,
  ) {}

  async onApplicationBootstrap() {
    this.config = this.configService.get<McpConfig>('mcp') as McpConfig;
    if (!this.config || !this.config.servers) {
      this.logger.warn('No MCP configuration found.');
      return;
    }

    for (const [serverId, serverConfig] of Object.entries(this.config.servers)) {
      if (serverConfig.enabled) {
        this.logger.log(`Initializing MCP server: ${serverId}`);
        this.initializeServer(serverId, serverConfig).catch(err => {
          this.logger.error(`Background initialization failed for ${serverId}`, err);
        });
      }
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Shutting down MCP Manager. Closing all connections.');
    const disconnectPromises = Array.from(this.adapters.values()).map(a => a.disconnect());
    await Promise.all(disconnectPromises);
  }

  private async initializeServer(serverId: string, config: McpServerConfig): Promise<void> {
    // Ask the registry first — if a provider registered a factory, use it.
    // Otherwise fall back to the generic stdio adapter.
    const adapter: IMcpAdapter =
      this.adapterRegistry.createAdapter(serverId) ?? new McpAdapterService(serverId);

    this.adapters.set(serverId, adapter);

    let attempts = 0;
    const maxAttempts = config.retry?.maxAttempts || 3;
    const backoffMs = config.retry?.backoffMs || 1000;

    while (attempts < maxAttempts) {
      try {
        await adapter.connect(config.command || 'node', config.args || []);
        const traceId = 'sys-' + Date.now();
        this.eventBus.emitServerConnected(traceId, serverId);
        this.logger.log(`[${serverId}] Connected using adapter: ${adapter.constructor.name}`);
        break;
      } catch (error) {
        attempts++;
        this.logger.warn(`Failed to connect ${serverId} (Attempt ${attempts}/${maxAttempts})`);
        if (attempts >= maxAttempts) {
          this.logger.error(`Exhausted retries for ${serverId}.`);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempts));
      }
    }
  }

  getAdapter(serverId: string): IMcpAdapter | undefined {
    return this.adapters.get(serverId);
  }

  getAllAdapters(): Map<string, IMcpAdapter> {
    return this.adapters;
  }

  getServerState(serverId: string): AdapterState {
    const adapter = this.adapters.get(serverId);
    return adapter ? adapter.getState() : AdapterState.Closed;
  }

  @OnEvent('mcp.server.unhealthy')
  async handleServerUnhealthy(event: ServerUnhealthyEvent) {
    const serverId = event.payload.serverId;
    const adapter = this.adapters.get(serverId);
    if (!adapter) return;

    if (adapter.getState() === AdapterState.Reconnecting || adapter.getState() === AdapterState.Connecting) {
      return;
    }

    this.logger.warn(`Received Unhealthy event for ${serverId}. Initiating reconnect...`);
    const config = this.config.servers[serverId];
    if (config && config.enabled) {
      this.initializeServer(serverId, config).catch(err => {
        this.logger.error(`Reconnection failed for ${serverId}`, err);
      });
    }
  }
}
