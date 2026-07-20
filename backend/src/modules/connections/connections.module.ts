import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionFactory } from './factories/connection.factory';
import { OAuthConnectionProvider } from './providers/oauth-connection.provider';
import { MemoryCredentialRepository } from './repositories/memory-credential.repository';
import { NoOpEncryptionService } from './services/noop-encryption.service';
import { EncryptionService } from './interfaces/encryption-service.interface';
import { CredentialRepository } from './interfaces/credential-repository.interface';

@Module({
  imports: [ConfigModule],
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
    ConnectionFactory
  ],
  exports: [ConnectionFactory]
})
export class ConnectionsModule implements OnModuleInit {
  constructor(
    private readonly factory: ConnectionFactory,
    private readonly oauthProvider: OAuthConnectionProvider
  ) {}

  onModuleInit() {
    this.factory.registerProvider(this.oauthProvider);
  }
}
