import { registerAs } from '@nestjs/config';

export interface McpServerConfig {
  enabled: boolean;
  transport: 'stdio' | 'sse' | 'http';
  timeout: number;
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
  healthInterval: number;
  startup: 'async' | 'sync';
  auth?: Record<string, string>;
  command?: string; // For stdio
  args?: string[];  // For stdio
  url?: string;     // For sse/http
}

export interface McpConfig {
  servers: Record<string, McpServerConfig>;
}

// Register config under 'mcp' namespace
export default registerAs('mcp', (): McpConfig => ({
  servers: {}
}));
