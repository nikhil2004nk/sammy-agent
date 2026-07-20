import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'sammy-mock-server',
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
        name: 'echo',
        description: 'Echoes the input message back.',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
      },
      {
        name: 'calculator',
        description: 'Performs basic math operations.',
        inputSchema: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
            operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
          },
          required: ['a', 'b', 'operation'],
        },
      },
      {
        name: 'current_time',
        description: 'Returns the current server time.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'delay',
        description: 'Delays response by specified milliseconds (for testing timeouts).',
        inputSchema: {
          type: 'object',
          properties: {
            ms: { type: 'number' },
          },
          required: ['ms'],
        },
      },
      {
        name: 'error',
        description: 'Always throws an error (for testing error handling).',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'large_response',
        description: 'Returns a large payload.',
        inputSchema: {
          type: 'object',
          properties: {
            size: { type: 'number' },
          },
          required: ['size'],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'echo') {
    return {
      content: [{ type: 'text', text: args.message }],
    };
  }

  if (name === 'calculator') {
    const a = args.a;
    const b = args.b;
    let result = 0;
    switch (args.operation) {
      case 'add': result = a + b; break;
      case 'subtract': result = a - b; break;
      case 'multiply': result = a * b; break;
      case 'divide': result = a / b; break;
    }
    return {
      content: [{ type: 'text', text: String(result) }],
    };
  }

  if (name === 'current_time') {
    return {
      content: [{ type: 'text', text: new Date().toISOString() }],
    };
  }

  if (name === 'delay') {
    const ms = args.ms;
    await new Promise(resolve => setTimeout(resolve, ms));
    return {
      content: [{ type: 'text', text: `Delayed for ${ms}ms` }],
    };
  }

  if (name === 'error') {
    throw new Error('This is a mocked deterministic error.');
  }

  if (name === 'large_response') {
    const size = args.size;
    const payload = Array(size).fill('A').join('');
    return {
      content: [{ type: 'text', text: payload }],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mock MCP Server running on stdio');
}

main().catch(console.error);
