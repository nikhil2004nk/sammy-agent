export interface ConnectionContext {
  workspaceId: string;
  serverId: string;
}

export interface ConnectionCredential {
  scheme: string; // e.g., 'oauth2', 'apikey', 'jwt', 'mtls', 'basic', 'none'
  values: Record<string, string>;
  expiresAt?: Date;
}

export interface TransportConfig {
  type: 'stdio' | 'sse' | 'http';
  command?: string; // For stdio
  args?: string[];  // For stdio
  url?: string;     // For sse/http
}

export interface AuthenticationContext {
  environment?: Record<string, string>;
  headers?: Record<string, string>;
  credentials?: ConnectionCredential;
}

export interface ResolvedConnection {
  serverId: string;
  transport: TransportConfig;
  authentication?: AuthenticationContext;
}
