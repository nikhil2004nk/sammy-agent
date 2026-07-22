import { Injectable, Logger } from '@nestjs/common';
import { ConnectionProvider } from '../interfaces/connection-provider.interface';
import { ConnectionContext, ResolvedConnection } from '../types/connection.types';

@Injectable()
export class ConnectionFactory {
  private readonly logger = new Logger(ConnectionFactory.name);
  private readonly providers = new Map<string, ConnectionProvider>();

  // A mapping from serverId to the expected provider scheme (this could come from config)
  private readonly serverToProviderMap: Record<string, string> = {
    'gmail': 'google',
  };

  registerProvider(provider: ConnectionProvider) {
    this.providers.set(provider.getProviderId(), provider);
    this.logger.log(`Registered connection provider: ${provider.getProviderId()}`);
  }

  getProviders(): Map<string, ConnectionProvider> {
    return this.providers;
  }

  async resolveConnection(context: ConnectionContext): Promise<ResolvedConnection> {
    const providerId = this.serverToProviderMap[context.serverId] || 'none';
    
    // If no specific provider is needed, return a basic connection structure
    if (providerId === 'none') {
      return this.resolveBasicConnection(context);
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`No ConnectionProvider registered for scheme '${providerId}'`);
    }

    return provider.resolveConnection(context);
  }

  private resolveBasicConnection(context: ConnectionContext): ResolvedConnection {
    // In a real implementation, we'd lookup the server config to get the default transport
    // For now, we mock a basic stdio connection
    return {
      serverId: context.serverId,
      transport: { type: 'stdio' },
    };
  }
}
