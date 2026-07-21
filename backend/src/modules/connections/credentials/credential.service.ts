import { Injectable, Logger } from '@nestjs/common';
import { ConnectionContext, ConnectionCredential } from '../types/connection.types';
import { CredentialRepository } from '../interfaces/credential-repository.interface';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);

  constructor(private readonly repository: CredentialRepository) {}

  async storeCredential(context: ConnectionContext, credential: ConnectionCredential): Promise<void> {
    await this.repository.saveCredential(context, credential);
    this.logger.log(`Stored credential for workspace '${context.workspaceId}' and server '${context.serverId}' with scheme '${credential.scheme}'`);
  }

  async getCredential(context: ConnectionContext): Promise<ConnectionCredential | null> {
    return this.repository.getCredential(context);
  }

  async deleteCredential(context: ConnectionContext): Promise<void> {
    await this.repository.deleteCredential(context);
    this.logger.log(`Deleted credential for workspace '${context.workspaceId}' and server '${context.serverId}'`);
  }

  async isCredentialExpired(context: ConnectionContext): Promise<boolean> {
    const cred = await this.getCredential(context);
    if (!cred || !cred.expiresAt) {
      return false; // If no expiresAt, assume valid (or handle per-scheme logic)
    }
    return new Date() > cred.expiresAt;
  }
}
