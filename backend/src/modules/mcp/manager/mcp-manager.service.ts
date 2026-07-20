import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { McpAdapterService } from '../adapter/mcp-adapter.service';
import { McpConfig, McpServerConfig } from '../config/mcp.config';
import { AdapterState } from '../types/mcp.types';
import { ServerUnhealthyEvent } from '../../events/event-bus.service';

@Injectable()
export class McpManagerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(McpManagerService.name);
  private adapters: Map<string, McpAdapterService> = new Map();
  private config: McpConfig;

  constructor(private configService: ConfigService) {}

  async onApplicationBootstrap() {
    this.config = this.configService.get<McpConfig>('mcp') as McpConfig;
    if (!this.config || !this.config.servers) {
      this.logger.warn('No MCP configuration found.');
      return;
    }

    // Connect all configured servers asynchronously
    for (const [serverId, serverConfig] of Object.entries(this.config.servers)) {
      if (serverConfig.enabled) {
        this.logger.log(`Initializing MCP server: ${serverId}`);
        // We create the adapter and connect it asynchronously (non-blocking)
        this.initializeServer(serverId, serverConfig).catch(err => {
          this.logger.error(`Background initialization failed for ${serverId}`, err);
        });
      }
    }
  }

  async onApplicationShutdown() {
    this.logger.log('Shutting down MCP Manager. Closing all connections.');
    const disconnectPromises = Array.from(this.adapters.values()).map(adapter => adapter.disconnect());
    await Promise.all(disconnectPromises);
  }

  private async initializeServer(serverId: string, config: McpServerConfig): Promise<void> {
    const adapter = new McpAdapterService(serverId);
    this.adapters.set(serverId, adapter);

    let attempts = 0;
    const maxAttempts = config.retry?.maxAttempts || 3;
    const backoffMs = config.retry?.backoffMs || 1000;

    while (attempts < maxAttempts) {
      try {
        if (config.transport === 'stdio') {
          await adapter.connect(config.command || 'node', config.args || []);
        } else {
          // Placeholder for HTTP/SSE which requires url
          throw new Error(`Transport ${config.transport} not fully implemented in adapter mock`);
        }
        
        // If we connect successfully, break the retry loop
        break;
      } catch (error) {
        attempts++;
        this.logger.warn(`Failed to connect ${serverId} (Attempt ${attempts}/${maxAttempts})`);
        if (attempts >= maxAttempts) {
          this.logger.error(`Exhausted retries for ${serverId}.`);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, backoffMs * attempts)); // Exponential backoff
      }
    }
  }

  getAdapter(serverId: string): McpAdapterService | undefined {
    return this.adapters.get(serverId);
  }

  getAllAdapters(): Map<string, McpAdapterService> {
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

    // Prevent concurrent reconnection loops
    if (adapter.getState() === AdapterState.Reconnecting || adapter.getState() === AdapterState.Connecting) {
      return;
    }

    this.logger.warn(`Received Unhealthy event for ${serverId}. Initiating reconnect strategy...`);
    const config = this.config.servers[serverId];
    if (config && config.enabled) {
      // Re-use initializeServer which has the backoff logic
      this.initializeServer(serverId, config).catch(err => {
        this.logger.error(`Reconnection strategy failed for ${serverId}`, err);
      });
    }
  }
}
