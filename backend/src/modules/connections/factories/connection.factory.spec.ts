import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionFactory } from './connection.factory';
import { ConnectionProvider } from '../interfaces/connection-provider.interface';
import { ConnectionContext, ResolvedConnection } from '../types/connection.types';

class MockOAuthProvider extends ConnectionProvider {
  getProviderId() { return 'oauth2'; }
  async resolveConnection(context: ConnectionContext): Promise<ResolvedConnection> {
    return {
      serverId: context.serverId,
      transport: { type: 'stdio' },
      authentication: { environment: { MOCK_OAUTH: 'true' } }
    };
  }
}

describe('ConnectionFactory', () => {
  let factory: ConnectionFactory;
  let oauthProvider: MockOAuthProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionFactory],
    }).compile();

    factory = module.get<ConnectionFactory>(ConnectionFactory);
    oauthProvider = new MockOAuthProvider();
  });

  const context: ConnectionContext = {
    tenantId: 'tenant-1',
    userId: 'user-1',
    serverId: 'gmail', // maps to oauth2
  };

  it('should return a basic connection if no specific provider is mapped', async () => {
    const unknownContext: ConnectionContext = { ...context, serverId: 'unknown' };
    const result = await factory.resolveConnection(unknownContext);
    
    expect(result.serverId).toBe('unknown');
    expect(result.transport.type).toBe('stdio');
    expect(result.authentication).toBeUndefined();
  });

  it('should throw error if required provider is not registered', async () => {
    await expect(factory.resolveConnection(context)).rejects.toThrow(/No ConnectionProvider registered for scheme 'oauth2'/);
  });

  it('should delegate to the registered provider', async () => {
    factory.registerProvider(oauthProvider);
    const result = await factory.resolveConnection(context);

    expect(result.authentication?.environment?.MOCK_OAUTH).toBe('true');
  });
});
