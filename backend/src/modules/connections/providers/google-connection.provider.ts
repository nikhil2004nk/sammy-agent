import { Injectable, Logger } from '@nestjs/common';
import { ConnectionProvider } from '../interfaces/connection-provider.interface';
import { CredentialService } from '../credentials/credential.service';
import { ConnectionContext, ResolvedConnection, ConnectionCredential, TransportConfig } from '../types/connection.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleConnectionProvider implements ConnectionProvider {
  private readonly logger = new Logger(GoogleConnectionProvider.name);

  constructor(
    private readonly credentialService: CredentialService,
    private readonly configService: ConfigService
  ) {}

  getProviderId(): string {
    return 'google';
  }

  async resolveConnection(context: ConnectionContext): Promise<ResolvedConnection> {
    this.logger.debug(`Resolving connection for Google provider in workspace ${context.workspaceId}`);

    let credential = await this.credentialService.getCredential(context);

    if (!credential) {
      // In a real flow, if no credential, we throw or trigger the OAuth consent flow.
      // For this phase, we'll throw an error if not found, since the user should authorize first via UI.
      throw new Error(`No credential found for Google provider in workspace ${context.workspaceId}. Please authenticate.`);
    }

    if (await this.credentialService.isCredentialExpired(context)) {
      this.logger.log(`Credential expired for ${context.serverId}, performing OAuth refresh`);
      credential = await this.refreshAccessToken(context, credential);
    }

    // Return the resolved connection
    return {
      serverId: context.serverId,
      transport: { type: 'stdio' }, // Google adapter will likely be a local adapter that uses HTTP underneath, so stdio or a custom transport type might be used
      authentication: {
        environment: {
          GOOGLE_ACCESS_TOKEN: credential.values.accessToken
        },
        credentials: credential
      }
    };
  }

  /**
   * Exchanges an authorization code for an access and refresh token.
   * This would typically be called by a REST controller handling the OAuth callback.
   */
  async exchangeCodeForTokens(context: ConnectionContext, code: string): Promise<ConnectionCredential> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured in environment');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri || 'http://localhost:3000/api/oauth/callback/google',
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.logger.error(`Failed to exchange code for tokens: ${JSON.stringify(errorData)}`);
      throw new Error(`Failed to exchange authorization code for Google tokens`);
    }

    const data = await response.json();
    
    const credential: ConnectionCredential = {
      scheme: 'oauth2',
      values: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      },
      expiresAt: new Date(Date.now() + (data.expires_in * 1000))
    };

    await this.credentialService.storeCredential(context, credential);
    return credential;
  }

  private async refreshAccessToken(context: ConnectionContext, credential: ConnectionCredential): Promise<ConnectionCredential> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured in environment');
    }

    const refreshToken = credential.values.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available to refresh access token');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      this.logger.error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
      throw new Error(`Failed to refresh Google access token`);
    }

    const data = await response.json();

    const newCredential: ConnectionCredential = {
      scheme: 'oauth2',
      values: {
        accessToken: data.access_token,
        refreshToken: refreshToken, // keep the old one if a new one isn't provided
      },
      expiresAt: new Date(Date.now() + (data.expires_in * 1000))
    };

    await this.credentialService.storeCredential(context, newCredential);
    return newCredential;
  }
}
