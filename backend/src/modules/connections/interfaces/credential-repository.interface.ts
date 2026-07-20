import { ConnectionContext, ConnectionCredential } from '../types/connection.types';

export abstract class CredentialRepository {
  abstract saveCredential(context: ConnectionContext, credential: ConnectionCredential): Promise<void>;
  abstract getCredential(context: ConnectionContext): Promise<ConnectionCredential | null>;
  abstract deleteCredential(context: ConnectionContext): Promise<void>;
}
