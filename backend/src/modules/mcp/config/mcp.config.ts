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
  servers: {
    gmail: {
      enabled: true,
      transport: 'stdio',
      startup: 'async',
      command: 'node',
      args: ['../gmail-mcp-server/dist/index.js'],
      timeout: 30000,
      retry: {
        maxAttempts: 3,
        backoffMs: 2000,
      },
      healthInterval: 30000,
      auth: {
        connectionId: 'google' // this tells the MCP manager to look up the google connection before starting this server
      }
    },
    'mock-gmail': {
      enabled: true,
      transport: 'stdio',
      startup: 'async',
      command: 'node',
      args: ['test/mock-gmail-server/index.js'],
      timeout: 30000,
      retry: {
        maxAttempts: 3,
        backoffMs: 2000,
      },
      healthInterval: 30000,
    }
  }
}));
