import { Test, TestingModule } from '@nestjs/testing';
import { OAuthConnectionProvider } from './oauth-connection.provider';
import { CredentialRepository } from '../interfaces/credential-repository.interface';
import { ConfigService } from '@nestjs/config';
import { ConnectionContext, ConnectionCredential } from '../types/connection.types';

describe('OAuthConnectionProvider', () => {
  let provider: OAuthConnectionProvider;
  let repository: jest.Mocked<CredentialRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    repository = {
      getCredential: jest.fn(),
      saveCredential: jest.fn(),
      deleteCredential: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue({
        servers: {
          gmail: { transport: 'stdio' }
        }
      })
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthConnectionProvider,
        { provide: CredentialRepository, useValue: repository },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    provider = module.get<OAuthConnectionProvider>(OAuthConnectionProvider);
  });

  const context: ConnectionContext = {
    tenantId: 'tenant-1',
    userId: 'user-1',
    serverId: 'gmail',
  };

  it('should mock a new login if no credential exists', async () => {
    repository.getCredential.mockResolvedValue(null);
    repository.saveCredential.mockResolvedValue(undefined);

    const result = await provider.resolveConnection(context);

    expect(repository.getCredential).toHaveBeenCalledWith(context);
    expect(repository.saveCredential).toHaveBeenCalled();
    expect(result.serverId).toBe('gmail');
    expect(result.authentication?.environment?.GMAIL_ACCESS_TOKEN).toContain('mock_access_token_');
  });

  it('should return existing connection if credential is valid', async () => {
    const validCred: ConnectionCredential = {
      scheme: 'oauth2',
      values: { accessToken: 'valid_token' },
      expiresAt: new Date(Date.now() + 60000), // expires in 1 min
    };
    repository.getCredential.mockResolvedValue(validCred);

    const result = await provider.resolveConnection(context);

    expect(repository.saveCredential).not.toHaveBeenCalled(); // No refresh
    expect(result.authentication?.environment?.GMAIL_ACCESS_TOKEN).toBe('valid_token');
  });

  it('should refresh token if credential is expired', async () => {
    const expiredCred: ConnectionCredential = {
      scheme: 'oauth2',
      values: { accessToken: 'old_token', refreshToken: 'refresh_token' },
      expiresAt: new Date(Date.now() - 60000), // expired 1 min ago
    };
    repository.getCredential.mockResolvedValue(expiredCred);
    repository.saveCredential.mockResolvedValue(undefined);

    const result = await provider.resolveConnection(context);

    expect(repository.saveCredential).toHaveBeenCalled();
    expect(result.authentication?.environment?.GMAIL_ACCESS_TOKEN).toContain('mock_refreshed_access_token_');
    
    // Ensure the refresh token was preserved in the new saved credential
    const savedArg = repository.saveCredential.mock.calls[0][1];
    expect(savedArg.values.refreshToken).toBe('refresh_token');
  });
});
