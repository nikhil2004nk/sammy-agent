import { Injectable } from '@nestjs/common';
import { CredentialRepository } from '../interfaces/credential-repository.interface';
import { ConnectionContext, ConnectionCredential } from '../types/connection.types';
import { EncryptionService } from '../interfaces/encryption-service.interface';

@Injectable()
export class MemoryCredentialRepository implements CredentialRepository {
  // Key format: tenantId:userId:serverId
  private storage = new Map<string, string>();

  constructor(private readonly encryptionService: EncryptionService) {}

  private getKey(context: ConnectionContext): string {
    return `${context.tenantId}:${context.userId}:${context.serverId}`;
  }

  async saveCredential(context: ConnectionContext, credential: ConnectionCredential): Promise<void> {
    const rawData = JSON.stringify(credential);
    const encryptedData = await this.encryptionService.encrypt(rawData);
    this.storage.set(this.getKey(context), encryptedData);
  }

  async getCredential(context: ConnectionContext): Promise<ConnectionCredential | null> {
    const encryptedData = this.storage.get(this.getKey(context));
    if (!encryptedData) {
      return null;
    }
    
    try {
      const rawData = await this.encryptionService.decrypt(encryptedData);
      const credential = JSON.parse(rawData) as ConnectionCredential;
      // Rehydrate Date object
      if (credential.expiresAt) {
        credential.expiresAt = new Date(credential.expiresAt);
      }
      return credential;
    } catch (e) {
      return null;
    }
  }

  async deleteCredential(context: ConnectionContext): Promise<void> {
    this.storage.delete(this.getKey(context));
  }
}
