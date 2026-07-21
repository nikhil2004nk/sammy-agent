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

@Module({
  imports: [ConfigModule],
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
    private readonly googleProvider: GoogleConnectionProvider
  ) {}

  onModuleInit() {
    this.factory.registerProvider(this.oauthProvider);
    this.factory.registerProvider(this.googleProvider);
  }
}
