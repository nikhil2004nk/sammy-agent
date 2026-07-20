import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'gmail-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_email',
        description: 'Send an email via Gmail.',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      {
        name: 'list_messages',
        description: 'List messages in Gmail inbox.',
        inputSchema: {
          type: 'object',
          properties: {
            maxResults: { type: 'number' },
          },
        },
      },
      {
        name: 'search',
        description: 'Search Gmail.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
          required: ['query'],
        },
      },
      {
        name: 'reply',
        description: 'Reply to an email.',
        inputSchema: {
          type: 'object',
          properties: {
            threadId: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['threadId', 'body'],
        },
      },
      {
        name: 'create_draft',
        description: 'Create an email draft.',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['to', 'subject', 'body'],
        },
      }
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Gmail MCP Server running on stdio');
}

main().catch(console.error);
