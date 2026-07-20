import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { google, gmail_v1 } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

class GmailMcpServer {
  private server: Server;
  private gmail: gmail_v1.Gmail | null = null;
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  constructor() {
    this.server = new Server(
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

    this.setupAuthentication();
    this.setupRequestHandlers();
  }

  private setupAuthentication() {
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) {
      console.error('GOOGLE_REFRESH_TOKEN is not set. The server will start but tools will fail.');
      return;
    }

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  private setupRequestHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'gmail.list_messages',
            description: 'List messages in Gmail inbox.',
            inputSchema: {
              type: 'object',
              properties: {
                maxResults: { type: 'number', description: 'Maximum number of messages to return.' },
                q: { type: 'string', description: 'Query string for searching messages.' }
              },
            },
          },
          {
            name: 'gmail.search_messages',
            description: 'Search messages in Gmail (alias for list_messages with q).',
            inputSchema: {
              type: 'object',
              properties: {
                q: { type: 'string' },
                maxResults: { type: 'number' }
              },
              required: ['q'],
            },
          },
          {
            name: 'gmail.get_message',
            description: 'Get details of a specific message.',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'The message ID.' },
              },
              required: ['id'],
            },
          },
          {
            name: 'gmail.create_draft',
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.gmail) {
        throw new McpError(ErrorCode.InvalidRequest, 'Gmail client is not authenticated (missing GOOGLE_REFRESH_TOKEN).');
      }

      try {
        if (request.params.name === 'gmail.list_messages' || request.params.name === 'gmail.search_messages') {
          const args = request.params.arguments as any;
          const response = await this.gmail.users.messages.list({
            userId: 'me',
            maxResults: args?.maxResults || 10,
            q: args?.q,
          });

          return {
            content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
          };
        }

        if (request.params.name === 'gmail.get_message') {
          const args = request.params.arguments as any;
          if (!args?.id) throw new McpError(ErrorCode.InvalidParams, 'Message ID is required');
          
          const response = await this.gmail.users.messages.get({
            userId: 'me',
            id: args.id,
            format: 'full',
          });

          return {
            content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
          };
        }

        if (request.params.name === 'gmail.create_draft') {
          const args = request.params.arguments as any;
          if (!args?.to || !args?.subject || !args?.body) {
            throw new McpError(ErrorCode.InvalidParams, 'to, subject, and body are required');
          }

          // RFC 2822 format
          const emailLines = [
            `To: ${args.to}`,
            `Subject: ${args.subject}`,
            '',
            args.body,
          ];
          const email = emailLines.join('\n');
          const encodedEmail = Buffer.from(email).toString('base64url');

          const response = await this.gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
              message: {
                raw: encodedEmail,
              },
            },
          });

          return {
            content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
          };
        }

        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
      } catch (error: any) {
        // We throw an McpError so it propagates to the client correctly
        // We'll normalize HTTP 429, 5xx, or 403 (insufficient scopes) here
        let errorMessage = error.message || 'Unknown error occurred';
        if (error.response?.status === 403) {
          errorMessage = 'Insufficient scopes or unauthorized (HTTP 403).';
        } else if (error.response?.status === 429) {
          errorMessage = 'Rate limited by Google API (HTTP 429).';
        } else if (error.response?.status >= 500) {
          errorMessage = `Google API unavailable (HTTP ${error.response.status}).`;
        }

        throw new McpError(ErrorCode.InternalError, errorMessage);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gmail MCP Server running on stdio');
  }
}

const server = new GmailMcpServer();
server.run().catch(console.error);
