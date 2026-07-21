import { Logger } from '@nestjs/common';
import { IMcpAdapter } from './interfaces/mcp-adapter.interface';

export type AdapterFactory = (serverId: string) => IMcpAdapter;

/**
 * ProviderAdapterRegistry
 *
 * Decouples McpManagerService from any specific provider (Google, GitHub, Slack, etc.).
 * Each provider module registers a factory on startup. The manager just asks this registry
 * for an adapter — it never needs to know which provider is behind a serverId.
 */
export class ProviderAdapterRegistry {
  private readonly logger = new Logger(ProviderAdapterRegistry.name);
  private readonly factories = new Map<string, AdapterFactory>();

  /**
   * Register a provider's adapter factory.
   * @param providerId  The identifier that matches the serverId in MCP config (e.g., 'google')
   * @param factory     A function that takes a serverId and returns a new IMcpAdapter instance
   */
  register(providerId: string, factory: AdapterFactory): void {
    this.factories.set(providerId, factory);
    this.logger.log(`Registered adapter factory for provider: '${providerId}'`);
  }

  /**
   * Create an adapter for the given serverId.
   * Falls back to null if no factory is registered (caller must handle this case).
   */
  createAdapter(serverId: string): IMcpAdapter | null {
    const factory = this.factories.get(serverId);
    if (!factory) {
      return null;
    }
    return factory(serverId);
  }

  hasProvider(providerId: string): boolean {
    return this.factories.has(providerId);
  }

  getRegisteredProviders(): string[] {
    return Array.from(this.factories.keys());
  }
}
