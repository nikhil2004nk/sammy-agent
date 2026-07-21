import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionFactory } from './factories/connection.factory';
import { OAuthConnectionProvider } from './providers/oauth-connection.provider';
import { MemoryCredentialRepository } from './repositories/memory-credential.repository';
import { NoOpEncryptionService } from './services/noop-encryption.service';
import { EncryptionService } from './interfaces/encryption-service.interface';
import { CredentialRepository } from './interfaces/credential-repository.interface';
import { CredentialService } from './credentials/credential.service';
import { GoogleConnectionProvider } from './providers/google-connection.provider';
import { ConnectionsController } from './connections.controller';
import { McpModule } from '../mcp/mcp.module';
import { ProviderAdapterRegistry } from '../mcp/provider-adapter.registry';
import { GoogleMcpAdapter } from '../mcp/adapter/google-mcp.adapter';

@Module({
  imports: [ConfigModule, McpModule],
  controllers: [ConnectionsController],
  providers: [
    {
      provide: EncryptionService,
      useClass: NoOpEncryptionService
    },
    {
      provide: CredentialRepository,
      useClass: MemoryCredentialRepository
    },
    OAuthConnectionProvider,
    GoogleConnectionProvider,
    ConnectionFactory,
    CredentialService
  ],
  exports: [ConnectionFactory, CredentialService, GoogleConnectionProvider]
})
export class ConnectionsModule implements OnModuleInit {
  constructor(
    private readonly factory: ConnectionFactory,
    private readonly oauthProvider: OAuthConnectionProvider,
    private readonly googleProvider: GoogleConnectionProvider,
    private readonly adapterRegistry: ProviderAdapterRegistry,
  ) {}

  onModuleInit() {
    // Register connection providers with the connection factory
    this.factory.registerProvider(this.oauthProvider);
    this.factory.registerProvider(this.googleProvider);

    // Register Google's adapter factory with the ProviderAdapterRegistry.
    // McpManagerService will call adapterRegistry.createAdapter('google') and get a GoogleMcpAdapter.
    // No more hardcoded if/else anywhere in the core runtime.
    this.adapterRegistry.register('google', (serverId) => new GoogleMcpAdapter(serverId));
  }
}
