import { Injectable, Logger } from '@nestjs/common';
import { ConnectionProvider } from '../interfaces/connection-provider.interface';
import { CredentialRepository } from '../interfaces/credential-repository.interface';
import { ConnectionContext, ResolvedConnection, ConnectionCredential, TransportConfig } from '../types/connection.types';
import { ConfigService } from '@nestjs/config';
import { McpServerConfig } from '../../mcp/config/mcp.config';

@Injectable()
export class OAuthConnectionProvider implements ConnectionProvider {
  private readonly logger = new Logger(OAuthConnectionProvider.name);

  constructor(
    private readonly repository: CredentialRepository,
    private readonly configService: ConfigService
  ) {}

  getProviderId(): string {
    return 'oauth2';
  }

  async resolveConnection(context: ConnectionContext): Promise<ResolvedConnection> {
    this.logger.debug(`Resolving connection for ${context.serverId} / user ${context.userId}`);

    let credential = await this.repository.getCredential(context);

    // If no credential exists, we mock a first-time login for Step 2A
    if (!credential) {
      this.logger.log(`No credential found for ${context.serverId}, performing mocked initial login`);
      credential = await this.mockOAuthLogin(context);
    } else if (this.isExpired(credential)) {
      this.logger.log(`Credential expired for ${context.serverId}, performing mocked refresh`);
      credential = await this.mockOAuthRefresh(context, credential);
    }

    // Now construct the ResolvedConnection based on the server config
    const mcpConfig = this.configService.get('mcp');
    const serverConfig = mcpConfig?.servers?.[context.serverId] as McpServerConfig;
    
    // Fallback to stdio if not found, since this is a mock platform test
    const transport: TransportConfig = {
      type: serverConfig?.transport || 'stdio',
      command: serverConfig?.command,
      args: serverConfig?.args,
      url: serverConfig?.url
    };

    return {
      serverId: context.serverId,
      transport,
      authentication: {
        environment: {
          [this.getEnvKey(context.serverId)]: credential.values.accessToken
        },
        credentials: credential
      }
    };
  }

  private isExpired(credential: ConnectionCredential): boolean {
    if (!credential.expiresAt) return false;
    // Add a 10 second buffer to prevent race conditions
    return credential.expiresAt.getTime() - 10000 < Date.now();
  }

  private async mockOAuthLogin(context: ConnectionContext): Promise<ConnectionCredential> {
    const credential: ConnectionCredential = {
      scheme: 'oauth2',
      values: {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
      },
      expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
    };
    await this.repository.saveCredential(context, credential);
    return credential;
  }

  private async mockOAuthRefresh(context: ConnectionContext, oldCredential: ConnectionCredential): Promise<ConnectionCredential> {
    const credential: ConnectionCredential = {
      scheme: 'oauth2',
      values: {
        accessToken: `mock_refreshed_access_token_${Date.now()}`,
        refreshToken: oldCredential.values.refreshToken,
      },
      expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
    };
    await this.repository.saveCredential(context, credential);
    return credential;
  }

  private getEnvKey(serverId: string): string {
    return `${serverId.toUpperCase()}_ACCESS_TOKEN`;
  }
}
