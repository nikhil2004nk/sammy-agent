import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../interfaces/encryption-service.interface';

@Injectable()
export class NoOpEncryptionService implements EncryptionService {
  async encrypt(data: string): Promise<string> {
    // In a real implementation, this would use KMS, Vault, AES-GCM, etc.
    return `encrypted_${data}`;
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (encryptedData.startsWith('encrypted_')) {
      return encryptedData.substring('encrypted_'.length);
    }
    return encryptedData;
  }
}
