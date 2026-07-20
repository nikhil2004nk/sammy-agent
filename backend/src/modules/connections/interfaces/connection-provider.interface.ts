import { ConnectionContext, ResolvedConnection } from '../types/connection.types';

export abstract class ConnectionProvider {
  abstract getProviderId(): string;
  abstract resolveConnection(context: ConnectionContext): Promise<ResolvedConnection>;
}
