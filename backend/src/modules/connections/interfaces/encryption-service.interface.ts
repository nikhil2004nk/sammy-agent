export abstract class EncryptionService {
  abstract encrypt(data: string): Promise<string>;
  abstract decrypt(encryptedData: string): Promise<string>;
}
