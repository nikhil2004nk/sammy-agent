import { Injectable, Logger } from '@nestjs/common';
import { InstalledServer, McpServerState } from '../types/mcp.types';

@Injectable()
export class McpRegistryService {
  private readonly logger = new Logger(McpRegistryService.name);
  private readonly servers = new Map<string, InstalledServer>();

  async registerServer(workspaceId: string, name: string, version: string, config: Record<string, any>): Promise<InstalledServer> {
    const id = require('crypto').randomUUID();
    const server: InstalledServer = {
      id,
      workspaceId,
      name,
      version,
      state: McpServerState.Installed,
      config,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.servers.set(id, server);
    this.logger.log(`Registered MCP server '${name}' for workspace '${workspaceId}'`);
    return server;
  }

  async updateServerState(serverId: string, state: McpServerState, error?: string): Promise<InstalledServer> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server with ID '${serverId}' not found.`);
    }

    server.state = state;
    server.updatedAt = new Date();
    if (error) {
      server.lastError = error;
    }
    
    this.servers.set(serverId, server);
    this.logger.debug(`Updated server '${serverId}' state to '${state}'`);
    return server;
  }

  async getServersForWorkspace(workspaceId: string): Promise<InstalledServer[]> {
    return Array.from(this.servers.values()).filter(s => s.workspaceId === workspaceId && s.state !== McpServerState.Uninstalled);
  }

  async getServer(serverId: string): Promise<InstalledServer | null> {
    return this.servers.get(serverId) || null;
  }

  async uninstallServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (server) {
      server.state = McpServerState.Uninstalled;
      server.updatedAt = new Date();
      this.servers.set(serverId, server);
      this.logger.log(`Uninstalled server '${serverId}'`);
    }
  }
}
